import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateEngineCompatibilityOverrides } from './lib/validate-engine-compatibility-overrides.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const report = validateEngineCompatibilityOverrides(repositoryRoot);

console.log('AKVARYUM tür çifti istisnaları doğrulandı.');
console.log(`Doğrulanmış istisna: ${report.overrides}`);
console.log(`Kaynak: ${report.sources}`);
console.log(`Durum dağılımı: ${JSON.stringify(report.statuses)}`);
console.log(`Senaryo: ${report.scenarios}`);
console.log(`Kural kimliği: ${report.ruleIds}`);
console.log(`Doğrulanan bulgu: ${report.findingsValidated}`);
console.log(`Çevresel kurallar korundu: ${report.environmentalRulesPreserved ? 'evet' : 'hayır'}`);
