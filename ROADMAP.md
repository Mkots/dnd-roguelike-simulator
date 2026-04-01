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

## Up next

## Later
- [ ] Balance pass — enemies, gold economy, upgrade costs
- [ ] Classes / Hero generator — different classes with unique stats
- [ ] Levels — hero progression
- [ ] Abilities / Skills — unique actions related to classes and levels
- [ ] More enemy variety — ranged attackers, different damage types
- [ ] Floors / dungeon structure — themed waves with a boss at the end

---
