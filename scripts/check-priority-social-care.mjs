import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validatePrioritySocialCare } from './lib/validate-priority-social-care.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const report = validatePrioritySocialCare(repositoryRoot);

console.log('AKVARYUM öncelik 100 sosyal yapı ve bakım zorluğu doğrulandı.');
console.log(JSON.stringify(report, null, 2));
