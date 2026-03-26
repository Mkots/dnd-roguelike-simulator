import { useEffect, useRef } from "react";
import type { CombatRound, AttackAction, MissAction } from "@/engine/types";

type Props = {
  rounds: CombatRound[];
  visibleCount: number;
};

export function CombatLog({ rounds, visibleCount }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleCount]);

  return (
    <div className="w-full max-w-lg h-72 overflow-y-auto border border-border rounded-xl p-4 bg-card space-y-3 font-mono text-sm">
      {rounds.slice(0, visibleCount).map((round) => (
        <RoundEntry key={round.round} round={round} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

function RoundEntry({ round }: { round: CombatRound }) {
  const heroLine = round.heroAction && (
    <ActionLine action={round.heroAction} label="Hero" />
  );
  const enemyLine = round.enemyAction && (
    <ActionLine action={round.enemyAction} label="Enemy" />
  );

  return (
    <div>
      <p className="text-muted-foreground text-xs mb-1">
        — Round {round.round}. The first attacker was {round.firstAttacker} —
      </p>
      {round.firstAttacker === "hero" ? (
        <>
          {heroLine}
          {enemyLine}
        </>
      ) : (
        <>
          {enemyLine}
          {heroLine}
        </>
      )}
    </div>
  );
}

function ActionLine({
  action,
  label,
}: {
  action: AttackAction | MissAction;
  label: string;
}) {
  const atkMod =
    action.modifier >= 0 ? `+${action.modifier}` : `${action.modifier}`;

  if (action.type === "hit") {
    const dmgMod =
      action.damageModifier !== 0
        ? action.damageModifier > 0
          ? `+${action.damageModifier}`
          : `${action.damageModifier}`
        : "";
    return (
      <p className="text-green-400">
        {label}: (1d20{atkMod}) {action.roll}
        {atkMod}={action.total} vs AC {action.targetAC} → HIT (
        {action.damageFormula}) {action.damageRoll}
        {dmgMod}={action.damage} dmg
      </p>
    );
  }
  return (
    <p className="text-muted-foreground">
      {label}: (1d20{atkMod}) {action.roll}
      {atkMod}={action.total} vs AC {action.targetAC} → miss
    </p>
  );
}
