import { create } from 'zustand';
import type { Creature, RunLog, RunPhase, RunState } from '../engine/types';
import {
  createRunState,
  startFight as engineStartFight,
  advanceFightRound,
  prepareNextFight as enginePrepareNextFight,
  applyPreFightHeal,
  exitRunEarly,
  toRunLog,
} from '../engine/combat';

export type RunStore = {
  runState: RunState | null;
  runLog: RunLog | null;
  currentFightIndex: number;
  allEnemies: Creature[];

  startRun: (hero: Creature, enemies: Creature[]) => void;
  startFight: () => void;
  advanceRound: () => void;
  advanceUntilFightEnds: () => void;
  prepareNextFight: () => void;
  clearRun: () => void;
  applyHeal: (healAmount: number) => void;
  exitEarly: () => void;
  getPhase: () => RunPhase | null;
};

export const useRunStore = create<RunStore>((set, get) => ({
  runState: null,
  runLog: null,
  currentFightIndex: 0,
  allEnemies: [],

  startRun: (hero, enemies) => {
    const runState = createRunState(hero, enemies);
    set({
      runState,
      runLog: toRunLog(runState),
      currentFightIndex: 0,
      allEnemies: enemies,
    });
  },

  startFight: () => {
    const { runState } = get();
    if (!runState) return;
    const next = engineStartFight(runState);
    set({ runState: next, runLog: toRunLog(next), currentFightIndex: next.completedFights.length });
  },

  advanceRound: () => {
    const { runState } = get();
    if (!runState) return;
    const next = advanceFightRound(runState);
    set({ runState: next, runLog: toRunLog(next), currentFightIndex: next.completedFights.length });
  },

  advanceUntilFightEnds: () => {
    const { runState } = get();
    if (!runState) return;

    let next = runState;
    while (next.phase === 'fighting') {
      next = advanceFightRound(next);
    }

    set({ runState: next, runLog: toRunLog(next), currentFightIndex: next.completedFights.length });
  },

  prepareNextFight: () => {
    const { runState } = get();
    if (!runState) return;
    const next = enginePrepareNextFight(runState);
    set({ runState: next, runLog: toRunLog(next), currentFightIndex: next.completedFights.length });
  },

  clearRun: () => set({ runState: null, runLog: null, currentFightIndex: 0, allEnemies: [] }),

  applyHeal: (healAmount) => {
    const { runState } = get();
    if (!runState) return;
    const next = applyPreFightHeal(runState, healAmount);
    set({ runState: next, runLog: toRunLog(next) });
  },

  exitEarly: () => {
    const { runState } = get();
    if (!runState) return;
    const next = exitRunEarly(runState);
    set({ runState: next, runLog: toRunLog(next), currentFightIndex: next.completedFights.length });
  },

  getPhase: () => get().runState?.phase ?? null,
}));
