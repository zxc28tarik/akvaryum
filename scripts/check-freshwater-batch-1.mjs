import { validateFreshwaterBatch1 } from './lib/validate-freshwater-batch-1.mjs';

try {
  const report = validateFreshwaterBatch1(process.cwd());
  console.log(JSON.stringify(report, null, 2));
  console.log(`AKV-DATA-020 parti 1 doğrulandı: ${report.batchRecords} yeni kayıt, ${report.totalFreshwater} tatlı su, ${report.totalInhabitants} toplam canlı.`);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
