// AKVARYUM — critical result and essential behavior guard

(function attachEngineHealthGuard() {
  if (!window.Engine || typeof window.Engine.analyze !== 'function') {
    throw new Error('Motor sağlık koruması, window.Engine.analyze bulunmadan yüklenemez.');
  }

  const HEALTHY_RULE_ID = 'COMPOSITION_HEALTHY';
  const HEALTHY_TITLES = new Set(['Güzel kompozisyon', 'Nice composition']);
  const originalAnalyze = window.Engine.analyze.bind(window.Engine);

  function isHealthyCompositionTip(item) {
    return item?.ruleId === HEALTHY_RULE_ID || HEALTHY_TITLES.has(item?.title);
  }

  function verdictFor(score) {
    if (score >= 85) return 'excellent';
    if (score >= 65) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  function recalculateScore(result) {
    const issueCount = Array.isArray(result.issues) ? result.issues.length : 0;
    const warningCount = Array.isArray(result.warnings) ? result.warnings.length : 0;
    result.score = result.totalFish === 0 ? 0 : Math.max(0, 100 - issueCount * 25 - warningCount * 8);
    result.verdict = verdictFor(result.score);
  }

  function multipleBettaReason(lang) {
    return lang === 'en' ? 'Multiple bettas fight' : 'Birden fazla beta savaşır';
  }

  function pairTitle(fish, lang) {
    const name = lang === 'en' ? fish.nameEn : fish.nameTr;
    return `${name} ↔ ${name} ${lang === 'en' ? 'incompatible' : 'uyumsuz'}`;
  }

  function structuredPairFinding(fish, lang, reason, quantity) {
    return {
      a: fish.id,
      b: fish.id,
      status: 'bad',
      reasons: [reason],
      ruleId: 'PAIRWISE_INCOMPATIBLE',
      severity: 'critical',
      title: pairTitle(fish, lang),
      desc: reason,
      reason,
      impact: lang === 'en'
        ? 'There is a serious health or safety risk in the same tank.'
        : 'Aynı tankta ciddi sağlık veya güvenlik riski vardır.',
      resolution: lang === 'en'
        ? 'Keep only one betta or use separate tanks.'
        : 'Yalnız bir beta tut veya ayrı akvaryumlar kullan.',
      subjects: [fish.id],
      evidence: {
        source: 'engine-health-guard-v2',
        status: 'bad',
        reasonCount: 1,
        quantity,
      },
    };
  }

  function structuredIssue(fish, lang, reason, quantity) {
    const pair = structuredPairFinding(fish, lang, reason, quantity);
    return {
      ruleId: pair.ruleId,
      severity: pair.severity,
      title: pair.title,
      desc: pair.desc,
      reason: pair.reason,
      impact: pair.impact,
      resolution: pair.resolution,
      subjects: pair.subjects,
      evidence: pair.evidence,
    };
  }

  function rawPairFinding(fish, reason) {
    return { a: fish.id, b: fish.id, status: 'bad', reasons: [reason] };
  }

  function rawIssue(fish, lang, reason) {
    return { title: pairTitle(fish, lang), desc: reason };
  }

  function applyMultipleBettaGuard(result, state) {
    const betta = (result?.fishItems || []).find((fish) => fish.id === 'betta' && fish.qty > 1);
    if (!betta || !Array.isArray(result.issues) || !Array.isArray(result.compat)) return;

    const alreadyApplied = result.issues.some((item) => (
      item?.ruleId === 'PAIRWISE_INCOMPATIBLE'
      && Array.isArray(item.subjects)
      && item.subjects.includes('betta')
      && item?.evidence?.quantity > 1
    ));
    if (alreadyApplied) return;

    const lang = state?.lang === 'en' ? 'en' : 'tr';
    const reason = multipleBettaReason(lang);
    const hasContract = Array.isArray(window.Engine.findingRuleIds);
    const issue = hasContract
      ? structuredIssue(betta, lang, reason, betta.qty)
      : rawIssue(betta, lang, reason);
    const compat = hasContract
      ? structuredPairFinding(betta, lang, reason, betta.qty)
      : rawPairFinding(betta, reason);

    result.issues.push(issue);
    const selfIndex = result.compat.findIndex((item) => item.a === 'betta' && item.b === 'betta');
    if (selfIndex >= 0) result.compat[selfIndex] = compat;
    else result.compat.push(compat);

    recalculateScore(result);
  }

  window.Engine.analyze = function analyzeWithEssentialGuards(state) {
    const result = originalAnalyze(state);

    applyMultipleBettaGuard(result, state);

    if (Array.isArray(result?.issues) && result.issues.length > 0 && Array.isArray(result.tips)) {
      result.tips = result.tips.filter((item) => !isHealthyCompositionTip(item));
    }

    return result;
  };

  window.Engine.healthGuardVersion = 2;
})();
