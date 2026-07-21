// AKVARYUM — critical result health guard

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

  window.Engine.analyze = function analyzeWithCriticalHealthGuard(state) {
    const result = originalAnalyze(state);

    if (Array.isArray(result?.issues) && result.issues.length > 0 && Array.isArray(result.tips)) {
      result.tips = result.tips.filter((item) => !isHealthyCompositionTip(item));
    }

    return result;
  };

  window.Engine.healthGuardVersion = 1;
})();
