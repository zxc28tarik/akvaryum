import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateEngineConspecificRules } from './lib/validate-engine-conspecific-rules.mjs';

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const report = validateEngineConspecificRules(repositoryRoot);

console.log(JSON.stringify(report, null, 2));
