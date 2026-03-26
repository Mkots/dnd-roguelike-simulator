export const rollDie = (sides: number): number =>
  Math.floor(Math.random() * sides) + 1;

export const d20 = (): number => rollDie(20);

type RollResult = {
  diceRoll: number;  // sum of raw dice only
  modifier: number;
  total: number;     // Math.max(0, diceRoll + modifier)
};

// Parses and rolls dice formulas: "1d6", "2d8+3", "1d4-1"
export const rollFormula = (formula: string): RollResult => {
  const match = formula.trim().match(/^(\d+)d(\d+)([+-]\d+)?$/i);
  if (!match) throw new Error(`Invalid dice formula: "${formula}"`);

  const count = parseInt(match[1]);
  const sides = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3]) : 0;

  let diceRoll = 0;
  for (let i = 0; i < count; i++) {
    diceRoll += rollDie(sides);
  }

  return { diceRoll, modifier, total: Math.max(0, diceRoll + modifier) };
};

export const buildFormula = (dice: string, modifier: number): string => {
  if (modifier === 0) return dice;
  return modifier > 0 ? `${dice}+${modifier}` : `${dice}${modifier}`;
};
