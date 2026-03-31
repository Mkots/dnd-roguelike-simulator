import { useLocation, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { GameTitle } from '@/components/GameTitle';
import { useGameStore } from '@/store/gameStore';
import { GOLD_PER_KILL, getGoldMultiplier } from '@/engine/shop';
import { ENEMY_COUNT } from '@/engine/enemies';
import { cn } from '@/lib/utils';

type ResultsState = {
  enemiesDefeated: number;
  exitType: 'survived' | 'died' | 'early-exit';
  goldPenalty: number;
};

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
  const totalEnemies = ENEMY_COUNT;

  const headingMap: Record<typeof exitType, string> = {
    survived: 'Victory!',
    'early-exit': 'Safe Exit',
    died: 'Defeated',
  };
  const subtextMap: Record<typeof exitType, string> = {
    survived: 'You cleared all enemies!',
    'early-exit': 'You left with your gold intact.',
    died: 'Better luck next time.',
  };
  const heading = headingMap[exitType];
  const subtext = subtextMap[exitType];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4">
      <GameTitle />

      <div className="flex flex-col items-center gap-2">
        <h2 className="text-2xl font-bold">
          {heading}
        </h2>
        <p className="text-muted-foreground text-sm">
          {subtext}
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <ResultRow label="Enemies Defeated" value={`${enemiesDefeated} / ${totalEnemies}`} />
        <ResultRow label="Gold Earned" value={`+${goldEarned} gold`} />
        {multiplier > 1 && (
          <ResultRow label="Gold Multiplier" value={`×${multiplier.toFixed(1)}`} />
        )}
        {exitType === 'died' && goldPenalty > 0 && (
          <ResultRow label="Death Penalty (−20%)" value={`−${goldPenalty} gold`} highlight="red" />
        )}
        <ResultRow label="Total Gold" value={`${playerState.gold} gold`} />
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button size="lg" onClick={() => navigate('/shop')}>
          Go to Shop
        </Button>
        <Button variant="outline" onClick={() => navigate('/')}>
          Play Again
        </Button>
      </div>
    </div>
  );
}

function ResultRow({ label, value, highlight }: Readonly<{ label: string; value: string; highlight?: 'red' }>) {
  return (
    <div className="flex justify-between items-center border-b border-border pb-2">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className={cn('font-semibold', highlight === 'red' && 'text-red-500')}>{value}</span>
    </div>
  );
}
