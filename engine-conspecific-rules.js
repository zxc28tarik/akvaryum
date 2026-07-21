// AKVARYUM — same-species and congeneric aggression rules

(function attachEngineConspecificRules(global) {
  'use strict';

  if (!global.Engine || typeof global.Engine.analyze !== 'function') {
    throw new Error('Aynı tür agresyon kuralları, window.Engine.analyze bulunmadan yüklenemez.');
  }

  const RULE_IDS = Object.freeze([
    'CONSPECIFIC_AGGRESSION',
    'CONGENERIC_AGGRESSION',
  ]);
  const HIGH_RISK = new Set(['high', 'extreme']);
  const originalAnalyze = global.Engine.analyze.bind(global.Engine);

  function localize(lang, tr, en) {
    return lang === 'en' ? en : tr;
  }

  function recordsById() {
    return new Map((global.DB?.inhabitants || []).map((record) => [record.id, record]));
  }

  function nameOf(record, lang) {
    if (lang === 'en') return record?.name?.en || record?.nameEn || record?.name?.tr || record?.nameTr || record?.id;
    return record?.name?.tr || record?.nameTr || record?.name?.en || record?.nameEn || record?.id;
  }

  function socialMode(record) {
    return record?.social?.mode || 'unknown';
  }

  function aggression(record) {
    return record?.social?.conspecificAggression || 'unknown';
  }

  function genus(record) {
    const value = String(record?.taxonomy?.genus || '').trim();
    return value || null;
  }

  function verificationEvidence(record) {
    return {
      verificationStatus: record?.verification?.status || 'needs_review',
      confidence: record?.verification?.confidence || 'low',
      taxonomyReviewStatus: record?.taxonomy?.reviewStatus || 'needs_review',
    };
  }

  function verdict(score) {
    if (score >= 85) return 'excellent';
    if (score >= 65) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  function samePairIndex(result, id) {
    return (result.compat || []).findIndex((entry) => entry.a === id && entry.b === id);
  }

  function pairIndex(result, firstId, secondId) {
    return (result.compat || []).findIndex((entry) => (
      (entry.a === firstId && entry.b === secondId)
      || (entry.a === secondId && entry.b === firstId)
    ));
  }

  function existingPairRisk(result, firstId, secondId) {
    const index = pairIndex(result, firstId, secondId);
    if (index < 0) return false;
    const entry = result.compat[index];
    return entry.status === 'warn' || entry.status === 'bad'
      || entry.severity === 'warning' || entry.severity === 'critical';
  }

  function existingSameSpeciesCritical(result, id) {
    const index = samePairIndex(result, id);
    if (index >= 0) {
      const entry = result.compat[index];
      if (entry.status === 'bad' || entry.severity === 'critical') return true;
    }
    return (result.issues || []).some((finding) => (
      finding?.ruleId === 'PAIRWISE_INCOMPATIBLE'
      && Array.isArray(finding.subjects)
      && finding.subjects.length === 1
      && finding.subjects[0] === id
    ));
  }

  function sameSpeciesRisk(record, quantity) {
    if (quantity <= 1) return false;
    const level = aggression(record);
    if (HIGH_RISK.has(level)) return true;
    return level === 'medium' && socialMode(record) === 'solitary';
  }

  function congenericRisk(first, second) {
    const firstGenus = genus(first);
    const secondGenus = genus(second);
    if (!firstGenus || firstGenus !== secondGenus || first.id === second.id) return false;
    return HIGH_RISK.has(aggression(first))
      || HIGH_RISK.has(aggression(second))
      || first?.social?.territoriality === 'high'
      || second?.social?.territoriality === 'high';
  }

  function sameSpeciesWarning(record, quantity, lang) {
    const name = nameOf(record, lang);
    const level = aggression(record);
    const reason = localize(
      lang,
      `${name} için aynı tür agresyonu “${level}” olarak kayıtlı ve ${quantity} birey seçildi.`,
      `${name} has recorded conspecific aggression “${level}” and ${quantity} individuals were selected.`,
    );
    return {
      ruleId: 'CONSPECIFIC_AGGRESSION',
      severity: 'warning',
      title: localize(lang, `${name}: aynı tür çatışması riski`, `${name}: conspecific conflict risk`),
      desc: reason,
      reason,
      impact: localize(
        lang,
        'Aynı tür bireyler alan, eş veya baskınlık için birbirini kovalayabilir ve yaralayabilir.',
        'Individuals of the same species may chase or injure one another over space, mates, or dominance.',
      ),
      resolution: localize(
        lang,
        'Tank boyutunu, saklanma alanlarını ve grup yapısını kontrol et; gerekirse birey sayısını azalt.',
        'Check tank size, cover, and group structure; reduce the number of individuals if needed.',
      ),
      subjects: [record.id],
      evidence: {
        source: 'conspecific-engine-v1',
        relationship: 'same_species',
        quantity,
        socialMode: socialMode(record),
        conspecificAggression: level,
        ...verificationEvidence(record),
      },
    };
  }

  function congenericWarning(first, second, lang) {
    const firstName = nameOf(first, lang);
    const secondName = nameOf(second, lang);
    const sharedGenus = genus(first);
    const reason = localize(
      lang,
      `${firstName} ve ${secondName} aynı ${sharedGenus} cinsinde; kayıtlı agresyon veya bölgesellik yakın tür çatışması riski gösteriyor.`,
      `${firstName} and ${secondName} share the genus ${sharedGenus}; recorded aggression or territoriality indicates congeneric conflict risk.`,
    );
    return {
      ruleId: 'CONGENERIC_AGGRESSION',
      severity: 'warning',
      title: localize(lang, `${firstName} ↔ ${secondName}: yakın tür çatışması riski`, `${firstName} ↔ ${secondName}: congeneric conflict risk`),
      desc: reason,
      reason,
      impact: localize(
        lang,
        'Benzer görünüş ve aynı alan kullanımı bölge, yem ve baskınlık rekabetini artırabilir.',
        'Similar appearance and habitat use may increase competition for territory, food, and dominance.',
      ),
      resolution: localize(
        lang,
        'Yeterli tank alanı ve görüş kesen saklanma bölgeleri sağla; davranışı yakından izle.',
        'Provide enough tank space and line-of-sight breaks; monitor behavior closely.',
      ),
      subjects: [first.id, second.id],
      evidence: {
        source: 'conspecific-engine-v1',
        relationship: 'same_genus',
        genus: sharedGenus,
        first: {
          conspecificAggression: aggression(first),
          territoriality: first?.social?.territoriality || 'unknown',
          ...verificationEvidence(first),
        },
        second: {
          conspecificAggression: aggression(second),
          territoriality: second?.social?.territoriality || 'unknown',
          ...verificationEvidence(second),
        },
      },
    };
  }

  function compatFromWarning(warning, firstId, secondId) {
    return {
      a: firstId,
      b: secondId,
      status: 'warn',
      reasons: [warning.reason],
      ...warning,
    };
  }

  global.Engine.analyze = function analyzeWithConspecificRules(state) {
    const result = originalAnalyze(state);
    const lang = state?.lang === 'en' ? 'en' : 'tr';
    const byId = recordsById();
    const selections = (state?.fish || [])
      .map((selection) => ({ ...selection, record: byId.get(selection.id) }))
      .filter((selection) => selection.record && Number(selection.qty || 0) > 0);
    let addedWarnings = 0;

    for (const selection of selections) {
      const quantity = Number(selection.qty || 0);
      if (!sameSpeciesRisk(selection.record, quantity)) continue;
      if (existingSameSpeciesCritical(result, selection.record.id)) continue;

      const warning = sameSpeciesWarning(selection.record, quantity, lang);
      result.warnings.push(warning);
      const index = samePairIndex(result, selection.record.id);
      const compat = compatFromWarning(warning, selection.record.id, selection.record.id);
      if (index >= 0) result.compat[index] = compat;
      else result.compat.push(compat);
      addedWarnings += 1;
    }

    for (let firstIndex = 0; firstIndex < selections.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < selections.length; secondIndex += 1) {
        const first = selections[firstIndex].record;
        const second = selections[secondIndex].record;
        if (!congenericRisk(first, second)) continue;
        if (existingPairRisk(result, first.id, second.id)) continue;

        const warning = congenericWarning(first, second, lang);
        result.warnings.push(warning);
        const index = pairIndex(result, first.id, second.id);
        const compat = compatFromWarning(warning, first.id, second.id);
        if (index >= 0) result.compat[index] = compat;
        else result.compat.push(compat);
        addedWarnings += 1;
      }
    }

    if (addedWarnings > 0) {
      result.score = Math.max(0, Number(result.score || 0) - addedWarnings * 8);
      result.verdict = verdict(result.score);
    }

    return result;
  };

  global.Engine.conspecificRulesVersion = 1;
  global.Engine.conspecificRuleIds = RULE_IDS;
})(window);
