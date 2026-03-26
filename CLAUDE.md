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
* Internal helper components (like `Stat` inside `PlayerStats`) should stay in the same file — these are implementation details, don’t extract them into separate files
* Props should be passed as a whole object: `<HeroPreview hero={hero} />`, not as a spread of individual fields

## Game overview
D&D 5e roguelike: the player runs through a fixed sequence of enemies, one fight at a time. All fights are simulated upfront at run start; the UI just animates through the pre-computed results.

## Engine (`src/engine/`)
* `types.ts` — all shared types: `Creature`, `CombatRound`, `FightLog`, `RunLog`, `PlayerState`, `ShopItem`
* `combat.ts` — `fight(hero, enemy) → FightLog`, `simulateRun(hero, enemies) → RunLog`
* `creature.ts` — `createCreature()` factory, `abilityModifier()`
* `dice.ts` — dice rolling utilities (`roll`, `parseDiceFormula`)
* `enemies.ts` — `ENEMIES: Creature[]` — 7 enemies with scaling difficulty
* `shop.ts` — `buildHero()`, `createInitialPlayerState()`, `collectRunRewards()`, `purchase()`
* `upgrades.ts` — `UPGRADES: UpgradeDefinition[]`, `WEAPON_PROGRESSION`
* `index.ts` — re-exports public API

## Stores (`src/store/`)
* `gameStore.ts` (`useGameStore`) — persisted to localStorage (`dnd-roguelike-save`). Holds `PlayerState` (gold, upgrades, totalRuns, bestRun). Actions: `getHero()`, `collectRewards()`, `buyUpgrade()`, `resetProgress()`
* `runStore.ts` (`useRunStore`) — in-memory, not persisted. Holds `runLog` and `currentFightIndex`. Actions: `startRun()`, `nextFight()`, `clearRun()`

## Routing
* `/` — `StartScreen` — hero preview, player stats, Start Run + Reset Progress
* `/game` — `GameScreen` — animated combat log, HP bars, Next Enemy / See Results
* `/results` — `ResultsScreen` — (stub, not yet implemented)

## Key conventions
* The entire run is simulated once in `startRun()` — never re-simulate mid-run
* `runStore` is not persisted; navigating away mid-run loses progress (intentional)
* Gold rewards are applied via `collectRewards()` called from `GameScreen` before navigating to `/results`
