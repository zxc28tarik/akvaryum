import { selectCorals } from './corals.mjs';
import { selectFish } from './fish.mjs';
import { selectInvertebrates } from './invertebrates.mjs';
import { buildInhabitantSearchIndex } from './search-index.mjs';

export const INHABITANT_CATALOG_VERSION = 1;

function assertUniqueRecords(collections, expectedTotal) {
  const seen = new Set();
  let total = 0;

  for (const [collectionName, records] of Object.entries(collections)) {
    for (const record of records) {
      total += 1;
      if (seen.has(record.id)) {
        throw new Error(`${record.id}: birden fazla katalog koleksiyonunda bulundu (${collectionName}).`);
      }
      seen.add(record.id);
    }
  }

  if (total !== expectedTotal) {
    throw new Error(`Katalog koleksiyon toplamı ${total}; ${expectedTotal} kayıt bekleniyordu.`);
  }
}

export function buildInhabitantCatalog(records) {
  const collections = {
    fish: selectFish(records),
    invertebrates: selectInvertebrates(records),
    corals: selectCorals(records),
  };

  const classifiedIds = new Set(Object.values(collections).flat().map((record) => record.id));
  const unclassified = records.filter((record) => !classifiedIds.has(record.id));
  if (unclassified.length > 0) {
    const details = unclassified
      .slice(0, 10)
      .map((record) => `${record.id}:${record.entityType ?? 'eksik'}`)
      .join(', ');
    throw new Error(`Katalogda sınıflandırılamayan ${unclassified.length} kayıt var: ${details}`);
  }

  assertUniqueRecords(collections, records.length);

  const searchIndex = buildInhabitantSearchIndex(records);
  if (searchIndex.length !== records.length) {
    throw new Error('Ortak arama indeksi bütün canlı kayıtlarını içermiyor.');
  }

  return {
    version: INHABITANT_CATALOG_VERSION,
    collections,
    all: records,
    searchIndex,
    counts: {
      all: records.length,
      fish: collections.fish.length,
      invertebrates: collections.invertebrates.length,
      corals: collections.corals.length,
    },
  };
}

export function applyInhabitantCatalog(database) {
  database.inhabitantCatalog = buildInhabitantCatalog(database.fish ?? []);
  return database;
}

export function buildRuntimeInhabitantCatalogBootstrap() {
  return `
;(() => {
  const __fishTypes = new Set(['freshwater_fish', 'brackish_fish', 'marine_fish']);
  const __coralTypes = new Set(['soft_coral', 'lps_coral', 'sps_coral']);
  const __invertebrateTypes = new Set(['freshwater_shrimp', 'marine_shrimp', 'snail', 'crab', 'crayfish', 'bivalve', 'echinoderm', 'anemone', 'other_invertebrate']);
  const __normalize = (__value) => String(__value ?? '')
    .normalize('NFKD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/[^a-z0-9çğıöşü\\s-]/g, ' ')
    .replace(/\\s+/g, ' ')
    .trim();
  const __all = window.DB?.fish || [];
  const __collections = { fish: [], invertebrates: [], corals: [] };
  const __seen = new Set();
  for (const __record of __all) {
    let __collection;
    if (__fishTypes.has(__record.entityType)) __collection = 'fish';
    else if (__invertebrateTypes.has(__record.entityType)) __collection = 'invertebrates';
    else if (__coralTypes.has(__record.entityType)) __collection = 'corals';
    else throw new Error(__record.id + ': desteklenmeyen entityType (' + __record.entityType + ').');
    if (__seen.has(__record.id)) throw new Error(__record.id + ': katalogda tekrarlanan kimlik.');
    __seen.add(__record.id);
    __collections[__collection].push(__record);
  }
  const __searchIndex = __all.map((__record) => ({
    id: __record.id,
    collection: __fishTypes.has(__record.entityType) ? 'fish' : (__invertebrateTypes.has(__record.entityType) ? 'invertebrates' : 'corals'),
    entityType: __record.entityType,
    category: __record.category,
    nameTr: __record.nameTr,
    nameEn: __record.nameEn,
    scientificName: __record.sci,
    genus: __record.taxonomy?.genus ?? null,
    family: __record.taxonomy?.family ?? null,
    searchText: __normalize([
      __record.id,
      __record.nameTr,
      __record.nameEn,
      __record.sci,
      __record.entityType,
      __record.category,
      __record.taxonomy?.genus,
      __record.taxonomy?.family,
    ].filter(Boolean).join(' ')),
  }));
  window.DB.inhabitantCatalog = {
    version: ${INHABITANT_CATALOG_VERSION},
    collections: __collections,
    all: __all,
    searchIndex: __searchIndex,
    counts: {
      all: __all.length,
      fish: __collections.fish.length,
      invertebrates: __collections.invertebrates.length,
      corals: __collections.corals.length,
    },
  };
})();`;
}
