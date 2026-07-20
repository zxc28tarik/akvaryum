import { PRIORITY_100_IDS } from './priority-social-care-v1.mjs';

export const PRIORITY_TANK_LENGTH_VERSION = 1;
export const PRIORITY_TANK_LENGTH_SOURCE_ID = 'priority-tank-length-rules-v1';
export const PRIORITY_TANK_LENGTH_PROGRAM = 'priority-100-tank-length-v1';

export const STANDARD_TANK_LENGTHS_CM = Object.freeze([
  30, 40, 45, 50, 60, 75, 80, 90, 100, 120, 150, 180, 200, 240, 300, 360, 450,
]);

const PRIORITY_RANK_BY_ID = new Map(
  PRIORITY_100_IDS.map((id, index) => [id, index + 1]),
);

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function roundUpToStandardLength(valueCm) {
  const standard = STANDARD_TANK_LENGTHS_CM.find((lengthCm) => lengthCm >= valueCm);
  if (standard) return standard;
  return Math.ceil(valueCm / 50) * 50;
}

function bodyLengthMultiplier(adultCm) {
  if (adultCm <= 5) return 10;
  if (adultCm <= 10) return 8;
  if (adultCm <= 20) return 6;
  if (adultCm <= 35) return 5;
  return 4.5;
}

function volumeLengthFloor(record) {
  const minVolumeL = Number(record.tank?.minVolumeL ?? 0);
  if (!(minVolumeL > 0)) {
    throw new Error(`${record.id}: minimum tank hacmi olmadan uzunluk türetilemez.`);
  }

  // Standart dikdörtgen tank varsayımı: genişlik ve yükseklik, uzunluğun yaklaşık %45'i.
  const rawCm = Math.cbrt((minVolumeL * 1000) / (0.45 * 0.45));
  return {
    rawCm,
    roundedCm: roundUpToStandardLength(rawCm),
  };
}

function bodyLengthFloor(record) {
  const adultCm = Number(record.size?.adultCm?.[1] ?? 0);
  if (!(adultCm > 0)) {
    throw new Error(`${record.id}: yetişkin boyu olmadan tank uzunluğu türetilemez.`);
  }

  let rawCm = adultCm * bodyLengthMultiplier(adultCm);
  const groupSwimmer = ['group', 'school'].includes(record.social?.mode);
  const elongatedOrSurface = record.appearance?.silhouette === 'long'
    || record.behavior?.zone?.includes('surface');

  if (groupSwimmer && elongatedOrSurface) rawCm *= 1.2;

  return {
    rawCm,
    roundedCm: roundUpToStandardLength(rawCm),
    movementFactor: groupSwimmer && elongatedOrSurface ? 1.2 : 1,
  };
}

export function derivePriorityTankLengthProfile(record) {
  const priorityRank = PRIORITY_RANK_BY_ID.get(record.id);
  if (!priorityRank) return null;

  const volumeFloor = volumeLengthFloor(record);
  const bodyFloor = bodyLengthFloor(record);
  const minLengthCm = Math.max(volumeFloor.roundedCm, bodyFloor.roundedCm);
  const limitingRule = volumeFloor.roundedCm > bodyFloor.roundedCm
    ? 'volume'
    : bodyFloor.roundedCm > volumeFloor.roundedCm
      ? 'body_length'
      : 'both';

  return {
    program: PRIORITY_TANK_LENGTH_PROGRAM,
    version: PRIORITY_TANK_LENGTH_VERSION,
    priorityRank,
    selectionMethod: 'legacy_catalog_priority_order',
    method: 'max_of_volume_and_body_length_floors',
    minLengthCm,
    volumeFloorRawCm: Number(volumeFloor.rawCm.toFixed(2)),
    volumeFloorCm: volumeFloor.roundedCm,
    bodyFloorRawCm: Number(bodyFloor.rawCm.toFixed(2)),
    bodyFloorCm: bodyFloor.roundedCm,
    bodyMultiplier: bodyLengthMultiplier(Number(record.size.adultCm[1])),
    movementFactor: bodyFloor.movementFactor,
    limitingRule,
    externalReviewRequired: true,
  };
}

export function applyPriorityTankLength(records) {
  return records.map((record) => {
    const profile = derivePriorityTankLengthProfile(record);
    if (!profile) return record;

    const note = 'Öncelik 100 minimum tank uzunluğu hacim ve yetişkin boyu alt sınırlarından türetildi; dış tür kaynağı doğrulaması bekliyor.';
    return {
      ...record,
      tank: {
        ...record.tank,
        minLengthCm: profile.minLengthCm,
      },
      sourceIds: unique([...(record.sourceIds ?? []), PRIORITY_TANK_LENGTH_SOURCE_ID]),
      fieldSourceIds: {
        ...record.fieldSourceIds,
        tank: unique([...(record.fieldSourceIds?.tank ?? []), PRIORITY_TANK_LENGTH_SOURCE_ID]),
      },
      verification: {
        ...record.verification,
        confidence: 'low',
        notes: unique([...(record.verification?.notes ?? []), note]),
      },
      migration: {
        ...record.migration,
        derivedFields: unique([...(record.migration?.derivedFields ?? []), 'tank.minLengthCm']),
        unknownFields: (record.migration?.unknownFields ?? []).filter(
          (field) => field !== 'tank.minLengthCm',
        ),
      },
    };
  });
}
