import { createCreature } from './creature';
import { generateEnemyName } from './names';
import type { Creature } from './types';

export const ENEMY_COUNT = 7;

export const createEnemies = (): Creature[] => [
  createCreature(generateEnemyName('Goblin'), {
    strength: 8,  dexterity: 14, constitution: 10,
    intelligence: 8, wisdom: 8, charisma: 6,
  }, { hitDie: 6, weaponDice: '1d4', proficiencyBonus: 2, attackAbility: 'dexterity', kind: 'goblin' }),

  createCreature(generateEnemyName('Wolf'), {
    strength: 12, dexterity: 15, constitution: 12,
    intelligence: 3, wisdom: 12, charisma: 6,
  }, { hitDie: 6, weaponDice: '1d4', proficiencyBonus: 2, attackAbility: 'dexterity', kind: 'wolf' }),

  createCreature(generateEnemyName('Orc'), {
    strength: 16, dexterity: 10, constitution: 14,
    intelligence: 7, wisdom: 9,  charisma: 8,
  }, { hitDie: 8, weaponDice: '1d6', proficiencyBonus: 2, armorBonus: 2, kind: 'orc' }),

  createCreature(generateEnemyName('Skeleton'), {
    strength: 10, dexterity: 14, constitution: 10,
    intelligence: 6, wisdom: 8,  charisma: 5,
  }, { hitDie: 6, weaponDice: '1d6', proficiencyBonus: 2, armorBonus: 3, kind: 'skeleton' }),

  createCreature(generateEnemyName('Troll'), {
    strength: 18, dexterity: 8,  constitution: 16,
    intelligence: 7, wisdom: 9,  charisma: 6,
  }, { hitDie: 10, weaponDice: '1d8', proficiencyBonus: 3, armorBonus: 2, kind: 'troll' }),

  createCreature(generateEnemyName('Ogre'), {
    strength: 19, dexterity: 8,  constitution: 16,
    intelligence: 5, wisdom: 7,  charisma: 7,
  }, { hitDie: 10, weaponDice: '1d8', proficiencyBonus: 3, armorBonus: 3, kind: 'ogre' }),

  createCreature(generateEnemyName('Dark Knight'), {
    strength: 18, dexterity: 12, constitution: 16,
    intelligence: 10, wisdom: 10, charisma: 12,
  }, { hitDie: 10, weaponDice: '1d10', proficiencyBonus: 4, armorBonus: 5, kind: 'dark-knight' }),
];
