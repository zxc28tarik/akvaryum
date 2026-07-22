import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateEnginePredatorPreyRules } from './lib/validate-engine-predator-prey-rules.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const report = validateEnginePredatorPreyRules(repositoryRoot);

console.log(
  `AKVARYUM avcı-av motoru doğrulandı: ${report.scenarios} senaryo, ${report.findingsValidated} kaynaklı bulgu.`,
);
