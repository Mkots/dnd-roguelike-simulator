import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Creature } from '../../../src/engine/types';

vi.mock('../../../src/engine/dice', () => ({
  d20: vi.fn(),
  rollFormula: vi.fn(),
  rollDie: vi.fn(),
  buildFormula: vi.fn(),
}));

import {
  fight,
  simulateRun,
  createFightState,
  resolveNextRound,
  finalizeFight,
  createRunState,
  applyPreFightHeal,
  applyPreFightSkill,
  startFight,
  advanceFightRound,
  prepareNextFight,
  exitRunEarly,
  toRunLog,
} from '../../../src/engine/combat';
import type { SkillDefinition } from '../../../src/engine/types';
import { d20, rollFormula } from '../../../src/engine/dice';

const mockD20 = vi.mocked(d20);
const mockRollFormula = vi.mocked(rollFormula);

const makeCreature = (overrides: Partial<Creature> = {}): Creature => ({
  name: 'Test',
  abilities: {
    strength: 10, dexterity: 10, constitution: 10,
    intelligence: 10, wisdom: 10, charisma: 10,
  },
  maxHp: 10,
  currentHp: 10,
  armorClass: 10,
  attackBonus: 5,
  damageFormula: '1d6',
  ...overrides,
});

// Shorthand to return sequential d20 values
const setupD20 = (...values: number[]) => {
  values.forEach(v => mockD20.mockReturnValueOnce(v));
};

// Returns a RollResult-shaped object
const dmg = (total: number, diceRoll = total, modifier = 0) =>
  ({ diceRoll, modifier, total });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fight', () => {
  describe('initiative', () => {
    it('hero acts first when hero initiative >= enemy initiative', () => {
      // Arrange
      // hero init: 15+dexMod(10)=15+0=15, enemy init: 10+0=10 → heroFirst
      setupD20(15, 10, 20); // 3rd call: hero attack roll (guaranteed hit)
      mockRollFormula.mockReturnValueOnce(dmg(10)); // kills enemy instantly
      const hero = makeCreature({ currentHp: 10 });
      const enemy = makeCreature({ currentHp: 10 });

      // Act
      const log = fight(hero, enemy);

      // Assert
      expect(log.rounds[0].firstAttacker).toBe('hero');
    });

    it('enemy acts first when enemy initiative > hero initiative', () => {
      // Arrange
      // hero init: 5, enemy init: 15 → enemy first
      setupD20(5, 15, 20); // 3rd call: enemy attack roll (guaranteed hit)
      mockRollFormula.mockReturnValueOnce(dmg(10));
      const hero = makeCreature({ currentHp: 10 });
      const enemy = makeCreature({ currentHp: 10 });

      // Act
      const log = fight(hero, enemy);

      // Assert
      expect(log.rounds[0].firstAttacker).toBe('enemy');
    });
  });

  describe('attack resolution', () => {
    it('records a hit when attack total >= target AC', () => {
      // Arrange
      // hero init=15 > enemy init=5 → heroFirst
      // hero attack: roll=8, bonus=5 → total=13 >= enemy AC(10) → HIT
      setupD20(15, 5, 8);
      mockRollFormula.mockReturnValueOnce(dmg(10)); // kills enemy
      const hero = makeCreature({ attackBonus: 5 });
      const enemy = makeCreature({ armorClass: 10 });

      // Act
      const log = fight(hero, enemy);

      // Assert
      expect(log.rounds[0].heroAction?.type).toBe('hit');
    });

    it('records a miss when attack total < target AC', () => {
      // Arrange
      // hero init=15 > enemy init=5 → heroFirst
      // Round 1: hero attack: roll=1, bonus=0 → total=1 < 15 (enemy AC) → MISS
      //          enemy attack: roll=1, bonus=0 → total=1 < 15 (hero AC) → MISS
      // Round 2: hero attack: roll=20 → total=20 >= 15 → HIT
      setupD20(15, 5, 1, 1, 20);
      mockRollFormula.mockReturnValueOnce(dmg(10));
      const hero = makeCreature({ armorClass: 15, attackBonus: 0, currentHp: 10 });
      const enemy = makeCreature({ armorClass: 15, attackBonus: 0, currentHp: 10 });

      // Act
      const log = fight(hero, enemy);

      // Assert
      expect(log.rounds[0].heroAction?.type).toBe('miss');
      expect(log.rounds[0].enemyAction?.type).toBe('miss');
    });

    it('records correct hit details', () => {
      // Arrange
      // hero init=15 > enemy init=5 → heroFirst
      // hero attack: roll=8, attackBonus=5, total=13, enemy AC=10 → HIT
      // enemy starts with 6 HP so it dies in one hit → no further rounds
      setupD20(15, 5, 8);
      mockRollFormula.mockReturnValueOnce(dmg(6, 6, 0));
      const hero = makeCreature({ attackBonus: 5, damageFormula: '1d6' });
      const enemy = makeCreature({ armorClass: 10, currentHp: 6 });

      // Act
      const log = fight(hero, enemy);
      const action = log.rounds[0].heroAction;

      // Assert
      expect(action?.type).toBe('hit');
      if (action?.type === 'hit') {
        expect(action.roll).toBe(8);
        expect(action.modifier).toBe(5);
        expect(action.total).toBe(13);
        expect(action.targetAC).toBe(10);
        expect(action.damage).toBe(6);
      }
    });
  });

  describe('winner determination', () => {
    it('hero wins when hero kills enemy', () => {
      // Arrange
      // hero init=15 > enemy init=5 → heroFirst
      // hero roll=20 → HIT → damage=10 → enemy HP 10→0
      setupD20(15, 5, 20);
      mockRollFormula.mockReturnValueOnce(dmg(10));
      const hero = makeCreature({ currentHp: 10 });
      const enemy = makeCreature({ currentHp: 10 });

      // Act
      const log = fight(hero, enemy);

      // Assert
      expect(log.winner).toBe('hero');
      expect(log.heroFinalHp).toBe(10);
      expect(log.enemyFinalHp).toBeLessThanOrEqual(0);
    });

    it('enemy wins when enemy kills hero', () => {
      // Arrange
      // hero init=5, enemy init=15 → enemyFirst
      // enemy roll=20, bonus=5 → total=25 >= hero AC(10) → HIT → damage=10 → hero HP 10→0
      setupD20(5, 15, 20);
      mockRollFormula.mockReturnValueOnce(dmg(10));
      const hero = makeCreature({ currentHp: 10, armorClass: 10 });
      const enemy = makeCreature({ currentHp: 10, attackBonus: 5 });

      // Act
      const log = fight(hero, enemy);

      // Assert
      expect(log.winner).toBe('enemy');
      expect(log.heroFinalHp).toBeLessThanOrEqual(0);
    });
  });

  describe('null actions', () => {
    it('enemyAction is null when enemy dies on hero first strike', () => {
      // Arrange — heroFirst, hero kills enemy instantly → enemy never acts
      setupD20(15, 5, 20);
      mockRollFormula.mockReturnValueOnce(dmg(10));
      const hero = makeCreature({ currentHp: 10 });
      const enemy = makeCreature({ currentHp: 10 });

      // Act
      const log = fight(hero, enemy);

      // Assert
      expect(log.rounds[0].enemyAction).toBeNull();
    });

    it('heroAction is null when hero dies on enemy first strike', () => {
      // Arrange — enemyFirst, enemy kills hero instantly → hero never acts
      setupD20(5, 15, 20);
      mockRollFormula.mockReturnValueOnce(dmg(10));
      const hero = makeCreature({ currentHp: 10, armorClass: 10 });
      const enemy = makeCreature({ currentHp: 10, attackBonus: 5 });

      // Act
      const log = fight(hero, enemy);

      // Assert
      expect(log.rounds[0].heroAction).toBeNull();
    });
  });

  describe('fight log structure', () => {
    it('returns correct round count', () => {
      // Arrange — 2 miss rounds + 1 hit round
      // hero init=15, enemy init=5 → heroFirst
      // Round 1: hero misses (1), enemy misses (1)
      // Round 2: hero misses (1), enemy misses (1)
      // Round 3: hero hits (20), kills enemy
      setupD20(15, 5, 1, 1, 1, 1, 20);
      mockRollFormula.mockReturnValueOnce(dmg(10));
      const hero = makeCreature({ armorClass: 15, attackBonus: 0, currentHp: 10 });
      const enemy = makeCreature({ armorClass: 15, attackBonus: 0, currentHp: 10 });

      // Act
      const log = fight(hero, enemy);

      // Assert
      expect(log.totalRounds).toBe(3);
      expect(log.rounds).toHaveLength(3);
    });

    it('stores the original hero and enemy on the log', () => {
      // Arrange
      setupD20(15, 5, 20);
      mockRollFormula.mockReturnValueOnce(dmg(10));
      const hero = makeCreature({ name: 'Aldric' });
      const enemy = makeCreature({ name: 'Goblin' });

      // Act
      const log = fight(hero, enemy);

      // Assert
      expect(log.hero.name).toBe('Aldric');
      expect(log.enemy.name).toBe('Goblin');
    });
  });
});

describe('simulateRun', () => {
  it('reports hero as winner when all enemies defeated', () => {
    // Arrange — hero always goes first and one-shots each enemy
    // Each fight: d20(hero init)=15, d20(enemy init)=5, d20(hero attack)=20
    setupD20(15, 5, 20, 15, 5, 20);
    mockRollFormula.mockReturnValue(dmg(1));
    const hero = makeCreature({ currentHp: 10 });
    const enemies = [
      makeCreature({ name: 'Enemy1', currentHp: 1 }),
      makeCreature({ name: 'Enemy2', currentHp: 1 }),
    ];

    // Act
    const log = simulateRun(hero, enemies);

    // Assert
    expect(log.survived).toBe(true);
    expect(log.enemiesDefeated).toBe(2);
  });

  it('stops run when hero dies and reports correct defeated count', () => {
    // Arrange
    // Fight 1 — hero kills enemy1
    // Fight 2 — enemy2 kills hero first
    setupD20(
      15, 5, 20,   // fight 1: heroFirst, hero hits kills enemy1
      5, 15, 20,   // fight 2: enemyFirst, enemy2 hits kills hero
    );
    mockRollFormula
      .mockReturnValueOnce(dmg(10)) // hero kills enemy1
      .mockReturnValueOnce(dmg(10)); // enemy2 kills hero
    const hero = makeCreature({ currentHp: 10, armorClass: 10 });
    const enemies = [
      makeCreature({ name: 'Enemy1', currentHp: 10, attackBonus: 0 }),
      makeCreature({ name: 'Enemy2', currentHp: 10, attackBonus: 5 }),
    ];

    // Act
    const log = simulateRun(hero, enemies);

    // Assert
    expect(log.survived).toBe(false);
    expect(log.enemiesDefeated).toBe(1);
    expect(log.fights).toHaveLength(2);
  });

  it('carries hero HP between fights', () => {
    // Arrange
    // Fight 1: enemy goes first, hits hero for 3 dmg (10→7), then hero kills enemy
    // Fight 2: hero goes first, kills enemy without taking damage
    setupD20(
      3,  15,        // fight 1 initiatives → enemyFirst
      20,            // enemy1 attack → hit
      20,            // hero attack → hit, kills enemy1
      15, 5,         // fight 2 initiatives → heroFirst
      20,            // hero attack → hit, kills enemy2
    );
    mockRollFormula
      .mockReturnValueOnce(dmg(3))  // enemy1 deals 3 damage to hero
      .mockReturnValueOnce(dmg(10)) // hero kills enemy1
      .mockReturnValueOnce(dmg(10)); // hero kills enemy2
    const hero = makeCreature({ currentHp: 10, armorClass: 10, attackBonus: 5 });
    const enemies = [
      makeCreature({ name: 'Enemy1', currentHp: 10, armorClass: 5, attackBonus: 5 }),
      makeCreature({ name: 'Enemy2', currentHp: 10, armorClass: 5 }),
    ];

    // Act
    const log = simulateRun(hero, enemies);

    // Assert — hero should finish fight 2 with 7 HP (took 3 in fight 1, none in fight 2)
    expect(log.heroFinalHp).toBe(7);
    expect(log.enemiesDefeated).toBe(2);
  });

  it('returns exitType "survived" when hero wins', () => {
    // Arrange
    setupD20(15, 5, 20);
    mockRollFormula.mockReturnValueOnce(dmg(10));
    const hero = makeCreature({ currentHp: 10 });
    const enemies = [makeCreature({ currentHp: 10 })];

    // Act
    const log = simulateRun(hero, enemies);

    // Assert
    expect(log.exitType).toBe('survived');
  });

  it('returns exitType "died" when hero loses', () => {
    // Arrange
    setupD20(5, 15, 20);
    mockRollFormula.mockReturnValueOnce(dmg(10));
    const hero = makeCreature({ currentHp: 10, armorClass: 10 });
    const enemies = [makeCreature({ currentHp: 10, attackBonus: 5 })];

    // Act
    const log = simulateRun(hero, enemies);

    // Assert
    expect(log.exitType).toBe('died');
  });
});

describe('createFightState', () => {
  it('hero acts first when hero initiative >= enemy initiative', () => {
    setupD20(15, 5);
    const hero = makeCreature();
    const enemy = makeCreature();
    const state = createFightState(hero, enemy);
    expect(state.firstAttacker).toBe('hero');
  });

  it('enemy acts first when enemy initiative > hero initiative', () => {
    setupD20(5, 15);
    const state = createFightState(makeCreature(), makeCreature());
    expect(state.firstAttacker).toBe('enemy');
  });

  it('stores snapshot copies of hero and enemy', () => {
    setupD20(15, 5);
    const hero = makeCreature({ name: 'Hero', currentHp: 10 });
    const enemy = makeCreature({ name: 'Foe', currentHp: 8 });
    const state = createFightState(hero, enemy);
    expect(state.heroStart.name).toBe('Hero');
    expect(state.enemyStart.name).toBe('Foe');
    expect(state.winner).toBeNull();
    expect(state.rounds).toHaveLength(0);
  });
});

describe('resolveNextRound', () => {
  it('returns null round when fight already has a winner', () => {
    setupD20(15, 5);
    let state = createFightState(makeCreature(), makeCreature());
    state = { ...state, winner: 'hero' };
    const { round } = resolveNextRound(state);
    expect(round).toBeNull();
  });

  it('advances fight by one round', () => {
    // hero first, misses, enemy misses — no winner yet
    setupD20(15, 5, 1, 1);
    const state = createFightState(
      makeCreature({ armorClass: 15, attackBonus: 0 }),
      makeCreature({ armorClass: 15, attackBonus: 0 }),
    );
    const { fight: next, round } = resolveNextRound(state);
    expect(round?.round).toBe(1);
    expect(next.winner).toBeNull();
    expect(next.rounds).toHaveLength(1);
  });
});

describe('finalizeFight', () => {
  it('throws when fight has no winner', () => {
    setupD20(15, 5);
    const state = createFightState(makeCreature(), makeCreature());
    expect(() => finalizeFight(state)).toThrow('Cannot finalize fight before winner is known');
  });
});

describe('createRunState', () => {
  it('starts as completed with survived when no enemies', () => {
    const state = createRunState(makeCreature(), []);
    expect(state.phase).toBe('completed');
    expect(state.exitType).toBe('survived');
  });

  it('starts as pre-fight with enemies', () => {
    const state = createRunState(makeCreature(), [makeCreature()]);
    expect(state.phase).toBe('pre-fight');
    expect(state.exitType).toBeNull();
  });
});

describe('applyPreFightHeal', () => {
  it('heals hero in pre-fight and caps at maxHp', () => {
    const hero = makeCreature({ currentHp: 5, maxHp: 10 });
    let state = createRunState(hero, [makeCreature()]);
    state = applyPreFightHeal(state, 8);
    expect(state.hero.currentHp).toBe(10);
  });

  it('does nothing outside pre-fight', () => {
    const hero = makeCreature({ currentHp: 5, maxHp: 10 });
    let state = createRunState(hero, [makeCreature()]);
    state = { ...state, phase: 'fighting' };
    state = applyPreFightHeal(state, 5);
    expect(state.hero.currentHp).toBe(5);
  });
});

const makeHealSkill = (): SkillDefinition => ({
  id: 'second-wind',
  name: 'Second Wind',
  description: 'Restore HP',
  target: 'self',
  timing: 'pre-fight',
  effect: { type: 'heal-instant', value: 5 },
  usesPerFight: 1,
});

const makeBuffSkill = (): SkillDefinition => ({
  id: 'quick-jab',
  name: 'Quick Jab',
  description: '+5 dmg next attack',
  target: 'self',
  timing: 'pre-fight',
  effect: { type: 'damage-bonus-next', value: 5 },
  usesPerFight: 1,
});

describe('applyPreFightSkill', () => {
  it('heals hero when skill effect is heal-instant', () => {
    const hero = makeCreature({ currentHp: 5, maxHp: 10 });
    let state = createRunState(hero, [makeCreature()]);
    state = applyPreFightSkill(state, makeHealSkill());
    expect(state.hero.currentHp).toBe(10);
  });

  it('caps heal at maxHp', () => {
    const hero = makeCreature({ currentHp: 8, maxHp: 10 });
    let state = createRunState(hero, [makeCreature()]);
    state = applyPreFightSkill(state, makeHealSkill()); // +5 but capped
    expect(state.hero.currentHp).toBe(10);
  });

  it('does nothing for non-heal effects (no HP change)', () => {
    const hero = makeCreature({ currentHp: 5, maxHp: 10 });
    let state = createRunState(hero, [makeCreature()]);
    state = applyPreFightSkill(state, makeBuffSkill());
    expect(state.hero.currentHp).toBe(5);
  });

  it('does nothing outside pre-fight', () => {
    const hero = makeCreature({ currentHp: 5, maxHp: 10 });
    let state = createRunState(hero, [makeCreature()]);
    state = { ...state, phase: 'fighting' };
    state = applyPreFightSkill(state, makeHealSkill());
    expect(state.hero.currentHp).toBe(5);
  });

  it('decrements usesRemaining for a tracked active skill', () => {
    let state = createRunState(makeCreature(), [makeCreature()]);
    state = {
      ...state,
      activeSkills: [{ skillId: 'second-wind', usesRemaining: 1 }],
    };
    state = applyPreFightSkill(state, makeHealSkill());
    expect(state.activeSkills[0].usesRemaining).toBe(0);
  });

  it('does not decrement when usesRemaining is already 0', () => {
    let state = createRunState(makeCreature(), [makeCreature()]);
    state = {
      ...state,
      activeSkills: [{ skillId: 'second-wind', usesRemaining: 0 }],
    };
    state = applyPreFightSkill(state, makeHealSkill());
    expect(state.activeSkills[0].usesRemaining).toBe(0);
  });
});

describe('startFight', () => {
  it('transitions from pre-fight to fighting', () => {
    setupD20(15, 5);
    const state = createRunState(makeCreature(), [makeCreature()]);
    const next = startFight(state);
    expect(next.phase).toBe('fighting');
    expect(next.currentFight).not.toBeNull();
  });

  it('does nothing when not in pre-fight phase', () => {
    setupD20(15, 5, 20);
    mockRollFormula.mockReturnValueOnce(dmg(10));
    let state = createRunState(makeCreature(), [makeCreature()]);
    state = startFight(state);
    state = advanceFightRound(state); // fight ends
    const phase = state.phase;
    const again = startFight(state);
    expect(again.phase).toBe(phase); // unchanged
  });
});

describe('advanceFightRound', () => {
  it('does not end fight when both combatants survive the round', () => {
    // hero first, hero misses, enemy misses — nobody dies
    const hero = makeCreature({ armorClass: 15, attackBonus: 0, currentHp: 10 });
    const enemy = makeCreature({ armorClass: 15, attackBonus: 0, currentHp: 10 });
    let state = createRunState(hero, [enemy]);
    setupD20(15, 5, 1, 1); // hero first (initiative), then both miss
    state = startFight(state);
    const next = advanceFightRound(state);
    expect(next.phase).toBe('fighting');
    expect(next.currentFight?.rounds).toHaveLength(1);
  });

  it('does nothing when not in fighting phase', () => {
    const state = createRunState(makeCreature(), [makeCreature()]);
    const next = advanceFightRound(state);
    expect(next.phase).toBe('pre-fight');
  });
});

describe('prepareNextFight', () => {
  it('transitions post-fight back to pre-fight', () => {
    setupD20(15, 5, 20);
    mockRollFormula.mockReturnValueOnce(dmg(10));
    let state = createRunState(makeCreature(), [makeCreature({ currentHp: 10 }), makeCreature()]);
    state = startFight(state);
    while (state.phase === 'fighting') state = advanceFightRound(state);
    expect(state.phase).toBe('post-fight');
    state = prepareNextFight(state);
    expect(state.phase).toBe('pre-fight');
    expect(state.currentFight).toBeNull();
  });

  it('does nothing outside post-fight', () => {
    const state = createRunState(makeCreature(), [makeCreature()]);
    const next = prepareNextFight(state);
    expect(next.phase).toBe('pre-fight'); // unchanged
  });
});

describe('exitRunEarly', () => {
  it('sets phase to completed and exitType to early-exit from pre-fight', () => {
    const state = createRunState(makeCreature(), [makeCreature()]);
    const next = exitRunEarly(state);
    expect(next.phase).toBe('completed');
    expect(next.exitType).toBe('early-exit');
  });

  it('sets phase to completed and exitType to early-exit from post-fight', () => {
    setupD20(15, 5, 20);
    mockRollFormula.mockReturnValueOnce(dmg(10));
    let state = createRunState(makeCreature(), [makeCreature({ currentHp: 10 }), makeCreature()]);
    state = startFight(state);
    while (state.phase === 'fighting') state = advanceFightRound(state);
    const next = exitRunEarly(state);
    expect(next.phase).toBe('completed');
    expect(next.exitType).toBe('early-exit');
  });

  it('does nothing when in fighting phase', () => {
    setupD20(15, 5);
    let state = createRunState(makeCreature(), [makeCreature()]);
    state = startFight(state);
    const next = exitRunEarly(state);
    expect(next.phase).toBe('fighting');
  });
});

describe('toRunLog', () => {
  it('returns null when exitType is null', () => {
    const state = createRunState(makeCreature(), [makeCreature()]);
    expect(toRunLog(state)).toBeNull();
  });

  it('returns a RunLog when exitType is set', () => {
    let state = createRunState(makeCreature(), [makeCreature()]);
    state = exitRunEarly(state);
    const log = toRunLog(state);
    expect(log).not.toBeNull();
    expect(log?.exitType).toBe('early-exit');
    expect(log?.survived).toBe(false);
  });
});
