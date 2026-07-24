import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const catalogUrl = new URL('../../data/sources/source-catalog.json', import.meta.url);
const freshwaterSourceUrl = new URL('../../data/sources/freshwater-batch-1-sources.json', import.meta.url);
const baseCatalog = JSON.parse(readFileSync(catalogUrl, 'utf8'));
const freshwaterSourceExtension = JSON.parse(readFileSync(freshwaterSourceUrl, 'utf8'));

export const SOURCE_CATALOG_DOCUMENT = {
  version: freshwaterSourceExtension.catalogVersion,
  updatedAt: freshwaterSourceExtension.updatedAt,
  sources: [...baseCatalog.sources, ...freshwaterSourceExtension.sources],
};
export const SOURCE_CATALOG = SOURCE_CATALOG_DOCUMENT.sources;

const SOURCE_BY_COLLECTION = {
  plants: 'legacy-plant-dataset-v1',
  substrates: 'legacy-substrate-dataset-v1',
  tankPresets: 'legacy-tank-preset-dataset-v1',
};

const FRESHWATER_BATCH_FILES = [
  '../../data/curation/freshwater-batch-1-part-a.js',
  '../../data/curation/freshwater-batch-1-part-b.js',
  '../../data/curation/freshwater-batch-1-part-c.js',
  '../../data/curation/freshwater-batch-1-part-d.js',
  '../../data/curation/freshwater-batch-1.js',
];

function loadFreshwaterBatch() {
  const context = vm.createContext({ window: { DB_FRESH: [] } });
  for (const relativePath of FRESHWATER_BATCH_FILES) {
    const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8');
    new vm.Script(source, { filename: relativePath }).runInContext(context);
  }
  return context.window.AKV_FRESHWATER_BATCH_1;
}

const FRESHWATER_BATCH = loadFreshwaterBatch();
const FRESHWATER_PROVENANCE_BY_ID = new Map(
  FRESHWATER_BATCH.canonical.map((record) => [
    record.id,
    {
      sourceIds: record.sourceIds,
      fieldSourceIds: record.fieldSourceIds,
      verification: record.verification,
    },
  ]),
);

function unique(values) {
  return [...new Set(values)];
}

function cloneProvenance(value) {
  return JSON.parse(JSON.stringify(value));
}

function provenanceFor(record, collection) {
  if (collection === 'fish') {
    const batchProvenance = FRESHWATER_PROVENANCE_BY_ID.get(record.id);
    if (batchProvenance) return cloneProvenance(batchProvenance);

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
  const batchProvenance = JSON.stringify(Object.fromEntries(FRESHWATER_PROVENANCE_BY_ID));
  return `
;(() => {
  const __sourceCatalogDocument = ${catalogDocument};
  const __sourceByCollection = ${JSON.stringify(SOURCE_BY_COLLECTION)};
  const __freshwaterBatchProvenance = ${batchProvenance};
  const __clone = (__value) => JSON.parse(JSON.stringify(__value));
  const __attach = (__record, __collection) => {
    if (__collection === 'fish') {
      const __batch = __freshwaterBatchProvenance[__record.id];
      if (__batch) {
        Object.assign(__record, __clone(__batch));
        return;
      }
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
