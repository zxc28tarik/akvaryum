import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validatePriorityTankLength } from './lib/validate-priority-tank-length.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const report = validatePriorityTankLength(repositoryRoot);

console.log('AKVARYUM ilk 100 minimum tank uzunluğu doğrulandı.');
console.log(JSON.stringify(report, null, 2));
