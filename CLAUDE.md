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
