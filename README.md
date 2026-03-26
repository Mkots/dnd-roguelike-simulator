# DnD Roguelike Simulator

An idle auto-battler built on D&D 5e combat mechanics with roguelike meta-progression.

## How it works

The hero fights a sequence of enemies automatically. Combat is simulated instantly using D&D rules — initiative rolls, d20 attack rolls vs AC, dice damage formulas — and replayed round-by-round in the UI. When the hero dies, gold is collected and spent on permanent upgrades in the shop before the next run.

## Stack

Vite · React · TypeScript · Zustand · React Router · Shadcn · Tailwind

## Project structure

```
src/
├── engine/       # Pure TS game logic (combat, dice, creatures, shop)
├── store/        # Zustand stores (game state, run state)
├── pages/        # Route-level screens
└── components/   # UI components
```

## Getting started

```bash
npm install
npm run dev
```
