// AKVARYUM — catalog filter model

(function attachCatalogFilterModel(global) {
  'use strict';

  const DEFAULT_FILTERS = Object.freeze({
    q: '',
    category: 'all',
    care: 'all',
    temperament: 'all',
    social: 'all',
    zone: 'all',
    tankMax: 0,
    plantSafe: false,
    reefSafe: false,
    sort: 'name',
  });

  const VALID = Object.freeze({
    category: new Set(['all', 'fish', 'invertebrates', 'corals']),
    care: new Set(['all', 'beginner', 'intermediate', 'advanced', 'expert', 'unknown']),
    temperament: new Set(['all', 'peaceful', 'semi_aggressive', 'aggressive', 'predatory', 'unknown']),
    social: new Set(['all', 'solitary', 'pair', 'harem', 'group', 'school', 'colony', 'unknown']),
    zone: new Set(['all', 'surface', 'mid', 'bottom', 'rockwork', 'sand', 'open_water', 'unknown']),
    tankMax: new Set([0, 40, 80, 150, 300]),
    sort: new Set(['name', 'tank', 'size', 'difficulty']),
  });

  const MANAGED_QUERY_KEYS = Object.freeze([
    'q', 'cat', 'care', 'temperament', 'social', 'zone', 'tankMax', 'plantSafe', 'reefSafe', 'sort',
  ]);

  const FISH_TYPES = new Set(['freshwater_fish', 'brackish_fish', 'marine_fish']);
  const CORAL_TYPES = new Set(['soft_coral', 'lps_coral', 'sps_coral']);
  const INVERTEBRATE_TYPES = new Set([
    'freshwater_shrimp', 'marine_shrimp', 'snail', 'crab', 'crayfish', 'bivalve',
    'echinoderm', 'anemone', 'other_invertebrate',
  ]);

  const LEGACY_CORAL_IDS = new Set([
    'zoanthid', 'acropora', 'montipora', 'pulsing-xenia', 'green-star-polyp',
    'mushroom-coral', 'leather-coral',
  ]);

  const DIFFICULTY_ORDER = Object.freeze({
    beginner: 0,
    intermediate: 1,
    advanced: 2,
    expert: 3,
    unknown: 4,
  });

  function createDefaults() {
    return { ...DEFAULT_FILTERS };
  }

  function normalizeText(value) {
    return String(value ?? '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('tr-TR')
      .replace(/ı/g, 'i')
      .replace(/[^a-z0-9çğıöşü\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function readEnum(params, queryKey, filterKey) {
    const value = params.get(queryKey);
    return VALID[filterKey].has(value) ? value : DEFAULT_FILTERS[filterKey];
  }

  function parseSearch(search) {
    const URLParams = global.URLSearchParams || URLSearchParams;
    const params = new URLParams(String(search || '').replace(/^\?/, ''));
    const tankValue = Number(params.get('tankMax') || 0);

    return {
      q: String(params.get('q') || '').trim().slice(0, 80),
      category: readEnum(params, 'cat', 'category'),
      care: readEnum(params, 'care', 'care'),
      temperament: readEnum(params, 'temperament', 'temperament'),
      social: readEnum(params, 'social', 'social'),
      zone: readEnum(params, 'zone', 'zone'),
      tankMax: VALID.tankMax.has(tankValue) ? tankValue : 0,
      plantSafe: params.get('plantSafe') === '1',
      reefSafe: params.get('reefSafe') === '1',
      sort: readEnum(params, 'sort', 'sort'),
    };
  }

  function serializeSearch(filters, currentSearch) {
    const URLParams = global.URLSearchParams || URLSearchParams;
    const params = new URLParams(String(currentSearch || '').replace(/^\?/, ''));
    for (const key of MANAGED_QUERY_KEYS) params.delete(key);

    const normalized = { ...createDefaults(), ...(filters || {}) };
    if (normalized.q) params.set('q', String(normalized.q).trim().slice(0, 80));
    if (normalized.category !== 'all') params.set('cat', normalized.category);
    if (normalized.care !== 'all') params.set('care', normalized.care);
    if (normalized.temperament !== 'all') params.set('temperament', normalized.temperament);
    if (normalized.social !== 'all') params.set('social', normalized.social);
    if (normalized.zone !== 'all') params.set('zone', normalized.zone);
    if (VALID.tankMax.has(Number(normalized.tankMax)) && Number(normalized.tankMax) > 0) {
      params.set('tankMax', String(Number(normalized.tankMax)));
    }
    if (normalized.plantSafe) params.set('plantSafe', '1');
    if (normalized.reefSafe) params.set('reefSafe', '1');
    if (normalized.sort !== 'name') params.set('sort', normalized.sort);

    const serialized = params.toString();
    return serialized ? `?${serialized}` : '';
  }

  function recordCollection(record) {
    const type = record?.entityType;
    if (FISH_TYPES.has(type)) return 'fish';
    if (CORAL_TYPES.has(type)) return 'corals';
    if (INVERTEBRATE_TYPES.has(type)) return 'invertebrates';

    if (record?.category === 'coral' || LEGACY_CORAL_IDS.has(record?.id) || record?.id?.endsWith('-coral')) {
      return 'corals';
    }
    if (String(record?.category || '').includes('invertebrate')) return 'invertebrates';
    return 'fish';
  }

  function recordName(record, lang) {
    if (lang === 'en') return record?.name?.en || record?.nameEn || record?.name?.tr || record?.nameTr || record?.id;
    return record?.name?.tr || record?.nameTr || record?.name?.en || record?.nameEn || record?.id;
  }

  function recordSearchText(record) {
    const aliases = Array.isArray(record?.aliases) ? record.aliases : [];
    return normalizeText([
      record?.id,
      record?.name?.tr,
      record?.name?.en,
      record?.nameTr,
      record?.nameEn,
      record?.scientificName,
      record?.sci,
      record?.taxonomy?.acceptedName,
      record?.taxonomy?.genus,
      record?.taxonomy?.family,
      ...aliases,
    ].filter(Boolean).join(' '));
  }

  function recordWaterTypes(record) {
    if (Array.isArray(record?.water?.types)) return record.water.types;
    return record?.water ? [record.water] : [];
  }

  function recordTankVolume(record) {
    return Number(record?.tank?.minVolumeL ?? record?.minVolume ?? 0);
  }

  function recordAdultSize(record) {
    const adult = record?.size?.adultCm;
    if (Array.isArray(adult)) return Number(adult[1] ?? adult[0] ?? 0);
    return Number(record?.adultSize ?? record?.size ?? 0);
  }

  function recordCare(record) {
    return record?.care?.difficulty || 'unknown';
  }

  function recordTemperament(record) {
    const value = record?.behavior?.temperament;
    if (value) return value;
    if (record?.aggression === 'semi') return 'semi_aggressive';
    return record?.aggression || 'unknown';
  }

  function recordSocial(record) {
    if (record?.social?.mode) return record.social.mode;
    return Number(record?.schooling || 0) > 0 ? 'school' : 'unknown';
  }

  function recordZones(record) {
    if (Array.isArray(record?.behavior?.zone)) return record.behavior.zone;
    const legacy = record?.layer;
    if (legacy === 'top') return ['surface'];
    if (legacy === 'mid') return ['mid'];
    if (legacy === 'bottom') return ['bottom'];
    return ['unknown'];
  }

  function isPlantSafe(record) {
    return record?.compatibility?.plantSafe ?? record?.plantSafe ?? false;
  }

  function isReefSafe(record) {
    const canonical = record?.compatibility?.coralSafe;
    if (canonical) return canonical === 'yes';
    return record?.reefSafe === true;
  }

  function matchesRecord(record, filters, water) {
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
  }

  function activeFilterCount(filters) {
    const normalized = { ...createDefaults(), ...(filters || {}) };
    return [
      Boolean(normalized.q),
      normalized.category !== 'all',
      normalized.care !== 'all',
      normalized.temperament !== 'all',
      normalized.social !== 'all',
      normalized.zone !== 'all',
      normalized.tankMax > 0,
      normalized.plantSafe,
      normalized.reefSafe,
      normalized.sort !== 'name',
    ].filter(Boolean).length;
  }

  global.CatalogFilterModel = Object.freeze({
    version: 2,
    DEFAULT_FILTERS,
    createDefaults,
    normalizeText,
    parseSearch,
    serializeSearch,
    recordCollection,
    recordName,
    recordSearchText,
    recordWaterTypes,
    recordTankVolume,
    recordAdultSize,
    recordCare,
    recordTemperament,
    recordSocial,
    recordZones,
    isPlantSafe,
    isReefSafe,
    filterRecords,
    countByCategory,
    activeFilterCount,
  });
})(window);
