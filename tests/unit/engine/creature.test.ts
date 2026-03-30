import { describe, it, expect } from 'vitest';
import { abilityModifier, createCreature } from '../../../src/engine/creature';
import type { AbilityScores } from '../../../src/engine/types';

const BASE_ABILITIES: AbilityScores = {
  strength: 10, dexterity: 10, constitution: 10,
  intelligence: 10, wisdom: 10, charisma: 10,
};

describe('abilityModifier', () => {
  it.each([
    { score: 10, expected: 0  },
    { score: 11, expected: 0  },
    { score: 12, expected: 1  },
    { score: 13, expected: 1  },
    { score: 14, expected: 2  },
    { score: 8,  expected: -1 },
    { score: 7,  expected: -2 },
    { score: 1,  expected: -5 },
    { score: 20, expected: 5  },
  ])('returns $expected for score $score', ({ score, expected }) => {
    // Arrange & Act
    const result = abilityModifier(score);

    // Assert
    expect(result).toBe(expected);
  });
});

describe('createCreature', () => {
  describe('HP calculation', () => {
    it('calculates maxHp from hitDie and constitution modifier', () => {
      // Arrange
      const abilities = { ...BASE_ABILITIES, constitution: 14 }; // conMod = +2

      // Act
      const creature = createCreature('Test', abilities, { hitDie: 8, level: 1 });

      // Assert — max(1, 8 + 2*1) = 10
      expect(creature.maxHp).toBe(10);
      expect(creature.currentHp).toBe(10);
    });

    it('clamps maxHp to minimum of 1', () => {
      // Arrange — constitution 1 → conMod = -5; hitDie = 1 → max(1, 1 + (-5)*1) = 1
      const abilities = { ...BASE_ABILITIES, constitution: 1 };

      // Act
      const creature = createCreature('Test', abilities, { hitDie: 1, level: 1 });

      // Assert
      expect(creature.maxHp).toBe(1);
    });

    it.each([
      { constitution: 10, hitDie: 8, expected: 8  },
      { constitution: 12, hitDie: 8, expected: 9  }, // 8 + 1
      { constitution: 16, hitDie: 10, expected: 13 }, // 10 + 3
    ])('maxHp=$expected for hitDie=$hitDie and constitution=$constitution', ({
      constitution, hitDie, expected,
    }) => {
      // Arrange
      const abilities = { ...BASE_ABILITIES, constitution };

      // Act
      const creature = createCreature('Test', abilities, { hitDie, level: 1 });

      // Assert
      expect(creature.maxHp).toBe(expected);
    });
  });

  describe('AC calculation', () => {
    it('calculates AC as 10 + dexterity modifier + armor bonus', () => {
      // Arrange
      const abilities = { ...BASE_ABILITIES, dexterity: 14 }; // dexMod = +2

      // Act
      const creature = createCreature('Test', abilities, { armorBonus: 3 });

      // Assert — 10 + 2 + 3 = 15
      expect(creature.armorClass).toBe(15);
    });

    it.each([
      { dexterity: 10, armorBonus: 0, expected: 10 },
      { dexterity: 14, armorBonus: 0, expected: 12 },
      { dexterity: 8,  armorBonus: 2, expected: 11 }, // 10 + (-1) + 2
      { dexterity: 10, armorBonus: 5, expected: 15 },
    ])('AC=$expected for dex=$dexterity and armorBonus=$armorBonus', ({
      dexterity, armorBonus, expected,
    }) => {
      // Arrange
      const abilities = { ...BASE_ABILITIES, dexterity };

      // Act
      const creature = createCreature('Test', abilities, { armorBonus });

      // Assert
      expect(creature.armorClass).toBe(expected);
    });
  });

  describe('attack bonus calculation', () => {
    it('calculates attackBonus as ability modifier + proficiency bonus', () => {
      // Arrange
      const abilities = { ...BASE_ABILITIES, strength: 14 }; // strMod = +2

      // Act
      const creature = createCreature('Test', abilities, { proficiencyBonus: 3, attackAbility: 'strength' });

      // Assert — 2 + 3 = 5
      expect(creature.attackBonus).toBe(5);
    });

    it('uses dexterity for attack bonus when attackAbility is dexterity', () => {
      // Arrange
      const abilities = { ...BASE_ABILITIES, strength: 8, dexterity: 16 }; // dexMod = +3

      // Act
      const creature = createCreature('Test', abilities, { attackAbility: 'dexterity' });

      // Assert — 3 + 2 (default proficiency) = 5
      expect(creature.attackBonus).toBe(5);
    });
  });

  describe('damage formula', () => {
    it('builds damage formula from weapon dice and ability modifier', () => {
      // Arrange
      const abilities = { ...BASE_ABILITIES, strength: 14 }; // strMod = +2

      // Act
      const creature = createCreature('Test', abilities, { weaponDice: '1d8' });

      // Assert
      expect(creature.damageFormula).toBe('1d8+2');
    });

    it('omits modifier from formula when ability modifier is zero', () => {
      // Arrange — all abilities 10 → all modifiers 0

      // Act
      const creature = createCreature('Test', BASE_ABILITIES, { weaponDice: '1d6' });

      // Assert
      expect(creature.damageFormula).toBe('1d6');
    });

    it('includes negative modifier in formula', () => {
      // Arrange
      const abilities = { ...BASE_ABILITIES, strength: 8 }; // strMod = -1

      // Act
      const creature = createCreature('Test', abilities, { weaponDice: '1d4' });

      // Assert
      expect(creature.damageFormula).toBe('1d4-1');
    });
  });

  describe('metadata', () => {
    it('sets name and kind', () => {
      // Arrange & Act
      const creature = createCreature('Grukk', BASE_ABILITIES, { kind: 'goblin' });

      // Assert
      expect(creature.name).toBe('Grukk');
      expect(creature.kind).toBe('goblin');
    });

    it('kind is undefined when not provided', () => {
      // Arrange & Act
      const creature = createCreature('Test', BASE_ABILITIES);

      // Assert
      expect(creature.kind).toBeUndefined();
    });

    it('stores ability scores on creature', () => {
      // Arrange & Act
      const creature = createCreature('Test', BASE_ABILITIES);

      // Assert
      expect(creature.abilities).toEqual(BASE_ABILITIES);
    });
  });
});
