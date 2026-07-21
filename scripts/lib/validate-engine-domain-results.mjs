import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function canonical(id, options = {}) {
  const social = options.social || {
    mode: 'solitary',
    conspecificAggression: 'low',
    territoriality: 'low',
  };
  return {
    id,
    name: { tr: options.nameTr || id, en: options.nameEn || id },
    tank: {
      minVolumeL: options.minVolume ?? 20,
      additionalVolumePerInhabitantL: options.perFishL ?? 2,
      ...(options.minLength ? { minLengthCm: options.minLength } : {}),
    },
    social,
    taxonomy: {
      genus: options.genus || id,
      family: 'Testidae',
      reviewStatus: 'inferred',
    },
    verification: { status: 'needs_review', confidence: 'low', notes: [] },
    legacy: {
      water: options.water || 'fresh',
      minVolume: options.minVolume ?? 20,
      perFishL: options.perFishL ?? 2,
      schooling: options.schooling || 0,
      pH: options.pH || [6, 7],
      temp: options.temp || [22, 24],
      gh: options.gh || [2, 5],
      aggression: options.aggression || 'peaceful',
      size: options.size || 5,
      finNippers: Boolean(options.finNippers),
      longFinned: Boolean(options.longFinned),
      plantSafe: true,
      reefSafe: true,
    },
  };
}

function legacy(record) {
  return {
    id: record.id,
    nameTr: record.name.tr,
    nameEn: record.name.en,
    ...record.legacy,
  };
}

function createEngine(repositoryRoot, inhabitants) {
  const filenames = [
    'engine.js',
    'engine-finding-contract.js',
    'engine-health-guard.js',
    'engine-social-rules.js',
    'engine-conspecific-rules.js',
    'engine-domain-results.js',
  ];
  const context = vm.createContext({
    window: {
      DB: {
        inhabitants,
        fish: inhabitants.map(legacy),
        plants: [],
        substrates: [],
      },
    },
  });
  for (const filename of filenames) {
    new vm.Script(readFileSync(resolve(repositoryRoot, filename), 'utf8'), { filename }).runInContext(context);
  }
  return context.window.Engine;
}

function analyze(Engine, fish, overrides = {}) {
  return Engine.analyze({
    lang: 'tr',
    water: 'fresh',
    volume: 100,
    fish,
    plants: [],
    substrate: null,
    co2: false,
    ...overrides,
  });
}

export function validateEngineDomainResults(repositoryRoot) {
  const records = [
    canonical('single', { minVolume: 60, minLength: 75 }),
    canonical('mix-a', { minVolume: 60, perFishL: 0, genus: 'MixA' }),
    canonical('mix-b', { minVolume: 60, perFishL: 0, genus: 'MixB' }),
    canonical('large', { minVolume: 120, minLength: 120 }),
    canonical('edge', { minVolume: 90, minLength: 90 }),
    canonical('lengthy', { minVolume: 60, minLength: 120 }),
    canonical('group', {
      minVolume: 20,
      social: { mode: 'group', minGroup: 4, recommendedGroup: 4, conspecificAggression: 'low', territoriality: 'none' },
    }),
    canonical('predator', { aggression: 'aggressive', size: 20, genus: 'Predator' }),
    canonical('prey', { aggression: 'peaceful', size: 5, genus: 'Prey' }),
    canonical('acid', { pH: [6, 6.5], genus: 'Acid' }),
    canonical('alkaline', { pH: [7.5, 8], genus: 'Alkaline' }),
    canonical('nipper', { finNippers: true, aggression: 'semi', genus: 'Nipper' }),
    canonical('long-fin', { longFinned: true, genus: 'Longfin' }),
    canonical('same-high', {
      genus: 'SameHigh',
      social: { mode: 'solitary', conspecificAggression: 'high', territoriality: 'high' },
    }),
  ];
  const Engine = createEngine(repositoryRoot, records);
  assert.equal(Engine.domainResultsVersion, 1);
  let scenarios = 1;

  const empty = analyze(Engine, []);
  assert.deepEqual(plain(empty.domains), {
    version: 1,
    volume: {
      status: 'not_evaluated', volumeStatus: 'not_evaluated', lengthStatus: 'not_evaluated',
      tankVolumeL: 100, requiredVolumeL: 0, volumeMarginL: 100, utilizationPct: 0,
      tankLengthCm: null, requiredLengthCm: null, method: 'largest_species_minimum_v1',
    },
    bioload: {
      status: 'not_evaluated', tankVolumeL: 100, demandLiters: 0, capacityPct: 0,
      marginLiters: 100, method: 'legacy_additive_stocking_proxy_v1', confidence: 'low',
      noteKey: 'legacy_stocking_proxy_not_measured_waste',
    },
    behavior: {
      status: 'not_evaluated', criticalCount: 0, warningCount: 0, ruleIds: [],
      compatiblePairs: 0, cautionPairs: 0, incompatiblePairs: 0, method: 'behavior_findings_v1',
    },
  });
  scenarios += 1;

  const single = analyze(Engine, [{ id: 'single', qty: 1 }]);
  assert.equal(single.domains.volume.status, 'good');
  assert.equal(single.domains.volume.requiredVolumeL, 60);
  assert.equal(single.domains.volume.requiredLengthCm, 75);
  assert.equal(single.domains.volume.lengthStatus, 'not_evaluated');
  assert.equal(single.domains.bioload.status, 'good');
  assert.equal(single.domains.behavior.status, 'good');
  scenarios += 1;

  const separated = analyze(Engine, [{ id: 'mix-a', qty: 1 }, { id: 'mix-b', qty: 1 }]);
  assert.equal(separated.domains.volume.status, 'good');
  assert.equal(separated.domains.volume.requiredVolumeL, 60);
  assert.equal(separated.domains.bioload.status, 'critical');
  assert.equal(separated.domains.bioload.demandLiters, 120);
  assert.equal(separated.domains.bioload.capacityPct, 120);
  assert.equal(separated.neededVol, 120, 'Legacy toplam hacim alanı korunmalıdır.');
  scenarios += 1;

  const large = analyze(Engine, [{ id: 'large', qty: 1 }]);
  assert.equal(large.domains.volume.status, 'critical');
  assert.equal(large.domains.bioload.status, 'critical');
  scenarios += 1;

  const edge = analyze(Engine, [{ id: 'edge', qty: 1 }]);
  assert.equal(edge.domains.volume.status, 'warning');
  assert.equal(edge.domains.bioload.status, 'warning');
  assert.equal(edge.domains.volume.utilizationPct, 90);
  scenarios += 1;

  const lengthCritical = analyze(Engine, [{ id: 'lengthy', qty: 1 }], { tankLengthCm: 100 });
  assert.equal(lengthCritical.domains.volume.volumeStatus, 'good');
  assert.equal(lengthCritical.domains.volume.lengthStatus, 'critical');
  assert.equal(lengthCritical.domains.volume.status, 'critical');
  scenarios += 1;

  const lengthUnknown = analyze(Engine, [{ id: 'lengthy', qty: 1 }]);
  assert.equal(lengthUnknown.domains.volume.lengthStatus, 'not_evaluated');
  assert.equal(lengthUnknown.domains.volume.status, 'good');
  scenarios += 1;

  const socialWarning = analyze(Engine, [{ id: 'group', qty: 2 }]);
  assert.equal(socialWarning.domains.behavior.status, 'warning');
  assert.deepEqual(plain(socialWarning.domains.behavior.ruleIds), ['SOCIAL_GROUP_MINIMUM']);
  scenarios += 1;

  const predator = analyze(Engine, [{ id: 'predator', qty: 1 }, { id: 'prey', qty: 1 }]);
  assert.equal(predator.domains.behavior.status, 'critical');
  assert.equal(predator.domains.behavior.criticalCount, 1);
  assert.deepEqual(plain(predator.domains.behavior.ruleIds), ['PAIRWISE_INCOMPATIBLE']);
  scenarios += 1;

  const waterOnly = analyze(Engine, [{ id: 'acid', qty: 1 }, { id: 'alkaline', qty: 1 }]);
  assert.equal(waterOnly.domains.behavior.status, 'good', 'pH çakışması davranış sorunu sayılmamalıdır.');
  assert.equal(waterOnly.domains.behavior.incompatiblePairs, 1);
  assert.deepEqual(plain(waterOnly.domains.behavior.ruleIds), []);
  scenarios += 1;

  const finNipping = analyze(Engine, [{ id: 'nipper', qty: 1 }, { id: 'long-fin', qty: 1 }]);
  assert.equal(finNipping.domains.behavior.status, 'warning');
  assert.deepEqual(plain(finNipping.domains.behavior.ruleIds), ['PAIRWISE_CAUTION']);
  scenarios += 1;

  const sameSpecies = analyze(Engine, [{ id: 'same-high', qty: 2 }]);
  assert.equal(sameSpecies.domains.behavior.status, 'warning');
  assert.deepEqual(plain(sameSpecies.domains.behavior.ruleIds), ['CONSPECIFIC_AGGRESSION']);
  scenarios += 1;

  assert.equal(typeof single.score, 'number');
  assert.equal(typeof single.verdict, 'string');
  assert.equal(typeof single.bioloadPct, 'number');
  assert.equal(single.domains.version, 1);
  assert.deepEqual(Object.keys(plain(single.domains)).sort(), ['behavior', 'bioload', 'version', 'volume']);
  scenarios += 1;

  return {
    version: Engine.domainResultsVersion,
    scenarios,
    domains: 3,
    volumeIndependent: true,
    bioloadProxyExplicit: true,
    behaviorSeparatedFromWater: true,
    legacyFieldsPreserved: true,
  };
}
