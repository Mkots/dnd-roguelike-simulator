import { Sword, Shield, Heart, Zap } from 'lucide-react';
import type { Creature } from '@/engine/types';
import { abilityModifier } from '@/engine/creature';
import { AVATARS } from './avatars';

export function HeroPreview({ hero }: { hero: Creature }) {
  const avatar = hero.kind ? AVATARS[hero.kind] : undefined;

  return (
    <div className="border border-border rounded-xl overflow-hidden w-full max-w-sm bg-card">
      {avatar && (
        <div
          className="h-48 bg-center bg-cover"
          style={{ backgroundImage: `url(${avatar})` }}
        />
      )}
      <div className="p-6 flex flex-col gap-5">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Hero</p>

        <div className="grid grid-cols-2 gap-3">
          <Stat icon={<Heart className="size-4 text-red-400" />} label="HP" value={`${hero.maxHp}`} />
          <Stat icon={<Shield className="size-4 text-blue-400" />} label="AC" value={`${hero.armorClass}`} />
          <Stat icon={<Sword className="size-4 text-primary" />} label="Attack" value={`+${hero.attackBonus}`} />
          <Stat icon={<Zap className="size-4 text-orange-400" />} label="Damage" value={hero.damageFormula} />
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Abilities</p>
          <div className="grid grid-cols-6 gap-1 text-center">
            {(Object.entries(hero.abilities) as [string, number][]).map(([key, score]) => (
              <AbilityScore key={key} label={key.slice(0, 3).toUpperCase()} score={score} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="ml-auto font-mono font-semibold">{value}</span>
    </div>
  );
}

function AbilityScore({ label, score }: { label: string; score: number }) {
  const mod = abilityModifier(score);
  return (
    <div className="flex flex-col items-center gap-0.5 border border-border rounded-lg py-1.5">
      <span className="text-[10px] text-muted-foreground uppercase">{label}</span>
      <span className="font-mono font-bold text-sm">{score}</span>
      <span className="text-[10px] text-muted-foreground font-mono">{mod >= 0 ? `+${mod}` : mod}</span>
    </div>
  );
}
