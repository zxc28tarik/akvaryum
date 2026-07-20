import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

function createFish(id, pH, temp, gh = null) {
  return {
    id,
    nameTr: id.toUpperCase(),
    nameEn: id,
    water: 'fresh',
    minVolume: 20,
    perFishL: 2,
    schooling: 0,
    pH,
    temp,
    gh,
    aggression: 'peaceful',
    size: 5,
    finNippers: false,
    longFinned: false,
    plantSafe: true,
    reefSafe: true,
  };
}

function runAnalysis(engineSource, fishDefinitions, ids, lang = 'tr') {
  const context = vm.createContext({
    window: {
      DB: {
        fish: fishDefinitions,
        plants: [],
        substrates: [],
      },
    },
  });

  new vm.Script(engineSource, { filename: 'engine.js' }).runInContext(context);
  return context.window.Engine.analyze({
    lang,
    water: 'fresh',
    volume: 0,
    fish: ids.map((id) => ({ id, qty: 1 })),
    plants: [],
    substrate: null,
  });
}

function plainRange(value) {
  return value === null ? null : [...value];
}

export function validateEngineParameterIntersection(repositoryRoot) {
  const engineSource = readFileSync(resolve(repositoryRoot, 'engine.js'), 'utf8');
  const scenarios = [
    {
      id: 'two-species-overlap',
      run() {
        const fish = [
          createFish('a', [6, 8], [22, 28], [2, 12]),
          createFish('b', [7, 9], [24, 30], [5, 15]),
        ];
        const result = runAnalysis(engineSource, fish, ['a', 'b']);
        assert.deepEqual(plainRange(result.params.pH), [7, 8]);
        assert.deepEqual(plainRange(result.params.temp), [24, 28]);
        assert.deepEqual(plainRange(result.params.gh), [5, 12]);
      },
    },
    {
      id: 'three-species-narrow-overlap',
      run() {
        const fish = [
          createFish('a', [6, 8], [22, 28]),
          createFish('b', [7, 9], [24, 30]),
          createFish('c', [7.5, 8.5], [25, 27]),
        ];
        const result = runAnalysis(engineSource, fish, ['a', 'b', 'c']);
        assert.deepEqual(plainRange(result.params.pH), [7.5, 8]);
        assert.deepEqual(plainRange(result.params.temp), [25, 27]);
      },
    },
    {
      id: 'ph-no-common-range',
      run() {
        const fish = [
          createFish('a', [6, 8], [22, 28]),
          createFish('b', [7, 9], [24, 30]),
          createFish('c', [8.5, 9], [25, 27]),
        ];
        const result = runAnalysis(engineSource, fish, ['a', 'b', 'c']);
        assert.equal(result.params.pH, null);
        assert(result.issues.some((issue) => issue.title === 'Ortak güvenli pH aralığı yok'));
        assert(result.issues.some((issue) => issue.desc.includes('A ↔ C')));
      },
    },
    {
      id: 'temperature-no-common-range',
      run() {
        const fish = [
          createFish('a', [6, 8], [20, 23]),
          createFish('b', [7, 9], [25, 28]),
        ];
        const result = runAnalysis(engineSource, fish, ['a', 'b']);
        assert.equal(result.params.temp, null);
        assert(result.issues.some((issue) => issue.title === 'Ortak güvenli sıcaklık aralığı yok'));
      },
    },
    {
      id: 'gh-no-common-range',
      run() {
        const fish = [
          createFish('a', [6, 8], [22, 28], [1, 4]),
          createFish('b', [7, 9], [24, 30], [8, 12]),
        ];
        const result = runAnalysis(engineSource, fish, ['a', 'b']);
        assert.equal(result.params.gh, null);
        assert(result.issues.some((issue) => issue.title === 'Ortak güvenli GH aralığı yok'));
      },
    },
    {
      id: 'missing-gh-is-ignored',
      run() {
        const fish = [
          createFish('a', [6, 8], [22, 28], null),
          createFish('b', [7, 9], [24, 30], [5, 10]),
        ];
        const result = runAnalysis(engineSource, fish, ['a', 'b']);
        assert.deepEqual(plainRange(result.params.gh), [5, 10]);
        assert(!result.issues.some((issue) => issue.title.includes('GH')));
      },
    },
    {
      id: 'single-species-range',
      run() {
        const fish = [createFish('a', [6, 8], [22, 28], [4, 10])];
        const result = runAnalysis(engineSource, fish, ['a']);
        assert.deepEqual(plainRange(result.params.pH), [6, 8]);
        assert.deepEqual(plainRange(result.params.temp), [22, 28]);
        assert.deepEqual(plainRange(result.params.gh), [4, 10]);
      },
    },
    {
      id: 'empty-selection',
      run() {
        const result = runAnalysis(engineSource, [], []);
        assert.equal(result.params.pH, null);
        assert.equal(result.params.temp, null);
        assert.equal(result.params.gh, null);
      },
    },
    {
      id: 'touching-boundary-is-valid',
      run() {
        const fish = [
          createFish('a', [6, 7], [22, 24]),
          createFish('b', [7, 8], [24, 26]),
        ];
        const result = runAnalysis(engineSource, fish, ['a', 'b']);
        assert.deepEqual(plainRange(result.params.pH), [7, 7]);
        assert.deepEqual(plainRange(result.params.temp), [24, 24]);
      },
    },
    {
      id: 'english-critical-message',
      run() {
        const fish = [
          createFish('a', [6, 7], [22, 24]),
          createFish('b', [8, 9], [25, 26]),
        ];
        const result = runAnalysis(engineSource, fish, ['a', 'b'], 'en');
        assert(result.issues.some((issue) => issue.title === 'No common safe pH range'));
        assert(result.issues.some((issue) => issue.title === 'No common safe temperature range'));
        assert(result.issues.some((issue) => issue.desc.includes('a ↔ b')));
      },
    },
  ];

  for (const scenario of scenarios) scenario.run();

  return {
    scenarios: scenarios.length,
    overlappingScenarios: 4,
    nullRangeScenarios: 4,
    languageScenarios: 2,
    criticalParameters: ['pH', 'temp', 'gh'],
  };
}
