// AKVARYUM — social structure rules

(function attachEngineSocialRules(global) {
  'use strict';

  if (!global.Engine || typeof global.Engine.analyze !== 'function') {
    throw new Error('Sosyal yapı kuralları, window.Engine.analyze bulunmadan yüklenemez.');
  }

  const RULE_IDS = Object.freeze([
    'SOCIAL_GROUP_MINIMUM',
    'SOCIAL_PAIR_COUNT',
    'SOCIAL_HAREM_MINIMUM',
    'SOCIAL_SEX_RATIO',
  ]);

  const originalAnalyze = global.Engine.analyze.bind(global.Engine);

  function localize(lang, tr, en) {
    return lang === 'en' ? en : tr;
  }

  function canonicalRecord(id) {
    return (global.DB?.inhabitants || []).find((record) => record.id === id)
      || (global.DB?.fish || []).find((record) => record.id === id)
      || null;
  }

  function recordName(record, lang) {
    if (lang === 'en') return record?.name?.en || record?.nameEn || record?.name?.tr || record?.nameTr || record?.id;
    return record?.name?.tr || record?.nameTr || record?.name?.en || record?.nameEn || record?.id;
  }

  function socialMode(record) {
    if (record?.social?.mode) return record.social.mode;
    const schooling = Number(record?.schooling || 0);
    if (schooling >= 6) return 'school';
    if (schooling >= 2) return 'group';
    return 'solitary';
  }

  function minGroup(record) {
    const value = Number(record?.social?.minGroup ?? record?.schooling ?? 0);
    return Number.isInteger(value) && value > 0 ? value : 0;
  }

  function hasExistingMinimumWarning(result, id, name) {
    return (result.warnings || []).some((finding) => {
      if (finding?.ruleId === 'SCHOOLING_MINIMUM' && finding?.subjects?.includes?.(id)) return true;
      const title = String(finding?.title || '');
      return title.includes(name) && (/sürü balığı|schooling \(min/i.test(title));
    });
  }

  function finding(ruleId, title, reason, impact, resolution, id, evidence) {
    return {
      ruleId,
      severity: 'warning',
      title,
      desc: reason,
      reason,
      impact,
      resolution,
      subjects: [id],
      evidence: {
        source: 'social-structure-engine-v1',
        ...evidence,
      },
    };
  }

  function groupMinimumFinding(record, selection, lang, mode, minimum) {
    const name = recordName(record, lang);
    const modeTr = mode === 'school' ? 'sürü' : mode === 'colony' ? 'koloni' : 'grup';
    const modeEn = mode === 'school' ? 'school' : mode === 'colony' ? 'colony' : 'group';
    return finding(
      'SOCIAL_GROUP_MINIMUM',
      localize(lang, `${name}: en az ${minimum} bireylik ${modeTr} gerekli`, `${name}: a ${modeEn} of at least ${minimum} is required`),
      localize(lang, `Seçilen adet ${selection.qty}; kayıtlı minimum ${minimum}.`, `Selected quantity is ${selection.qty}; the recorded minimum is ${minimum}.`),
      localize(lang, 'Yetersiz grup büyüklüğü stres, saklanma ve anormal davranış oluşturabilir.', 'An undersized social group can cause stress, hiding, and abnormal behavior.'),
      localize(lang, `Adedi en az ${minimum} yap veya bu canlıyı kurulumdan çıkar.`, `Raise the quantity to at least ${minimum} or remove this inhabitant.`),
      record.id,
      { socialMode: mode, selectedQuantity: selection.qty, minimumQuantity: minimum },
    );
  }

  function pairFinding(record, selection, lang) {
    const name = recordName(record, lang);
    return finding(
      'SOCIAL_PAIR_COUNT',
      localize(lang, `${name}: çift olarak 2 birey tutulmalı`, `${name}: keep exactly 2 as a pair`),
      localize(lang, `Seçilen adet ${selection.qty}; sosyal yapı çift olarak kayıtlı.`, `Selected quantity is ${selection.qty}; the recorded social mode is pair.`),
      localize(lang, 'Eksik veya fazla birey eşleşme stresi ve aynı tür çatışması oluşturabilir.', 'Too few or too many individuals may cause pairing stress and conspecific conflict.'),
      localize(lang, 'Adedi 2 yap veya farklı bir sosyal kurulum seç.', 'Set the quantity to 2 or choose a different social setup.'),
      record.id,
      { socialMode: 'pair', selectedQuantity: selection.qty, requiredQuantity: 2 },
    );
  }

  function haremFinding(record, selection, lang, minimum) {
    const name = recordName(record, lang);
    return finding(
      'SOCIAL_HAREM_MINIMUM',
      localize(lang, `${name}: harem için en az ${minimum} birey gerekli`, `${name}: at least ${minimum} are required for a harem`),
      localize(lang, `Seçilen adet ${selection.qty}; kayıtlı harem minimumu ${minimum}.`, `Selected quantity is ${selection.qty}; the recorded harem minimum is ${minimum}.`),
      localize(lang, 'Yetersiz harem büyüklüğü baskının tek birey üzerinde yoğunlaşmasına yol açabilir.', 'An undersized harem can concentrate social pressure on one individual.'),
      localize(lang, `Adedi en az ${minimum} yap veya türü kurulumdan çıkar.`, `Raise the quantity to at least ${minimum} or remove the species.`),
      record.id,
      { socialMode: 'harem', selectedQuantity: selection.qty, minimumQuantity: minimum },
    );
  }

  function sexRatioFinding(record, selection, lang, requirement) {
    const name = recordName(record, lang);
    const maleQty = Number(selection.maleQty || 0);
    const femaleQty = Number(selection.femaleQty || 0);
    return finding(
      'SOCIAL_SEX_RATIO',
      localize(lang, `${name}: erkek–dişi oranı uygun değil`, `${name}: male–female ratio is unsuitable`),
      localize(
        lang,
        `Seçimde ${maleQty} erkek ve ${femaleQty} dişi var; kayıtlı alt sınır ${requirement.minMales} erkek / ${requirement.minFemales} dişi.`,
        `The selection has ${maleQty} male and ${femaleQty} female; the recorded minimum is ${requirement.minMales} male / ${requirement.minFemales} female.`,
      ),
      localize(lang, 'Yanlış cinsiyet oranı eş baskısı, kavga ve yaralanma riskini artırabilir.', 'An unsuitable sex ratio can increase mate pressure, fighting, and injury risk.'),
      localize(lang, 'Kayıtlı erkek–dişi alt ve üst sınırlarına uygun seçim yap.', 'Adjust the selection to the recorded male–female limits.'),
      record.id,
      {
        socialMode: socialMode(record),
        maleQuantity: maleQty,
        femaleQuantity: femaleQty,
        requirement,
      },
    );
  }

  function sexRatioViolated(selection, requirement) {
    if (!requirement || !Number.isFinite(Number(selection.maleQty)) || !Number.isFinite(Number(selection.femaleQty))) return false;
    const males = Number(selection.maleQty);
    const females = Number(selection.femaleQty);
    if (males < Number(requirement.minMales || 0) || females < Number(requirement.minFemales || 0)) return true;
    if (Number.isFinite(Number(requirement.maxMales)) && males > Number(requirement.maxMales)) return true;
    if (Number.isFinite(Number(requirement.maxFemales)) && females > Number(requirement.maxFemales)) return true;
    return false;
  }

  function verdict(score) {
    if (score >= 85) return 'excellent';
    if (score >= 65) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  global.Engine.analyze = function analyzeWithSocialRules(state) {
    const result = originalAnalyze(state);
    const lang = state?.lang || 'tr';
    let addedWarnings = 0;

    for (const selection of state?.fish || []) {
      const record = canonicalRecord(selection.id);
      if (!record) continue;
      const quantity = Number(selection.qty || 0);
      if (quantity <= 0) continue;
      const mode = socialMode(record);
      const minimum = minGroup(record);
      const name = recordName(record, lang);

      if (['school', 'group', 'colony'].includes(mode) && minimum > 1 && quantity < minimum) {
        if (!hasExistingMinimumWarning(result, record.id, name)) {
          result.warnings.push(groupMinimumFinding(record, { ...selection, qty: quantity }, lang, mode, minimum));
          addedWarnings += 1;
        }
      }

      if (mode === 'pair' && quantity !== 2) {
        result.warnings.push(pairFinding(record, { ...selection, qty: quantity }, lang));
        addedWarnings += 1;
      }

      if (mode === 'harem' && minimum > 1 && quantity < minimum) {
        result.warnings.push(haremFinding(record, { ...selection, qty: quantity }, lang, minimum));
        addedWarnings += 1;
      }

      const sexRequirement = record?.social?.sexRatio;
      if (sexRatioViolated(selection, sexRequirement)) {
        result.warnings.push(sexRatioFinding(record, selection, lang, sexRequirement));
        addedWarnings += 1;
      }
    }

    if (addedWarnings > 0) {
      result.score = Math.max(0, Number(result.score || 0) - addedWarnings * 8);
      result.verdict = verdict(result.score);
    }

    return result;
  };

  global.Engine.socialRulesVersion = 1;
  global.Engine.socialRuleIds = RULE_IDS;
})(window);
