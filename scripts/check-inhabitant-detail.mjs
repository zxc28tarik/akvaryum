import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateInhabitantDetail } from './lib/validate-inhabitant-detail.mjs';

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const report = validateInhabitantDetail(repositoryRoot);

console.log(JSON.stringify(report, null, 2));
