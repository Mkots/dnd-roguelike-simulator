import { Sword } from 'lucide-react';

export function GameTitle() {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-3 mb-1">
        <Sword className="size-5 text-primary shrink-0" />
        <h1 className="text-2xl font-bold tracking-tight text-primary">DnD Roguelike</h1>
        <Sword className="size-5 text-primary scale-x-[-1] shrink-0" />
      </div>
      <p className="text-muted-foreground text-xs uppercase tracking-widest">Simulator</p>
    </div>
  );
}
