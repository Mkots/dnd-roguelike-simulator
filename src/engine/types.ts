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
  abilities: AbilityScores;
  maxHp: number;
  currentHp: number;
  armorClass: number;
  attackBonus: number;
  damageFormula: string; // e.g. "1d6+3", "2d4-1"
};

export type AttackAction = {
  type: 'hit';
  roll: number;        // raw d20
  modifier: number;    // attack bonus
  total: number;       // roll + modifier
  targetAC: number;
  damageFormula: string;
  damageRoll: number;  // raw damage dice (without modifier)
  damageModifier: number;
  damage: number;      // total damage
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
  heroAction: AttackAction | MissAction | null; // null if hero died on enemy's turn
  enemyAction: AttackAction | MissAction | null; // null if enemy died on hero's turn
  heroHpAfter: number;
  enemyHpAfter: number;
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

export type RunLog = {
  fights: FightLog[];
  survived: boolean;
  enemiesDefeated: number;
  heroFinalHp: number;
  exitType: 'survived' | 'died' | 'early-exit';
};

// --- Shop & Meta-progression ---

export type UpgradeDefinition = {
  id: string;
  name: string;
  description: string;
  costPerLevel: number; // cost = costPerLevel * (currentLevel + 1)
  maxLevel: number;
};

export type PlayerState = {
  gold: number;
  purchasedUpgrades: Record<string, number>; // upgradeId -> levels purchased
  totalRuns: number;
  bestRun: number; // max enemies defeated in one run
  healCharges: number;
};

export const HEAL_AMOUNT = 10;

export type ShopItem = UpgradeDefinition & {
  currentLevel: number;
  cost: number | null; // null = maxed out
  affordable: boolean;
};

export type ShopResult =
  | { success: true; playerState: PlayerState }
  | { success: false; reason: string; playerState: PlayerState };
