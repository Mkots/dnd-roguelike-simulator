import { describe, it, expect } from 'vitest';
import {
  createInitialPlayerState,
  getGoldMultiplier,
  calculateGoldPenalty,
  getShopItems,
  purchase,
  buyHealCharge,
  collectRunRewards,
  buildHero,
  GOLD_PER_KILL,
  HEAL_CHARGE_COST,
} from '../../../src/engine/shop';
import { UPGRADES, WEAPON_PROGRESSION } from '../../../src/engine/upgrades';
import type { PlayerState } from '../../../src/engine/types';
import type { HeroConfig } from '../../../src/engine/shop';

const makePlayerState = (overrides: Partial<PlayerState> = {}): PlayerState => ({
  gold: 50,
  purchasedUpgrades: {},
  totalRuns: 0,
  bestRun: 0,
  healCharges: 0,
  ...overrides,
});

const BASE_HERO_CONFIG: HeroConfig = {
  name: 'Hero',
  baseAbilities: {
    strength: 10, dexterity: 10, constitution: 10,
    intelligence: 10, wisdom: 10, charisma: 10,
  },
};

describe('createInitialPlayerState', () => {
  it('returns default initial state', () => {
    // Arrange & Act
    const state = createInitialPlayerState();

    // Assert
    expect(state.gold).toBe(5);
    expect(state.purchasedUpgrades).toEqual({});
    expect(state.totalRuns).toBe(0);
    expect(state.bestRun).toBe(0);
    expect(state.healCharges).toBe(0);
  });

  it('returns a fresh object on each call', () => {
    // Arrange & Act
    const stateA = createInitialPlayerState();
    const stateB = createInitialPlayerState();

    // Assert
    expect(stateA).not.toBe(stateB);
  });
});

describe('getGoldMultiplier', () => {
  it.each([
    { levels: 0, expected: 1 },
    { levels: 1, expected: 1.1 },
    { levels: 3, expected: 1.3 },
    { levels: 5, expected: 1.5 },
  ])('returns $expected for $levels gold-multiplier levels', ({ levels, expected }) => {
    // Arrange
    const upgrades = levels > 0 ? { 'gold-multiplier': levels } : {};

    // Act
    const result = getGoldMultiplier(upgrades);

    // Assert
    expect(result).toBeCloseTo(expected);
  });
});

describe('calculateGoldPenalty', () => {
  it.each([
    { exitType: 'survived'   as const, totalGold: 100, expected: 0  },
    { exitType: 'early-exit' as const, totalGold: 100, expected: 0  },
    { exitType: 'died'       as const, totalGold: 100, expected: 20 },
    { exitType: 'died'       as const, totalGold: 50,  expected: 10 },
    { exitType: 'died'       as const, totalGold: 15,  expected: 3  }, // floor(15 * 0.20) = 3
  ])('returns $expected for exitType="$exitType" and totalGold=$totalGold', ({
    exitType, totalGold, expected,
  }) => {
    // Arrange & Act
    const result = calculateGoldPenalty(totalGold, exitType);

    // Assert
    expect(result).toBe(expected);
  });
});

describe('getShopItems', () => {
  it('returns one item per upgrade', () => {
    // Arrange
    const state = makePlayerState();

    // Act
    const items = getShopItems(state);

    // Assert
    expect(items).toHaveLength(UPGRADES.length);
  });

  it('starts all items at level 0 with no upgrades purchased', () => {
    // Arrange
    const state = makePlayerState();

    // Act
    const items = getShopItems(state);

    // Assert
    items.forEach(item => expect(item.currentLevel).toBe(0));
  });

  it('reflects purchased levels', () => {
    // Arrange — strength purchased once
    const state = makePlayerState({ purchasedUpgrades: { strength: 2 } });

    // Act
    const item = getShopItems(state).find(i => i.id === 'strength')!;

    // Assert
    expect(item.currentLevel).toBe(2);
  });

  it('marks item as maxed when at max level', () => {
    // Arrange
    const strengthUpgrade = UPGRADES.find(u => u.id === 'strength')!;
    const state = makePlayerState({
      purchasedUpgrades: { strength: strengthUpgrade.maxLevel },
    });

    // Act
    const item = getShopItems(state).find(i => i.id === 'strength')!;

    // Assert
    expect(item.cost).toBeNull();
    expect(item.affordable).toBe(false);
  });

  it('sets affordable=true when player has enough gold', () => {
    // Arrange — strength level 0: cost = 3 * (0 + 1) = 3
    const state = makePlayerState({ gold: 10 });

    // Act
    const item = getShopItems(state).find(i => i.id === 'strength')!;

    // Assert
    expect(item.affordable).toBe(true);
  });

  it('sets affordable=false when player cannot afford', () => {
    // Arrange — strength level 0: cost = 3; player has 2 gold
    const state = makePlayerState({ gold: 2 });

    // Act
    const item = getShopItems(state).find(i => i.id === 'strength')!;

    // Assert
    expect(item.affordable).toBe(false);
  });
});

describe('purchase', () => {
  it('deducts gold and increments upgrade level on success', () => {
    // Arrange — strength level 0: cost = 3 * 1 = 3
    const state = makePlayerState({ gold: 10 });

    // Act
    const result = purchase(state, 'strength');

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.playerState.gold).toBe(7);
      expect(result.playerState.purchasedUpgrades['strength']).toBe(1);
    }
  });

  it('cost scales with current level', () => {
    // Arrange — strength already at level 2: cost = 3 * (2+1) = 9
    const state = makePlayerState({ gold: 50, purchasedUpgrades: { strength: 2 } });

    // Act
    const result = purchase(state, 'strength');

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.playerState.gold).toBe(41);
      expect(result.playerState.purchasedUpgrades['strength']).toBe(3);
    }
  });

  it('fails with reason when upgrade is unknown', () => {
    // Arrange
    const state = makePlayerState();

    // Act
    const result = purchase(state, 'nonexistent');

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) expect(result.reason).toBe('Unknown upgrade');
  });

  it('fails with reason when upgrade is at max level', () => {
    // Arrange
    const strengthUpgrade = UPGRADES.find(u => u.id === 'strength')!;
    const state = makePlayerState({
      purchasedUpgrades: { strength: strengthUpgrade.maxLevel },
    });

    // Act
    const result = purchase(state, 'strength');

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) expect(result.reason).toBe('Already at max level');
  });

  it('fails with reason when player cannot afford', () => {
    // Arrange — cost = 3, player has 1 gold
    const state = makePlayerState({ gold: 1 });

    // Act
    const result = purchase(state, 'strength');

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) expect(result.reason).toContain('Need');
  });

  it('does not mutate the original state', () => {
    // Arrange
    const state = makePlayerState({ gold: 50 });
    const originalGold = state.gold;

    // Act
    purchase(state, 'strength');

    // Assert
    expect(state.gold).toBe(originalGold);
  });
});

describe('buyHealCharge', () => {
  it('deducts gold and increments healCharges on success', () => {
    // Arrange
    const state = makePlayerState({ gold: 20, healCharges: 1 });

    // Act
    const result = buyHealCharge(state);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.playerState.gold).toBe(20 - HEAL_CHARGE_COST);
      expect(result.playerState.healCharges).toBe(2);
    }
  });

  it('fails when player cannot afford', () => {
    // Arrange
    const state = makePlayerState({ gold: HEAL_CHARGE_COST - 1 });

    // Act
    const result = buyHealCharge(state);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) expect(result.reason).toContain('Need');
  });
});

describe('collectRunRewards', () => {
  it('adds gold based on kills and GOLD_PER_KILL', () => {
    // Arrange
    const state = makePlayerState({ gold: 0 });

    // Act
    const next = collectRunRewards(state, 3, 'survived');

    // Assert — 3 kills * 2 gold * 1.0 multiplier = 6
    expect(next.gold).toBe(3 * GOLD_PER_KILL);
  });

  it('applies gold multiplier when purchased', () => {
    // Arrange — multiplier level 2 → ×1.2
    const state = makePlayerState({ gold: 0, purchasedUpgrades: { 'gold-multiplier': 2 } });

    // Act
    const next = collectRunRewards(state, 5, 'survived');

    // Assert — round(5 * 2 * 1.2) = round(12) = 12
    expect(next.gold).toBe(12);
  });

  it('applies death penalty when exitType is "died"', () => {
    // Arrange — start with 0 gold, earn 10, penalty = floor(10 * 0.20) = 2
    const state = makePlayerState({ gold: 0 });

    // Act
    const next = collectRunRewards(state, 5, 'died'); // 5*2=10 earned

    // Assert
    expect(next.gold).toBe(8);
  });

  it('does not apply penalty for "early-exit"', () => {
    // Arrange
    const state = makePlayerState({ gold: 0 });

    // Act
    const next = collectRunRewards(state, 5, 'early-exit');

    // Assert
    expect(next.gold).toBe(10);
  });

  it('increments totalRuns by 1', () => {
    // Arrange
    const state = makePlayerState({ totalRuns: 4 });

    // Act
    const next = collectRunRewards(state, 0);

    // Assert
    expect(next.totalRuns).toBe(5);
  });

  it.each([
    { bestRun: 3, enemiesDefeated: 5, expectedBest: 5 },
    { bestRun: 7, enemiesDefeated: 5, expectedBest: 7 },
    { bestRun: 5, enemiesDefeated: 5, expectedBest: 5 },
  ])('bestRun: previous=$bestRun, defeated=$enemiesDefeated → $expectedBest', ({
    bestRun, enemiesDefeated, expectedBest,
  }) => {
    // Arrange
    const state = makePlayerState({ bestRun });

    // Act
    const next = collectRunRewards(state, enemiesDefeated);

    // Assert
    expect(next.bestRun).toBe(expectedBest);
  });
});

describe('buildHero', () => {
  it('creates hero with base stats when no upgrades', () => {
    // Arrange
    const state = makePlayerState();

    // Act
    const hero = buildHero(BASE_HERO_CONFIG, state);

    // Assert
    expect(hero.name).toBe('Hero');
    expect(hero.abilities.strength).toBe(10);
    expect(hero.abilities.dexterity).toBe(10);
    expect(hero.abilities.constitution).toBe(10);
  });

  it('applies strength upgrade to abilities', () => {
    // Arrange
    const state = makePlayerState({ purchasedUpgrades: { strength: 3 } });

    // Act
    const hero = buildHero(BASE_HERO_CONFIG, state);

    // Assert
    expect(hero.abilities.strength).toBe(13);
  });

  it('does not apply upgrades to intelligence, wisdom, charisma', () => {
    // Arrange
    const state = makePlayerState({ purchasedUpgrades: { strength: 2 } });

    // Act
    const hero = buildHero(BASE_HERO_CONFIG, state);

    // Assert
    expect(hero.abilities.intelligence).toBe(BASE_HERO_CONFIG.baseAbilities.intelligence);
    expect(hero.abilities.wisdom).toBe(BASE_HERO_CONFIG.baseAbilities.wisdom);
    expect(hero.abilities.charisma).toBe(BASE_HERO_CONFIG.baseAbilities.charisma);
  });

  it('advances weapon die along WEAPON_PROGRESSION', () => {
    // Arrange — base weapon '1d6' (index 1), upgrade 1 → index 2 = '1d8'
    const state = makePlayerState({ purchasedUpgrades: { weapon: 1 } });
    const config: HeroConfig = { ...BASE_HERO_CONFIG, baseWeaponDice: '1d6' };

    // Act
    const hero = buildHero(config, state);

    // Assert
    expect(hero.damageFormula).toContain(WEAPON_PROGRESSION[2]); // '1d8'
  });

  it('caps weapon progression at maximum tier', () => {
    // Arrange — start at '1d4' (index 0), apply 99 upgrades → should cap at last tier
    const state = makePlayerState({ purchasedUpgrades: { weapon: 99 } });
    const config: HeroConfig = { ...BASE_HERO_CONFIG, baseWeaponDice: '1d4' };

    // Act
    const hero = buildHero(config, state);

    // Assert
    const maxWeapon = WEAPON_PROGRESSION.at(-1);
    expect(hero.damageFormula).toContain(maxWeapon);
  });

  it('applies armor upgrade to AC', () => {
    // Arrange — armor+2 upgrades, dex=10 → AC = 10 + 0 + 2 = 12
    const state = makePlayerState({ purchasedUpgrades: { armor: 2 } });

    // Act
    const hero = buildHero(BASE_HERO_CONFIG, state);

    // Assert
    expect(hero.armorClass).toBe(12);
  });

  it('applies proficiency upgrade to attack bonus', () => {
    // Arrange — proficiency+1: bonus = 2+1=3; str=10 → strMod=0 → attackBonus=3
    const state = makePlayerState({ purchasedUpgrades: { proficiency: 1 } });

    // Act
    const hero = buildHero(BASE_HERO_CONFIG, state);

    // Assert
    expect(hero.attackBonus).toBe(3);
  });
});
