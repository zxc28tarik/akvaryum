// AKVARYUM — coral and invertebrate reef-safety rules

(function attachEngineReefSafetyRules(global) {
  'use strict';

  if (!global.Engine || typeof global.Engine.analyze !== 'function') {
    throw new Error('Resif güvenliği kuralları, window.Engine.analyze bulunmadan yüklenemez.');
  }

  const TARGETS = Object.freeze({
    soft_coral: Object.freeze({
      ruleId: 'REEF_SOFT_CORAL_RISK',
      field: 'softCoralSafe',
      fallbackField: 'coralSafe',
      tr: 'soft mercan',
      en: 'soft coral',
    }),
    lps_coral: Object.freeze({
      ruleId: 'REEF_LPS_CORAL_RISK',
      field: 'lpsSafe',
      fallbackField: 'coralSafe',
      tr: 'LPS mercan',
      en: 'LPS coral',
    }),
    sps_coral: Object.freeze({
      ruleId: 'REEF_SPS_CORAL_RISK',
      field: 'spsSafe',
      fallbackField: 'coralSafe',
      tr: 'SPS mercan',
      en: 'SPS coral',
    }),
    shrimp: Object.freeze({
      ruleId: 'REEF_SHRIMP_RISK',
      field: 'shrimpSafe',
      tr: 'karides',
      en: 'shrimp',
    }),
    snail: Object.freeze({
      ruleId: 'REEF_SNAIL_RISK',
      field: 'snailSafe',
      tr: 'salyangoz',
      en: 'snail',
    }),
    crab: Object.freeze({
      ruleId: 'REEF_CRAB_RISK',
      field: 'crabSafe',
      tr: 'yengeç',
      en: 'crab',
    }),
    clam: Object.freeze({
      ruleId: 'REEF_CLAM_RISK',
      field: 'clamSafe',
      tr: 'çift kabuklu',
      en: 'clam',
    }),
  });

  const RULE_IDS = Object.freeze(Object.values(TARGETS).map((target) => target.ruleId));
  const originalAnalyze = global.Engine.analyze.bind(global.Engine);

  function localize(lang, tr, en) {
    return lang === 'en' ? en : tr;
  }

  function canonicalRecord(id) {
    return (global.DB?.inhabitants || []).find((record) => record.id === id)
      || (global.DB?.fish || []).find((record) => record.id === id)
      || null;
  }

  function legacyRecord(id) {
    return (global.DB?.fish || []).find((record) => record.id === id) || null;
  }

  function recordName(record, lang) {
    if (lang === 'en') return record?.name?.en || record?.nameEn || record?.name?.tr || record?.nameTr || record?.id;
    return record?.name?.tr || record?.nameTr || record?.name?.en || record?.nameEn || record?.id;
  }

  function targetType(record) {
    switch (record?.entityType) {
      case 'soft_coral': return 'soft_coral';
      case 'lps_coral': return 'lps_coral';
      case 'sps_coral': return 'sps_coral';
      case 'freshwater_shrimp':
      case 'marine_shrimp': return 'shrimp';
      case 'snail': return 'snail';
      case 'crab': return 'crab';
      case 'bivalve': return 'clam';
      default: return null;
    }
  }

  function normalizeSafety(value) {
    if (value === true) return 'yes';
    if (value === false) return 'no';
    if (typeof value !== 'string') return 'unknown';
    const normalized = value.trim().toLowerCase();
    if (['yes', 'safe', 'true'].includes(normalized)) return 'yes';
    if (['no', 'unsafe', 'false'].includes(normalized)) return 'no';
    if (['with_caution', 'caution', 'conditional'].includes(normalized)) return 'with_caution';
    if (['not_applicable', 'n/a'].includes(normalized)) return 'not_applicable';
    return 'unknown';
  }

  function safetyFor(record, targetKey) {
    const target = TARGETS[targetKey];
    const compatibility = record?.compatibility || {};

    if (Object.prototype.hasOwnProperty.call(compatibility, target.field)) {
      return {
        status: normalizeSafety(compatibility[target.field]),
        field: `compatibility.${target.field}`,
        method: 'target_specific_field',
      };
    }

    if (target.fallbackField && Object.prototype.hasOwnProperty.call(compatibility, target.fallbackField)) {
      return {
        status: normalizeSafety(compatibility[target.fallbackField]),
        field: `compatibility.${target.fallbackField}`,
        method: 'generic_coral_fallback',
      };
    }

    const legacy = legacyRecord(record?.id);
    if (target.fallbackField && typeof legacy?.reefSafe === 'boolean') {
      return {
        status: legacy.reefSafe ? 'yes' : 'no',
        field: 'reefSafe',
        method: 'legacy_coral_fallback',
      };
    }

    return {
      status: 'unknown',
      field: `compatibility.${target.field}`,
      method: 'missing_target_specific_data',
    };
  }

  function genericReefFinding(finding) {
    if (finding?.ruleId === 'REEF_UNSAFE_INHABITANT') return true;
    return /resif güvenli değil$|is not reef-safe$/i.test(String(finding?.title || ''));
  }

  function riskFinding(actor, targetKey, targetRecords, safety, lang) {
    const target = TARGETS[targetKey];
    const actorName = recordName(actor, lang);
    const caution = safety.status === 'with_caution';
    const title = caution
      ? localize(lang, `${actorName}: ${target.tr} ile dikkat`, `${actorName}: caution with ${target.en}`)
      : localize(lang, `${actorName}: ${target.tr} güvenli değil`, `${actorName}: unsafe with ${target.en}`);
    const reason = caution
      ? localize(
        lang,
        `Kayıt ${target.tr} güvenliğini koşullu olarak işaretliyor.`,
        `The record marks ${target.en} safety as conditional.`,
      )
      : localize(
        lang,
        `Kayıt ${target.tr} güvenliğini olumsuz olarak işaretliyor.`,
        `The record marks ${target.en} safety as unsafe.`,
      );

    return {
      ruleId: target.ruleId,
      severity: 'warning',
      title,
      desc: reason,
      reason,
      impact: localize(
        lang,
        `${target.tr} canlıları yenebilir, kemirilebilir, yaralanabilir veya sürekli strese girebilir.`,
        `${target.en} inhabitants may be eaten, nipped, injured, or chronically stressed.`,
      ),
      resolution: localize(
        lang,
        `Bu canlıyı ${target.tr} içeren kurulumdan çıkar veya doğrulanmış tür çifti bilgisi kullan.`,
        `Remove this inhabitant from setups containing ${target.en}, or use a verified pair-specific compatibility record.`,
      ),
      subjects: [...new Set([actor.id, ...targetRecords.map((record) => record.id)])],
      evidence: {
        source: 'reef-invertebrate-engine-v1',
        targetType: targetKey,
        targetField: safety.field,
        safetyStatus: safety.status,
        method: safety.method,
        actorSourceIds: actor?.sourceIds || [],
        verificationStatus: actor?.verification?.status || 'unknown',
        confidence: actor?.verification?.confidence || 'unknown',
      },
    };
  }

  function verdict(score) {
    if (score >= 85) return 'excellent';
    if (score >= 65) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  global.Engine.analyze = function analyzeWithReefSafety(state) {
    const result = originalAnalyze(state);
    const lang = state?.lang || 'tr';

    if (state?.water !== 'salt') {
      result.reefSafety = {
        version: 1,
        active: false,
        targetTypes: [],
        assessments: [],
        warningCount: 0,
        unknownCount: 0,
      };
      return result;
    }

    const selected = (state?.fish || [])
      .map((selection) => canonicalRecord(selection.id))
      .filter(Boolean);
    const groups = new Map();

    for (const record of selected) {
      const key = targetType(record);
      if (!key) continue;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(record);
    }

    const genericWarnings = (result.warnings || []).filter(genericReefFinding);
    result.warnings = (result.warnings || []).filter((finding) => !genericReefFinding(finding));

    const assessments = [];
    const addedFindings = [];

    for (const actor of selected) {
      for (const [targetKey, targetRecords] of groups.entries()) {
        const relevantTargets = targetRecords.filter((target) => target.id !== actor.id);
        if (relevantTargets.length === 0) continue;

        const safety = safetyFor(actor, targetKey);
        assessments.push({
          actorId: actor.id,
          targetType: targetKey,
          targetIds: relevantTargets.map((target) => target.id),
          status: safety.status,
          field: safety.field,
          method: safety.method,
        });

        if (safety.status === 'no' || safety.status === 'with_caution') {
          addedFindings.push(riskFinding(actor, targetKey, relevantTargets, safety, lang));
        }
      }
    }

    result.warnings.push(...addedFindings);
    result.score = Math.max(
      0,
      Math.min(100, Number(result.score || 0) + genericWarnings.length * 8 - addedFindings.length * 8),
    );
    result.verdict = verdict(result.score);

    if (result.score < 65) {
      result.tips = (result.tips || []).filter((finding) => finding?.ruleId !== 'COMPOSITION_HEALTHY');
    }

    result.reefSafety = {
      version: 1,
      active: groups.size > 0,
      targetTypes: [...groups.keys()],
      assessments,
      warningCount: addedFindings.length,
      unknownCount: assessments.filter((assessment) => assessment.status === 'unknown').length,
      removedGenericWarnings: genericWarnings.length,
    };

    return result;
  };

  global.Engine.reefSafetyRulesVersion = 1;
  global.Engine.reefSafetyRuleIds = RULE_IDS;
})(window);
