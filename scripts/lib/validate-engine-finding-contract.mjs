import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

import Ajv2020 from 'ajv/dist/2020.js';

function createFish(id, overrides = {}) {
  return {
    id,
    nameTr: id.toUpperCase(),
    nameEn: id,
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

function createRuntime(engineSource, contractSource, fish, plants = [], substrates = []) {
  const context = vm.createContext({
    window: {
      DB: { fish, plants, substrates },
    },
  });
  new vm.Script(engineSource, { filename: 'engine.js' }).runInContext(context);
  new vm.Script(contractSource, { filename: 'engine-finding-contract.js' }).runInContext(context);
  return context.window.Engine;
}

function analyze(Engine, state) {
  return Engine.analyze({
    lang: 'tr',
    water: 'fresh',
    volume: 0,
    fish: [],
    plants: [],
    substrate: null,
    co2: false,
    ...state,
  });
}

export function validateEngineFindingContract(repositoryRoot) {
  const engineSource = readFileSync(resolve(repositoryRoot, 'engine.js'), 'utf8');
  const contractSource = readFileSync(resolve(repositoryRoot, 'engine-finding-contract.js'), 'utf8');
  const schema = JSON.parse(readFileSync(resolve(repositoryRoot, 'schemas/engine-finding-v1.schema.json'), 'utf8'));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validateFinding = ajv.compile(schema);

  const fish = [
    createFish('peace-a'),
    createFish('peace-b'),
    createFish('school', { schooling: 6 }),
    createFish('large-aggressive', {
      minVolume: 120,
      aggression: 'aggressive',
      size: 20,
      pH: [8.5, 9],
      temp: [30, 32],
      gh: [20, 25],
      plantSafe: false,
      reefSafe: false,
    }),
    createFish('long-fin', { longFinned: true, size: 3 }),
    createFish('nipper', { finNippers: true, aggression: 'semi-aggressive' }),
    createFish('salt-inhabitant', { water: 'salt' }),
    createFish('reef-risk', { water: 'salt', reefSafe: false }),
    createFish('soft-coral', { water: 'salt', reefSafe: true }),
  ];
  const plants = [{ id: 'plant', tr: 'Bitki', en: 'Plant', co2: true }];
  const substrates = [{ id: 'marine-sub', tr: 'Deniz tabanı', en: 'Marine substrate', water: ['salt'] }];
  const Engine = createRuntime(engineSource, contractSource, fish, plants, substrates);

  assert.equal(Engine.findingContract.version, 1);
  assert.deepEqual([...Engine.findingContract.severities], ['critical', 'warning', 'info']);

  const validatedRuleIds = new Set();
  let validatedFindings = 0;

  function checkFinding(finding, expectedSeverity = null) {
    const plain = JSON.parse(JSON.stringify(finding));
    assert(validateFinding(plain), ajv.errorsText(validateFinding.errors, { separator: '\n' }));
    if (expectedSeverity) assert.equal(plain.severity, expectedSeverity, plain.ruleId);
    assert(!plain.ruleId.startsWith('UNCLASSIFIED'), plain.ruleId);
    validatedRuleIds.add(plain.ruleId);
    validatedFindings += 1;
  }

  function checkAnalysis(result) {
    for (const finding of result.issues) checkFinding(finding, 'critical');
    for (const finding of result.warnings) checkFinding(finding, 'warning');
    for (const finding of result.tips) checkFinding(finding, 'info');
    for (const finding of result.compat) checkFinding(finding);
  }

  const conflictResult = analyze(Engine, {
    volume: 30,
    fish: [
      { id: 'school', qty: 1 },
      { id: 'large-aggressive', qty: 1 },
      { id: 'long-fin', qty: 1 },
      { id: 'nipper', qty: 1 },
      { id: 'salt-inhabitant', qty: 1 },
      { id: 'peace-a', qty: 1 },
      { id: 'peace-b', qty: 1 },
    ],
    plants: ['plant'],
    substrate: 'marine-sub',
  });
  checkAnalysis(conflictResult);

  const conflictIds = new Set([
    ...conflictResult.issues,
    ...conflictResult.warnings,
    ...conflictResult.tips,
    ...conflictResult.compat,
  ].map((finding) => finding.ruleId));
  for (const expected of [
    'WATER_TYPE_MISMATCH',
    'TANK_CAPACITY_EXCEEDED',
    'SPECIES_MINIMUM_VOLUME',
    'SCHOOLING_MINIMUM',
    'PAIRWISE_INCOMPATIBLE',
    'PAIRWISE_CAUTION',
    'PAIRWISE_COMPATIBLE',
    'PAIRWISE_SELF',
    'PARAMETER_PH_NO_COMMON_RANGE',
    'PARAMETER_TEMPERATURE_NO_COMMON_RANGE',
    'PARAMETER_GH_NO_COMMON_RANGE',
    'PLANT_DAMAGE_RISK',
    'PLANT_CO2_RECOMMENDED',
    'SUBSTRATE_WATER_MISMATCH',
  ]) {
    assert(conflictIds.has(expected), `Kural senaryoda üretilmedi: ${expected}`);
  }

  const highCapacityResult = analyze(Engine, {
    volume: 100,
    fish: [{ id: 'high-load', qty: 1 }],
  });
  // Bu senaryo için ayrı bir tanım gerekir.
  const HighCapacityEngine = createRuntime(
    engineSource,
    contractSource,
    [createFish('high-load', { minVolume: 90, perFishL: 0 })],
  );
  const highResult = analyze(HighCapacityEngine, {
    volume: 100,
    fish: [{ id: 'high-load', qty: 1 }],
  });
  checkAnalysis(highResult);
  assert(highResult.warnings.some((finding) => finding.ruleId === 'TANK_CAPACITY_HIGH'));
  assert.equal(highCapacityResult.totalFish, 0);

  const AvailableEngine = createRuntime(
    engineSource,
    contractSource,
    [
      createFish('available', { minVolume: 20, perFishL: 0 }),
      createFish('balanced', { minVolume: 50, perFishL: 0 }),
    ],
  );
  const availableResult = analyze(AvailableEngine, {
    volume: 100,
    fish: [{ id: 'available', qty: 1 }],
  });
  checkAnalysis(availableResult);
  assert(availableResult.tips.some((finding) => finding.ruleId === 'TANK_CAPACITY_AVAILABLE'));

  const healthyResult = analyze(AvailableEngine, {
    volume: 100,
    fish: [{ id: 'balanced', qty: 1 }],
  });
  checkAnalysis(healthyResult);
  assert(healthyResult.tips.some((finding) => finding.ruleId === 'COMPOSITION_HEALTHY'));

  const reefResult = analyze(Engine, {
    lang: 'en',
    water: 'salt',
    volume: 300,
    fish: [
      { id: 'reef-risk', qty: 1 },
      { id: 'soft-coral', qty: 1 },
    ],
  });
  checkAnalysis(reefResult);
  assert(reefResult.warnings.some((finding) => finding.ruleId === 'REEF_UNSAFE_INHABITANT'));
  assert(reefResult.warnings.every((finding) => finding.resolution.length > 0));

  const freshwaterEquipment = Engine.equipment(
    { water: 'fresh', volume: 100, plants: ['plant'] },
    { neededVol: 100 },
    'tr',
  );
  const saltwaterEquipment = Engine.equipment(
    { water: 'salt', volume: 200, plants: [] },
    { neededVol: 200 },
    'en',
  );
  for (const finding of [...freshwaterEquipment, ...saltwaterEquipment]) checkFinding(finding, 'info');
  for (const expected of [
    'EQUIPMENT_FILTER_FLOW',
    'EQUIPMENT_HEATER_POWER',
    'EQUIPMENT_FRESHWATER_LIGHT',
    'EQUIPMENT_CO2_SYSTEM',
    'EQUIPMENT_REEF_LIGHT',
    'EQUIPMENT_PROTEIN_SKIMMER',
    'EQUIPMENT_SALTWATER_FLOW',
    'EQUIPMENT_LIVE_ROCK',
    'EQUIPMENT_REFRACTOMETER',
  ]) {
    assert(validatedRuleIds.has(expected), `Ekipman kuralı üretilmedi: ${expected}`);
  }

  assert.equal(Engine.findingRuleIds.length, 27);
  assert.equal(new Set(Engine.findingRuleIds).size, Engine.findingRuleIds.length);

  return {
    contractVersion: Engine.findingContract.version,
    declaredRuleIds: Engine.findingRuleIds.length,
    validatedRuleIds: validatedRuleIds.size,
    validatedFindings,
    requiredFields: Engine.findingContract.requiredFields.length,
    severities: [...Engine.findingContract.severities],
  };
}
