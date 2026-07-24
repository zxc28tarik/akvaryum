import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadLegacyData } from './lib/load-legacy-data.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const data = loadLegacyData(repositoryRoot);
const ids = data.fish.map((item) => item.id);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

const expected = {
  fresh: 334,
  salt: 302,
  fish: 636,
  plants: 26,
  substrates: 8,
};

const actual = {
  fresh: data.fresh.length,
  salt: data.salt.length,
  fish: data.fish.length,
  plants: data.plants.length,
  substrates: data.substrates.length,
};

for (const [key, expectedCount] of Object.entries(expected)) {
  if (actual[key] !== expectedCount) {
    throw new Error(`${key}: ${actual[key]} kayıt bulundu, ${expectedCount} bekleniyordu.`);
  }
}

if (duplicateIds.length > 0) {
  throw new Error(`Tekrarlanan canlı kimlikleri: ${[...new Set(duplicateIds)].join(', ')}`);
}

if (typeof data.engine?.analyze !== 'function') {
  throw new Error('Engine.analyze yüklenemedi.');
}

console.log(JSON.stringify({ ...actual, preservedLegacyFreshwater: 278, batchFreshwater: 56, duplicateFishIds: 0 }, null, 2));
