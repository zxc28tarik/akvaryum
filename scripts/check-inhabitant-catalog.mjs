import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateInhabitantCatalog } from './lib/validate-inhabitant-catalog.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const report = validateInhabitantCatalog(repositoryRoot);

console.log('AKVARYUM canlı katalog ayrımı doğrulandı.');
console.log(JSON.stringify(report, null, 2));
