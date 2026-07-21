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
    nameTr: overrides.name?.tr || overrides.nameTr || id,
    nameEn: overrides.name?.en || overrides.nameEn || id,
    water: 'fresh',
    minVolume: 20,
    perFishL: 2,
    schooling: overrides.legacySchooling || 0,
    pH: [6, 7],
    temp: [22, 24],
    gh: [2, 5],
    aggression: 'peaceful',
    size: 5,
    finNippers: false,
    longFinned: false,
    plantSafe: true,
    reefSafe: true,
    ...overrides.legacy,
  };
}

function canonical(id, social, overrides = {}) {
  return {
    id,
    name: { tr: overrides.nameTr || id, en: overrides.nameEn || id },
    social,
    ...overrides,
  };
}

function createEngine(repositoryRoot, inhabitants) {
  const engineSource = readFileSync(resolve(repositoryRoot, 'engine.js'), 'utf8');
  const contractSource = readFileSync(resolve(repositoryRoot, 'engine-finding-contract.js'), 'utf8');
  const healthSource = readFileSync(resolve(repositoryRoot, 'engine-health-guard.js'), 'utf8');
  const socialSource = readFileSync(resolve(repositoryRoot, 'engine-social-rules.js'), 'utf8');
  const context = vm.createContext({
    window: {
      DB: {
        inhabitants,
        fish: inhabitants.map((record) => legacyFish(record.id, record)),
        plants: [],
        substrates: [],
      },
    },
  });
  new vm.Script(engineSource, { filename: 'engine.js' }).runInContext(context);
  new vm.Script(contractSource, { filename: 'engine-finding-contract.js' }).runInContext(context);
  new vm.Script(healthSource, { filename: 'engine-health-guard.js' }).runInContext(context);
  new vm.Script(socialSource, { filename: 'engine-social-rules.js' }).runInContext(context);
  return context.window.Engine;
}

function analyze(Engine, fish, lang = 'tr') {
  return Engine.analyze({
    lang,
    water: 'fresh',
    volume: 100,
    fish,
    plants: [],
    substrate: null,
    co2: false,
  });
}

function socialWarnings(result) {
  return result.warnings.filter((finding) => String(finding.ruleId).startsWith('SOCIAL_'));
}

function socialWarningIds(result) {
  return plain(socialWarnings(result).map((finding) => finding.ruleId));
}

function plainSocialWarnings(result) {
  return plain(socialWarnings(result));
}

export function validateEngineSocialRules(repositoryRoot) {
  const findingSchema = JSON.parse(readFileSync(resolve(repositoryRoot, 'schemas/engine-finding-v1.schema.json'), 'utf8'));
  const inhabitantSchema = JSON.parse(readFileSync(resolve(repositoryRoot, 'schemas/inhabitant-v1.schema.json'), 'utf8'));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validateFinding = ajv.compile(findingSchema);

  assert(inhabitantSchema.$defs.sexRatio, 'Inhabitant v1 cinsiyet oranı sözleşmesi eksik.');
  assert.equal(
    inhabitantSchema.$defs.inhabitant.properties.social.properties.sexRatio.$ref,
    '#/$defs/sexRatio',
    'Sosyal yapı cinsiyet oranı sözleşmesine bağlı olmalıdır.',
  );

  let scenarios = 2;
  const records = [
    canonical('group-fish', { mode: 'group', minGroup: 4, recommendedGroup: 6, conspecificAggression: 'none', territoriality: 'none' }, { nameTr: 'Grup Balığı', nameEn: 'Group Fish' }),
    canonical('legacy-school', { mode: 'school', minGroup: 6, recommendedGroup: 6, conspecificAggression: 'none', territoriality: 'none' }, { nameTr: 'Sürü Balığı', nameEn: 'School Fish', legacySchooling: 6 }),
    canonical('pair-fish', { mode: 'pair', conspecificAggression: 'low', territoriality: 'low' }, { nameTr: 'Çift Balığı', nameEn: 'Pair Fish' }),
    canonical('harem-fish', { mode: 'harem', minGroup: 3, recommendedGroup: 4, conspecificAggression: 'medium', territoriality: 'medium' }, { nameTr: 'Harem Balığı', nameEn: 'Harem Fish' }),
    canonical('ratio-fish', {
      mode: 'harem',
      minGroup: 3,
      recommendedGroup: 4,
      sexRatio: { minMales: 1, minFemales: 2, maxMales: 1 },
      conspecificAggression: 'medium',
      territoriality: 'medium',
    }, { nameTr: 'Oran Balığı', nameEn: 'Ratio Fish' }),
  ];
  const Engine = createEngine(repositoryRoot, records);
  assert.equal(Engine.socialRulesVersion, 1);
  assert.deepEqual(plain(Engine.socialRuleIds), [
    'SOCIAL_GROUP_MINIMUM',
    'SOCIAL_PAIR_COUNT',
    'SOCIAL_HAREM_MINIMUM',
    'SOCIAL_SEX_RATIO',
  ]);
  scenarios += 1;

  const groupLow = analyze(Engine, [{ id: 'group-fish', qty: 2 }]);
  assert.deepEqual(socialWarningIds(groupLow), ['SOCIAL_GROUP_MINIMUM']);
  assert.equal(groupLow.score, 92);
  scenarios += 1;

  const groupMinimum = analyze(Engine, [{ id: 'group-fish', qty: 4 }]);
  assert.deepEqual(plainSocialWarnings(groupMinimum), []);
  scenarios += 1;

  const legacySchool = analyze(Engine, [{ id: 'legacy-school', qty: 2 }]);
  assert.equal(legacySchool.warnings.filter((finding) => finding.ruleId === 'SCHOOLING_MINIMUM').length, 1);
  assert.deepEqual(plainSocialWarnings(legacySchool), []);
  scenarios += 1;

  const pairLow = analyze(Engine, [{ id: 'pair-fish', qty: 1 }]);
  assert.deepEqual(socialWarningIds(pairLow), ['SOCIAL_PAIR_COUNT']);
  scenarios += 1;

  const pairExact = analyze(Engine, [{ id: 'pair-fish', qty: 2 }]);
  assert.deepEqual(plainSocialWarnings(pairExact), []);
  scenarios += 1;

  const pairHigh = analyze(Engine, [{ id: 'pair-fish', qty: 3 }]);
  assert.deepEqual(socialWarningIds(pairHigh), ['SOCIAL_PAIR_COUNT']);
  scenarios += 1;

  const haremLow = analyze(Engine, [{ id: 'harem-fish', qty: 2 }]);
  assert.deepEqual(socialWarningIds(haremLow), ['SOCIAL_HAREM_MINIMUM']);
  scenarios += 1;

  const haremMinimum = analyze(Engine, [{ id: 'harem-fish', qty: 3 }]);
  assert.deepEqual(plainSocialWarnings(haremMinimum), []);
  scenarios += 1;

  const ratioWrong = analyze(Engine, [{ id: 'ratio-fish', qty: 3, maleQty: 2, femaleQty: 1 }]);
  assert.deepEqual(socialWarningIds(ratioWrong), ['SOCIAL_SEX_RATIO']);
  scenarios += 1;

  const ratioCorrect = analyze(Engine, [{ id: 'ratio-fish', qty: 3, maleQty: 1, femaleQty: 2 }]);
  assert.deepEqual(plainSocialWarnings(ratioCorrect), []);
  scenarios += 1;

  const ratioUnknown = analyze(Engine, [{ id: 'ratio-fish', qty: 3 }]);
  assert.deepEqual(plainSocialWarnings(ratioUnknown), [], 'Cinsiyet adedi yoksa motor oran tahmini yapmamalıdır.');
  scenarios += 1;

  const english = analyze(Engine, [{ id: 'pair-fish', qty: 1 }], 'en');
  assert.match(socialWarnings(english)[0].title, /keep exactly 2 as a pair/i);
  scenarios += 1;

  const produced = [groupLow, pairLow, pairHigh, haremLow, ratioWrong, english]
    .flatMap((result) => socialWarnings(result));
  for (const finding of produced) {
    assert(validateFinding(plain(finding)), ajv.errorsText(validateFinding.errors));
    assert.equal(finding.severity, 'warning');
    assert(finding.subjects.length === 1);
    assert.equal(finding.evidence.source, 'social-structure-engine-v1');
  }
  scenarios += 1;

  return {
    version: Engine.socialRulesVersion,
    scenarios,
    ruleIds: Engine.socialRuleIds.length,
    findingsValidated: produced.length,
    groupMinimum: true,
    pairCount: true,
    haremMinimum: true,
    sexRatioWhenProvided: true,
    noSexGuessing: true,
  };
}
