// AKVARYUM — inhabitant detail model

(function attachInhabitantDetailModel(global) {
  'use strict';

  function localized(value, lang) {
    if (typeof value === 'string') return value;
    if (!value || typeof value !== 'object') return '';
    if (lang === 'en') return value.en || value.tr || '';
    return value.tr || value.en || '';
  }

  function cleanArray(value) {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((item) => item !== null && item !== undefined && String(item).trim() !== ''))];
  }

  function numericRange(value) {
    if (!Array.isArray(value) || value.length !== 2) return null;
    const first = Number(value[0]);
    const second = Number(value[1]);
    if (!Number.isFinite(first) || !Number.isFinite(second)) return null;
    return first <= second ? [first, second] : [second, first];
  }

  function numberOrNull(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : null;
  }

  function legacyRange(value) {
    const range = numericRange(value);
    if (range) return range;
    const number = numberOrNull(value);
    return number === null ? null : [number, number];
  }

  function waterTypes(record) {
    if (Array.isArray(record?.water?.types)) return cleanArray(record.water.types);
    if (typeof record?.water === 'string') return [record.water];
    return [];
  }

  function sourceDetails(record, sourceCatalog) {
    const byId = new Map((sourceCatalog || []).map((source) => [source.id, source]));
    return cleanArray(record?.sourceIds).map((id) => {
      const source = byId.get(id);
      return source ? { ...source } : {
        id,
        title: id,
        publisher: '',
        location: '',
        sourceType: 'unknown',
        status: 'unverified',
        confidence: 'low',
        note: '',
      };
    });
  }

  function fieldSources(record) {
    const entries = Object.entries(record?.fieldSourceIds || {});
    return entries.map(([field, sourceIds]) => ({
      field,
      sourceIds: cleanArray(sourceIds),
    }));
  }

  function specialWarnings(record, lang) {
    return cleanArray(record?.care?.specialWarnings)
      .map((warning) => localized(warning, lang))
      .filter(Boolean);
  }

  function build(record, lang = 'tr', sourceCatalog = []) {
    if (!record) return null;

    const canonicalWater = record?.water && typeof record.water === 'object' && !Array.isArray(record.water)
      ? record.water
      : {};
    const canonicalSize = record?.size && typeof record.size === 'object' && !Array.isArray(record.size)
      ? record.size
      : {};

    const scientificName = record.scientificName || record.sci || '';
    const summary = localized(record.summary, lang) || localized(record.notes, lang) || '';
    const notes = localized(record.notes, lang);
    const aliases = cleanArray(record.aliases);
    const adultRange = numericRange(canonicalSize.adultCm) || legacyRange(record.adultSize ?? record.size);

    return {
      id: record.id,
      name: localized(record.name, lang) || (lang === 'en' ? record.nameEn : record.nameTr) || record.nameTr || record.nameEn || record.id,
      scientificName,
      aliases,
      entityType: record.entityType || null,
      category: record.category || null,
      tags: cleanArray(record.tags),
      summary,
      notes,
      taxonomy: {
        genus: record?.taxonomy?.genus || (scientificName ? scientificName.split(/\s+/)[0] : null),
        family: record?.taxonomy?.family || null,
        reviewStatus: record?.taxonomy?.reviewStatus || null,
      },
      water: {
        types: waterTypes(record),
        temperatureC: numericRange(canonicalWater.temperatureC) || numericRange(record.temp),
        pH: numericRange(canonicalWater.pH) || numericRange(record.pH),
        gh: numericRange(canonicalWater.gh) || numericRange(record.gh),
        salinityPpt: numericRange(canonicalWater.salinityPpt),
      },
      size: {
        adultCm: adultRange,
      },
      tank: {
        minVolumeL: numberOrNull(record?.tank?.minVolumeL ?? record.minVolume),
        additionalVolumePerInhabitantL: numberOrNull(record?.tank?.additionalVolumePerInhabitantL ?? record.perFishL),
        minLengthCm: numberOrNull(record?.tank?.minLengthCm),
      },
      social: {
        mode: record?.social?.mode || (Number(record.schooling || 0) > 0 ? 'school' : 'unknown'),
        minGroup: numberOrNull(record?.social?.minGroup ?? record.schooling),
        recommendedGroup: numberOrNull(record?.social?.recommendedGroup),
        conspecificAggression: record?.social?.conspecificAggression || 'unknown',
        territoriality: record?.social?.territoriality || 'unknown',
      },
      behavior: {
        temperament: record?.behavior?.temperament || (record.aggression === 'semi' ? 'semi_aggressive' : record.aggression) || 'unknown',
        activity: record?.behavior?.activity || 'unknown',
        zone: cleanArray(record?.behavior?.zone || (record.layer ? [record.layer] : [])),
        finNipper: record?.behavior?.finNipper ?? Boolean(record.finNippers),
        longFinned: record?.behavior?.longFinned ?? Boolean(record.longFinned),
      },
      feeding: {
        diet: cleanArray(record?.feeding?.diet || (record.diet ? [record.diet] : [])),
        feedingDifficulty: record?.feeding?.feedingDifficulty || 'unknown',
      },
      compatibility: {
        plantSafe: record?.compatibility?.plantSafe ?? record.plantSafe ?? null,
        coralSafe: record?.compatibility?.coralSafe || (record.reefSafe === true ? 'yes' : record.reefSafe === false ? 'no' : 'unknown'),
      },
      habitat: {
        flow: record?.habitat?.flow || 'unknown',
        oxygen: record?.habitat?.oxygen || 'unknown',
        substrate: cleanArray(record?.habitat?.substrate),
        shelter: cleanArray(record?.habitat?.shelter),
      },
      care: {
        difficulty: record?.care?.difficulty || 'unknown',
        sensitiveTo: cleanArray(record?.care?.sensitiveTo),
        specialWarnings: specialWarnings(record, lang),
      },
      verification: {
        status: record?.verification?.status || 'needs_review',
        confidence: record?.verification?.confidence || 'low',
        notes: cleanArray(record?.verification?.notes),
      },
      sources: sourceDetails(record, sourceCatalog),
      fieldSources: fieldSources(record),
      migration: {
        unknownFields: cleanArray(record?.migration?.unknownFields),
        derivedFields: cleanArray(record?.migration?.derivedFields),
      },
    };
  }

  global.InhabitantDetailModel = Object.freeze({
    version: 1,
    localized,
    numericRange,
    sourceDetails,
    build,
  });
})(window);
