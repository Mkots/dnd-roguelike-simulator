# DnD Roguelike Simulator

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Mkots_dnd-roguelike-simulator&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Mkots_dnd-roguelike-simulator)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Mkots_dnd-roguelike-simulator&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Mkots_dnd-roguelike-simulator)
[![Deploy to GitHub Pages](https://github.com/Mkots/dnd-roguelike-simulator/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/Mkots/dnd-roguelike-simulator/actions/workflows/deploy.yml)

An idle auto-battler built on D&D 5e combat mechanics with roguelike meta-progression. Runs as a Telegram Mini App or standalone web app.

## How it works

The hero fights a gauntlet of 7 enemies in sequence. Combat is **simulated upfront** using D&D 5e rules — initiative rolls, d20 attack rolls vs AC, damage dice formulas — then replayed round-by-round in the UI. Between fights you can heal, exit early for a safe reward, or push on for more gold at the risk of a death penalty.

Gold from each run is spent on permanent upgrades in the shop. Progress persists across sessions via `localStorage`.

## Features

- **D&D 5e combat** — initiative, d20 vs AC, full dice notation in the combat log (e.g. `(1d20+4) 19+4=23 vs AC 11 → HIT (1d6+1) 4+1=5 dmg`)
- **7 enemy types** — Goblin, Wolf, Skeleton, Orc, Troll, Ogre, Dark Knight — with randomised absurd names each run
- **Risk / reward** — safe early exit or push on; death penalty cuts total gold by 20%
- **Shop** — permanent upgrades (HP, attack, damage, AC, gold multiplier) and consumable healing potions
- **Telegram Mini App** — picks up `ThemeParams` and adapts the colour scheme to the user's Telegram theme
- **Mobile-first** — `h-dvh` layout with sticky action bar and safe area insets

## Stack

Vite · React · TypeScript · Zustand · React Router · Shadcn · Tailwind

## Project structure

```
src/
├── engine/       # Pure TS game logic — combat, dice, creatures, shop, upgrades
├── store/        # Zustand stores — gameStore (persisted), runStore (in-memory)
├── pages/        # Route-level screens — Start, Game, Results, Shop
└── components/   # UI components — FighterCard, CombatLog, HeroPreview, PlayerStats
```

## Getting started

```bash
pnpm install
pnpm run dev
```

## Scripts

| Command | Description |
|---|---|
| `pnpm run dev` | Start dev server |
| `pnpm run build` | Type-check and build for production |
| `pnpm run lint` | Run ESLint |
| `pnpm run lint:fix` | Run ESLint with auto-fix |
| `pnpm run test` | Run unit tests (Vitest) |
| `pnpm run test:coverage` | Unit tests with V8 coverage report |
| `pnpm run test:ct` | Component tests (Playwright CT) |
| `pnpm run test:ct:coverage` | Component tests with coverage |

## Testing

Unit tests cover the full engine (`combat`, `dice`, `shop`, `creatures`, `enemies`, `names`) and Zustand stores (`gameStore`, `runStore`) at ~100%. Component tests cover UI components (`CombatLog`, `FighterCard`, `HeroPreview`, `PlayerStats`, `GameTitle`).

```bash
pnpm run test          # 166 unit tests
pnpm run test:ct       # 21 component tests
```
