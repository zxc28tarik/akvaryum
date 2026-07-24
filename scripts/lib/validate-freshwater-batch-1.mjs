import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import Ajv2020 from 'ajv/dist/2020.js';

import { loadLegacyData } from './load-legacy-data.mjs';

const BATCH_SOURCE_IDS = new Set([
  'fishbase-freshwater-batch-1-2026',
  'seriouslyfish-freshwater-batch-1-2026',
  'freshwater-batch-1-editorial-v1',
  'legacy-inhabitant-migration-v1',
]);

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

export function validateFreshwaterBatch1(repositoryRoot) {
  const data = loadLegacyData(repositoryRoot, {
    withProvenance: true,
    withMigration: true,
    withCatalog: true,
  });
  const batch = data.freshwaterBatch1;
  const batch2 = data.freshwaterBatch2;
  const batch3 = data.freshwaterBatch3;
  assert(batch?.version === 1, 'Tatlı su parti 1 sürümü bulunamadı.');
  assert(batch.taskId === 'AKV-DATA-020', 'Tatlı su parti 1 görev kimliği yanlış.');
  assert(batch.legacy.length === 20, `Parti 1 legacy kayıt sayısı 20 olmalı; ${batch.legacy.length} bulundu.`);
  assert(batch.canonical.length === 20, `Parti 1 canonical kayıt sayısı 20 olmalı; ${batch.canonical.length} bulundu.`);

  const legacyIds = batch.legacy.map((record) => record.id);
  const canonicalIds = batch.canonical.map((record) => record.id);
  assert(duplicateValues(legacyIds).length === 0, 'Parti 1 legacy kimliklerinde tekrar var.');
  assert(duplicateValues(canonicalIds).length === 0, 'Parti 1 canonical kimliklerinde tekrar var.');
  assert(JSON.stringify([...legacyIds].sort()) === JSON.stringify([...canonicalIds].sort()), 'Legacy ve canonical parti kimlikleri eşleşmiyor.');

  assert(data.fresh.length === 334, `Tatlı su toplamı 334 olmalı; ${data.fresh.length} bulundu.`);
  assert(data.salt.length === 302, `Tuzlu su toplamı 302 kalmalı; ${data.salt.length} bulundu.`);
  assert(data.fish.length === 636, `Legacy canlı toplamı 636 olmalı; ${data.fish.length} bulundu.`);
  assert(data.inhabitants.length === 636, `Canonical canlı toplamı 636 olmalı; ${data.inhabitants.length} bulundu.`);
  const allBatchIds = new Set([
    ...legacyIds,
    ...(batch2?.legacy ?? []).map((record) => record.id),
    ...(batch3?.legacy ?? []).map((record) => record.id),
  ]);
  assert(data.fresh.filter((record) => !allBatchIds.has(record.id)).length === 278, 'Eski 278 tatlı su kaydı eksiksiz korunmadı.');

  const schema = JSON.parse(readFileSync(resolve(repositoryRoot, 'schemas/inhabitant-v1.schema.json'), 'utf8'));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);
  if (!validate(batch.canonical)) {
    const details = validate.errors.map((error) => `${error.instancePath || '/'} ${error.message}`).join('\n');
    throw new Error(`Tatlı su parti 1 Inhabitant v1 doğrulaması başarısız:\n${details}`);
  }

  const sourceIds = new Set(data.sources.map((source) => source.id));
  for (const requiredSource of BATCH_SOURCE_IDS) {
    assert(sourceIds.has(requiredSource), `Parti kaynağı katalogda yok: ${requiredSource}`);
  }

  const inhabitantsById = new Map(data.inhabitants.map((record) => [record.id, record]));
  for (const canonical of batch.canonical) {
    const actual = inhabitantsById.get(canonical.id);
    assert(actual, `Canonical parti kaydı production koleksiyonunda yok: ${canonical.id}`);
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

  assert(data.inhabitantCatalog?.all?.length === 636, 'Ortak katalog 636 kaydı içermiyor.');
  assert(data.inhabitantCatalog?.collections?.fish?.length === 523, 'Balık koleksiyonu beklenen 523 kaydı içermiyor.');

  const boot = readFileSync(resolve(repositoryRoot, 'boot.js'), 'utf8');
  const vite = readFileSync(resolve(repositoryRoot, 'vite.config.js'), 'utf8');
  const loader = readFileSync(resolve(repositoryRoot, 'scripts/lib/load-legacy-data.mjs'), 'utf8');
  for (const filename of [
    'freshwater-batch-1-part-a.js',
    'freshwater-batch-1-part-b.js',
    'freshwater-batch-1-part-c.js',
    'freshwater-batch-1-part-d.js',
    'freshwater-batch-1.js',
  ]) {
    assert(boot.includes(filename), `Statik yükleyicide parti dosyası eksik: ${filename}`);
    assert(vite.includes(filename), `Vite yükleyicide parti dosyası eksik: ${filename}`);
    assert(loader.includes(filename), `Node yükleyicide parti dosyası eksik: ${filename}`);
  }
  assert(vite.includes('AKV_FRESHWATER_BATCH_1'), 'Vite canonical parti değiştirme bağlantısı eksik.');

  return {
    batchRecords: 20,
    preservedLegacyFreshwater: 278,
    totalFreshwater: data.fresh.length,
    totalSaltwater: data.salt.length,
    totalInhabitants: data.inhabitants.length,
    sourceCatalogVersion: data.sourceCatalogVersion,
    reviewedMedium: batch.canonical.length,
    schemaValidated: true,
    staticConnected: true,
    viteConnected: true,
    nodeConnected: true,
  };
}
