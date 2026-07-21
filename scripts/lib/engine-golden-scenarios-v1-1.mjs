import {
  ENGINE_GOLDEN_DEFAULT_FISH_V1,
  ENGINE_GOLDEN_SCENARIOS_V1,
} from './engine-golden-scenarios-v1.mjs';

const HEALTHY_RULE_ID = 'COMPOSITION_HEALTHY';

function applyCriticalHealthCorrection(scenario) {
  if (scenario.mode !== 'analysis' || scenario.expected.issues.length === 0) return scenario;

  const tips = scenario.expected.tips.filter((ruleId) => ruleId !== HEALTHY_RULE_ID);
  if (tips.length === scenario.expected.tips.length) return scenario;

  return Object.freeze({
    ...scenario,
    expected: Object.freeze({
      ...scenario.expected,
      tips: Object.freeze(tips),
    }),
  });
}

export const ENGINE_GOLDEN_DEFAULT_FISH_V1_1 = ENGINE_GOLDEN_DEFAULT_FISH_V1;

export const ENGINE_GOLDEN_SCENARIOS_V1_1 = Object.freeze(
  ENGINE_GOLDEN_SCENARIOS_V1.map(applyCriticalHealthCorrection),
);
