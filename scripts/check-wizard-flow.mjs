import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateWizardFlow } from './lib/validate-wizard-flow.mjs';

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const report = validateWizardFlow(repositoryRoot);

console.log(JSON.stringify(report, null, 2));
