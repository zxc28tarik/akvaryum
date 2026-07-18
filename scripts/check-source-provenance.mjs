import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateSourceProvenance } from './lib/validate-source-provenance.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const report = validateSourceProvenance(repositoryRoot);

console.log('AKVARYUM kaynak ve doğrulama modeli doğrulandı.');
console.log(JSON.stringify(report, null, 2));
