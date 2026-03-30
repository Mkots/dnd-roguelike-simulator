import { describe, it, expect } from 'vitest';
import { rollDie, d20, rollFormula, buildFormula } from '../../../src/engine/dice';

describe('rollDie', () => {
  it.each([
    { sides: 6,  rngValue: 0,     expected: 1 },
    { sides: 6,  rngValue: 0.999, expected: 6 },
    { sides: 6,  rngValue: 0.5,   expected: 4 }, // floor(0.5 * 6) + 1 = 3 + 1
    { sides: 20, rngValue: 0,     expected: 1 },
    { sides: 20, rngValue: 0.999, expected: 20 },
    { sides: 4,  rngValue: 0.25,  expected: 2 }, // floor(0.25 * 4) + 1 = 1 + 1
  ])('returns $expected for d$sides when rng=$rngValue', ({ sides, rngValue, expected }) => {
    // Arrange
    const rng = () => rngValue;

    // Act
    const result = rollDie(sides, rng);

    // Assert
    expect(result).toBe(expected);
  });
});

describe('d20', () => {
  it.each([
    { rngValue: 0,     expected: 1  },
    { rngValue: 0.5,   expected: 11 }, // floor(0.5 * 20) + 1
    { rngValue: 0.999, expected: 20 },
  ])('returns $expected when rng=$rngValue', ({ rngValue, expected }) => {
    // Arrange
    const rng = () => rngValue;

    // Act
    const result = d20(rng);

    // Assert
    expect(result).toBe(expected);
  });
});

describe('rollFormula', () => {
  it.each([
    'invalid',
    'd6',
    '1d',
    '1d6+',
    '',
    '1d6 + 3',
  ])('throws on invalid formula "%s"', (formula) => {
    // Arrange & Act & Assert
    expect(() => rollFormula(formula)).toThrow(`Invalid dice formula: "${formula}"`);
  });

  it.each([
    { formula: '1d6',    rngValue: 0.5, diceRoll: 4, modifier: 0,  total: 4 },
    { formula: '1d6+3',  rngValue: 0.5, diceRoll: 4, modifier: 3,  total: 7 },
    { formula: '1d6-1',  rngValue: 0,   diceRoll: 1, modifier: -1, total: 0 },
    { formula: '1d4-5',  rngValue: 0,   diceRoll: 1, modifier: -5, total: 0 }, // clamped to 0
    { formula: '1d8+2',  rngValue: 0,   diceRoll: 1, modifier: 2,  total: 3 },
    { formula: '1D6',    rngValue: 0.5, diceRoll: 4, modifier: 0,  total: 4 }, // case-insensitive
  ])('rolls "$formula" → { diceRoll: $diceRoll, modifier: $modifier, total: $total }', ({
    formula, rngValue, diceRoll, modifier, total,
  }) => {
    // Arrange
    const rng = () => rngValue;

    // Act
    const result = rollFormula(formula, rng);

    // Assert
    expect(result.diceRoll).toBe(diceRoll);
    expect(result.modifier).toBe(modifier);
    expect(result.total).toBe(total);
  });

  it('sums multiple dice using the same rng', () => {
    // Arrange — 2d6, rng always 0.5 → each die = floor(0.5*6)+1 = 4
    const rng = () => 0.5;

    // Act
    const result = rollFormula('2d6', rng);

    // Assert
    expect(result.diceRoll).toBe(8);
    expect(result.total).toBe(8);
  });
});

describe('buildFormula', () => {
  it.each([
    { dice: '1d6', modifier: 0,  expected: '1d6'    },
    { dice: '1d6', modifier: 3,  expected: '1d6+3'  },
    { dice: '1d8', modifier: -1, expected: '1d8-1'  },
    { dice: '2d4', modifier: 5,  expected: '2d4+5'  },
    { dice: '1d4', modifier: -3, expected: '1d4-3'  },
  ])('builds "$expected" from dice="$dice" and modifier=$modifier', ({ dice, modifier, expected }) => {
    // Arrange & Act
    const result = buildFormula(dice, modifier);

    // Assert
    expect(result).toBe(expected);
  });
});
