import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

import Ajv2020 from 'ajv/dist/2020.js';

import { loadLegacyData } from './load-legacy-data.mjs';

const EXPECTED_RULE_IDS = Object.freeze([
  'PAIR_OVERRIDE_COMPATIBLE',
  'PAIR_OVERRIDE_CAUTION',
  'PAIR_OVERRIDE_CONDITIONAL',
  'PAIR_OVERRIDE_INCOMPATIBLE',
]);
const GENERAL_PAIR_RULE_IDS = new Set([
  'PAIRWISE_COMPATIBLE',
  'PAIRWISE_CAUTION',
  'PAIRWISE_INCOMPATIBLE',
  'CONGENERIC_AGGRESSION',
  'PREDATION_SIZE_RISK',
  'REEF_SOFT_CORAL_RISK',
  'REEF_LPS_CORAL_RISK',
  'REEF_SPS_CORAL_RISK',
  'REEF_SHRIMP_RISK',
  'REEF_SNAIL_RISK',
  'REEF_CRAB_RISK',
  'REEF_CLAM_RISK',
]);

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function readJson(repositoryRoot, relativePath) {
  return JSON.parse(readFileSync(resolve(repositoryRoot, relativePath), 'utf8'));
}

function createEngine(repositoryRoot, database, filenames = [
  'engine.js',
  'engine-finding-contract.js',
  'engine-health-guard.js',
  'engine-social-rules.js',
  'engine-conspecific-rules.js',
  'engine-predator-prey-rules.js',
  'engine-reef-invertebrate-rules.js',
  'engine-compatibility-overrides.js',
  'engine-domain-results.js',
]) {
  const context = vm.createContext({ window: { DB: plain(database) } });
  for (const filename of filenames) {
    new vm.Script(readFileSync(resolve(repositoryRoot, filename), 'utf8'), { filename })
      .runInContext(context);
  }
  return context.window.Engine;
}

function analyze(Engine, ids, options = {}) {
  return Engine.analyze({
    lang: options.lang || 'tr',
    water: options.water || 'fresh',
    volume: options.volume || 10000,
    fish: ids.map((id) => ({ id, qty: 1 })),
    plants: [],
    substrate: null,
    co2: false,
  });
}

function overrideFindings(result) {
  return [
    ...(result.issues || []),
    ...(result.warnings || []),
    ...(result.tips || []),
  ].filter((finding) => EXPECTED_RULE_IDS.includes(finding.ruleId));
}

function pairFor(result, firstId, secondId) {
  return (result.compat || []).find((entry) => (
    (entry.a === firstId && entry.b === secondId)
    || (entry.a === secondId && entry.b === firstId)
  ));
}

function generalPairFindings(result, firstId, secondId) {
  return [
    ...(result.issues || []),
    ...(result.warnings || []),
    ...(result.tips || []),
  ].filter((finding) => (
    GENERAL_PAIR_RULE_IDS.has(finding.ruleId)
    && finding.subjects?.includes(firstId)
    && finding.subjects?.includes(secondId)
  ));
}

function syntheticLegacy(id, pH) {
  return {
    id,
    nameTr: id,
    nameEn: id,
    water: 'fresh',
    minVolume: 20,
    perFishL: 2,
    schooling: 0,
    pH,
    temp: [24, 26],
    gh: [5, 10],
    aggression: 'peaceful',
    size: 4,
    adultSize: 4,
    finNippers: false,
    longFinned: false,
    plantSafe: true,
    reefSafe: true,
  };
}

function syntheticCanonical(id) {
  return {
    id,
    name: { tr: id, en: id },
    entityType: 'freshwater_fish',
  };
}

function assertProductionConnections(repositoryRoot) {
  const bootSource = readFileSync(resolve(repositoryRoot, 'boot.js'), 'utf8');
  const viteSource = readFileSync(resolve(repositoryRoot, 'vite.config.js'), 'utf8');
  const packageSource = readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8');

  assert.match(bootSource, /compatibility-overrides-v1\.json/);
  assert.match(bootSource, /engine-compatibility-overrides\.js/);
  assert.match(viteSource, /compatibility-overrides-v1\.json/);
  assert.match(viteSource, /engine-compatibility-overrides\.js/);
  assert.match(packageSource, /check:engine-pairs/);
}

export function validateEngineCompatibilityOverrides(repositoryRoot) {
  const overrides = readJson(
    repositoryRoot,
    'data/curation/compatibility-overrides-v1.json',
  );
  const overrideSchema = readJson(
    repositoryRoot,
    'schemas/compatibility-override-v1.schema.json',
  );
  const findingSchema = readJson(
    repositoryRoot,
    'schemas/engine-finding-v1.schema.json',
  );
  const sourceCatalog = readJson(repositoryRoot, 'data/sources/source-catalog.json');
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validateOverrides = ajv.compile(overrideSchema);
  const validateFinding = ajv.compile(findingSchema);

  assert(
    validateOverrides(overrides),
    ajv.errorsText(validateOverrides.errors, { separator: '\n' }),
  );
  assert.equal(overrides.length, 50, 'AKV-ENG-015 tam olarak 50 doğrulanmış istisnayı içermelidir.');

  const ids = new Set();
  const relationshipKeys = new Set();
  const statuses = {};
  for (const override of overrides) {
    assert(!ids.has(override.id), `Tekrarlanan istisna kimliği: ${override.id}`);
    ids.add(override.id);
    const pair = [override.a, override.b].sort().join('|');
    const relationshipKey = `${pair}|${override.direction}`;
    assert(!relationshipKeys.has(relationshipKey), `Tekrarlanan tür çifti/yön: ${relationshipKey}`);
    relationshipKeys.add(relationshipKey);
    assert.notEqual(override.a, override.b, `${override.id}: tür çifti aynı kimliği kullanamaz.`);
    statuses[override.status] = (statuses[override.status] || 0) + 1;
  }
  for (const status of ['compatible', 'caution', 'conditional', 'incompatible']) {
    assert(statuses[status] > 0, `${status} durumunda örnek istisna yok.`);
  }
  assert.deepEqual(statuses, {
    compatible: 23,
    conditional: 17,
    caution: 5,
    incompatible: 5,
  });

  const sourceById = new Map(sourceCatalog.sources.map((source) => [source.id, source]));
  for (const override of overrides) {
    for (const sourceId of override.sourceIds) {
      const source = sourceById.get(sourceId);
      assert(source, `${override.id}: bilinmeyen kaynak ${sourceId}`);
      assert.equal(source.status, 'verified', `${override.id}: kaynak doğrulanmış değil.`);
      assert(source.fields.includes('compatibilityOverrides'));
      assert(['medium', 'high'].includes(source.confidence));
    }
  }

  const data = loadLegacyData(repositoryRoot, {
    withProvenance: true,
    withMigration: true,
    withPriorityCuration: true,
    withCatalog: true,
  });
  const productionIds = new Set(data.fish.map((record) => record.id));
  for (const override of overrides) {
    assert(productionIds.has(override.a), `${override.id}: katalogda ${override.a} yok.`);
    assert(productionIds.has(override.b), `${override.id}: katalogda ${override.b} yok.`);
  }

  const Engine = createEngine(repositoryRoot, {
    fish: data.fish,
    inhabitants: data.inhabitants,
    plants: data.plants,
    substrates: data.substrates,
    sources: data.sources,
    predatorPreyProfiles: [],
    compatibilityOverrides: overrides,
  });
  assert.equal(Engine.compatibilityOverrideRulesVersion, 1);
  assert.deepEqual(plain(Engine.compatibilityOverrideRuleIds), EXPECTED_RULE_IDS);

  let scenarios = 4;
  let findingsValidated = 0;

  const compatible = analyze(Engine, ['cherry-shrimp', 'nerite-snail']);
  assert.deepEqual(plain(overrideFindings(compatible).map((item) => item.ruleId)), [
    'PAIR_OVERRIDE_COMPATIBLE',
  ]);
  assert.equal(pairFor(compatible, 'cherry-shrimp', 'nerite-snail').status, 'ok');
  assert.equal(compatible.pairOverrides.applied.length, 1);
  assert.equal(compatible.score, 92);
  assert(
    compatible.warnings.some((finding) => finding.ruleId === 'SCHOOLING_MINIMUM'),
    'Tür çifti uyumu, canlıya ait bağımsız sosyal grup uyarısını silmemelidir.',
  );
  scenarios += 1;

  const conditional = analyze(Engine, ['betta', 'ember-tetra']);
  assert.deepEqual(plain(overrideFindings(conditional).map((item) => item.ruleId)), [
    'PAIR_OVERRIDE_CONDITIONAL',
  ]);
  assert.equal(pairFor(conditional, 'betta', 'ember-tetra').status, 'warn');
  assert.equal(generalPairFindings(conditional, 'betta', 'ember-tetra').length, 0);
  assert.match(overrideFindings(conditional)[0].desc, /Koşullar:/);
  scenarios += 1;

  const caution = analyze(Engine, ['betta', 'cherry-shrimp']);
  assert.deepEqual(plain(overrideFindings(caution).map((item) => item.ruleId)), [
    'PAIR_OVERRIDE_CAUTION',
  ]);
  assert.equal(overrideFindings(caution)[0].evidence.direction, 'b_to_a');
  assert.equal(generalPairFindings(caution, 'betta', 'cherry-shrimp').length, 0);
  scenarios += 1;

  const incompatible = analyze(Engine, ['cherry-shrimp', 'puffer-pea']);
  assert.deepEqual(plain(overrideFindings(incompatible).map((item) => item.ruleId)), [
    'PAIR_OVERRIDE_INCOMPATIBLE',
  ]);
  assert.equal(pairFor(incompatible, 'cherry-shrimp', 'puffer-pea').status, 'bad');
  assert.equal(incompatible.tips.some((finding) => finding.ruleId === 'COMPOSITION_HEALTHY'), false);
  scenarios += 1;

  const marine = analyze(Engine, ['goby-yellow-watchman', 'pistol-shrimp'], {
    water: 'salt',
  });
  assert.deepEqual(plain(overrideFindings(marine).map((item) => item.ruleId)), [
    'PAIR_OVERRIDE_COMPATIBLE',
  ]);
  assert.equal(marine.pairOverrides.applied[0].sourceIds[0], 'brs-watchman-goby-pistol-shrimp-2026');
  scenarios += 1;

  const secondCompatible = analyze(Engine, ['goldfish', 'loach-hillstream']);
  assert.deepEqual(plain(overrideFindings(secondCompatible).map((item) => item.ruleId)), [
    'PAIR_OVERRIDE_COMPATIBLE',
  ]);
  assert.equal(pairFor(secondCompatible, 'goldfish', 'loach-hillstream').status, 'ok');
  assert.equal(secondCompatible.pairOverrides.available, 50);
  assert.equal(
    secondCompatible.pairOverrides.applied[0].sourceIds[0],
    'aquarium-coop-goldfish-tank-mates-2026',
  );
  scenarios += 1;

  const secondConditional = analyze(Engine, ['goldfish', 'white-cloud']);
  assert.deepEqual(plain(overrideFindings(secondConditional).map((item) => item.ruleId)), [
    'PAIR_OVERRIDE_CONDITIONAL',
  ]);
  assert.match(overrideFindings(secondConditional)[0].desc, /Koşullar:/);
  assert.equal(generalPairFindings(secondConditional, 'goldfish', 'white-cloud').length, 0);
  scenarios += 1;

  const secondCaution = analyze(Engine, ['goldfish', 'corydoras']);
  assert.deepEqual(plain(overrideFindings(secondCaution).map((item) => item.ruleId)), [
    'PAIR_OVERRIDE_CAUTION',
  ]);
  assert.equal(overrideFindings(secondCaution)[0].evidence.direction, 'a_to_b');
  assert.equal(generalPairFindings(secondCaution, 'goldfish', 'corydoras').length, 0);
  scenarios += 1;

  const secondIncompatible = analyze(Engine, ['guppy', 'barb-tiger']);
  assert.deepEqual(plain(overrideFindings(secondIncompatible).map((item) => item.ruleId)), [
    'PAIR_OVERRIDE_INCOMPATIBLE',
  ]);
  assert.equal(pairFor(secondIncompatible, 'guppy', 'barb-tiger').status, 'bad');
  assert.equal(secondIncompatible.tips.some((finding) => finding.ruleId === 'COMPOSITION_HEALTHY'), false);
  scenarios += 1;

  const secondEnglish = analyze(Engine, ['angelfish', 'cherry-shrimp'], { lang: 'en' });
  assert.match(overrideFindings(secondEnglish)[0].title, /verified incompatible/i);
  assert.match(overrideFindings(secondEnglish)[0].resolution, /separate/i);
  assert.equal(overrideFindings(secondEnglish)[0].evidence.direction, 'a_to_b');
  scenarios += 1;

  const english = analyze(Engine, ['cherry-shrimp', 'puffer-pea'], { lang: 'en' });
  assert.match(overrideFindings(english)[0].title, /verified incompatible/i);
  assert.match(overrideFindings(english)[0].resolution, /same tank/i);
  scenarios += 1;

  const noOverride = analyze(Engine, ['neon-tetra', 'cardinal-tetra']);
  assert.equal(overrideFindings(noOverride).length, 0);
  assert.equal(noOverride.pairOverrides.applied.length, 0);
  scenarios += 1;

  const environmentalEngine = createEngine(
    repositoryRoot,
    {
      fish: [
        syntheticLegacy('acid-fish', [5, 6]),
        syntheticLegacy('alkaline-fish', [7.5, 8.5]),
      ],
      inhabitants: [
        syntheticCanonical('acid-fish'),
        syntheticCanonical('alkaline-fish'),
      ],
      plants: [],
      substrates: [],
      compatibilityOverrides: [{
        id: 'acid-alkaline-compatible',
        a: 'acid-fish',
        b: 'alkaline-fish',
        direction: 'both',
        status: 'compatible',
        reasons: [{ tr: 'Davranış uyumu.', en: 'Behaviorally compatible.' }],
        conditions: [],
        impact: { tr: 'Davranış riski yok.', en: 'No behavioral risk.' },
        resolution: { tr: 'Su değerlerini ayrıca kontrol et.', en: 'Check water values separately.' },
        sourceIds: ['synthetic-source'],
        verifiedAt: '2026-07-23',
        verification: { status: 'verified', confidence: 'medium' },
      }],
    },
    [
      'engine.js',
      'engine-finding-contract.js',
      'engine-health-guard.js',
      'engine-compatibility-overrides.js',
    ],
  );
  const environmental = analyze(environmentalEngine, ['acid-fish', 'alkaline-fish']);
  assert.equal(overrideFindings(environmental)[0].ruleId, 'PAIR_OVERRIDE_COMPATIBLE');
  assert(
    environmental.issues.some((finding) => finding.ruleId === 'PARAMETER_PH_NO_COMMON_RANGE'),
    'Tür çifti istisnası çevresel pH uyumsuzluğunu silmemelidir.',
  );
  assert.equal(environmental.params.pH, null);
  scenarios += 1;

  const produced = [
    ...overrideFindings(compatible),
    ...overrideFindings(conditional),
    ...overrideFindings(caution),
    ...overrideFindings(incompatible),
    ...overrideFindings(marine),
    ...overrideFindings(secondCompatible),
    ...overrideFindings(secondConditional),
    ...overrideFindings(secondCaution),
    ...overrideFindings(secondIncompatible),
    ...overrideFindings(secondEnglish),
    ...overrideFindings(english),
    ...overrideFindings(environmental),
  ];
  for (const finding of produced) {
    assert(validateFinding(plain(finding)), ajv.errorsText(validateFinding.errors));
    findingsValidated += 1;
  }
  scenarios += 1;

  assertProductionConnections(repositoryRoot);
  scenarios += 1;
  assert.equal(scenarios, 19);

  return {
    version: 1,
    overrides: overrides.length,
    statuses,
    sources: new Set(overrides.flatMap((override) => override.sourceIds)).size,
    scenarios,
    ruleIds: EXPECTED_RULE_IDS.length,
    findingsValidated,
    allEntityIdsResolved: true,
    allSourceIdsResolved: true,
    environmentalRulesPreserved: true,
  };
}
