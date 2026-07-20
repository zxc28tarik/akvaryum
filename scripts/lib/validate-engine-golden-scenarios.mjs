import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

import Ajv2020 from 'ajv/dist/2020.js';

import {
  ENGINE_GOLDEN_DEFAULT_FISH_V1,
  ENGINE_GOLDEN_SCENARIOS_V1,
} from './engine-golden-scenarios-v1.mjs';

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function createFish(definition) {
  return {
    ...ENGINE_GOLDEN_DEFAULT_FISH_V1,
    id: definition.id,
    nameTr: definition.nameTr ?? definition.id.toUpperCase(),
    nameEn: definition.nameEn ?? definition.id,
    ...definition,
  };
}

function createRuntime(engineSource, contractSource, scenario) {
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
  new vm.Script(contractSource, { filename: 'engine-finding-contract.js' }).runInContext(context);
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
    params: plain(result.params),
    score: result.score,
    verdict: result.verdict,
    neededVol: result.neededVol,
    bioloadPct: result.bioloadPct,
    totalFish: result.totalFish,
    totalSpecies: result.totalSpecies,
  };
}

export function validateEngineGoldenScenarios(repositoryRoot) {
  const engineSource = readFileSync(resolve(repositoryRoot, 'engine.js'), 'utf8');
  const contractSource = readFileSync(resolve(repositoryRoot, 'engine-finding-contract.js'), 'utf8');
  const findingSchema = JSON.parse(
    readFileSync(resolve(repositoryRoot, 'schemas/engine-finding-v1.schema.json'), 'utf8'),
  );

  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validateFinding = ajv.compile(findingSchema);

  assert.equal(ENGINE_GOLDEN_SCENARIOS_V1.length, 25, 'İlk altın motor paketi tam 25 senaryo olmalıdır.');

  const scenarioIds = ENGINE_GOLDEN_SCENARIOS_V1.map((scenario) => scenario.id);
  assert.equal(new Set(scenarioIds).size, scenarioIds.length, 'Altın senaryo kimlikleri benzersiz olmalıdır.');

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

  for (const scenario of ENGINE_GOLDEN_SCENARIOS_V1) {
    assert(scenario.id.length > 0, 'Senaryo kimliği boş olamaz.');
    assert(scenario.purpose.length > 0, `${scenario.id}: amaç açıklaması boş olamaz.`);
    assert(['analysis', 'equipment'].includes(scenario.mode), `${scenario.id}: bilinmeyen senaryo modu.`);

    const fishIds = scenario.fish.map((definition) => definition.id);
    assert.equal(new Set(fishIds).size, fishIds.length, `${scenario.id}: balık kimliği tekrarı.`);

    const Engine = createRuntime(engineSource, contractSource, scenario);
    const currentDeclaredRuleIds = [...Engine.findingRuleIds];
    if (declaredRuleIds === null) declaredRuleIds = currentDeclaredRuleIds;
    else assert.deepEqual(currentDeclaredRuleIds, declaredRuleIds, `${scenario.id}: kural kataloğu değişti.`);

    const state = normalizedState(scenario);

    if (scenario.mode === 'analysis') {
      analysisScenarios += 1;
      const result = Engine.analyze(state);

      for (const finding of result.issues) checkFinding(finding, 'critical', scenario.id);
      for (const finding of result.warnings) checkFinding(finding, 'warning', scenario.id);
      for (const finding of result.tips) checkFinding(finding, 'info', scenario.id);
      for (const finding of result.compat) checkFinding(finding, null, scenario.id);

      const snapshot = analysisSnapshot(result);
      assert.deepEqual(snapshot, plain(scenario.expected), `${scenario.id}: altın analiz sonucu değişti.`);

      if (result.issues.length > 0) criticalScenarios += 1;
      if (result.warnings.length > 0) warningScenarios += 1;
      if (result.tips.length > 0) infoScenarios += 1;
      continue;
    }

    equipmentScenarios += 1;
    const recommendations = Engine.equipment(state, scenario.analysis, state.lang);
    for (const finding of recommendations) checkFinding(finding, 'info', scenario.id);

    const snapshot = {
      ruleIds: recommendations.map((finding) => finding.ruleId),
      titles: recommendations.map((finding) => finding.title),
    };
    assert.deepEqual(snapshot, plain(scenario.expected), `${scenario.id}: altın ekipman sonucu değişti.`);
    infoScenarios += 1;
  }

  assert(declaredRuleIds, 'Motor kural kataloğu okunamadı.');
  assert.equal(declaredRuleIds.length, 27, 'Engine Finding v1 kural sayısı değişti.');
  assert.deepEqual(
    [...coveredRuleIds].sort(),
    [...declaredRuleIds].sort(),
    'İlk 25 altın senaryo bütün Engine Finding v1 kurallarını kapsamalıdır.',
  );

  return {
    suiteId: 'engine-v1-first-25',
    scenarios: ENGINE_GOLDEN_SCENARIOS_V1.length,
    analysisScenarios,
    equipmentScenarios,
    declaredRuleIds: declaredRuleIds.length,
    coveredRuleIds: coveredRuleIds.size,
    validatedFindings,
    criticalScenarios,
    warningScenarios,
    infoScenarios,
  };
}
