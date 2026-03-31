const allImages = import.meta.glob('@/assets/**/*.{png,jpg,jpeg}', { eager: true });

const AVATAR_POOLS: Record<string, string[]> = {};

for (const [filePath, module] of Object.entries(allImages)) {
  const parts = filePath.split('/');
  const folder = parts.at(-2)!;
  const url = (module as { default: string }).default;
  if (!AVATAR_POOLS[folder]) AVATAR_POOLS[folder] = [];
  AVATAR_POOLS[folder].push(url);
}

export function getAvatar(kind: string | undefined, seed?: number): string | undefined {
  if (!kind) return undefined;
  const pool = AVATAR_POOLS[kind];
  if (!pool?.length) return undefined;
  const index = seed === undefined ? 0 : Math.floor(seed * pool.length);
  return pool[Math.min(index, pool.length - 1)];
}
