import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import Ajv2020 from 'ajv/dist/2020.js';

import {
  applyPriorityTankLength,
  derivePriorityTankLengthProfile,
  PRIORITY_TANK_LENGTH_PROGRAM,
  PRIORITY_TANK_LENGTH_SOURCE_ID,
  STANDARD_TANK_LENGTHS_CM,
} from '../../data/curation/priority-tank-length-v1.mjs';
import { PRIORITY_100_IDS } from '../../data/curation/priority-social-care-v1.mjs';
import { loadLegacyData } from './load-legacy-data.mjs';

const EXPECTED_TOTAL = 100;
const EXPECTED_LENGTH_COUNTS = Object.freeze({
  60: 9,
  75: 49,
  80: 2,
  90: 12,
  100: 12,
  120: 6,
  150: 5,
  180: 4,
  300: 1,
});
const EXPECTED_LIMITING_RULE_COUNTS = Object.freeze({
  volume: 81,
  body_length: 13,
  both: 6,
});
const EXPECTED_MOVEMENT_FACTOR_COUNTS = Object.freeze({
  1: 45,
  1.2: 55,
});

function sameArray(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function increment(target, key) {
  target[key] = (target[key] ?? 0) + 1;
}

function assertCounts(label, actual, expected) {
  const actualKeys = Object.keys(actual).sort();
  const expectedKeys = Object.keys(expected).sort();
  if (!sameArray(actualKeys, expectedKeys)) {
    throw new Error(`${label} anahtarları güncel raporla eşleşmiyor.`);
  }
  for (const [key, expectedValue] of Object.entries(expected)) {
    const actualValue = actual[key] ?? 0;
    if (actualValue !== expectedValue) {
      throw new Error(`${label}.${key}=${actualValue}; ${expectedValue} bekleniyordu.`);
    }
  }
}

function formatAjvErrors(errors = []) {
  return errors
    .slice(0, 50)
    .map((error) => `${error.instancePath || '/'}: ${error.message}`)
    .join('\n');
}

export function validatePriorityTankLength(repositoryRoot) {
  if (PRIORITY_100_IDS.length !== EXPECTED_TOTAL) {
    throw new Error(`Öncelik listesinde ${PRIORITY_100_IDS.length} kayıt var; ${EXPECTED_TOTAL} bekleniyordu.`);
  }
  if (new Set(PRIORITY_100_IDS).size !== EXPECTED_TOTAL) {
    throw new Error('Öncelik 100 listesinde tekrarlanan kimlik var.');
  }

  const data = loadLegacyData(repositoryRoot, {
    withProvenance: true,
    withMigration: true,
    withCatalog: false,
  });
  const source = data.sources.find((entry) => entry.id === PRIORITY_TANK_LENGTH_SOURCE_ID);
  if (!source) throw new Error(`${PRIORITY_TANK_LENGTH_SOURCE_ID} kaynak kataloğunda yok.`);
  if (!source.fields.includes('tank')) {
    throw new Error(`${PRIORITY_TANK_LENGTH_SOURCE_ID} tank alanını desteklemiyor.`);
  }

  const legacyPriorityIds = data.fish.slice(0, EXPECTED_TOTAL).map((record) => record.id);
  if (!sameArray(legacyPriorityIds, PRIORITY_100_IDS)) {
    throw new Error('Öncelik 100 listesi legacy katalog sırasının ilk 100 kaydıyla eşleşmiyor.');
  }

  const curated = applyPriorityTankLength(data.inhabitants);
  const schema = JSON.parse(
    readFileSync(resolve(repositoryRoot, 'schemas/inhabitant-v1.schema.json'), 'utf8'),
  );
  const validate = new Ajv2020({ allErrors: true, strict: true }).compile(schema);
  if (!validate(curated)) {
    throw new Error(`Tank uzunluğu sonrası Inhabitant v1 şeması geçmedi:\n${formatAjvErrors(validate.errors)}`);
  }

  const prioritySet = new Set(PRIORITY_100_IDS);
  const byId = new Map(curated.map((record) => [record.id, record]));
  const lengthCountsCm = {};
  const limitingRuleCounts = {};
  const movementFactorCounts = {};

  for (const [index, id] of PRIORITY_100_IDS.entries()) {
    const record = byId.get(id);
    if (!record) throw new Error(`${id}: Inhabitant v1 kaydı bulunamadı.`);
    const profile = derivePriorityTankLengthProfile(record);
    if (!profile || profile.priorityRank !== index + 1) {
      throw new Error(`${id}: öncelik sırası veya tank uzunluğu profili hatalı.`);
    }

    if (!(record.tank.minLengthCm > 0)) {
      throw new Error(`${id}: tank.minLengthCm tamamlanmadı.`);
    }
    if (record.tank.minLengthCm !== profile.minLengthCm) {
      throw new Error(`${id}: kayıt uzunluğu ile türetim profili uyuşmuyor.`);
    }
    if (!STANDARD_TANK_LENGTHS_CM.includes(record.tank.minLengthCm)
      && record.tank.minLengthCm % 50 !== 0) {
      throw new Error(`${id}: tank uzunluğu standart ölçüye yuvarlanmadı.`);
    }
    if (record.tank.minLengthCm < profile.volumeFloorCm
      || record.tank.minLengthCm < profile.bodyFloorCm) {
      throw new Error(`${id}: tank uzunluğu alt sınırlardan küçük.`);
    }
    if (!record.sourceIds.includes(PRIORITY_TANK_LENGTH_SOURCE_ID)) {
      throw new Error(`${id}: tank uzunluğu kaynak kimliği eksik.`);
    }
    if (!record.fieldSourceIds.tank?.includes(PRIORITY_TANK_LENGTH_SOURCE_ID)) {
      throw new Error(`${id}.tank: alan kaynak kimliği eksik.`);
    }
    if (record.migration.unknownFields.includes('tank.minLengthCm')) {
      throw new Error(`${id}: tamamlanan tank.minLengthCm hâlâ unknownFields içinde.`);
    }
    if (!record.migration.derivedFields.includes('tank.minLengthCm')) {
      throw new Error(`${id}: tank.minLengthCm derivedFields içinde yok.`);
    }
    if (record.verification.status !== 'needs_review'
      || record.verification.confidence !== 'low') {
      throw new Error(`${id}: türetilmiş tank uzunluğu yanlışlıkla doğrulanmış sayıldı.`);
    }

    increment(lengthCountsCm, String(record.tank.minLengthCm));
    increment(limitingRuleCounts, profile.limitingRule);
    increment(movementFactorCounts, String(profile.movementFactor));
  }

  for (const record of curated) {
    if (!prioritySet.has(record.id)) {
      if (record.tank.minLengthCm !== undefined) {
        throw new Error(`${record.id}: öncelik seti dışındaki kayda tank uzunluğu uygulandı.`);
      }
      if (record.sourceIds.includes(PRIORITY_TANK_LENGTH_SOURCE_ID)) {
        throw new Error(`${record.id}: öncelik seti dışındaki kayda tank uzunluğu kaynağı uygulandı.`);
      }
    }
  }

  assertCounts('lengthCountsCm', lengthCountsCm, EXPECTED_LENGTH_COUNTS);
  assertCounts('limitingRuleCounts', limitingRuleCounts, EXPECTED_LIMITING_RULE_COUNTS);
  assertCounts('movementFactorCounts', movementFactorCounts, EXPECTED_MOVEMENT_FACTOR_COUNTS);

  const report = JSON.parse(
    readFileSync(resolve(repositoryRoot, 'data/curation/priority-tank-length-report.json'), 'utf8'),
  );
  if (report.program !== PRIORITY_TANK_LENGTH_PROGRAM
    || report.recordCount !== EXPECTED_TOTAL
    || report.completedField !== 'tank.minLengthCm') {
    throw new Error('Öncelik 100 tank uzunluğu rapor başlığı veya kapsamı güncel değil.');
  }
  assertCounts('report.lengthCountsCm', report.lengthCountsCm ?? {}, lengthCountsCm);
  assertCounts('report.limitingRuleCounts', report.limitingRuleCounts ?? {}, limitingRuleCounts);
  assertCounts('report.movementFactorCounts', report.movementFactorCounts ?? {}, movementFactorCounts);

  return {
    program: PRIORITY_TANK_LENGTH_PROGRAM,
    recordCount: EXPECTED_TOTAL,
    completedTankLengths: EXPECTED_TOTAL,
    lengthCountsCm,
    limitingRuleCounts,
    movementFactorCounts,
    externalReviewRequired: true,
    selectionMethod: 'legacy_catalog_priority_order',
  };
}
