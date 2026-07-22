// AKVARYUM — source-backed predator/prey rules

(function attachEnginePredatorPreyRules(global) {
  'use strict';

  if (!global.Engine || typeof global.Engine.analyze !== 'function') {
    throw new Error('Avcı-av kuralları, window.Engine.analyze bulunmadan yüklenemez.');
  }

  const VERSION = 1;
  const RULE_IDS = Object.freeze(['PREDATION_SIZE_RISK']);
  const LEGACY_PREDATION_TEXT = /avlayabilir|may prey on/i;
  const CRITICAL_REASON_TEXT = /pH çakışmıyor|pH mismatch|Sıcaklık çakışmıyor|Temperature mismatch|Farklı palyaço türleri savaşır|Different clownfish species fight|Birden fazla beta savaşır|Multiple bettas fight/i;
  const originalAnalyze = global.Engine.analyze.bind(global.Engine);

  function localize(lang, tr, en) {
    return lang === 'en' ? en : tr;
  }

  function verdict(score) {
    if (score >= 85) return 'excellent';
    if (score >= 65) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  function splitReasons(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    return String(value || '')
      .split(' · ')
      .map((reason) => reason.trim())
      .filter(Boolean);
  }

  function unique(values) {
    return [...new Set(values.filter(Boolean))];
  }

  function recordsById() {
    const records = new Map();
    for (const record of global.DB?.fish || []) records.set(record.id, record);
    for (const record of global.DB?.inhabitants || []) records.set(record.id, record);
    return records;
  }

  function profilesByPredator() {
    return new Map((global.DB?.predatorPreyProfiles || []).map((profile) => [profile.predatorId, profile]));
  }

  function nameOf(record, lang) {
    if (lang === 'en') return record?.name?.en || record?.nameEn || record?.name?.tr || record?.nameTr || record?.id;
    return record?.name?.tr || record?.nameTr || record?.name?.en || record?.nameEn || record?.id;
  }

  function minimumAdultLengthCm(record) {
    const canonical = record?.size?.adultCm;
    if (Array.isArray(canonical) && canonical.length === 2) {
      const value = Number(canonical[0]);
      return Number.isFinite(value) && value > 0 ? value : null;
    }
    const legacy = Number(record?.size);
    return Number.isFinite(legacy) && legacy > 0 ? legacy : null;
  }

  function profileSeverity(profile) {
    return profile?.verification?.status === 'verified'
      && profile?.verification?.confidence === 'high'
      ? 'critical'
      : 'warning';
  }

  function evaluateProfile(profile, prey) {
    const safe = new Set(profile?.safeSpeciesIds || []);
    const risky = new Set(profile?.riskySpeciesIds || []);
    const preyLengthCm = minimumAdultLengthCm(prey);

    if (safe.has(prey.id)) {
      return {
        evaluated: true,
        risk: false,
        method: 'safe_species_exception',
        preyLengthCm,
      };
    }
    if (risky.has(prey.id)) {
      return {
        evaluated: true,
        risk: true,
        method: 'risky_species_exception',
        preyLengthCm,
      };
    }

    const thresholdCm = Number(profile?.maxSwallowablePreyLengthCm);
    if (!(preyLengthCm > 0) || !(thresholdCm > 0)) {
      return { evaluated: false, risk: false, method: 'missing_size_data', preyLengthCm };
    }

    return {
      evaluated: true,
      risk: preyLengthCm <= thresholdCm,
      method: 'source_backed_length_threshold',
      preyLengthCm,
    };
  }

  function pairIndex(result, firstId, secondId) {
    return (result.compat || []).findIndex((entry) => (
      (entry.a === firstId && entry.b === secondId)
      || (entry.a === secondId && entry.b === firstId)
    ));
  }

  function samePairSubjects(finding, firstId, secondId) {
    const subjects = Array.isArray(finding?.subjects) ? finding.subjects : [];
    if (subjects.length !== 2) return false;
    return subjects.includes(firstId) && subjects.includes(secondId);
  }

  function isPairwiseBucketFinding(finding) {
    return finding?.ruleId === 'PAIRWISE_INCOMPATIBLE' || finding?.ruleId === 'PAIRWISE_CAUTION';
  }

  function legacyPredationReasonFor(reason, predator, prey, lang) {
    if (!LEGACY_PREDATION_TEXT.test(String(reason || ''))) return false;
    const predatorName = nameOf(predator, lang);
    const preyName = nameOf(prey, lang);
    const text = String(reason || '');
    return text.includes(predatorName) && text.includes(preyName);
  }

  function genericPairFinding(first, second, reasons, status, lang) {
    const firstName = nameOf(first, lang);
    const secondName = nameOf(second, lang);
    const severity = status === 'bad' ? 'critical' : 'warning';
    const ruleId = status === 'bad' ? 'PAIRWISE_INCOMPATIBLE' : 'PAIRWISE_CAUTION';
    const reason = reasons.join(' · ');
    return {
      ruleId,
      severity,
      title: status === 'bad'
        ? localize(lang, `${firstName} ↔ ${secondName} uyumsuz`, `${firstName} ↔ ${secondName} incompatible`)
        : localize(lang, `${firstName} ↔ ${secondName} dikkat`, `${firstName} ↔ ${secondName} caution`),
      desc: reason,
      reason,
      impact: status === 'bad'
        ? localize(lang, 'Aynı tankta ciddi sağlık veya güvenlik riski vardır.', 'There is a serious health or safety risk in the same tank.')
        : localize(lang, 'Koşullara bağlı stres, yaralanma veya çatışma oluşabilir.', 'Condition-dependent stress, injury, or conflict may occur.'),
      resolution: status === 'bad'
        ? localize(lang, 'Bu ikiliyi değiştir veya ayrı tanklarda tut.', 'Change this pair or keep them in separate tanks.')
        : localize(lang, 'Tank boyutunu, saklanma alanlarını ve davranışı yakından izle.', 'Closely monitor tank size, cover, and behavior.'),
      subjects: [first.id, second.id],
      evidence: {
        source: 'predator-prey-engine-v1',
        status,
        reasonCount: reasons.length,
        retainedLegacyReasons: true,
      },
    };
  }

  function predationFinding(predator, prey, profile, evaluation, lang) {
    const predatorName = nameOf(predator, lang);
    const preyName = nameOf(prey, lang);
    const severity = profileSeverity(profile);
    const methodText = evaluation.method === 'risky_species_exception'
      ? localize(lang, 'kaynaklı risk istisnasında', 'in the sourced risk exception')
      : localize(lang, 'kaynaklı av boyu eşiğinde', 'under the sourced prey-size threshold');
    const reason = localize(
      lang,
      `${predatorName}, ${preyName} için ${methodText} av riski taşıyor. Ağız genişliği ${profile.mouthWidthCm} cm, kayıtlı en büyük yutulabilir av boyu ${profile.maxSwallowablePreyLengthCm} cm${evaluation.preyLengthCm ? `, avın yetişkin alt boyu ${evaluation.preyLengthCm} cm` : ''}.`,
      `${predatorName} presents a predation risk to ${preyName} ${methodText}. Mouth width is ${profile.mouthWidthCm} cm, the recorded maximum swallowable prey length is ${profile.maxSwallowablePreyLengthCm} cm${evaluation.preyLengthCm ? `, and the prey adult lower length is ${evaluation.preyLengthCm} cm` : ''}.`,
    );

    return {
      ruleId: 'PREDATION_SIZE_RISK',
      severity,
      title: localize(lang, `${predatorName} → ${preyName}: av riski`, `${predatorName} → ${preyName}: predation risk`),
      desc: reason,
      reason,
      impact: localize(
        lang,
        'Av canlısı yenebilir, ağır yaralanabilir veya sürekli saklanma stresi yaşayabilir.',
        'The prey may be eaten, seriously injured, or subjected to persistent hiding stress.',
      ),
      resolution: localize(
        lang,
        'Bu ikiliyi ayrı tut veya avcının kayıtlı yutma eşiğinin belirgin biçimde üzerinde bir tank arkadaşı seç.',
        'Keep this pair separate or choose a tank mate clearly above the predator’s recorded swallowable-size threshold.',
      ),
      subjects: [predator.id, prey.id],
      evidence: {
        source: 'predator-prey-engine-v1',
        relationship: 'predator_to_prey',
        method: evaluation.method,
        predatorId: predator.id,
        preyId: prey.id,
        mouthWidthCm: profile.mouthWidthCm,
        maxSwallowablePreyLengthCm: profile.maxSwallowablePreyLengthCm,
        preyAdultLowerLengthCm: evaluation.preyLengthCm,
        profileSourceIds: [...(profile.sourceIds || [])],
        verificationStatus: profile?.verification?.status || 'reviewed',
        confidence: profile?.verification?.confidence || 'medium',
      },
    };
  }

  function compatFinding(first, second, reasons, status, evaluations, lang, existing) {
    const firstName = nameOf(first, lang);
    const secondName = nameOf(second, lang);
    const statusLabel = status === 'bad'
      ? localize(lang, 'uyumsuz', 'incompatible')
      : status === 'warn'
        ? localize(lang, 'dikkat', 'caution')
        : localize(lang, 'uyumlu', 'compatible');
    const severity = status === 'bad' ? 'critical' : status === 'warn' ? 'warning' : 'info';
    const ruleId = status === 'bad' ? 'PAIRWISE_INCOMPATIBLE' : status === 'warn' ? 'PAIRWISE_CAUTION' : 'PAIRWISE_COMPATIBLE';
    const reason = reasons.length > 0
      ? reasons.join(' · ')
      : localize(lang, 'Belirgin uyumsuzluk bulunmadı.', 'No clear incompatibility was found.');

    return {
      ...existing,
      a: first.id,
      b: second.id,
      status,
      reasons,
      ruleId,
      severity,
      title: `${firstName} ↔ ${secondName} ${statusLabel}`,
      desc: reason,
      reason,
      impact: status === 'bad'
        ? localize(lang, 'Aynı tankta ciddi sağlık veya güvenlik riski vardır.', 'There is a serious health or safety risk in the same tank.')
        : status === 'warn'
          ? localize(lang, 'Koşullara bağlı stres, yaralanma veya çatışma oluşabilir.', 'Condition-dependent stress, injury, or conflict may occur.')
          : localize(lang, 'Mevcut kurallara göre temel uyumluluk kabul edilebilir.', 'Basic compatibility is acceptable under the current rules.'),
      resolution: status === 'bad'
        ? localize(lang, 'Bu ikiliyi değiştir veya ayrı tanklarda tut.', 'Change this pair or keep them in separate tanks.')
        : status === 'warn'
          ? localize(lang, 'Tank boyutunu, saklanma alanlarını ve davranışı yakından izle.', 'Closely monitor tank size, cover, and behavior.')
          : localize(lang, 'Düzenli gözleme devam et.', 'Continue routine observation.'),
      subjects: [first.id, second.id],
      evidence: {
        ...(existing?.evidence || {}),
        source: 'predator-prey-engine-v1',
        status,
        reasonCount: reasons.length,
        predationEvaluations: evaluations,
      },
    };
  }

  function recalculateScore(result) {
    const issueCount = Array.isArray(result.issues) ? result.issues.length : 0;
    const warningCount = Array.isArray(result.warnings) ? result.warnings.length : 0;
    result.score = result.totalFish === 0 ? 0 : Math.max(0, 100 - issueCount * 25 - warningCount * 8);
    result.verdict = verdict(result.score);
    if (issueCount > 0 && Array.isArray(result.tips)) {
      result.tips = result.tips.filter((tip) => tip?.ruleId !== 'COMPOSITION_HEALTHY');
    }
  }

  global.Engine.analyze = function analyzeWithPredatorPreyRules(state) {
    const result = originalAnalyze(state);
    const lang = state?.lang === 'en' ? 'en' : 'tr';
    const byId = recordsById();
    const profileMap = profilesByPredator();
    const selections = (state?.fish || [])
      .map((selection) => ({ ...selection, record: byId.get(selection.id) }))
      .filter((selection) => selection.record && Number(selection.qty || 0) > 0);
    let changed = false;

    for (let firstIndex = 0; firstIndex < selections.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < selections.length; secondIndex += 1) {
        const first = selections[firstIndex].record;
        const second = selections[secondIndex].record;
        const index = pairIndex(result, first.id, second.id);
        if (index < 0) continue;

        const existingCompat = result.compat[index];
        const originalReasons = splitReasons(existingCompat.reasons);
        const criticalReasons = new Set();
        const warningReasons = new Set();

        for (const finding of result.issues || []) {
          if (finding?.ruleId === 'PAIRWISE_INCOMPATIBLE' && samePairSubjects(finding, first.id, second.id)) {
            for (const reason of splitReasons(finding.reason || finding.desc)) criticalReasons.add(reason);
          }
        }
        for (const finding of result.warnings || []) {
          if (finding?.ruleId === 'PAIRWISE_CAUTION' && samePairSubjects(finding, first.id, second.id)) {
            for (const reason of splitReasons(finding.reason || finding.desc)) warningReasons.add(reason);
          }
        }

        const directional = [
          { predator: first, prey: second, profile: profileMap.get(first.id) },
          { predator: second, prey: first, profile: profileMap.get(second.id) },
        ];
        const evaluations = [];
        const findings = [];
        let reasons = [...originalReasons];

        for (const direction of directional) {
          if (!direction.profile) continue;
          const evaluation = evaluateProfile(direction.profile, direction.prey);
          if (!evaluation.evaluated) continue;

          evaluations.push({
            predatorId: direction.predator.id,
            preyId: direction.prey.id,
            method: evaluation.method,
            risk: evaluation.risk,
            mouthWidthCm: direction.profile.mouthWidthCm,
            maxSwallowablePreyLengthCm: direction.profile.maxSwallowablePreyLengthCm,
            preyAdultLowerLengthCm: evaluation.preyLengthCm,
            verificationStatus: direction.profile?.verification?.status || 'reviewed',
            confidence: direction.profile?.verification?.confidence || 'medium',
          });

          reasons = reasons.filter((reason) => !legacyPredationReasonFor(
            reason,
            direction.predator,
            direction.prey,
            lang,
          ));

          if (evaluation.risk) {
            const finding = predationFinding(
              direction.predator,
              direction.prey,
              direction.profile,
              evaluation,
              lang,
            );
            findings.push(finding);
            reasons.push(finding.reason);
          }
        }

        if (evaluations.length === 0) continue;
        changed = true;

        result.issues = (result.issues || []).filter((finding) => !(
          isPairwiseBucketFinding(finding) && samePairSubjects(finding, first.id, second.id)
        ));
        result.warnings = (result.warnings || []).filter((finding) => !(
          isPairwiseBucketFinding(finding) && samePairSubjects(finding, first.id, second.id)
        ));

        const specificReasons = new Set(findings.map((finding) => finding.reason));
        const retainedReasons = unique(reasons.filter((reason) => !specificReasons.has(reason)));
        const retainedCritical = retainedReasons.some((reason) => (
          criticalReasons.has(reason) || CRITICAL_REASON_TEXT.test(reason)
        ));
        const retainedWarning = retainedReasons.length > 0 && !retainedCritical;

        if (retainedReasons.length > 0) {
          const status = retainedCritical ? 'bad' : 'warn';
          const genericFinding = genericPairFinding(first, second, retainedReasons, status, lang);
          if (retainedCritical) result.issues.push(genericFinding);
          else if (retainedWarning) result.warnings.push(genericFinding);
        }

        for (const finding of findings) {
          if (finding.severity === 'critical') result.issues.push(finding);
          else result.warnings.push(finding);
        }

        const specificCritical = findings.some((finding) => finding.severity === 'critical');
        const specificWarning = findings.some((finding) => finding.severity === 'warning');
        const finalStatus = retainedCritical || specificCritical
          ? 'bad'
          : retainedWarning || specificWarning
            ? 'warn'
            : 'ok';

        result.compat[index] = compatFinding(
          first,
          second,
          unique(reasons),
          finalStatus,
          evaluations,
          lang,
          existingCompat,
        );
      }
    }

    if (changed) recalculateScore(result);
    return result;
  };

  global.Engine.predatorPreyRulesVersion = VERSION;
  global.Engine.predatorPreyRuleIds = RULE_IDS;
})(window);
