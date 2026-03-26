import { Sword } from 'lucide-react';

export function GameTitle() {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-3 mb-2">
        <Sword className="size-8 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">DnD Roguelike</h1>
        <Sword className="size-8 text-primary scale-x-[-1]" />
      </div>
      <p className="text-muted-foreground text-sm">Simulator</p>
    </div>
  );
}
