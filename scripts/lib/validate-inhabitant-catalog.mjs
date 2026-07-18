import { buildInhabitantCatalog } from '../../data/catalog/index.mjs';
import { loadLegacyData } from './load-legacy-data.mjs';

const EXPECTED_TOTAL = 580;

export function validateInhabitantCatalog(repositoryRoot) {
  const database = loadLegacyData(repositoryRoot, { withProvenance: true, withCatalog: false });
  const catalog = buildInhabitantCatalog(database.fish);

  if (catalog.counts.all !== EXPECTED_TOTAL) {
    throw new Error(`Canlı kataloğunda ${catalog.counts.all} kayıt var; ${EXPECTED_TOTAL} bekleniyordu.`);
  }

  const indexIds = new Set(catalog.searchIndex.map((entry) => entry.id));
  if (indexIds.size !== EXPECTED_TOTAL) {
    throw new Error(`Arama indeksinde ${indexIds.size} benzersiz kimlik var; ${EXPECTED_TOTAL} bekleniyordu.`);
  }

  for (const entry of catalog.searchIndex) {
    if (!entry.searchText) throw new Error(`${entry.id}: arama metni boş.`);
    if (!entry.collection) throw new Error(`${entry.id}: katalog koleksiyonu eksik.`);
  }

  return {
    version: catalog.version,
    total: catalog.counts.all,
    fish: catalog.counts.fish,
    invertebrates: catalog.counts.invertebrates,
    corals: catalog.counts.corals,
    searchIndex: catalog.searchIndex.length,
    uniqueIds: indexIds.size,
  };
}
