import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateFreshwaterBatch3 } from './lib/validate-freshwater-batch-3.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const report = validateFreshwaterBatch3(repositoryRoot);

console.log(JSON.stringify(report, null, 2));
console.log(`AKV-DATA-020 parti 3 doğrulandı: ${report.batchRecords} yeni kayıt, ${report.totalFreshwater} tatlı su, ${report.totalInhabitants} toplam canlı.`);
