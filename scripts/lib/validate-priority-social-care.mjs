import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import Ajv2020 from 'ajv/dist/2020.js';

import {
  applyPrioritySocialCare,
  derivePrioritySocialCareProfile,
  PRIORITY_100_IDS,
  PRIORITY_SOCIAL_CARE_PROGRAM,
  PRIORITY_SOCIAL_CARE_SOURCE_ID,
} from '../../data/curation/priority-social-care-v1.mjs';
import { loadLegacyData } from './load-legacy-data.mjs';

const EXPECTED_TOTAL = 100;
const EXPECTED_DIFFICULTY_COUNTS = Object.freeze({
  beginner: 69,
  intermediate: 18,
  advanced: 5,
  expert: 8,
});
const EXPECTED_TERRITORIALITY_COUNTS = Object.freeze({
  none: 72,
  low: 0,
  medium: 19,
  high: 9,
});

function sameArray(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
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

function formatAjvErrors(errors = []) {
  return errors
    .slice(0, 50)
    .map((error) => `${error.instancePath || '/'}: ${error.message}`)
    .join('\n');
}

export function validatePrioritySocialCare(repositoryRoot) {
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
  const source = data.sources.find((entry) => entry.id === PRIORITY_SOCIAL_CARE_SOURCE_ID);
  if (!source) throw new Error(`${PRIORITY_SOCIAL_CARE_SOURCE_ID} kaynak kataloğunda yok.`);
  for (const field of ['social', 'care']) {
    if (!source.fields.includes(field)) {
      throw new Error(`${PRIORITY_SOCIAL_CARE_SOURCE_ID} ${field} alanını desteklemiyor.`);
    }
  }

  const legacyPriorityIds = data.fish.slice(0, EXPECTED_TOTAL).map((record) => record.id);
  if (!sameArray(legacyPriorityIds, PRIORITY_100_IDS)) {
    throw new Error('Öncelik 100 listesi legacy katalog sırasının ilk 100 kaydıyla eşleşmiyor.');
  }

  const curated = applyPrioritySocialCare(data.inhabitants);
  const schema = JSON.parse(
    readFileSync(resolve(repositoryRoot, 'schemas/inhabitant-v1.schema.json'), 'utf8'),
  );
  const validate = new Ajv2020({ allErrors: true, strict: true }).compile(schema);
  if (!validate(curated)) {
    throw new Error(`Öncelik 100 sonrası Inhabitant v1 şeması geçmedi:\n${formatAjvErrors(validate.errors)}`);
  }

  const prioritySet = new Set(PRIORITY_100_IDS);
  const byId = new Map(curated.map((record) => [record.id, record]));
  const difficultyCounts = {};
  const territorialityCounts = {};
  const reasonCounts = {};

  for (const [index, id] of PRIORITY_100_IDS.entries()) {
    const record = byId.get(id);
    if (!record) throw new Error(`${id}: Inhabitant v1 kaydı bulunamadı.`);
    const profile = derivePrioritySocialCareProfile(record);
    if (!profile || profile.priorityRank !== index + 1) {
      throw new Error(`${id}: öncelik sırası veya türetim profili hatalı.`);
    }

    if (record.care.difficulty === 'unknown') {
      throw new Error(`${id}: care.difficulty tamamlanmadı.`);
    }
    if (record.social.mode === 'unknown'
      || record.social.conspecificAggression === 'unknown'
      || record.social.territoriality === 'unknown') {
      throw new Error(`${id}: sosyal yapı alanlarından biri tamamlanmadı.`);
    }
    if (['group', 'school'].includes(record.social.mode)
      && (!record.social.minGroup || !record.social.recommendedGroup)) {
      throw new Error(`${id}: grup/sürü kaydında grup büyüklüğü eksik.`);
    }
    if (record.care.difficulty !== profile.difficulty
      || record.social.territoriality !== profile.territoriality) {
      throw new Error(`${id}: kayıt ile türetim profili uyuşmuyor.`);
    }
    if (!record.sourceIds.includes(PRIORITY_SOCIAL_CARE_SOURCE_ID)) {
      throw new Error(`${id}: sosyal bakım kaynak kimliği eksik.`);
    }
    for (const field of ['social', 'care']) {
      if (!record.fieldSourceIds[field]?.includes(PRIORITY_SOCIAL_CARE_SOURCE_ID)) {
        throw new Error(`${id}.${field}: alan kaynak kimliği eksik.`);
      }
    }
    for (const field of ['social.territoriality', 'care.difficulty']) {
      if (record.migration.unknownFields.includes(field)) {
        throw new Error(`${id}: tamamlanan alan hâlâ unknownFields içinde (${field}).`);
      }
      if (!record.migration.derivedFields.includes(field)) {
        throw new Error(`${id}: tamamlanan alan derivedFields içinde yok (${field}).`);
      }
    }
    if (record.verification.status !== 'needs_review'
      || record.verification.confidence !== 'low') {
      throw new Error(`${id}: türetilmiş alanlar yanlışlıkla doğrulanmış sayıldı.`);
    }

    increment(difficultyCounts, record.care.difficulty);
    increment(territorialityCounts, record.social.territoriality);
    for (const reason of profile.difficultyReasons) increment(reasonCounts, reason);
  }

  for (const record of curated) {
    if (!prioritySet.has(record.id)
      && record.sourceIds.includes(PRIORITY_SOCIAL_CARE_SOURCE_ID)) {
      throw new Error(`${record.id}: öncelik seti dışındaki kayda sosyal bakım kuralı uygulandı.`);
    }
  }

  assertCounts('difficultyCounts', difficultyCounts, EXPECTED_DIFFICULTY_COUNTS);
  assertCounts('territorialityCounts', territorialityCounts, EXPECTED_TERRITORIALITY_COUNTS);

  const report = JSON.parse(
    readFileSync(resolve(repositoryRoot, 'data/curation/priority-social-care-report.json'), 'utf8'),
  );
  if (report.program !== PRIORITY_SOCIAL_CARE_PROGRAM
    || report.recordCount !== EXPECTED_TOTAL
    || !sameArray(report.completedFields ?? [], ['social.territoriality', 'care.difficulty'])) {
    throw new Error('Öncelik 100 rapor başlığı veya kapsamı güncel değil.');
  }
  assertCounts('report.difficultyCounts', report.difficultyCounts ?? {}, difficultyCounts);
  assertCounts('report.territorialityCounts', report.territorialityCounts ?? {}, territorialityCounts);

  return {
    program: PRIORITY_SOCIAL_CARE_PROGRAM,
    recordCount: EXPECTED_TOTAL,
    completedSocialStructures: EXPECTED_TOTAL,
    completedCareDifficulties: EXPECTED_TOTAL,
    difficultyCounts,
    territorialityCounts,
    reasonCounts,
    externalReviewRequired: true,
    selectionMethod: 'legacy_catalog_priority_order',
  };
}
