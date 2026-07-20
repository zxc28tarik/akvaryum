// AKVARYUM — Engine Finding v1 compatibility layer
// Vite production build appends this file after engine.js.

(function attachEngineFindingContract() {
  if (!window.Engine || typeof window.Engine.analyze !== 'function') {
    throw new Error('Engine Finding v1, window.Engine.analyze bulunmadan yüklenemez.');
  }

  const CONTRACT = Object.freeze({
    version: 1,
    severities: Object.freeze(['critical', 'warning', 'info']),
    requiredFields: Object.freeze([
      'ruleId',
      'severity',
      'title',
      'desc',
      'reason',
      'impact',
      'resolution',
      'subjects',
      'evidence'
    ])
  });

  const RULES = Object.freeze({
    WATER_TYPE_MISMATCH: ['critical', 'water'],
    TANK_CAPACITY_EXCEEDED: ['critical', 'capacityCritical'],
    TANK_CAPACITY_HIGH: ['warning', 'capacityWarning'],
    TANK_CAPACITY_AVAILABLE: ['info', 'capacityInfo'],
    SPECIES_MINIMUM_VOLUME: ['critical', 'speciesVolume'],
    SCHOOLING_MINIMUM: ['warning', 'schooling'],
    PAIRWISE_INCOMPATIBLE: ['critical', 'pairCritical'],
    PAIRWISE_CAUTION: ['warning', 'pairWarning'],
    PAIRWISE_COMPATIBLE: ['info', 'pairInfo'],
    PAIRWISE_SELF: ['info', 'pairSelf'],
    PARAMETER_PH_NO_COMMON_RANGE: ['critical', 'parameter'],
    PARAMETER_TEMPERATURE_NO_COMMON_RANGE: ['critical', 'parameter'],
    PARAMETER_GH_NO_COMMON_RANGE: ['critical', 'parameter'],
    PLANT_DAMAGE_RISK: ['warning', 'plantDamage'],
    PLANT_CO2_RECOMMENDED: ['info', 'plantCo2'],
    SUBSTRATE_WATER_MISMATCH: ['warning', 'substrate'],
    REEF_UNSAFE_INHABITANT: ['warning', 'reef'],
    COMPOSITION_HEALTHY: ['info', 'healthy'],
    EQUIPMENT_FILTER_FLOW: ['info', 'filter'],
    EQUIPMENT_HEATER_POWER: ['info', 'heater'],
    EQUIPMENT_REEF_LIGHT: ['info', 'reefLight'],
    EQUIPMENT_PROTEIN_SKIMMER: ['info', 'skimmer'],
    EQUIPMENT_SALTWATER_FLOW: ['info', 'flow'],
    EQUIPMENT_LIVE_ROCK: ['info', 'liveRock'],
    EQUIPMENT_REFRACTOMETER: ['info', 'refractometer'],
    EQUIPMENT_FRESHWATER_LIGHT: ['info', 'freshLight'],
    EQUIPMENT_CO2_SYSTEM: ['info', 'co2System']
  });

  const TEXT = Object.freeze({
    water: {
      impact: ['Yanlış su tipi ciddi stres ve ölüm riski oluşturur.', 'The wrong water type creates severe stress and mortality risk.'],
      resolution: ['Su tipini değiştir veya uyumsuz canlıyı çıkar.', 'Change the water type or remove the incompatible inhabitant.']
    },
    capacityCritical: {
      impact: ['Aşırı biyolojik yük su kalitesi, oksijen ve hastalık riskini kötüleştirir.', 'Excess bioload worsens water quality, oxygen availability, and disease risk.'],
      resolution: ['Canlı sayısını azalt veya daha büyük tank seç.', 'Reduce stocking or choose a larger tank.']
    },
    capacityWarning: {
      impact: ['Bakım gecikmeleri su değerlerini daha hızlı bozabilir.', 'Maintenance delays may destabilize water conditions more quickly.'],
      resolution: ['Yükü azalt veya filtrasyon ve bakım payını artır.', 'Reduce load or increase filtration and maintenance margin.']
    },
    capacityInfo: {
      impact: ['Hacim açısından ek bakım ve stoklama payı bulunuyor.', 'There is additional maintenance and stocking margin by volume.'],
      resolution: ['Yeni canlı eklemeden önce davranış ve su uyumluluğunu ayrıca kontrol et.', 'Check behavior and water compatibility before adding inhabitants.']
    },
    speciesVolume: {
      impact: ['Yetersiz yüzme alanı stres, agresyon ve gelişim sorunlarına yol açabilir.', 'Insufficient swimming space can cause stress, aggression, and growth problems.'],
      resolution: ['Daha büyük tank seç veya bu canlıyı kurulumdan çıkar.', 'Choose a larger tank or remove this inhabitant from the setup.']
    },
    schooling: {
      impact: ['Yetersiz grup büyüklüğü stres ve anormal davranış oluşturabilir.', 'An undersized group can cause stress and abnormal behavior.'],
      resolution: ['Grubu kayıtlı minimuma çıkar veya türü kurulumdan çıkar.', 'Raise the group to the recorded minimum or remove the species.']
    },
    pairCritical: {
      impact: ['Aynı tankta ciddi sağlık veya güvenlik riski vardır.', 'There is a serious health or safety risk in the same tank.'],
      resolution: ['Bu ikiliyi değiştir veya ayrı tanklarda tut.', 'Change this pair or keep them in separate tanks.']
    },
    pairWarning: {
      impact: ['Koşullara bağlı stres, yaralanma veya çatışma oluşabilir.', 'Condition-dependent stress, injury, or conflict may occur.'],
      resolution: ['Tank boyutunu, saklanma alanlarını ve davranışı yakından izle.', 'Closely monitor tank size, cover, and behavior.']
    },
    pairInfo: {
      impact: ['Mevcut kurallara göre temel uyumluluk kabul edilebilir.', 'Basic compatibility is acceptable under the current rules.'],
      resolution: ['Düzenli gözleme devam et.', 'Continue routine observation.']
    },
    pairSelf: {
      impact: ['Aynı kayıt için türler arası sonuç üretilmez.', 'No interspecies result is produced for the same record.'],
      resolution: ['Ek işlem gerekmez.', 'No action is required.']
    },
    parameter: {
      impact: ['Bütün canlılar aynı kararlı su değerinde güvenle tutulamaz.', 'Not all inhabitants can safely share one stable water value.'],
      resolution: ['Çakışan türleri değiştir veya ayrı tanklar planla.', 'Change the conflicting inhabitants or plan separate tanks.']
    },
    plantDamage: {
      impact: ['Bitkiler yenebilir, sökülebilir veya zarar görebilir.', 'Plants may be eaten, uprooted, or damaged.'],
      resolution: ['Dayanıklı bitki seç, bitkiyi koru veya canlıyı bitkili tanktan çıkar.', 'Choose robust plants, protect them, or remove the inhabitant from the planted tank.']
    },
    plantCo2: {
      impact: ['Büyüme yavaşlayabilir ve bitki formu zayıflayabilir.', 'Growth may slow and plant form may weaken.'],
      resolution: ['CO₂ ekle veya CO₂ gerektirmeyen bitki seç.', 'Add CO₂ or choose a plant that does not require it.']
    },
    substrate: {
      impact: ['Su kimyası ve canlı gereksinimleri istenmeyen yönde etkilenebilir.', 'Water chemistry and inhabitant requirements may be affected undesirably.'],
      resolution: ['Seçilen su tipine uygun taban kullan.', 'Use a substrate suitable for the selected water type.']
    },
    reef: {
      impact: ['Mercanlar veya omurgasızlar zarar görebilir ya da yenebilir.', 'Corals or invertebrates may be damaged or eaten.'],
      resolution: ['Canlıyı resif kurulumundan çıkar veya yalnız balık tankında tut.', 'Remove the inhabitant from the reef setup or keep it in a fish-only tank.']
    },
    healthy: {
      impact: ['Kurulum temel koşullar korunursa dengeli çalışabilir.', 'The setup can remain balanced if core conditions are maintained.'],
      resolution: ['Düzenli bakım, kararlı parametreler ve gözlemle devam et.', 'Continue with regular maintenance, stable parameters, and observation.']
    },
    filter: {
      impact: ['Yetersiz debi mekanik ve biyolojik filtrasyonu zayıflatabilir.', 'Insufficient flow can weaken mechanical and biological filtration.'],
      resolution: ['Belirtilen minimum debiyi karşılayan filtre kullan.', 'Use a filter that meets the stated minimum flow.']
    },
    heater: {
      impact: ['Yetersiz ısıtma sıcaklık dalgalanmasına ve strese yol açabilir.', 'Insufficient heating can cause temperature swings and stress.'],
      resolution: ['Tank hacmine uygun termostatlı ısıtıcı kullan.', 'Use a thermostatic heater sized for the tank.']
    },
    reefLight: {
      impact: ['Uygunsuz ışık mercan sağlığını ve renklenmeyi bozabilir.', 'Unsuitable light can harm coral health and coloration.'],
      resolution: ['Canlı türü ve tank derinliğine uygun reef LED kullan.', 'Use a reef LED suited to the inhabitants and tank depth.']
    },
    skimmer: {
      impact: ['Organik birikim besin yükünü ve su kalitesi sorunlarını artırabilir.', 'Organic buildup can increase nutrient load and water-quality problems.'],
      resolution: ['Tank hacmine uygun protein skimmer kullan.', 'Use a protein skimmer sized for the tank.']
    },
    flow: {
      impact: ['Ölü bölgeler detritus birikimi ve düşük oksijen oluşturabilir.', 'Dead spots can cause detritus buildup and low oxygen.'],
      resolution: ['Uygun toplam akış sağlayan dalga pompaları kullan.', 'Use wavemakers that provide appropriate total flow.']
    },
    liveRock: {
      impact: ['Yetersiz biyolojik yüzey azot döngüsü kapasitesini sınırlayabilir.', 'Insufficient biological surface area can limit nitrogen-cycle capacity.'],
      resolution: ['Yeterli gözenekli kaya kullan ve akış boşlukları bırak.', 'Use enough porous rock and leave flow channels.']
    },
    refractometer: {
      impact: ['Tuzluluk sapmaları canlılarda osmotik stres oluşturabilir.', 'Salinity drift can cause osmotic stress.'],
      resolution: ['Kalibre edilmiş refraktometreyle düzenli ölçüm yap.', 'Measure regularly with a calibrated refractometer.']
    },
    freshLight: {
      impact: ['Uygunsuz ışık bitki gelişimini, yosun dengesini veya günlük ritmi bozabilir.', 'Unsuitable light can disrupt plant growth, algae balance, or daily rhythm.'],
      resolution: ['Kuruluma uygun zamanlayıcılı akvaryum LED’i kullan.', 'Use a timer-controlled aquarium LED suited to the setup.']
    },
    co2System: {
      impact: ['CO₂ eksikliği büyümeyi sınırlayabilir ve yosun dengesini bozabilir.', 'Insufficient CO₂ can limit growth and disturb algae balance.'],
      resolution: ['Güvenli ve ayarlanabilir basınçlı CO₂ sistemi kullan.', 'Use a safe, adjustable pressurized CO₂ system.']
    }
  });

  function localize(pair, lang) {
    return pair[lang === 'en' ? 1 : 0];
  }

  function classifyFinding(title) {
    const value = String(title || '');
    const rules = [
      [/suda yaşayamaz$|cannot live in (fresh|salt) water$/i, 'WATER_TYPE_MISMATCH'],
      [/^Tank yetersiz:|^Tank too small:/i, 'TANK_CAPACITY_EXCEEDED'],
      [/^Tank %\d+ dolu$|^Tank \d+% loaded$/i, 'TANK_CAPACITY_HIGH'],
      [/^Tankın boş kapasitesi var$|^Tank has spare capacity$/i, 'TANK_CAPACITY_AVAILABLE'],
      [/bu tank için çok büyük$|too big for this tank$/i, 'SPECIES_MINIMUM_VOLUME'],
      [/sürü balığı \(en az \d+\)$|is schooling \(min \d+\)$/i, 'SCHOOLING_MINIMUM'],
      [/↔.*uyumsuz$|↔.*incompatible$/i, 'PAIRWISE_INCOMPATIBLE'],
      [/↔.*dikkat$|↔.*caution$/i, 'PAIRWISE_CAUTION'],
      [/^Ortak güvenli pH aralığı yok$|^No common safe pH range$/i, 'PARAMETER_PH_NO_COMMON_RANGE'],
      [/^Ortak güvenli sıcaklık aralığı yok$|^No common safe temperature range$/i, 'PARAMETER_TEMPERATURE_NO_COMMON_RANGE'],
      [/^Ortak güvenli GH aralığı yok$|^No common safe GH range$/i, 'PARAMETER_GH_NO_COMMON_RANGE'],
      [/bitkilere zarar verebilir$|may damage plants$/i, 'PLANT_DAMAGE_RISK'],
      [/için CO₂ önerilir$|prefers CO₂$/i, 'PLANT_CO2_RECOMMENDED'],
      [/bu su tipiyle uyumsuz$|doesn't match water type$/i, 'SUBSTRATE_WATER_MISMATCH'],
      [/resif güvenli değil$|is not reef-safe$/i, 'REEF_UNSAFE_INHABITANT'],
      [/^Güzel kompozisyon$|^Nice composition$/i, 'COMPOSITION_HEALTHY']
    ];
    const match = rules.find(([pattern]) => pattern.test(value));
    if (!match) throw new Error(`Engine Finding v1 için tanınmayan çıktı: ${value}`);
    return match[1];
  }

  function inferSubjects(item, result) {
    const title = String(item.title || '');
    const desc = String(item.desc || '');
    const values = [];
    for (const fish of result.fishItems || []) {
      if (title.includes(fish.nameTr) || title.includes(fish.nameEn) || desc.includes(fish.nameTr) || desc.includes(fish.nameEn)) {
        values.push(fish.id);
      }
    }
    for (const plant of result.plants || []) {
      if (title.includes(plant.tr) || title.includes(plant.en) || desc.includes(plant.tr) || desc.includes(plant.en)) {
        values.push(plant.id);
      }
    }
    if (result.sub && (title.includes(result.sub.tr) || title.includes(result.sub.en))) values.push(result.sub.id);
    return [...new Set(values.filter(Boolean))];
  }

  function normalizeFinding(item, bucketSeverity, lang, result) {
    if (item && item.ruleId) return item;
    const ruleId = classifyFinding(item.title);
    const [expectedSeverity, group] = RULES[ruleId];
    if (expectedSeverity !== bucketSeverity) {
      throw new Error(`${ruleId}: beklenen ${expectedSeverity}, bulunan ${bucketSeverity}.`);
    }
    const text = TEXT[group];
    return {
      ...item,
      ruleId,
      severity: expectedSeverity,
      reason: item.desc,
      impact: localize(text.impact, lang),
      resolution: localize(text.resolution, lang),
      subjects: inferSubjects(item, result),
      evidence: {
        source: 'legacy-engine-v1',
        originalTitle: item.title
      }
    };
  }

  function normalizeCompat(entry, lang, result) {
    const statusRule = {
      self: 'PAIRWISE_SELF',
      ok: 'PAIRWISE_COMPATIBLE',
      warn: 'PAIRWISE_CAUTION',
      bad: 'PAIRWISE_INCOMPATIBLE'
    };
    const ruleId = statusRule[entry.status];
    if (!ruleId) throw new Error(`Bilinmeyen uyumluluk durumu: ${entry.status}`);
    const [severity, group] = RULES[ruleId];
    const text = TEXT[group];
    const names = new Map((result.fishItems || []).map(fish => [fish.id, lang === 'en' ? fish.nameEn : fish.nameTr]));
    const nameA = names.get(entry.a) || entry.a;
    const nameB = names.get(entry.b) || entry.b;
    const reason = entry.reasons.length > 0
      ? entry.reasons.join(' · ')
      : localize(['Belirgin uyumsuzluk bulunmadı.', 'No clear incompatibility was found.'], lang);
    const statusLabel = entry.status === 'bad'
      ? localize(['uyumsuz', 'incompatible'], lang)
      : entry.status === 'warn'
        ? localize(['dikkat', 'caution'], lang)
        : entry.status === 'self'
          ? localize(['aynı kayıt', 'same record'], lang)
          : localize(['uyumlu', 'compatible'], lang);
    return {
      ...entry,
      ruleId,
      severity,
      title: `${nameA} ↔ ${nameB} ${statusLabel}`,
      desc: reason,
      reason,
      impact: localize(text.impact, lang),
      resolution: localize(text.resolution, lang),
      subjects: [...new Set([entry.a, entry.b].filter(Boolean))],
      evidence: {
        source: 'legacy-engine-v1',
        status: entry.status,
        reasonCount: entry.reasons.length
      }
    };
  }

  function classifyEquipment(item, state) {
    const label = String(item.label || '').toUpperCase();
    if (label === 'FİLTRE' || label === 'FILTER') return 'EQUIPMENT_FILTER_FLOW';
    if (label === 'ISITICI' || label === 'HEATER') return 'EQUIPMENT_HEATER_POWER';
    if (label === 'KÖPÜK AYIRICI' || label === 'SKIMMER') return 'EQUIPMENT_PROTEIN_SKIMMER';
    if (label === 'SİRKÜLASYON' || label === 'FLOW') return 'EQUIPMENT_SALTWATER_FLOW';
    if (label === 'CANLI KAYA' || label === 'LIVE ROCK') return 'EQUIPMENT_LIVE_ROCK';
    if (label === 'TUZ ÖLÇER' || label === 'REFRACTOMETER') return 'EQUIPMENT_REFRACTOMETER';
    if (label === 'CO₂') return 'EQUIPMENT_CO2_SYSTEM';
    if (label === 'AYDINLATMA' || label === 'LIGHT') {
      return state.water === 'salt' ? 'EQUIPMENT_REEF_LIGHT' : 'EQUIPMENT_FRESHWATER_LIGHT';
    }
    throw new Error(`Engine Finding v1 için tanınmayan ekipman çıktısı: ${item.label}`);
  }

  function normalizeEquipment(item, state, lang) {
    const ruleId = classifyEquipment(item, state);
    const [severity, group] = RULES[ruleId];
    const text = TEXT[group];
    return {
      ...item,
      ruleId,
      severity,
      title: item.name,
      reason: item.desc,
      impact: localize(text.impact, lang),
      resolution: localize(text.resolution, lang),
      subjects: [],
      evidence: {
        source: 'legacy-engine-v1',
        water: state.water || null,
        volumeL: state.volume || null
      }
    };
  }

  const originalAnalyze = window.Engine.analyze.bind(window.Engine);
  const originalEquipment = window.Engine.equipment.bind(window.Engine);

  window.Engine.analyze = function analyzeWithFindingContract(state) {
    const result = originalAnalyze(state);
    const lang = state.lang || 'tr';
    result.issues = result.issues.map(item => normalizeFinding(item, 'critical', lang, result));
    result.warnings = result.warnings.map(item => normalizeFinding(item, 'warning', lang, result));
    result.tips = result.tips.map(item => normalizeFinding(item, 'info', lang, result));
    result.compat = result.compat.map(entry => normalizeCompat(entry, lang, result));
    return result;
  };

  window.Engine.equipment = function equipmentWithFindingContract(state, analysis, lang = 'tr') {
    return originalEquipment(state, analysis, lang).map(item => normalizeEquipment(item, state, lang));
  };

  window.Engine.findingContract = CONTRACT;
  window.Engine.findingRuleIds = Object.freeze(Object.keys(RULES));
})();
