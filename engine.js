// AKVARYUM — compatibility & analysis engine (Fresh / Salt only)

window.Engine = (function() {

  function rangeOverlap(a, b) {
    const lo = Math.max(a[0], b[0]);
    const hi = Math.min(a[1], b[1]);
    return hi >= lo ? [lo, hi] : null;
  }

  function analyze(state) {
    const lang = state.lang || 'tr';
    const T = (tr, en) => lang === 'tr' ? tr : en;

    const issues = [];
    const warnings = [];
    const tips = [];

    const fishItems = (state.fish || []).map(s => {
      const def = window.DB.fish.find(f => f.id === s.id);
      return def ? { ...def, qty: s.qty } : null;
    }).filter(Boolean);

    const totalFish = fishItems.reduce((sum, f) => sum + f.qty, 0);
    const totalSpecies = fishItems.length;
    const tankVol = state.volume || 0;
    const water = state.water;

    // ─── Water type vs fish ───
    fishItems.forEach(f => {
      if (water && f.water !== water) {
        issues.push({
          title: T(`${f.nameTr} ${water === 'fresh' ? 'tatlı' : 'tuzlu'} suda yaşayamaz`,
                   `${f.nameEn} cannot live in ${water === 'fresh' ? 'fresh' : 'salt'} water`),
          desc: T(`Bu tür ${f.water === 'fresh' ? 'tatlı su' : 'tuzlu su'} canlısı. Su tipini değiştir veya türü çıkar.`,
                  `This species is ${f.water === 'fresh' ? 'freshwater' : 'saltwater'}. Change water type or remove the species.`)
        });
      }
    });

    // ─── Volume ───
    let neededVol = 0;
    fishItems.forEach(f => {
      neededVol += f.minVolume + (f.qty - 1) * f.perFishL;
    });
    if (tankVol > 0 && neededVol > tankVol) {
      issues.push({
        title: T(`Tank yetersiz: ${tankVol}L mevcut, ~${Math.round(neededVol)}L gerekli`,
                 `Tank too small: ${tankVol}L available, ~${Math.round(neededVol)}L needed`),
        desc: T('Stoklamayı azalt ya da daha büyük tank al. Aşırı stoklama nitrat patlaması ve hastalık riski demek.',
                'Reduce stocking or upgrade. Overstocking causes nitrate spikes and disease.')
      });
    } else if (tankVol > 0 && neededVol > tankVol * 0.85) {
      warnings.push({
        title: T(`Tank %${Math.round(neededVol/tankVol*100)} dolu`, `Tank ${Math.round(neededVol/tankVol*100)}% loaded`),
        desc: T('Sınırda. Su kalitesi için %85 altı daha güvenli.', 'On the edge. Below 85% is safer.')
      });
    } else if (tankVol > 0 && neededVol < tankVol * 0.4 && totalFish > 0) {
      tips.push({
        title: T('Tankın boş kapasitesi var', 'Tank has spare capacity'),
        desc: T(`Sadece %${Math.round(neededVol/tankVol*100)} doluluk — daha fazla balık eklenebilir.`,
                `Only ${Math.round(neededVol/tankVol*100)}% loaded — more fish can be added.`)
      });
    }

    // ─── Individual fish vs tank ───
    fishItems.forEach(f => {
      if (tankVol > 0 && f.minVolume > tankVol) {
        issues.push({
          title: T(`${f.nameTr} bu tank için çok büyük`, `${f.nameEn} too big for this tank`),
          desc: T(`En az ${f.minVolume}L gerekli; tankın ${tankVol}L.`, `Needs at least ${f.minVolume}L; tank is ${tankVol}L.`)
        });
      }
    });

    // ─── Schooling minimums ───
    fishItems.forEach(f => {
      if (f.schooling > 0 && f.qty < f.schooling) {
        warnings.push({
          title: T(`${f.nameTr} sürü balığı (en az ${f.schooling})`, `${f.nameEn} is schooling (min ${f.schooling})`),
          desc: T(`Tek bireyleri stres olur. ${f.schooling}+ adet öneriliyor.`, `Solo individuals stress out. ${f.schooling}+ recommended.`)
        });
      }
    });

    // ─── Pairwise compat ───
    const compat = [];
    for (let i = 0; i < fishItems.length; i++) {
      for (let j = i; j < fishItems.length; j++) {
        const a = fishItems[i], b = fishItems[j];
        if (i === j) { compat.push({ a:a.id, b:b.id, status:'self', reasons:[] }); continue; }
        const reasons = [];
        let status = 'ok';

        if (!rangeOverlap(a.pH, b.pH)) {
          reasons.push(T(`pH çakışmıyor (${a.pH.join('-')} vs ${b.pH.join('-')})`, `pH mismatch (${a.pH.join('-')} vs ${b.pH.join('-')})`));
          status = 'bad';
        }
        if (!rangeOverlap(a.temp, b.temp)) {
          reasons.push(T(`Sıcaklık çakışmıyor (${a.temp.join('-')}°C vs ${b.temp.join('-')}°C)`, `Temperature mismatch`));
          status = 'bad';
        }
        if (a.gh && b.gh && !rangeOverlap(a.gh, b.gh)) {
          reasons.push(T('Su sertliği farklı', 'Hardness mismatch'));
          if (status !== 'bad') status = 'warn';
        }
        if (a.aggression === 'aggressive' && b.size < a.size * 0.6) {
          reasons.push(T(`${a.nameTr} ${b.nameTr}'i avlayabilir`, `${a.nameEn} may prey on ${b.nameEn}`));
          status = 'bad';
        }
        if (b.aggression === 'aggressive' && a.size < b.size * 0.6) {
          reasons.push(T(`${b.nameTr} ${a.nameTr}'i avlayabilir`, `${b.nameEn} may prey on ${a.nameEn}`));
          status = 'bad';
        }
        if ((a.finNippers && b.longFinned) || (b.finNippers && a.longFinned)) {
          reasons.push(T('Yüzgeç çekiştirme riski', 'Fin nipping risk'));
          if (status !== 'bad') status = 'warn';
        }
        if ((a.aggression === 'aggressive' && b.aggression === 'peaceful') ||
            (b.aggression === 'aggressive' && a.aggression === 'peaceful')) {
          reasons.push(T('Agresiflik uyumsuzluğu', 'Aggression mismatch'));
          if (status !== 'bad') status = 'warn';
        }
        if (a.id === 'betta' && b.id === 'betta') {
          reasons.push(T('Birden fazla beta savaşır', 'Multiple bettas fight'));
          status = 'bad';
        }
        // Tuzlu su: aynı clownfish türü dışında diğer clownlar uyumsuz
        if (water === 'salt' && a.id.startsWith('clown-') && b.id.startsWith('clown-') && a.id !== b.id) {
          reasons.push(T('Farklı palyaço türleri savaşır', 'Different clownfish species fight'));
          status = 'bad';
        }
        // Aynı tang türünden çoğul — saldırgan
        if (water === 'salt' && a.id.endsWith('-tang') && b.id.endsWith('-tang') && a.id !== b.id) {
          reasons.push(T('Birden fazla tang türü çatışabilir (büyük tank gerekir)', 'Multiple tang species may fight (large tank required)'));
          if (status !== 'bad') status = 'warn';
        }

        compat.push({ a:a.id, b:b.id, status, reasons });
        if (status === 'bad') {
          issues.push({
            title: T(`${a.nameTr} ↔ ${b.nameTr} uyumsuz`, `${a.nameEn} ↔ ${b.nameEn} incompatible`),
            desc: reasons.join(' · ')
          });
        } else if (status === 'warn') {
          warnings.push({
            title: T(`${a.nameTr} ↔ ${b.nameTr} dikkat`, `${a.nameEn} ↔ ${b.nameEn} caution`),
            desc: reasons.join(' · ')
          });
        }
      }
    }

    // ─── Aggregate parameters ───
    let pH = null, temp = null, gh = null;
    if (fishItems.length > 0) {
      pH = fishItems.reduce((acc, f) => acc ? rangeOverlap(acc, f.pH) || acc : f.pH, null);
      temp = fishItems.reduce((acc, f) => acc ? rangeOverlap(acc, f.temp) || acc : f.temp, null);
      gh = fishItems.reduce((acc, f) => acc && f.gh ? rangeOverlap(acc, f.gh) || acc : (f.gh || acc), null);
    }

    // ─── Plants (freshwater only) ───
    const plants = (state.plants || []).map(id => window.DB.plants.find(p => p.id === id)).filter(Boolean);
    plants.forEach(p => {
      const planteater = fishItems.find(f => !f.plantSafe);
      if (planteater) {
        warnings.push({
          title: T(`${planteater.nameTr} bitkilere zarar verebilir`, `${planteater.nameEn} may damage plants`),
          desc: T(`${p.tr} gibi bitkiler tehlikede.`, `Plants like ${p.en} are at risk.`)
        });
      }
      if (p.co2 && !state.co2) {
        tips.push({
          title: T(`${p.tr} için CO₂ önerilir`, `${p.en} prefers CO₂`),
          desc: T('CO₂ olmadan da yaşar ama büyümesi yavaşlar.', 'Survives without CO₂ but grows slowly.')
        });
      }
    });

    // ─── Substrate match ───
    const sub = state.substrate ? window.DB.substrates.find(s => s.id === state.substrate) : null;
    if (sub && water && !sub.water.includes(water)) {
      warnings.push({
        title: T(`${sub.tr} bu su tipiyle uyumsuz`, `${sub.en} doesn't match water type`),
        desc: T('Substrat su kimyasını etkiler. Daha uygun bir tercih yap.', 'Substrate affects water chemistry. Pick a better match.')
      });
    }

    // ─── Reef-safety warnings ───
    if (water === 'salt') {
      const hasCoral = fishItems.some(f => f.id.endsWith('-coral') || f.id === 'zoanthid' || f.id === 'acropora' || f.id === 'montipora' || f.id === 'pulsing-xenia' || f.id === 'green-star-polyp' || f.id === 'mushroom-coral' || f.id === 'leather-coral');
      if (hasCoral) {
        fishItems.forEach(f => {
          if (!f.reefSafe) {
            warnings.push({
              title: T(`${f.nameTr} resif güvenli değil`, `${f.nameEn} is not reef-safe`),
              desc: T('Mercanları veya omurgasızları kemirebilir/yiyebilir.', 'May nip corals or eat invertebrates.')
            });
          }
        });
      }
    }

    // ─── Score ───
    const issueWeight = issues.length * 25;
    const warnWeight = warnings.length * 8;
    let score = Math.max(0, 100 - issueWeight - warnWeight);
    if (totalFish === 0) score = 0;

    let verdict;
    if (score >= 85) verdict = 'excellent';
    else if (score >= 65) verdict = 'good';
    else if (score >= 40) verdict = 'fair';
    else verdict = 'poor';

    if (score >= 65 && tips.length === 0) {
      tips.push({
        title: T('Güzel kompozisyon', 'Nice composition'),
        desc: T('Balıklarının ihtiyaçları örtüşüyor. Düzenli su değişimi ve kararlı parametrelerle uzun süre sağlıklı kalır.',
                'Your fish needs overlap. Regular water changes and stable parameters will keep them healthy.')
      });
    }

    return {
      issues, warnings, tips,
      compat,
      params: { pH, temp, gh },
      bioloadPct: tankVol > 0 ? Math.min(100, Math.round(neededVol/tankVol*100)) : 0,
      neededVol: Math.round(neededVol),
      score, verdict,
      totalFish, totalSpecies,
      fishItems, plants, sub
    };
  }

  function filterFish(state) {
    return window.DB.fish.filter(f => {
      if (state.water && f.water !== state.water) return false;
      if (state.volume && state.volume > 0 && f.minVolume > state.volume * 1.5) return false;
      return true;
    });
  }

  function equipment(state, analysis, lang='tr') {
    const T = (tr, en) => lang === 'tr' ? tr : en;
    const vol = state.volume || analysis.neededVol || 80;
    const water = state.water;
    const recs = [];

    const filterFlow = vol * 5;
    recs.push({
      label: T('FİLTRE', 'FILTER'),
      name: vol < 80 ? T('İç filtre / Hang-on', 'Internal / HOB filter')
            : vol < 250 ? T('Canister filtre', 'Canister filter')
            : T('Canister veya Sump', 'Canister or sump'),
      desc: T(`En az ${filterFlow} L/saat akış (tank hacminin 4-6 katı).`,
              `At least ${filterFlow} L/h flow (4-6× tank volume).`)
    });

    recs.push({
      label: T('ISITICI', 'HEATER'),
      name: T(`${Math.ceil(vol/2)}W termostatlı ısıtıcı`, `${Math.ceil(vol/2)}W heater`),
      desc: T('Litre başına ~0.5W. Tropikal balıklar için zorunlu.', '~0.5W per liter. Required for tropical species.')
    });

    if (water === 'salt') {
      recs.push({ label: T('AYDINLATMA','LIGHT'), name: T('Reef LED (tam spektrum)','Reef LED (full spectrum)'),
        desc: T('Mercanlar için 100-200 PAR; SPS (Acropora) için 300+ PAR.','100-200 PAR for soft/LPS, 300+ for SPS.')});
      recs.push({ label: T('KÖPÜK AYIRICI','SKIMMER'), name: T('Protein skimmer','Protein skimmer'),
        desc: T('Tuzlu su tanklarında zorunlu. Çözünmüş organik atıkları suya girmeden ayırır.','Mandatory in saltwater. Removes dissolved organics.')});
      recs.push({ label: T('SİRKÜLASYON','FLOW'), name: T('Powerhead / dalga yapıcı','Powerhead / wavemaker'),
        desc: T('Tank hacminin 20-40 katı/saat akış. Mercanlar için birden fazla pompa idealdir.','20-40× volume/hr. Multiple pumps ideal for coral.')});
      recs.push({ label: T('CANLI KAYA','LIVE ROCK'), name: T('~1 kg / 4 L','~1 kg / 4 L'),
        desc: T('Biyolojik filtrasyonun bel kemiği. Canlı kum ile birlikte ekosistemin temelini kurar.','Backbone of biological filtration. Combined with live sand it builds the ecosystem.')});
      recs.push({ label: T('TUZ ÖLÇER','REFRACTOMETER'), name: T('Refraktometre','Refractometer'),
        desc: T('Tuzluluğu 1.024-1.026 SG (33-35 ppt) tutmak için.','Keep salinity at 1.024-1.026 SG (33-35 ppt).')});
    } else {
      const hasPlants = (state.plants || []).length > 0;
      const needsCO2 = (state.plants || []).some(id => {
        const p = window.DB.plants.find(p => p.id === id);
        return p && p.co2;
      });
      recs.push({ label: T('AYDINLATMA','LIGHT'),
        name: hasPlants ? T('Bitki LED — 0.5W/L','Plant LED — 0.5W/L') : T('Genel akvaryum LED','General aquarium LED'),
        desc: hasPlants ? T('Bitkili akvaryum için tam spektrum.','Full-spectrum for planted tanks.') : T('Balık renklerini öne çıkaran beyaz/mavi karışım.','White/blue mix to bring out fish colors.')});
      if (needsCO2) {
        recs.push({ label: T('CO₂','CO₂'), name: T('Basınçlı CO₂ sistemi','Pressurized CO₂'),
          desc: T('Yüksek ışıklı bitkili akvaryumda zorunlu. Hedef ~30 ppm.','Required for high-light planted tanks. Target ~30 ppm.')});
      }
    }

    return recs;
  }

  return { analyze, filterFish, equipment };
})();
