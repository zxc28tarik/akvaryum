import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateRepositoryData } from './lib/validate-data-schema.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const report = validateRepositoryData(repositoryRoot);

console.log('AKVARYUM ortak veri şeması doğrulandı.');
console.log(JSON.stringify(report, null, 2));
