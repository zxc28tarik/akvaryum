import { readFileSync } from 'node:fs';

const catalogUrl = new URL('../../data/sources/source-catalog.json', import.meta.url);
export const SOURCE_CATALOG_DOCUMENT = JSON.parse(readFileSync(catalogUrl, 'utf8'));
export const SOURCE_CATALOG = SOURCE_CATALOG_DOCUMENT.sources;

const SOURCE_BY_COLLECTION = {
  plants: 'legacy-plant-dataset-v1',
  substrates: 'legacy-substrate-dataset-v1',
  tankPresets: 'legacy-tank-preset-dataset-v1',
};

function unique(values) {
  return [...new Set(values)];
}

function provenanceFor(record, collection) {
  if (collection === 'fish') {
    const coreSource = record.water === 'fresh'
      ? 'legacy-fresh-dataset-v1'
      : 'legacy-salt-dataset-v1';
    const sourceIds = unique([
      coreSource,
      'classification-heading-rules-v1',
      'taxonomy-genus-parser-v1',
      'taxonomy-family-map-v1',
    ]);

    return {
      sourceIds,
      fieldSourceIds: {
        core: [coreSource],
        entityType: ['classification-heading-rules-v1'],
        category: ['classification-heading-rules-v1'],
        'taxonomy.genus': ['taxonomy-genus-parser-v1'],
        'taxonomy.family': ['taxonomy-family-map-v1'],
      },
      verification: {
        status: 'needs_review',
        confidence: 'low',
        notes: ['Eski bakım verileri ve çıkarımsal taksonomi dış kaynak doğrulaması bekliyor.'],
      },
    };
  }

  const coreSource = SOURCE_BY_COLLECTION[collection];
  if (!coreSource) throw new Error(`Kaynak eşlemesi olmayan koleksiyon: ${collection}`);

  return {
    sourceIds: [coreSource],
    fieldSourceIds: { core: [coreSource] },
    verification: {
      status: 'needs_review',
      confidence: 'low',
      notes: ['Eski prototip verisi dış kaynak doğrulaması bekliyor.'],
    },
  };
}

function attachToCollection(records, collection) {
  for (const record of records) Object.assign(record, provenanceFor(record, collection));
}

export function applySourceProvenance(database) {
  attachToCollection(database.fish ?? [], 'fish');
  attachToCollection(database.plants ?? [], 'plants');
  attachToCollection(database.substrates ?? [], 'substrates');
  attachToCollection(database.tankPresets ?? [], 'tankPresets');
  database.sources = structuredClone(SOURCE_CATALOG);
  database.sourceCatalogVersion = SOURCE_CATALOG_DOCUMENT.version;
  return database;
}

export function buildSourceProvenanceDataset(database) {
  const records = [];
  for (const collection of ['fish', 'plants', 'substrates', 'tankPresets']) {
    for (const record of database[collection] ?? []) {
      records.push({
        id: record.id,
        collection,
        sourceIds: record.sourceIds,
        fieldSourceIds: record.fieldSourceIds,
        verification: record.verification,
      });
    }
  }

  return {
    catalogVersion: SOURCE_CATALOG_DOCUMENT.version,
    updatedAt: SOURCE_CATALOG_DOCUMENT.updatedAt,
    sources: SOURCE_CATALOG,
    records,
  };
}

export function buildRuntimeSourceProvenanceBootstrap() {
  const catalogDocument = JSON.stringify(SOURCE_CATALOG_DOCUMENT);
  return `
;(() => {
  const __sourceCatalogDocument = ${catalogDocument};
  const __sourceByCollection = ${JSON.stringify(SOURCE_BY_COLLECTION)};
  const __attach = (__record, __collection) => {
    if (__collection === 'fish') {
      const __core = __record.water === 'fresh' ? 'legacy-fresh-dataset-v1' : 'legacy-salt-dataset-v1';
      Object.assign(__record, {
        sourceIds: [__core, 'classification-heading-rules-v1', 'taxonomy-genus-parser-v1', 'taxonomy-family-map-v1'],
        fieldSourceIds: {
          core: [__core],
          entityType: ['classification-heading-rules-v1'],
          category: ['classification-heading-rules-v1'],
          'taxonomy.genus': ['taxonomy-genus-parser-v1'],
          'taxonomy.family': ['taxonomy-family-map-v1']
        },
        verification: {
          status: 'needs_review',
          confidence: 'low',
          notes: ['Eski bakım verileri ve çıkarımsal taksonomi dış kaynak doğrulaması bekliyor.']
        }
      });
      return;
    }
    const __core = __sourceByCollection[__collection];
    Object.assign(__record, {
      sourceIds: [__core],
      fieldSourceIds: { core: [__core] },
      verification: {
        status: 'needs_review',
        confidence: 'low',
        notes: ['Eski prototip verisi dış kaynak doğrulaması bekliyor.']
      }
    });
  };
  for (const __collection of ['fish', 'plants', 'substrates', 'tankPresets']) {
    for (const __record of window.DB?.[__collection] || []) __attach(__record, __collection);
  }
  window.DB.sources = __sourceCatalogDocument.sources;
  window.DB.sourceCatalogVersion = __sourceCatalogDocument.version;
})();`;
}
