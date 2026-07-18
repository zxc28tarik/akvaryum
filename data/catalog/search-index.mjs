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

function localizedName(record, language) {
  return record.name?.[language] ?? record[language === 'tr' ? 'nameTr' : 'nameEn'];
}

function scientificName(record) {
  return record.scientificName ?? record.sci;
}

export function buildInhabitantSearchIndex(records) {
  return records.map((record) => {
    const nameTr = localizedName(record, 'tr');
    const nameEn = localizedName(record, 'en');
    const scientific = scientificName(record);
    const terms = [
      record.id,
      nameTr,
      nameEn,
      scientific,
      record.entityType,
      record.category,
      record.taxonomy?.genus,
      record.taxonomy?.family,
      ...(record.aliases ?? []),
    ].filter(Boolean);

    return {
      id: record.id,
      collection: collectionFor(record),
      entityType: record.entityType,
      category: record.category,
      nameTr,
      nameEn,
      scientificName: scientific,
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
