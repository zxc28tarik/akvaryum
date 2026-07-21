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
    schooling: 0,
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
    taxonomy: {
      genus: overrides.genus ?? null,
      family: overrides.family || null,
      reviewStatus: overrides.taxonomyReviewStatus || 'inferred',
    },
    social,
    verification: {
      status: overrides.verificationStatus || 'needs_review',
      confidence: overrides.confidence || 'low',
      notes: [],
    },
    ...overrides,
  };
}

function createEngine(repositoryRoot, inhabitants) {
  const sources = [
    ['engine.js', 'engine.js'],
    ['engine-finding-contract.js', 'engine-finding-contract.js'],
    ['engine-health-guard.js', 'engine-health-guard.js'],
    ['engine-social-rules.js', 'engine-social-rules.js'],
    ['engine-conspecific-rules.js', 'engine-conspecific-rules.js'],
  ];
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
  for (const [path, filename] of sources) {
    new vm.Script(readFileSync(resolve(repositoryRoot, path), 'utf8'), { filename }).runInContext(context);
  }
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

function extensionWarnings(result) {
  return result.warnings.filter((finding) => (
    finding.ruleId === 'CONSPECIFIC_AGGRESSION'
    || finding.ruleId === 'CONGENERIC_AGGRESSION'
  ));
}

function extensionIds(result) {
  return plain(extensionWarnings(result).map((finding) => finding.ruleId));
}

function compatFor(result, firstId, secondId) {
  return result.compat.find((entry) => (
    (entry.a === firstId && entry.b === secondId)
    || (entry.a === secondId && entry.b === firstId)
  ));
}

export function validateEngineConspecificRules(repositoryRoot) {
  const findingSchema = JSON.parse(readFileSync(resolve(repositoryRoot, 'schemas/engine-finding-v1.schema.json'), 'utf8'));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validateFinding = ajv.compile(findingSchema);

  const records = [
    canonical('high-solo', { mode: 'solitary', conspecificAggression: 'high', territoriality: 'high' }, { nameTr: 'Yüksek Tekil', nameEn: 'High Solitary', genus: 'Alpha' }),
    canonical('medium-solo', { mode: 'solitary', conspecificAggression: 'medium', territoriality: 'medium' }, { nameTr: 'Orta Tekil', nameEn: 'Medium Solitary', genus: 'Beta' }),
    canonical('medium-group', { mode: 'group', minGroup: 4, recommendedGroup: 4, conspecificAggression: 'medium', territoriality: 'medium' }, { nameTr: 'Orta Grup', nameEn: 'Medium Group', genus: 'Gamma' }),
    canonical('low-solo', { mode: 'solitary', conspecificAggression: 'low', territoriality: 'low' }, { nameTr: 'Düşük Tekil', nameEn: 'Low Solitary', genus: 'Delta' }),
    canonical('betta', { mode: 'solitary', conspecificAggression: 'high', territoriality: 'high' }, { nameTr: 'Beta', nameEn: 'Betta', genus: 'Betta' }),
    canonical('alpha-calm', { mode: 'solitary', conspecificAggression: 'low', territoriality: 'low' }, { nameTr: 'Alfa Sakin', nameEn: 'Alpha Calm', genus: 'Alpha' }),
    canonical('epsilon-high', { mode: 'solitary', conspecificAggression: 'high', territoriality: 'high' }, { nameTr: 'Epsilon Sert', nameEn: 'Epsilon High', genus: 'Epsilon' }),
    canonical('epsilon-calm', { mode: 'solitary', conspecificAggression: 'low', territoriality: 'low' }, { nameTr: 'Epsilon Sakin', nameEn: 'Epsilon Calm', genus: 'Epsilon' }),
    canonical('zeta-high', { mode: 'solitary', conspecificAggression: 'high', territoriality: 'high' }, { nameTr: 'Zeta Sert', nameEn: 'Zeta High', genus: 'Zeta' }),
    canonical('eta-calm', { mode: 'solitary', conspecificAggression: 'low', territoriality: 'low' }, { nameTr: 'Eta Sakin', nameEn: 'Eta Calm', genus: 'Eta' }),
    canonical('theta-nipper', { mode: 'solitary', conspecificAggression: 'high', territoriality: 'high' }, { nameTr: 'Theta Çekiştiren', nameEn: 'Theta Nipper', genus: 'Theta', legacy: { finNippers: true, aggression: 'semi' } }),
    canonical('theta-long', { mode: 'solitary', conspecificAggression: 'low', territoriality: 'low' }, { nameTr: 'Theta Uzun', nameEn: 'Theta Long', genus: 'Theta', legacy: { longFinned: true } }),
    canonical('unknown-genus', { mode: 'solitary', conspecificAggression: 'high', territoriality: 'high' }, { nameTr: 'Cinsi Belirsiz', nameEn: 'Unknown Genus', genus: null }),
  ];

  const Engine = createEngine(repositoryRoot, records);
  assert.equal(Engine.conspecificRulesVersion, 1);
  assert.deepEqual(plain(Engine.conspecificRuleIds), ['CONSPECIFIC_AGGRESSION', 'CONGENERIC_AGGRESSION']);
  let scenarios = 2;

  const highMultiple = analyze(Engine, [{ id: 'high-solo', qty: 2 }]);
  assert.deepEqual(extensionIds(highMultiple), ['CONSPECIFIC_AGGRESSION']);
  assert.equal(highMultiple.score, 92);
  assert.equal(compatFor(highMultiple, 'high-solo', 'high-solo').ruleId, 'CONSPECIFIC_AGGRESSION');
  scenarios += 1;

  const highSingle = analyze(Engine, [{ id: 'high-solo', qty: 1 }]);
  assert.deepEqual(extensionIds(highSingle), []);
  scenarios += 1;

  const mediumSolitary = analyze(Engine, [{ id: 'medium-solo', qty: 2 }]);
  assert.deepEqual(extensionIds(mediumSolitary), ['CONSPECIFIC_AGGRESSION']);
  scenarios += 1;

  const mediumGroup = analyze(Engine, [{ id: 'medium-group', qty: 4 }]);
  assert.deepEqual(extensionIds(mediumGroup), []);
  scenarios += 1;

  const lowMultiple = analyze(Engine, [{ id: 'low-solo', qty: 2 }]);
  assert.deepEqual(extensionIds(lowMultiple), []);
  scenarios += 1;

  const betta = analyze(Engine, [{ id: 'betta', qty: 2 }]);
  assert.equal(betta.issues.filter((finding) => finding.ruleId === 'PAIRWISE_INCOMPATIBLE').length, 1);
  assert.deepEqual(extensionIds(betta), [], 'Beta özel kritik kuralı ikinci uyarı üretmemelidir.');
  scenarios += 1;

  const sameGenus = analyze(Engine, [{ id: 'high-solo', qty: 1 }, { id: 'alpha-calm', qty: 1 }]);
  assert.deepEqual(extensionIds(sameGenus), ['CONGENERIC_AGGRESSION']);
  assert.equal(compatFor(sameGenus, 'high-solo', 'alpha-calm').ruleId, 'CONGENERIC_AGGRESSION');
  scenarios += 1;

  const sameGenusLow = analyze(Engine, [{ id: 'epsilon-calm', qty: 1 }, { id: 'epsilon-high', qty: 1 }]);
  assert.deepEqual(extensionIds(sameGenusLow), ['CONGENERIC_AGGRESSION']);
  scenarios += 1;

  const differentGenus = analyze(Engine, [{ id: 'zeta-high', qty: 1 }, { id: 'eta-calm', qty: 1 }]);
  assert.deepEqual(extensionIds(differentGenus), []);
  scenarios += 1;

  const existingCaution = analyze(Engine, [{ id: 'theta-nipper', qty: 1 }, { id: 'theta-long', qty: 1 }]);
  assert.equal(existingCaution.warnings.filter((finding) => finding.ruleId === 'PAIRWISE_CAUTION').length, 1);
  assert.deepEqual(extensionIds(existingCaution), [], 'Mevcut ikili uyarı varken yakın tür uyarısı çoğaltılmamalıdır.');
  scenarios += 1;

  const missingGenus = analyze(Engine, [{ id: 'unknown-genus', qty: 1 }, { id: 'zeta-high', qty: 1 }]);
  assert.deepEqual(extensionIds(missingGenus), []);
  scenarios += 1;

  const english = analyze(Engine, [{ id: 'high-solo', qty: 2 }], 'en');
  assert.match(extensionWarnings(english)[0].title, /conspecific conflict risk/i);
  scenarios += 1;

  const produced = [highMultiple, mediumSolitary, sameGenus, sameGenusLow, english]
    .flatMap((result) => extensionWarnings(result));
  for (const finding of produced) {
    const value = plain(finding);
    assert(validateFinding(value), ajv.errorsText(validateFinding.errors));
    assert.equal(value.severity, 'warning');
    assert.equal(value.evidence.source, 'conspecific-engine-v1');
    assert(['low', 'medium', 'high'].includes(
      value.evidence.confidence || value.evidence.first?.confidence || 'low',
    ));
  }
  scenarios += 1;

  return {
    version: Engine.conspecificRulesVersion,
    scenarios,
    ruleIds: Engine.conspecificRuleIds.length,
    findingsValidated: produced.length,
    sameSpecies: true,
    sameGenus: true,
    duplicateSuppression: true,
    warningOnly: true,
  };
}
