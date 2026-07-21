import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateMobileFlow } from './lib/validate-mobile-flow.mjs';

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const report = validateMobileFlow(repositoryRoot);

console.log(JSON.stringify(report, null, 2));
