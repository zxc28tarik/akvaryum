import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

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

      const source = archivedPath
        ? readArchive(archivedPath)
        : readPlain(plainPath);

      switch (sourceName) {
        case 'data.js':
          return [
            "import 'virtual:akvaryum/fish-fresh.js';",
            "import 'virtual:akvaryum/fish-salt.js';",
            source,
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
