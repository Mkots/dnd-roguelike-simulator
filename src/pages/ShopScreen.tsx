import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { GameTitle } from '@/components/GameTitle';
import { useGameStore } from '@/store/gameStore';
import { getShopItems } from '@/engine/shop';
import type { ShopItem } from '@/engine/types';

export default function ShopScreen() {
  const navigate = useNavigate();
  const { playerState, buyUpgrade } = useGameStore();
  const items = getShopItems(playerState);

  return (
    <div className="min-h-screen flex flex-col items-center gap-8 px-4 py-10 max-w-lg mx-auto">
      <GameTitle />

      <div className="flex flex-col items-center gap-1">
        <h2 className="text-xl font-bold">Shop</h2>
        <p className="text-muted-foreground text-sm">
          Gold: <span className="font-semibold text-foreground">{playerState.gold}</span>
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        {items.map((item) => (
          <UpgradeCard key={item.id} item={item} onBuy={() => buyUpgrade(item.id)} />
        ))}
      </div>

      <Button variant="outline" onClick={() => navigate(-1)}>
        ← Back
      </Button>
    </div>
  );
}

function UpgradeCard({ item, onBuy }: { item: ShopItem; onBuy: () => void }) {
  const maxed = item.cost === null;

  return (
    <div className="flex items-center justify-between gap-4 border border-border rounded-lg p-4">
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{item.name}</span>
          <span className="text-xs text-muted-foreground">
            {item.currentLevel} / {item.maxLevel}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{item.description}</span>
      </div>

      <Button
        size="sm"
        variant={maxed ? 'ghost' : 'default'}
        disabled={maxed || !item.affordable}
        onClick={onBuy}
        className="shrink-0"
      >
        {maxed ? 'Maxed' : `${item.cost}g`}
      </Button>
    </div>
  );
}
