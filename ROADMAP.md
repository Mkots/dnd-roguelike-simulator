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

## Later
- [ ] Balance pass — enemies, gold economy, upgrade costs
- [ ] Classes / Hero generator — different classes with uniq stats
- [ ] Levels — hero progresssion
- [ ] Abilities / Skills — uniqe actions which related to classes and levels
- [ ] More enemy variety — ranged attackers, different damage types
- [ ] Floors / dungeon structure — themed waves with a boss at the end
