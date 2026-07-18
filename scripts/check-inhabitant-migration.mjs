import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateInhabitantMigration } from './lib/validate-inhabitant-migration.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const report = validateInhabitantMigration(repositoryRoot);

console.log('AKVARYUM Inhabitant v1 migrasyonu doğrulandı.');
console.log(JSON.stringify(report, null, 2));
