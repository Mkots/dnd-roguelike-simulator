import type { AbilityScores, Creature } from "./types";
import { buildFormula } from "./dice";

export const abilityModifier = (score: number): number =>
  Math.floor((score - 10) / 2);

type CreatureOptions = {
  hitDie?: number; // 6, 8, 10, 12 — depends on class
  level?: number;
  proficiencyBonus?: number;
  attackAbility?: keyof AbilityScores;
  weaponDice?: string; // e.g. "1d6", "1d8"
  armorBonus?: number; // flat bonus to AC from armor (beyond 10 + DEX)
  kind?: string;
};

export const createCreature = (
  name: string,
  abilities: AbilityScores,
  options: CreatureOptions = {},
): Creature => {
  const {
    hitDie = 8,
    level = 1,
    proficiencyBonus = 2,
    attackAbility = "strength",
    weaponDice = "1d6",
    armorBonus = 0,
    kind,
  } = options;

  const conMod = abilityModifier(abilities.constitution);
  const dexMod = abilityModifier(abilities.dexterity);
  const atkMod = abilityModifier(abilities[attackAbility]);

  const maxHp = Math.max(1, hitDie + conMod * level);
  const armorClass = 10 + dexMod + armorBonus;
  const attackBonus = atkMod + proficiencyBonus;
  const damageFormula = buildFormula(weaponDice, atkMod);

  return {
    name,
    kind,
    avatarSeed: Math.random(),
    abilities,
    maxHp,
    currentHp: maxHp,
    armorClass,
    attackBonus,
    damageFormula,
  };
};
