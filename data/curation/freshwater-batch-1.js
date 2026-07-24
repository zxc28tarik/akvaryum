// AKV-DATA-020 — kaynaklı tatlı su veri partisi 1 (20 kayıt)
;(() => {
  'use strict';

  const SOURCE_FISHBASE = 'fishbase-freshwater-batch-1-2026';
  const SOURCE_CARE = 'seriouslyfish-freshwater-batch-1-2026';
  const SOURCE_EDITORIAL = 'freshwater-batch-1-editorial-v1';
  const SOURCE_MIGRATION = 'legacy-inhabitant-migration-v1';
  const specs = window.AKV_FRESHWATER_BATCH_1_SPECS || [];

  if (specs.length !== 20) {
    throw new Error(`AKV-DATA-020 parti 1: 20 kayıt bekleniyordu, ${specs.length} bulundu.`);
  }

  const zoneLegacy = (zones) => zones.includes('surface') ? 'top' : (zones.includes('bottom') || zones.includes('sand') ? 'bottom' : 'mid');
  const unique = (values) => [...new Set(values.filter(Boolean))];

  function makeLegacy(spec) {
    return {
      id: spec.id,
      nameTr: spec.tr,
      nameEn: spec.en,
      sci: spec.sci,
      water: 'fresh',
      minVolume: spec.tank,
      perFishL: spec.per,
      pH: [...spec.ph],
      temp: [...spec.temp],
      gh: [...spec.gh],
      aggression: spec.aggression,
      schooling: spec.school,
      diet: spec.diet,
      adultSize: spec.size,
      layer: zoneLegacy(spec.zone),
      plantSafe: spec.plant,
      reefSafe: false,
      finNippers: Boolean(spec.fin),
      longFinned: false,
      silhouette: spec.silhouette,
      color: [...spec.colors],
      notes: spec.notes_tr,
      notesEn: spec.notes_en,
      entityType: 'freshwater_fish',
      category: spec.cat,
      taxonomy: {
        genus: spec.sci.split(' ')[0],
        family: spec.family,
        reviewStatus: 'needs_review',
      },
    };
  }

  function makeCanonical(spec) {
    const sourceIds = [SOURCE_FISHBASE, SOURCE_CARE, SOURCE_EDITORIAL, SOURCE_MIGRATION];
    const fieldSourceIds = {
      name: [SOURCE_FISHBASE, SOURCE_EDITORIAL],
      scientificName: [SOURCE_FISHBASE],
      'taxonomy.genus': [SOURCE_FISHBASE],
      'taxonomy.family': [SOURCE_FISHBASE],
      water: [SOURCE_FISHBASE, SOURCE_CARE],
      size: [SOURCE_FISHBASE],
      tank: [SOURCE_CARE],
      social: [SOURCE_CARE],
      behavior: [SOURCE_CARE],
      feeding: [SOURCE_CARE],
      compatibility: [SOURCE_CARE],
      habitat: [SOURCE_FISHBASE, SOURCE_CARE],
      care: [SOURCE_CARE],
      summary: [SOURCE_CARE, SOURCE_EDITORIAL],
      appearance: [SOURCE_EDITORIAL],
      notes: [SOURCE_CARE, SOURCE_EDITORIAL],
      migration: [SOURCE_MIGRATION],
    };
    const social = {
      mode: spec.mode,
      conspecificAggression: spec.conspecific,
      territoriality: spec.territoriality,
    };
    if (spec.school > 1) {
      social.minGroup = spec.school;
      social.recommendedGroup = spec.school;
    }
    if (spec.sex) {
      social.sexRatio = { minMales: spec.sex[0], minFemales: spec.sex[1], maxMales: spec.sex[0] };
    }
    return {
      id: spec.id,
      status: 'reviewed',
      name: { tr: spec.tr, en: spec.en },
      scientificName: spec.sci,
      aliases: [...spec.aliases],
      entityType: 'freshwater_fish',
      category: spec.cat,
      taxonomy: {
        genus: spec.sci.split(' ')[0],
        family: spec.family,
        reviewStatus: 'reviewed',
      },
      tags: unique(['fresh', 'freshwater_fish', spec.cat, spec.mode]),
      summary: { tr: spec.notes_tr, en: spec.notes_en },
      water: {
        types: ['fresh'],
        temperatureC: [...spec.temp],
        pH: [...spec.ph],
        gh: [...spec.gh],
      },
      size: { adultCm: [spec.size, spec.size] },
      tank: {
        minVolumeL: spec.tank,
        additionalVolumePerInhabitantL: spec.per,
        minLengthCm: spec.length,
      },
      social,
      behavior: {
        temperament: spec.aggression === 'aggressive' ? 'aggressive' : (spec.aggression === 'semi' ? 'semi_aggressive' : 'peaceful'),
        activity: spec.activity,
        zone: [...spec.zone],
        finNipper: Boolean(spec.fin),
        longFinned: false,
      },
      feeding: {
        diet: [spec.diet === 'carni' ? 'carnivore' : (spec.diet === 'herbi' ? 'herbivore' : 'omnivore')],
        feedingDifficulty: spec.feeding,
      },
      compatibility: {
        plantSafe: spec.plant,
        coralSafe: 'not_applicable',
      },
      habitat: {
        flow: spec.flow,
        oxygen: spec.oxygen,
        substrate: [...spec.substrate],
        shelter: [...spec.shelter],
      },
      care: {
        difficulty: spec.difficulty,
        sensitiveTo: unique([
          spec.oxygen === 'high' ? 'low_oxygen' : null,
          spec.flow === 'high' ? 'stagnant_water' : null,
          spec.feeding === 'hard' ? 'inappropriate_food_size' : null,
        ]),
        specialWarnings: [{ tr: spec.notes_tr, en: spec.notes_en }],
      },
      appearance: {
        silhouette: spec.silhouette,
        colors: [...spec.colors],
      },
      notes: { tr: spec.notes_tr, en: spec.notes_en },
      sourceIds,
      fieldSourceIds,
      verification: {
        status: 'reviewed',
        confidence: 'medium',
        notes: [
          'Taksonomi, su aralıkları ve yetişkin boyu FishBase tür özetleriyle; bakım alanları tür profilleriyle çapraz incelendi.',
          'Tank hacmi ve sosyal düzen ürün güvenliği için ihtiyatlı bakım alt sınırlarıdır; sonraki editör turunda tür bazlı yeniden kontrol edilecektir.',
        ],
      },
      dataVersion: 1,
      migration: {
        sourceModel: 'legacyFishV1',
        targetModel: 'inhabitantV1',
        schemaVersion: 1,
        directFields: [
          'id', 'name', 'scientificName', 'water', 'size', 'tank', 'social',
          'behavior', 'feeding', 'compatibility', 'habitat', 'care', 'appearance', 'notes',
        ],
        derivedFields: ['status', 'category', 'taxonomy', 'tags', 'summary', 'verification'],
        unknownFields: [],
      },
    };
  }

  const legacy = specs.map(makeLegacy);
  const canonical = specs.map(makeCanonical);
  const existing = window.DB_FRESH || [];
  const existingIds = new Set(existing.map((record) => record.id));
  window.DB_FRESH = [...existing, ...legacy.filter((record) => !existingIds.has(record.id))];
  window.AKV_FRESHWATER_BATCH_1 = {
    version: 1,
    taskId: 'AKV-DATA-020',
    reviewedAt: '2026-07-24',
    legacy,
    canonical,
  };
})();
