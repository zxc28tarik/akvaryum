import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

import Ajv2020 from 'ajv/dist/2020.js';

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function legacyFish(id, overrides = {}) {
  return {
    id,
    nameTr: overrides.nameTr || id,
    nameEn: overrides.nameEn || id,
    water: 'salt',
    minVolume: 20,
    perFishL: 2,
    schooling: 0,
    pH: [8, 8.4],
    temp: [24, 26],
    gh: [8, 12],
    aggression: 'peaceful',
    size: 5,
    finNippers: false,
    longFinned: false,
    plantSafe: true,
    reefSafe: true,
    ...overrides,
  };
}

function canonical(id, entityType, compatibility = {}, overrides = {}) {
  return {
    id,
    name: {
      tr: overrides.nameTr || id,
      en: overrides.nameEn || id,
    },
    entityType,
    size: { adultCm: [5, 5] },
    tank: { minVolumeL: 20 },
    social: {
      mode: 'solitary',
      conspecificAggression: 'low',
      territoriality: 'low',
    },
    behavior: {
      temperament: 'peaceful',
      activity: 'moderate',
      zone: ['rockwork'],
      finNipper: false,
      longFinned: false,
    },
    compatibility: {
      plantSafe: true,
      coralSafe: 'yes',
      ...compatibility,
    },
    sourceIds: ['synthetic-reef-source'],
    verification: {
      status: 'reviewed',
      confidence: 'medium',
      notes: ['Synthetic reef-safety validation record.'],
    },
    ...overrides,
  };
}

function createEngine(repositoryRoot, inhabitants, legacyRecords) {
  const sources = [
    'engine.js',
    'engine-finding-contract.js',
    'engine-health-guard.js',
    'engine-social-rules.js',
    'engine-conspecific-rules.js',
    'engine-predator-prey-rules.js',
    'engine-domain-results.js',
    'engine-reef-invertebrate-rules.js',
  ];
  const context = vm.createContext({
    window: {
      DB: {
        inhabitants,
        fish: legacyRecords,
        predatorPreyProfiles: [],
        plants: [],
        substrates: [],
      },
    },
  });

  for (const filename of sources) {
    new vm.Script(
      readFileSync(resolve(repositoryRoot, filename), 'utf8'),
      { filename },
    ).runInContext(context);
  }
  return context.window.Engine;
}

function analyze(Engine, ids, options = {}) {
  return Engine.analyze({
    lang: options.lang || 'tr',
    water: options.water || 'salt',
    volume: 1000,
    fish: ids.map((id) => ({ id, qty: 1 })),
    plants: [],
    substrate: null,
    co2: false,
  });
}

function reefFindings(result) {
  return (result.warnings || []).filter((finding) => /^REEF_(SOFT_CORAL|LPS_CORAL|SPS_CORAL|SHRIMP|SNAIL|CRAB|CLAM)_RISK$/.test(finding.ruleId));
}

function assertNoGenericReefWarning(result) {
  assert.equal(
    (result.warnings || []).filter((finding) => finding.ruleId === 'REEF_UNSAFE_INHABITANT').length,
    0,
    'Eski birleşik REEF_UNSAFE_INHABITANT uyarısı kalmamalıdır.',
  );
  assert(!(result.warnings || []).some((finding) => /resif güvenli değil$|is not reef-safe$/i.test(String(finding.title || ''))));
}

export function validateEngineReefInvertebrateRules(repositoryRoot) {
  const findingSchema = JSON.parse(
    readFileSync(resolve(repositoryRoot, 'schemas/engine-finding-v1.schema.json'), 'utf8'),
  );
  const inhabitantSchema = JSON.parse(
    readFileSync(resolve(repositoryRoot, 'schemas/inhabitant-v1.schema.json'), 'utf8'),
  );
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validateFinding = ajv.compile(findingSchema);

  const compatibilityProperties = inhabitantSchema.$defs.inhabitant.properties.compatibility.properties;
  for (const field of ['softCoralSafe', 'lpsSafe', 'spsSafe', 'shrimpSafe', 'snailSafe', 'crabSafe', 'clamSafe']) {
    assert(compatibilityProperties[field], `Inhabitant v1 compatibility.${field} alanı eksik.`);
  }

  const inhabitants = [
    canonical('unsafe-fish', 'marine_fish', { coralSafe: 'no', shrimpSafe: false, snailSafe: 'with_caution', crabSafe: false, clamSafe: false }, { nameTr: 'Riskli Balık', nameEn: 'Risky Fish' }),
    canonical('explicit-safe-fish', 'marine_fish', { coralSafe: 'no', softCoralSafe: true }, { nameTr: 'Açık Güvenli Balık', nameEn: 'Explicit Safe Fish' }),
    canonical('split-fish', 'marine_fish', { coralSafe: 'yes', lpsSafe: false, spsSafe: 'with_caution' }, { nameTr: 'Ayrık Balık', nameEn: 'Split Fish' }),
    canonical('unknown-fish', 'marine_fish', { coralSafe: 'yes' }, { nameTr: 'Bilinmeyen Balık', nameEn: 'Unknown Fish' }),
    canonical('legacy-fallback-fish', 'marine_fish', {}, { compatibility: undefined, nameTr: 'Eski Fallback Balığı', nameEn: 'Legacy Fallback Fish' }),
    canonical('mushroom-coral', 'soft_coral', { coralSafe: 'yes' }, { nameTr: 'Mantar Mercanı', nameEn: 'Mushroom Coral' }),
    canonical('torch-coral', 'lps_coral', { coralSafe: 'yes' }, { nameTr: 'Torch Mercanı', nameEn: 'Torch Coral' }),
    canonical('acropora', 'sps_coral', { coralSafe: 'yes' }, { nameTr: 'Acropora', nameEn: 'Acropora' }),
    canonical('cleaner-shrimp', 'marine_shrimp', { coralSafe: 'yes' }, { nameTr: 'Temizlik Karidesi', nameEn: 'Cleaner Shrimp' }),
    canonical('turbo-snail', 'snail', { coralSafe: 'yes' }, { nameTr: 'Turbo Salyangoz', nameEn: 'Turbo Snail' }),
    canonical('emerald-crab', 'crab', { coralSafe: 'yes' }, { nameTr: 'Zümrüt Yengeç', nameEn: 'Emerald Crab' }),
    canonical('tridacna-clam', 'bivalve', { coralSafe: 'yes' }, { nameTr: 'Tridacna', nameEn: 'Tridacna Clam' }),
  ];

  const legacyRecords = inhabitants.map((record) => legacyFish(record.id, {
    nameTr: record.name.tr,
    nameEn: record.name.en,
    reefSafe: record.id !== 'unsafe-fish' && record.id !== 'explicit-safe-fish' && record.id !== 'legacy-fallback-fish',
  }));

  const Engine = createEngine(repositoryRoot, inhabitants, legacyRecords);
  assert.equal(Engine.reefSafetyRulesVersion, 1);
  assert.deepEqual(plain(Engine.reefSafetyRuleIds), [
    'REEF_SOFT_CORAL_RISK',
    'REEF_LPS_CORAL_RISK',
    'REEF_SPS_CORAL_RISK',
    'REEF_SHRIMP_RISK',
    'REEF_SNAIL_RISK',
    'REEF_CRAB_RISK',
    'REEF_CLAM_RISK',
  ]);

  let scenarios = 2;
  let findingsValidated = 0;

  const withoutTarget = analyze(Engine, ['unsafe-fish']);
  assert.equal(reefFindings(withoutTarget).length, 0);
  assert.equal(withoutTarget.reefSafety.active, false);
  scenarios += 1;

  const softFallback = analyze(Engine, ['unsafe-fish', 'mushroom-coral']);
  assertNoGenericReefWarning(softFallback);
  assert.deepEqual(reefFindings(softFallback).map((finding) => finding.ruleId), ['REEF_SOFT_CORAL_RISK']);
  assert.equal(reefFindings(softFallback)[0].evidence.method, 'generic_coral_fallback');
  assert.equal(softFallback.score, 92);
  scenarios += 1;

  const explicitSafe = analyze(Engine, ['explicit-safe-fish', 'mushroom-coral']);
  assertNoGenericReefWarning(explicitSafe);
  assert.equal(reefFindings(explicitSafe).length, 0);
  assert.equal(explicitSafe.reefSafety.assessments.find((item) => item.actorId === 'explicit-safe-fish').method, 'target_specific_field');
  assert.equal(explicitSafe.score, 100);
  scenarios += 1;

  const splitCoral = analyze(Engine, ['split-fish', 'torch-coral', 'acropora']);
  assert.deepEqual(reefFindings(splitCoral).map((finding) => finding.ruleId), ['REEF_LPS_CORAL_RISK', 'REEF_SPS_CORAL_RISK']);
  assert.equal(reefFindings(splitCoral)[0].evidence.safetyStatus, 'no');
  assert.equal(reefFindings(splitCoral)[1].evidence.safetyStatus, 'with_caution');
  scenarios += 1;

  const shrimpRisk = analyze(Engine, ['unsafe-fish', 'cleaner-shrimp']);
  assert.deepEqual(reefFindings(shrimpRisk).map((finding) => finding.ruleId), ['REEF_SHRIMP_RISK']);
  assert.equal(shrimpRisk.reefSafety.targetTypes.includes('shrimp'), true);
  scenarios += 1;

  const snailRisk = analyze(Engine, ['unsafe-fish', 'turbo-snail']);
  assert.deepEqual(reefFindings(snailRisk).map((finding) => finding.ruleId), ['REEF_SNAIL_RISK']);
  assert.equal(reefFindings(snailRisk)[0].evidence.safetyStatus, 'with_caution');
  scenarios += 1;

  const crabRisk = analyze(Engine, ['unsafe-fish', 'emerald-crab']);
  assert.deepEqual(reefFindings(crabRisk).map((finding) => finding.ruleId), ['REEF_CRAB_RISK']);
  scenarios += 1;

  const clamRisk = analyze(Engine, ['unsafe-fish', 'tridacna-clam']);
  assert.deepEqual(reefFindings(clamRisk).map((finding) => finding.ruleId), ['REEF_CLAM_RISK']);
  scenarios += 1;

  const unknownShrimp = analyze(Engine, ['unknown-fish', 'cleaner-shrimp']);
  assert.equal(reefFindings(unknownShrimp).length, 0);
  assert.equal(unknownShrimp.reefSafety.unknownCount, 1);
  assert.equal(unknownShrimp.reefSafety.assessments[0].method, 'missing_target_specific_data');
  scenarios += 1;

  const legacyFallback = analyze(Engine, ['legacy-fallback-fish', 'acropora']);
  assert.deepEqual(reefFindings(legacyFallback).map((finding) => finding.ruleId), ['REEF_SPS_CORAL_RISK']);
  assert.equal(reefFindings(legacyFallback)[0].evidence.method, 'legacy_coral_fallback');
  scenarios += 1;

  const coralAlone = analyze(Engine, ['mushroom-coral']);
  assertNoGenericReefWarning(coralAlone);
  assert.equal(coralAlone.reefSafety.assessments.length, 0);
  assert.equal(coralAlone.score, 100);
  scenarios += 1;

  const freshwaterInactive = analyze(Engine, ['unsafe-fish', 'mushroom-coral'], { water: 'fresh' });
  assert.equal(freshwaterInactive.reefSafety.active, false);
  assert.equal(reefFindings(freshwaterInactive).length, 0);
  scenarios += 1;

  const english = analyze(Engine, ['unsafe-fish', 'cleaner-shrimp'], { lang: 'en' });
  assert.match(reefFindings(english)[0].title, /unsafe with shrimp/i);
  assert.match(reefFindings(english)[0].resolution, /verified pair-specific/i);
  scenarios += 1;

  const produced = [softFallback, splitCoral, shrimpRisk, snailRisk, crabRisk, clamRisk, legacyFallback, english]
    .flatMap((result) => reefFindings(result));
  for (const finding of produced) {
    assert(validateFinding(plain(finding)), ajv.errorsText(validateFinding.errors));
    findingsValidated += 1;
  }

  assert.equal(scenarios, 15);
  assert.equal(new Set(produced.map((finding) => finding.ruleId)).size, 7);

  return {
    version: 1,
    scenarios,
    ruleIds: Engine.reefSafetyRuleIds.length,
    findingsValidated,
    targetTypes: Object.keys(Engine.reefSafetyRuleIds).length,
    genericWarningRemoved: true,
    unknownDataDoesNotGuess: true,
  };
}
