import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateCoralCare } from './lib/validate-coral-care.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const report = validateCoralCare(repositoryRoot);

console.log(`AKVARYUM mercan bakımı doğrulandı: ${report.corals} mercan, ${report.completedLight} ışık, ${report.completedFlow} akıntı, ${report.completedAggression} agresyon alanı.`);
console.log(`Dağılım: ${JSON.stringify(report.byType)} | cins istisnası: ${report.genusOverrides} | senaryo: ${report.scenarios}.`);
