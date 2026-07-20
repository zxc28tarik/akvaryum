const MIGRATION_SOURCE_ID = 'legacy-inhabitant-migration-v1';

const DIET_MAP = Object.freeze({
  omni: 'omnivore',
  herbi: 'herbivore',
  carni: 'carnivore',
});

const TEMPERAMENT_MAP = Object.freeze({
  peaceful: 'peaceful',
  semi: 'semi_aggressive',
  aggressive: 'aggressive',
});

const AGGRESSION_MAP = Object.freeze({
  peaceful: 'low',
  semi: 'medium',
  aggressive: 'high',
});

const ZONE_MAP = Object.freeze({
  top: 'surface',
  mid: 'mid',
  bottom: 'bottom',
});

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function nonEmpty(value, fallback) {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function socialMode(record) {
  if (['soft_coral', 'lps_coral', 'sps_coral'].includes(record.entityType)) return 'colony';
  if (record.schooling >= 6) return 'school';
  if (record.schooling >= 2) return 'group';
  return 'solitary';
}

function coreSourceIds(record) {
  return record.fieldSourceIds?.core ?? record.sourceIds?.slice(0, 1) ?? [];
}

function migratedFieldSources(record) {
  const core = coreSourceIds(record);
  return {
    ...record.fieldSourceIds,
    name: core,
    scientificName: core,
    water: core,
    size: core,
    tank: core,
    social: unique([...core, MIGRATION_SOURCE_ID]),
    behavior: core,
    feeding: core,
    compatibility: core,
    habitat: [MIGRATION_SOURCE_ID],
    care: [MIGRATION_SOURCE_ID],
    appearance: core,
    notes: core,
    summary: [MIGRATION_SOURCE_ID],
    migration: [MIGRATION_SOURCE_ID],
  };
}

export function migrateLegacyInhabitant(record) {
  const minGroup = Number.isInteger(record.schooling) && record.schooling > 0
    ? record.schooling
    : null;
  const notesTr = String(record.notes ?? '').trim();
  const notesEn = String(record.notesEn ?? '').trim();

  const water = {
    types: [record.water],
    temperatureC: [...record.temp],
    pH: [...record.pH],
    gh: [...record.gh],
  };
  if (record.salinity) water.salinityPpt = [...record.salinity];

  const social = {
    mode: socialMode(record),
    conspecificAggression: AGGRESSION_MAP[record.aggression] ?? 'unknown',
    territoriality: 'unknown',
  };
  if (minGroup) {
    social.minGroup = minGroup;
    social.recommendedGroup = minGroup;
  }

  return {
    id: record.id,
    status: 'needs_update',
    name: {
      tr: record.nameTr,
      en: record.nameEn,
    },
    scientificName: record.sci,
    aliases: [],
    entityType: record.entityType,
    category: record.category,
    taxonomy: { ...record.taxonomy },
    tags: unique([record.water, record.entityType, record.category]),
    summary: {
      tr: nonEmpty(notesTr, 'Eski kayıttan taşındı; bakım bilgileri doğrulama bekliyor.'),
      en: nonEmpty(notesEn, 'Migrated from the legacy dataset; care data awaits verification.'),
    },
    water,
    size: {
      adultCm: [record.adultSize, record.adultSize],
    },
    tank: {
      minVolumeL: record.minVolume,
      additionalVolumePerInhabitantL: record.perFishL,
    },
    social,
    behavior: {
      temperament: TEMPERAMENT_MAP[record.aggression] ?? 'unknown',
      activity: 'unknown',
      zone: [ZONE_MAP[record.layer]],
      finNipper: record.finNippers,
      longFinned: record.longFinned,
    },
    feeding: {
      diet: [DIET_MAP[record.diet]],
      feedingDifficulty: 'unknown',
    },
    compatibility: {
      plantSafe: record.plantSafe,
      coralSafe: record.water === 'salt'
        ? (record.reefSafe ? 'yes' : 'no')
        : 'not_applicable',
    },
    habitat: {
      flow: 'unknown',
      oxygen: 'unknown',
      substrate: [],
      shelter: [],
    },
    care: {
      difficulty: 'unknown',
      sensitiveTo: [],
      specialWarnings: [],
    },
    appearance: {
      silhouette: record.silhouette,
      colors: [...record.color],
    },
    notes: {
      tr: notesTr,
      en: notesEn,
    },
    sourceIds: unique([...(record.sourceIds ?? []), MIGRATION_SOURCE_ID]),
    fieldSourceIds: migratedFieldSources(record),
    verification: {
      status: 'needs_review',
      confidence: 'low',
      notes: unique([
        ...(record.verification?.notes ?? []),
        'Yeni model alanları eski veriden kayıpsız taşındı; dış kaynak doğrulaması bekliyor.',
      ]),
    },
    dataVersion: 1,
    migration: {
      sourceModel: 'legacyFishV1',
      targetModel: 'inhabitantV1',
      schemaVersion: 1,
      directFields: [
        'id', 'name', 'scientificName', 'water', 'size', 'tank',
        'behavior.zone', 'behavior.finNipper', 'behavior.longFinned',
        'feeding.diet', 'compatibility.plantSafe', 'compatibility.coralSafe',
        'appearance', 'notes',
      ],
      derivedFields: [
        'status', 'tags', 'summary', 'social.mode',
        'social.conspecificAggression', 'behavior.temperament',
      ],
      unknownFields: [
        'tank.minLengthCm', 'social.territoriality', 'behavior.activity',
        'feeding.feedingDifficulty', 'habitat.flow',
        'habitat.oxygen', 'care.difficulty',
      ],
    },
  };
}

export function migrateLegacyInhabitants(records) {
  return records.map(migrateLegacyInhabitant);
}

export { MIGRATION_SOURCE_ID };
