import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

export function validateInhabitantDetail(repositoryRoot) {
  const modelSource = readFileSync(resolve(repositoryRoot, 'inhabitant-detail-model.js'), 'utf8');
  const uiSource = readFileSync(resolve(repositoryRoot, 'inhabitant-detail.jsx'), 'utf8');
  const bootSource = readFileSync(resolve(repositoryRoot, 'boot.js'), 'utf8');
  const viteSource = readFileSync(resolve(repositoryRoot, 'vite.config.js'), 'utf8');

  const context = vm.createContext({ window: {} });
  new vm.Script(modelSource, { filename: 'inhabitant-detail-model.js' }).runInContext(context);
  const model = context.window.InhabitantDetailModel;
  assert.equal(model.version, 1, 'Canlı ayrıntı modeli sürümü değişti.');

  let scenarios = 1;
  const sources = [
    {
      id: 'source-a',
      title: 'Kaynak A',
      publisher: 'Yayıncı',
      location: 'internal:test',
      sourceType: 'internal_legacy',
      status: 'unverified',
      confidence: 'low',
      note: 'Doğrulama bekliyor.',
    },
  ];
  const canonical = {
    id: 'neon',
    name: { tr: 'Neon Tetra', en: 'Neon Tetra' },
    scientificName: 'Paracheirodon innesi',
    aliases: ['Mavi Neon'],
    entityType: 'freshwater_fish',
    category: 'tetra',
    tags: ['schooling'],
    summary: { tr: 'Barışçıl sürü balığı.', en: 'Peaceful schooling fish.' },
    water: { types: ['fresh'], temperatureC: [22, 26], pH: [5.5, 7.5], gh: [1, 8] },
    size: { adultCm: [3, 4] },
    tank: { minVolumeL: 60, additionalVolumePerInhabitantL: 2, minLengthCm: 75 },
    taxonomy: { genus: 'Paracheirodon', family: 'Characidae', reviewStatus: 'inferred' },
    social: { mode: 'school', minGroup: 6, recommendedGroup: 10, conspecificAggression: 'none', territoriality: 'none' },
    behavior: { temperament: 'peaceful', activity: 'active', zone: ['mid'], finNipper: false, longFinned: false },
    feeding: { diet: ['omnivore'], feedingDifficulty: 'easy' },
    compatibility: { plantSafe: true, coralSafe: 'not_applicable' },
    habitat: { flow: 'low', oxygen: 'normal', substrate: ['sand'], shelter: ['plants'] },
    care: {
      difficulty: 'beginner',
      sensitiveTo: ['unstable parameters'],
      specialWarnings: [{ tr: 'Sürü halinde tutulmalı.', en: 'Keep in a school.' }],
    },
    notes: { tr: 'Ani değişimlerden kaçın.', en: 'Avoid sudden changes.' },
    sourceIds: ['source-a'],
    fieldSourceIds: { core: ['source-a'], tank: ['source-a'] },
    verification: { status: 'needs_review', confidence: 'low', notes: ['Dış kaynak kontrolü gerekli.'] },
    migration: { unknownFields: ['salinityPpt'], derivedFields: ['social.mode'] },
  };

  const tr = plain(model.build(canonical, 'tr', sources));
  assert.equal(tr.name, 'Neon Tetra');
  assert.equal(tr.summary, 'Barışçıl sürü balığı.');
  assert.equal(tr.scientificName, 'Paracheirodon innesi');
  assert.deepEqual(tr.aliases, ['Mavi Neon']);
  scenarios += 1;

  assert.deepEqual(tr.water.temperatureC, [22, 26]);
  assert.deepEqual(tr.water.pH, [5.5, 7.5]);
  assert.equal(tr.tank.minVolumeL, 60);
  assert.equal(tr.tank.minLengthCm, 75);
  assert.deepEqual(tr.size.adultCm, [3, 4]);
  scenarios += 1;

  assert.equal(tr.social.mode, 'school');
  assert.equal(tr.social.minGroup, 6);
  assert.equal(tr.behavior.temperament, 'peaceful');
  assert.deepEqual(tr.feeding.diet, ['omnivore']);
  assert.equal(tr.compatibility.plantSafe, true);
  scenarios += 1;

  assert.equal(tr.sources.length, 1);
  assert.equal(tr.sources[0].title, 'Kaynak A');
  assert.equal(tr.fieldSources.length, 2);
  assert.equal(tr.verification.status, 'needs_review');
  assert.deepEqual(tr.migration.unknownFields, ['salinityPpt']);
  scenarios += 1;

  const en = plain(model.build(canonical, 'en', sources));
  assert.equal(en.summary, 'Peaceful schooling fish.');
  assert.equal(en.notes, 'Avoid sudden changes.');
  assert.deepEqual(en.care.specialWarnings, ['Keep in a school.']);
  scenarios += 1;

  const missing = plain(model.build({ id: 'unknown', name: { tr: 'Eksik', en: 'Missing' }, sourceIds: [] }, 'tr', sources));
  assert.equal(missing.water.temperatureC, null);
  assert.equal(missing.tank.minVolumeL, null);
  assert.equal(missing.taxonomy.family, null);
  assert.deepEqual(missing.sources, []);
  assert.deepEqual(missing.care.sensitiveTo, []);
  scenarios += 1;

  const legacy = plain(model.build({
    id: 'legacy', nameTr: 'Eski Balık', nameEn: 'Legacy Fish', sci: 'Legacy species', water: 'salt',
    temp: [24, 27], pH: [8, 8.4], gh: [8, 12], size: 12, minVolume: 120, perFishL: 10,
    schooling: 4, aggression: 'semi', diet: 'carnivore', layer: 'bottom', plantSafe: false, reefSafe: true,
  }, 'tr', []));
  assert.equal(legacy.name, 'Eski Balık');
  assert.equal(legacy.scientificName, 'Legacy species');
  assert.deepEqual(legacy.water.types, ['salt']);
  assert.deepEqual(legacy.size.adultCm, [12, 12]);
  assert.equal(legacy.social.mode, 'school');
  assert.equal(legacy.social.minGroup, 4);
  assert.equal(legacy.behavior.temperament, 'semi_aggressive');
  scenarios += 1;

  assert.match(uiSource, /role="dialog"/, 'Ayrıntı paneli dialog rolü taşımalıdır.');
  assert.match(uiSource, /aria-modal="true"/, 'Ayrıntı paneli modal olarak işaretlenmelidir.');
  assert.match(uiSource, /event\.key === 'Escape'/, 'Escape ile panel kapanmalıdır.');
  assert.match(uiSource, /MutationObserver/, 'Katalog kartları ayrıntı düğmesiyle güçlendirilmelidir.');
  assert.match(uiSource, /data-catalog-detail/, 'Ayrıntı düğmesi kayıt kimliği taşımalıdır.');
  scenarios += 1;

  assert.match(uiSource, /sourcePending/, 'Doğrulanmamış veri görünür biçimde belirtilmelidir.');
  assert.match(uiSource, /detail\.sources\.map/, 'Kaynak kayıtları panelde listelenmelidir.');
  assert.match(uiSource, /setQuantity\(detail\.id/, 'Ayrıntı panelinden adet yönetimi yapılmalıdır.');
  scenarios += 1;

  assert.match(bootSource, /inhabitant-detail-model\.js/, 'Statik yükleyici ayrıntı modelini yüklemelidir.');
  assert.match(bootSource, /inhabitant-detail\.jsx/, 'Statik yükleyici ayrıntı panelini yüklemelidir.');
  assert.match(viteSource, /inhabitant-detail-model\.js/, 'Vite production ayrıntı modelini içermelidir.');
  assert.match(viteSource, /inhabitant-detail\.jsx/, 'Vite production ayrıntı panelini içermelidir.');
  scenarios += 1;

  return {
    modelVersion: model.version,
    scenarios,
    sections: 5,
    sourceResolution: true,
    legacyFallback: true,
    accessibleDialog: true,
  };
}
