import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

import { loadLegacyData } from './lib/load-legacy-data.mjs';

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const data = loadLegacyData(repositoryRoot, {
  withProvenance: true,
  withMigration: true,
  withPriorityCuration: true,
  withCatalog: true,
});
const records = data.inhabitantCatalog?.all || [];
assert.equal(records.length, 750, 'Performans testi 750 katalog kaydı bekliyor.');

const context = vm.createContext({ window: { URLSearchParams }, URLSearchParams, Intl });
new vm.Script(readFileSync(resolve(repositoryRoot, 'catalog-filter-model.js'), 'utf8'), {
  filename: 'catalog-filter-model.js',
}).runInContext(context);
const model = context.window.CatalogFilterModel;

function measure(label, filters, iterations = 5) {
  const samples = [];
  let result = [];
  for (let index = 0; index < iterations; index += 1) {
    const startedAt = performance.now();
    result = model.filterRecords(records, filters, { water: 'fresh', lang: 'tr' });
    model.countByCategory(records, filters, { water: 'fresh', lang: 'tr' });
    samples.push(performance.now() - startedAt);
  }
  const sorted = [...samples].sort((a, b) => a - b);
  return {
    label,
    matches: result.length,
    firstMs: Number(samples[0].toFixed(2)),
    medianMs: Number(sorted[Math.floor(sorted.length / 2)].toFixed(2)),
    maxMs: Number(Math.max(...samples).toFixed(2)),
  };
}

const defaults = model.createDefaults();
const report = {
  records: records.length,
  scenarios: [
    measure('default-open', defaults),
    measure('empty-query', { ...defaults, q: 'zzzz-katalogda-olmayan-kayit' }),
    measure('advanced-filter', {
      ...defaults,
      care: 'beginner',
      temperament: 'peaceful',
      social: 'school',
      zone: 'mid',
      tankMax: 150,
      plantSafe: true,
    }),
  ],
};

console.log(JSON.stringify(report, null, 2));

for (const scenario of report.scenarios) {
  assert(
    scenario.maxMs < 1500,
    `${scenario.label}: katalog filtreleme ve sayım ${scenario.maxMs} ms sürdü; 1500 ms sınırını aştı.`,
  );
}
