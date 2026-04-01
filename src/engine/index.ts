export { createCreature, abilityModifier } from './creature';
export {
  fight,
  simulateRun,
  createFightState,
  resolveNextRound,
  finalizeFight,
  createRunState,
  startFight,
  advanceFightRound,
  prepareNextFight,
  applyPreFightHeal,
  applyPreFightSkill,
  exitRunEarly,
  toRunLog,
} from './combat';
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
export { SKILLS, getSkillById, DEFAULT_UNLOCKED_SKILLS, MAX_EQUIPPED_SKILLS } from './skills';
export type {
  AbilityScores,
  Creature,
  AttackAction,
  MissAction,
  CombatRound,
  FightLog,
  FightState,
  RoundResolution,
  RunPhase,
  RunState,
  RunLog,
  UpgradeDefinition,
  PlayerState,
  ShopItem,
  ShopResult,
  SkillDefinition,
  SkillEffect,
  SkillEffectType,
  SkillTarget,
  SkillTiming,
  StatusEffect,
  ActiveSkill,
} from './types';

// HeroConfig lives in shop.ts, re-export it too
export type { HeroConfig } from './shop';
