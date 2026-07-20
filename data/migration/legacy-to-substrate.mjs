export const SUBSTRATE_MIGRATION_SOURCE_ID = 'legacy-substrate-migration-v1';

const CATEGORY_BY_ID = Object.freeze({
  'fine-sand': 'sand',
  aragonite: 'sand',
  'crushed-coral': 'sand',
  gravel: 'gravel',
  'aqua-soil': 'soil',
  'black-sand': 'sand',
  'lava-rock': 'rock',
  'live-sand': 'sand',
});

const MATERIAL_BY_ID = Object.freeze({
  'fine-sand': 'fine_sand',
  aragonite: 'aragonite',
  'crushed-coral': 'crushed_coral',
  gravel: 'aquarium_gravel',
  'aqua-soil': 'aqua_soil',
  'black-sand': 'black_sand',
  'lava-rock': 'lava_rock',
  'live-sand': 'live_sand',
});

const PH_EFFECT_MAP = Object.freeze({
  low: 'lower',
  neutral: 'neutral',
  high: 'raise',
});

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function mappedFieldSources(record) {
  const legacySource = record.fieldSourceIds?.core ?? ['legacy-substrate-dataset-v1'];
  const mapped = unique([...legacySource, SUBSTRATE_MIGRATION_SOURCE_ID]);
  return {
    name: legacySource,
    entityType: [SUBSTRATE_MIGRATION_SOURCE_ID],
    category: [SUBSTRATE_MIGRATION_SOURCE_ID],
    tags: [SUBSTRATE_MIGRATION_SOURCE_ID],
    summary: legacySource,
    waterTypes: legacySource,
    material: [SUBSTRATE_MIGRATION_SOURCE_ID],
    grainSizeMm: [SUBSTRATE_MIGRATION_SOURCE_ID],
    activeBuffering: mapped,
    targetPH: [SUBSTRATE_MIGRATION_SOURCE_ID],
    phEffect: legacySource,
    khEffect: [SUBSTRATE_MIGRATION_SOURCE_ID],
    ghEffect: [SUBSTRATE_MIGRATION_SOURCE_ID],
    nutrientRich: [SUBSTRATE_MIGRATION_SOURCE_ID],
    plantFriendly: legacySource,
    burrowFriendly: [SUBSTRATE_MIGRATION_SOURCE_ID],
    bottomFishSafe: [SUBSTRATE_MIGRATION_SOURCE_ID],
    sharpnessRisk: [SUBSTRATE_MIGRATION_SOURCE_ID],
    recommendedDepthCm: [SUBSTRATE_MIGRATION_SOURCE_ID],
    replacementMonths: [SUBSTRATE_MIGRATION_SOURCE_ID],
    bestFor: [SUBSTRATE_MIGRATION_SOURCE_ID],
    avoidFor: [SUBSTRATE_MIGRATION_SOURCE_ID],
    appearance: legacySource,
    migration: [SUBSTRATE_MIGRATION_SOURCE_ID],
  };
}

export function migrateLegacySubstrate(record) {
  const category = CATEGORY_BY_ID[record.id];
  const material = MATERIAL_BY_ID[record.id];
  const phEffect = PH_EFFECT_MAP[record.ph];

  if (!category || !material) {
    throw new Error(`${record.id}: taban kategorisi veya malzemesi eşlenemedi.`);
  }
  if (!phEffect) {
    throw new Error(`${record.id}: bilinmeyen pH etkisi (${record.ph}).`);
  }

  const legacySourceIds = record.sourceIds ?? ['legacy-substrate-dataset-v1'];
  return {
    id: record.id,
    status: 'needs_update',
    name: {
      tr: record.tr,
      en: record.en,
    },
    aliases: [],
    entityType: 'substrate',
    category,
    tags: unique([
      ...record.water.map((waterType) => `${waterType}_water`),
      category,
      material,
      `${phEffect}_ph`,
      record.plantFriendly ? 'plant_friendly' : 'not_plant_friendly',
    ]),
    summary: {
      tr: record.desc,
      en: record.descEn,
    },
    waterTypes: [...record.water],
    material,
    grainSizeMm: null,
    activeBuffering: phEffect !== 'neutral',
    targetPH: null,
    phEffect,
    khEffect: 'unknown',
    ghEffect: 'unknown',
    nutrientRich: null,
    plantFriendly: record.plantFriendly,
    burrowFriendly: null,
    bottomFishSafe: null,
    sharpnessRisk: 'unknown',
    recommendedDepthCm: null,
    replacementMonths: null,
    bestFor: [],
    avoidFor: [],
    appearance: {
      color: record.color,
    },
    sourceIds: unique([...legacySourceIds, SUBSTRATE_MIGRATION_SOURCE_ID]),
    fieldSourceIds: mappedFieldSources(record),
    verification: {
      status: 'needs_review',
      confidence: 'low',
      notes: unique([
        ...(record.verification?.notes ?? []),
        'Substrate v1 alanları eski taban verisinden taşındı; malzeme güvenliği, tane boyu ve kullanım gereksinimleri dış kaynak doğrulaması bekliyor.',
      ]),
    },
    dataVersion: 1,
    migration: {
      sourceModel: 'legacySubstrateV1',
      targetModel: 'substrateV1',
      schemaVersion: 1,
      directFields: [
        'id', 'name', 'summary', 'waterTypes', 'phEffect',
        'plantFriendly', 'appearance',
      ],
      derivedFields: [
        'status', 'entityType', 'category', 'tags', 'material', 'activeBuffering',
      ],
      unknownFields: [
        'grainSizeMm', 'targetPH', 'khEffect', 'ghEffect', 'nutrientRich',
        'burrowFriendly', 'bottomFishSafe', 'sharpnessRisk',
        'recommendedDepthCm', 'replacementMonths', 'bestFor', 'avoidFor',
      ],
    },
  };
}

export function migrateLegacySubstrates(records) {
  return records.map(migrateLegacySubstrate);
}
