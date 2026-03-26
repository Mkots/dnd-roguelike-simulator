import { create } from 'zustand';
import type { Creature, RunLog } from '../engine/types';
import { simulateRun } from '../engine/combat';

export type RunStore = {
  runLog: RunLog | null;
  currentFightIndex: number;

  startRun: (hero: Creature, enemies: Creature[]) => void;
  nextFight: () => void;
  clearRun: () => void;
};

export const useRunStore = create<RunStore>((set) => ({
  runLog: null,
  currentFightIndex: 0,

  startRun: (hero, enemies) => {
    const runLog = simulateRun(hero, enemies);
    set({ runLog, currentFightIndex: 0 });
  },

  nextFight: () => set((s) => ({ currentFightIndex: s.currentFightIndex + 1 })),

  clearRun: () => set({ runLog: null, currentFightIndex: 0 }),
}));
