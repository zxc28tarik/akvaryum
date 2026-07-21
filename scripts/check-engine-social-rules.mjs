import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateEngineSocialRules } from './lib/validate-engine-social-rules.mjs';

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const report = validateEngineSocialRules(repositoryRoot);

console.log(JSON.stringify(report, null, 2));
