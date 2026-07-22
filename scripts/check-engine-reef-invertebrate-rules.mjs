import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateEngineReefInvertebrateRules } from './lib/validate-engine-reef-invertebrate-rules.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const report = validateEngineReefInvertebrateRules(repositoryRoot);

console.log('AKVARYUM ayrık resif güvenliği kuralları doğrulandı.');
console.log(`Senaryo: ${report.scenarios}`);
console.log(`Kural kimliği: ${report.ruleIds}`);
console.log(`Doğrulanan bulgu: ${report.findingsValidated}`);
console.log(`Genel resif uyarısı kaldırıldı: ${report.genericWarningRemoved ? 'evet' : 'hayır'}`);
console.log(`Eksik veride tahmin yapılmıyor: ${report.unknownDataDoesNotGuess ? 'evet' : 'hayır'}`);
