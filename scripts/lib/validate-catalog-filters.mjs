import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function canonicalRecord(id, overrides = {}) {
  return {
    id,
    name: { tr: id, en: id },
    entityType: 'freshwater_fish',
    water: { types: ['fresh'] },
    tank: { minVolumeL: 40 },
    size: { adultCm: [4, 5] },
    care: { difficulty: 'beginner' },
    behavior: { temperament: 'peaceful', zone: ['mid'] },
    social: { mode: 'school' },
    compatibility: { plantSafe: true, coralSafe: 'not_applicable' },
    ...overrides,
  };
}

const RECORDS = [
  canonicalRecord('neon', {
    name: { tr: 'Neon Tetra', en: 'Neon Tetra' },
    tank: { minVolumeL: 60 },
    size: { adultCm: [3, 4] },
  }),
  canonicalRecord('oscar', {
    name: { tr: 'Oscar', en: 'Oscar' },
    tank: { minVolumeL: 300 },
    size: { adultCm: [25, 35] },
    care: { difficulty: 'advanced' },
    behavior: { temperament: 'aggressive', zone: ['mid', 'bottom'] },
    social: { mode: 'solitary' },
    compatibility: { plantSafe: false, coralSafe: 'not_applicable' },
  }),
  canonicalRecord('amano', {
    name: { tr: 'Amano Karidesi', en: 'Amano Shrimp' },
    entityType: 'freshwater_shrimp',
    tank: { minVolumeL: 30 },
    size: { adultCm: [4, 6] },
    care: { difficulty: 'intermediate' },
    behavior: { temperament: 'peaceful', zone: ['bottom'] },
    social: { mode: 'group' },
  }),
  canonicalRecord('marine-predator', {
    name: { tr: 'Deniz Avcısı', en: 'Marine Predator' },
    entityType: 'marine_fish',
    water: { types: ['salt'] },
    tank: { minVolumeL: 250 },
    size: { adultCm: [20, 30] },
    care: { difficulty: 'expert' },
    behavior: { temperament: 'predatory', zone: ['open_water'] },
    social: { mode: 'solitary' },
    compatibility: { plantSafe: false, coralSafe: 'no' },
  }),
  canonicalRecord('cleaner-shrimp', {
    name: { tr: 'Temizlik Karidesi', en: 'Cleaner Shrimp' },
    entityType: 'marine_shrimp',
    water: { types: ['salt'] },
    tank: { minVolumeL: 80 },
    size: { adultCm: [5, 7] },
    care: { difficulty: 'intermediate' },
    behavior: { temperament: 'peaceful', zone: ['rockwork'] },
    social: { mode: 'group' },
    compatibility: { plantSafe: true, coralSafe: 'yes' },
  }),
  canonicalRecord('soft-coral', {
    name: { tr: 'Yumuşak Mercan', en: 'Soft Coral' },
    entityType: 'soft_coral',
    water: { types: ['salt'] },
    tank: { minVolumeL: 100 },
    size: { adultCm: [5, 15] },
    care: { difficulty: 'advanced' },
    behavior: { temperament: 'unknown', zone: ['rockwork'] },
    social: { mode: 'colony' },
    compatibility: { plantSafe: true, coralSafe: 'yes' },
  }),
];

function ids(records) {
  return plain(records.map((record) => record.id));
}

export function validateCatalogFilters(repositoryRoot) {
  const modelSource = readFileSync(resolve(repositoryRoot, 'catalog-filter-model.js'), 'utf8');
  const uiSource = readFileSync(resolve(repositoryRoot, 'catalog-filters.jsx'), 'utf8');
  const bootSource = readFileSync(resolve(repositoryRoot, 'boot.js'), 'utf8');
  const viteSource = readFileSync(resolve(repositoryRoot, 'vite.config.js'), 'utf8');

  const context = vm.createContext({
    window: { URLSearchParams },
    URLSearchParams,
    Intl,
  });
  new vm.Script(modelSource, { filename: 'catalog-filter-model.js' }).runInContext(context);
  const model = context.window.CatalogFilterModel;

  assert.equal(model.version, 1, 'Katalog filtre modeli sürümü değişti.');
  let scenarios = 0;

  const parsed = plain(model.parseSearch('?q=Neon&cat=fish&care=beginner&temperament=peaceful&social=school&zone=mid&tankMax=80&plantSafe=1&reefSafe=1&sort=tank'));
  assert.deepEqual(parsed, {
    q: 'Neon',
    category: 'fish',
    care: 'beginner',
    temperament: 'peaceful',
    social: 'school',
    zone: 'mid',
    tankMax: 80,
    plantSafe: true,
    reefSafe: true,
    sort: 'tank',
  });
  scenarios += 1;

  assert.deepEqual(
    plain(model.parseSearch('?cat=invalid&care=nope&tankMax=81&sort=random')),
    plain(model.createDefaults()),
    'Geçersiz URL filtreleri varsayılanlara dönmelidir.',
  );
  scenarios += 1;

  const serialized = model.serializeSearch(parsed, '?utm_source=test&cat=corals');
  assert(serialized.includes('utm_source=test'), 'Filtre dışı URL parametreleri korunmalıdır.');
  assert(serialized.includes('cat=fish'), 'Kategori URL’ye yazılmalıdır.');
  assert(serialized.includes('plantSafe=1'), 'Boolean filtre URL’ye yazılmalıdır.');
  assert.deepEqual(plain(model.parseSearch(serialized)), parsed, 'URL parse/serialize turu kayıpsız olmalıdır.');
  scenarios += 1;

  assert.deepEqual(ids(model.filterRecords(RECORDS, model.createDefaults(), { water: 'fresh', lang: 'tr' })), ['amano', 'neon', 'oscar']);
  scenarios += 1;

  assert.deepEqual(ids(model.filterRecords(RECORDS, { ...model.createDefaults(), category: 'invertebrates' }, { water: 'salt', lang: 'tr' })), ['cleaner-shrimp']);
  scenarios += 1;

  assert.deepEqual(ids(model.filterRecords(RECORDS, { ...model.createDefaults(), category: 'corals' }, { water: 'salt', lang: 'tr' })), ['soft-coral']);
  scenarios += 1;

  assert.deepEqual(ids(model.filterRecords(RECORDS, { ...model.createDefaults(), care: 'advanced' }, { water: 'fresh', lang: 'tr' })), ['oscar']);
  scenarios += 1;

  assert.deepEqual(ids(model.filterRecords(RECORDS, { ...model.createDefaults(), temperament: 'predatory' }, { water: 'salt', lang: 'tr' })), ['marine-predator']);
  scenarios += 1;

  assert.deepEqual(ids(model.filterRecords(RECORDS, { ...model.createDefaults(), social: 'group' }, { water: 'salt', lang: 'tr' })), ['cleaner-shrimp']);
  scenarios += 1;

  assert.deepEqual(ids(model.filterRecords(RECORDS, { ...model.createDefaults(), zone: 'rockwork' }, { water: 'salt', lang: 'tr' })), ['cleaner-shrimp', 'soft-coral']);
  scenarios += 1;

  assert.deepEqual(ids(model.filterRecords(RECORDS, { ...model.createDefaults(), tankMax: 80 }, { water: 'fresh', lang: 'tr' })), ['amano', 'neon']);
  scenarios += 1;

  assert.deepEqual(ids(model.filterRecords(RECORDS, { ...model.createDefaults(), plantSafe: true }, { water: 'fresh', lang: 'tr' })), ['amano', 'neon']);
  scenarios += 1;

  assert.deepEqual(ids(model.filterRecords(RECORDS, { ...model.createDefaults(), reefSafe: true }, { water: 'salt', lang: 'tr' })), ['cleaner-shrimp', 'soft-coral']);
  scenarios += 1;

  assert.deepEqual(ids(model.filterRecords(RECORDS, { ...model.createDefaults(), q: 'karidesi' }, { water: 'fresh', lang: 'tr' })), ['amano']);
  scenarios += 1;

  assert.deepEqual(ids(model.filterRecords(RECORDS, { ...model.createDefaults(), sort: 'tank' }, { water: 'fresh', lang: 'tr' })), ['amano', 'neon', 'oscar']);
  scenarios += 1;

  assert.deepEqual(ids(model.filterRecords(RECORDS, { ...model.createDefaults(), sort: 'size' }, { water: 'fresh', lang: 'tr' })), ['oscar', 'amano', 'neon']);
  scenarios += 1;

  assert.deepEqual(ids(model.filterRecords(RECORDS, {
    ...model.createDefaults(),
    category: 'fish',
    care: 'beginner',
    temperament: 'peaceful',
    social: 'school',
    zone: 'mid',
    tankMax: 80,
    plantSafe: true,
  }, { water: 'fresh', lang: 'tr' })), ['neon']);
  scenarios += 1;

  assert.deepEqual(
    plain(model.countByCategory(RECORDS, { ...model.createDefaults(), category: 'corals' }, { water: 'salt', lang: 'tr' })),
    { all: 3, fish: 1, invertebrates: 1, corals: 1 },
    'Kategori sayaçları seçili kategori filtresinden bağımsız olmalıdır.',
  );
  scenarios += 1;

  assert.equal(model.activeFilterCount(parsed), 10, 'Aktif filtre sayısı bütün URL filtrelerini kapsamalıdır.');
  scenarios += 1;

  assert.match(uiSource, /window\.UI\.FishStep\s*=\s*CatalogFishStep/, 'Yeni filtre arayüzü FishStep üzerine bağlanmalıdır.');
  assert.match(uiSource, /window\.history\.replaceState/, 'Filtreler URL’ye yazılmalıdır.');
  assert.match(uiSource, /popstate/, 'Tarayıcı geri-ileri hareketi filtreleri güncellemelidir.');
  assert.match(uiSource, /PAGE_SIZE\s*=\s*36/, 'Büyük katalog kontrollü dilimlerle gösterilmelidir.');
  scenarios += 1;

  assert.match(bootSource, /catalog-filter-model\.js/, 'Kök statik yükleyici filtre modelini yüklemelidir.');
  assert.match(bootSource, /catalog-filters\.jsx/, 'Kök statik yükleyici filtre arayüzünü yüklemelidir.');
  assert.match(viteSource, /catalog-filter-model\.js/, 'Vite production paketi filtre modelini içermelidir.');
  assert.match(viteSource, /catalog-filters\.jsx/, 'Vite production paketi filtre arayüzünü içermelidir.');
  scenarios += 1;

  return {
    modelVersion: model.version,
    scenarios,
    records: RECORDS.length,
    managedQueryKeys: 10,
    categories: 4,
    advancedFilters: 8,
  };
}
