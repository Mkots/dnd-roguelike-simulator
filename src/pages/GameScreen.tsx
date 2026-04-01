import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { FighterCard } from '@/components/FighterCard';
import { CombatLog } from '@/components/CombatLog';
import { SkillButton } from '@/components/SkillButton';
import { useRunStore } from '@/store/runStore';
import { useGameStore } from '@/store/gameStore';
import { HEAL_AMOUNT } from '@/engine/types';
import { GOLD_PER_KILL, getGoldMultiplier, calculateGoldPenalty } from '@/engine/shop';
import { getSkillById } from '@/engine/skills';

const ROUND_INTERVAL_MS = 600;

export default function GameScreen() {
  const navigate = useNavigate();
  const {
    runState,
    runLog,
    startFight,
    advanceRound,
    prepareNextFight,
    applyHeal,
    applySkill,
    exitEarly,
  } = useRunStore();
  const { collectRewards, playerState, spendHealCharge } = useGameStore();

  useEffect(() => {
    if (!runState) navigate('/', { replace: true });
  }, [runState, navigate]);

  const fight = runState?.currentFight;
  const hero = fight?.hero ?? runState?.hero;
  const enemy = fight?.enemy ?? runState?.currentEnemy;

  useEffect(() => {
    if (runState?.phase !== 'fighting' || !fight) return;

    const timer = setInterval(() => {
      const latest = useRunStore.getState().runState;
      if (latest?.phase !== 'fighting') {
        clearInterval(timer);
        return;
      }
      advanceRound();
    }, ROUND_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [runState?.phase, fight, advanceRound, runState]);

  if (!runState || !hero || !enemy) return null;

  const rounds = fight?.rounds ?? [];
  const heroHp = rounds.length > 0 ? rounds.at(-1)!.heroHpAfter : hero.currentHp;
  const enemyHp = rounds.length > 0 ? rounds.at(-1)!.enemyHpAfter : enemy.currentHp;

  const handleHeal = () => {
    const used = spendHealCharge();
    if (used) applyHeal(HEAL_AMOUNT);
  };

  const handleLeaveRun = () => {
    const enemiesDefeated = runState.enemiesDefeated;
    exitEarly();
    collectRewards(enemiesDefeated, 'early-exit');
    navigate('/results', { state: { enemiesDefeated, exitType: 'early-exit', goldPenalty: 0 } });
  };

  const handleSeeResults = () => {
    const exitType = runLog?.exitType ?? 'died';
    const enemiesDefeated = runState.enemiesDefeated;
    const multiplier = getGoldMultiplier(playerState.purchasedUpgrades);
    const goldEarned = Math.round(enemiesDefeated * GOLD_PER_KILL * multiplier);
    const goldPenalty = calculateGoldPenalty(playerState.gold + goldEarned, exitType);
    collectRewards(enemiesDefeated, exitType);
    navigate('/results', { state: { enemiesDefeated, exitType, goldPenalty } });
  };

  const showPreFight = runState.phase === 'pre-fight';
  const showPostFight = runState.phase === 'post-fight';
  const showCompleted = runState.phase === 'completed';

  const enemyIndex = runState.completedFights.length + 1;
  const totalEnemies = runState.completedFights.length + runState.remainingEnemies.length;

  return (
    <div className="flex flex-col h-dvh max-w-[480px] mx-auto">
      <div className="shrink-0 px-4 pt-4 pb-2">
        <div className="flex items-center gap-1 mb-2 text-xs text-muted-foreground">
          <span className="text-primary font-semibold">Enemy {Math.min(enemyIndex, totalEnemies)}</span>
          <span>/ {totalEnemies}</span>
        </div>
        <div className="flex items-center gap-3">
          <FighterCard
            name={hero.name}
            kind={hero.kind}
            avatarSeed={hero.avatarSeed}
            currentHp={heroHp}
            maxHp={hero.maxHp}
            isHero
          />
          <span className="text-muted-foreground font-bold text-sm shrink-0">VS</span>
          <FighterCard
            name={enemy.name}
            kind={enemy.kind}
            avatarSeed={enemy.avatarSeed}
            currentHp={Math.max(0, enemyHp)}
            maxHp={enemy.maxHp}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-4 py-2">
        <CombatLog rounds={rounds} visibleCount={rounds.length} />
      </div>

      <div className="shrink-0 bg-background/95 backdrop-blur-sm border-t border-border px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        {showPreFight && (
          <div className="flex flex-col gap-2">
            {runState.activeSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-1">
                {runState.activeSkills.map(activeSkill => {
                  const skill = getSkillById(activeSkill.skillId);
                  if (!skill) return null;
                  return (
                    <SkillButton
                      key={activeSkill.skillId}
                      skill={skill}
                      usesRemaining={activeSkill.usesRemaining}
                      onUse={() => applySkill(activeSkill.skillId)}
                    />
                  );
                })}
              </div>
            )}
            <Button size="lg" className="w-full h-12 text-base font-semibold" onClick={startFight}>
              Start Fight
            </Button>
            <Button variant="outline" className="w-full h-11" onClick={handleHeal} disabled={playerState.healCharges === 0}>
              Heal +{HEAL_AMOUNT} HP [{playerState.healCharges}]
            </Button>
          </div>
        )}

        {runState.phase === 'fighting' && (
          <div className="h-12 flex items-center justify-center">
            <span className="text-muted-foreground text-sm animate-pulse">Battle in progress...</span>
          </div>
        )}

        {showPostFight && (
          <div className="flex flex-col gap-2">
            <Button size="lg" className="w-full h-12 text-base font-semibold" onClick={prepareNextFight}>
              Next Enemy <span className="text-xs font-normal ml-2 opacity-70">risk: death = −20% gold</span>
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-11" onClick={handleHeal} disabled={playerState.healCharges === 0}>
                Heal +{HEAL_AMOUNT} HP [{playerState.healCharges}]
              </Button>
              <Button variant="outline" className="flex-1 h-11" onClick={handleLeaveRun}>
                Safe Exit
              </Button>
            </div>
          </div>
        )}

        {showCompleted && (
          <Button size="lg" className="w-full h-12 text-base font-semibold" onClick={handleSeeResults}>
            See Results
          </Button>
        )}
      </div>
    </div>
  );
}
