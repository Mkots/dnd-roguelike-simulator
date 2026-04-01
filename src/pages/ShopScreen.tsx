import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { getShopItems, HEAL_CHARGE_COST } from '@/engine/shop';
import { HEAL_AMOUNT } from '@/engine/types';
import type { ShopItem } from '@/engine/types';
import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ShopScreen() {
  const navigate = useNavigate();
  const { playerState, buyUpgrade, buyHealCharge } = useGameStore();
  const items = getShopItems(playerState);

  return (
    <div className="flex flex-col h-dvh max-w-[480px] mx-auto">
      {/* Sticky header with gold */}
      <div className="shrink-0 border-b border-border bg-card px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Shop</h2>
          <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
            <Coins className="size-3.5 text-primary" />
            <span className="font-semibold font-mono text-sm text-primary tabular-nums">
              {playerState.gold}
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable item list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <section>
          <h3 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
            Upgrades
          </h3>
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <UpgradeCard
                key={item.id}
                item={item}
                onBuy={() => buyUpgrade(item.id)}
              />
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
            Consumables
          </h3>
          <HealChargeCard
            charges={playerState.healCharges}
            cost={HEAL_CHARGE_COST}
            affordable={playerState.gold >= HEAL_CHARGE_COST}
            onBuy={buyHealCharge}
          />
        </section>
      </div>

      {/* Fixed back button */}
      <div className="shrink-0 bg-background/95 backdrop-blur-sm border-t border-border px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <Button
          variant="outline"
          className="w-full h-11"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </div>
    </div>
  );
}

function UpgradeCard({
  item,
  onBuy,
}: Readonly<{ item: ShopItem; onBuy: () => void }>) {
  const maxed = item.cost === null;
  const levelPct = (item.currentLevel / item.maxLevel) * 100;
  let borderClass: string;
  if (maxed) {
    borderClass = "border-primary/20 opacity-60";
  } else if (item.affordable) {
    borderClass = "border-border";
  } else {
    borderClass = "border-border opacity-60";
  }

  return (
    <div
      className={cn("border rounded-xl p-3.5 bg-card transition-colors", borderClass)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{item.name}</span>
            <span
              className={cn(
                "text-xs px-1.5 py-0.5 rounded font-mono",
                maxed
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {maxed ? 'MAX' : `${item.currentLevel}/${item.maxLevel}`}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{item.description}</span>
          {!maxed && (
            <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/50 rounded-full transition-all"
                style={{ width: `${levelPct}%` }}
              />
            </div>
          )}
          {!maxed && !item.affordable && (
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              Not enough gold
            </p>
          )}
        </div>

        <Button
          size="sm"
          variant={maxed ? 'ghost' : 'default'}
          disabled={maxed || !item.affordable}
          onClick={onBuy}
          className="shrink-0 h-9 min-w-[4rem]"
        >
          {maxed ? 'Maxed' : `${item.cost}g`}
        </Button>
      </div>
    </div>
  );
}

function HealChargeCard({
  charges,
  cost,
  affordable,
  onBuy,
}: Readonly<{
  charges: number;
  cost: number;
  affordable: boolean;
  onBuy: () => void;
}>) {
  return (
    <div
      className={cn(
        "border rounded-xl p-3.5 bg-card transition-colors",
        affordable ? "border-border" : "border-border opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Healing Potion</span>
            <span className="text-xs px-1.5 py-0.5 rounded font-mono bg-green-500/20 text-green-400">
              [{charges}]
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            +{HEAL_AMOUNT} HP, usable once between fights
          </span>
          {!affordable && (
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              Not enough gold
            </p>
          )}
        </div>

        <Button
          size="sm"
          disabled={!affordable}
          onClick={onBuy}
          className="shrink-0 h-9 min-w-[4rem]"
        >
          {cost}g
        </Button>
      </div>
    </div>
  );
}
