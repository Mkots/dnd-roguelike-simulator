import { useEffect, useRef } from "react";
import type { CombatRound, AttackAction, MissAction } from "@/engine/types";

type Props = Readonly<{
  rounds: CombatRound[];
  visibleCount: number;
}>;

export function CombatLog({ rounds, visibleCount }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleCount]);

  return (
    <div className="w-full h-full overflow-y-auto rounded-xl p-3 bg-black/40 border border-border/50 space-y-2.5 font-mono text-xs">
      {rounds.slice(0, visibleCount).map((round) => (
        <RoundEntry key={round.round} round={round} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

function RoundEntry({ round }: Readonly<{ round: CombatRound }>) {
  const heroLine = round.heroAction && (
    <ActionLine action={round.heroAction} label="Hero" />
  );
  const enemyLine = round.enemyAction && (
    <ActionLine action={round.enemyAction} label="Enemy" />
  );

  return (
    <div>
      <p className="text-muted-foreground/70 text-[10px] mb-0.5 uppercase tracking-wide">
        — Round {round.round}. First: {round.firstAttacker} —
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
}: Readonly<{
  action: AttackAction | MissAction;
  label: string;
}>) {
  const atkMod =
    action.modifier >= 0 ? `+${action.modifier}` : `${action.modifier}`;

  if (action.type === "hit") {
    let dmgMod = "";
    if (action.damageModifier > 0) dmgMod = `+${action.damageModifier}`;
    else if (action.damageModifier < 0) dmgMod = `${action.damageModifier}`;
    return (
      <p className="text-green-400 leading-relaxed">
        {label}: (1d20{atkMod}) {action.roll}
        {atkMod}={action.total} vs AC {action.targetAC} → HIT (
        {action.damageFormula}) {action.damageRoll}
        {dmgMod}={action.damage} dmg
      </p>
    );
  }
  return (
    <p className="text-muted-foreground leading-relaxed">
      {label}: (1d20{atkMod}) {action.roll}
      {atkMod}={action.total} vs AC {action.targetAC} → miss
    </p>
  );
}
