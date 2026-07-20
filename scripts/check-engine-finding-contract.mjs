import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateEngineFindingContract } from './lib/validate-engine-finding-contract.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const report = validateEngineFindingContract(repositoryRoot);

console.log(
  `Engine Finding v${report.contractVersion} doğrulandı: `
  + `${report.declaredRuleIds} tanımlı kural, ${report.validatedRuleIds} çalıştırılan kural, `
  + `${report.validatedFindings} bulgu ve ${report.requiredFields} zorunlu alan.`,
);
