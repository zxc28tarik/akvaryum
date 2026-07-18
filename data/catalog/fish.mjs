export const FISH_ENTITY_TYPES = Object.freeze([
  'freshwater_fish',
  'brackish_fish',
  'marine_fish',
]);

const FISH_ENTITY_TYPE_SET = new Set(FISH_ENTITY_TYPES);

export function isFish(record) {
  return FISH_ENTITY_TYPE_SET.has(record?.entityType);
}

export function selectFish(records) {
  return records.filter(isFish);
}
