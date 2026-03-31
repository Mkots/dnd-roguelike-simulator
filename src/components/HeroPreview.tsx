import { Sword, Shield, Heart, Zap } from "lucide-react";
import type { Creature } from "@/engine/types";
import { abilityModifier } from "@/engine/creature";
import { getAvatar } from "./avatars";

export function HeroPreview({ hero }: Readonly<{ hero: Creature }>) {
  const avatar = getAvatar(hero.kind, hero.avatarSeed);

  return (
    <div className="border border-border rounded-xl overflow-hidden w-full max-w-sm bg-card">
      {avatar && (
        <div
          className="h-40 bg-cover bg-top"
          style={{ backgroundImage: `url(${avatar})` }}
        />
      )}
      <div className="p-4 flex flex-col gap-4">
        <p className="text-xs text-primary uppercase tracking-widest font-semibold">
          Hero
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Stat
            icon={<Heart className="size-3.5 text-red-400" />}
            label="HP"
            value={`${hero.maxHp}`}
          />
          <Stat
            icon={<Shield className="size-3.5 text-blue-400" />}
            label="AC"
            value={`${hero.armorClass}`}
          />
          <Stat
            icon={<Sword className="size-3.5 text-primary" />}
            label="Attack"
            value={`+${hero.attackBonus}`}
          />
          <Stat
            icon={<Zap className="size-3.5 text-orange-400" />}
            label="Damage"
            value={hero.damageFormula}
          />
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
            Abilities
          </p>
          <div className="grid grid-cols-6 gap-1 text-center">
            {(Object.entries(hero.abilities) as [string, number][]).map(
              ([key, score]) => (
                <AbilityScore
                  key={key}
                  label={key.slice(0, 3).toUpperCase()}
                  score={score}
                />
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  value: string;
}>) {
  return (
    <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg px-2.5 py-2">
      {icon}
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="ml-auto font-mono font-semibold text-sm tabular-nums">{value}</span>
    </div>
  );
}

function AbilityScore({ label, score }: Readonly<{ label: string; score: number }>) {
  const mod = abilityModifier(score);
  return (
    <div className="flex flex-col items-center gap-0.5 border border-border rounded-lg py-1.5 bg-muted/30">
      <span className="text-[9px] text-muted-foreground uppercase">{label}</span>
      <span className="font-mono font-bold text-xs tabular-nums">{score}</span>
      <span className="text-[9px] text-muted-foreground font-mono tabular-nums">
        {mod >= 0 ? `+${mod}` : mod}
      </span>
    </div>
  );
}
