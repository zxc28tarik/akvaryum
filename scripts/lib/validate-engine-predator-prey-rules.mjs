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
    ...overrides,
  };
}

function canonical(id, adultCm, overrides = {}) {
  return {
    id,
    name: {
      tr: overrides.nameTr || id,
      en: overrides.nameEn || id,
    },
    size: { adultCm: [adultCm, adultCm] },
    social: {
      mode: 'solitary',
      conspecificAggression: 'low',
      territoriality: 'low',
    },
    verification: {
      status: 'needs_review',
      confidence: 'low',
      notes: [],
    },
    ...overrides,
  };
}

function profile(predatorId, overrides = {}) {
  return {
    predatorId,
    mouthWidthCm: 2,
    maxSwallowablePreyLengthCm: 6,
    safeSpeciesIds: [],
    riskySpeciesIds: [],
    sourceIds: ['test-predation-source'],
    verification: {
      status: 'verified',
      confidence: 'high',
      notes: ['Synthetic validation profile.'],
    },
    ...overrides,
  };
}

function validateProfileIntegrity(profiles) {
  const seenPredators = new Set();
  for (const value of profiles) {
    assert(!seenPredators.has(value.predatorId), `${value.predatorId}: tekrarlanan avcı profili.`);
    seenPredators.add(value.predatorId);
    const safe = new Set(value.safeSpeciesIds || []);
    for (const preyId of value.riskySpeciesIds || []) {
      assert(!safe.has(preyId), `${value.predatorId}/${preyId}: güvenli ve riskli istisna aynı anda kullanılamaz.`);
    }
  }
}

function createEngine(repositoryRoot, inhabitants, legacyRecords, profiles) {
  const sources = [
    ['engine.js', 'engine.js'],
    ['engine-finding-contract.js', 'engine-finding-contract.js'],
    ['engine-health-guard.js', 'engine-health-guard.js'],
    ['engine-social-rules.js', 'engine-social-rules.js'],
    ['engine-conspecific-rules.js', 'engine-conspecific-rules.js'],
    ['engine-predator-prey-rules.js', 'engine-predator-prey-rules.js'],
    ['engine-domain-results.js', 'engine-domain-results.js'],
  ];
  const context = vm.createContext({
    window: {
      DB: {
        inhabitants,
        fish: legacyRecords,
        predatorPreyProfiles: profiles,
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

function pairFor(result, firstId, secondId) {
  return result.compat.find((entry) => (
    (entry.a === firstId && entry.b === secondId)
    || (entry.a === secondId && entry.b === firstId)
  ));
}

function predationFindings(result) {
  return [...result.issues, ...result.warnings].filter((finding) => finding.ruleId === 'PREDATION_SIZE_RISK');
}

export function validateEnginePredatorPreyRules(repositoryRoot) {
  const profileSchema = JSON.parse(readFileSync(resolve(repositoryRoot, 'schemas/predator-prey-profile-v1.schema.json'), 'utf8'));
  const findingSchema = JSON.parse(readFileSync(resolve(repositoryRoot, 'schemas/engine-finding-v1.schema.json'), 'utf8'));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validateProfiles = ajv.compile(profileSchema);
  const validateFinding = ajv.compile(findingSchema);

  const profiles = [
    profile('safe-predator', { safeSpeciesIds: ['small-prey'] }),
    profile('risk-exception-predator', { riskySpeciesIds: ['large-prey'] }),
    profile('size-predator'),
    profile('size-safe-predator', { maxSwallowablePreyLengthCm: 4 }),
    profile('medium-predator', {
      verification: {
        status: 'reviewed',
        confidence: 'medium',
        notes: ['Synthetic medium-confidence validation profile.'],
      },
    }),
    profile('safe-ph-predator', { safeSpeciesIds: ['ph-prey'] }),
  ];
  assert(validateProfiles(profiles), ajv.errorsText(validateProfiles.errors));
  validateProfileIntegrity(profiles);
  assert(validateProfiles([]), 'Boş profil listesi geçerli olmalıdır.');
  assert.throws(() => validateProfileIntegrity([
    profile('overlap-predator', {
      safeSpeciesIds: ['same-prey'],
      riskySpeciesIds: ['same-prey'],
    }),
  ]), /güvenli ve riskli/i);

  const inhabitants = [
    canonical('no-profile-predator', 20, { nameTr: 'Profilsiz Avcı', nameEn: 'Unprofiled Predator' }),
    canonical('safe-predator', 20, { nameTr: 'Güvenli Profilli Avcı', nameEn: 'Safe Profile Predator' }),
    canonical('risk-exception-predator', 20, { nameTr: 'İstisna Avcısı', nameEn: 'Exception Predator' }),
    canonical('size-predator', 20, { nameTr: 'Boy Eşikli Avcı', nameEn: 'Size Threshold Predator' }),
    canonical('size-safe-predator', 20, { nameTr: 'Dar Eşikli Avcı', nameEn: 'Narrow Threshold Predator' }),
    canonical('medium-predator', 20, { nameTr: 'Orta Güvenli Avcı', nameEn: 'Medium Confidence Predator' }),
    canonical('safe-ph-predator', 20, { nameTr: 'pH Profilli Avcı', nameEn: 'pH Profile Predator' }),
    canonical('small-prey', 5, { nameTr: 'Küçük Av', nameEn: 'Small Prey' }),
    canonical('large-prey', 15, { nameTr: 'Büyük Av', nameEn: 'Large Prey' }),
    canonical('ph-prey', 5, { nameTr: 'pH Avı', nameEn: 'pH Prey' }),
  ];

  const legacyRecords = [
    legacyFish('no-profile-predator', { nameTr: 'Profilsiz Avcı', nameEn: 'Unprofiled Predator', aggression: 'aggressive', size: 20 }),
    legacyFish('safe-predator', { nameTr: 'Güvenli Profilli Avcı', nameEn: 'Safe Profile Predator', aggression: 'aggressive', size: 20 }),
    legacyFish('risk-exception-predator', { nameTr: 'İstisna Avcısı', nameEn: 'Exception Predator', aggression: 'peaceful', size: 20 }),
    legacyFish('size-predator', { nameTr: 'Boy Eşikli Avcı', nameEn: 'Size Threshold Predator', aggression: 'peaceful', size: 20 }),
    legacyFish('size-safe-predator', { nameTr: 'Dar Eşikli Avcı', nameEn: 'Narrow Threshold Predator', aggression: 'aggressive', size: 20 }),
    legacyFish('medium-predator', { nameTr: 'Orta Güvenli Avcı', nameEn: 'Medium Confidence Predator', aggression: 'peaceful', size: 20 }),
    legacyFish('safe-ph-predator', { nameTr: 'pH Profilli Avcı', nameEn: 'pH Profile Predator', aggression: 'aggressive', size: 20, pH: [6, 7] }),
    legacyFish('small-prey', { nameTr: 'Küçük Av', nameEn: 'Small Prey', size: 5 }),
    legacyFish('large-prey', { nameTr: 'Büyük Av', nameEn: 'Large Prey', size: 15 }),
    legacyFish('ph-prey', { nameTr: 'pH Avı', nameEn: 'pH Prey', size: 5, pH: [8, 9] }),
  ];

  const Engine = createEngine(repositoryRoot, inhabitants, legacyRecords, profiles);
  assert.equal(Engine.predatorPreyRulesVersion, 1);
  assert.deepEqual(plain(Engine.predatorPreyRuleIds), ['PREDATION_SIZE_RISK']);
  let scenarios = 5;

  const legacyPreserved = analyze(Engine, [
    { id: 'no-profile-predator', qty: 1 },
    { id: 'small-prey', qty: 1 },
  ]);
  assert.equal(predationFindings(legacyPreserved).length, 0);
  assert.equal(pairFor(legacyPreserved, 'no-profile-predator', 'small-prey').status, 'bad');
  assert.match(pairFor(legacyPreserved, 'no-profile-predator', 'small-prey').reason, /avlayabilir/i);
  scenarios += 1;

  const safeException = analyze(Engine, [
    { id: 'safe-predator', qty: 1 },
    { id: 'small-prey', qty: 1 },
  ]);
  assert.equal(predationFindings(safeException).length, 0);
  assert.equal(pairFor(safeException, 'safe-predator', 'small-prey').status, 'ok');
  assert.equal(safeException.issues.length, 0);
  assert(!/avlayabilir|may prey/i.test(pairFor(safeException, 'safe-predator', 'small-prey').reason));
  scenarios += 1;

  const riskyException = analyze(Engine, [
    { id: 'risk-exception-predator', qty: 1 },
    { id: 'large-prey', qty: 1 },
  ]);
  assert.equal(predationFindings(riskyException).length, 1);
  assert.equal(predationFindings(riskyException)[0].severity, 'critical');
  assert.equal(predationFindings(riskyException)[0].evidence.method, 'risky_species_exception');
  assert.equal(pairFor(riskyException, 'risk-exception-predator', 'large-prey').status, 'bad');
  assert.equal(riskyException.issues.filter((finding) => finding.ruleId === 'PAIRWISE_INCOMPATIBLE').length, 0);
  scenarios += 1;

  const sizeRisk = analyze(Engine, [
    { id: 'size-predator', qty: 1 },
    { id: 'small-prey', qty: 1 },
  ]);
  assert.equal(predationFindings(sizeRisk).length, 1);
  assert.equal(predationFindings(sizeRisk)[0].severity, 'critical');
  assert.equal(predationFindings(sizeRisk)[0].evidence.method, 'source_backed_length_threshold');
  assert.equal(predationFindings(sizeRisk)[0].evidence.mouthWidthCm, 2);
  assert.equal(predationFindings(sizeRisk)[0].evidence.preyAdultLowerLengthCm, 5);
  assert(sizeRisk.domains.behavior.ruleIds.includes('PREDATION_SIZE_RISK'));
  scenarios += 1;

  const sizeSafe = analyze(Engine, [
    { id: 'size-safe-predator', qty: 1 },
    { id: 'small-prey', qty: 1 },
  ]);
  assert.equal(predationFindings(sizeSafe).length, 0);
  assert.equal(pairFor(sizeSafe, 'size-safe-predator', 'small-prey').status, 'ok');
  assert.equal(sizeSafe.issues.length, 0);
  scenarios += 1;

  const mediumRisk = analyze(Engine, [
    { id: 'medium-predator', qty: 1 },
    { id: 'small-prey', qty: 1 },
  ]);
  assert.equal(predationFindings(mediumRisk).length, 1);
  assert.equal(predationFindings(mediumRisk)[0].severity, 'warning');
  assert.equal(pairFor(mediumRisk, 'medium-predator', 'small-prey').status, 'warn');
  assert.equal(mediumRisk.score, 92);
  scenarios += 1;

  const retainedPh = analyze(Engine, [
    { id: 'safe-ph-predator', qty: 1 },
    { id: 'ph-prey', qty: 1 },
  ]);
  assert.equal(predationFindings(retainedPh).length, 0);
  assert.equal(pairFor(retainedPh, 'safe-ph-predator', 'ph-prey').status, 'bad');
  assert.match(pairFor(retainedPh, 'safe-ph-predator', 'ph-prey').reason, /pH/i);
  assert(!/avlayabilir|may prey/i.test(pairFor(retainedPh, 'safe-ph-predator', 'ph-prey').reason));
  scenarios += 1;

  const english = analyze(Engine, [
    { id: 'size-predator', qty: 1 },
    { id: 'small-prey', qty: 1 },
  ], 'en');
  assert.match(predationFindings(english)[0].title, /predation risk/i);
  assert.match(predationFindings(english)[0].reason, /mouth width/i);
  scenarios += 1;

  const produced = [riskyException, sizeRisk, mediumRisk, english]
    .flatMap((result) => predationFindings(result));
  for (const finding of produced) {
    const value = plain(finding);
    assert(validateFinding(value), ajv.errorsText(validateFinding.errors));
    assert.equal(value.evidence.source, 'predator-prey-engine-v1');
    assert(value.evidence.profileSourceIds.length > 0);
  }
  scenarios += 1;

  const runtimeLoader = readFileSync(resolve(repositoryRoot, 'runtime-loader.js'), 'utf8');
  const viteConfig = readFileSync(resolve(repositoryRoot, 'vite.config.js'), 'utf8');
  assert(runtimeLoader.includes("fetchText('engine-predator-prey-rules.js')"));
  assert(viteConfig.includes("readPlain('engine-predator-prey-rules.js')"));
  assert(viteConfig.indexOf("readPlain('engine-predator-prey-rules.js')") < viteConfig.indexOf("readPlain('engine-domain-results.js')"));
  scenarios += 1;

  return {
    version: Engine.predatorPreyRulesVersion,
    scenarios,
    ruleIds: Engine.predatorPreyRuleIds.length,
    findingsValidated: produced.length,
    legacyFallbackPreserved: true,
    sourcedSafeOverride: true,
    sourcedRiskOverride: true,
    confidenceControlsSeverity: true,
    domainIntegration: true,
  };
}
