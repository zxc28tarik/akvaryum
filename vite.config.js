import { gunzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { buildInhabitantCatalogBootstrap, validateInhabitantCatalog } from './scripts/lib/validate-inhabitant-catalog.mjs';
import { buildRuntimeCatalogFilterModel } from './scripts/lib/validate-catalog-filters.mjs';
import { buildRuntimeInhabitantDetailModel } from './scripts/lib/validate-inhabitant-detail.mjs';
import { buildRuntimeMobileFlowGuard } from './scripts/lib/validate-mobile-flow.mjs';
import { applyCoralCareProfiles, validateCoralCareProfiles } from './scripts/lib/validate-coral-care.mjs';
import { buildRuntimeConspecificRules } from './scripts/lib/validate-engine-conspecific-rules.mjs';
import { buildRuntimeDomainResults } from './scripts/lib/validate-engine-domain-results.mjs';
import { buildRuntimeFindingContract } from './scripts/lib/validate-engine-finding-contract.mjs';
import { buildRuntimeHealthGuard } from './scripts/lib/validate-engine-golden-scenarios.mjs';
import { buildRuntimeCompatibilityOverrides } from './scripts/lib/validate-engine-compatibility-overrides.mjs';
import { buildRuntimePredatorPreyRules } from './scripts/lib/validate-engine-predator-prey-rules.mjs';
import { buildRuntimeReefSafetyRules } from './scripts/lib/validate-engine-reef-invertebrate-rules.mjs';
import { buildRuntimeScoreBreakdown } from './scripts/lib/validate-engine-score-breakdown.mjs';
import { buildRuntimeSocialRules } from './scripts/lib/validate-engine-social-rules.mjs';
import { validateEngineParameterIntersection } from './scripts/lib/validate-engine-parameter-intersection.mjs';
import { validateFishClassification } from './scripts/lib/validate-fish-classification.mjs';
import { validateFreshwaterBatch1 } from './scripts/lib/validate-freshwater-batch-1.mjs';
import { validateLegacyData } from './scripts/lib/validate-legacy-data.mjs';
import { buildRuntimeInhabitantMigration, validateInhabitantMigration } from './scripts/lib/validate-inhabitant-migration.mjs';
import { buildRuntimePlantMigration, validatePlantMigration } from './scripts/lib/validate-plant-migration.mjs';
import { buildRuntimePrioritySocialCare, validatePrioritySocialCare } from './scripts/lib/validate-priority-social-care.mjs';
import { buildRuntimePriorityTankLength, validatePriorityTankLength } from './scripts/lib/validate-priority-tank-length.mjs';
import { buildRuntimeSourceProvenanceBootstrap, validateSourceProvenance } from './scripts/lib/validate-source-provenance.mjs';
import { buildRuntimeSubstrateMigration, validateSubstrateMigration } from './scripts/lib/validate-substrate-migration.mjs';
import { validateRepositoryData } from './scripts/lib/validate-data-schema.mjs';
import { enrichLegacyFish } from './scripts/lib/classify-legacy-fish.mjs';

const repositoryRoot = process.cwd();
const virtualPrefix = '\0akvaryum:';
const runtimeFiles = {
  'fish-fresh.js': '.runtime/fish-fresh.js.gz.b64',
  'fish-salt.js': '.runtime/fish-salt.js.gz.b64',
  'components.jsx': '.runtime/components.jsx.gz.b64',
  'result-views.jsx': '.runtime/result-views.jsx.gz.b64',
  'styles.css': '.runtime/styles.css.gz.b64',
};

const readPlain = (path) => readFileSync(resolve(repositoryRoot, path), 'utf8');
const readArchived = (path) => gunzipSync(
  Buffer.from(readPlain(path).trim(), 'base64'),
).toString('utf8');

const compatibilityOverrides = JSON.parse(
  readPlain('data/curation/compatibility-overrides-v1.json'),
);

const plainSources = {
  'i18n.js': readPlain('i18n.js'),
  'data.js': readPlain('data.js'),
  'data/curation/freshwater-batch-1-part-a.js': readPlain('data/curation/freshwater-batch-1-part-a.js'),
  'data/curation/freshwater-batch-1-part-b.js': readPlain('data/curation/freshwater-batch-1-part-b.js'),
  'data/curation/freshwater-batch-1-part-c.js': readPlain('data/curation/freshwater-batch-1-part-c.js'),
  'data/curation/freshwater-batch-1-part-d.js': readPlain('data/curation/freshwater-batch-1-part-d.js'),
  'data/curation/freshwater-batch-1.js': readPlain('data/curation/freshwater-batch-1.js'),
  'engine.js': readPlain('engine.js'),
  'app.jsx': readPlain('app.jsx'),
  'catalog-filters.jsx': readPlain('catalog-filters.jsx'),
  'inhabitant-detail.jsx': readPlain('inhabitant-detail.jsx'),
};

function staticTextModule(source, label) {
  return `const source = ${JSON.stringify(source)};
void ${JSON.stringify(label)};
(0, eval)(source);
export default source;`;
}

function nativeSourcePlugin() {
  const archivedSources = Object.fromEntries(
    Object.entries(runtimeFiles).map(([name, path]) => [
      name,
      readArchived(path),
    ]),
  );

  return {
    name: 'akvaryum-native-source',
    enforce: 'pre',

    buildStart() {
      validateLegacyData(repositoryRoot);
      validateRepositoryData(repositoryRoot);
      validateFishClassification(repositoryRoot);
      validateSourceProvenance(repositoryRoot);
      validateInhabitantMigration(repositoryRoot);
      validatePlantMigration(repositoryRoot);
      validateSubstrateMigration(repositoryRoot);
      validateFreshwaterBatch1(repositoryRoot);
      validateEngineParameterIntersection(repositoryRoot);
      validatePrioritySocialCare(repositoryRoot);
      validatePriorityTankLength(repositoryRoot);
      validateInhabitantCatalog(repositoryRoot);
      validateCoralCareProfiles(repositoryRoot);
    },

    resolveId(id) {
      if (id.startsWith(virtualPrefix)) return id;
      return null;
    },

    load(id) {
      if (!id.startsWith(virtualPrefix)) return null;
      const key = id.slice(virtualPrefix.length);

      if (key === 'styles.css') return archivedSources['styles.css'];

      if (key === 'fish-fresh.js') {
        const source = enrichLegacyFish(
          archivedSources['fish-fresh.js'],
          archivedSources['fish-fresh.js'],
        );
        return staticTextModule(source, 'fish-fresh.js');
      }

      if (key === 'fish-salt.js') {
        const source = enrichLegacyFish(
          archivedSources['fish-salt.js'],
          archivedSources['fish-salt.js'],
        );
        return staticTextModule(source, 'fish-salt.js');
      }

      if (key === 'data.js') {
        const source = plainSources['data.js'];
        const freshBatchSources = [
          plainSources['data/curation/freshwater-batch-1-part-a.js'],
          plainSources['data/curation/freshwater-batch-1-part-b.js'],
          plainSources['data/curation/freshwater-batch-1-part-c.js'],
          plainSources['data/curation/freshwater-batch-1-part-d.js'],
          plainSources['data/curation/freshwater-batch-1.js'],
        ];
        return [
          ...freshBatchSources,
          source,
          buildRuntimeSourceProvenanceBootstrap(),
          buildRuntimeInhabitantMigration(),
          buildRuntimePlantMigration(),
          buildRuntimeSubstrateMigration(),
          buildRuntimePrioritySocialCare(),
          buildRuntimePriorityTankLength(),
          buildInhabitantCatalogBootstrap(),
          `const __freshwaterBatchCanonical = new Map((window.AKV_FRESHWATER_BATCH_1?.canonical || []).map((record) => [record.id, record]));`,
          `const __migratedInhabitants = applyPriorityTankLength(applyPrioritySocialCare(migrateLegacyInhabitants(window.DB.fish || [])));`,
          `window.DB.inhabitants = __migratedInhabitants.map((record) => __freshwaterBatchCanonical.get(record.id) || record);`,
          'window.DB.aquaticPlants = migrateLegacyPlants(window.DB.plants || []);',
          'window.DB.aquariumSubstrates = migrateLegacySubstrates(window.DB.substrates || []);',
          `window.DB.compatibilityOverrides = ${JSON.stringify(compatibilityOverrides)};`,
          'applyInhabitantCatalog(window.DB);',
          'export const DB = window.DB;',
          'export default window.DB;',
        ].join('\n');
      }

      if (key === 'engine.js') {
        const source = plainSources['engine.js'];
        return [
          source,
          buildRuntimeFindingContract(),
          buildRuntimeHealthGuard(),
          buildRuntimeSocialRules(),
          buildRuntimeConspecificRules(),
          buildRuntimePredatorPreyRules(),
          buildRuntimeReefSafetyRules(),
          buildRuntimeCompatibilityOverrides(),
          buildRuntimeDomainResults(),
          buildRuntimeScoreBreakdown(),
          'const Engine = window.Engine;',
          'export { Engine };',
          'export default Engine;',
        ].join('\n');
      }

      if (key === 'catalog-filter-model.js') {
        return [
          buildRuntimeCatalogFilterModel(),
          'const CatalogFilterModel = window.CatalogFilterModel;',
          'export { CatalogFilterModel };',
          'export default CatalogFilterModel;',
        ].join('\n');
      }

      if (key === 'inhabitant-detail-model.js') {
        return [
          buildRuntimeInhabitantDetailModel(),
          'const InhabitantDetailModel = window.InhabitantDetailModel;',
          'export { InhabitantDetailModel };',
          'export default InhabitantDetailModel;',
        ].join('\n');
      }

      if (key === 'mobile-flow-guard.js') {
        return [
          buildRuntimeMobileFlowGuard(),
          'const MobileFlowGuard = window.MobileFlowGuard;',
          'export { MobileFlowGuard };',
          'export default MobileFlowGuard;',
        ].join('\n');
      }

      if (key === 'coral-care-curation.js') {
        return [
          `const curated = ${JSON.stringify(applyCoralCareProfiles)}`,
          'void curated;',
          'export default true;',
        ].join('\n');
      }

      if (key === 'components.jsx') {
        return `${archivedSources['components.jsx']}
export const UI = window.UI;
export default window.UI;`;
      }

      if (key === 'result-views.jsx') {
        return `${archivedSources['result-views.jsx']}
export default window.UI;`;
      }

      if (key === 'catalog-filters.jsx') {
        return `${plainSources['catalog-filters.jsx']}
export default window.UI;`;
      }

      if (key === 'inhabitant-detail.jsx') {
        return `${plainSources['inhabitant-detail.jsx']}
export default window.UI;`;
      }

      if (key === 'app.jsx') return plainSources['app.jsx'];

      return null;
    },
  };
}

export default defineConfig({
  root: resolve(repositoryRoot, 'vite-app'),
  publicDir: false,
  plugins: [nativeSourcePlugin(), react()],
  resolve: {
    alias: {
      '@akvaryum/i18n': `${virtualPrefix}i18n.js`,
      '@akvaryum/fish-fresh': `${virtualPrefix}fish-fresh.js`,
      '@akvaryum/fish-salt': `${virtualPrefix}fish-salt.js`,
      '@akvaryum/data': `${virtualPrefix}data.js`,
      '@akvaryum/engine': `${virtualPrefix}engine.js`,
      '@akvaryum/coral-care-curation': `${virtualPrefix}coral-care-curation.js`,
      '@akvaryum/catalog-filter-model': `${virtualPrefix}catalog-filter-model.js`,
      '@akvaryum/catalog-filters': `${virtualPrefix}catalog-filters.jsx`,
      '@akvaryum/inhabitant-detail-model': `${virtualPrefix}inhabitant-detail-model.js`,
      '@akvaryum/inhabitant-detail': `${virtualPrefix}inhabitant-detail.jsx`,
      '@akvaryum/mobile-flow-guard': `${virtualPrefix}mobile-flow-guard.js`,
      '@akvaryum/components': `${virtualPrefix}components.jsx`,
      '@akvaryum/result-views': `${virtualPrefix}result-views.jsx`,
      '@akvaryum/app': `${virtualPrefix}app.jsx`,
    },
  },
  build: {
    outDir: resolve(repositoryRoot, 'dist'),
    emptyOutDir: true,
  },
});
