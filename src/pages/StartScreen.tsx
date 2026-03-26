import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { GameTitle } from '@/components/GameTitle';
import { PlayerStats } from '@/components/PlayerStats';
import { HeroPreview } from '@/components/HeroPreview';
import { useGameStore } from '@/store/gameStore';
import { useRunStore } from '@/store/runStore';
import { ENEMIES } from '@/engine/enemies';
import type { RunStore } from '../store/runStore';

export default function StartScreen() {
  const navigate = useNavigate();
  const { playerState, getHero, resetProgress } = useGameStore();
  const startRun = useRunStore((s: RunStore) => s.startRun);
  const hero = getHero();

  const handleStart = () => {
    startRun(hero, ENEMIES);
    navigate('/game');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 px-4">
      <GameTitle />
      <PlayerStats playerState={playerState} />
      <HeroPreview hero={hero} />
      <Button size="lg" className="px-10 text-base h-11" onClick={handleStart}>
        Start Run
      </Button>
      <Button variant="outline" size="sm" onClick={resetProgress}>
        Reset Progress
      </Button>
    </div>
  );
}
