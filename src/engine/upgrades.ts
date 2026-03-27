import type { UpgradeDefinition } from './types';

export const WEAPON_PROGRESSION = ['1d4', '1d6', '1d8', '1d10', '1d12'] as const;

export const UPGRADES: UpgradeDefinition[] = [
  {
    id: 'strength',
    name: 'Strength Training',
    description: '+1 Strength per level (improves melee attack and damage)',
    costPerLevel: 3,
    maxLevel: 6,
  },
  {
    id: 'constitution',
    name: 'Iron Body',
    description: '+1 Constitution per level (increases max HP)',
    costPerLevel: 3,
    maxLevel: 6,
  },
  {
    id: 'dexterity',
    name: 'Agility Training',
    description: '+1 Dexterity per level (increases AC and initiative)',
    costPerLevel: 3,
    maxLevel: 6,
  },
  {
    id: 'armor',
    name: 'Better Armor',
    description: '+1 Armor Class per level',
    costPerLevel: 4,
    maxLevel: 5,
  },
  {
    id: 'weapon',
    name: 'Better Weapon',
    description: `Upgrade weapon die: ${WEAPON_PROGRESSION.join(' → ')}`,
    costPerLevel: 5,
    maxLevel: WEAPON_PROGRESSION.length - 1,
  },
  {
    id: 'proficiency',
    name: 'Combat Mastery',
    description: '+1 Proficiency Bonus per level (improves all attack rolls)',
    costPerLevel: 8,
    maxLevel: 2,
  },
  {
    id: 'gold-multiplier',
    name: 'Gold Multiplier',
    description: 'Earn more gold per kill: ×1.1 → ×1.2 → ×1.3 → ×1.4 → ×1.5',
    costPerLevel: 10,
    maxLevel: 5,
  },
];
