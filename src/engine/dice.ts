export const rollDie = (sides: number): number =>
  Math.floor(Math.random() * sides) + 1;

export const d20 = (): number => rollDie(20);

// Parses and rolls dice formulas: "1d6", "2d8+3", "1d4-1"
export const rollFormula = (formula: string): number => {
  const match = formula.trim().match(/^(\d+)d(\d+)([+-]\d+)?$/i);
  if (!match) throw new Error(`Invalid dice formula: "${formula}"`);

  const count = parseInt(match[1]);
  const sides = parseInt(match[2]);
  const bonus = match[3] ? parseInt(match[3]) : 0;

  let total = bonus;
  for (let i = 0; i < count; i++) {
    total += rollDie(sides);
  }

  return Math.max(0, total);
};

export const buildFormula = (dice: string, modifier: number): string => {
  if (modifier === 0) return dice;
  return modifier > 0 ? `${dice}+${modifier}` : `${dice}${modifier}`;
};
