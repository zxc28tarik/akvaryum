import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateSubstrateMigration } from './lib/validate-substrate-migration.mjs';

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const report = validateSubstrateMigration(repositoryRoot);

console.log('AKVARYUM Substrate v1 migrasyonu doğrulandı.');
console.log(JSON.stringify(report, null, 2));
