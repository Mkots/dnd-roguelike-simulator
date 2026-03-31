import { useLocation, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { GameTitle } from '@/components/GameTitle';
import { useGameStore } from '@/store/gameStore';
import { GOLD_PER_KILL, getGoldMultiplier } from '@/engine/shop';
import { ENEMY_COUNT } from '@/engine/enemies';
import { cn } from '@/lib/utils';
import { Trophy, Shield, Skull } from 'lucide-react';

type ResultsState = {
  enemiesDefeated: number;
  exitType: 'survived' | 'died' | 'early-exit';
  goldPenalty: number;
};

const OUTCOME_CONFIG = {
  survived: {
    heading: 'Victory!',
    subtext: 'You cleared all enemies!',
    icon: Trophy,
    color: 'text-primary',
  },
  'early-exit': {
    heading: 'Safe Exit',
    subtext: 'You left with your gold intact.',
    icon: Shield,
    color: 'text-blue-400',
  },
  died: {
    heading: 'Defeated',
    subtext: 'Better luck next time.',
    icon: Skull,
    color: 'text-destructive',
  },
} as const;

export default function ResultsScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { playerState } = useGameStore();

  const state = location.state as ResultsState | null;

  if (!state) {
    navigate('/', { replace: true });
    return null;
  }

  const { enemiesDefeated, exitType, goldPenalty } = state;
  const multiplier = getGoldMultiplier(playerState.purchasedUpgrades);
  const goldEarned = Math.round(enemiesDefeated * GOLD_PER_KILL * multiplier);

  const { heading, subtext, icon: Icon, color } = OUTCOME_CONFIG[exitType];

  return (
    <div className="flex flex-col h-dvh max-w-[480px] mx-auto">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center gap-6 px-4 pt-10 pb-4">
        <GameTitle />

        <div className="flex flex-col items-center gap-3 text-center">
          <div className={cn("p-4 rounded-full bg-card border border-border", color)}>
            <Icon className="size-10" />
          </div>
          <h2 className={cn("text-3xl font-bold", color)}>{heading}</h2>
          <p className="text-muted-foreground text-sm">{subtext}</p>
        </div>

        <div className="flex flex-col w-full bg-card rounded-xl border border-border overflow-hidden">
          <ResultRow
            label="Enemies Defeated"
            value={`${enemiesDefeated} / ${ENEMY_COUNT}`}
          />
          <ResultRow
            label="Gold Earned"
            value={`+${goldEarned}`}
            positive
          />
          {multiplier > 1 && (
            <ResultRow
              label="Gold Multiplier"
              value={`×${multiplier.toFixed(1)}`}
            />
          )}
          {exitType === 'died' && goldPenalty > 0 && (
            <ResultRow
              label="Death Penalty (−20%)"
              value={`−${goldPenalty}`}
              negative
            />
          )}
          <ResultRow
            label="Total Gold"
            value={`${playerState.gold}`}
            bold
          />
        </div>
      </div>

      {/* Fixed bottom actions */}
      <div className="shrink-0 bg-background/95 backdrop-blur-sm border-t border-border px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] flex flex-col gap-2">
        <Button
          size="lg"
          className="w-full h-12 text-base font-semibold"
          onClick={() => navigate('/shop')}
        >
          Go to Shop
        </Button>
        <Button
          variant="outline"
          className="w-full h-11"
          onClick={() => navigate('/')}
        >
          Play Again
        </Button>
      </div>
    </div>
  );
}

function ResultRow({
  label,
  value,
  positive,
  negative,
  bold,
}: Readonly<{
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
  bold?: boolean;
}>) {
  return (
    <div className="flex justify-between items-center px-4 py-3 border-b border-border last:border-b-0">
      <span
        className={cn(
          "text-sm",
          bold ? "font-semibold text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "font-semibold font-mono tabular-nums",
          positive && "text-primary",
          negative && "text-destructive",
          bold && "text-lg",
        )}
      >
        {value}
      </span>
    </div>
  );
}
