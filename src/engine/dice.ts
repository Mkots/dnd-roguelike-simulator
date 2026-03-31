export const rollDie = (sides: number, rng: () => number = Math.random): number =>
  Math.floor(rng() * sides) + 1;

export const d20 = (rng: () => number = Math.random): number => rollDie(20, rng);

type RollResult = {
  diceRoll: number;  // sum of raw dice only
  modifier: number;
  total: number;     // Math.max(0, diceRoll + modifier)
};

// Parses and rolls dice formulas: "1d6", "2d8+3", "1d4-1"
export const rollFormula = (formula: string, rng: () => number = Math.random): RollResult => {
  const match = /^(\d+)d(\d+)([+-]\d+)?$/i.exec(formula.trim());
  if (!match) throw new Error(`Invalid dice formula: "${formula}"`);

  const count = Number.parseInt(match[1]);
  const sides = Number.parseInt(match[2]);
  const modifier = match[3] ? Number.parseInt(match[3]) : 0;

  let diceRoll = 0;
  for (let i = 0; i < count; i++) {
    diceRoll += rollDie(sides, rng);
  }

  return { diceRoll, modifier, total: Math.max(0, diceRoll + modifier) };
};

export const buildFormula = (dice: string, modifier: number): string => {
  if (modifier === 0) return dice;
  return modifier > 0 ? `${dice}+${modifier}` : `${dice}${modifier}`;
};
