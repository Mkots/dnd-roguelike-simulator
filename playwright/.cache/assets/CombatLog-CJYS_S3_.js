import { j as jsxRuntimeExports } from './jsx-runtime-BTSpV5jZ.js';
import { r as reactExports } from './index-BicV1jb_.js';

function CombatLog({ rounds, visibleCount }) {
  const bottomRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleCount]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-lg h-72 overflow-y-auto border border-border rounded-xl p-4 bg-card space-y-3 font-mono text-sm", children: [
    rounds.slice(0, visibleCount).map((round) => /* @__PURE__ */ jsxRuntimeExports.jsx(RoundEntry, { round }, round.round)),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: bottomRef })
  ] });
}
function RoundEntry({ round }) {
  const heroLine = round.heroAction && /* @__PURE__ */ jsxRuntimeExports.jsx(ActionLine, { action: round.heroAction, label: "Hero" });
  const enemyLine = round.enemyAction && /* @__PURE__ */ jsxRuntimeExports.jsx(ActionLine, { action: round.enemyAction, label: "Enemy" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-xs mb-1", children: [
      "— Round ",
      round.round,
      ". The first attacker was ",
      round.firstAttacker,
      " —"
    ] }),
    round.firstAttacker === "hero" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      heroLine,
      enemyLine
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      enemyLine,
      heroLine
    ] })
  ] });
}
function ActionLine({
  action,
  label
}) {
  const atkMod = action.modifier >= 0 ? `+${action.modifier}` : `${action.modifier}`;
  if (action.type === "hit") {
    const dmgMod = action.damageModifier !== 0 ? action.damageModifier > 0 ? `+${action.damageModifier}` : `${action.damageModifier}` : "";
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-green-400", children: [
      label,
      ": (1d20",
      atkMod,
      ") ",
      action.roll,
      atkMod,
      "=",
      action.total,
      " vs AC ",
      action.targetAC,
      " → HIT (",
      action.damageFormula,
      ") ",
      action.damageRoll,
      dmgMod,
      "=",
      action.damage,
      " dmg"
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
    label,
    ": (1d20",
    atkMod,
    ") ",
    action.roll,
    atkMod,
    "=",
    action.total,
    " vs AC ",
    action.targetAC,
    " → miss"
  ] });
}

export { CombatLog };
//# sourceMappingURL=CombatLog-CJYS_S3_.js.map
