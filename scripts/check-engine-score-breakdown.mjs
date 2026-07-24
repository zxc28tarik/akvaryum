import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateEngineScoreBreakdown } from './lib/validate-engine-score-breakdown.mjs';

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const report = validateEngineScoreBreakdown(repositoryRoot);

console.log(JSON.stringify(report, null, 2));
