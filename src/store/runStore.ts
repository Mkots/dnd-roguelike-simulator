import { create } from 'zustand';
import type { Creature, RunLog } from '../engine/types';
import { simulateRun, fight } from '../engine/combat';

export type RunStore = {
  runLog: RunLog | null;
  currentFightIndex: number;
  allEnemies: Creature[];

  startRun: (hero: Creature, enemies: Creature[]) => void;
  nextFight: () => void;
  clearRun: () => void;
  applyHeal: (healAmount: number, hero: Creature) => void;
  exitEarly: () => void;
};

export const useRunStore = create<RunStore>((set, get) => ({
  runLog: null,
  currentFightIndex: 0,
  allEnemies: [],

  startRun: (hero, enemies) => {
    const runLog = simulateRun(hero, enemies);
    set({ runLog, currentFightIndex: 0, allEnemies: enemies });
  },

  nextFight: () => set((s) => ({ currentFightIndex: s.currentFightIndex + 1 })),

  clearRun: () => set({ runLog: null, currentFightIndex: 0, allEnemies: [] }),

  applyHeal: (healAmount, hero) => {
    const { runLog, currentFightIndex, allEnemies } = get();
    if (!runLog) return;

    const completedFight = runLog.fights[currentFightIndex];
    if (!completedFight) return;

    const currentHp = completedFight.heroFinalHp;
    const newHp = Math.min(currentHp + healAmount, hero.maxHp);

    // Re-simulate remaining fights with healed HP, stopping on hero death
    const healedHero = { ...hero, currentHp: newHp };
    const remainingEnemies = allEnemies.slice(currentFightIndex + 1);

    let updatedHero = healedHero;
    const newTailFights: typeof runLog.fights = [];
    for (const enemy of remainingEnemies) {
      const result = fight(updatedHero, enemy);
      newTailFights.push(result);
      if (result.winner === 'enemy') break;
      updatedHero = { ...updatedHero, currentHp: result.heroFinalHp };
    }

    const newFights = [
      ...runLog.fights.slice(0, currentFightIndex + 1),
      ...newTailFights,
    ];

    const lastFight = newFights.at(-1)!;
    const survived = lastFight.winner === 'hero';

    set({
      runLog: {
        ...runLog,
        fights: newFights,
        survived,
        enemiesDefeated: newFights.filter((f) => f.winner === 'hero').length,
        heroFinalHp: lastFight.heroFinalHp,
      },
    });
  },

  exitEarly: () => {
    const { runLog } = get();
    if (!runLog) return;
    set({
      runLog: {
        ...runLog,
        exitType: 'early-exit',
      },
    });
  },
}));
