import { Coins, Trophy, Zap } from 'lucide-react';
import type { PlayerState } from '@/engine/types';

export function PlayerStats({ playerState }: { playerState: PlayerState }) {
  return (
    <div className="flex gap-6 text-sm">
      <Stat icon={<Coins className="size-4 text-yellow-400" />} label="Gold" value={playerState.gold} />
      <Stat icon={<Trophy className="size-4 text-amber-400" />} label="Best run" value={playerState.bestRun} />
      <Stat icon={<Zap className="size-4 text-muted-foreground" />} label="Runs" value={playerState.totalRuns} />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <span className="text-xl font-semibold">{value}</span>
    </div>
  );
}
