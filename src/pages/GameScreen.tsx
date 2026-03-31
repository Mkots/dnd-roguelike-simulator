import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { FighterCard } from "@/components/FighterCard";
import { CombatLog } from "@/components/CombatLog";
import { useRunStore } from "@/store/runStore";
import { useGameStore } from "@/store/gameStore";
import { HEAL_AMOUNT } from "@/engine/types";
import {
  GOLD_PER_KILL,
  getGoldMultiplier,
  calculateGoldPenalty,
} from "@/engine/shop";

const ROUND_INTERVAL_MS = 600;

export default function GameScreen() {
  const navigate = useNavigate();
  const { runLog, currentFightIndex, nextFight, applyHeal, exitEarly } =
    useRunStore();
  const { collectRewards, playerState, spendHealCharge, getHero } =
    useGameStore();
  const [anim, setAnim] = useState({ fightIndex: -1, rounds: 0 });
  const visibleRounds = anim.fightIndex === currentFightIndex ? anim.rounds : 0;

  const fight = runLog?.fights[currentFightIndex] ?? null;

  useEffect(() => {
    if (!runLog) navigate("/", { replace: true });
  }, [runLog, navigate]);

  // Animate rounds; reset is handled inside the callback when fightIndex changes
  useEffect(() => {
    if (!fight) return;

    const timer = setInterval(() => {
      setAnim((prev) => {
        const rounds = prev.fightIndex === currentFightIndex ? prev.rounds : 0;
        if (rounds >= fight.rounds.length) {
          clearInterval(timer);
          return { fightIndex: currentFightIndex, rounds };
        }
        return { fightIndex: currentFightIndex, rounds: rounds + 1 };
      });
    }, ROUND_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [currentFightIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!fight) return null;

  const animationDone = visibleRounds >= fight.rounds.length;
  const isLastFight = currentFightIndex === (runLog?.fights.length ?? 0) - 1;

  const roundIdx = Math.min(visibleRounds, fight.rounds.length);
  const heroHp =
    roundIdx === 0
      ? fight.hero.currentHp
      : fight.rounds[roundIdx - 1].heroHpAfter;

  const enemyHp =
    roundIdx === 0
      ? fight.enemy.currentHp
      : fight.rounds[roundIdx - 1].enemyHpAfter;

  const handleHeal = () => {
    const used = spendHealCharge();
    if (used) {
      applyHeal(HEAL_AMOUNT, getHero());
    }
  };

  const handleLeaveRun = () => {
    const enemiesDefeated = runLog!.enemiesDefeated;
    exitEarly();
    collectRewards(enemiesDefeated, "early-exit");
    navigate("/results", {
      state: { enemiesDefeated, exitType: "early-exit", goldPenalty: 0 },
    });
  };

  const handleContinue = () => {
    if (!isLastFight && fight.winner === "hero") {
      nextFight();
    } else {
      const enemiesDefeated = runLog!.enemiesDefeated;
      const exitType = runLog!.survived ? "survived" : "died";
      const multiplier = getGoldMultiplier(playerState.purchasedUpgrades);
      const goldEarned = Math.round(
        enemiesDefeated * GOLD_PER_KILL * multiplier,
      );
      const goldPenalty = calculateGoldPenalty(
        playerState.gold + goldEarned,
        exitType,
      );
      collectRewards(enemiesDefeated, exitType);
      navigate("/results", {
        state: { enemiesDefeated, exitType, goldPenalty },
      });
    }
  };

  const showBetweenFightActions =
    animationDone && fight.winner === "hero" && !isLastFight;
  const showEndActions =
    animationDone && (fight.winner === "enemy" || isLastFight);

  const enemyIndex = currentFightIndex + 1;
  const totalEnemies = runLog?.fights.length ?? 0;

  return (
    <div className="flex flex-col h-dvh max-w-[480px] mx-auto">
      {/* Fighter cards — always visible, never scrolls away */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        <div className="flex items-center gap-1 mb-2 text-xs text-muted-foreground">
          <span className="text-primary font-semibold">Enemy {enemyIndex}</span>
          <span>/ {totalEnemies}</span>
        </div>
        <div className="flex items-center gap-3">
          <FighterCard
            name={fight.hero.name}
            kind={fight.hero.kind}
            avatarSeed={fight.hero.avatarSeed}
            currentHp={heroHp}
            maxHp={fight.hero.maxHp}
            isHero
          />
          <span className="text-muted-foreground font-bold text-sm shrink-0">VS</span>
          <FighterCard
            name={fight.enemy.name}
            kind={fight.enemy.kind}
            avatarSeed={fight.enemy.avatarSeed}
            currentHp={Math.max(0, enemyHp)}
            maxHp={fight.enemy.maxHp}
          />
        </div>
      </div>

      {/* Combat log — fills remaining space, scrolls internally */}
      <div className="flex-1 overflow-hidden px-4 py-2">
        <CombatLog rounds={fight.rounds} visibleCount={visibleRounds} />
      </div>

      {/* Fixed bottom actions */}
      <div className="shrink-0 bg-background/95 backdrop-blur-sm border-t border-border px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        {showBetweenFightActions && (
          <div className="flex flex-col gap-2">
            <Button
              size="lg"
              className="w-full h-12 text-base font-semibold"
              onClick={handleContinue}
            >
              Next Enemy
              <span className="text-xs font-normal ml-2 opacity-70">
                risk: death = −20% gold
              </span>
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-11"
                onClick={handleHeal}
                disabled={playerState.healCharges === 0}
              >
                Heal +{HEAL_AMOUNT} HP [{playerState.healCharges}]
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-11"
                onClick={handleLeaveRun}
              >
                Safe Exit
              </Button>
            </div>
          </div>
        )}

        {showEndActions && (
          <Button
            size="lg"
            className="w-full h-12 text-base font-semibold"
            onClick={handleContinue}
          >
            See Results
          </Button>
        )}

        {!showBetweenFightActions && !showEndActions && (
          <div className="h-12 flex items-center justify-center">
            <span className="text-muted-foreground text-sm animate-pulse">
              Battle in progress...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
