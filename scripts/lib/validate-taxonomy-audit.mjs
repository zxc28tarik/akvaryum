import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { auditInhabitantTaxonomy } from './audit-inhabitant-taxonomy.mjs';
import { loadLegacyData } from './load-legacy-data.mjs';

const SNAPSHOT_PATH = 'data/audits/inhabitant-taxonomy-audit.json';

function compareFingerprints(expected, actual) {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  return {
    added: actual.filter((fingerprint) => !expectedSet.has(fingerprint)),
    removed: expected.filter((fingerprint) => !actualSet.has(fingerprint)),
  };
}

export function validateTaxonomyAudit(repositoryRoot, { requireSnapshot = false } = {}) {
  const data = loadLegacyData(repositoryRoot, {
    withProvenance: true,
    withMigration: true,
    withCatalog: false,
  });
  const audit = auditInhabitantTaxonomy(data.inhabitants);

  const blocking = audit.findings.filter((finding) => finding.severity === 'error');
  if (blocking.length > 0) {
    const details = blocking
      .map((finding) => `${finding.id}: ${finding.message} [${finding.recordIds.join(', ')}]`)
      .join('\n');
    throw new Error(`Taksonomi denetiminde engelleyici hata bulundu:\n${details}`);
  }

  const snapshotFile = resolve(repositoryRoot, SNAPSHOT_PATH);
  if (!existsSync(snapshotFile)) {
    if (requireSnapshot) throw new Error(`${SNAPSHOT_PATH} bulunamadı.`);
    return { audit, snapshotMatched: false, snapshotPath: SNAPSHOT_PATH };
  }

  const snapshot = JSON.parse(readFileSync(snapshotFile, 'utf8'));
  if (snapshot.recordCount !== audit.recordCount) {
    throw new Error(`Taksonomi raporu kayıt sayısı güncel değil: rapor=${snapshot.recordCount}, veri=${audit.recordCount}.`);
  }

  const difference = compareFingerprints(
    snapshot.findingFingerprints ?? [],
    audit.findingFingerprints,
  );
  if (difference.added.length > 0 || difference.removed.length > 0) {
    throw new Error([
      'Taksonomi bulguları kayıtlı rapordan saptı.',
      `Yeni bulgular: ${difference.added.join(', ') || 'yok'}`,
      `Kaldırılan bulgular: ${difference.removed.join(', ') || 'yok'}`,
      'Denetimi inceleyip rapor ve çözüm listesini bilinçli olarak güncelle.',
    ].join('\n'));
  }

  return {
    audit,
    snapshotMatched: true,
    snapshotPath: SNAPSHOT_PATH,
  };
}
