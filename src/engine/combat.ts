import type {
  Creature,
  AttackAction,
  MissAction,
  CombatRound,
  FightLog,
  RunLog,
} from "./types";
import { d20, rollFormula } from "./dice";
import { abilityModifier } from "./creature";

const resolveAttack = (
  attacker: Creature,
  target: Creature,
): AttackAction | MissAction => {
  const roll = d20();
  const modifier = attacker.attackBonus;
  const total = roll + modifier;

  if (total >= target.armorClass) {
    const dmg = rollFormula(attacker.damageFormula);
    return {
      type: "hit",
      roll,
      modifier,
      total,
      targetAC: target.armorClass,
      damageFormula: attacker.damageFormula,
      damageRoll: dmg.diceRoll,
      damageModifier: dmg.modifier,
      damage: dmg.total,
    };
  }

  return { type: "miss", roll, modifier, total, targetAC: target.armorClass };
};

interface RoundResult {
  heroAction: AttackAction | MissAction | null;
  enemyAction: AttackAction | MissAction | null;
  heroHp: number;
  enemyHp: number;
}

const resolveRound = (
  hero: Creature,
  enemy: Creature,
  heroFirst: boolean,
  heroHp: number,
  enemyHp: number,
): RoundResult => {
  const [first, second] = heroFirst ? [hero, enemy] : [enemy, hero];
  let firstHp = heroFirst ? heroHp : enemyHp;
  let secondHp = heroFirst ? enemyHp : heroHp;

  const firstAction = resolveAttack(first, second);
  if (firstAction.type === "hit") secondHp -= firstAction.damage;

  const secondAction = secondHp > 0 ? resolveAttack(second, first) : null;
  if (secondAction?.type === "hit") firstHp -= secondAction.damage;

  return {
    heroAction: heroFirst ? firstAction : secondAction,
    enemyAction: heroFirst ? secondAction : firstAction,
    heroHp: heroFirst ? firstHp : secondHp,
    enemyHp: heroFirst ? secondHp : firstHp,
  };
};

export const fight = (hero: Creature, enemy: Creature): FightLog => {
  const heroInit = d20() + abilityModifier(hero.abilities.dexterity);
  const enemyInit = d20() + abilityModifier(enemy.abilities.dexterity);
  const heroFirst = heroInit >= enemyInit;

  let heroHp = hero.currentHp;
  let enemyHp = enemy.currentHp;
  const rounds: CombatRound[] = [];
  let roundNum = 0;

  while (heroHp > 0 && enemyHp > 0) {
    roundNum++;
    const result = resolveRound(hero, enemy, heroFirst, heroHp, enemyHp);
    heroHp = result.heroHp;
    enemyHp = result.enemyHp;
    rounds.push({
      round: roundNum,
      firstAttacker: heroFirst ? "hero" : "enemy",
      heroAction: result.heroAction,
      enemyAction: result.enemyAction,
      heroHpAfter: heroHp,
      enemyHpAfter: enemyHp,
    });
  }

  return {
    hero,
    enemy,
    rounds,
    winner: heroHp > 0 ? "hero" : "enemy",
    heroFinalHp: heroHp,
    enemyFinalHp: enemyHp,
    totalRounds: roundNum,
  };
};

export const simulateRun = (hero: Creature, enemies: Creature[]): RunLog => {
  const fights: FightLog[] = [];
  let currentHero = { ...hero };

  for (const enemy of enemies) {
    const result = fight(currentHero, enemy);
    fights.push(result);

    if (result.winner === "enemy") break;

    currentHero = { ...currentHero, currentHp: result.heroFinalHp };
  }

  const lastFight = fights.at(-1)!;
  const survived = lastFight.winner === 'hero';

  return {
    fights,
    survived,
    enemiesDefeated: fights.filter((f) => f.winner === "hero").length,
    heroFinalHp: lastFight.heroFinalHp,
    exitType: survived ? 'survived' : 'died',
  };
};
