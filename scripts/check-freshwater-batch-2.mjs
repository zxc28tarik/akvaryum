import { validateFreshwaterBatch2 } from './lib/validate-freshwater-batch-2.mjs';

const report = validateFreshwaterBatch2(process.cwd());
console.log(JSON.stringify(report, null, 2));
console.log(`AKV-DATA-020 parti 2 doğrulandı: ${report.batchRecords} yeni kayıt, ${report.totalFreshwater} tatlı su, ${report.totalInhabitants} toplam canlı.`);
