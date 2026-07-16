# 05 — Veri Modeli ve Kodlanacak Alanlar

## Amaç

Veriyi JavaScript kodundan ayırmak, şemayla doğrulamak ve analiz motoruna yeterli ayrıntıyı sağlamak.

## 1. Ortak kayıt alanları

Her veri varlığı aşağıdaki ortak alanları taşımalıdır:

```ts
interface BaseEntity {
  id: string;
  status: 'draft' | 'reviewed' | 'verified' | 'needs_update' | 'deprecated';
  name: { tr: string; en: string };
  scientificName?: string;
  aliases?: string[];
  entityType: string;
  category: string;
  tags: string[];
  summary: { tr: string; en: string };
  sources: SourceRef[];
  verifiedAt: string;
  confidence: 'low' | 'medium' | 'high';
  dataVersion: number;
}
```

## 2. Kaynak modeli

```ts
interface SourceRef {
  id: string;
  title: string;
  publisher: string;
  url?: string;
  accessedAt: string;
  fields: string[];
  sourceType: 'primary' | 'institutional' | 'book' | 'expert' | 'retailer' | 'community';
  note?: string;
}
```

## 3. Canlı modeli

```ts
interface Inhabitant extends BaseEntity {
  entityType:
    | 'freshwater_fish' | 'brackish_fish' | 'marine_fish'
    | 'freshwater_shrimp' | 'marine_shrimp'
    | 'snail' | 'crab' | 'crayfish' | 'bivalve'
    | 'echinoderm' | 'anemone'
    | 'soft_coral' | 'lps_coral' | 'sps_coral'
    | 'other_invertebrate';

  taxonomy: {
    family?: string;
    genus?: string;
    acceptedName?: string;
  };

  water: {
    types: ('fresh' | 'brackish' | 'salt')[];
    temperatureC: Range;
    pH: Range;
    gh?: Range;
    kh?: Range;
    salinityPpt?: Range;
    recommendedTemperatureC?: Range;
    recommendedPH?: Range;
  };

  size: {
    adultCm: Range;
    maxReportedCm?: number;
    bodyMassClass?: 'tiny' | 'small' | 'medium' | 'large' | 'giant';
    mouthSizeClass?: 'micro' | 'small' | 'medium' | 'large';
  };

  tank: {
    minVolumeL: number;
    minLengthCm?: number;
    minFootprintCm2?: number;
    preferredShape?: ('long' | 'standard' | 'cube' | 'tall')[];
    lidRequired?: boolean;
  };

  social: {
    mode: 'solitary' | 'pair' | 'harem' | 'group' | 'school' | 'colony';
    minGroup?: number;
    recommendedGroup?: number;
    sexRatio?: string;
    conspecificAggression: 'none' | 'low' | 'medium' | 'high' | 'extreme';
    territoriality: 'none' | 'low' | 'medium' | 'high';
  };

  behavior: {
    temperament: 'peaceful' | 'semi_aggressive' | 'aggressive' | 'predatory';
    activity: 'slow' | 'moderate' | 'active' | 'very_active';
    zone: ('surface' | 'mid' | 'bottom' | 'rockwork' | 'sand' | 'open_water')[];
    nocturnal?: boolean;
    burrower?: boolean;
    jumper?: boolean;
    finNipper?: boolean;
    longFinned?: boolean;
  };

  feeding: {
    diet: ('herbivore' | 'omnivore' | 'carnivore' | 'planktivore' | 'filter_feeder')[];
    feedingDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
    liveFoodDependency?: boolean;
    feedingFrequencyPerDay?: Range;
  };

  compatibility: {
    plantSafe?: boolean;
    shrimpSafe?: boolean;
    snailSafe?: boolean;
    crabSafe?: boolean;
    coralSafe?: 'yes' | 'with_caution' | 'no' | 'not_applicable';
    spsSafe?: boolean;
    lpsSafe?: boolean;
    softCoralSafe?: boolean;
    clamSafe?: boolean;
    mayEatSmallerThanCm?: number;
    avoidEntityTypes?: string[];
  };

  habitat: {
    flow: 'low' | 'medium' | 'high' | 'variable';
    oxygen: 'normal' | 'high';
    substrate: string[];
    shelter: string[];
    light?: 'low' | 'medium' | 'high';
  };

  care: {
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    lifespanYears?: Range;
    sensitiveTo?: string[];
    specialWarnings?: LocalizedText[];
    venomous?: boolean;
    toxicWhenStressed?: boolean;
  };
}
```

## 4. Bitki modeli

```ts
interface Plant extends BaseEntity {
  entityType: 'aquatic_plant';
  placement: ('foreground' | 'midground' | 'background' | 'floating' | 'hardscape')[];
  temperatureC: Range;
  pH: Range;
  gh?: Range;
  light: { min: 'low' | 'medium' | 'high'; max: 'low' | 'medium' | 'high' };
  co2Need: 'none' | 'beneficial' | 'required';
  growthRate: 'slow' | 'medium' | 'fast';
  nutrientDemand: 'low' | 'medium' | 'high';
  rootFeeder: boolean;
  waterColumnFeeder: boolean;
  heightCm: Range;
  propagation: string[];
  attachToHardscape: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}
```

## 5. Taban modeli

```ts
interface Substrate extends BaseEntity {
  entityType: 'substrate';
  waterTypes: ('fresh' | 'brackish' | 'salt')[];
  material: string;
  grainSizeMm: Range;
  activeBuffering: boolean;
  targetPH?: Range;
  khEffect: 'lower' | 'neutral' | 'raise';
  ghEffect: 'lower' | 'neutral' | 'raise';
  nutrientRich: boolean;
  plantFriendly: boolean;
  burrowFriendly: boolean;
  bottomFishSafe: boolean;
  sharpnessRisk: 'none' | 'low' | 'medium' | 'high';
  recommendedDepthCm: Range;
  replacementMonths?: Range;
  bestFor: string[];
  avoidFor: string[];
}
```

## 6. Tür çifti istisnası

```ts
interface CompatibilityOverride {
  id: string;
  a: string;
  b: string;
  direction: 'both' | 'a_to_b' | 'b_to_a';
  status: 'compatible' | 'caution' | 'incompatible' | 'conditional';
  conditions?: RuleCondition[];
  reasons: LocalizedText[];
  sourceIds: string[];
  verifiedAt: string;
}
```

## 7. Kural çıktısı

```ts
interface RuleResult {
  ruleId: string;
  severity: 'info' | 'tip' | 'warning' | 'critical';
  entities: string[];
  title: LocalizedText;
  explanation: LocalizedText;
  resolution?: LocalizedText[];
  evidence?: string[];
  scoreImpact: number;
}
```

## 8. Veri doğrulama kuralları

- `id` yalnız küçük harf, sayı ve tire içerir.
- `id` benzersizdir ve yayınlandıktan sonra değişmez.
- Aralıkların alt değeri üst değerden büyük olamaz.
- Tuzlu su canlısında salinity alanı gerekir.
- Mercanda ışık ve akıntı gerekir.
- Sürü türünde `minGroup >= 2` gerekir.
- `minLengthCm` ve `minVolumeL` negatif/0 olamaz.
- `verified` kayıt kaynak olmadan geçemez.
- Türkçe ve İngilizce ad boş olamaz.
- `deprecated` kayıt yerine geçecek kimlik varsa `replacedBy` taşımalıdır.

## 9. Dosya yapısı önerisi

```text
src/
  data/
    inhabitants/
      freshwater/
      brackish/
      marine/
      corals/
      invertebrates/
    plants/
    substrates/
    hardscape/
    equipment/
    compatibility-overrides/
    sources/
  schemas/
  engine/
  features/
  components/
  pages/
  tests/
```

## 10. Migrasyon kuralı

1. Eski `id` korunur.
2. Eski alanlar yeni alanlara dönüştürülür.
3. Bilinmeyen alanlar uydurulmaz; `null`/eksik olarak işaretlenir.
4. Eksik alanlar `needs_update` listesine düşer.
5. Eski ve yeni motor bir süre aynı örneklerde karşılaştırılır.
