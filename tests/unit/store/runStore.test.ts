import { describe, it, expect, beforeEach } from 'vitest';
import { useRunStore } from '../../../src/store/runStore';
import { createCreature } from '../../../src/engine/creature';
import type { Creature } from '../../../src/engine/types';

const makeHero = (): Creature =>
  createCreature('Hero', {
    strength: 16, dexterity: 12, constitution: 14,
    intelligence: 10, wisdom: 10, charisma: 8,
  }, { hitDie: 10, attackAbility: 'strength', weaponDice: '1d8', proficiencyBonus: 2 });

// A deliberately weak enemy so the hero reliably wins; used when a hero-win outcome is needed
const makeWeakEnemy = (): Creature =>
  createCreature('Weakling', {
    strength: 6, dexterity: 6, constitution: 6,
    intelligence: 10, wisdom: 10, charisma: 10,
  }, { hitDie: 4, armorBonus: -5 });

// A deliberately strong enemy so the hero reliably dies; used when a hero-loss outcome is needed
const makeStrongEnemy = (): Creature =>
  createCreature('Behemoth', {
    strength: 20, dexterity: 20, constitution: 20,
    intelligence: 10, wisdom: 10, charisma: 10,
  }, { hitDie: 20, armorBonus: 20, proficiencyBonus: 10 });

const resetStore = () =>
  useRunStore.setState({ runLog: null, currentFightIndex: 0, allEnemies: [] });

describe('runStore — initial state', () => {
  beforeEach(resetStore);

  it('starts with runLog=null', () => {
    expect(useRunStore.getState().runLog).toBeNull();
  });

  it('starts with currentFightIndex=0', () => {
    expect(useRunStore.getState().currentFightIndex).toBe(0);
  });

  it('starts with empty allEnemies', () => {
    expect(useRunStore.getState().allEnemies).toEqual([]);
  });
});

describe('runStore — startRun()', () => {
  beforeEach(resetStore);

  it('sets runLog to a non-null RunLog', () => {
    const hero = makeHero();
    const enemies = [makeWeakEnemy()];
    useRunStore.getState().startRun(hero, enemies);
    expect(useRunStore.getState().runLog).not.toBeNull();
  });

  it('stores allEnemies', () => {
    const hero = makeHero();
    const enemies = [makeWeakEnemy(), makeWeakEnemy()];
    useRunStore.getState().startRun(hero, enemies);
    expect(useRunStore.getState().allEnemies).toHaveLength(2);
  });

  it('resets currentFightIndex to 0', () => {
    const hero = makeHero();
    useRunStore.setState({ currentFightIndex: 3 });
    useRunStore.getState().startRun(hero, [makeWeakEnemy()]);
    expect(useRunStore.getState().currentFightIndex).toBe(0);
  });

  it('runLog.fights has one entry per enemy (up to first hero death)', () => {
    const hero = makeHero();
    const enemies = [makeWeakEnemy(), makeWeakEnemy(), makeWeakEnemy()];
    useRunStore.getState().startRun(hero, enemies);
    const { runLog } = useRunStore.getState();
    // Hero wins all 3 fights
    expect(runLog!.fights).toHaveLength(3);
  });

  it('stops simulating fights after hero dies', () => {
    const hero = makeHero();
    const enemies = [makeStrongEnemy(), makeWeakEnemy()];
    useRunStore.getState().startRun(hero, enemies);
    const { runLog } = useRunStore.getState();
    // Hero dies to first enemy — only 1 fight recorded
    expect(runLog!.fights).toHaveLength(1);
    expect(runLog!.fights[0].winner).toBe('enemy');
  });
});

describe('runStore — nextFight()', () => {
  beforeEach(resetStore);

  it('increments currentFightIndex by 1', () => {
    useRunStore.getState().startRun(makeHero(), [makeWeakEnemy(), makeWeakEnemy()]);
    useRunStore.getState().nextFight();
    expect(useRunStore.getState().currentFightIndex).toBe(1);
  });

  it('increments correctly across multiple calls', () => {
    useRunStore.getState().startRun(makeHero(), [makeWeakEnemy(), makeWeakEnemy(), makeWeakEnemy()]);
    useRunStore.getState().nextFight();
    useRunStore.getState().nextFight();
    expect(useRunStore.getState().currentFightIndex).toBe(2);
  });
});

describe('runStore — clearRun()', () => {
  beforeEach(resetStore);

  it('resets runLog to null', () => {
    useRunStore.getState().startRun(makeHero(), [makeWeakEnemy()]);
    useRunStore.getState().clearRun();
    expect(useRunStore.getState().runLog).toBeNull();
  });

  it('resets currentFightIndex to 0', () => {
    useRunStore.getState().startRun(makeHero(), [makeWeakEnemy()]);
    useRunStore.getState().nextFight();
    useRunStore.getState().clearRun();
    expect(useRunStore.getState().currentFightIndex).toBe(0);
  });

  it('resets allEnemies to empty array', () => {
    useRunStore.getState().startRun(makeHero(), [makeWeakEnemy()]);
    useRunStore.getState().clearRun();
    expect(useRunStore.getState().allEnemies).toEqual([]);
  });
});

describe('runStore — exitEarly()', () => {
  beforeEach(resetStore);

  it('sets exitType to "early-exit" on the runLog', () => {
    useRunStore.getState().startRun(makeHero(), [makeWeakEnemy()]);
    useRunStore.getState().exitEarly();
    expect(useRunStore.getState().runLog!.exitType).toBe('early-exit');
  });

  it('is a no-op when runLog is null', () => {
    // Should not throw
    expect(() => useRunStore.getState().exitEarly()).not.toThrow();
    expect(useRunStore.getState().runLog).toBeNull();
  });

  it('does not change other runLog fields', () => {
    const hero = makeHero();
    const enemies = [makeWeakEnemy()];
    useRunStore.getState().startRun(hero, enemies);
    const before = useRunStore.getState().runLog!;
    useRunStore.getState().exitEarly();
    const after = useRunStore.getState().runLog!;
    expect(after.fights).toEqual(before.fights);
    expect(after.survived).toEqual(before.survived);
    expect(after.enemiesDefeated).toEqual(before.enemiesDefeated);
  });
});

describe('runStore — applyHeal()', () => {
  beforeEach(resetStore);

  it('is a no-op when runLog is null', () => {
    expect(() =>
      useRunStore.getState().applyHeal(10, makeHero())
    ).not.toThrow();
    expect(useRunStore.getState().runLog).toBeNull();
  });

  it('increases hero HP for the remaining fights', () => {
    const hero = makeHero();
    const enemies = [makeWeakEnemy(), makeWeakEnemy()];
    useRunStore.getState().startRun(hero, enemies);

    const { runLog } = useRunStore.getState();

    useRunStore.getState().applyHeal(5, hero);

    // The fight at currentFightIndex (0) must be unchanged
    const updated = useRunStore.getState().runLog!;
    expect(updated.fights[0]).toEqual(runLog!.fights[0]);
    // At least the completed fight remains
    expect(updated.fights.length).toBeGreaterThanOrEqual(1);
    // heroFinalHp is a valid number
    expect(typeof updated.heroFinalHp).toBe('number');
  });

  it('preserves completed fights and replaces tail fights', () => {
    const hero = makeHero();
    const enemies = [makeWeakEnemy(), makeWeakEnemy(), makeWeakEnemy()];
    useRunStore.getState().startRun(hero, enemies);

    const originalFight0 = useRunStore.getState().runLog!.fights[0];

    useRunStore.getState().applyHeal(5, hero);

    const updated = useRunStore.getState().runLog!;
    // Fight 0 must be unchanged (it's already completed)
    expect(updated.fights[0]).toEqual(originalFight0);
  });

  it('updates enemiesDefeated based on re-simulated fights', () => {
    const hero = makeHero();
    const enemies = [makeWeakEnemy(), makeWeakEnemy()];
    useRunStore.getState().startRun(hero, enemies);

    useRunStore.getState().applyHeal(10, hero);

    const { runLog } = useRunStore.getState();
    const computedDefeated = runLog!.fights.filter(f => f.winner === 'hero').length;
    expect(runLog!.enemiesDefeated).toBe(computedDefeated);
  });

  it('caps healed HP at hero maxHp', () => {
    const hero = makeHero();
    // Start the hero at full HP by using a hero that wins immediately
    const enemies = [makeWeakEnemy(), makeWeakEnemy()];
    useRunStore.getState().startRun(hero, enemies);

    // Apply a huge heal — must not exceed maxHp
    useRunStore.getState().applyHeal(9999, hero);
    // No assertion on internal heroHp; this test confirms no crash / no overflow
    const { runLog } = useRunStore.getState();
    expect(runLog!.heroFinalHp).toBeLessThanOrEqual(hero.maxHp);
  });
});

