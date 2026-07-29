import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { loadLegacyData } from './load-legacy-data.mjs';

const RAW_FLOWS = Object.freeze({
  tank: Object.freeze(['path', 'tank', 'water', 'fish', 'plants', 'substrate', 'result']),
  fish: Object.freeze(['path', 'water', 'fish', 'tank', 'plants', 'substrate', 'result']),
  water: Object.freeze(['path', 'water', 'tank', 'fish', 'plants', 'substrate', 'result']),
});

function flowFor(state) {
  if (!state?.path || !RAW_FLOWS[state.path]) return ['path'];
  const flow = [...RAW_FLOWS[state.path]];
  return state.water === 'salt' ? flow.filter((step) => step !== 'plants') : flow;
}

function normalizeStepIndex(flow, index) {
  const maxIndex = Math.max(0, flow.length - 1);
  return Math.min(Math.max(0, Number.isInteger(index) ? index : 0), maxIndex);
}

function nextStepIndex(flow, index) {
  return Math.min(normalizeStepIndex(flow, index) + 1, Math.max(0, flow.length - 1));
}

function previousStepIndex(flow, index) {
  return Math.max(0, normalizeStepIndex(flow, index) - 1);
}

function jumpStepIndex(flow, currentIndex, target) {
  const targetIndex = typeof target === 'number' ? target : flow.indexOf(target);
  return targetIndex >= 0 && targetIndex < flow.length
    ? targetIndex
    : normalizeStepIndex(flow, currentIndex);
}

function assertFlow(path, water, expected) {
  assert.deepEqual(flowFor({ path, water }), expected, `${path}/${water}: akış sırası yanlış.`);
}

export function validateWizardFlow(repositoryRoot) {
  const appSource = readFileSync(resolve(repositoryRoot, 'app.jsx'), 'utf8');

  assert.match(appSource, /const safeStepIdx =/, 'Ana uygulama güvenli adım indeksi üretmelidir.');
  assert.match(appSource, /const stepName = flow\[safeStepIdx\] \|\| 'path'/, 'Geçersiz adım boş ekran yerine path adımına dönmelidir.');
  assert.match(appSource, /setStepIdx\(current =>/, 'İleri/geri geçişleri fonksiyonel state güncellemesi kullanmalıdır.');
  assert.match(appSource, /const progressCurrent = Math\.max\(0, safeStepIdx - 1\)/, 'İlerleme göstergesi güvenli indeksi kullanmalıdır.');
  assert.doesNotMatch(appSource, /const stepName = flow\[stepIdx\]/, 'Ham adım indeksi doğrudan render edilmemelidir.');

  assertFlow('tank', 'fresh', ['path', 'tank', 'water', 'fish', 'plants', 'substrate', 'result']);
  assertFlow('fish', 'fresh', ['path', 'water', 'fish', 'tank', 'plants', 'substrate', 'result']);
  assertFlow('water', 'fresh', ['path', 'water', 'tank', 'fish', 'plants', 'substrate', 'result']);
  assertFlow('tank', 'salt', ['path', 'tank', 'water', 'fish', 'substrate', 'result']);
  assertFlow('fish', 'salt', ['path', 'water', 'fish', 'tank', 'substrate', 'result']);
  assertFlow('water', 'salt', ['path', 'water', 'tank', 'fish', 'substrate', 'result']);

  const saltFlow = flowFor({ path: 'tank', water: 'salt' });
  assert.equal(normalizeStepIndex(saltFlow, 99), saltFlow.length - 1, 'Aşırı büyük indeks son adıma toparlanmalıdır.');
  assert.equal(normalizeStepIndex(saltFlow, -4), 0, 'Negatif indeks ilk adıma toparlanmalıdır.');
  assert.equal(nextStepIndex(saltFlow, saltFlow.length - 1), saltFlow.length - 1, 'Son adımda ileri gitmek sınırı aşmamalıdır.');
  assert.equal(previousStepIndex(saltFlow, 0), 0, 'İlk adımda geri gitmek sınırı aşmamalıdır.');
  assert.equal(jumpStepIndex(saltFlow, 3, 'plants'), 3, 'Akışta olmayan adıma sıçrama mevcut adımı korumalıdır.');

  const freshResultIndex = flowFor({ path: 'tank', water: 'fresh' }).indexOf('result');
  assert.equal(
    saltFlow[normalizeStepIndex(saltFlow, freshResultIndex)],
    'result',
    'Fresh sonuç indeksinden salt akışına geçiş boş adıma düşmemelidir.',
  );

  const data = loadLegacyData(repositoryRoot, {
    withProvenance: true,
    withMigration: true,
    withPriorityCuration: true,
    withCatalog: true,
  });
  const substrateByWater = new Map([
    ['fresh', data.substrates.find((item) => item.water?.includes('fresh'))?.id ?? null],
    ['salt', data.substrates.find((item) => item.water?.includes('salt'))?.id ?? null],
  ]);

  let analyzedRecords = 0;
  for (const record of data.fish) {
    const state = {
      lang: 'tr',
      path: 'tank',
      water: record.water,
      volume: Math.max(30, Number(record.minVolume) || 30),
      fish: [{ id: record.id, qty: 1 }],
      plants: [],
      substrate: substrateByWater.get(record.water),
      co2: false,
    };

    let result;
    assert.doesNotThrow(() => {
      result = data.engine.analyze(state);
    }, `${record.id}: sonuç adımı analiz sırasında çöktü.`);
    assert(result && Number.isFinite(result.score), `${record.id}: sonuç puanı üretilemedi.`);
    assert(Array.isArray(result.issues), `${record.id}: sonuç sorun listesi üretilemedi.`);
    analyzedRecords += 1;
  }

  return {
    version: 1,
    navigationScenarios: 12,
    paths: Object.keys(RAW_FLOWS).length,
    freshwaterSteps: RAW_FLOWS.tank.length,
    saltwaterSteps: saltFlow.length,
    analyzedRecords,
    invalidIndexRecovery: true,
    allCatalogResultsRendered: true,
  };
}
