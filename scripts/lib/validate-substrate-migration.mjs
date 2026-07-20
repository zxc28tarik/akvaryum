import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import Ajv2020 from 'ajv/dist/2020.js';

import {
  migrateLegacySubstrates,
  SUBSTRATE_MIGRATION_SOURCE_ID,
} from '../../data/migration/legacy-to-substrate.mjs';
import { loadLegacyData } from './load-legacy-data.mjs';

const EXPECTED_TOTAL = 8;
const EXPECTED_CATEGORY_COUNTS = Object.freeze({ sand: 5, gravel: 1, soil: 1, rock: 1 });
const EXPECTED_PH_COUNTS = Object.freeze({ lower: 1, neutral: 4, raise: 3 });
const EXPECTED_BUFFERING_COUNTS = Object.freeze({ active: 4, inactive: 4 });
const EXPECTED_PLANT_FRIENDLY_COUNTS = Object.freeze({ true: 2, false: 6 });
const EXPECTED_WATER_COUNTS = Object.freeze({ fresh: 5, salt: 4 });
const EXPECTED_UNKNOWN_FIELDS = Object.freeze([
  'grainSizeMm', 'targetPH', 'khEffect', 'ghEffect', 'nutrientRich',
  'burrowFriendly', 'bottomFishSafe', 'sharpnessRisk',
  'recommendedDepthCm', 'replacementMonths', 'bestFor', 'avoidFor',
]);
const PH_EFFECT_MAP = Object.freeze({ low: 'lower', neutral: 'neutral', high: 'raise' });
const CATEGORY_BY_ID = Object.freeze({
  'fine-sand': 'sand', aragonite: 'sand', 'crushed-coral': 'sand',
  gravel: 'gravel', 'aqua-soil': 'soil', 'black-sand': 'sand',
  'lava-rock': 'rock', 'live-sand': 'sand',
});
const MATERIAL_BY_ID = Object.freeze({
  'fine-sand': 'fine_sand', aragonite: 'aragonite', 'crushed-coral': 'crushed_coral',
  gravel: 'aquarium_gravel', 'aqua-soil': 'aqua_soil', 'black-sand': 'black_sand',
  'lava-rock': 'lava_rock', 'live-sand': 'live_sand',
});

function formatAjvErrors(errors = []) {
  return errors
    .slice(0, 50)
    .map((error) => `${error.instancePath || '/'}: ${error.message}`)
    .join('\n');
}

function sameArray(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function sameSet(left, right) {
  return left.length === right.length && left.every((value) => right.includes(value));
}

function increment(target, key) {
  target[key] = (target[key] ?? 0) + 1;
}

function assertCounts(label, actual, expected) {
  for (const [key, expectedValue] of Object.entries(expected)) {
    const actualValue = actual[key] ?? 0;
    if (actualValue !== expectedValue) {
      throw new Error(`${label}.${key}=${actualValue}; ${expectedValue} bekleniyordu.`);
    }
  }
}

export function validateSubstrateMigration(repositoryRoot) {
  const data = loadLegacyData(repositoryRoot, { withProvenance: true });
  const legacySubstrates = data.substrates;
  const substrates = migrateLegacySubstrates(legacySubstrates);

  if (legacySubstrates.length !== EXPECTED_TOTAL || substrates.length !== EXPECTED_TOTAL) {
    throw new Error(`Taban migrasyonu ${legacySubstrates.length} → ${substrates.length}; ${EXPECTED_TOTAL} → ${EXPECTED_TOTAL} bekleniyordu.`);
  }

  const schema = JSON.parse(
    readFileSync(resolve(repositoryRoot, 'schemas/substrate-v1.schema.json'), 'utf8'),
  );
  const validate = new Ajv2020({ allErrors: true, strict: true }).compile(schema);
  if (!validate(substrates)) {
    throw new Error(`Substrate v1 şeması geçmedi:\n${formatAjvErrors(validate.errors)}`);
  }

  const legacyIds = new Set(legacySubstrates.map((record) => record.id));
  const migratedIds = new Set(substrates.map((record) => record.id));
  if (legacyIds.size !== EXPECTED_TOTAL || migratedIds.size !== EXPECTED_TOTAL) {
    throw new Error('Taban kimlikleri benzersiz değil.');
  }
  for (const id of legacyIds) {
    if (!migratedIds.has(id)) throw new Error(`${id}: Substrate v1 kaydı kayıp.`);
  }

  const sourceById = new Map(data.sources.map((source) => [source.id, source]));
  if (!sourceById.has(SUBSTRATE_MIGRATION_SOURCE_ID)) {
    throw new Error(`${SUBSTRATE_MIGRATION_SOURCE_ID} kaynak kataloğunda yok.`);
  }

  const byId = new Map(substrates.map((record) => [record.id, record]));
  const categoryCounts = {};
  const phEffectCounts = {};
  const bufferingCounts = {};
  const plantFriendlyCounts = {};
  const waterTypeCounts = {};
  let preservedIds = 0;
  let preservedDirectValues = 0;
  let unknownFieldMarkers = 0;

  for (const legacy of legacySubstrates) {
    const substrate = byId.get(legacy.id);
    if (!substrate) throw new Error(`${legacy.id}: migrate edilmiş taban bulunamadı.`);
    preservedIds += 1;

    const comparisons = [
      ['id', substrate.id, legacy.id],
      ['name.tr', substrate.name.tr, legacy.tr],
      ['name.en', substrate.name.en, legacy.en],
      ['summary.tr', substrate.summary.tr, legacy.desc],
      ['summary.en', substrate.summary.en, legacy.descEn],
      ['waterTypes', JSON.stringify(substrate.waterTypes), JSON.stringify(legacy.water)],
      ['phEffect', substrate.phEffect, PH_EFFECT_MAP[legacy.ph]],
      ['plantFriendly', substrate.plantFriendly, legacy.plantFriendly],
      ['appearance.color', substrate.appearance.color, legacy.color],
    ];
    for (const [field, actual, expected] of comparisons) {
      if (actual !== expected) {
        throw new Error(`${legacy.id}.${field}=${actual}; ${expected} bekleniyordu.`);
      }
      preservedDirectValues += 1;
    }

    if (substrate.category !== CATEGORY_BY_ID[legacy.id]
      || substrate.material !== MATERIAL_BY_ID[legacy.id]) {
      throw new Error(`${legacy.id}: kategori veya malzeme eşlemesi hatalı.`);
    }
    if (substrate.activeBuffering !== (legacy.ph !== 'neutral')) {
      throw new Error(`${legacy.id}: aktif tamponlama eşlemesi hatalı.`);
    }
    if (substrate.entityType !== 'substrate' || substrate.status !== 'needs_update') {
      throw new Error(`${legacy.id}: Substrate v1 türü veya durumu hatalı.`);
    }

    if (substrate.grainSizeMm !== null || substrate.targetPH !== null
      || substrate.khEffect !== 'unknown' || substrate.ghEffect !== 'unknown'
      || substrate.nutrientRich !== null || substrate.burrowFriendly !== null
      || substrate.bottomFishSafe !== null || substrate.sharpnessRisk !== 'unknown'
      || substrate.recommendedDepthCm !== null || substrate.replacementMonths !== null
      || substrate.bestFor.length !== 0 || substrate.avoidFor.length !== 0) {
      throw new Error(`${legacy.id}: eski veride olmayan taban alanlarından biri uyduruldu.`);
    }
    if (!sameSet(substrate.migration.unknownFields, EXPECTED_UNKNOWN_FIELDS)) {
      throw new Error(`${legacy.id}: unknownFields listesi güncel değil.`);
    }
    unknownFieldMarkers += substrate.migration.unknownFields.length;

    if (!substrate.sourceIds.includes('legacy-substrate-dataset-v1')
      || !substrate.sourceIds.includes(SUBSTRATE_MIGRATION_SOURCE_ID)) {
      throw new Error(`${legacy.id}: taban kaynak kimlikleri eksik.`);
    }
    for (const [field, sourceIds] of Object.entries(substrate.fieldSourceIds)) {
      for (const sourceId of sourceIds) {
        const source = sourceById.get(sourceId);
        if (!source) throw new Error(`${legacy.id}.${field}: bilinmeyen kaynak ${sourceId}.`);
        if (!substrate.sourceIds.includes(sourceId)) {
          throw new Error(`${legacy.id}.${field}: ${sourceId} record.sourceIds içinde yok.`);
        }
        if (!source.fields.includes(field)) {
          throw new Error(`${legacy.id}.${field}: ${sourceId} bu alanı desteklemiyor.`);
        }
      }
    }
    if (substrate.verification.status !== 'needs_review'
      || substrate.verification.confidence !== 'low') {
      throw new Error(`${legacy.id}: migrate taban yanlışlıkla doğrulanmış sayıldı.`);
    }

    increment(categoryCounts, substrate.category);
    increment(phEffectCounts, substrate.phEffect);
    increment(bufferingCounts, substrate.activeBuffering ? 'active' : 'inactive');
    increment(plantFriendlyCounts, String(substrate.plantFriendly));
    for (const waterType of substrate.waterTypes) increment(waterTypeCounts, waterType);
  }

  assertCounts('categoryCounts', categoryCounts, EXPECTED_CATEGORY_COUNTS);
  assertCounts('phEffectCounts', phEffectCounts, EXPECTED_PH_COUNTS);
  assertCounts('bufferingCounts', bufferingCounts, EXPECTED_BUFFERING_COUNTS);
  assertCounts('plantFriendlyCounts', plantFriendlyCounts, EXPECTED_PLANT_FRIENDLY_COUNTS);
  assertCounts('waterTypeCounts', waterTypeCounts, EXPECTED_WATER_COUNTS);

  const report = JSON.parse(
    readFileSync(resolve(repositoryRoot, 'data/migration/substrate-migration-report.json'), 'utf8'),
  );
  if (report.program !== 'legacy-substrate-v1-to-substrate-v1'
    || report.legacyRecords !== EXPECTED_TOTAL
    || report.migratedRecords !== EXPECTED_TOTAL
    || report.preservedIds !== preservedIds
    || report.preservedDirectValues !== preservedDirectValues
    || report.unknownFieldMarkers !== unknownFieldMarkers
    || !sameArray(report.unknownFields ?? [], EXPECTED_UNKNOWN_FIELDS)) {
    throw new Error('Substrate v1 migrasyon raporu güncel değil.');
  }
  assertCounts('report.categoryCounts', report.categoryCounts ?? {}, categoryCounts);
  assertCounts('report.phEffectCounts', report.phEffectCounts ?? {}, phEffectCounts);
  assertCounts('report.bufferingCounts', report.bufferingCounts ?? {}, bufferingCounts);
  assertCounts('report.plantFriendlyCounts', report.plantFriendlyCounts ?? {}, plantFriendlyCounts);
  assertCounts('report.waterTypeCounts', report.waterTypeCounts ?? {}, waterTypeCounts);

  return {
    legacyRecords: legacySubstrates.length,
    migratedRecords: substrates.length,
    preservedIds,
    preservedDirectValues,
    unknownFieldMarkers,
    categoryCounts,
    phEffectCounts,
    bufferingCounts,
    plantFriendlyCounts,
    waterTypeCounts,
    sourceCatalogVersion: data.sourceCatalogVersion,
    externalReviewRequired: true,
  };
}
