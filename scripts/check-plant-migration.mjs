import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validatePlantMigration } from './lib/validate-plant-migration.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const report = validatePlantMigration(repositoryRoot);

console.log('AKVARYUM Plant v1 migrasyonu doğrulandı.');
console.log(JSON.stringify(report, null, 2));
