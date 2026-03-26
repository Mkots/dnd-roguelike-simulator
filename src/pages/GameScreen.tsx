import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { FighterCard } from '@/components/FighterCard';
import { CombatLog } from '@/components/CombatLog';
import { useRunStore } from '@/store/runStore';
import { useGameStore } from '@/store/gameStore';

const ROUND_INTERVAL_MS = 600;

export default function GameScreen() {
  const navigate = useNavigate();
  const { runLog, currentFightIndex, nextFight } = useRunStore();
  const { collectRewards } = useGameStore();
  const [visibleRounds, setVisibleRounds] = useState(0);

  const fight = runLog?.fights[currentFightIndex] ?? null;

  useEffect(() => {
    if (!runLog) navigate('/', { replace: true });
  }, [runLog, navigate]);

  // Restart animation whenever the fight changes
  useEffect(() => {
    if (!fight) return;
    setVisibleRounds(0);

    const timer = setInterval(() => {
      setVisibleRounds((prev) => {
        if (prev >= fight.rounds.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, ROUND_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [currentFightIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!fight) return null;

  const animationDone = visibleRounds >= fight.rounds.length;
  const isLastFight = currentFightIndex === (runLog?.fights.length ?? 0) - 1;

  const roundIdx = Math.min(visibleRounds, fight.rounds.length);
  const heroHp = roundIdx === 0
    ? fight.hero.currentHp
    : fight.rounds[roundIdx - 1].heroHpAfter;

  const enemyHp = roundIdx === 0
    ? fight.enemy.currentHp
    : fight.rounds[roundIdx - 1].enemyHpAfter;

  const handleContinue = () => {
    if (!isLastFight && fight.winner === 'hero') {
      nextFight();
    } else {
      const enemiesDefeated = runLog!.enemiesDefeated;
      const survived = runLog!.survived;
      collectRewards(enemiesDefeated);
      navigate('/results', { state: { enemiesDefeated, survived } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center gap-8 px-4 py-10 max-w-lg mx-auto">

      {/* Fighters */}
      <div className="flex items-center gap-4 w-full">
        <FighterCard name={fight.hero.name} currentHp={heroHp} maxHp={fight.hero.maxHp} isHero />
        <span className="text-muted-foreground font-bold shrink-0">VS</span>
        <FighterCard name={fight.enemy.name} currentHp={Math.max(0, enemyHp)} maxHp={fight.enemy.maxHp} />
      </div>

      {/* Combat log */}
      <CombatLog rounds={fight.rounds} visibleCount={visibleRounds} />

      {/* Continue button */}
      {animationDone && (
        <Button size="lg" onClick={handleContinue}>
          {!isLastFight && fight.winner === 'hero' ? 'Next Enemy →' : 'See Results'}
        </Button>
      )}

    </div>
  );
}
