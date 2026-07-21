import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateEngineDomainResults } from './lib/validate-engine-domain-results.mjs';

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const report = validateEngineDomainResults(repositoryRoot);

console.log(JSON.stringify(report, null, 2));
