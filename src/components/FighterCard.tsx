import { cn } from "@/lib/utils";
import { getAvatar } from "./avatars";

type Props = Readonly<{
  name: string;
  kind?: string;
  avatarSeed?: number;
  currentHp: number;
  maxHp: number;
  isHero?: boolean;
}>;

export function FighterCard({
  name,
  kind,
  avatarSeed,
  currentHp,
  maxHp,
  isHero = false,
}: Props) {
  const pct = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  const isDead = currentHp <= 0;
  let hpBarColor: string;
  if (isDead) hpBarColor = "bg-destructive";
  else if (isHero) hpBarColor = "bg-green-500";
  else hpBarColor = "bg-red-500";
  const avatar = getAvatar(kind, avatarSeed);
  const testIdPrefix = `fighter-card-${isHero ? "hero" : "enemy"}`;

  return (
    <div
      className="relative flex-1 border border-border rounded-xl overflow-hidden bg-card bg-cover"
      data-testid={testIdPrefix}
      style={
        avatar
          ? {
              backgroundImage: `url(${avatar})`,
              backgroundRepeat: "no-repeat",
            }
          : undefined
      }
    >
      <div
        data-testid={`${testIdPrefix}-details`}
        className="absolute inset-x-0 bottom-0 bg-card/30 backdrop-blur-xs p-3"
      >
        <p
          data-testid={`${testIdPrefix}-name`}
          className="text-sm font-semibold mb-2"
        >
          {name}
        </p>
        <div
          data-testid={`${testIdPrefix}-hp`}
          className="h-2 bg-muted rounded-full overflow-hidden mb-1"
        >
          <div
            className={cn("h-full rounded-full transition-all duration-300", hpBarColor)}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p
          data-testid={`${testIdPrefix}-hp-text`}
          className="text-xs text-muted-foreground font-mono"
        >
          {Math.max(0, currentHp)} / {maxHp} HP
        </p>
      </div>
      {/* Spacer to give height for the background image */}
      <div className="h-64" />
    </div>
  );
}
