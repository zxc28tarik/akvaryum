import { isCoral } from './corals.mjs';
import { isFish } from './fish.mjs';
import { isInvertebrate } from './invertebrates.mjs';

function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/[^a-z0-9çğıöşü\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function collectionFor(record) {
  if (isFish(record)) return 'fish';
  if (isInvertebrate(record)) return 'invertebrates';
  if (isCoral(record)) return 'corals';
  throw new Error(`${record?.id ?? 'bilinmeyen'}: desteklenmeyen entityType (${record?.entityType ?? 'eksik'}).`);
}

export function buildInhabitantSearchIndex(records) {
  return records.map((record) => {
    const terms = [
      record.id,
      record.nameTr,
      record.nameEn,
      record.sci,
      record.entityType,
      record.category,
      record.taxonomy?.genus,
      record.taxonomy?.family,
    ].filter(Boolean);

    return {
      id: record.id,
      collection: collectionFor(record),
      entityType: record.entityType,
      category: record.category,
      nameTr: record.nameTr,
      nameEn: record.nameEn,
      scientificName: record.sci,
      genus: record.taxonomy?.genus ?? null,
      family: record.taxonomy?.family ?? null,
      searchText: normalizeSearchText(terms.join(' ')),
    };
  });
}

export function searchInhabitantIndex(index, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return index;
  const tokens = normalizedQuery.split(' ').filter(Boolean);
  return index.filter((entry) => tokens.every((token) => entry.searchText.includes(token)));
}
