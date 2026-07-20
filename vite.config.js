import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { buildRuntimeInhabitantCatalogBootstrap } from './data/catalog/index.mjs';
import { buildLegacyFishClassification } from './scripts/lib/classify-legacy-fish.mjs';
import { buildRuntimeSourceProvenanceBootstrap } from './scripts/lib/source-provenance.mjs';
import { validateEngineParameterIntersection } from './scripts/lib/validate-engine-parameter-intersection.mjs';
import { validateInhabitantCatalog } from './scripts/lib/validate-inhabitant-catalog.mjs';
import { validateInhabitantMigration } from './scripts/lib/validate-inhabitant-migration.mjs';
import { validatePlantMigration } from './scripts/lib/validate-plant-migration.mjs';
import { validatePrioritySocialCare } from './scripts/lib/validate-priority-social-care.mjs';
import { validatePriorityTankLength } from './scripts/lib/validate-priority-tank-length.mjs';
import { validateRepositoryData } from './scripts/lib/validate-data-schema.mjs';
import { validateSourceProvenance } from './scripts/lib/validate-source-provenance.mjs';
import { validateSubstrateMigration } from './scripts/lib/validate-substrate-migration.mjs';
import { validateTaxonomyAudit } from './scripts/lib/validate-taxonomy-audit.mjs';

const repositoryRoot = dirname(fileURLToPath(import.meta.url));
const publicPrefix = 'virtual:akvaryum/';
const internalPrefix = '\0akvaryum:';

const archivedSources = {
  'styles.css': '.runtime/styles.css.gz.b64',
  'fish-fresh.js': '.runtime/fish-fresh.js.gz.b64',
  'fish-salt.js': '.runtime/fish-salt.js.gz.b64',
  'result-views.jsx': '.runtime/result-views.jsx.gz.b64',
  'components.jsx': '.runtime/components.jsx.gz.b64',
};

const plainSources = {
  'i18n.js': 'i18n.js',
  'data.js': 'data.js',
  'engine.js': 'engine.js',
  'app.jsx': 'app.jsx',
  'legacy-to-inhabitant.mjs': 'data/migration/legacy-to-inhabitant.mjs',
  'legacy-to-plant.mjs': 'data/migration/legacy-to-plant.mjs',
  'legacy-to-substrate.mjs': 'data/migration/legacy-to-substrate.mjs',
  'priority-social-care-v1.mjs': 'data/curation/priority-social-care-v1.mjs',
  'priority-tank-length-v1.mjs': 'data/curation/priority-tank-length-v1.mjs',
};

function readPlain(relativePath) {
  return readFileSync(resolve(repositoryRoot, relativePath), 'utf8');
}

function readArchive(relativePath) {
  const encoded = readPlain(relativePath).trim();
  return gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8');
}

function nativeLegacyModules() {
  return {
    name: 'akvaryum-native-legacy-modules',
    enforce: 'pre',

    buildStart() {
      const report = validateRepositoryData(repositoryRoot);
      const sourceReport = validateSourceProvenance(repositoryRoot);
      const migrationReport = validateInhabitantMigration(repositoryRoot);
      const plantReport = validatePlantMigration(repositoryRoot);
      const substrateReport = validateSubstrateMigration(repositoryRoot);
      const engineParameterReport = validateEngineParameterIntersection(repositoryRoot);
      const priorityReport = validatePrioritySocialCare(repositoryRoot);
      const tankLengthReport = validatePriorityTankLength(repositoryRoot);
      const taxonomyReport = validateTaxonomyAudit(repositoryRoot, { requireSnapshot: true });
      const catalogReport = validateInhabitantCatalog(repositoryRoot);
      this.info(
        `AKVARYUM veri şeması doğrulandı: ${report.totalEntities} kayıt, ${report.fish} canlı.`,
      );
      this.info(
        `AKVARYUM kaynak modeli doğrulandı: ${sourceReport.sources} kaynak, ${sourceReport.fieldLinks} alan bağlantısı.`,
      );
      this.info(
        `AKVARYUM Inhabitant migrasyonu doğrulandı: ${migrationReport.migratedRecords} kayıt, ${migrationReport.preservedIds} korunan kimlik.`,
      );
      this.info(
        `AKVARYUM Plant migrasyonu doğrulandı: ${plantReport.migratedRecords} kayıt, ${plantReport.preservedIds} korunan kimlik.`,
      );
      this.info(
        `AKVARYUM Substrate migrasyonu doğrulandı: ${substrateReport.migratedRecords} kayıt, ${substrateReport.preservedIds} korunan kimlik.`,
      );
      this.info(
        `AKVARYUM motor parametre kesişimi doğrulandı: ${engineParameterReport.scenarios} senaryo.`,
      );
      this.info(
        `AKVARYUM öncelik 100 doğrulandı: ${priorityReport.completedSocialStructures} sosyal yapı, ${priorityReport.completedCareDifficulties} bakım zorluğu.`,
      );
      this.info(
        `AKVARYUM tank uzunluğu doğrulandı: ${tankLengthReport.completedTankLengths} kayıt.`,
      );
      this.info(
        `AKVARYUM taksonomi raporu doğrulandı: ${taxonomyReport.audit.findings.length} kayıtlı inceleme bulgusu, engelleyici çakışma yok.`,
      );
      this.info(
        `AKVARYUM canlı kataloğu doğrulandı: ${catalogReport.fish} balık, ${catalogReport.invertebrates} omurgasız, ${catalogReport.corals} mercan.`,
      );
    },

    resolveId(id, importer) {
      if (id.startsWith(publicPrefix)) {
        return `${internalPrefix}${id.slice(publicPrefix.length)}`;
      }
      if (importer?.startsWith(internalPrefix) && id.startsWith('./')) {
        const relativeName = id.slice(2);
        if (plainSources[relativeName] || archivedSources[relativeName]) {
          return `${internalPrefix}${relativeName}`;
        }
      }
      return null;
    },

    load(id) {
      if (!id.startsWith(internalPrefix)) return null;

      const sourceName = id.slice(internalPrefix.length);
      const archivedPath = archivedSources[sourceName];
      const plainPath = plainSources[sourceName];

      if (!archivedPath && !plainPath) {
        throw new Error(`Bilinmeyen AKVARYUM sanal modülü: ${sourceName}`);
      }

      const source = archivedPath ? readArchive(archivedPath) : readPlain(plainPath);

      if (sourceName === 'fish-fresh.js' || sourceName === 'fish-salt.js') {
        const collectionName = sourceName === 'fish-fresh.js' ? 'DB_FRESH' : 'DB_SALT';
        const bootstrap = {};
        const collector = new Function('window', `${source}\nreturn window.${collectionName};`);
        const records = collector(bootstrap) ?? [];
        const classification = buildLegacyFishClassification(source, records);
        return [
          source,
          `const __classification = ${JSON.stringify(classification)};`,
          `for (const __record of window.${collectionName} || []) Object.assign(__record, __classification[__record.id]);`,
        ].join('\n');
      }

      switch (sourceName) {
        case 'data.js':
          return [
            "import 'virtual:akvaryum/fish-fresh.js';",
            "import 'virtual:akvaryum/fish-salt.js';",
            "import { migrateLegacyInhabitants } from 'virtual:akvaryum/legacy-to-inhabitant.mjs';",
            "import { migrateLegacyPlants } from 'virtual:akvaryum/legacy-to-plant.mjs';",
            "import { migrateLegacySubstrates } from 'virtual:akvaryum/legacy-to-substrate.mjs';",
            "import { applyPrioritySocialCare } from 'virtual:akvaryum/priority-social-care-v1.mjs';",
            "import { applyPriorityTankLength } from 'virtual:akvaryum/priority-tank-length-v1.mjs';",
            source,
            buildRuntimeSourceProvenanceBootstrap(),
            'window.DB.inhabitants = applyPriorityTankLength(applyPrioritySocialCare(migrateLegacyInhabitants(window.DB.fish || [])));',
            'window.DB.aquaticPlants = migrateLegacyPlants(window.DB.plants || []);',
            'window.DB.aquariumSubstrates = migrateLegacySubstrates(window.DB.substrates || []);',
            buildRuntimeInhabitantCatalogBootstrap(),
          ].join('\n');

        case 'engine.js':
          return ["import 'virtual:akvaryum/data.js';", source].join('\n');

        case 'result-views.jsx':
          return [
            "import React from 'react';",
            "import 'virtual:akvaryum/data.js';",
            source,
          ].join('\n');

        case 'components.jsx':
          return [
            "import React from 'react';",
            "import 'virtual:akvaryum/result-views.jsx';",
            "import 'virtual:akvaryum/engine.js';",
            source,
          ].join('\n');

        case 'app.jsx':
          return [
            "import React from 'react';",
            "import * as ReactDOM from 'react-dom/client';",
            "import 'virtual:akvaryum/i18n.js';",
            "import 'virtual:akvaryum/components.jsx';",
            source,
          ].join('\n');

        default:
          return source;
      }
    },
  };
}

export default defineConfig({
  root: 'vite-app',
  base: '/akvaryum/',
  publicDir: false,
  plugins: [nativeLegacyModules(), react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
  },
});
