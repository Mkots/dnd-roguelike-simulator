import { cn } from '@/lib/utils';
import { AVATARS } from './avatars';

type Props = {
  name: string;
  kind?: string;
  currentHp: number;
  maxHp: number;
  isHero?: boolean;
};

export function FighterCard({ name, kind, currentHp, maxHp, isHero = false }: Props) {
  const pct = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  const isDead = currentHp <= 0;
  const avatar = kind ? AVATARS[kind] : undefined;

  return (
    <div
      className="relative flex-1 border border-border rounded-xl overflow-hidden bg-card"
      style={avatar ? { backgroundImage: `url(${avatar})`, backgroundSize: '70%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center 30%' } : undefined}
    >
      <div className="absolute inset-x-0 bottom-0 bg-card/80 backdrop-blur-sm p-3">
        <p className="text-sm font-semibold mb-2 truncate">{name}</p>
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
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
      {/* Spacer to give height for the background image */}
      <div className="h-36" />
    </div>
  );
}
