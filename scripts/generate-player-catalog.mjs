import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const DEFAULT_PORTRAIT_URL = '/assets/portraits/default.png';
const CATALOG_DIR = 'src/domains/shared/registry';
const NAME_POOL_PATH = 'scripts/data/player-name-pool.json';

const FIELD_STAT_KEYS = [
  'tackling',
  'marking',
  'positioning',
  'passing',
  'vision',
  'clearance',
  'technique',
  'dribbling',
  'pace',
  'acceleration',
  'stamina',
  'power',
  'duels',
  'heading',
  'shooting',
  'finishing',
  'composure',
];

const GOALKEEPER_STAT_KEYS = [
  'lineSaving',
  'reflexes',
  'diving',
  'oneOnOne',
  'aerialClaim',
  'cornerClaim',
  'handDistribution',
  'kicking',
  'positioning',
  'communication',
  'composure',
];

const POSITIONS = [
  'GK',
  'LB',
  'CB',
  'RB',
  'LWB',
  'RWB',
  'CDM',
  'CM',
  'CAM',
  'LM',
  'RM',
  'LW',
  'RW',
  'ST',
  'CF',
];

const POSITION_WEIGHTS = [
  ['GK', 0.08],
  ['CB', 0.14],
  ['LB', 0.06],
  ['RB', 0.06],
  ['LWB', 0.03],
  ['RWB', 0.03],
  ['CDM', 0.08],
  ['CM', 0.12],
  ['CAM', 0.08],
  ['LM', 0.04],
  ['RM', 0.04],
  ['LW', 0.07],
  ['RW', 0.07],
  ['ST', 0.08],
  ['CF', 0.02],
];

const COMPATIBLE_POSITIONS = {
  GK: [],
  LB: ['LWB', 'CB', 'LM'],
  CB: ['LB', 'RB', 'CDM'],
  RB: ['RWB', 'CB', 'RM'],
  LWB: ['LB', 'LM', 'LW'],
  RWB: ['RB', 'RM', 'RW'],
  CDM: ['CM', 'CB'],
  CM: ['CDM', 'CAM', 'LM', 'RM'],
  CAM: ['CM', 'CF', 'LW', 'RW'],
  LM: ['LW', 'LWB', 'CM'],
  RM: ['RW', 'RWB', 'CM'],
  LW: ['LM', 'ST', 'CF', 'RW'],
  RW: ['RM', 'ST', 'CF', 'LW'],
  ST: ['CF', 'LW', 'RW'],
  CF: ['ST', 'CAM', 'LW', 'RW'],
};

const POSITION_ARCHETYPES = {
  GK: {
    core: ['lineSaving', 'reflexes', 'diving', 'oneOnOne', 'positioning'],
    support: ['aerialClaim', 'cornerClaim', 'communication', 'composure'],
    weak: ['handDistribution', 'kicking'],
  },
  CB: {
    core: ['tackling', 'marking', 'positioning', 'clearance', 'duels', 'heading'],
    support: ['power', 'stamina', 'composure', 'passing'],
    weak: ['dribbling', 'shooting', 'finishing', 'vision', 'technique', 'pace', 'acceleration'],
  },
  LB: {
    core: ['tackling', 'marking', 'pace', 'acceleration', 'stamina'],
    support: ['positioning', 'passing', 'dribbling', 'clearance', 'duels', 'technique'],
    weak: ['shooting', 'finishing', 'heading', 'vision', 'power', 'composure'],
  },
  RB: {
    core: ['tackling', 'marking', 'pace', 'acceleration', 'stamina'],
    support: ['positioning', 'passing', 'dribbling', 'clearance', 'duels', 'technique'],
    weak: ['shooting', 'finishing', 'heading', 'vision', 'power', 'composure'],
  },
  LWB: {
    core: ['pace', 'acceleration', 'stamina', 'dribbling', 'passing'],
    support: ['tackling', 'marking', 'positioning', 'technique', 'vision'],
    weak: ['clearance', 'heading', 'shooting', 'finishing', 'power', 'duels', 'composure'],
  },
  RWB: {
    core: ['pace', 'acceleration', 'stamina', 'dribbling', 'passing'],
    support: ['tackling', 'marking', 'positioning', 'technique', 'vision'],
    weak: ['clearance', 'heading', 'shooting', 'finishing', 'power', 'duels', 'composure'],
  },
  CDM: {
    core: ['tackling', 'marking', 'positioning', 'passing', 'stamina', 'duels'],
    support: ['vision', 'clearance', 'power', 'composure', 'technique'],
    weak: ['dribbling', 'pace', 'acceleration', 'heading', 'shooting', 'finishing'],
  },
  CM: {
    core: ['passing', 'vision', 'stamina', 'technique', 'positioning'],
    support: ['tackling', 'marking', 'dribbling', 'pace', 'composure', 'duels'],
    weak: ['clearance', 'heading', 'shooting', 'finishing', 'power', 'acceleration'],
  },
  CAM: {
    core: ['passing', 'vision', 'technique', 'dribbling', 'positioning', 'composure'],
    support: ['pace', 'acceleration', 'shooting', 'finishing', 'stamina'],
    weak: ['tackling', 'marking', 'clearance', 'heading', 'power', 'duels'],
  },
  LM: {
    core: ['pace', 'acceleration', 'dribbling', 'passing', 'stamina'],
    support: ['technique', 'vision', 'positioning', 'shooting'],
    weak: ['tackling', 'marking', 'clearance', 'heading', 'power', 'duels', 'finishing', 'composure'],
  },
  RM: {
    core: ['pace', 'acceleration', 'dribbling', 'passing', 'stamina'],
    support: ['technique', 'vision', 'positioning', 'shooting'],
    weak: ['tackling', 'marking', 'clearance', 'heading', 'power', 'duels', 'finishing', 'composure'],
  },
  LW: {
    core: ['pace', 'acceleration', 'dribbling', 'technique', 'finishing'],
    support: ['shooting', 'passing', 'vision', 'positioning', 'composure'],
    weak: ['tackling', 'marking', 'clearance', 'heading', 'power', 'duels', 'stamina'],
  },
  RW: {
    core: ['pace', 'acceleration', 'dribbling', 'technique', 'finishing'],
    support: ['shooting', 'passing', 'vision', 'positioning', 'composure'],
    weak: ['tackling', 'marking', 'clearance', 'heading', 'power', 'duels', 'stamina'],
  },
  ST: {
    core: ['positioning', 'shooting', 'finishing', 'composure', 'power'],
    support: ['pace', 'acceleration', 'heading', 'duels', 'technique'],
    weak: ['tackling', 'marking', 'clearance', 'passing', 'vision', 'dribbling', 'stamina'],
  },
  CF: {
    core: ['positioning', 'shooting', 'finishing', 'technique', 'composure'],
    support: ['passing', 'vision', 'dribbling', 'pace', 'acceleration'],
    weak: ['tackling', 'marking', 'clearance', 'heading', 'power', 'duels', 'stamina'],
  },
};

const DIVISION_OVERALL_RANGES = {
  1: [76, 96],
  2: [56, 78],
  3: [35, 58],
  4: [12, 36],
};

const DIVISION_COST_MULTIPLIERS = {
  1: 9.5,
  2: 4.2,
  3: 1.9,
  4: 1,
};

const RARITY_CONFIG = {
  Common: {
    weight: 0.66,
    range: [0.0, 0.44],
    secondaryMin: 0,
    secondaryMax: 1,
    potentialBonus: [4, 14],
    costMultiplier: 1,
    xpMultiplier: [1.0, 1.05],
  },
  Rare: {
    weight: 0.24,
    range: [0.4, 0.7],
    secondaryMin: 1,
    secondaryMax: 2,
    potentialBonus: [9, 20],
    costMultiplier: 1.75,
    xpMultiplier: [1.04, 1.14],
  },
  Epic: {
    weight: 0.08,
    range: [0.66, 0.89],
    secondaryMin: 2,
    secondaryMax: 3,
    potentialBonus: [14, 26],
    costMultiplier: 3.2,
    xpMultiplier: [1.1, 1.22],
  },
  Legendary: {
    weight: 0.02,
    range: [0.84, 1.0],
    secondaryMin: 3,
    secondaryMax: 4,
    potentialBonus: [18, 32],
    costMultiplier: 5.4,
    xpMultiplier: [1.18, 1.32],
  },
};

const SYSTEMS = ['4-4-2', '4-3-3', '3-5-2', '5-3-2', '4-2-3-1'];

function parseArgs(argv) {
  const args = {
    division: 4,
    count: 500,
    seed: 5004,
    out: '',
    names: NAME_POOL_PATH,
  };
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }

    const [rawKey, rawValue] = arg.slice(2).split('=');
    const value = rawValue ?? argv[index + 1];
    if (rawValue === undefined) {
      index += 1;
    }

    if (rawKey in args) {
      args[rawKey] = ['division', 'count', 'seed'].includes(rawKey) ? Number(value) : value;
    }
  }

  if (positional[0] !== undefined) {
    args.division = Number(positional[0]);
  }

  if (positional[1] !== undefined) {
    args.count = Number(positional[1]);
  }

  if (positional[2] !== undefined) {
    args.seed = Number(positional[2]);
  }

  if (!Number.isInteger(args.division) || args.division < 1 || args.division > 4) {
    throw new Error('--division must be an integer between 1 and 4.');
  }

  if (!Number.isInteger(args.count) || args.count < 1) {
    throw new Error('--count must be a positive integer.');
  }

  if (!Number.isInteger(args.seed)) {
    throw new Error('--seed must be an integer.');
  }

  return args;
}

function outputPathFor(args) {
  return args.out || `${CATALOG_DIR}/PlayerCatalog.d${args.division}.ts`;
}

function createPrng(seed) {
  return () => {
    let state = (seed += 0x6d2b79f5);
    state = Math.imul(state ^ (state >>> 15), state | 1);
    state ^= state + Math.imul(state ^ (state >>> 7), state | 61);
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInt(prng, min, max) {
  return Math.floor(prng() * (max - min + 1)) + min;
}

function pickWeighted(prng, entries) {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = prng() * total;

  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll <= 0) {
      return value;
    }
  }

  return entries.at(-1)[0];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function shuffle(prng, values) {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(prng() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
}

function loadNamePool(path) {
  const fullPath = resolve(projectRoot, path);
  const data = JSON.parse(readFileSync(fullPath, 'utf8'));

  if (!Array.isArray(data.firstNames) || !Array.isArray(data.lastNames)) {
    throw new Error(`${path} must expose firstNames and lastNames arrays.`);
  }

  return data;
}

function buildUniqueNames(prng, namePool, count, excludedNames = new Set()) {
  const combinations = [];

  for (const firstName of namePool.firstNames) {
    for (const lastName of namePool.lastNames) {
      const fullName = `${firstName} ${lastName}`;
      if (!excludedNames.has(fullName)) {
        combinations.push(fullName);
      }
    }
  }

  if (combinations.length < count) {
    throw new Error(`Name pool only has ${combinations.length} unused full names, but ${count} new players were requested.`);
  }

  return shuffle(prng, combinations).slice(0, count);
}

function pickRarity(prng) {
  return pickWeighted(prng, Object.entries(RARITY_CONFIG).map(([rarity, config]) => [rarity, config.weight]));
}

function overallFor(prng, division, rarity) {
  const [divisionMin, divisionMax] = DIVISION_OVERALL_RANGES[division];
  const [rarityMinRatio, rarityMaxRatio] = RARITY_CONFIG[rarity].range;
  const min = Math.round(divisionMin + (divisionMax - divisionMin) * rarityMinRatio);
  const max = Math.round(divisionMin + (divisionMax - divisionMin) * rarityMaxRatio);

  return randomInt(prng, min, max);
}

function statValue(prng, overall, tier) {
  const ranges = {
    core: [overall + 4, overall + 15],
    support: [overall - 5, overall + 8],
    weak: [overall - 18, overall - 4],
  };
  const [min, max] = ranges[tier];

  return clamp(randomInt(prng, min, max), 1, 99);
}

function tierForStat(archetype, key) {
  if (archetype.core.includes(key)) {
    return 'core';
  }
  if (archetype.support.includes(key)) {
    return 'support';
  }
  return 'weak';
}

function buildStats(prng, position, overall) {
  const archetype = POSITION_ARCHETYPES[position];
  const statKeys = position === 'GK' ? GOALKEEPER_STAT_KEYS : FIELD_STAT_KEYS;
  const stats = {};

  for (const key of statKeys) {
    stats[key] = statValue(prng, overall, tierForStat(archetype, key));
  }

  return stats;
}

function pickSecondaryPositions(prng, position, rarity) {
  const compatible = COMPATIBLE_POSITIONS[position].filter((candidate) => POSITIONS.includes(candidate));
  if (compatible.length === 0) {
    return [];
  }

  const config = RARITY_CONFIG[rarity];
  const max = Math.min(config.secondaryMax, compatible.length);
  const min = Math.min(config.secondaryMin, max);
  const count = randomInt(prng, min, max);

  return shuffle(prng, compatible).slice(0, count);
}

function prestigeValueFor(prng, division, rarity, overall, potential) {
  const rarityConfig = RARITY_CONFIG[rarity];
  const divisionMultiplier = DIVISION_COST_MULTIPLIERS[division];
  const qualityFactor = overall * overall * 4.8 + potential * 24;
  const noise = 0.93 + prng() * 0.14;
  const raw = qualityFactor * rarityConfig.costMultiplier * divisionMultiplier * noise;

  return Math.round(raw / 50) * 50;
}

function buildPlayer(prng, division, index, name, existingCatalogIds = new Set()) {
  const rarity = pickRarity(prng);
  const mainPosition = pickWeighted(prng, POSITION_WEIGHTS);
  const overallRating = overallFor(prng, division, rarity);
  const [potentialMin, potentialMax] = RARITY_CONFIG[rarity].potentialBonus;
  const [xpMin, xpMax] = RARITY_CONFIG[rarity].xpMultiplier;
  const potential = clamp(overallRating + randomInt(prng, potentialMin, potentialMax), overallRating, 99);

  let catalogIndex = index;
  let catalogId = `d${division}_${String(catalogIndex).padStart(3, '0')}_${mainPosition.toLowerCase()}`;
  while (existingCatalogIds.has(catalogId)) {
    catalogIndex += 1;
    catalogId = `d${division}_${String(catalogIndex).padStart(3, '0')}_${mainPosition.toLowerCase()}`;
  }
  existingCatalogIds.add(catalogId);

  return {
    catalogId,
    name,
    division,
    rarity,
    mainPosition,
    secondaryPositions: pickSecondaryPositions(prng, mainPosition, rarity),
    overallRating,
    stats: buildStats(prng, mainPosition, overallRating),
    xpGainMultiplier: Number((xpMin + prng() * (xpMax - xpMin)).toFixed(2)),
    potential,
    age: randomInt(prng, 18, 34),
    preferredSystem: SYSTEMS[randomInt(prng, 0, SYSTEMS.length - 1)],
    prestigeValue: prestigeValueFor(prng, division, rarity, overallRating, potential),
    portraitUrl: DEFAULT_PORTRAIT_URL,
  };
}

function formatArray(values) {
  return `[${values.map((value) => `'${value}'`).join(', ')}]`;
}

function formatStats(stats) {
  return Object.entries(stats)
    .map(([key, value]) => `            ${key}: ${value}`)
    .join(',\n');
}

function formatPlayer(player) {
  const statsType = player.mainPosition === 'GK' ? 'GoalkeeperStats' : 'FieldPlayerStats';

  return `    {
        catalogId: '${player.catalogId}',
        name: '${player.name.replaceAll("'", "\\'")}',
        division: ${player.division},
        rarity: '${player.rarity}',
        mainPosition: '${player.mainPosition}',
        secondaryPositions: ${formatArray(player.secondaryPositions)},
        overallRating: ${player.overallRating},
        stats: {
${formatStats(player.stats)}
        } as ${statsType},
        xpGainMultiplier: ${player.xpGainMultiplier.toFixed(2)},
        potential: ${player.potential},
        age: ${player.age},
        preferredSystem: '${player.preferredSystem}',
        prestigeValue: ${player.prestigeValue},
        portraitUrl: '${player.portraitUrl}'
    }`;
}

function extractExistingPlayerBlocks(content) {
  const arrayStart = content.indexOf('export const');
  if (arrayStart === -1) {
    return [];
  }

  const openBracket = content.indexOf('[', arrayStart);
  if (openBracket === -1) {
    return [];
  }

  const blocks = [];
  let depth = 0;
  let blockStart = -1;

  for (let index = openBracket + 1; index < content.length; index += 1) {
    const char = content[index];

    if (char === '{') {
      if (depth === 0) {
        blockStart = index;
      }
      depth += 1;
    }

    if (char === '}') {
      depth -= 1;
      if (depth === 0 && blockStart !== -1) {
        blocks.push(content.slice(blockStart, index + 1));
        blockStart = -1;
      }
    }

    if (depth < 0) {
      throw new Error('Existing catalog file has unbalanced object braces.');
    }
  }

  return blocks;
}

function parseExistingPlayer(block) {
  const catalogId = block.match(/catalogId: '([^']+)'/)?.[1];
  const name = block.match(/name: '((?:\\'|[^'])+)'/)?.[1]?.replaceAll("\\'", "'");
  const division = Number(block.match(/division: ([0-9]+),/)?.[1]);

  if (!catalogId || !name || !Number.isInteger(division)) {
    throw new Error(`Unable to parse existing catalog player block:\n${block.slice(0, 160)}`);
  }

  return { catalogId, name, division, block };
}

function loadExistingPlayers(outputPath) {
  const fullPath = resolve(projectRoot, outputPath);
  if (!existsSync(fullPath)) {
    return [];
  }

  return extractExistingPlayerBlocks(readFileSync(fullPath, 'utf8')).map(parseExistingPlayer);
}

function assertUniqueExistingPlayers(existingPlayers) {
  for (const key of ['catalogId', 'name']) {
    const seen = new Set();
    const duplicates = new Set();

    for (const player of existingPlayers) {
      if (seen.has(player[key])) {
        duplicates.add(player[key]);
      }
      seen.add(player[key]);
    }

    if (duplicates.size > 0) {
      throw new Error(`Existing catalog contains duplicate ${key} values: ${[...duplicates].join(', ')}`);
    }
  }
}

function nextCatalogIndex(existingPlayers, division) {
  const indexes = existingPlayers
    .map((player) => player.catalogId.match(new RegExp(`^d${division}_([0-9]+)_`))?.[1])
    .filter(Boolean)
    .map(Number);

  return indexes.length === 0 ? 1 : Math.max(...indexes) + 1;
}

function renderCatalog(existingPlayers, newPlayers, args) {
  const existingBlocks = existingPlayers.map((player) => player.block.trimEnd());
  const newBlocks = newPlayers.map(formatPlayer);
  const blocks = [...existingBlocks, ...newBlocks];
  const exportName = `PLAYER_CATALOG_D${args.division}`;

  return `import type { FieldPlayerStats, GoalkeeperStats } from '../schemas/EntitySchemas';
import type { CatalogPlayer } from './PlayerCatalog.types';

// Generated by scripts/generate-player-catalog.mjs
// Ensures the requested division has at least the requested number of players.
// Existing catalog entries are preserved; only missing players are appended.
// Command: node scripts/generate-player-catalog.mjs --division ${args.division} --count ${args.count} --seed ${args.seed}
// npm equivalent: npm run catalog:players -- ${args.division} ${args.count} ${args.seed}
// Do not edit entries manually; update the generator or scripts/data/player-name-pool.json instead.
export const ${exportName}: CatalogPlayer[] = [
${blocks.join(',\n')}
];
`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const outputPath = outputPathFor(args);
  const prng = createPrng(args.seed);
  const namePool = loadNamePool(args.names);
  const existingPlayers = loadExistingPlayers(outputPath);
  assertUniqueExistingPlayers(existingPlayers);

  const existingNames = new Set(existingPlayers.map((player) => player.name));
  const existingCatalogIds = new Set(existingPlayers.map((player) => player.catalogId));
  const existingDivisionCount = existingPlayers.filter((player) => player.division === args.division).length;
  const missingCount = Math.max(0, args.count - existingDivisionCount);
  const names = buildUniqueNames(prng, namePool, missingCount, existingNames);
  const startIndex = nextCatalogIndex(existingPlayers, args.division);
  const players = names.map((name, index) => buildPlayer(prng, args.division, startIndex + index, name, existingCatalogIds));
  const content = renderCatalog(existingPlayers, players, args);
  const outPath = resolve(projectRoot, outputPath);

  writeFileSync(outPath, content, 'utf8');
  console.log(`Division ${args.division}: preserved ${existingDivisionCount}, added ${players.length}, target ${args.count}.`);
  console.log(`Catalog now contains ${existingPlayers.length + players.length} players in ${outputPath}`);
}

main();
