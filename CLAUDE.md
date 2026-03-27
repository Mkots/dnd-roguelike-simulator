# Project Rules
## Stack
Vite + React + TypeScript + Zustand + React Router + Shadcn + Tailwind
## Architecture
* `src/engine/` — pure TS, no React. Everything related to game logic
* `src/store/` — Zustand stores
* `src/pages/` — pages, only composition of components and data from the store
* `src/components/` — UI components
* `src/components/ui/` — base Shadcn components
## Components
* Components are decomposed for **maintainability and readability**, not for reuse
* Internal helper components (like `Stat` inside `PlayerStats`) should stay in the same file — these are implementation details, don't extract them into separate files
* Props should be passed as a whole object: `<HeroPreview hero={hero} />`, not as a spread of individual fields

## Game overview
D&D 5e roguelike: the player runs through a fixed sequence of enemies, one fight at a time. All fights are simulated upfront at run start; the UI just animates through the pre-computed results.

## Engine (`src/engine/`)
* `types.ts` — all shared types: `Creature`, `CombatRound`, `FightLog`, `RunLog`, `PlayerState`, `ShopItem`
* `combat.ts` — `fight(hero, enemy) → FightLog`, `simulateRun(hero, enemies) → RunLog`
* `creature.ts` — `createCreature()` factory, `abilityModifier()`
* `dice.ts` — dice rolling utilities (`roll`, `parseDiceFormula`)
* `enemies.ts` — `createEnemies(): Creature[]` — creates 7 fresh enemies per call with randomized names; `ENEMY_COUNT = 7`
* `names.ts` — `generateEnemyName(type: string): string` — generates an absurd random name (e.g. "Grukk the Moist Turnip of Regret"), called inside `createEnemies()`
* `shop.ts` — `buildHero()`, `createInitialPlayerState()`, `collectRunRewards()`, `purchase()`, `getShopItems()`
* `upgrades.ts` — `UPGRADES: UpgradeDefinition[]`, `WEAPON_PROGRESSION`
* `index.ts` — re-exports public API

## Stores (`src/store/`)
* `gameStore.ts` (`useGameStore`) — persisted to localStorage (`dnd-roguelike-save`). Holds `PlayerState` (gold, upgrades, totalRuns, bestRun). Actions: `getHero()`, `collectRewards()`, `buyUpgrade()`, `resetProgress()`
* `runStore.ts` (`useRunStore`) — in-memory, not persisted. Holds `runLog` and `currentFightIndex`. Actions: `startRun()`, `nextFight()`, `clearRun()`

## Routing
* `/` — `StartScreen` — hero preview, player stats, Start Run + Shop + Reset Progress
* `/game` — `GameScreen` — animated combat log, HP bars, Next Enemy / See Results
* `/results` — `ResultsScreen` — enemies defeated, gold earned, navigation to Shop or Play Again
* `/shop` — `ShopScreen` — upgrade list with costs and buy buttons, accessible from Start and Results

## Components (`src/components/`)
* `avatars.ts` — uses `import.meta.glob` to build `AVATAR_POOLS: Record<string, string[]>` from `src/assets/<kind>/` subfolders. `getAvatar(kind, seed?)` picks a stable image using `Creature.avatarSeed`
* `FighterCard` — shows creature avatar as card background image, HP bar and name in a frosted overlay at the bottom
* `HeroPreview` — shows hero avatar as a banner, combat stats (HP/AC/Attack/Damage) and full ability scores grid

## Key conventions
* The entire run is simulated once in `startRun()` — never re-simulate mid-run
* `runStore` is not persisted; navigating away mid-run loses progress (intentional)
* Gold rewards are applied via `collectRewards()` called from `GameScreen` before navigating to `/results`
* Do NOT call `clearRun()` before navigating away — it sets `runLog` to null which triggers the guard `useEffect` to redirect to `/`, overriding the intended navigation. `startRun()` overwrites `runLog` on the next run anyway
* `CombatRound.heroAction` and `enemyAction` are both nullable — null means that combatant died before getting to act that round
* `Creature.kind` identifies the enemy type (e.g. `'goblin'`, `'dark-knight'`) — used for avatar lookup; `Creature.name` holds the randomized display name; `Creature.avatarSeed` is a stable `Math.random()` float set at creature creation, used to pick a consistent image from the avatar pool
* `createEnemies()` must be called fresh for each run (not cached) — it generates new random names every call
