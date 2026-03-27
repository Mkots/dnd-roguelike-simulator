# Roadmap

## Done
- [x] Combat engine — D&D 5e rules: initiative, d20 attack rolls, AC, dice damage formulas
- [x] Meta-progression engine — shop, permanent upgrades, gold rewards
- [x] 7 enemies with scaling difficulty
- [x] Start screen — hero stats preview, player stats (gold, runs, best run)
- [x] Game screen — animated combat log, HP bars
- [x] GitHub Pages deployment
- [x] Combat log — show full dice notation: `(1d20+4) 19+4=23 vs AC 11 → HIT (1d6+1) 4+1=5 dmg`
- [x] Bug fix — find the cause of bug when after round hero has low HP, but after player press "Next enemy" game is crashes with error: "TypeError: Cannot read properties of undefined (reading 'heroHpAfter')"
- [x] Add Reset button which will reset localstorage
- [x] Results screen — enemies defeated, gold earned, navigation to shop
- [x] Shop screen UI — accessible before a run (from Start) and after (from Results)
- [x] Bug fix — dead hero attacking after being killed by enemy when enemy acts first
- [x] Bug fix — "See Results" navigating to `/` instead of `/results`

## Up next
- [x] Add random name generator for enemies
- [x] Add Hero and Enemies avatars
- [x] Random avatar selection — each enemy picks randomly from a pool of images per kind; avatar is stable for the duration of the run

## Later
- [ ] Balance pass — enemies, gold economy, upgrade costs
- [ ] Classes / Hero generator — different classes with uniq stats
- [ ] Levels — hero progresssion
- [ ] Abilities / Skills — uniqe actions which related to classes and levels
- [ ] More enemy variety — ranged attackers, different damage types
- [ ] Floors / dungeon structure — themed waves with a boss at the end

---

## Planned Features

### 1. Heal Button

**Overview:** A consumable heal charge the player can use once between fights on the Game screen. Charges are bought in the Shop for 10 gold each and persist across runs until spent.

**Design notes:**
- The entire run is pre-simulated in `startRun()`. Using a heal between fights means the remaining fights must be re-simulated with the updated hero HP, so the animation stays consistent with the simulation.
- Each charge heals a fixed amount (e.g. `HEAL_AMOUNT = 10` HP, capped at `hero.maxHp`).
- The Heal button only appears after a fight ends with the hero alive and when at least one more fight remains. It is hidden (or disabled) on the last fight and on the Results screen.

**Implementation steps:**

1. **`src/engine/types.ts`**
   - Add `healCharges: number` field to `PlayerState`.
   - Export a `HEAL_AMOUNT = 10` constant (fixed HP restored per use).

2. **`src/engine/shop.ts`**
   - Add `HEAL_CHARGE_COST = 10` constant.
   - Add `buyHealCharge(playerState: PlayerState): ShopResult` — checks gold, deducts `HEAL_CHARGE_COST`, increments `playerState.healCharges`.
   - Update `createInitialPlayerState()` to include `healCharges: 0`.
   - Note: heal charges are **consumable**, not a permanent `UpgradeDefinition`, so they bypass the `UPGRADES` array and live directly on `PlayerState`.

3. **`src/engine/combat.ts`**
   - No changes to `fight()` or `simulateRun()`. Re-simulation is triggered by the run store when a heal is applied.

4. **`src/store/runStore.ts`**
   - Add a `applyHeal(healAmount: number, hero: Creature, allEnemies: Creature[])` action:
     - Compute the healed HP: `newHp = Math.min(currentHp + healAmount, hero.maxHp)` where `currentHp` is `heroFinalHp` from the just-completed fight.
     - Re-simulate fights from `currentFightIndex + 1` to the end using the healed HP as the hero's `currentHp`.
     - Splice the re-simulated fights into `runLog.fights`, replacing the stale tail.
     - Keep `currentFightIndex` unchanged (the completed fight is not replayed).
   - Store `allEnemies` in run state on `startRun()` so `applyHeal` can reference the original enemy list for re-simulation.

5. **`src/store/gameStore.ts`**
   - Add `buyHealCharge(): boolean` action — delegates to `buyHealCharge()` from `shop.ts`, updates `playerState`.
   - Add `useHealCharge(): boolean` action — if `healCharges > 0`, decrements it and returns `true`; otherwise returns `false`.

6. **`src/pages/GameScreen.tsx`**
   - After the fight animation finishes (`animationDone === true`), if `fight.winner === 'hero'` and it is **not** the last fight, render a **Heal** button alongside the "Next Enemy →" button.
   - On click: call `useGameStore().useHealCharge()`. If it returns `true`, call `runStore.applyHeal(HEAL_AMOUNT, hero, storedEnemies)` to re-simulate remaining fights with the healed HP, then show updated HP.
   - Display current charge count on the button label (e.g. `Heal (+10 HP) [2]`). Disable the button when `healCharges === 0`.

7. **`src/pages/ShopScreen.tsx`**
   - Add a **Consumables** section below the upgrades list.
   - Render a `HealChargeCard` component showing name ("Healing Potion"), description ("+10 HP, usable once between fights"), cost (`10g`), and current charge count from `playerState.healCharges`.
   - The Buy button calls `buyHealCharge()` from the store; it is disabled when the player cannot afford it. There is no max level — the player can stock as many charges as they can afford.

---

### 2. Reward / Risk System

**Overview:** After winning a fight (when more fights remain), the player is offered a choice: **Leave Run** to bank 100 % of gold earned so far and exit safely, or **Continue** to the next fight. If the player continues and the hero dies in any subsequent fight, 20 % of their **total** gold (pre-run gold + gold earned this run) is lost.

**Design notes:**
- The penalty applies to total gold (not just run earnings) to make the risk meaningful at all stages of meta-progression.
- "Leave Run" counts as a completed run for `totalRuns` and `bestRun` tracking.
- The existing `collectRewards()` path (called before navigating to `/results`) is extended to accept an exit type rather than adding a separate code path.

**Implementation steps:**

1. **`src/engine/types.ts`**
   - Add `exitType: 'survived' | 'died' | 'early-exit'` to `RunLog` (set by the store when the run ends, not by the simulation).

2. **`src/engine/shop.ts`**
   - Add `DEATH_PENALTY_PERCENT = 0.20` constant.
   - Extend `collectRunRewards(playerState, enemiesDefeated, exitType: 'survived' | 'died' | 'early-exit'): PlayerState`:
     - Compute base gold earned: `goldEarned = enemiesDefeated * GOLD_PER_KILL` (apply gold-multiplier if that upgrade exists).
     - If `exitType === 'died'`: the penalty is `Math.floor((playerState.gold + goldEarned) * DEATH_PENALTY_PERCENT)`, subtracted from the player's **total** gold after adding `goldEarned`.
     - Always increment `totalRuns` and update `bestRun`.

3. **`src/store/runStore.ts`**
   - Add `exitType: 'survived' | 'died' | 'early-exit' | null` to store state (null = run in progress).
   - Add `exitEarly()` action — sets `exitType = 'early-exit'` on the current `runLog` without advancing `currentFightIndex`.

4. **`src/store/gameStore.ts`**
   - Update `collectRewards(enemiesDefeated: number, exitType: 'survived' | 'died' | 'early-exit')` signature to pass `exitType` through to `collectRunRewards()`.

5. **`src/pages/GameScreen.tsx`**
   - When `animationDone === true` and `fight.winner === 'hero'` and not the last fight, render **two** action buttons:
     - **"Leave Run (safe)"** — calls `exitEarly()` on the run store, then `collectRewards(enemiesDefeated, 'early-exit')` on the game store, then navigates to `/results` with `{ enemiesDefeated, exitType: 'early-exit' }`.
     - **"Next Enemy → ⚠ Risk: death = −20 % gold"** — existing continue behaviour; no changes to `nextFight()`.
   - When the hero dies (existing "See Results" path), pass `exitType: 'died'` instead of `'survived'`.
   - When the hero survives all fights, pass `exitType: 'survived'`.

6. **`src/pages/ResultsScreen.tsx`**
   - Extend `ResultsState` with `exitType: 'survived' | 'died' | 'early-exit'`.
   - Display context-appropriate heading:
     - `'survived'` → "Victory!"
     - `'early-exit'` → "Safe Exit"
     - `'died'` → "Defeated"
   - Add a **Gold Penalty** row (shown only when `exitType === 'died'`) displaying the amount lost (e.g. `−8 gold`).
   - Update the "Gold Earned" row to reflect the net change after any penalty.

---

### 3. Gold Multiplier Shop Item

**Overview:** A permanent upgrade purchasable in the Shop that increases gold earned per enemy kill. Five levels: ×1.1, ×1.2, ×1.3, ×1.4, ×1.5. Level 1 costs 10 gold; each subsequent level costs 10 gold more (i.e. `costPerLevel = 10`).

**Implementation steps:**

1. **`src/engine/upgrades.ts`**
   - Append a new entry to `UPGRADES`:
     ```ts
     {
       id: 'gold-multiplier',
       name: 'Gold Multiplier',
       description: 'Earn more gold per kill: ×1.1 → ×1.2 → ×1.3 → ×1.4 → ×1.5',
       costPerLevel: 10,
       maxLevel: 5,
     }
     ```
   - No changes to `WEAPON_PROGRESSION`.

2. **`src/engine/shop.ts`**
   - Add a pure helper (using a named constant `GOLD_MULTIPLIER_INCREMENT = 0.1`):
     ```ts
     const GOLD_MULTIPLIER_INCREMENT = 0.1;
     export const getGoldMultiplier = (purchasedUpgrades: Record<string, number>): number =>
       1 + (purchasedUpgrades['gold-multiplier'] ?? 0) * GOLD_MULTIPLIER_INCREMENT;
     ```
   - Modify `collectRunRewards()` to apply the multiplier:
     ```ts
     const multiplier = getGoldMultiplier(playerState.purchasedUpgrades);
     gold: playerState.gold + Math.round(enemiesDefeated * GOLD_PER_KILL * multiplier)
     ```
   - `Math.round` ensures the result is always a whole number.

3. **`src/engine/types.ts`** — no changes required.

4. **`src/pages/ResultsScreen.tsx`**
   - Retrieve `playerState.purchasedUpgrades['gold-multiplier']` (or use `getGoldMultiplier`) to determine the active multiplier.
   - If the multiplier is greater than ×1.0, add an informational row such as: `Gold Multiplier  ×1.2`.
   - This gives the player visible feedback that the upgrade is working.

5. **`src/pages/ShopScreen.tsx`** — no extra changes; the new upgrade entry in `UPGRADES` is automatically picked up by `getShopItems()` and rendered by the existing `UpgradeCard` component.
