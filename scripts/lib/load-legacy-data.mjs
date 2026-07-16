import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { gunzipSync } from 'node:zlib';

function readText(repositoryRoot, relativePath) {
  return readFileSync(resolve(repositoryRoot, relativePath), 'utf8');
}

function readArchive(repositoryRoot, relativePath) {
  const encoded = readText(repositoryRoot, relativePath).trim();
  return gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8');
}

export function loadLegacyData(repositoryRoot) {
  const context = vm.createContext({ window: {} });
  const run = (source, filename) =>
    new vm.Script(source, { filename }).runInContext(context);

  run(readText(repositoryRoot, 'i18n.js'), 'i18n.js');
  run(readArchive(repositoryRoot, '.runtime/fish-fresh.js.gz.b64'), 'fish-fresh.js');
  run(readArchive(repositoryRoot, '.runtime/fish-salt.js.gz.b64'), 'fish-salt.js');
  run(readText(repositoryRoot, 'data.js'), 'data.js');
  run(readText(repositoryRoot, 'engine.js'), 'engine.js');

  return {
    fresh: context.window.DB_FRESH ?? [],
    salt: context.window.DB_SALT ?? [],
    fish: context.window.DB?.fish ?? [],
    plants: context.window.DB?.plants ?? [],
    substrates: context.window.DB?.substrates ?? [],
    tankPresets: context.window.DB?.tankPresets ?? [],
    engine: context.window.Engine,
  };
}
