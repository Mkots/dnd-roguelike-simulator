import { cn } from '@/lib/utils';

type Props = {
  name: string;
  currentHp: number;
  maxHp: number;
  isHero?: boolean;
};

export function FighterCard({ name, currentHp, maxHp, isHero = false }: Props) {
  const pct = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  const isDead = currentHp <= 0;

  return (
    <div className="flex-1 border border-border rounded-xl p-4 bg-card">
      <p className="text-sm font-semibold mb-3 truncate">{name}</p>
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            isDead ? 'bg-destructive' : isHero ? 'bg-green-500' : 'bg-red-500'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground font-mono">
        {Math.max(0, currentHp)} / {maxHp} HP
      </p>
    </div>
  );
}
