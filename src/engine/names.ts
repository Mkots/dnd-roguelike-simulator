const NAME_POOLS: Record<string, string[]> = {
  Goblin: ["Kajan", "Ilya", "Ilgiz", "Rem Zee", "Fak Hre Eew "],
  Wolf: ["Pes", "Dog", "Giant Balls", "Big Dog", "So Baka", "Zna Chen Ie"],
  Orc: ["Ch Mo", "Ya Coo Shev", "Dan Ill", "Noga"],
  Skeleton: ["Chin Yak", "4inka", "Ivan", "Chinya", "Raxit", "Sin Yak"],
  Troll: ["Sarat", "Uz Dechka", "Pukka", "Taras", "Ugash", "Babun"],
  Ogre: ["Blarg", "Krunt", "Murgol", "Stagga", "Groth", "Bludge"],
  "Dark Knight": [
    "Sir Malachar",
    "Lord Grimm",
    "Baron Vorath",
    "Sir Darkbane",
    "Lord Ashmore",
  ],
};

const TITLE_PREFIXES = [
  "Rotten",
  "Crooked",
  "Suspicious",
  "Moist",
  "Ancient",
  "Unwashed",
  "Screaming",
  "Confused",
  "Cursed",
  "Greasy",
  "Damp",
  "Unreasonable",
];

const TITLE_NOUNS = [
  "Knee",
  "Tooth",
  "Sock",
  "Shovel",
  "Eyebrow",
  "Grave",
  "Turnip",
  "Elbow",
  "Bucket",
  "Whistle",
  "Moustache",
  "Boot",
];

const TITLE_SUFFIXES = [
  "of Regret",
  "of the Basement",
  "of Mild Panic",
  "of Questionable Wisdom",
  "of Wet Doom",
  "of No Refunds",
  "of Broken Monday",
  "of the Third Toe",
  "of Loud Silence",
  "of Unpaid Taxes",
];

const WEIRD_TITLES = [
  "Who Bites Furniture",
  "the Collector of Left Boots",
  "the Unexpected",
  "the Moist Menace",
  "the Unlicensed",
  "the Very Unhelpful",
  "the One With the Shovel",
  "the Formerly Acceptable",
  "the Loud Kneecap",
];

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const chance = (value: number): boolean => Math.random() < value;

const buildAbsurdTitle = (): string => {
  const mode = Math.floor(Math.random() * 4);

  switch (mode) {
    case 0:
      return `the ${pick(TITLE_PREFIXES)} ${pick(TITLE_NOUNS)}`;
    case 1:
      return `the ${pick(TITLE_PREFIXES)} ${pick(TITLE_NOUNS)} ${pick(TITLE_SUFFIXES)}`;
    case 2:
      return pick(WEIRD_TITLES);
    case 3:
    default:
      return `the ${pick(TITLE_PREFIXES)} ${pick(TITLE_NOUNS)} ${pick(TITLE_SUFFIXES)} and ${pick(
        TITLE_NOUNS,
      )}`;
  }
};

export const generateEnemyName = (type: string): string => {
  const pool = NAME_POOLS[type];
  if (!pool) return type;

  const baseName = pick(pool);

  if (chance(0.1)) {
    return `${baseName} the ${type}`;
  }

  return `${baseName} ${buildAbsurdTitle()}`;
};
