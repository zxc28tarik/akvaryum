import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function replaceRequired(source, search, replacement, label) {
  if (source.includes(replacement)) return source;
  if (!source.includes(search)) throw new Error(`${label} bulunamadı.`);
  return source.replace(search, replacement);
}

const filePath = resolve(process.cwd(), 'catalog-filter-model.js');
let source = readFileSync(filePath, 'utf8');

source = replaceRequired(
  source,
  `  const DIFFICULTY_ORDER = Object.freeze({
    beginner: 0,
    intermediate: 1,
    advanced: 2,
    expert: 3,
    unknown: 4,
  });`,
  `  const DIFFICULTY_ORDER = Object.freeze({
    beginner: 0,
    intermediate: 1,
    advanced: 2,
    expert: 3,
    unknown: 4,
  });

  const RECORD_FILTER_CACHE = new WeakMap();
  const COLLATOR_CACHE = new Map();`,
  'Filtre önbellek sabitleri',
);

const oldBlock = `  function matchesRecord(record, filters, water) {
    if (water && !recordWaterTypes(record).includes(water)) return false;
    if (filters.category !== 'all' && recordCollection(record) !== filters.category) return false;
    if (filters.care !== 'all' && recordCare(record) !== filters.care) return false;
    if (filters.temperament !== 'all' && recordTemperament(record) !== filters.temperament) return false;
    if (filters.social !== 'all' && recordSocial(record) !== filters.social) return false;
    if (filters.zone !== 'all' && !recordZones(record).includes(filters.zone)) return false;
    if (filters.tankMax > 0 && recordTankVolume(record) > filters.tankMax) return false;
    if (filters.plantSafe && !isPlantSafe(record)) return false;
    if (filters.reefSafe && !isReefSafe(record)) return false;

    const query = normalizeText(filters.q);
    if (query && !recordSearchText(record).includes(query)) return false;
    return true;
  }

  function sortRecords(records, sort, lang) {
    const collator = new Intl.Collator(lang === 'en' ? 'en' : 'tr', { sensitivity: 'base', numeric: true });
    const sorted = [...records];
    sorted.sort((a, b) => {
      if (sort === 'tank') return recordTankVolume(a) - recordTankVolume(b) || collator.compare(recordName(a, lang), recordName(b, lang));
      if (sort === 'size') return recordAdultSize(b) - recordAdultSize(a) || collator.compare(recordName(a, lang), recordName(b, lang));
      if (sort === 'difficulty') {
        return (DIFFICULTY_ORDER[recordCare(a)] ?? 99) - (DIFFICULTY_ORDER[recordCare(b)] ?? 99)
          || collator.compare(recordName(a, lang), recordName(b, lang));
      }
      return collator.compare(recordName(a, lang), recordName(b, lang));
    });
    return sorted;
  }

  function filterRecords(records, filters, options) {
    const normalized = { ...createDefaults(), ...(filters || {}) };
    const water = options?.water || null;
    const lang = options?.lang || 'tr';
    return sortRecords((records || []).filter((record) => matchesRecord(record, normalized, water)), normalized.sort, lang);
  }

  function countByCategory(records, filters, options) {
    const baseFilters = { ...createDefaults(), ...(filters || {}), category: 'all' };
    const filtered = filterRecords(records, baseFilters, options);
    const counts = { all: filtered.length, fish: 0, invertebrates: 0, corals: 0 };
    for (const record of filtered) counts[recordCollection(record)] += 1;
    return counts;
  }`;

const newBlock = `  function filterMetadata(record) {
    let metadata = RECORD_FILTER_CACHE.get(record);
    if (metadata) return metadata;
    metadata = {
      collection: recordCollection(record),
      waterTypes: recordWaterTypes(record),
      tankVolume: recordTankVolume(record),
      adultSize: recordAdultSize(record),
      care: recordCare(record),
      temperament: recordTemperament(record),
      social: recordSocial(record),
      zones: recordZones(record),
      plantSafe: isPlantSafe(record),
      reefSafe: isReefSafe(record),
      searchText: null,
    };
    RECORD_FILTER_CACHE.set(record, metadata);
    return metadata;
  }

  function matchesRecord(record, filters, water, query) {
    const metadata = filterMetadata(record);
    if (water && !metadata.waterTypes.includes(water)) return false;
    if (filters.category !== 'all' && metadata.collection !== filters.category) return false;
    if (filters.care !== 'all' && metadata.care !== filters.care) return false;
    if (filters.temperament !== 'all' && metadata.temperament !== filters.temperament) return false;
    if (filters.social !== 'all' && metadata.social !== filters.social) return false;
    if (filters.zone !== 'all' && !metadata.zones.includes(filters.zone)) return false;
    if (filters.tankMax > 0 && metadata.tankVolume > filters.tankMax) return false;
    if (filters.plantSafe && !metadata.plantSafe) return false;
    if (filters.reefSafe && !metadata.reefSafe) return false;
    if (query) {
      if (metadata.searchText === null) metadata.searchText = recordSearchText(record);
      if (!metadata.searchText.includes(query)) return false;
    }
    return true;
  }

  function collatorFor(lang) {
    const locale = lang === 'en' ? 'en' : 'tr';
    let collator = COLLATOR_CACHE.get(locale);
    if (!collator) {
      collator = new Intl.Collator(locale, { sensitivity: 'base', numeric: true });
      COLLATOR_CACHE.set(locale, collator);
    }
    return collator;
  }

  function sortRecords(records, sort, lang) {
    const collator = collatorFor(lang);
    const sorted = [...records];
    sorted.sort((a, b) => {
      const aMeta = filterMetadata(a);
      const bMeta = filterMetadata(b);
      if (sort === 'tank') return aMeta.tankVolume - bMeta.tankVolume || collator.compare(recordName(a, lang), recordName(b, lang));
      if (sort === 'size') return bMeta.adultSize - aMeta.adultSize || collator.compare(recordName(a, lang), recordName(b, lang));
      if (sort === 'difficulty') {
        return (DIFFICULTY_ORDER[aMeta.care] ?? 99) - (DIFFICULTY_ORDER[bMeta.care] ?? 99)
          || collator.compare(recordName(a, lang), recordName(b, lang));
      }
      return collator.compare(recordName(a, lang), recordName(b, lang));
    });
    return sorted;
  }

  function filterRecords(records, filters, options) {
    const normalized = { ...createDefaults(), ...(filters || {}) };
    const water = options?.water || null;
    const lang = options?.lang || 'tr';
    const query = normalizeText(normalized.q);
    const filtered = [];
    for (const record of records || []) {
      if (matchesRecord(record, normalized, water, query)) filtered.push(record);
    }
    return sortRecords(filtered, normalized.sort, lang);
  }

  function countByCategory(records, filters, options) {
    const normalized = { ...createDefaults(), ...(filters || {}), category: 'all' };
    const water = options?.water || null;
    const query = normalizeText(normalized.q);
    const counts = { all: 0, fish: 0, invertebrates: 0, corals: 0 };
    for (const record of records || []) {
      if (!matchesRecord(record, normalized, water, query)) continue;
      const collection = filterMetadata(record).collection;
      counts.all += 1;
      counts[collection] += 1;
    }
    return counts;
  }`;

source = replaceRequired(source, oldBlock, newBlock, 'Filtreleme ve kategori sayımı bloğu');
writeFileSync(filePath, source);
console.log('Katalog filtreleme tek geçiş ve kayıt önbelleğiyle optimize edildi.');
