export { createCreature, abilityModifier } from './creature';
export { fight, simulateRun } from './combat';
export { rollDie, rollFormula, d20, buildFormula } from './dice';
export {
  createInitialPlayerState,
  getShopItems,
  purchase,
  collectRunRewards,
  buildHero,
  GOLD_PER_KILL,
} from './shop';
export { UPGRADES, WEAPON_PROGRESSION } from './upgrades';
export type {
  AbilityScores,
  Creature,
  AttackAction,
  MissAction,
  CombatRound,
  FightLog,
  RunLog,
  UpgradeDefinition,
  PlayerState,
  ShopItem,
  ShopResult,
} from './types';

// HeroConfig lives in shop.ts, re-export it too
export type { HeroConfig } from './shop';
