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
    let heroAction: AttackAction | MissAction | null;
    let enemyAction: AttackAction | MissAction | null;

    if (heroFirst) {
      heroAction = resolveAttack(hero, enemy);
      if (heroAction.type === "hit") enemyHp -= heroAction.damage;

      if (enemyHp > 0) {
        enemyAction = resolveAttack(enemy, hero);
        if (enemyAction.type === "hit") heroHp -= enemyAction.damage;
      } else {
        enemyAction = null;
      }
    } else {
      enemyAction = resolveAttack(enemy, hero);
      if (enemyAction.type === "hit") heroHp -= enemyAction.damage;

      if (heroHp > 0) {
        heroAction = resolveAttack(hero, enemy);
        if (heroAction.type === "hit") enemyHp -= heroAction.damage;
      } else {
        heroAction = null;
      }
    }

    rounds.push({
      round: roundNum,
      firstAttacker: heroFirst ? "hero" : "enemy",
      heroAction,
      enemyAction,
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

  const lastFight = fights[fights.length - 1];
  const survived = lastFight.winner === 'hero';

  return {
    fights,
    survived,
    enemiesDefeated: fights.filter((f) => f.winner === "hero").length,
    heroFinalHp: lastFight.heroFinalHp,
    exitType: survived ? 'survived' : 'died',
  };
};
