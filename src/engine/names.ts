import type { Creature } from './types';

const NAME_POOLS: Record<string, string[]> = {
  Goblin: ['Grukk', 'Sniv', 'Skrix', 'Zelk', 'Bnik', 'Fizz', 'Grix'],
  Wolf: ['Shadowfang', 'Ironpaw', 'Grimclaw', 'Darkfur', 'Ashbite', 'Nighthowl'],
  Orc: ['Gorash', 'Brakk', 'Thrulg', 'Mordak', 'Varag', 'Krug', 'Drull'],
  Skeleton: ['Bonecrag', 'Dustwalker', 'Ashenveil', 'Grimshade', 'Rattlecliff', 'Hollowmark'],
  Troll: ['Brung', 'Grullak', 'Thugg', 'Rammok', 'Urgash', 'Skrunge'],
  Ogre: ['Blarg', 'Krunt', 'Murgol', 'Stagga', 'Groth', 'Bludge'],
  'Dark Knight': ['Sir Malachar', 'Lord Grimm', 'Baron Vorath', 'Sir Darkbane', 'Lord Ashmore'],
};

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const randomizeEnemyNames = (enemies: Creature[]): Creature[] =>
  enemies.map((enemy) => {
    const pool = NAME_POOLS[enemy.name];
    if (!pool) return enemy;
    return { ...enemy, name: `${pick(pool)} the ${enemy.name}` };
  });
