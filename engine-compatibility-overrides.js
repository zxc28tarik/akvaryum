// AKVARYUM — verified species-pair compatibility overrides

(function attachCompatibilityOverrides(global) {
  'use strict';

  if (!global.Engine || typeof global.Engine.analyze !== 'function') {
    throw new Error('Tür çifti istisnaları, window.Engine.analyze bulunmadan yüklenemez.');
  }

  const RULES = Object.freeze({
    compatible: Object.freeze({
      ruleId: 'PAIR_OVERRIDE_COMPATIBLE',
      severity: 'info',
      status: 'ok',
      tr: 'kaynaklı uyumlu',
      en: 'verified compatible',
    }),
    caution: Object.freeze({
      ruleId: 'PAIR_OVERRIDE_CAUTION',
      severity: 'warning',
      status: 'warn',
      tr: 'kaynaklı dikkat',
      en: 'verified caution',
    }),
    conditional: Object.freeze({
      ruleId: 'PAIR_OVERRIDE_CONDITIONAL',
      severity: 'warning',
      status: 'warn',
      tr: 'kaynaklı koşullu uyum',
      en: 'verified conditional compatibility',
    }),
    incompatible: Object.freeze({
      ruleId: 'PAIR_OVERRIDE_INCOMPATIBLE',
      severity: 'critical',
      status: 'bad',
      tr: 'kaynaklı uyumsuz',
      en: 'verified incompatible',
    }),
  });
  const RULE_IDS = Object.freeze(Object.values(RULES).map((rule) => rule.ruleId));
  const GENERAL_PAIR_RULE_IDS = new Set([
    'PAIRWISE_COMPATIBLE',
    'PAIRWISE_CAUTION',
    'PAIRWISE_INCOMPATIBLE',
    'CONGENERIC_AGGRESSION',
    'PREDATION_SIZE_RISK',
    'REEF_SOFT_CORAL_RISK',
    'REEF_LPS_CORAL_RISK',
    'REEF_SPS_CORAL_RISK',
    'REEF_SHRIMP_RISK',
    'REEF_SNAIL_RISK',
    'REEF_CRAB_RISK',
    'REEF_CLAM_RISK',
  ]);
  const STATUS_PRIORITY = Object.freeze({
    compatible: 0,
    caution: 1,
    conditional: 2,
    incompatible: 3,
  });
  const originalAnalyze = global.Engine.analyze.bind(global.Engine);

  function localize(lang, value) {
    if (!value) return '';
    return lang === 'en' ? value.en : value.tr;
  }

  function recordsById() {
    const records = [
      ...(global.DB?.inhabitants || []),
      ...(global.DB?.fish || []),
    ];
    return new Map(records.map((record) => [record.id, record]));
  }

  function nameOf(record, lang) {
    if (lang === 'en') {
      return record?.name?.en || record?.nameEn || record?.name?.tr || record?.nameTr || record?.id;
    }
    return record?.name?.tr || record?.nameTr || record?.name?.en || record?.nameEn || record?.id;
  }

  function pairMatches(override, firstId, secondId) {
    return (override.a === firstId && override.b === secondId)
      || (override.a === secondId && override.b === firstId);
  }

  function matchingOverrides(firstId, secondId) {
    return (global.DB?.compatibilityOverrides || [])
      .filter((override) => pairMatches(override, firstId, secondId))
      .sort((first, second) => (
        STATUS_PRIORITY[second.status] - STATUS_PRIORITY[first.status]
        || first.id.localeCompare(second.id)
      ));
  }

  function samePairSubjects(finding, firstId, secondId) {
    const subjects = new Set(finding?.subjects || []);
    return subjects.has(firstId) && subjects.has(secondId);
  }

  function supersededFinding(finding, firstId, secondId) {
    return GENERAL_PAIR_RULE_IDS.has(finding?.ruleId)
      && samePairSubjects(finding, firstId, secondId);
  }

  function pairIndex(result, firstId, secondId) {
    return (result.compat || []).findIndex((entry) => (
      (entry.a === firstId && entry.b === secondId)
      || (entry.a === secondId && entry.b === firstId)
    ));
  }

  function combineLocalized(overrides, field, lang) {
    return [...new Set(overrides
      .flatMap((override) => override[field] || [])
      .map((value) => localize(lang, value))
      .filter(Boolean))];
  }

  function findingFor(overrides, first, second, lang) {
    const primary = overrides[0];
    const rule = RULES[primary.status];
    const firstName = nameOf(first, lang);
    const secondName = nameOf(second, lang);
    const reasons = combineLocalized(overrides, 'reasons', lang);
    const conditions = combineLocalized(overrides, 'conditions', lang);
    const reason = reasons.join(' · ');
    const desc = conditions.length === 0
      ? reason
      : `${reason} · ${lang === 'en' ? 'Conditions' : 'Koşullar'}: ${conditions.join(' · ')}`;
    const impact = localize(lang, primary.impact);
    const resolution = localize(lang, primary.resolution);

    return {
      ruleId: rule.ruleId,
      severity: rule.severity,
      title: `${firstName} ↔ ${secondName}: ${lang === 'en' ? rule.en : rule.tr}`,
      desc,
      reason,
      impact,
      resolution,
      subjects: [first.id, second.id],
      evidence: {
        source: 'compatibility-override-engine-v1',
        overrideIds: overrides.map((override) => override.id),
        direction: primary.direction,
        status: primary.status,
        conditions,
        sourceIds: [...new Set(overrides.flatMap((override) => override.sourceIds || []))],
        verifiedAt: primary.verifiedAt,
        verificationStatus: primary?.verification?.status || 'verified',
        confidence: primary?.verification?.confidence || 'medium',
      },
    };
  }

  function compatFromFinding(finding, firstId, secondId, status) {
    const rule = RULES[status];
    return {
      a: firstId,
      b: secondId,
      status: rule.status,
      reasons: [finding.reason],
      ...finding,
    };
  }

  function verdict(score) {
    if (score >= 85) return 'excellent';
    if (score >= 65) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  function recalculateScore(result) {
    const issueCount = Array.isArray(result.issues) ? result.issues.length : 0;
    const warningCount = Array.isArray(result.warnings) ? result.warnings.length : 0;
    result.score = result.totalFish === 0
      ? 0
      : Math.max(0, 100 - issueCount * 25 - warningCount * 8);
    result.verdict = verdict(result.score);
    if (issueCount > 0 || result.score < 65) {
      result.tips = (result.tips || []).filter((finding) => finding?.ruleId !== 'COMPOSITION_HEALTHY');
    }
  }

  global.Engine.analyze = function analyzeWithCompatibilityOverrides(state) {
    const result = originalAnalyze(state);
    const lang = state?.lang === 'en' ? 'en' : 'tr';
    const byId = recordsById();
    const selections = (state?.fish || [])
      .map((selection) => byId.get(selection.id))
      .filter(Boolean);
    const applied = [];

    for (let firstIndex = 0; firstIndex < selections.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < selections.length; secondIndex += 1) {
        const first = selections[firstIndex];
        const second = selections[secondIndex];
        const overrides = matchingOverrides(first.id, second.id);
        if (overrides.length === 0) continue;

        const primary = overrides[0];
        const finding = findingFor(overrides, first, second, lang);
        result.issues = (result.issues || []).filter(
          (item) => !supersededFinding(item, first.id, second.id),
        );
        result.warnings = (result.warnings || []).filter(
          (item) => !supersededFinding(item, first.id, second.id),
        );
        result.tips = (result.tips || []).filter(
          (item) => !supersededFinding(item, first.id, second.id),
        );

        if (finding.severity === 'critical') result.issues.push(finding);
        else if (finding.severity === 'warning') result.warnings.push(finding);
        else result.tips.push(finding);

        const index = pairIndex(result, first.id, second.id);
        const compat = compatFromFinding(finding, first.id, second.id, primary.status);
        if (index >= 0) result.compat[index] = compat;
        else result.compat.push(compat);

        applied.push({
          overrideIds: overrides.map((override) => override.id),
          a: first.id,
          b: second.id,
          direction: primary.direction,
          status: primary.status,
          ruleId: finding.ruleId,
          sourceIds: finding.evidence.sourceIds,
        });
      }
    }

    recalculateScore(result);
    result.pairOverrides = {
      version: 1,
      available: (global.DB?.compatibilityOverrides || []).length,
      applied,
    };
    return result;
  };

  global.Engine.compatibilityOverrideRulesVersion = 1;
  global.Engine.compatibilityOverrideRuleIds = RULE_IDS;
})(window);
