import { j as jsxRuntimeExports } from './jsx-runtime-BTSpV5jZ.js';
import { H as Heart, a as Shield, S as Sword, Z as Zap } from './lucide-react-CUqtwrv2.js';
import { g as getAvatar } from './avatars-kf3-nYud.js';
import './index-BicV1jb_.js';

const rollDie = (sides, rng = Math.random) => Math.floor(rng() * sides) + 1;
const d20 = (rng = Math.random) => rollDie(20, rng);
const rollFormula = (formula, rng = Math.random) => {
  const match = formula.trim().match(/^(\d+)d(\d+)([+-]\d+)?$/i);
  if (!match) throw new Error(`Invalid dice formula: "${formula}"`);
  const count = parseInt(match[1]);
  const sides = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3]) : 0;
  let diceRoll = 0;
  for (let i = 0; i < count; i++) {
    diceRoll += rollDie(sides, rng);
  }
  return { diceRoll, modifier, total: Math.max(0, diceRoll + modifier) };
};
const buildFormula = (dice, modifier) => {
  if (modifier === 0) return dice;
  return modifier > 0 ? `${dice}+${modifier}` : `${dice}${modifier}`;
};

const abilityModifier = (score) => Math.floor((score - 10) / 2);
const createCreature = (name, abilities, options = {}) => {
  const {
    hitDie = 8,
    level = 1,
    proficiencyBonus = 2,
    attackAbility = "strength",
    weaponDice = "1d6",
    armorBonus = 0,
    kind
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
    damageFormula
  };
};

function HeroPreview({ hero }) {
  const avatar = getAvatar(hero.kind, hero.avatarSeed);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-xl overflow-hidden w-full max-w-sm bg-card", children: [
    avatar && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "h-64 bg-cover",
        style: { backgroundImage: `url(${avatar})` }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 flex flex-col gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-widest", children: "Hero" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Stat,
          {
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "size-4 text-red-400" }),
            label: "HP",
            value: `${hero.maxHp}`
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Stat,
          {
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "size-4 text-blue-400" }),
            label: "AC",
            value: `${hero.armorClass}`
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Stat,
          {
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sword, { className: "size-4 text-primary" }),
            label: "Attack",
            value: `+${hero.attackBonus}`
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Stat,
          {
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "size-4 text-orange-400" }),
            label: "Damage",
            value: hero.damageFormula
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-widest mb-3", children: "Abilities" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-6 gap-1 text-center", children: Object.entries(hero.abilities).map(
          ([key, score]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            AbilityScore,
            {
              label: key.slice(0, 3).toUpperCase(),
              score
            },
            key
          )
        ) })
      ] })
    ] })
  ] });
}
function Stat({
  icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
    icon,
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-sm", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto font-mono font-semibold", children: value })
  ] });
}
function AbilityScore({ label, score }) {
  const mod = abilityModifier(score);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-0.5 border border-border rounded-lg py-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground uppercase", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-bold text-sm", children: score }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-mono", children: mod >= 0 ? `+${mod}` : mod })
  ] });
}

export { HeroPreview };
//# sourceMappingURL=HeroPreview-BYUck3rC.js.map
