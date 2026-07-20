export const PLANT_MIGRATION_SOURCE_ID = 'legacy-plant-migration-v1';

const DIFFICULTY_MAP = Object.freeze({
  easy: 'beginner',
  medium: 'intermediate',
  hard: 'advanced',
});

const PLACEMENT_MAP = Object.freeze({
  foreground: 'foreground',
  mid: 'midground',
  background: 'background',
  surface: 'floating',
});

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function mappedFieldSources(record) {
  const legacySource = record.fieldSourceIds?.core ?? ['legacy-plant-dataset-v1'];
  const mapped = unique([...legacySource, PLANT_MIGRATION_SOURCE_ID]);
  return {
    name: legacySource,
    scientificName: legacySource,
    entityType: [PLANT_MIGRATION_SOURCE_ID],
    category: mapped,
    tags: [PLANT_MIGRATION_SOURCE_ID],
    summary: [PLANT_MIGRATION_SOURCE_ID],
    placement: mapped,
    water: [PLANT_MIGRATION_SOURCE_ID],
    light: mapped,
    co2Need: mapped,
    growthRate: [PLANT_MIGRATION_SOURCE_ID],
    nutrientDemand: [PLANT_MIGRATION_SOURCE_ID],
    rootFeeder: [PLANT_MIGRATION_SOURCE_ID],
    waterColumnFeeder: [PLANT_MIGRATION_SOURCE_ID],
    heightCm: [PLANT_MIGRATION_SOURCE_ID],
    propagation: [PLANT_MIGRATION_SOURCE_ID],
    attachToHardscape: [PLANT_MIGRATION_SOURCE_ID],
    difficulty: mapped,
    appearance: mapped,
    migration: [PLANT_MIGRATION_SOURCE_ID],
  };
}

export function migrateLegacyPlant(record) {
  const placement = PLACEMENT_MAP[record.placement];
  if (!placement) throw new Error(`${record.id}: bilinmeyen bitki yerleşimi (${record.placement}).`);

  const difficulty = DIFFICULTY_MAP[record.difficulty];
  if (!difficulty) throw new Error(`${record.id}: bilinmeyen bitki zorluğu (${record.difficulty}).`);

  const legacySourceIds = record.sourceIds ?? ['legacy-plant-dataset-v1'];
  return {
    id: record.id,
    status: 'needs_update',
    name: {
      tr: record.tr,
      en: record.en,
    },
    scientificName: record.sci,
    aliases: [],
    entityType: 'aquatic_plant',
    category: record.kind,
    tags: unique([
      'freshwater',
      record.kind,
      placement,
      `${record.light}_light`,
      record.co2 ? 'co2_required' : 'low_tech',
    ]),
    summary: {
      tr: 'Eski bitki kaydından taşındı; su, büyüme ve beslenme gereksinimleri doğrulama bekliyor.',
      en: 'Migrated from the legacy plant dataset; water, growth and nutrient requirements await verification.',
    },
    placement: [placement],
    water: {
      temperatureC: null,
      pH: null,
      gh: null,
    },
    light: {
      min: record.light,
      max: record.light,
    },
    co2Need: record.co2 ? 'required' : 'none',
    growthRate: 'unknown',
    nutrientDemand: 'unknown',
    rootFeeder: null,
    waterColumnFeeder: null,
    heightCm: null,
    propagation: [],
    attachToHardscape: null,
    difficulty,
    appearance: {
      kind: record.kind,
      color: record.color,
    },
    sourceIds: unique([...legacySourceIds, PLANT_MIGRATION_SOURCE_ID]),
    fieldSourceIds: mappedFieldSources(record),
    verification: {
      status: 'needs_review',
      confidence: 'low',
      notes: unique([
        ...(record.verification?.notes ?? []),
        'Plant v1 alanları eski bitki verisinden taşındı; eksik bakım alanları dış kaynak doğrulaması bekliyor.',
      ]),
    },
    dataVersion: 1,
    migration: {
      sourceModel: 'legacyPlantV1',
      targetModel: 'plantV1',
      schemaVersion: 1,
      directFields: [
        'id', 'name', 'scientificName', 'light', 'appearance',
      ],
      derivedFields: [
        'status', 'entityType', 'category', 'tags', 'summary',
        'placement', 'co2Need', 'difficulty',
      ],
      unknownFields: [
        'water.temperatureC', 'water.pH', 'water.gh', 'growthRate',
        'nutrientDemand', 'rootFeeder', 'waterColumnFeeder', 'heightCm',
        'propagation', 'attachToHardscape',
      ],
    },
  };
}

export function migrateLegacyPlants(records) {
  return records.map(migrateLegacyPlant);
}
