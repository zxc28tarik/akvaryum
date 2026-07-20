import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateEngineGoldenScenarios } from './lib/validate-engine-golden-scenarios.mjs';

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const report = validateEngineGoldenScenarios(repositoryRoot);

console.log(JSON.stringify(report, null, 2));
