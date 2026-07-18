export const INVERTEBRATE_ENTITY_TYPES = Object.freeze([
  'freshwater_shrimp',
  'marine_shrimp',
  'snail',
  'crab',
  'crayfish',
  'bivalve',
  'echinoderm',
  'anemone',
  'other_invertebrate',
]);

const INVERTEBRATE_ENTITY_TYPE_SET = new Set(INVERTEBRATE_ENTITY_TYPES);

export function isInvertebrate(record) {
  return INVERTEBRATE_ENTITY_TYPE_SET.has(record?.entityType);
}

export function selectInvertebrates(records) {
  return records.filter(isInvertebrate);
}
