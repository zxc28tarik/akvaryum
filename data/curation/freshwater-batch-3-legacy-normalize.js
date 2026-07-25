// AKV-DATA-020 parti 3 — legacy geçiş modelini mevcut şemayla uyumlu tut
;(() => {
  'use strict';

  const batch = window.AKV_FRESHWATER_BATCH_3;
  if (!batch) throw new Error('Tatlı su parti 3 normalizasyonu için batch yüklenmedi.');

  const ids = new Set(batch.legacy.map((record) => record.id));
  for (const record of window.DB_FRESH || []) {
    if (!ids.has(record.id)) continue;
    record.taxonomy.reviewStatus = 'needs_review';
    if (record.category === 'gourami' || record.category === 'betta') {
      record.category = 'anabantoid';
    }
  }
})();
