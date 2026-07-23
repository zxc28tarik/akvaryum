// AKVARYUM — explainable four-part score

(function attachEngineScoreBreakdown(global) {
  'use strict';

  if (!global.Engine || typeof global.Engine.analyze !== 'function') {
    throw new Error('Dört alt puan sistemi, window.Engine.analyze bulunmadan yüklenemez.');
  }

  const VERSION = 1;
  const originalAnalyze = global.Engine.analyze.bind(global.Engine);

  const SECTION_DEFINITIONS = Object.freeze({
    environmental: Object.freeze({
      maxScore: 30,
      warningPenalty: 5,
      capOnCritical: 39,
      label: Object.freeze({ tr: 'Çevresel uyum', en: 'Environmental compatibility' }),
    }),
    behavior: Object.freeze({
      maxScore: 30,
      warningPenalty: 6,
      capOnCritical: 49,
      label: Object.freeze({ tr: 'Davranış ve sosyal uyum', en: 'Behavioral and social compatibility' }),
    }),
    tank: Object.freeze({
      maxScore: 25,
      warningPenalty: 7,
      capOnCritical: 59,
      label: Object.freeze({ tr: 'Tank ve biyolojik yük', en: 'Tank and bioload' }),
    }),
    habitat: Object.freeze({
      maxScore: 15,
      warningPenalty: 4,
      capOnCritical: 69,
      label: Object.freeze({ tr: 'Habitat ve bakım uyumu', en: 'Habitat and care compatibility' }),
    }),
  });

  const ENVIRONMENTAL_RULE_IDS = new Set([
    'WATER_TYPE_MISMATCH',
    'PARAMETER_PH_NO_COMMON_RANGE',
    'PARAMETER_TEMPERATURE_NO_COMMON_RANGE',
    'PARAMETER_GH_NO_COMMON_RANGE',
  ]);
  const TANK_RULE_IDS = new Set([
    'TANK_CAPACITY_EXCEEDED',
    'TANK_CAPACITY_HIGH',
    'SPECIES_MINIMUM_VOLUME',
  ]);
  const HABITAT_RULE_IDS = new Set([
    'PLANT_DAMAGE_RISK',
    'SUBSTRATE_WATER_MISMATCH',
    'REEF_UNSAFE_INHABITANT',
    'REEF_SOFT_CORAL_RISK',
    'REEF_LPS_CORAL_RISK',
    'REEF_SPS_CORAL_RISK',
    'REEF_SHRIMP_RISK',
    'REEF_SNAIL_RISK',
    'REEF_CRAB_RISK',
    'REEF_CLAM_RISK',
  ]);
  const BEHAVIOR_PREFIXES = Object.freeze([
    'SOCIAL_',
    'CONSPECIFIC_',
    'CONGENERIC_',
    'PREDATION_',
    'PAIR_OVERRIDE_',
  ]);
  const ENVIRONMENTAL_TEXT = /pH|sıcaklık|temperature|su sertliği|hardness|su tipi|water type/i;

  function localize(lang, values) {
    return values[lang === 'en' ? 'en' : 'tr'];
  }

  function verdictFor(score) {
    if (score >= 85) return 'excellent';
    if (score >= 65) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  function findingSection(finding) {
    const ruleId = String(finding?.ruleId || '');
    if (ENVIRONMENTAL_RULE_IDS.has(ruleId)) return 'environmental';
    if (TANK_RULE_IDS.has(ruleId)) return 'tank';
    if (HABITAT_RULE_IDS.has(ruleId) || ruleId.startsWith('REEF_')) return 'habitat';
    if (BEHAVIOR_PREFIXES.some((prefix) => ruleId.startsWith(prefix))) return 'behavior';
    if (ruleId === 'SCHOOLING_MINIMUM') return 'behavior';
    if (ruleId === 'PAIRWISE_INCOMPATIBLE' || ruleId === 'PAIRWISE_CAUTION') {
      const text = `${finding?.reason || ''} ${finding?.desc || ''}`;
      return ENVIRONMENTAL_TEXT.test(text) ? 'environmental' : 'behavior';
    }
    return null;
  }

  function findingsBySection(result) {
    const sections = {
      environmental: { critical: [], warning: [] },
      behavior: { critical: [], warning: [] },
      tank: { critical: [], warning: [] },
      habitat: { critical: [], warning: [] },
    };
    for (const finding of result?.issues || []) {
      const section = findingSection(finding);
      if (section) sections[section].critical.push(finding);
    }
    for (const finding of result?.warnings || []) {
      const section = findingSection(finding);
      if (section) sections[section].warning.push(finding);
    }
    return sections;
  }

  function tankDomainSeverity(result) {
    const statuses = [
      result?.domains?.volume?.status,
      result?.domains?.bioload?.status,
    ];
    if (statuses.includes('critical')) return 'critical';
    if (statuses.includes('warning')) return 'warning';
    if (statuses.includes('good')) return 'good';
    return 'not_evaluated';
  }

  function summary(sectionKey, status, score, maxScore, lang) {
    const sectionName = localize(lang, SECTION_DEFINITIONS[sectionKey].label);
    const messages = {
      not_evaluated: {
        tr: `${sectionName} henüz değerlendirilemedi.`,
        en: `${sectionName} could not be evaluated yet.`,
      },
      critical: {
        tr: `${sectionName} bölümünde kritik bir sorun var; bu bölüm 0 puan aldı.`,
        en: `${sectionName} has a critical issue, so this section received 0 points.`,
      },
      warning: {
        tr: `${sectionName} bölümünde düzeltilmesi gereken uyarılar var (${score}/${maxScore}).`,
        en: `${sectionName} has warnings that should be addressed (${score}/${maxScore}).`,
      },
      good: {
        tr: `${sectionName} için mevcut kurallarda belirgin sorun bulunmadı (${score}/${maxScore}).`,
        en: `No clear issue was found for ${sectionName} under the current rules (${score}/${maxScore}).`,
      },
    };
    return localize(lang, messages[status]);
  }

  function buildSection(sectionKey, findings, evaluated, forcedSeverity, lang) {
    const definition = SECTION_DEFINITIONS[sectionKey];
    const criticalCount = findings.critical.length;
    const warningCount = findings.warning.length;
    let status = criticalCount > 0 || forcedSeverity === 'critical'
      ? 'critical'
      : warningCount > 0 || forcedSeverity === 'warning'
        ? 'warning'
        : evaluated
          ? 'good'
          : 'not_evaluated';

    if (!evaluated) status = 'not_evaluated';

    let score = 0;
    if (status === 'good') score = definition.maxScore;
    if (status === 'warning') {
      const effectiveWarningCount = Math.max(1, warningCount);
      score = Math.max(0, definition.maxScore - effectiveWarningCount * definition.warningPenalty);
    }

    const ruleIds = [...new Set([
      ...findings.critical.map((finding) => finding.ruleId),
      ...findings.warning.map((finding) => finding.ruleId),
    ].filter(Boolean))];

    return {
      key: sectionKey,
      label: localize(lang, definition.label),
      score,
      maxScore: definition.maxScore,
      status,
      criticalCount,
      warningCount,
      ruleIds,
      summary: summary(sectionKey, status, score, definition.maxScore, lang),
    };
  }

  function criticalCaps(sections, lang) {
    return Object.values(sections)
      .filter((section) => section.status === 'critical')
      .map((section) => {
        const definition = SECTION_DEFINITIONS[section.key];
        return {
          section: section.key,
          maxTotal: definition.capOnCritical,
          reason: lang === 'en'
            ? `${section.label} contains a critical issue.`
            : `${section.label} bölümünde kritik sorun var.`,
        };
      });
  }

  function removeMisleadingHealthyTip(result) {
    if (!Array.isArray(result?.tips)) return;
    const hasCritical = Object.values(result.scoreBreakdown.sections)
      .some((section) => section.status === 'critical');
    if (!hasCritical && result.score >= 65) return;
    result.tips = result.tips.filter((finding) => finding?.ruleId !== 'COMPOSITION_HEALTHY');
  }

  global.Engine.analyze = function analyzeWithScoreBreakdown(state) {
    const result = originalAnalyze(state);
    const lang = state?.lang === 'en' ? 'en' : 'tr';
    const hasInhabitants = Number(result?.totalFish || 0) > 0;
    const grouped = findingsBySection(result);
    const tankSeverity = tankDomainSeverity(result);

    const sections = {
      environmental: buildSection('environmental', grouped.environmental, hasInhabitants, null, lang),
      behavior: buildSection('behavior', grouped.behavior, hasInhabitants, null, lang),
      tank: buildSection(
        'tank',
        grouped.tank,
        hasInhabitants && tankSeverity !== 'not_evaluated',
        tankSeverity,
        lang,
      ),
      habitat: buildSection('habitat', grouped.habitat, hasInhabitants, null, lang),
    };

    const uncappedScore = Object.values(sections)
      .reduce((total, section) => total + section.score, 0);
    const caps = criticalCaps(sections, lang);
    const appliedCap = caps.length > 0
      ? Math.min(...caps.map((cap) => cap.maxTotal))
      : null;
    const score = hasInhabitants
      ? Math.max(0, Math.min(100, appliedCap === null ? uncappedScore : Math.min(uncappedScore, appliedCap)))
      : 0;

    result.scoreBreakdown = {
      version: VERSION,
      score,
      maxScore: 100,
      uncappedScore,
      appliedCap,
      caps,
      sections,
    };
    result.score = score;
    result.verdict = verdictFor(score);
    removeMisleadingHealthyTip(result);
    return result;
  };

  global.Engine.scoreBreakdownVersion = VERSION;
  global.Engine.scoreSectionMaximums = Object.freeze(
    Object.fromEntries(
      Object.entries(SECTION_DEFINITIONS).map(([key, value]) => [key, value.maxScore]),
    ),
  );
})(window);
