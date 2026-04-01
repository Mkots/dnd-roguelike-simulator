import type {
  Creature,
  AttackAction,
  MissAction,
  CombatRound,
  FightLog,
  FightState,
  RunLog,
  RunState,
  SkillDefinition,
  StatusEffect,
} from './types';
import { d20, rollFormula } from './dice';
import { abilityModifier } from './creature';

const resolveAttack = (attacker: Creature, target: Creature): AttackAction | MissAction => {
  const roll = d20();
  const modifier = attacker.attackBonus;
  const total = roll + modifier;

  if (total >= target.armorClass) {
    const dmg = rollFormula(attacker.damageFormula);
    return {
      type: 'hit',
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

  return { type: 'miss', roll, modifier, total, targetAC: target.armorClass };
};

export const createFightState = (hero: Creature, enemy: Creature): FightState => {
  const heroInit = d20() + abilityModifier(hero.abilities.dexterity);
  const enemyInit = d20() + abilityModifier(enemy.abilities.dexterity);
  const firstAttacker = heroInit >= enemyInit ? 'hero' : 'enemy';

  return {
    heroStart: { ...hero },
    enemyStart: { ...enemy },
    hero: { ...hero },
    enemy: { ...enemy },
    rounds: [],
    nextRound: 1,
    firstAttacker,
    winner: null,
    statusEffects: [],
  };
};

export const resolveNextRound = (fight: FightState): { fight: FightState; round: CombatRound | null } => {
  if (fight.winner) return { fight, round: null };

  const heroFirst = fight.firstAttacker === 'hero';
  const first = heroFirst ? fight.hero : fight.enemy;
  const second = heroFirst ? fight.enemy : fight.hero;

  const firstAction = resolveAttack(first, second);
  if (firstAction.type === 'hit') {
    second.currentHp -= firstAction.damage;
  }

  const secondAction = second.currentHp > 0 ? resolveAttack(second, first) : null;
  if (secondAction?.type === 'hit') {
    first.currentHp -= secondAction.damage;
  }

  const round: CombatRound = {
    round: fight.nextRound,
    firstAttacker: fight.firstAttacker,
    heroAction: heroFirst ? firstAction : secondAction,
    enemyAction: heroFirst ? secondAction : firstAction,
    heroHpAfter: fight.hero.currentHp,
    enemyHpAfter: fight.enemy.currentHp,
  };

  let winner: 'hero' | 'enemy' | null = null;
  if (fight.hero.currentHp > 0 && fight.enemy.currentHp <= 0) {
    winner = 'hero';
  } else if (fight.enemy.currentHp > 0 && fight.hero.currentHp <= 0) {
    winner = 'enemy';
  }

  return {
    fight: {
      ...fight,
      rounds: [...fight.rounds, round],
      nextRound: fight.nextRound + 1,
      winner,
    },
    round,
  };
};

export const finalizeFight = (fight: FightState): FightLog => {
  if (!fight.winner) {
    throw new Error('Cannot finalize fight before winner is known');
  }

  return {
    hero: { ...fight.heroStart },
    enemy: { ...fight.enemyStart },
    rounds: fight.rounds,
    winner: fight.winner,
    heroFinalHp: fight.hero.currentHp,
    enemyFinalHp: fight.enemy.currentHp,
    totalRounds: fight.rounds.length,
  };
};

export const createRunState = (hero: Creature, enemies: Creature[]): RunState => ({
  initialHero: { ...hero },
  hero: { ...hero },
  remainingEnemies: [...enemies],
  currentEnemy: enemies[0] ? { ...enemies[0] } : null,
  currentFight: null,
  completedFights: [],
  phase: enemies.length > 0 ? 'pre-fight' : 'completed',
  enemiesDefeated: 0,
  exitType: enemies.length > 0 ? null : 'survived',
  activeSkills: [],
});

export const applyPreFightHeal = (state: RunState, healAmount: number): RunState => {
  if (state.phase !== 'pre-fight') return state;

  return {
    ...state,
    hero: {
      ...state.hero,
      currentHp: Math.min(state.hero.maxHp, state.hero.currentHp + healAmount),
    },
  };
};

export const applyPreFightSkill = (state: RunState, skill: SkillDefinition): RunState => {
  if (state.phase !== 'pre-fight') return state;

  let updatedState = { ...state };

  // Apply instant effects
  if (skill.effect.type === 'heal-instant') {
    updatedState = {
      ...updatedState,
      hero: {
        ...updatedState.hero,
        currentHp: Math.min(
          updatedState.hero.maxHp,
          updatedState.hero.currentHp + skill.effect.value
        ),
      },
    };
  }

  // Decrement skill usage
  const activeSkillIndex = updatedState.activeSkills.findIndex(s => s.skillId === skill.id);
  if (activeSkillIndex !== -1) {
    const updatedActiveSkills = [...updatedState.activeSkills];
    const activeSkill = updatedActiveSkills[activeSkillIndex];
    if (activeSkill.usesRemaining > 0) {
      updatedActiveSkills[activeSkillIndex] = {
        ...activeSkill,
        usesRemaining: activeSkill.usesRemaining - 1,
      };
      updatedState = {
        ...updatedState,
        activeSkills: updatedActiveSkills,
      };
    }
  }

  return updatedState;
};

export const startFight = (state: RunState): RunState => {
  if (state.phase !== 'pre-fight' || !state.currentEnemy) return state;

  const fightState = createFightState(state.hero, state.currentEnemy);

  // Convert active skill effects into status effects for this fight
  const statusEffects: StatusEffect[] = state.activeSkills
    .filter(as => as.usesRemaining > 0)
    .flatMap(as => {
      const skill = state.activeSkills.find(s => s.skillId === as.skillId);
      if (!skill) return [];

      // Only duration-based effects become status effects
      // Instant effects (heal) and next-attack effects are handled differently
      const effects: StatusEffect[] = [];

      return effects;
    });

  return {
    ...state,
    currentFight: { ...fightState, statusEffects },
    phase: 'fighting',
  };
};

export const advanceFightRound = (state: RunState): RunState => {
  if (state.phase !== 'fighting' || !state.currentFight) return state;

  const { fight } = resolveNextRound(state.currentFight);
  if (!fight.winner) {
    return { ...state, currentFight: fight };
  }

  const fightLog = finalizeFight(fight);

  if (fightLog.winner === 'enemy') {
    return {
      ...state,
      hero: { ...state.hero, currentHp: fightLog.heroFinalHp },
      currentFight: fight,
      completedFights: [...state.completedFights, fightLog],
      phase: 'completed',
      exitType: 'died',
    };
  }

  const remainingEnemies = state.remainingEnemies.slice(1);
  const nextEnemy = remainingEnemies[0] ? { ...remainingEnemies[0] } : null;

  return {
    ...state,
    hero: { ...state.hero, currentHp: fightLog.heroFinalHp },
    remainingEnemies,
    currentEnemy: nextEnemy,
    currentFight: fight,
    completedFights: [...state.completedFights, fightLog],
    enemiesDefeated: state.enemiesDefeated + 1,
    phase: nextEnemy ? 'post-fight' : 'completed',
    exitType: nextEnemy ? null : 'survived',
  };
};

export const prepareNextFight = (state: RunState): RunState => {
  if (state.phase !== 'post-fight' || !state.currentEnemy) return state;
  return {
    ...state,
    currentFight: null,
    phase: 'pre-fight',
  };
};

export const exitRunEarly = (state: RunState): RunState => {
  if (state.phase !== 'post-fight' && state.phase !== 'pre-fight') return state;
  return {
    ...state,
    phase: 'completed',
    exitType: 'early-exit',
  };
};

export const toRunLog = (state: RunState): RunLog | null => {
  if (!state.exitType) return null;

  return {
    fights: state.completedFights,
    survived: state.exitType === 'survived',
    enemiesDefeated: state.enemiesDefeated,
    heroFinalHp: state.hero.currentHp,
    exitType: state.exitType,
  };
};

export const fight = (hero: Creature, enemy: Creature): FightLog => {
  let state = createFightState(hero, enemy);
  while (!state.winner) {
    state = resolveNextRound(state).fight;
  }
  return finalizeFight(state);
};

export const simulateRun = (hero: Creature, enemies: Creature[]): RunLog => {
  let run = createRunState(hero, enemies);
  while (run.phase !== 'completed') {
    if (run.phase === 'pre-fight') run = startFight(run);
    else if (run.phase === 'fighting') run = advanceFightRound(run);
    else if (run.phase === 'post-fight') run = prepareNextFight(run);
  }

  return toRunLog(run)!;
};
