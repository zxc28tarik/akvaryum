import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function canonical(id, options = {}) {
  return {
    id,
    name: { tr: options.nameTr || id, en: options.nameEn || id },
    tank: {
      minVolumeL: options.minVolume ?? 20,
      additionalVolumePerInhabitantL: options.perFishL ?? 2,
      ...(options.minLength ? { minLengthCm: options.minLength } : {}),
    },
    social: options.social || {
      mode: options.schooling > 1 ? 'group' : 'solitary',
      ...(options.schooling > 1 ? { minGroup: options.schooling } : {}),
      conspecificAggression: 'low',
      territoriality: 'low',
    },
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
      plantSafe: options.plantSafe ?? true,
      reefSafe: options.reefSafe ?? true,
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
    'engine-score-breakdown.js',
  ];
  const context = vm.createContext({
    window: {
      DB: {
        inhabitants,
        fish: inhabitants.map(legacy),
        plants: [{ id: 'plant', tr: 'Bitki', en: 'Plant', co2: false }],
        substrates: [],
      },
    },
  });
  for (const filename of filenames) {
    new vm.Script(readFileSync(resolve(repositoryRoot, filename), 'utf8'), { filename })
      .runInContext(context);
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

function assertSection(section, score, maxScore, status) {
  assert.equal(section.score, score);
  assert.equal(section.maxScore, maxScore);
  assert.equal(section.status, status);
  assert.equal(typeof section.label, 'string');
  assert.equal(typeof section.summary, 'string');
  assert(Array.isArray(section.ruleIds));
}

function assertProductionConnections(repositoryRoot) {
  const boot = readFileSync(resolve(repositoryRoot, 'boot.js'), 'utf8');
  const vite = readFileSync(resolve(repositoryRoot, 'vite.config.js'), 'utf8');
  const workflow = readFileSync(resolve(repositoryRoot, '.github/workflows/vite-verify.yml'), 'utf8');
  const packageJson = JSON.parse(readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8'));

  assert.match(boot, /engine-score-breakdown\.js/);
  assert.match(vite, /engine-score-breakdown\.js/);
  assert.match(vite, /validateEngineScoreBreakdown/);
  assert.match(workflow, /check:engine-scores/);
  assert.equal(packageJson.scripts['check:engine-scores'], 'node scripts/check-engine-score-breakdown.mjs');
}

export function validateEngineScoreBreakdown(repositoryRoot) {
  const records = [
    canonical('healthy'),
    canonical('marine', { water: 'salt' }),
    canonical('acid', { pH: [6, 6.5], genus: 'Acid' }),
    canonical('alkaline', { pH: [7.5, 8], genus: 'Alkaline' }),
    canonical('large', { minVolume: 120, minLength: 120 }),
    canonical('predator', { aggression: 'aggressive', size: 20, genus: 'Predator' }),
    canonical('prey', { aggression: 'peaceful', size: 5, genus: 'Prey' }),
    canonical('school', { schooling: 6, genus: 'School' }),
    canonical('grazer', { plantSafe: false }),
  ];
  const Engine = createEngine(repositoryRoot, records);
  let scenarios = 0;

  assert.equal(Engine.scoreBreakdownVersion, 1);
  assert.deepEqual(plain(Engine.scoreSectionMaximums), {
    environmental: 30,
    behavior: 30,
    tank: 25,
    habitat: 15,
  });
  scenarios += 1;

  const empty = analyze(Engine, []);
  assert.equal(empty.score, 0);
  assert.equal(empty.scoreBreakdown.uncappedScore, 0);
  assert.equal(empty.scoreBreakdown.appliedCap, null);
  for (const section of Object.values(empty.scoreBreakdown.sections)) {
    assert.equal(section.status, 'not_evaluated');
    assert.equal(section.score, 0);
  }
  scenarios += 1;

  const healthy = analyze(Engine, [{ id: 'healthy', qty: 1 }]);
  assert.equal(healthy.score, 100);
  assert.equal(healthy.verdict, 'excellent');
  assert.equal(healthy.scoreBreakdown.uncappedScore, 100);
  assertSection(healthy.scoreBreakdown.sections.environmental, 30, 30, 'good');
  assertSection(healthy.scoreBreakdown.sections.behavior, 30, 30, 'good');
  assertSection(healthy.scoreBreakdown.sections.tank, 25, 25, 'good');
  assertSection(healthy.scoreBreakdown.sections.habitat, 15, 15, 'good');
  scenarios += 1;

  const waterMismatch = analyze(Engine, [{ id: 'marine', qty: 1 }]);
  assertSection(waterMismatch.scoreBreakdown.sections.environmental, 0, 30, 'critical');
  assert.equal(waterMismatch.scoreBreakdown.uncappedScore, 70);
  assert.equal(waterMismatch.scoreBreakdown.appliedCap, 39);
  assert.equal(waterMismatch.score, 39);
  assert.equal(waterMismatch.verdict, 'poor');
  assert(!waterMismatch.tips.some((finding) => finding.ruleId === 'COMPOSITION_HEALTHY'));
  scenarios += 1;

  const parameterMismatch = analyze(Engine, [
    { id: 'acid', qty: 1 },
    { id: 'alkaline', qty: 1 },
  ]);
  assert.equal(parameterMismatch.params.pH, null);
  assert.equal(parameterMismatch.scoreBreakdown.sections.environmental.score, 0);
  assert.equal(parameterMismatch.scoreBreakdown.sections.behavior.score, 30);
  assert.equal(parameterMismatch.score, 39);
  scenarios += 1;

  const tankCritical = analyze(Engine, [{ id: 'large', qty: 1 }]);
  assertSection(tankCritical.scoreBreakdown.sections.tank, 0, 25, 'critical');
  assert.equal(tankCritical.scoreBreakdown.uncappedScore, 75);
  assert.equal(tankCritical.scoreBreakdown.appliedCap, 59);
  assert.equal(tankCritical.score, 59);
  scenarios += 1;

  const behaviorCritical = analyze(Engine, [
    { id: 'predator', qty: 1 },
    { id: 'prey', qty: 1 },
  ]);
  assertSection(behaviorCritical.scoreBreakdown.sections.behavior, 0, 30, 'critical');
  assert.equal(behaviorCritical.scoreBreakdown.uncappedScore, 70);
  assert.equal(behaviorCritical.scoreBreakdown.appliedCap, 49);
  assert.equal(behaviorCritical.score, 49);
  scenarios += 1;

  const socialWarning = analyze(Engine, [{ id: 'school', qty: 2 }]);
  assertSection(socialWarning.scoreBreakdown.sections.behavior, 24, 30, 'warning');
  assert.equal(socialWarning.score, 94);
  assert.deepEqual(
    plain(socialWarning.scoreBreakdown.sections.behavior.ruleIds),
    ['SCHOOLING_MINIMUM'],
  );
  scenarios += 1;

  const tankWarning = analyze(Engine, [{ id: 'healthy', qty: 1 }], { volume: 22 });
  assertSection(tankWarning.scoreBreakdown.sections.tank, 18, 25, 'warning');
  assert.equal(tankWarning.score, 93);
  scenarios += 1;

  const habitatWarning = analyze(
    Engine,
    [{ id: 'grazer', qty: 1 }],
    { plants: ['plant'] },
  );
  assertSection(habitatWarning.scoreBreakdown.sections.habitat, 11, 15, 'warning');
  assert.equal(habitatWarning.score, 96);
  assert.deepEqual(
    plain(habitatWarning.scoreBreakdown.sections.habitat.ruleIds),
    ['PLANT_DAMAGE_RISK'],
  );
  scenarios += 1;

  const noTank = analyze(Engine, [{ id: 'healthy', qty: 1 }], { volume: 0 });
  assertSection(noTank.scoreBreakdown.sections.tank, 0, 25, 'not_evaluated');
  assert.equal(noTank.score, 75);
  scenarios += 1;

  const english = analyze(Engine, [{ id: 'marine', qty: 1 }], { lang: 'en' });
  assert.equal(english.scoreBreakdown.sections.environmental.label, 'Environmental compatibility');
  assert.match(english.scoreBreakdown.sections.environmental.summary, /critical issue/i);
  assert.match(english.scoreBreakdown.caps[0].reason, /critical issue/i);
  scenarios += 1;

  assertProductionConnections(repositoryRoot);
  scenarios += 1;

  assert.equal(scenarios, 13);
  return {
    version: Engine.scoreBreakdownVersion,
    scenarios,
    sections: Object.keys(plain(Engine.scoreSectionMaximums)).length,
    maximumTotal: Object.values(plain(Engine.scoreSectionMaximums))
      .reduce((total, value) => total + value, 0),
    environmentalCriticalCap: 39,
    tankCriticalCap: 59,
    behaviorCriticalCap: 49,
    habitatCriticalCap: 69,
    bilingual: true,
    productionConnected: true,
  };
}
