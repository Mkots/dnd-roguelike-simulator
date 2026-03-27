import { useLocation, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { GameTitle } from '@/components/GameTitle';
import { useGameStore } from '@/store/gameStore';
import { GOLD_PER_KILL } from '@/engine/shop';
import { ENEMY_COUNT } from '@/engine/enemies';

type ResultsState = {
  enemiesDefeated: number;
  survived: boolean;
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

  const { enemiesDefeated, survived } = state;
  const goldEarned = enemiesDefeated * GOLD_PER_KILL;
  const totalEnemies = ENEMY_COUNT;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4">
      <GameTitle />

      <div className="flex flex-col items-center gap-2">
        <h2 className="text-2xl font-bold">
          {survived ? 'Victory!' : 'Defeated'}
        </h2>
        <p className="text-muted-foreground text-sm">
          {survived ? 'You cleared all enemies!' : 'Better luck next time.'}
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <ResultRow label="Enemies Defeated" value={`${enemiesDefeated} / ${totalEnemies}`} />
        <ResultRow label="Gold Earned" value={`+${goldEarned} gold`} />
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

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-border pb-2">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
