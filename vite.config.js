import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { buildRuntimeInhabitantCatalogBootstrap } from './data/catalog/index.mjs';
import { buildLegacyFishClassification } from './scripts/lib/classify-legacy-fish.mjs';
import { buildRuntimeSourceProvenanceBootstrap } from './scripts/lib/source-provenance.mjs';
import { validateInhabitantCatalog } from './scripts/lib/validate-inhabitant-catalog.mjs';
import { validateInhabitantMigration } from './scripts/lib/validate-inhabitant-migration.mjs';
import { validatePrioritySocialCare } from './scripts/lib/validate-priority-social-care.mjs';
import { validateRepositoryData } from './scripts/lib/validate-data-schema.mjs';
import { validateSourceProvenance } from './scripts/lib/validate-source-provenance.mjs';
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
  'priority-social-care-v1.mjs': 'data/curation/priority-social-care-v1.mjs',
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
      const priorityReport = validatePrioritySocialCare(repositoryRoot);
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
        `AKVARYUM öncelik 100 doğrulandı: ${priorityReport.completedSocialStructures} sosyal yapı, ${priorityReport.completedCareDifficulties} bakım zorluğu.`,
      );
      this.info(
        `AKVARYUM taksonomi raporu doğrulandı: ${taxonomyReport.audit.findings.length} kayıtlı inceleme bulgusu, engelleyici çakışma yok.`,
      );
      this.info(
        `AKVARYUM canlı kataloğu doğrulandı: ${catalogReport.fish} balık, ${catalogReport.invertebrates} omurgasız, ${catalogReport.corals} mercan.`,
      );
    },

    resolveId(id) {
      if (id.startsWith(publicPrefix)) {
        return `${internalPrefix}${id.slice(publicPrefix.length)}`;
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
            "import { applyPrioritySocialCare } from 'virtual:akvaryum/priority-social-care-v1.mjs';",
            source,
            buildRuntimeSourceProvenanceBootstrap(),
            'window.DB.inhabitants = applyPrioritySocialCare(migrateLegacyInhabitants(window.DB.fish || []));',
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
