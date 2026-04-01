import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../../../src/store/gameStore';
import { createInitialPlayerState, GOLD_PER_KILL, HEAL_CHARGE_COST } from '../../../src/engine/shop';
import { UPGRADES } from '../../../src/engine/upgrades';

// Provide localStorage for the persist middleware (not available in Node)
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
vi.stubGlobal('localStorage', localStorageMock);

const resetStore = () =>
  useGameStore.setState({ playerState: createInitialPlayerState() });

describe('gameStore — initial state', () => {
  beforeEach(resetStore);

  it('starts with the initial player state', () => {
    const { playerState } = useGameStore.getState();
    expect(playerState.gold).toBe(5);
    expect(playerState.totalRuns).toBe(0);
    expect(playerState.bestRun).toBe(0);
    expect(playerState.healCharges).toBe(0);
    expect(playerState.purchasedUpgrades).toEqual({});
  });
});

describe('gameStore — getHero()', () => {
  beforeEach(resetStore);

  it('returns a Creature with the expected name', () => {
    const hero = useGameStore.getState().getHero();
    expect(hero.name).toBe('Hero');
  });

  it('returns a Creature with positive maxHp and armorClass', () => {
    const hero = useGameStore.getState().getHero();
    expect(hero.maxHp).toBeGreaterThan(0);
    expect(hero.armorClass).toBeGreaterThan(0);
  });

  it('reflects purchased strength upgrade', () => {
    useGameStore.setState(s => ({
      playerState: { ...s.playerState, purchasedUpgrades: { strength: 2 } },
    }));
    const hero = useGameStore.getState().getHero();
    // base strength = 14 + 2 upgrades = 16
    expect(hero.abilities.strength).toBe(16);
  });
});

describe('gameStore — collectRewards()', () => {
  beforeEach(resetStore);

  it('adds gold for enemies defeated', () => {
    const before = useGameStore.getState().playerState.gold;
    useGameStore.getState().collectRewards(3, 'survived');
    const { playerState } = useGameStore.getState();
    expect(playerState.gold).toBe(before + 3 * GOLD_PER_KILL);
  });

  it('increments totalRuns by 1', () => {
    useGameStore.getState().collectRewards(0, 'survived');
    expect(useGameStore.getState().playerState.totalRuns).toBe(1);
  });

  it('updates bestRun when new record is set', () => {
    useGameStore.getState().collectRewards(5, 'survived');
    expect(useGameStore.getState().playerState.bestRun).toBe(5);
  });

  it('does not decrease bestRun when fewer enemies defeated', () => {
    useGameStore.setState(s => ({
      playerState: { ...s.playerState, bestRun: 7 },
    }));
    useGameStore.getState().collectRewards(3, 'survived');
    expect(useGameStore.getState().playerState.bestRun).toBe(7);
  });

  it('applies death penalty when exitType is "died"', () => {
    // Start with 0 gold, defeat 5 enemies → earn 10, penalty = floor(10*0.2) = 2 → net 8
    useGameStore.setState(s => ({ playerState: { ...s.playerState, gold: 0 } }));
    useGameStore.getState().collectRewards(5, 'died');
    expect(useGameStore.getState().playerState.gold).toBe(8);
  });

  it('does not apply penalty for "early-exit"', () => {
    useGameStore.setState(s => ({ playerState: { ...s.playerState, gold: 0 } }));
    useGameStore.getState().collectRewards(5, 'early-exit');
    expect(useGameStore.getState().playerState.gold).toBe(10);
  });
});

describe('gameStore — buyUpgrade()', () => {
  beforeEach(resetStore);

  it('returns true and deducts gold on success', () => {
    // Give enough gold; strength lvl 0 costs 3
    useGameStore.setState(s => ({ playerState: { ...s.playerState, gold: 20 } }));
    const ok = useGameStore.getState().buyUpgrade('strength');
    expect(ok).toBe(true);
    const { playerState } = useGameStore.getState();
    expect(playerState.purchasedUpgrades['strength']).toBe(1);
    expect(playerState.gold).toBe(17);
  });

  it('returns false and leaves state unchanged when insufficient gold', () => {
    useGameStore.setState(s => ({ playerState: { ...s.playerState, gold: 0 } }));
    const ok = useGameStore.getState().buyUpgrade('strength');
    expect(ok).toBe(false);
    expect(useGameStore.getState().playerState.gold).toBe(0);
  });

  it('returns false for unknown upgrade id', () => {
    const ok = useGameStore.getState().buyUpgrade('nonexistent-upgrade');
    expect(ok).toBe(false);
  });

  it('returns false when upgrade is already at max level', () => {
    const strengthUpgrade = UPGRADES.find(u => u.id === 'strength')!;
    useGameStore.setState(s => ({
      playerState: {
        ...s.playerState,
        gold: 999,
        purchasedUpgrades: { strength: strengthUpgrade.maxLevel },
      },
    }));
    const ok = useGameStore.getState().buyUpgrade('strength');
    expect(ok).toBe(false);
  });
});

describe('gameStore — buyHealCharge()', () => {
  beforeEach(resetStore);

  it('returns true, deducts gold, and increments healCharges on success', () => {
    useGameStore.setState(s => ({ playerState: { ...s.playerState, gold: 20 } }));
    const ok = useGameStore.getState().buyHealCharge();
    expect(ok).toBe(true);
    const { playerState } = useGameStore.getState();
    expect(playerState.healCharges).toBe(1);
    expect(playerState.gold).toBe(20 - HEAL_CHARGE_COST);
  });

  it('returns false when insufficient gold', () => {
    useGameStore.setState(s => ({
      playerState: { ...s.playerState, gold: HEAL_CHARGE_COST - 1 },
    }));
    const ok = useGameStore.getState().buyHealCharge();
    expect(ok).toBe(false);
    expect(useGameStore.getState().playerState.healCharges).toBe(0);
  });
});

describe('gameStore — spendHealCharge()', () => {
  beforeEach(resetStore);

  it('returns true and decrements healCharges when charges are available', () => {
    useGameStore.setState(s => ({ playerState: { ...s.playerState, healCharges: 2 } }));
    const ok = useGameStore.getState().spendHealCharge();
    expect(ok).toBe(true);
    expect(useGameStore.getState().playerState.healCharges).toBe(1);
  });

  it('returns false and does not mutate state when no charges remain', () => {
    const ok = useGameStore.getState().spendHealCharge();
    expect(ok).toBe(false);
    expect(useGameStore.getState().playerState.healCharges).toBe(0);
  });
});

describe('gameStore — resetProgress()', () => {
  beforeEach(resetStore);

  it('resets all state to initial values', () => {
    // Dirty the state first
    useGameStore.setState(s => ({
      playerState: {
        ...s.playerState,
        gold: 999,
        totalRuns: 10,
        bestRun: 7,
        healCharges: 3,
        purchasedUpgrades: { strength: 2 },
      },
    }));
    useGameStore.getState().resetProgress();
    const { playerState } = useGameStore.getState();
    expect(playerState.gold).toBe(5);
    expect(playerState.totalRuns).toBe(0);
    expect(playerState.bestRun).toBe(0);
    expect(playerState.healCharges).toBe(0);
    expect(playerState.purchasedUpgrades).toEqual({});
  });
});

describe('gameStore — equipSkill()', () => {
  beforeEach(resetStore);

  it('returns false when skill is not unlocked', () => {
    // 'minor-shielding' is not in DEFAULT_UNLOCKED_SKILLS
    const ok = useGameStore.getState().equipSkill('minor-shielding');
    expect(ok).toBe(false);
    expect(useGameStore.getState().playerState.equippedSkills).toHaveLength(0);
  });

  it('returns true and equips when skill is unlocked', () => {
    useGameStore.setState(s => ({
      playerState: { ...s.playerState, unlockedSkills: ['quick-jab'] },
    }));
    const ok = useGameStore.getState().equipSkill('quick-jab');
    expect(ok).toBe(true);
    expect(useGameStore.getState().playerState.equippedSkills).toContain('quick-jab');
  });

  it('returns true without duplicating when already equipped', () => {
    useGameStore.setState(s => ({
      playerState: {
        ...s.playerState,
        unlockedSkills: ['quick-jab'],
        equippedSkills: ['quick-jab'],
      },
    }));
    const ok = useGameStore.getState().equipSkill('quick-jab');
    expect(ok).toBe(true);
    expect(useGameStore.getState().playerState.equippedSkills).toHaveLength(1);
  });

  it('returns false when MAX_EQUIPPED_SKILLS limit is reached', () => {
    // Fill equippedSkills to the limit with different ids
    const fakeSkills = Array.from({ length: 10 }, (_, i) => `skill-${i}`);
    useGameStore.setState(s => ({
      playerState: {
        ...s.playerState,
        unlockedSkills: ['quick-jab', ...fakeSkills],
        equippedSkills: fakeSkills.slice(0, 2), // assume MAX_EQUIPPED_SKILLS = 2
      },
    }));
    // Only fails if we're already at the limit (MAX_EQUIPPED_SKILLS = 2)
    const currentEquipped = useGameStore.getState().playerState.equippedSkills.length;
    if (currentEquipped >= 2) {
      const ok = useGameStore.getState().equipSkill('quick-jab');
      expect(ok).toBe(false);
    }
  });
});

describe('gameStore — unequipSkill()', () => {
  beforeEach(resetStore);

  it('removes a skill from equippedSkills', () => {
    useGameStore.setState(s => ({
      playerState: {
        ...s.playerState,
        unlockedSkills: ['quick-jab'],
        equippedSkills: ['quick-jab'],
      },
    }));
    useGameStore.getState().unequipSkill('quick-jab');
    expect(useGameStore.getState().playerState.equippedSkills).not.toContain('quick-jab');
  });

  it('is a no-op when skill was not equipped', () => {
    useGameStore.getState().unequipSkill('quick-jab');
    expect(useGameStore.getState().playerState.equippedSkills).toHaveLength(0);
  });
});
