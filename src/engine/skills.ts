import type { SkillDefinition } from './types';

/**
 * Initial skill roster for v1
 * Skills are split into clear gameplay buckets:
 * - Self-buffs (offense): Quick Jab, Sharpen Blade, Focus Mind
 * - Self-buffs (defense): Minor Shielding, Brace
 * - Instant recovery: Second Wind (Lite)
 * - Enemy debuffs: Distract Enemy, Weaken Armor
 */

export const SKILLS: SkillDefinition[] = [
  {
    id: 'quick-jab',
    name: 'Quick Jab',
    description: 'Deal +5 damage on the next attack',
    target: 'self',
    timing: 'pre-fight',
    effect: {
      type: 'damage-bonus-next',
      value: 5,
    },
    usesPerFight: 1,
  },
  {
    id: 'sharpen-blade',
    name: 'Sharpen Blade',
    description: '+2 damage for 5 rounds',
    target: 'self',
    timing: 'pre-fight',
    effect: {
      type: 'damage-bonus-duration',
      value: 2,
      durationRounds: 5,
    },
    usesPerFight: 1,
  },
  {
    id: 'minor-shielding',
    name: 'Minor Shielding',
    description: '+4 AC for 5 rounds',
    target: 'self',
    timing: 'pre-fight',
    effect: {
      type: 'ac-bonus-duration',
      value: 4,
      durationRounds: 5,
    },
    usesPerFight: 1,
  },
  {
    id: 'brace',
    name: 'Brace',
    description: 'Reduce incoming damage by 3 for 4 rounds',
    target: 'self',
    timing: 'pre-fight',
    effect: {
      type: 'damage-reduction-duration',
      value: 3,
      durationRounds: 4,
    },
    usesPerFight: 1,
  },
  {
    id: 'second-wind',
    name: 'Second Wind (Lite)',
    description: 'Restore 5 HP',
    target: 'self',
    timing: 'pre-fight',
    effect: {
      type: 'heal-instant',
      value: 5,
    },
    usesPerFight: 1,
  },
  {
    id: 'focus-mind',
    name: 'Focus Mind',
    description: '+4 initiative for 5 rounds',
    target: 'self',
    timing: 'pre-fight',
    effect: {
      type: 'initiative-bonus-duration',
      value: 4,
      durationRounds: 5,
    },
    usesPerFight: 1,
  },
  {
    id: 'distract-enemy',
    name: 'Distract Enemy',
    description: 'Enemy gets -3 attack for 3 rounds',
    target: 'enemy',
    timing: 'pre-fight',
    effect: {
      type: 'enemy-attack-penalty-duration',
      value: 3,
      durationRounds: 3,
    },
    usesPerFight: 1,
  },
  {
    id: 'weaken-armor',
    name: 'Weaken Armor',
    description: 'Target gets -3 AC for 4 rounds',
    target: 'enemy',
    timing: 'pre-fight',
    effect: {
      type: 'enemy-ac-penalty-duration',
      value: 3,
      durationRounds: 4,
    },
    usesPerFight: 1,
  },
];

export const getSkillById = (id: string): SkillDefinition | undefined =>
  SKILLS.find(s => s.id === id);

// Default unlocked skills for new players
export const DEFAULT_UNLOCKED_SKILLS = ['quick-jab', 'second-wind'];

// Maximum number of skills that can be equipped per run
export const MAX_EQUIPPED_SKILLS = 2;
