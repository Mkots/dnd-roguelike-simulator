import { Sword, Shield, Heart, Zap } from 'lucide-react';
import type { Creature } from '@/engine/types';

export function HeroPreview({ hero }: { hero: Creature }) {
  return (
    <div className="border border-border rounded-xl p-6 w-full max-w-sm bg-card">
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Hero</p>
      <div className="grid grid-cols-2 gap-3">
        <Stat icon={<Heart className="size-4 text-red-400" />} label="HP" value={`${hero.maxHp}`} />
        <Stat icon={<Shield className="size-4 text-blue-400" />} label="AC" value={`${hero.armorClass}`} />
        <Stat icon={<Sword className="size-4 text-primary" />} label="Attack" value={`+${hero.attackBonus}`} />
        <Stat icon={<Zap className="size-4 text-orange-400" />} label="Damage" value={hero.damageFormula} />
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
