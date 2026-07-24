import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import Ajv2020 from 'ajv/dist/2020.js';

import { loadLegacyData } from './load-legacy-data.mjs';

const BATCH_SOURCE_IDS = new Set([
  'fishbase-freshwater-batch-3-2026',
  'seriouslyfish-freshwater-batch-3-2026',
  'freshwater-batch-3-editorial-v1',
  'legacy-inhabitant-migration-v1',
]);

const EXPECTED = Object.freeze({
  legacyFreshwater: 278,
  batch1: 20,
  batch2: 20,
  batch3: 16,
  freshwater: 334,
  saltwater: 302,
  inhabitants: 636,
  catalogFish: 523,
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

function normalizedScientificName(value) {
  return String(value ?? '').trim().toLocaleLowerCase('en-US').replace(/\s+/g, ' ');
}

export function validateFreshwaterBatch3(repositoryRoot) {
  const data = loadLegacyData(repositoryRoot, {
    withProvenance: true,
    withMigration: true,
    withCatalog: true,
  });
  const batch1 = data.freshwaterBatch1;
  const batch2 = data.freshwaterBatch2;
  const batch3 = data.freshwaterBatch3;

  assert(batch1?.legacy?.length === EXPECTED.batch1, 'Tatlı su parti 1 bulunamadı veya kayıt sayısı değişti.');
  assert(batch2?.legacy?.length === EXPECTED.batch2, 'Tatlı su parti 2 bulunamadı veya kayıt sayısı değişti.');
  assert(batch3?.version === 1, 'Tatlı su parti 3 sürümü bulunamadı.');
  assert(batch3.taskId === 'AKV-DATA-020', 'Tatlı su parti 3 görev kimliği yanlış.');
  assert(batch3.legacy.length === EXPECTED.batch3, `Parti 3 legacy kayıt sayısı ${EXPECTED.batch3} olmalı; ${batch3.legacy.length} bulundu.`);
  assert(batch3.canonical.length === EXPECTED.batch3, `Parti 3 canonical kayıt sayısı ${EXPECTED.batch3} olmalı; ${batch3.canonical.length} bulundu.`);

  const priorIds = new Set([
    ...batch1.legacy.map((record) => record.id),
    ...batch2.legacy.map((record) => record.id),
  ]);
  const legacyIds = batch3.legacy.map((record) => record.id);
  const canonicalIds = batch3.canonical.map((record) => record.id);
  assert(duplicateValues(legacyIds).length === 0, 'Parti 3 legacy kimliklerinde tekrar var.');
  assert(duplicateValues(canonicalIds).length === 0, 'Parti 3 canonical kimliklerinde tekrar var.');
  assert(JSON.stringify([...legacyIds].sort()) === JSON.stringify([...canonicalIds].sort()), 'Legacy ve canonical parti 3 kimlikleri eşleşmiyor.');
  assert(legacyIds.every((id) => !priorIds.has(id)), 'Önceki partiler ile parti 3 arasında kimlik çakışması var.');

  const batchScientificNames = batch3.canonical.map((record) => normalizedScientificName(record.scientificName));
  assert(duplicateValues(batchScientificNames).length === 0, 'Parti 3 bilimsel adlarında tekrar var.');
  const batchIdSet = new Set(legacyIds);
  const existingScientificNames = new Set(
    data.inhabitants
      .filter((record) => !batchIdSet.has(record.id))
      .map((record) => normalizedScientificName(record.scientificName)),
  );
  const scientificCollisions = batch3.canonical
    .filter((record) => existingScientificNames.has(normalizedScientificName(record.scientificName)))
    .map((record) => record.scientificName);
  assert(scientificCollisions.length === 0, `Parti 3 bilimsel adları mevcut katalogla çakışıyor: ${scientificCollisions.join(', ')}`);

  assert(data.fresh.length === EXPECTED.freshwater, `Tatlı su toplamı ${EXPECTED.freshwater} olmalı; ${data.fresh.length} bulundu.`);
  assert(data.salt.length === EXPECTED.saltwater, `Tuzlu su toplamı ${EXPECTED.saltwater} kalmalı; ${data.salt.length} bulundu.`);
  assert(data.fish.length === EXPECTED.inhabitants, `Legacy canlı toplamı ${EXPECTED.inhabitants} olmalı; ${data.fish.length} bulundu.`);
  assert(data.inhabitants.length === EXPECTED.inhabitants, `Canonical canlı toplamı ${EXPECTED.inhabitants} olmalı; ${data.inhabitants.length} bulundu.`);

  const allBatchIds = new Set([...priorIds, ...legacyIds]);
  assert(
    data.fresh.filter((record) => !allBatchIds.has(record.id)).length === EXPECTED.legacyFreshwater,
    'Eski 278 tatlı su kaydı eksiksiz korunmadı.',
  );

  const schema = JSON.parse(readFileSync(resolve(repositoryRoot, 'schemas/inhabitant-v1.schema.json'), 'utf8'));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);
  if (!validate(batch3.canonical)) {
    const details = validate.errors.map((error) => `${error.instancePath || '/'} ${error.message}`).join('\n');
    throw new Error(`Tatlı su parti 3 Inhabitant v1 doğrulaması başarısız:\n${details}`);
  }

  const sourceIds = new Set(data.sources.map((source) => source.id));
  for (const requiredSource of BATCH_SOURCE_IDS) {
    assert(sourceIds.has(requiredSource), `Parti 3 kaynağı katalogda yok: ${requiredSource}`);
  }
  assert(data.sourceCatalogVersion === 12, `Kaynak katalog sürümü 12 olmalı; ${data.sourceCatalogVersion} bulundu.`);

  const inhabitantsById = new Map(data.inhabitants.map((record) => [record.id, record]));
  for (const canonical of batch3.canonical) {
    const actual = inhabitantsById.get(canonical.id);
    assert(actual, `Canonical parti 3 kaydı production koleksiyonunda yok: ${canonical.id}`);
    assert(actual.status === 'reviewed', `${canonical.id}: durum reviewed olmalı.`);
    assert(actual.verification?.status === 'reviewed', `${canonical.id}: doğrulama reviewed olmalı.`);
    assert(actual.verification?.confidence === 'medium', `${canonical.id}: güven medium olmalı.`);
    assert(actual.entityType === 'freshwater_fish', `${canonical.id}: entityType freshwater_fish olmalı.`);
    assert(actual.water?.types?.length === 1 && actual.water.types[0] === 'fresh', `${canonical.id}: yalnız fresh su tipi taşımalı.`);
    assert(actual.tank?.minVolumeL > 0 && actual.tank?.minLengthCm > 0, `${canonical.id}: tank alt sınırları eksik.`);
    assert(actual.social?.mode && actual.care?.difficulty, `${canonical.id}: sosyal veya bakım alanı eksik.`);
    for (const sourceId of actual.sourceIds ?? []) {
      assert(sourceIds.has(sourceId), `${canonical.id}: çözülemeyen sourceId ${sourceId}`);
    }
    for (const [field, ids] of Object.entries(actual.fieldSourceIds ?? {})) {
      assert(ids.length > 0, `${canonical.id}: ${field} kaynak bağlantısı boş.`);
      for (const sourceId of ids) assert(sourceIds.has(sourceId), `${canonical.id}: ${field} için bilinmeyen kaynak ${sourceId}`);
    }
  }

  assert(data.inhabitantCatalog?.all?.length === EXPECTED.inhabitants, `Ortak katalog ${EXPECTED.inhabitants} kaydı içermiyor.`);
  assert(data.inhabitantCatalog?.collections?.fish?.length === EXPECTED.catalogFish, `Balık koleksiyonu beklenen ${EXPECTED.catalogFish} kaydı içermiyor.`);

  const boot = readFileSync(resolve(repositoryRoot, 'boot.js'), 'utf8');
  const vite = readFileSync(resolve(repositoryRoot, 'vite.config.js'), 'utf8');
  const loader = readFileSync(resolve(repositoryRoot, 'scripts/lib/load-legacy-data.mjs'), 'utf8');
  for (const filename of [
    'freshwater-batch-3-part-a.js',
    'freshwater-batch-3-part-b.js',
    'freshwater-batch-3-part-c.js',
    'freshwater-batch-3-part-d.js',
    'freshwater-batch-3.js',
  ]) {
    assert(boot.includes(filename), `Statik yükleyicide parti 3 dosyası eksik: ${filename}`);
    assert(vite.includes(filename), `Vite yükleyicide parti 3 dosyası eksik: ${filename}`);
    assert(loader.includes(filename), `Node yükleyicide parti 3 dosyası eksik: ${filename}`);
  }
  assert(vite.includes('AKV_FRESHWATER_BATCH_3'), 'Vite canonical parti 3 değiştirme bağlantısı eksik.');

  return {
    batchRecords: EXPECTED.batch3,
    preservedLegacyFreshwater: EXPECTED.legacyFreshwater,
    totalFreshwater: data.fresh.length,
    totalSaltwater: data.salt.length,
    totalInhabitants: data.inhabitants.length,
    sourceCatalogVersion: data.sourceCatalogVersion,
    reviewedMedium: batch3.canonical.length,
    schemaValidated: true,
    noIdCollisions: true,
    noScientificNameCollisions: true,
    staticConnected: true,
    viteConnected: true,
    nodeConnected: true,
  };
}
