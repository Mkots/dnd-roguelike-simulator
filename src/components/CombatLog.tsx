import { useEffect, useRef } from 'react';
import type { CombatRound, AttackAction, MissAction } from '@/engine/types';

type Props = {
  rounds: CombatRound[];
  visibleCount: number;
};

export function CombatLog({ rounds, visibleCount }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
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
  return (
    <div>
      <p className="text-muted-foreground text-xs mb-1">— Round {round.round} —</p>
      <ActionLine action={round.heroAction} label="Hero" />
      {round.enemyAction && <ActionLine action={round.enemyAction} label="Enemy" />}
    </div>
  );
}

function ActionLine({ action, label }: { action: AttackAction | MissAction; label: string }) {
  const mod = action.modifier >= 0 ? `+${action.modifier}` : `${action.modifier}`;

  if (action.type === 'hit') {
    return (
      <p className="text-green-400">
        {label}: {action.roll}{mod}={action.total} vs AC {action.targetAC} → HIT {action.damage} dmg
      </p>
    );
  }
  return (
    <p className="text-muted-foreground">
      {label}: {action.roll}{mod}={action.total} vs AC {action.targetAC} → miss
    </p>
  );
}
