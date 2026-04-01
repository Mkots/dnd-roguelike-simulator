import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Creature } from '../../../src/engine/types';

vi.mock('../../../src/engine/dice', () => ({
  d20: vi.fn(),
  rollFormula: vi.fn(),
  rollDie: vi.fn(),
  buildFormula: vi.fn(),
}));

import { d20, rollFormula } from '../../../src/engine/dice';
import { useRunStore } from '../../../src/store/runStore';

const mockD20 = vi.mocked(d20);
const mockRollFormula = vi.mocked(rollFormula);

const makeCreature = (overrides: Partial<Creature> = {}): Creature => ({
  name: 'Unit',
  abilities: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  maxHp: 10,
  currentHp: 10,
  armorClass: 10,
  attackBonus: 5,
  damageFormula: '1d6',
  ...overrides,
});

const setupD20 = (...values: number[]) => values.forEach((v) => mockD20.mockReturnValueOnce(v));
const dmg = (total: number) => ({ diceRoll: total, modifier: 0, total });

const resetStore = () =>
  useRunStore.setState({ runState: null, runLog: null, currentFightIndex: 0, allEnemies: [] });

beforeEach(() => {
  vi.clearAllMocks();
  resetStore();
});

describe('runStore phase-based flow', () => {
  it('starts in pre-fight phase', () => {
    useRunStore.getState().startRun(makeCreature({ name: 'Hero' }), [makeCreature({ name: 'Enemy' })]);
    expect(useRunStore.getState().getPhase()).toBe('pre-fight');
  });

  it('transitions pre-fight -> fighting -> post-fight', () => {
    setupD20(15, 5, 20);
    mockRollFormula.mockReturnValueOnce(dmg(10));

    useRunStore.getState().startRun(makeCreature({ name: 'Hero' }), [makeCreature({ name: 'Enemy1' }), makeCreature({ name: 'Enemy2' })]);
    useRunStore.getState().startFight();
    expect(useRunStore.getState().getPhase()).toBe('fighting');

    useRunStore.getState().advanceUntilFightEnds();
    expect(useRunStore.getState().getPhase()).toBe('post-fight');
    expect(useRunStore.getState().runState?.enemiesDefeated).toBe(1);
  });

  it('prepareNextFight moves post-fight -> pre-fight', () => {
    setupD20(15, 5, 20);
    mockRollFormula.mockReturnValueOnce(dmg(10));

    useRunStore.getState().startRun(makeCreature({ name: 'Hero' }), [makeCreature({ name: 'Enemy1' }), makeCreature({ name: 'Enemy2' })]);
    useRunStore.getState().startFight();
    useRunStore.getState().advanceUntilFightEnds();
    useRunStore.getState().prepareNextFight();

    expect(useRunStore.getState().getPhase()).toBe('pre-fight');
  });

  it('blocks heal outside pre-fight', () => {
    setupD20(15, 5, 20);
    mockRollFormula.mockReturnValueOnce(dmg(10));

    const hero = makeCreature({ name: 'Hero', currentHp: 5, maxHp: 10 });
    useRunStore.getState().startRun(hero, [makeCreature({ name: 'Enemy' })]);
    useRunStore.getState().startFight();

    useRunStore.getState().applyHeal(3);
    expect(useRunStore.getState().runState?.hero.currentHp).toBe(5);
  });

  it('allows heal only in pre-fight and caps max hp', () => {
    const hero = makeCreature({ name: 'Hero', currentHp: 8, maxHp: 10 });
    useRunStore.getState().startRun(hero, [makeCreature({ name: 'Enemy' })]);
    useRunStore.getState().applyHeal(10);
    expect(useRunStore.getState().runState?.hero.currentHp).toBe(10);
  });

  it('safe exit only works from pre/post fight', () => {
    const hero = makeCreature({ name: 'Hero' });
    useRunStore.getState().startRun(hero, [makeCreature({ name: 'Enemy' })]);
    useRunStore.getState().startFight();
    useRunStore.getState().exitEarly();

    expect(useRunStore.getState().getPhase()).toBe('fighting');

    resetStore();
    useRunStore.getState().startRun(hero, [makeCreature({ name: 'Enemy' })]);
    useRunStore.getState().exitEarly();
    expect(useRunStore.getState().runLog?.exitType).toBe('early-exit');
  });

  it('no actions after completion', () => {
    setupD20(15, 5, 20);
    mockRollFormula.mockReturnValueOnce(dmg(10));

    useRunStore.getState().startRun(makeCreature({ name: 'Hero' }), [makeCreature({ name: 'Enemy' })]);
    useRunStore.getState().startFight();
    useRunStore.getState().advanceUntilFightEnds();

    expect(useRunStore.getState().getPhase()).toBe('completed');
    const before = useRunStore.getState().runLog;
    useRunStore.getState().startFight();
    useRunStore.getState().applyHeal(5);
    useRunStore.getState().prepareNextFight();
    expect(useRunStore.getState().runLog).toEqual(before);
  });
});

describe('runStore — startRun with equippedSkills', () => {
  it('initializes activeSkills from equippedSkills', () => {
    useRunStore.getState().startRun(
      makeCreature({ name: 'Hero' }),
      [makeCreature({ name: 'Enemy' })],
      ['quick-jab'],
    );
    const { runState } = useRunStore.getState();
    expect(runState?.activeSkills).toHaveLength(1);
    expect(runState?.activeSkills[0].skillId).toBe('quick-jab');
    expect(runState?.activeSkills[0].usesRemaining).toBeGreaterThan(0);
  });

  it('defaults usesRemaining to 1 for unknown skill ids', () => {
    useRunStore.getState().startRun(
      makeCreature({ name: 'Hero' }),
      [makeCreature({ name: 'Enemy' })],
      ['nonexistent-skill'],
    );
    const { runState } = useRunStore.getState();
    expect(runState?.activeSkills[0].usesRemaining).toBe(1);
  });
});

describe('runStore — clearRun', () => {
  it('resets all state to initial values', () => {
    setupD20(15, 5, 20);
    mockRollFormula.mockReturnValueOnce(dmg(10));
    useRunStore.getState().startRun(makeCreature({ name: 'Hero' }), [makeCreature({ name: 'Enemy' })]);
    useRunStore.getState().clearRun();
    const state = useRunStore.getState();
    expect(state.runState).toBeNull();
    expect(state.runLog).toBeNull();
    expect(state.currentFightIndex).toBe(0);
    expect(state.allEnemies).toHaveLength(0);
  });
});

describe('runStore — applySkill', () => {
  it('applies a heal-instant skill to the hero in pre-fight', () => {
    const hero = makeCreature({ name: 'Hero', currentHp: 5, maxHp: 10 });
    useRunStore.getState().startRun(
      hero,
      [makeCreature({ name: 'Enemy' })],
      ['second-wind'],
    );
    useRunStore.getState().applySkill('second-wind');
    expect(useRunStore.getState().runState?.hero.currentHp).toBe(10);
  });

  it('does nothing when runState is null', () => {
    // Should not throw
    expect(() => useRunStore.getState().applySkill('second-wind')).not.toThrow();
  });

  it('does nothing for an unknown skill id', () => {
    useRunStore.getState().startRun(makeCreature({ name: 'Hero' }), [makeCreature({ name: 'Enemy' })]);
    const before = useRunStore.getState().runState?.hero.currentHp;
    useRunStore.getState().applySkill('does-not-exist');
    expect(useRunStore.getState().runState?.hero.currentHp).toBe(before);
  });
});

describe('runStore — advanceRound', () => {
  it('does nothing when runState is null', () => {
    expect(() => useRunStore.getState().advanceRound()).not.toThrow();
  });
});
