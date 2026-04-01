import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { GameTitle } from '@/components/GameTitle';
import { PlayerStats } from '@/components/PlayerStats';
import { HeroPreview } from '@/components/HeroPreview';
import { SkillLoadout } from '@/components/SkillLoadout';
import { useGameStore } from '@/store/gameStore';
import { useRunStore } from '@/store/runStore';
import { createEnemies } from '@/engine/enemies';
import type { RunStore } from '../store/runStore';

export default function StartScreen() {
  const navigate = useNavigate();
  const { playerState, getHero, resetProgress, equipSkill, unequipSkill } = useGameStore();
  const startRun = useRunStore((s: RunStore) => s.startRun);
  const hero = getHero();

  const handleStart = () => {
    startRun(hero, createEnemies(), playerState.equippedSkills);
    navigate('/game');
  };

  return (
    <div className="flex flex-col h-dvh max-w-[480px] mx-auto">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center gap-6 px-4 pt-8 pb-4">
        <GameTitle />
        <PlayerStats playerState={playerState} />
        <HeroPreview hero={hero} />
        <SkillLoadout
          unlockedSkills={playerState.unlockedSkills}
          equippedSkills={playerState.equippedSkills}
          onEquip={equipSkill}
          onUnequip={unequipSkill}
        />
        <button
          onClick={resetProgress}
          className="mt-auto text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
        >
          Reset Progress
        </button>
      </div>

      {/* Fixed bottom actions */}
      <div className="shrink-0 bg-background/95 backdrop-blur-sm border-t border-border px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] flex flex-col gap-2">
        <Button
          size="lg"
          className="w-full h-12 text-base font-semibold"
          onClick={handleStart}
        >
          Start Run
        </Button>
        <Button
          variant="outline"
          className="w-full h-11"
          onClick={() => navigate('/shop')}
        >
          Shop
        </Button>
      </div>
    </div>
  );
}
