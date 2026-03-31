import { Coins, Trophy, Zap } from 'lucide-react';
import type { PlayerState } from '@/engine/types';

export function PlayerStats({ playerState }: Readonly<{ playerState: PlayerState }>) {
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      <StatChip
        icon={<Coins className="size-3.5 text-primary" />}
        label="Gold"
        value={playerState.gold}
      />
      <StatChip
        icon={<Trophy className="size-3.5 text-amber-400" />}
        label="Best"
        value={playerState.bestRun}
      />
      <StatChip
        icon={<Zap className="size-3.5 text-muted-foreground" />}
        label="Runs"
        value={playerState.totalRuns}
      />
    </div>
  );
}

function StatChip({
  icon,
  label,
  value,
}: Readonly<{ icon: React.ReactNode; label: string; value: number }>) {
  return (
    <div className="flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1.5">
      {icon}
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold font-mono tabular-nums">{value}</span>
    </div>
  );
}
