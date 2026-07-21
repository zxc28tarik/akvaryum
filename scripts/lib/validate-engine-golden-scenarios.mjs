import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

import Ajv2020 from 'ajv/dist/2020.js';

import {
  ENGINE_GOLDEN_DEFAULT_FISH_V1_2,
  ENGINE_GOLDEN_SCENARIOS_V1_2,
} from './engine-golden-scenarios-v1-2.mjs';

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function createFish(definition) {
  return {
    ...ENGINE_GOLDEN_DEFAULT_FISH_V1_2,
    id: definition.id,
    nameTr: definition.nameTr ?? definition.id.toUpperCase(),
    nameEn: definition.nameEn ?? definition.id,
    ...definition,
  };
}

function createRuntime(engineSource, contractSource, healthGuardSource, scenario) {
  const fish = scenario.fish.map(createFish);
  const context = vm.createContext({
    window: {
      DB: {
        fish,
        plants: scenario.plants,
        substrates: scenario.substrates,
      },
    },
  });

  new vm.Script(engineSource, { filename: 'engine.js' }).runInContext(context);
  if (contractSource) {
    new vm.Script(contractSource, { filename: 'engine-finding-contract.js' }).runInContext(context);
  }
  new vm.Script(healthGuardSource, { filename: 'engine-health-guard.js' }).runInContext(context);
  return context.window.Engine;
}

function normalizedState(scenario) {
  return {
    lang: 'tr',
    water: 'fresh',
    volume: 0,
    fish: [],
    plants: [],
    substrate: null,
    co2: false,
    ...scenario.state,
  };
}

function analysisSnapshot(result) {
  return {
    issues: result.issues.map((finding) => finding.ruleId),
    warnings: result.warnings.map((finding) => finding.ruleId),
    tips: result.tips.map((finding) => finding.ruleId),
    compat: result.compat.map((finding) => finding.ruleId),
    params: result.params,
    score: result.score,
    verdict: result.verdict,
    neededVol: result.neededVol,
    bioloadPct: result.bioloadPct,
    totalFish: result.totalFish,
    totalSpecies: result.totalSpecies,
  };
}

function assertNoHealthyCompositionWithCriticalIssues(result, scenarioId) {
  if (result.issues.length === 0) return;

  const healthyTip = result.tips.find((finding) => (
    finding.ruleId === 'COMPOSITION_HEALTHY'
    || finding.title === 'Güzel kompozisyon'
    || finding.title === 'Nice composition'
  ));

  assert.equal(
    healthyTip,
    undefined,
    `${scenarioId}: kritik sorun varken sağlıklı kompozisyon önerisi üretildi.`,
  );
}

export function validateEngineGoldenScenarios(repositoryRoot) {
  const engineSource = readFileSync(resolve(repositoryRoot, 'engine.js'), 'utf8');
  const contractSource = readFileSync(resolve(repositoryRoot, 'engine-finding-contract.js'), 'utf8');
  const healthGuardSource = readFileSync(resolve(repositoryRoot, 'engine-health-guard.js'), 'utf8');
  const findingSchema = JSON.parse(
    readFileSync(resolve(repositoryRoot, 'schemas/engine-finding-v1.schema.json'), 'utf8'),
  );

  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validateFinding = ajv.compile(findingSchema);

  assert.equal(ENGINE_GOLDEN_SCENARIOS_V1_2.length, 32, 'Temel altın motor paketi tam 32 senaryo olmalıdır.');

  const scenarioIds = ENGINE_GOLDEN_SCENARIOS_V1_2.map((scenario) => scenario.id);
  assert.equal(new Set(scenarioIds).size, scenarioIds.length, 'Altın senaryo kimlikleri benzersiz olmalıdır.');

  const rawCriticalScenario = ENGINE_GOLDEN_SCENARIOS_V1_2.find((scenario) => scenario.id === 'water-type-mismatch');
  assert(rawCriticalScenario, 'Ham motor sağlık koruması senaryosu bulunamadı.');
  const RawEngine = createRuntime(engineSource, null, healthGuardSource, rawCriticalScenario);
  const rawCriticalResult = RawEngine.analyze({
    ...normalizedState(rawCriticalScenario),
    lang: 'en',
  });
  assert.equal(RawEngine.healthGuardVersion, 2);
  assertNoHealthyCompositionWithCriticalIssues(rawCriticalResult, 'raw-water-type-mismatch-en');

  const coveredRuleIds = new Set();
  let validatedFindings = 0;
  let analysisScenarios = 0;
  let equipmentScenarios = 0;
  let criticalScenarios = 0;
  let warningScenarios = 0;
  let infoScenarios = 0;
  let declaredRuleIds = null;

  function checkFinding(finding, expectedSeverity = null, scenarioId = '') {
    const value = plain(finding);
    assert(
      validateFinding(value),
      `${scenarioId}: ${ajv.errorsText(validateFinding.errors, { separator: '\n' })}`,
    );
    if (expectedSeverity) {
      assert.equal(value.severity, expectedSeverity, `${scenarioId}: ${value.ruleId} önem seviyesi`);
    }
    assert(!value.ruleId.startsWith('UNCLASSIFIED'), `${scenarioId}: sınıflandırılmamış bulgu`);
    coveredRuleIds.add(value.ruleId);
    validatedFindings += 1;
  }

  for (const scenario of ENGINE_GOLDEN_SCENARIOS_V1_2) {
    assert(scenario.id.length > 0, 'Senaryo kimliği boş olamaz.');
    assert(scenario.purpose.length > 0, `${scenario.id}: amaç açıklaması boş olamaz.`);
    assert(['analysis', 'equipment'].includes(scenario.mode), `${scenario.id}: bilinmeyen senaryo modu.`);

    const fishIds = scenario.fish.map((definition) => definition.id);
    assert.equal(new Set(fishIds).size, fishIds.length, `${scenario.id}: balık kimliği tekrarı.`);

    const Engine = createRuntime(engineSource, contractSource, healthGuardSource, scenario);
    assert.equal(Engine.healthGuardVersion, 2, `${scenario.id}: motor sağlık koruması yüklenmedi.`);
    const currentDeclaredRuleIds = [...Engine.findingRuleIds];
    if (declaredRuleIds === null) declaredRuleIds = currentDeclaredRuleIds;
    else assert.deepEqual(currentDeclaredRuleIds, declaredRuleIds, `${scenario.id}: kural kataloğu değişti.`);

    const state = normalizedState(scenario);

    if (scenario.mode === 'analysis') {
      analysisScenarios += 1;
      const result = Engine.analyze(state);

      assertNoHealthyCompositionWithCriticalIssues(result, scenario.id);
      for (const finding of result.issues) checkFinding(finding, 'critical', scenario.id);
      for (const finding of result.warnings) checkFinding(finding, 'warning', scenario.id);
      for (const finding of result.tips) checkFinding(finding, 'info', scenario.id);
      for (const finding of result.compat) checkFinding(finding, null, scenario.id);

      const snapshot = plain(analysisSnapshot(result));
      assert.deepEqual(snapshot, plain(scenario.expected), `${scenario.id}: altın analiz sonucu değişti.`);

      if (result.issues.length > 0) criticalScenarios += 1;
      if (result.warnings.length > 0) warningScenarios += 1;
      if (result.tips.length > 0) infoScenarios += 1;
      continue;
    }

    equipmentScenarios += 1;
    const recommendations = Engine.equipment(state, scenario.analysis, state.lang);
    for (const finding of recommendations) checkFinding(finding, 'info', scenario.id);

    const snapshot = plain({
      ruleIds: recommendations.map((finding) => finding.ruleId),
      titles: recommendations.map((finding) => finding.title),
    });
    assert.deepEqual(snapshot, plain(scenario.expected), `${scenario.id}: altın ekipman sonucu değişti.`);
    infoScenarios += 1;
  }

  assert(declaredRuleIds, 'Motor kural kataloğu okunamadı.');
  assert.equal(declaredRuleIds.length, 27, 'Engine Finding v1 kural sayısı değişti.');
  assert.deepEqual(
    [...coveredRuleIds].sort(),
    [...declaredRuleIds].sort(),
    'Temel altın senaryolar bütün Engine Finding v1 kurallarını kapsamalıdır.',
  );

  return {
    suiteId: 'engine-v1.2-essential-32',
    scenarios: ENGINE_GOLDEN_SCENARIOS_V1_2.length,
    analysisScenarios,
    equipmentScenarios,
    declaredRuleIds: declaredRuleIds.length,
    coveredRuleIds: coveredRuleIds.size,
    validatedFindings,
    criticalScenarios,
    warningScenarios,
    infoScenarios,
    healthGuardVersion: 2,
  };
}
