import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateEngineParameterIntersection } from './lib/validate-engine-parameter-intersection.mjs';

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const report = validateEngineParameterIntersection(repositoryRoot);

console.log('AKVARYUM motor parametre kesişimi doğrulandı.');
console.log(`Senaryo: ${report.scenarios}`);
console.log(`Ortak aralık senaryosu: ${report.overlappingScenarios}`);
console.log(`Null sonuç senaryosu: ${report.nullRangeScenarios}`);
console.log(`Dil senaryosu: ${report.languageScenarios}`);
console.log(`Kritik parametreler: ${report.criticalParameters.join(', ')}`);
