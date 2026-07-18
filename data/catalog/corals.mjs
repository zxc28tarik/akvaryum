export const CORAL_ENTITY_TYPES = Object.freeze([
  'soft_coral',
  'lps_coral',
  'sps_coral',
]);

const CORAL_ENTITY_TYPE_SET = new Set(CORAL_ENTITY_TYPES);

export function isCoral(record) {
  return CORAL_ENTITY_TYPE_SET.has(record?.entityType);
}

export function selectCorals(records) {
  return records.filter(isCoral);
}
