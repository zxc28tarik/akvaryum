import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import Ajv2020 from 'ajv/dist/2020.js';

import {
  migrateLegacyPlants,
  PLANT_MIGRATION_SOURCE_ID,
} from '../../data/migration/legacy-to-plant.mjs';
import { loadLegacyData } from './load-legacy-data.mjs';

const EXPECTED_TOTAL = 26;
const DIFFICULTY_MAP = Object.freeze({
  easy: 'beginner',
  medium: 'intermediate',
  hard: 'advanced',
});
const PLACEMENT_MAP = Object.freeze({
  foreground: 'foreground',
  mid: 'midground',
  background: 'background',
  surface: 'floating',
});
const EXPECTED_UNKNOWN_FIELDS = Object.freeze([
  'water.temperatureC', 'water.pH', 'water.gh', 'growthRate',
  'nutrientDemand', 'rootFeeder', 'waterColumnFeeder', 'heightCm',
  'propagation', 'attachToHardscape',
]);

function formatAjvErrors(errors = []) {
  return errors
    .slice(0, 50)
    .map((error) => `${error.instancePath || '/'}: ${error.message}`)
    .join('\n');
}

function increment(target, key) {
  target[key] = (target[key] ?? 0) + 1;
}

function sameSet(left, right) {
  return left.length === right.length
    && left.every((value) => right.includes(value));
}

export function validatePlantMigration(repositoryRoot) {
  const data = loadLegacyData(repositoryRoot, { withProvenance: true });
  const legacyPlants = data.plants;
  const plants = migrateLegacyPlants(legacyPlants);

  if (legacyPlants.length !== EXPECTED_TOTAL || plants.length !== EXPECTED_TOTAL) {
    throw new Error(`Bitki migrasyonu ${legacyPlants.length} → ${plants.length}; ${EXPECTED_TOTAL} → ${EXPECTED_TOTAL} bekleniyordu.`);
  }

  const schema = JSON.parse(
    readFileSync(resolve(repositoryRoot, 'schemas/plant-v1.schema.json'), 'utf8'),
  );
  const validate = new Ajv2020({ allErrors: true, strict: true }).compile(schema);
  if (!validate(plants)) {
    throw new Error(`Plant v1 şeması geçmedi:\n${formatAjvErrors(validate.errors)}`);
  }

  const legacyIds = new Set(legacyPlants.map((record) => record.id));
  const migratedIds = new Set(plants.map((record) => record.id));
  if (legacyIds.size !== EXPECTED_TOTAL || migratedIds.size !== EXPECTED_TOTAL) {
    throw new Error('Bitki kimlikleri benzersiz değil.');
  }
  for (const id of legacyIds) {
    if (!migratedIds.has(id)) throw new Error(`${id}: Plant v1 kaydı kayıp.`);
  }

  const sourceById = new Map(data.sources.map((source) => [source.id, source]));
  const migrationSource = sourceById.get(PLANT_MIGRATION_SOURCE_ID);
  if (!migrationSource) throw new Error(`${PLANT_MIGRATION_SOURCE_ID} kaynak kataloğunda yok.`);

  const byId = new Map(plants.map((record) => [record.id, record]));
  const lightCounts = {};
  const co2Counts = {};
  const difficultyCounts = {};
  const categoryCounts = {};
  let preservedIds = 0;
  let preservedDirectValues = 0;
  let unknownFields = 0;

  for (const legacy of legacyPlants) {
    const plant = byId.get(legacy.id);
    if (!plant) throw new Error(`${legacy.id}: migrate edilmiş bitki bulunamadı.`);
    preservedIds += 1;

    const comparisons = [
      ['name.tr', plant.name.tr, legacy.tr],
      ['name.en', plant.name.en, legacy.en],
      ['scientificName', plant.scientificName, legacy.sci],
      ['light.min', plant.light.min, legacy.light],
      ['light.max', plant.light.max, legacy.light],
      ['co2Need', plant.co2Need, legacy.co2 ? 'required' : 'none'],
      ['difficulty', plant.difficulty, DIFFICULTY_MAP[legacy.difficulty]],
      ['category', plant.category, legacy.kind],
      ['placement', plant.placement[0], PLACEMENT_MAP[legacy.placement]],
      ['appearance.kind', plant.appearance.kind, legacy.kind],
      ['appearance.color', plant.appearance.color, legacy.color],
    ];
    for (const [field, actual, expected] of comparisons) {
      if (actual !== expected) {
        throw new Error(`${legacy.id}.${field}=${actual}; ${expected} bekleniyordu.`);
      }
      preservedDirectValues += 1;
    }

    if (plant.entityType !== 'aquatic_plant' || plant.status !== 'needs_update') {
      throw new Error(`${legacy.id}: Plant v1 türü veya durumu hatalı.`);
    }
    if (plant.water.temperatureC !== null || plant.water.pH !== null || plant.water.gh !== null) {
      throw new Error(`${legacy.id}: bilinmeyen su aralıklarına değer uyduruldu.`);
    }
    if (plant.growthRate !== 'unknown' || plant.nutrientDemand !== 'unknown'
      || plant.rootFeeder !== null || plant.waterColumnFeeder !== null
      || plant.heightCm !== null || plant.attachToHardscape !== null
      || plant.propagation.length !== 0) {
      throw new Error(`${legacy.id}: eski veride olmayan bitki alanlarından biri uyduruldu.`);
    }
    if (!sameSet(plant.migration.unknownFields, EXPECTED_UNKNOWN_FIELDS)) {
      throw new Error(`${legacy.id}: unknownFields listesi güncel değil.`);
    }
    unknownFields += plant.migration.unknownFields.length;

    if (!plant.sourceIds.includes('legacy-plant-dataset-v1')
      || !plant.sourceIds.includes(PLANT_MIGRATION_SOURCE_ID)) {
      throw new Error(`${legacy.id}: bitki kaynak kimlikleri eksik.`);
    }
    for (const [field, sourceIds] of Object.entries(plant.fieldSourceIds)) {
      for (const sourceId of sourceIds) {
        const source = sourceById.get(sourceId);
        if (!source) throw new Error(`${legacy.id}.${field}: bilinmeyen kaynak ${sourceId}.`);
        if (!plant.sourceIds.includes(sourceId)) {
          throw new Error(`${legacy.id}.${field}: ${sourceId} record.sourceIds içinde yok.`);
        }
        if (!source.fields.includes(field)) {
          throw new Error(`${legacy.id}.${field}: ${sourceId} bu alanı desteklemiyor.`);
        }
      }
    }
    if (plant.verification.status !== 'needs_review'
      || plant.verification.confidence !== 'low') {
      throw new Error(`${legacy.id}: migrate bitki yanlışlıkla doğrulanmış sayıldı.`);
    }

    increment(lightCounts, plant.light.min);
    increment(co2Counts, plant.co2Need);
    increment(difficultyCounts, plant.difficulty);
    increment(categoryCounts, plant.category);
  }

  const report = JSON.parse(
    readFileSync(resolve(repositoryRoot, 'data/migration/plant-migration-report.json'), 'utf8'),
  );
  if (report.program !== 'legacy-plant-v1-to-plant-v1'
    || report.legacyRecords !== EXPECTED_TOTAL
    || report.migratedRecords !== EXPECTED_TOTAL
    || report.preservedIds !== EXPECTED_TOTAL
    || !sameSet(report.unknownFields ?? [], EXPECTED_UNKNOWN_FIELDS)) {
    throw new Error('Plant v1 migrasyon raporu güncel kod ve kapsamla eşleşmiyor.');
  }

  return {
    legacyRecords: legacyPlants.length,
    migratedRecords: plants.length,
    preservedIds,
    preservedDirectValues,
    unknownFieldMarkers: unknownFields,
    lightCounts,
    co2Counts,
    difficultyCounts,
    categoryCounts,
    sourceCatalogVersion: data.sourceCatalogVersion,
    externalReviewRequired: true,
  };
}
