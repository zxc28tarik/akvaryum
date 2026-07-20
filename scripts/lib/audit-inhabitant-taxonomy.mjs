import { createHash } from 'node:crypto';

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('en-US')
    .replace(/[✕✖]/g, '×');
}

function normalizeId(value) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, '');
}

function normalizeScientificName(value) {
  return normalizeText(value)
    .replace(/\s*×\s*/g, ' × ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findingId(type, key, recordIds) {
  const payload = `${type}|${key}|${[...recordIds].sort().join(',')}`;
  return `${type}-${createHash('sha1').update(payload).digest('hex').slice(0, 12)}`;
}

function makeFinding({ type, severity = 'review', key, records, message, recommendedAction }) {
  const sorted = [...records].sort((left, right) => left.id.localeCompare(right.id));
  const recordIds = sorted.map((record) => record.id);
  return {
    id: findingId(type, key, recordIds),
    type,
    severity,
    key,
    recordIds,
    scientificNames: [...new Set(sorted.map((record) => record.scientificName).filter(Boolean))],
    message,
    recommendedAction,
  };
}

function groupRecords(records, keyOf) {
  const groups = new Map();
  for (const record of records) {
    const key = keyOf(record);
    if (!key) continue;
    const group = groups.get(key) ?? [];
    group.push(record);
    groups.set(key, group);
  }
  return groups;
}

function scientificKind(name) {
  const normalized = String(name ?? '').trim();
  if (!normalized) return 'missing';
  if (/^hybrid\b/i.test(normalized) || /\bhybrid\b/i.test(normalized)) return 'hybrid_placeholder';
  if (/\(gen\)/i.test(normalized)) return 'genetic_marker';
  if (/\bvar\.?\s*$/i.test(normalized) || /\bvar\.\b/i.test(normalized)) return 'variety_placeholder';
  if (/\bsp\.?\b/i.test(normalized)) return 'open_nomenclature';
  if (/^[A-Z][A-Za-z-]+\s+[a-z][A-Za-z-]+(?:\s+.*)?$/.test(normalized)) return 'binomial_or_extended';
  return 'nonstandard';
}

function parsedGenus(name) {
  if (scientificKind(name) === 'hybrid_placeholder') return null;
  const match = String(name ?? '').trim().match(/^([A-Z][A-Za-z-]+)/);
  return match?.[1] ?? null;
}

function addCollisionFindings(findings, groups, options) {
  for (const [key, records] of groups) {
    if (records.length < 2) continue;
    findings.push(makeFinding({ ...options, key, records }));
  }
}

export function auditInhabitantTaxonomy(inhabitants) {
  const findings = [];

  addCollisionFindings(findings, groupRecords(inhabitants, (record) => record.id), {
    type: 'duplicate_id',
    severity: 'error',
    message: 'Aynı kimlik birden fazla canlı kaydında kullanılıyor.',
    recommendedAction: 'Tek bir kalıcı kimlik seç; yinelenen kaydı birleştir veya yeni benzersiz kimlik ver.',
  });

  addCollisionFindings(findings, groupRecords(inhabitants, (record) => normalizeId(record.id)), {
    type: 'normalized_id_collision',
    severity: 'error',
    message: 'Noktalama farkı kaldırıldığında iki veya daha fazla kimlik aynı değere dönüşüyor.',
    recommendedAction: 'URL ve arama çakışmasını önleyecek benzersiz kalıcı kimlikler belirle.',
  });

  addCollisionFindings(findings, groupRecords(inhabitants, (record) => normalizeScientificName(record.scientificName)), {
    type: 'duplicate_scientific_name',
    message: 'Aynı bilimsel ad birden fazla kayıt tarafından kullanılıyor.',
    recommendedAction: 'Kayıtların aynı canlı mı, ticari varyant mı veya eş ad mı olduğunu doğrula; tek kanonik kimlik ve alias/variant kararı ver.',
  });

  addCollisionFindings(findings, groupRecords(inhabitants, (record) => normalizeText(record.name?.tr)), {
    type: 'duplicate_common_name_tr',
    message: 'Aynı Türkçe ad farklı kayıtlarda kullanılıyor.',
    recommendedAction: 'Gerekirse ayırt edici Türkçe ad ekle; gerçek eş ad ise alias alanına taşı.',
  });

  addCollisionFindings(findings, groupRecords(inhabitants, (record) => normalizeText(record.name?.en)), {
    type: 'duplicate_common_name_en',
    message: 'Aynı İngilizce ad farklı kayıtlarda kullanılıyor.',
    recommendedAction: 'Gerekirse ayırt edici İngilizce ad ekle; gerçek eş ad ise alias alanına taşı.',
  });

  const byScientificKind = groupRecords(inhabitants, (record) => scientificKind(record.scientificName));
  for (const type of ['missing', 'hybrid_placeholder', 'genetic_marker', 'variety_placeholder', 'open_nomenclature', 'nonstandard']) {
    const records = byScientificKind.get(type) ?? [];
    if (records.length === 0) continue;
    const actions = {
      missing: 'Bilimsel adı güvenilir taksonomi kaynağından ekle.',
      hybrid_placeholder: 'Melez ebeveynlerini ve gösterim biçimini kaynakla doğrula; uydurma cins/tür yazma.',
      genetic_marker: 'Genetik olarak değiştirilmiş ticari varyantı temel tür ve varyant etiketiyle ayrı göster.',
      variety_placeholder: 'Genel “var.” ifadesini kaldır; ticari varyant adını ayrı alan veya alias olarak kaydet.',
      open_nomenclature: 'Tür düzeyi belirlenebiliyorsa doğrula; belirlenemiyorsa sp. kaydının nedenini açıkça not et.',
      nonstandard: 'Bilimsel ad biçimini ve kabul edilmiş taksonomik karşılığını doğrula.',
    };
    findings.push(makeFinding({
      type: `scientific_${type}`,
      key: type,
      records,
      message: `${records.length} kayıt bilimsel ad inceleme sınıfına girdi: ${type}.`,
      recommendedAction: actions[type],
    }));
  }

  for (const record of inhabitants) {
    const parsed = parsedGenus(record.scientificName);
    const declared = record.taxonomy?.genus ?? null;
    if (parsed && declared && normalizeText(parsed) !== normalizeText(declared)) {
      findings.push(makeFinding({
        type: 'taxonomy_genus_mismatch',
        severity: 'error',
        key: `${normalizeText(parsed)}|${normalizeText(declared)}`,
        records: [record],
        message: `Bilimsel addaki cins (${parsed}) ile taxonomy.genus (${declared}) uyuşmuyor.`,
        recommendedAction: 'Bilimsel adı ve cins alanını aynı doğrulanmış kaynağa göre düzelt.',
      }));
    }
  }

  const genusFamilies = new Map();
  for (const record of inhabitants) {
    const genus = normalizeText(record.taxonomy?.genus);
    const family = normalizeText(record.taxonomy?.family);
    if (!genus || !family) continue;
    const entry = genusFamilies.get(genus) ?? new Map();
    const records = entry.get(family) ?? [];
    records.push(record);
    entry.set(family, records);
    genusFamilies.set(genus, entry);
  }
  for (const [genus, families] of genusFamilies) {
    if (families.size < 2) continue;
    const records = [...families.values()].flat();
    findings.push(makeFinding({
      type: 'genus_family_conflict',
      severity: 'error',
      key: genus,
      records,
      message: `Aynı cins birden fazla aileye bağlanmış: ${[...families.keys()].join(', ')}.`,
      recommendedAction: 'Cins-aile eşlemesini güvenilir taksonomi kaynağıyla doğrula ve tek aileye indir.',
    }));
  }

  findings.sort((left, right) => left.type.localeCompare(right.type) || left.key.localeCompare(right.key));
  const countsByType = {};
  const countsBySeverity = {};
  for (const finding of findings) {
    countsByType[finding.type] = (countsByType[finding.type] ?? 0) + 1;
    countsBySeverity[finding.severity] = (countsBySeverity[finding.severity] ?? 0) + 1;
  }

  return {
    version: 1,
    recordCount: inhabitants.length,
    acceptedNameVerification: {
      verifiedRecords: 0,
      needsExternalReview: inhabitants.length,
      note: 'Bu görev tekrar ve biçim denetimidir; kabul edilmiş taksonomik adlar dış kaynakla henüz doğrulanmadı.',
    },
    countsByType,
    countsBySeverity,
    findingFingerprints: findings.map((finding) => finding.id),
    findings,
  };
}
