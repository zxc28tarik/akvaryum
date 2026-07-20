import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateTaxonomyAudit } from './lib/validate-taxonomy-audit.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const result = validateTaxonomyAudit(repositoryRoot, { requireSnapshot: true });
const { audit } = result;

console.log('AKVARYUM bilimsel ad ve kimlik denetimi tamamlandı.');
console.log(JSON.stringify({
  recordCount: audit.recordCount,
  acceptedNameVerification: audit.acceptedNameVerification,
  countsByType: audit.countsByType,
  countsBySeverity: audit.countsBySeverity,
  findingCount: audit.findings.length,
  snapshotMatched: result.snapshotMatched,
}, null, 2));

for (const finding of audit.findings) {
  console.log(`AUDIT ${finding.id} | ${finding.type} | ${finding.recordIds.join(', ')} | ${finding.key}`);
}
