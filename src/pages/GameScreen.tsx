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

  console.log(playerState);

  return (
    <div className="min-h-screen flex flex-col items-center gap-8 px-4 py-10 max-w-lg mx-auto">
      {/* Fighters */}
      <div className="flex items-center gap-4 w-full">
        <FighterCard
          name={fight.hero.name}
          kind={fight.hero.kind}
          avatarSeed={fight.hero.avatarSeed}
          currentHp={heroHp}
          maxHp={fight.hero.maxHp}
          isHero
        />
        <span className="text-muted-foreground font-bold shrink-0">VS</span>
        <FighterCard
          name={fight.enemy.name}
          kind={fight.enemy.kind}
          avatarSeed={fight.enemy.avatarSeed}
          currentHp={Math.max(0, enemyHp)}
          maxHp={fight.enemy.maxHp}
        />
      </div>

      {/* Combat log */}
      <CombatLog rounds={fight.rounds} visibleCount={visibleRounds} />

      {/* Between-fight actions: Heal, Leave Run, Next Enemy */}
      {showBetweenFightActions && (
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button
            size="lg"
            variant="outline"
            onClick={handleHeal}
            disabled={playerState.healCharges === 0}
          >
            Heal (+{HEAL_AMOUNT} HP) [{playerState.healCharges}]
          </Button>
          <Button size="lg" variant="outline" onClick={handleLeaveRun}>
            Leave Run (safe)
          </Button>
          <Button size="lg" onClick={handleContinue}>
            Next Enemy → ⚠ Risk: death = −20% gold
          </Button>
        </div>
      )}

      {/* End-of-run action */}
      {showEndActions && (
        <Button size="lg" onClick={handleContinue}>
          See Results
        </Button>
      )}
    </div>
  );
}
