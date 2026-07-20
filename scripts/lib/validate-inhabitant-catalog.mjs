import { buildInhabitantCatalog } from '../../data/catalog/index.mjs';
import { loadLegacyData } from './load-legacy-data.mjs';

const EXPECTED_COUNTS = Object.freeze({
  total: 580,
  fish: 467,
  invertebrates: 63,
  corals: 50,
});

export function validateInhabitantCatalog(repositoryRoot) {
  const database = loadLegacyData(repositoryRoot, {
    withProvenance: true,
    withMigration: true,
    withPriorityCuration: true,
    withCatalog: false,
  });
  const catalog = buildInhabitantCatalog(database.inhabitants);

  for (const [key, expected] of Object.entries(EXPECTED_COUNTS)) {
    const actual = key === 'total' ? catalog.counts.all : catalog.counts[key];
    if (actual !== expected) {
      throw new Error(`${key} koleksiyonunda ${actual} kayıt var; ${expected} bekleniyordu.`);
    }
  }

  if (catalog.model !== 'inhabitantV1') {
    throw new Error(`Katalog eski veri modelini kullanıyor: ${catalog.model}`);
  }

  const indexIds = new Set(catalog.searchIndex.map((entry) => entry.id));
  if (indexIds.size !== EXPECTED_COUNTS.total) {
    throw new Error(`Arama indeksinde ${indexIds.size} benzersiz kimlik var; ${EXPECTED_COUNTS.total} bekleniyordu.`);
  }

  for (const entry of catalog.searchIndex) {
    if (!entry.searchText) throw new Error(`${entry.id}: arama metni boş.`);
    if (!entry.collection) throw new Error(`${entry.id}: katalog koleksiyonu eksik.`);
    if (!entry.nameTr || !entry.nameEn || !entry.scientificName) {
      throw new Error(`${entry.id}: yeni model arama alanlarından biri eksik.`);
    }
  }

  return {
    version: catalog.version,
    model: catalog.model,
    total: catalog.counts.all,
    fish: catalog.counts.fish,
    invertebrates: catalog.counts.invertebrates,
    corals: catalog.counts.corals,
    searchIndex: catalog.searchIndex.length,
    uniqueIds: indexIds.size,
  };
}
