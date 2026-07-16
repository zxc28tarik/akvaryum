import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';

const root = new URL('../', import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), 'utf8');
const inflate = (path) =>
  zlib.gunzipSync(Buffer.from(read(path).trim(), 'base64')).toString('utf8');

const context = vm.createContext({ window: {} });
const run = (source, filename) =>
  new vm.Script(source, { filename }).runInContext(context);

run(read('i18n.js'), 'i18n.js');
run(inflate('.runtime/fish-fresh.js.gz.b64'), 'fish-fresh.js');
run(inflate('.runtime/fish-salt.js.gz.b64'), 'fish-salt.js');
run(read('data.js'), 'data.js');
run(read('engine.js'), 'engine.js');

const fresh = context.window.DB_FRESH ?? [];
const salt = context.window.DB_SALT ?? [];
const fish = context.window.DB?.fish ?? [];
const plants = context.window.DB?.plants ?? [];
const substrates = context.window.DB?.substrates ?? [];
const ids = fish.map((item) => item.id);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

const expected = {
  fresh: 278,
  salt: 302,
  fish: 580,
  plants: 26,
  substrates: 8,
};

const actual = {
  fresh: fresh.length,
  salt: salt.length,
  fish: fish.length,
  plants: plants.length,
  substrates: substrates.length,
};

for (const [key, expectedCount] of Object.entries(expected)) {
  if (actual[key] !== expectedCount) {
    throw new Error(`${key}: ${actual[key]} kayıt bulundu, ${expectedCount} bekleniyordu.`);
  }
}

if (duplicateIds.length > 0) {
  throw new Error(`Tekrarlanan canlı kimlikleri: ${[...new Set(duplicateIds)].join(', ')}`);
}

if (typeof context.window.Engine?.analyze !== 'function') {
  throw new Error('Engine.analyze yüklenemedi.');
}

console.log(JSON.stringify({ ...actual, duplicateFishIds: 0 }, null, 2));
