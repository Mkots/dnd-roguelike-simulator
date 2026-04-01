# Roadmap

## Done
- [x] Combat engine — D&D 5e rules: initiative, d20 attack rolls, AC, dice damage formulas
- [x] Meta-progression engine — shop, permanent upgrades, gold rewards
- [x] 7 enemies with scaling difficulty
- [x] Start screen — hero stats preview, player stats (gold, runs, best run)
- [x] Game screen — animated combat log, HP bars
- [x] GitHub Pages deployment
- [x] Combat log — show full dice notation: `(1d20+4) 19+4=23 vs AC 11 → HIT (1d6+1) 4+1=5 dmg`
- [x] Bug fix — after a round where the hero has low HP, pressing "Next enemy" no longer crashes with `TypeError: Cannot read properties of undefined (reading 'heroHpAfter')`
- [x] Add Reset button to clear `localStorage`
- [x] Results screen — enemies defeated, gold earned, navigation to shop
- [x] Shop screen UI — accessible before a run (from Start) and after (from Results)
- [x] Bug fix — dead hero attacking after being killed by enemy when enemy acts first
- [x] Bug fix — "See Results" navigating to `/` instead of `/results`
- [x] Add random name generator for enemies
- [x] Add Hero and Enemies avatars
- [x] Random avatar selection — each enemy picks randomly from a pool of images per kind; avatar is stable for the duration of the run
- [x] Consumables — healing potions can be bought in the shop and used between fights
- [x] Run risk / reward system — safe early exit, continue option, death penalty on total gold
- [x] Gold Multiplier upgrade — bonus gold per kill with shop and results screen support
- [x] Automated tests — unit tests for engine logic and component tests for UI
- [x] Redesign according to [UI_DESIGN_GUIDELINES](UI_DESIGN_GUIDELINES.md) — dark D&D theme with gold accent, mobile-first `h-dvh` layout, sticky bottom action bars, safe area insets, compact HeroPreview, improved FighterCard gradient overlay, terminal-style CombatLog, Telegram ThemeParams integration
- [x] Update [component tests](tests/component) — PlayerStats label test updated to match new chip labels
- [x] Zustand store tests — unit tests for `gameStore` (initial state, getHero, collectRewards, buyUpgrade, buyHealCharge, spendHealCharge, resetProgress) and `runStore` (startRun, nextFight, clearRun, exitEarly, applyHeal)

## Engine refactor
- [x] Replace full upfront run simulation with step-based fight progression
  - Refactor the engine so the core simulation advances `1 round` at a time instead of precomputing the whole run in `startRun()`
  - Keep the current auto-play UX, but make the engine capable of pausing cleanly between fights for player decisions
  - Treat the pre-fight decision window as the main interaction point: before each enemy, the player may use heal, use one equipped skill, use both, or start the fight immediately
- [x] Introduce explicit run / fight state objects
  - Replace `RunLog` as the primary source of truth with stateful objects such as `RunState`, `FightState`, and `RoundResolution`
  - Store current hero snapshot, current enemy snapshot, active effects, remaining enemies, completed fight summaries, and current phase
  - Add explicit run phases such as `pre-fight`, `fighting`, `post-fight`, `completed`
- [x] Split combat engine into pure step functions
  - Extract pure functions like `createFightState()`, `resolveNextRound()`, `applyPreFightHeal()`, `applyPreFightSkill()`, and `finalizeFight()`
  - Keep RNG inside narrow boundaries so round resolution stays testable even if dice are rolled progressively
  - Make round resolution produce both the updated fight state and a log/event payload for the UI
- [x] Rework `runStore` around phase transitions instead of precomputed logs
  - Replace `startRun()` behavior so it initializes run state and the first `pre-fight` phase instead of simulating all fights immediately
  - Replace `nextFight()` with explicit actions such as `startFight()`, `advanceRound()`, `advanceUntilFightEnds()`, and `prepareNextFight()`
  - Keep `exitEarly()` available only from the post-fight / pre-next-fight phase
  - Update heal flow so it mutates the current hero state before combat rather than re-simulating a tail of fights
- [x] Redesign combat log generation for incremental simulation
  - Change logs from "final archive generated upfront" to "append as rounds resolve"
  - Keep enough structured data for the current animated `CombatLog`, but decouple it from the assumption that every future round already exists
  - Store completed fights in a compact history so Results screen still has stable end-of-run summaries
- [ ] Prepare the engine for status effects and pre-fight abilities
  - Add per-combatant effect containers and turn counters keyed to owner turns, not shared fight rounds
  - Define hooks for pre-fight effect application, round start, attack resolution, damage mitigation, and effect expiration
  - Ensure the model can represent "next attack only" effects and multi-turn buffs without another major refactor
- [x] Update UI orchestration without changing the high-level UX
  - Preserve the current feeling that combat plays automatically once started
  - Insert a new pre-fight action step before each enemy with buttons for equipped skills and heal charges
  - After combat ends, keep the existing between-fights cadence: review result, optionally `Safe exit`, otherwise continue
- [x] Test strategy for the refactor
  - Add engine tests for per-round state transitions, fight completion, and run completion without relying on upfront simulation
  - Add targeted tests for phase guards: heal only before fights, safe exit only after fights, no actions after run completion
  - Prefer deterministic test seams for RNG injection or mocked dice so step-by-step simulation stays stable under test
  - Add regression tests to prove the new phased engine still matches current combat outcomes for equivalent seeded scenarios

## Up next

## Completed - Skills Foundation (v1)
- [x] Abilities / Skills foundation
  - Define skill data model in the engine: `id`, `name`, `description`, `requiredClass`, `requiredLevel`, `target`, `durationRounds`, `effect`, `stackingRules`, `timing`
  - Split skills into clear gameplay buckets: self-buffs, enemy debuffs, instant recovery, next-hit modifiers
  - Add an initial skill roster for the first pass:
    - `Quick Jab` — deal `+5` damage on the next attack
    - `Sharpen Blade` — `+2` damage for `5` rounds
    - `Minor Shielding` — `+4 AC` for `5` rounds
    - `Brace` — reduce incoming damage by `3` for `4` rounds
    - `Second Wind (Lite)` — restore `5 HP`
    - `Focus Mind` — `+4 initiative` for `5` rounds
    - `Distract Enemy` — enemy gets `-3 attack` for `3` rounds
    - `Weaken Armor` — target gets `-3 AC` for `4` rounds
- [x] Class / level integration
  - Default unlocked skills for new players: Quick Jab, Second Wind (Lite)
  - Skills are stored in PlayerState and unlocked independently from class (v1 implementation)
- [x] Loadout system before combat
  - Add a pre-run skill loadout step on Start screen
  - Limit equipped skills to `2` active slots per run
  - Keep unlocked skills persistent in progression, while equipped skills are selected fresh before each run
- [x] Combat engine support
  - Extend combat state with `activeSkills` in `RunState` and `statusEffects` in `FightState`
  - Add explicit timing hooks for skill use: `applyPreFightSkill` for pre-fight skill application
  - Instant effects (heal) applied immediately, duration effects prepared as status effects
  - Skills track uses per fight via `ActiveSkill` type with `usesRemaining` counter
- [x] UX / screens
  - Add skills panel on Start screen showing unlocked skills with equip/unequip toggle (max 2)
  - Show equipped skills in Game screen pre-fight phase with usage counter
  - Skill buttons integrated into existing bottom action bar pattern
  - Skills shown with name, uses remaining, and disabled state when exhausted
- [x] Balance / rules decisions
  - All skills are once per fight (usesPerFight: 1)
  - Instant heal effects apply immediately to hero HP
  - Status effect stacking and duration tracking deferred to future iteration
- [x] Testing
  - Existing unit tests and component tests pass
  - New functionality validated through build, lint, and test suite

## Later
- [ ] Balance pass — enemies, gold economy, upgrade costs
- [ ] Classes / Hero generator — different classes with unique stats
- [ ] Levels — hero progression
- [ ] Abilities / Skills — unique actions related to classes and levels
- [ ] More enemy variety — ranged attackers, different damage types
- [ ] Floors / dungeon structure — themed waves with a boss at the end

---
