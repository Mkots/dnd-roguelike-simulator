import type { AbilityScores, Creature, PlayerState, ShopItem, ShopResult } from './types';
import { createCreature } from './creature';
import { UPGRADES, WEAPON_PROGRESSION } from './upgrades';

export const GOLD_PER_KILL = 2;

export const createInitialPlayerState = (): PlayerState => ({
  gold: 5,
  purchasedUpgrades: {},
  totalRuns: 0,
  bestRun: 0,
});

const upgradeCost = (costPerLevel: number, currentLevel: number): number =>
  costPerLevel * (currentLevel + 1);

export const getShopItems = (playerState: PlayerState): ShopItem[] =>
  UPGRADES.map(u => {
    const currentLevel = playerState.purchasedUpgrades[u.id] ?? 0;
    const maxed = currentLevel >= u.maxLevel;
    const cost = maxed ? null : upgradeCost(u.costPerLevel, currentLevel);
    return {
      ...u,
      currentLevel,
      cost,
      affordable: cost !== null && playerState.gold >= cost,
    };
  });

export const purchase = (playerState: PlayerState, upgradeId: string): ShopResult => {
  const upgrade = UPGRADES.find(u => u.id === upgradeId);
  if (!upgrade) return { success: false, reason: 'Unknown upgrade', playerState };

  const currentLevel = playerState.purchasedUpgrades[upgradeId] ?? 0;
  if (currentLevel >= upgrade.maxLevel)
    return { success: false, reason: 'Already at max level', playerState };

  const cost = upgradeCost(upgrade.costPerLevel, currentLevel);
  if (playerState.gold < cost)
    return { success: false, reason: `Need ${cost} gold, have ${playerState.gold}`, playerState };

  return {
    success: true,
    playerState: {
      ...playerState,
      gold: playerState.gold - cost,
      purchasedUpgrades: {
        ...playerState.purchasedUpgrades,
        [upgradeId]: currentLevel + 1,
      },
    },
  };
};

export const collectRunRewards = (
  playerState: PlayerState,
  enemiesDefeated: number
): PlayerState => ({
  ...playerState,
  gold: playerState.gold + enemiesDefeated * GOLD_PER_KILL,
  totalRuns: playerState.totalRuns + 1,
  bestRun: Math.max(playerState.bestRun, enemiesDefeated),
});

// --- Hero factory ---

export type HeroConfig = {
  name: string;
  kind?: string;
  baseAbilities: AbilityScores;
  hitDie?: number;
  attackAbility?: keyof AbilityScores;
  baseWeaponDice?: (typeof WEAPON_PROGRESSION)[number];
};

export const buildHero = (config: HeroConfig, playerState: PlayerState): Creature => {
  const u = playerState.purchasedUpgrades;

  const abilities: AbilityScores = {
    strength:     config.baseAbilities.strength     + (u['strength']     ?? 0),
    dexterity:    config.baseAbilities.dexterity    + (u['dexterity']    ?? 0),
    constitution: config.baseAbilities.constitution + (u['constitution'] ?? 0),
    intelligence: config.baseAbilities.intelligence,
    wisdom:       config.baseAbilities.wisdom,
    charisma:     config.baseAbilities.charisma,
  };

  const baseWeapon = config.baseWeaponDice ?? '1d6';
  const baseIndex = WEAPON_PROGRESSION.indexOf(baseWeapon);
  const weaponIndex = Math.min(baseIndex + (u['weapon'] ?? 0), WEAPON_PROGRESSION.length - 1);

  return createCreature(config.name, abilities, {
    hitDie: config.hitDie ?? 10,
    attackAbility: config.attackAbility ?? 'strength',
    weaponDice: WEAPON_PROGRESSION[weaponIndex],
    armorBonus: u['armor'] ?? 0,
    proficiencyBonus: 2 + (u['proficiency'] ?? 0),
    kind: config.kind,
  });
};
