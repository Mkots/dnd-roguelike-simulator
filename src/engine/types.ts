export type AbilityScores = {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
};

export type Creature = {
  name: string;
  kind?: string; // enemy type key, used for avatar lookup (e.g. 'goblin', 'wolf')
  avatarSeed?: number; // stable random float [0,1) for picking from avatar pool
  abilities: AbilityScores;
  maxHp: number;
  currentHp: number;
  armorClass: number;
  attackBonus: number;
  damageFormula: string; // e.g. "1d6+3", "2d4-1"
};

export type AttackAction = {
  type: 'hit';
  roll: number;
  modifier: number;
  total: number;
  targetAC: number;
  damageFormula: string;
  damageRoll: number;
  damageModifier: number;
  damage: number;
};

export type MissAction = {
  type: 'miss';
  roll: number;
  modifier: number;
  total: number;
  targetAC: number;
};

export type CombatRound = {
  round: number;
  firstAttacker: 'hero' | 'enemy';
  heroAction: AttackAction | MissAction | null;
  enemyAction: AttackAction | MissAction | null;
  heroHpAfter: number;
  enemyHpAfter: number;
};

export type RoundResolution = CombatRound;

export type FightState = {
  heroStart: Creature;
  enemyStart: Creature;
  hero: Creature;
  enemy: Creature;
  rounds: CombatRound[];
  nextRound: number;
  firstAttacker: 'hero' | 'enemy';
  winner: 'hero' | 'enemy' | null;
};

export type FightLog = {
  hero: Creature;
  enemy: Creature;
  rounds: CombatRound[];
  winner: 'hero' | 'enemy';
  heroFinalHp: number;
  enemyFinalHp: number;
  totalRounds: number;
};

export type RunPhase = 'pre-fight' | 'fighting' | 'post-fight' | 'completed';

export type RunState = {
  initialHero: Creature;
  hero: Creature;
  remainingEnemies: Creature[];
  currentEnemy: Creature | null;
  currentFight: FightState | null;
  completedFights: FightLog[];
  phase: RunPhase;
  enemiesDefeated: number;
  exitType: 'survived' | 'died' | 'early-exit' | null;
};

export type RunLog = {
  fights: FightLog[];
  survived: boolean;
  enemiesDefeated: number;
  heroFinalHp: number;
  exitType: 'survived' | 'died' | 'early-exit';
};

export type UpgradeDefinition = {
  id: string;
  name: string;
  description: string;
  costPerLevel: number;
  maxLevel: number;
};

export type PlayerState = {
  gold: number;
  purchasedUpgrades: Record<string, number>;
  totalRuns: number;
  bestRun: number;
  healCharges: number;
};

export const HEAL_AMOUNT = 10;

export type ShopItem = UpgradeDefinition & {
  currentLevel: number;
  cost: number | null;
  affordable: boolean;
};

export type ShopResult =
  | { success: true; playerState: PlayerState }
  | { success: false; reason: string; playerState: PlayerState };
