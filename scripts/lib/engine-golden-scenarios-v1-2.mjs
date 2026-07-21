import {
  ENGINE_GOLDEN_DEFAULT_FISH_V1_1,
  ENGINE_GOLDEN_SCENARIOS_V1_1,
} from './engine-golden-scenarios-v1-1.mjs';

const BASE_PARAMS = Object.freeze({ pH: [6, 7], temp: [22, 24], gh: [2, 5] });

const fish = (id, overrides = {}) => ({ id, ...overrides });

const expected = (
  issues,
  warnings,
  tips,
  compat,
  params,
  score,
  verdict,
  neededVol,
  bioloadPct,
  totalFish,
  totalSpecies,
) => ({
  issues,
  warnings,
  tips,
  compat,
  params,
  score,
  verdict,
  neededVol,
  bioloadPct,
  totalFish,
  totalSpecies,
});

const analysis = (id, purpose, definitions, state, result) => ({
  id,
  mode: 'analysis',
  purpose,
  fish: definitions,
  plants: [],
  substrates: [],
  state,
  expected: result,
});

export const ENGINE_GOLDEN_DEFAULT_FISH_V1_2 = ENGINE_GOLDEN_DEFAULT_FISH_V1_1;

export const ENGINE_GOLDEN_ESSENTIAL_SCENARIOS_V1_2 = Object.freeze([
  analysis(
    'capacity-at-warning-boundary',
    'Yüzde 85 dolulukta yüksek kapasite uyarısının yanlışlıkla başlamamasını sabitler.',
    [fish('boundary-85', { minVolume: 85, perFishL: 0 })],
    { volume: 100, fish: [{ id: 'boundary-85', qty: 1 }] },
    expected([], [], ['COMPOSITION_HEALTHY'], ['PAIRWISE_SELF'], BASE_PARAMS, 100, 'excellent', 85, 85, 1, 1),
  ),
  analysis(
    'capacity-at-spare-boundary',
    'Yüzde 40 dolulukta boş kapasite önerisinin yanlışlıkla başlamamasını sabitler.',
    [fish('boundary-40', { minVolume: 40, perFishL: 0 })],
    { volume: 100, fish: [{ id: 'boundary-40', qty: 1 }] },
    expected([], [], ['COMPOSITION_HEALTHY'], ['PAIRWISE_SELF'], BASE_PARAMS, 100, 'excellent', 40, 40, 1, 1),
  ),
  analysis(
    'salt-tank-freshwater-mismatch',
    'Tuzlu su tankındaki tatlı su canlısının ters yön su tipi hatasını sabitler.',
    [fish('fresh-inhabitant')],
    { water: 'salt', volume: 40, fish: [{ id: 'fresh-inhabitant', qty: 1 }] },
    expected(['WATER_TYPE_MISMATCH'], [], [], ['PAIRWISE_SELF'], BASE_PARAMS, 75, 'good', 20, 50, 1, 1),
  ),
  analysis(
    'multiple-betta-quantity',
    'Tek kayıt içinde iki beta seçildiğinde kavga riskinin kritik sonuç üretmesini sabitler.',
    [fish('betta')],
    { volume: 40, fish: [{ id: 'betta', qty: 2 }] },
    expected(['PAIRWISE_INCOMPATIBLE'], [], [], ['PAIRWISE_INCOMPATIBLE'], BASE_PARAMS, 75, 'good', 22, 55, 2, 1),
  ),
  analysis(
    'different-clownfish-species',
    'Tuzlu suda iki farklı palyaço balığı türünün kritik uyumsuzluğunu sabitler.',
    [fish('clown-ocellaris', { water: 'salt' }), fish('clown-percula', { water: 'salt' })],
    {
      water: 'salt',
      volume: 100,
      fish: [{ id: 'clown-ocellaris', qty: 1 }, { id: 'clown-percula', qty: 1 }],
    },
    expected(
      ['PAIRWISE_INCOMPATIBLE'],
      [],
      [],
      ['PAIRWISE_SELF', 'PAIRWISE_INCOMPATIBLE', 'PAIRWISE_SELF'],
      BASE_PARAMS,
      75,
      'good',
      40,
      40,
      2,
      2,
    ),
  ),
  analysis(
    'multiple-tang-species',
    'Tuzlu suda iki farklı tang türünün çatışma uyarısını sabitler.',
    [fish('yellow-tang', { water: 'salt' }), fish('blue-tang', { water: 'salt' })],
    {
      water: 'salt',
      volume: 100,
      fish: [{ id: 'yellow-tang', qty: 1 }, { id: 'blue-tang', qty: 1 }],
    },
    expected(
      [],
      ['PAIRWISE_CAUTION'],
      ['COMPOSITION_HEALTHY'],
      ['PAIRWISE_SELF', 'PAIRWISE_CAUTION', 'PAIRWISE_SELF'],
      BASE_PARAMS,
      92,
      'excellent',
      40,
      40,
      2,
      2,
    ),
  ),
  analysis(
    'reef-unsafe-without-coral',
    'Mercan bulunmayan yalnız balık tuzlu su tankında yanlış resif uyarısı verilmemesini sabitler.',
    [fish('reef-risk', { water: 'salt', reefSafe: false })],
    { water: 'salt', volume: 40, fish: [{ id: 'reef-risk', qty: 1 }] },
    expected([], [], ['COMPOSITION_HEALTHY'], ['PAIRWISE_SELF'], BASE_PARAMS, 100, 'excellent', 20, 50, 1, 1),
  ),
]);

export const ENGINE_GOLDEN_SCENARIOS_V1_2 = Object.freeze([
  ...ENGINE_GOLDEN_SCENARIOS_V1_1,
  ...ENGINE_GOLDEN_ESSENTIAL_SCENARIOS_V1_2,
]);
