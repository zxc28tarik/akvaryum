import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import Ajv2020 from 'ajv/dist/2020.js';

import { loadLegacyData } from './load-legacy-data.mjs';

function formatAjvErrors(errors = []) {
  return errors
    .slice(0, 30)
    .map((error) => {
      const path = error.instancePath || '/';
      return `${path}: ${error.message}`;
    })
    .join('\n');
}

function assertOrderedRange(range, label) {
  if (range[0] > range[1]) {
    throw new Error(`${label}: alt değer ${range[0]}, üst değer ${range[1]} değerinden büyük.`);
  }
}

function assertUniqueIds(collections) {
  const seen = new Map();

  for (const [collectionName, records] of Object.entries(collections)) {
    for (const record of records) {
      if (seen.has(record.id)) {
        throw new Error(
          `Tekrarlanan kimlik: ${record.id} (${seen.get(record.id)} ve ${collectionName})`,
        );
      }
      seen.set(record.id, collectionName);
    }
  }
}

export function validateRepositoryData(repositoryRoot) {
  const schemaPath = resolve(repositoryRoot, 'schemas/akvaryum.schema.json');
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
  const data = loadLegacyData(repositoryRoot);

  const dataset = {
    fish: data.fish,
    plants: data.plants,
    substrates: data.substrates,
    tankPresets: data.tankPresets,
  };

  const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false });
  const validate = ajv.compile(schema);

  if (!validate(dataset)) {
    throw new Error(`AKVARYUM veri şeması doğrulanamadı:\n${formatAjvErrors(validate.errors)}`);
  }

  assertUniqueIds({
    fish: data.fish,
    plants: data.plants,
    substrates: data.substrates,
    tankPresets: data.tankPresets,
  });

  for (const fish of data.fish) {
    assertOrderedRange(fish.pH, `${fish.id}.pH`);
    assertOrderedRange(fish.temp, `${fish.id}.temp`);
    assertOrderedRange(fish.gh, `${fish.id}.gh`);
    if (fish.salinity) assertOrderedRange(fish.salinity, `${fish.id}.salinity`);
  }

  return {
    schemaVersion: 1,
    fish: data.fish.length,
    plants: data.plants.length,
    substrates: data.substrates.length,
    tankPresets: data.tankPresets.length,
    totalEntities:
      data.fish.length +
      data.plants.length +
      data.substrates.length +
      data.tankPresets.length,
    uniqueIds: true,
    orderedRanges: true,
  };
}
