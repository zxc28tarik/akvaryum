import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { gunzipSync } from 'node:zlib';

import { applyInhabitantCatalog } from '../../data/catalog/index.mjs';
import { applyPrioritySocialCare } from '../../data/curation/priority-social-care-v1.mjs';
import { migrateLegacyInhabitants } from '../../data/migration/legacy-to-inhabitant.mjs';
import { enrichLegacyFish } from './classify-legacy-fish.mjs';
import { applySourceProvenance } from './source-provenance.mjs';

function readText(repositoryRoot, relativePath) {
  return readFileSync(resolve(repositoryRoot, relativePath), 'utf8');
}

function readArchive(repositoryRoot, relativePath) {
  const encoded = readText(repositoryRoot, relativePath).trim();
  return gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8');
}

export function loadLegacyData(
  repositoryRoot,
  {
    withProvenance = false,
    withMigration = false,
    withPriorityCuration = false,
    withCatalog = false,
  } = {},
) {
  const context = vm.createContext({ window: {} });
  const run = (source, filename) =>
    new vm.Script(source, { filename }).runInContext(context);

  run(readText(repositoryRoot, 'i18n.js'), 'i18n.js');
  const freshSource = readArchive(repositoryRoot, '.runtime/fish-fresh.js.gz.b64');
  const saltSource = readArchive(repositoryRoot, '.runtime/fish-salt.js.gz.b64');

  run(freshSource, 'fish-fresh.js');
  run(saltSource, 'fish-salt.js');

  context.window.DB_FRESH = enrichLegacyFish(context.window.DB_FRESH ?? [], freshSource);
  context.window.DB_SALT = enrichLegacyFish(context.window.DB_SALT ?? [], saltSource);

  run(readText(repositoryRoot, 'data.js'), 'data.js');
  if (withProvenance || withMigration || withPriorityCuration) {
    applySourceProvenance(context.window.DB);
  }
  if (withMigration || withPriorityCuration) {
    context.window.DB.inhabitants = migrateLegacyInhabitants(context.window.DB.fish ?? []);
  }
  if (withPriorityCuration) {
    context.window.DB.inhabitants = applyPrioritySocialCare(context.window.DB.inhabitants);
  }
  if (withCatalog) applyInhabitantCatalog(context.window.DB);
  run(readText(repositoryRoot, 'engine.js'), 'engine.js');

  return {
    fresh: context.window.DB_FRESH ?? [],
    salt: context.window.DB_SALT ?? [],
    fish: context.window.DB?.fish ?? [],
    inhabitants: context.window.DB?.inhabitants ?? [],
    plants: context.window.DB?.plants ?? [],
    substrates: context.window.DB?.substrates ?? [],
    tankPresets: context.window.DB?.tankPresets ?? [],
    sources: context.window.DB?.sources ?? [],
    sourceCatalogVersion: context.window.DB?.sourceCatalogVersion ?? null,
    inhabitantCatalog: context.window.DB?.inhabitantCatalog ?? null,
    engine: context.window.Engine,
  };
}
