// AKVARYUM — inhabitant detail panel

(() => {
  'use strict';

  if (!window.React || !window.UI || !window.CatalogFilterModel || !window.InhabitantDetailModel) {
    throw new Error('Canlı ayrıntı paneli için React, UI ve ayrıntı modelleri gereklidir.');
  }

  const { useEffect, useMemo, useRef, useState } = React;
  const BaseFishStep = window.UI.FishStep;
  const catalogModel = window.CatalogFilterModel;
  const detailModel = window.InhabitantDetailModel;
  const STYLE_ID = 'akvaryum-inhabitant-detail-style';

  const COPY = {
    tr: {
      details: 'Detay', close: 'Kapat', add: 'Akvaryuma ekle', remove: 'Çıkar', quantity: 'Adet',
      overview: 'Genel bilgiler', waterTank: 'Su ve tank', behavior: 'Davranış ve bakım',
      compatibility: 'Uyumluluk ve yaşam alanı', sources: 'Kaynak ve doğrulama', unknown: 'Bilinmiyor',
      notProvided: 'Bu alan için kayıtlı bilgi yok.', sourcePending: 'Dış kaynak doğrulaması bekliyor',
      aliases: 'Eş adlar', genus: 'Cins', family: 'Aile', category: 'Kategori', entityType: 'Canlı türü',
      waterType: 'Su tipi', temperature: 'Sıcaklık', ph: 'pH', gh: 'GH', salinity: 'Tuzluluk',
      adultSize: 'Yetişkin boyu', minTank: 'Minimum tank', tankLength: 'Minimum tank uzunluğu',
      extraVolume: 'Ek canlı başına hacim', careDifficulty: 'Bakım zorluğu', temperament: 'Mizaç',
      activity: 'Aktivite', socialMode: 'Sosyal yapı', minGroup: 'Minimum grup', recommendedGroup: 'Önerilen grup',
      territoriality: 'Bölgesellik', sameSpeciesAggression: 'Aynı tür agresyonu', zones: 'Yaşam bölgesi',
      diet: 'Beslenme', feedingDifficulty: 'Besleme zorluğu', plantSafe: 'Bitki güvenliği',
      coralSafe: 'Mercan güvenliği', flow: 'Akıntı', oxygen: 'Oksijen', substrate: 'Taban', shelter: 'Saklanma alanı',
      sensitiveTo: 'Hassas olduğu durumlar', warnings: 'Özel uyarılar', notes: 'Notlar',
      verificationStatus: 'Doğrulama durumu', confidence: 'Güven düzeyi', fieldCoverage: 'Kaynak bağlı alanlar',
      unknownFields: 'Açık eksik alanlar', publisher: 'Yayıncı', status: 'Durum', confidenceLabel: 'Güven', location: 'Konum',
      yes: 'Evet', no: 'Hayır', notApplicable: 'Uygulanmaz', withCaution: 'Dikkatle',
      water: { fresh: 'Tatlı su', brackish: 'Acı su', salt: 'Tuzlu su' },
      care: { beginner: 'Başlangıç', intermediate: 'Orta', advanced: 'İleri', expert: 'Uzman', unknown: 'Bilinmiyor' },
      temperamentMap: { peaceful: 'Barışçıl', semi_aggressive: 'Yarı agresif', aggressive: 'Agresif', predatory: 'Avcı', unknown: 'Bilinmiyor' },
      activityMap: { slow: 'Yavaş', moderate: 'Orta', active: 'Aktif', very_active: 'Çok aktif', unknown: 'Bilinmiyor' },
      social: { solitary: 'Tekil', pair: 'Çift', harem: 'Harem', group: 'Grup', school: 'Sürü', colony: 'Koloni', unknown: 'Bilinmiyor' },
      aggression: { none: 'Yok', low: 'Düşük', medium: 'Orta', high: 'Yüksek', extreme: 'Aşırı', unknown: 'Bilinmiyor' },
      zonesMap: { surface: 'Yüzey', mid: 'Orta', bottom: 'Dip', rockwork: 'Kayalık', sand: 'Kum', open_water: 'Açık su', top: 'Yüzey', unknown: 'Bilinmiyor' },
      dietMap: { herbivore: 'Otçul', omnivore: 'Hepçil', carnivore: 'Etçil', planktivore: 'Planktonla beslenen', filter_feeder: 'Filtre beslenen', unknown: 'Bilinmiyor' },
      feedingMap: { easy: 'Kolay', medium: 'Orta', hard: 'Zor', expert: 'Uzman', unknown: 'Bilinmiyor' },
      flowMap: { low: 'Düşük', medium: 'Orta', high: 'Yüksek', variable: 'Değişken', unknown: 'Bilinmiyor' },
      oxygenMap: { normal: 'Normal', high: 'Yüksek', unknown: 'Bilinmiyor' },
      verification: { needs_review: 'İnceleme gerekli', reviewed: 'İncelendi', verified: 'Doğrulandı', rejected: 'Reddedildi' },
      confidenceMap: { low: 'Düşük', medium: 'Orta', high: 'Yüksek' },
    },
    en: {
      details: 'Details', close: 'Close', add: 'Add to aquarium', remove: 'Remove', quantity: 'Quantity',
      overview: 'Overview', waterTank: 'Water and tank', behavior: 'Behavior and care',
      compatibility: 'Compatibility and habitat', sources: 'Sources and verification', unknown: 'Unknown',
      notProvided: 'No recorded information is available for this field.', sourcePending: 'Awaiting external source verification',
      aliases: 'Aliases', genus: 'Genus', family: 'Family', category: 'Category', entityType: 'Entity type',
      waterType: 'Water type', temperature: 'Temperature', ph: 'pH', gh: 'GH', salinity: 'Salinity',
      adultSize: 'Adult size', minTank: 'Minimum tank', tankLength: 'Minimum tank length',
      extraVolume: 'Volume per additional inhabitant', careDifficulty: 'Care difficulty', temperament: 'Temperament',
      activity: 'Activity', socialMode: 'Social structure', minGroup: 'Minimum group', recommendedGroup: 'Recommended group',
      territoriality: 'Territoriality', sameSpeciesAggression: 'Conspecific aggression', zones: 'Habitat zone',
      diet: 'Diet', feedingDifficulty: 'Feeding difficulty', plantSafe: 'Plant safety',
      coralSafe: 'Coral safety', flow: 'Flow', oxygen: 'Oxygen', substrate: 'Substrate', shelter: 'Shelter',
      sensitiveTo: 'Sensitive to', warnings: 'Special warnings', notes: 'Notes',
      verificationStatus: 'Verification status', confidence: 'Confidence', fieldCoverage: 'Fields linked to sources',
      unknownFields: 'Open missing fields', publisher: 'Publisher', status: 'Status', confidenceLabel: 'Confidence', location: 'Location',
      yes: 'Yes', no: 'No', notApplicable: 'Not applicable', withCaution: 'With caution',
      water: { fresh: 'Freshwater', brackish: 'Brackish', salt: 'Saltwater' },
      care: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', expert: 'Expert', unknown: 'Unknown' },
      temperamentMap: { peaceful: 'Peaceful', semi_aggressive: 'Semi-aggressive', aggressive: 'Aggressive', predatory: 'Predatory', unknown: 'Unknown' },
      activityMap: { slow: 'Slow', moderate: 'Moderate', active: 'Active', very_active: 'Very active', unknown: 'Unknown' },
      social: { solitary: 'Solitary', pair: 'Pair', harem: 'Harem', group: 'Group', school: 'School', colony: 'Colony', unknown: 'Unknown' },
      aggression: { none: 'None', low: 'Low', medium: 'Medium', high: 'High', extreme: 'Extreme', unknown: 'Unknown' },
      zonesMap: { surface: 'Surface', mid: 'Midwater', bottom: 'Bottom', rockwork: 'Rockwork', sand: 'Sand', open_water: 'Open water', top: 'Surface', unknown: 'Unknown' },
      dietMap: { herbivore: 'Herbivore', omnivore: 'Omnivore', carnivore: 'Carnivore', planktivore: 'Planktivore', filter_feeder: 'Filter feeder', unknown: 'Unknown' },
      feedingMap: { easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert', unknown: 'Unknown' },
      flowMap: { low: 'Low', medium: 'Medium', high: 'High', variable: 'Variable', unknown: 'Unknown' },
      oxygenMap: { normal: 'Normal', high: 'High', unknown: 'Unknown' },
      verification: { needs_review: 'Needs review', reviewed: 'Reviewed', verified: 'Verified', rejected: 'Rejected' },
      confidenceMap: { low: 'Low', medium: 'Medium', high: 'High' },
    },
  };

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .catalog-detail{margin-right:auto;border:1px solid #b5d1d3;border-radius:10px;padding:10px 13px;background:#fff;color:#176e75;font:700 12px/1 Inter,sans-serif;cursor:pointer}
      .catalog-detail:hover{border-color:#258b92;background:#eff8f8}
      .inhabitant-detail-backdrop{position:fixed;inset:0;z-index:1000;display:flex;justify-content:flex-end;background:rgba(5,24,34,.56);backdrop-filter:blur(5px)}
      .inhabitant-detail-panel{width:min(720px,100%);height:100%;overflow:auto;background:#f7fbfb;color:#0a1f2e;box-shadow:-24px 0 70px rgba(3,25,35,.24);outline:none}
      .inhabitant-detail-hero{position:sticky;top:0;z-index:3;padding:24px 28px 22px;border-bottom:1px solid #cce0e1;background:rgba(247,251,251,.96);backdrop-filter:blur(14px)}
      .inhabitant-detail-close{position:absolute;top:18px;right:20px;width:38px;height:38px;border:1px solid #bdd4d6;border-radius:50%;background:#fff;color:#174e55;font:700 21px/1 Inter,sans-serif;cursor:pointer}
      .inhabitant-detail-eyebrow{margin:0 52px 8px 0;color:#247d84;font:700 11px/1.2 Inter,sans-serif;letter-spacing:.14em;text-transform:uppercase}
      .inhabitant-detail-title{margin:0 52px 5px 0;font:600 clamp(30px,5vw,48px)/1.05 Lora,serif;letter-spacing:-.03em}
      .inhabitant-detail-scientific{margin:0;color:#647e83;font:italic 14px/1.4 Lora,serif}
      .inhabitant-detail-badges{display:flex;flex-wrap:wrap;gap:7px;margin-top:14px}.inhabitant-detail-badge{padding:7px 9px;border-radius:999px;background:#e4f1f1;color:#245c62;font:700 10px/1 Inter,sans-serif}
      .inhabitant-detail-badge.is-warning{background:#fff0d7;color:#8a5715}.inhabitant-detail-badge.is-verified{background:#def4e7;color:#24663e}
      .inhabitant-detail-content{display:grid;gap:18px;padding:22px 28px 100px}
      .inhabitant-detail-summary{margin:0;color:#395a60;font:400 15px/1.7 Inter,sans-serif}
      .inhabitant-detail-section{padding:19px;border:1px solid #c9dfe0;border-radius:18px;background:#fff}
      .inhabitant-detail-section h3{margin:0 0 14px;font:600 21px/1.2 Lora,serif}.inhabitant-detail-section h4{margin:17px 0 8px;font:700 11px/1.2 Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#507176}
      .inhabitant-detail-table{width:100%;border-collapse:collapse}.inhabitant-detail-table th,.inhabitant-detail-table td{padding:10px 0;border-bottom:1px solid #e4eeee;text-align:left;vertical-align:top;font:500 13px/1.45 Inter,sans-serif}.inhabitant-detail-table th{width:42%;padding-right:18px;color:#5a777c;font-weight:600}.inhabitant-detail-table tr:last-child th,.inhabitant-detail-table tr:last-child td{border-bottom:0}
      .inhabitant-detail-tags{display:flex;flex-wrap:wrap;gap:7px}.inhabitant-detail-tag{padding:7px 9px;border-radius:9px;background:#eef6f6;color:#365e63;font:600 11px/1.2 Inter,sans-serif}
      .inhabitant-detail-empty{color:#84989b;font-style:italic}.inhabitant-detail-list{margin:0;padding-left:19px;color:#395a60;font:400 13px/1.55 Inter,sans-serif}.inhabitant-detail-list li+li{margin-top:5px}
      .inhabitant-source{padding:12px 0;border-bottom:1px solid #e1ecec}.inhabitant-source:last-child{border-bottom:0}.inhabitant-source strong{display:block;margin-bottom:4px;font:700 13px/1.35 Inter,sans-serif}.inhabitant-source-meta{display:flex;flex-wrap:wrap;gap:6px;color:#627d82;font:500 11px/1.4 Inter,sans-serif}.inhabitant-source-note{margin:7px 0 0;color:#536e73;font:400 12px/1.5 Inter,sans-serif}
      .inhabitant-verification-note{margin:0 0 14px;padding:11px 12px;border-radius:11px;background:#fff4df;color:#77501d;font:600 12px/1.45 Inter,sans-serif}
      .inhabitant-detail-actions{position:fixed;right:0;bottom:0;z-index:1002;display:flex;justify-content:flex-end;align-items:center;gap:10px;width:min(720px,100%);box-sizing:border-box;padding:15px 28px;border-top:1px solid #cadfe0;background:rgba(247,251,251,.97);backdrop-filter:blur(14px)}
      .inhabitant-detail-add{border:0;border-radius:11px;padding:13px 18px;background:#176e75;color:#fff;font:700 13px/1 Inter,sans-serif;cursor:pointer}.inhabitant-detail-stepper{display:flex;align-items:center;gap:9px}.inhabitant-detail-stepper button{width:38px;height:38px;border:1px solid #b5d1d3;border-radius:10px;background:#fff;color:#176e75;font:700 20px/1 Inter,sans-serif;cursor:pointer}.inhabitant-detail-stepper output{min-width:30px;text-align:center;font:700 15px/1 Inter,sans-serif}
      @media(max-width:640px){.inhabitant-detail-hero{padding:20px 18px 18px}.inhabitant-detail-content{padding:18px 14px 92px}.inhabitant-detail-section{padding:16px}.inhabitant-detail-actions{padding:12px 16px}.inhabitant-detail-table th{width:47%}}
    `;
    document.head.append(style);
  }

  function formatRange(range, unit, copy) {
    if (!range) return copy.unknown;
    const [first, second] = range;
    return first === second ? `${first}${unit}` : `${first}–${second}${unit}`;
  }

  function mapped(value, map, copy) {
    return map?.[value] || value || copy.unknown;
  }

  function mappedList(values, map, copy) {
    if (!values?.length) return copy.unknown;
    return values.map((value) => mapped(value, map, copy)).join(', ');
  }

  function yesNo(value, copy) {
    if (value === true) return copy.yes;
    if (value === false) return copy.no;
    return copy.unknown;
  }

  function coralSafety(value, copy) {
    if (value === 'yes') return copy.yes;
    if (value === 'no') return copy.no;
    if (value === 'with_caution') return copy.withCaution;
    if (value === 'not_applicable') return copy.notApplicable;
    return copy.unknown;
  }

  function DetailTable({ rows }) {
    return (
      <table className="inhabitant-detail-table">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td className={value ? '' : 'inhabitant-detail-empty'}>{value || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function Tags({ values, empty }) {
    if (!values?.length) return <span className="inhabitant-detail-empty">{empty}</span>;
    return <div className="inhabitant-detail-tags">{values.map((value) => <span className="inhabitant-detail-tag" key={value}>{value}</span>)}</div>;
  }

  function findRecordForCard(card, records, lang) {
    const knownId = card.dataset.inhabitantId;
    if (knownId) return records.find((record) => record.id === knownId) || null;
    const name = card.querySelector('h3')?.textContent?.trim() || '';
    const scientific = card.querySelector('.catalog-scientific')?.textContent?.trim() || '';
    return records.find((record) => {
      const recordScientific = record.scientificName || record.sci || '';
      return catalogModel.recordName(record, lang) === name && (!scientific || recordScientific === scientific);
    }) || null;
  }

  function InhabitantDetailFishStep(props) {
    ensureStyles();
    const { state, setState, lang } = props;
    const copy = COPY[lang] || COPY.tr;
    const records = window.DB?.inhabitantCatalog?.all || window.DB?.inhabitants || window.DB?.fish || [];
    const sources = window.DB?.sources || [];
    const [detailId, setDetailId] = useState(null);
    const closeRef = useRef(null);
    const returnFocusRef = useRef(null);

    const record = useMemo(() => records.find((candidate) => candidate.id === detailId) || null, [records, detailId]);
    const detail = useMemo(() => detailModel.build(record, lang, sources), [record, lang, sources]);
    const quantity = detailId ? (state.fish || []).find((item) => item.id === detailId)?.qty || 0 : 0;

    function setQuantity(id, nextQuantity) {
      setState((current) => {
        const fish = [...(current.fish || [])];
        const index = fish.findIndex((item) => item.id === id);
        const next = Math.max(0, Math.min(99, Number(nextQuantity) || 0));
        if (next === 0 && index >= 0) fish.splice(index, 1);
        else if (index >= 0) fish[index] = { ...fish[index], qty: next };
        else if (next > 0) fish.push({ id, qty: next });
        return { ...current, fish };
      });
    }

    function closeDetail() {
      setDetailId(null);
      window.requestAnimationFrame(() => returnFocusRef.current?.focus?.());
    }

    useEffect(() => {
      const root = document.getElementById('root');
      if (!root) return undefined;

      const enhanceCards = () => {
        for (const card of root.querySelectorAll('.catalog-card')) {
          const matchedRecord = findRecordForCard(card, records, lang);
          if (!matchedRecord) continue;
          card.dataset.inhabitantId = matchedRecord.id;
          const action = card.querySelector('.catalog-card-action');
          if (!action) continue;
          let button = action.querySelector('[data-catalog-detail]');
          if (!button) {
            button = document.createElement('button');
            button.type = 'button';
            button.className = 'catalog-detail';
            button.dataset.catalogDetail = matchedRecord.id;
            action.prepend(button);
          }
          button.textContent = copy.details;
          button.setAttribute('aria-label', `${copy.details}: ${catalogModel.recordName(matchedRecord, lang)}`);
        }
      };

      const onDetailClick = (event) => {
        const button = event.target.closest?.('[data-catalog-detail]');
        if (!button) return;
        event.preventDefault();
        event.stopPropagation();
        returnFocusRef.current = button;
        setDetailId(button.dataset.catalogDetail || null);
      };

      const observer = new MutationObserver(enhanceCards);
      observer.observe(root, { childList: true, subtree: true });
      root.addEventListener('click', onDetailClick, true);
      enhanceCards();
      return () => {
        observer.disconnect();
        root.removeEventListener('click', onDetailClick, true);
      };
    }, [records, lang, copy.details]);

    useEffect(() => {
      if (!detailId) return undefined;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKeyDown = (event) => {
        if (event.key === 'Escape') closeDetail();
      };
      document.addEventListener('keydown', onKeyDown);
      window.requestAnimationFrame(() => closeRef.current?.focus());
      return () => {
        document.body.style.overflow = previousOverflow;
        document.removeEventListener('keydown', onKeyDown);
      };
    }, [detailId]);

    const waterRows = detail ? [
      [copy.waterType, mappedList(detail.water.types, copy.water, copy)],
      [copy.temperature, formatRange(detail.water.temperatureC, ' °C', copy)],
      [copy.ph, formatRange(detail.water.pH, '', copy)],
      [copy.gh, formatRange(detail.water.gh, ' dGH', copy)],
      [copy.salinity, formatRange(detail.water.salinityPpt, ' ppt', copy)],
      [copy.adultSize, formatRange(detail.size.adultCm, ' cm', copy)],
      [copy.minTank, detail.tank.minVolumeL ? `${detail.tank.minVolumeL} L` : copy.unknown],
      [copy.tankLength, detail.tank.minLengthCm ? `${detail.tank.minLengthCm} cm` : copy.unknown],
      [copy.extraVolume, detail.tank.additionalVolumePerInhabitantL ? `${detail.tank.additionalVolumePerInhabitantL} L` : copy.unknown],
    ] : [];

    const behaviorRows = detail ? [
      [copy.careDifficulty, mapped(detail.care.difficulty, copy.care, copy)],
      [copy.temperament, mapped(detail.behavior.temperament, copy.temperamentMap, copy)],
      [copy.activity, mapped(detail.behavior.activity, copy.activityMap, copy)],
      [copy.socialMode, mapped(detail.social.mode, copy.social, copy)],
      [copy.minGroup, detail.social.minGroup || copy.unknown],
      [copy.recommendedGroup, detail.social.recommendedGroup || copy.unknown],
      [copy.territoriality, mapped(detail.social.territoriality, copy.aggression, copy)],
      [copy.sameSpeciesAggression, mapped(detail.social.conspecificAggression, copy.aggression, copy)],
      [copy.zones, mappedList(detail.behavior.zone, copy.zonesMap, copy)],
      [copy.diet, mappedList(detail.feeding.diet, copy.dietMap, copy)],
      [copy.feedingDifficulty, mapped(detail.feeding.feedingDifficulty, copy.feedingMap, copy)],
    ] : [];

    const habitatRows = detail ? [
      [copy.plantSafe, yesNo(detail.compatibility.plantSafe, copy)],
      [copy.coralSafe, coralSafety(detail.compatibility.coralSafe, copy)],
      [copy.flow, mapped(detail.habitat.flow, copy.flowMap, copy)],
      [copy.oxygen, mapped(detail.habitat.oxygen, copy.oxygenMap, copy)],
      [copy.substrate, detail.habitat.substrate.join(', ') || copy.unknown],
      [copy.shelter, detail.habitat.shelter.join(', ') || copy.unknown],
    ] : [];

    return (
      <>
        <BaseFishStep {...props} />
        {detail && (
          <div className="inhabitant-detail-backdrop" onMouseDown={(event) => event.target === event.currentTarget && closeDetail()}>
            <aside className="inhabitant-detail-panel" role="dialog" aria-modal="true" aria-labelledby="inhabitant-detail-title">
              <header className="inhabitant-detail-hero">
                <button ref={closeRef} className="inhabitant-detail-close" type="button" onClick={closeDetail} aria-label={copy.close}>×</button>
                <p className="inhabitant-detail-eyebrow">{mapped(detail.care.difficulty, copy.care, copy)} · {detail.category || detail.entityType || copy.unknown}</p>
                <h2 className="inhabitant-detail-title" id="inhabitant-detail-title">{detail.name}</h2>
                <p className="inhabitant-detail-scientific">{detail.scientificName || copy.unknown}</p>
                <div className="inhabitant-detail-badges">
                  <span className={`inhabitant-detail-badge${detail.verification.status === 'verified' ? ' is-verified' : ' is-warning'}`}>
                    {mapped(detail.verification.status, copy.verification, copy)}
                  </span>
                  <span className="inhabitant-detail-badge">{copy.confidence}: {mapped(detail.verification.confidence, copy.confidenceMap, copy)}</span>
                  <span className="inhabitant-detail-badge">{mappedList(detail.water.types, copy.water, copy)}</span>
                </div>
              </header>

              <div className="inhabitant-detail-content">
                <p className="inhabitant-detail-summary">{detail.summary || copy.notProvided}</p>

                <section className="inhabitant-detail-section">
                  <h3>{copy.overview}</h3>
                  <DetailTable rows={[
                    [copy.genus, detail.taxonomy.genus || copy.unknown],
                    [copy.family, detail.taxonomy.family || copy.unknown],
                    [copy.category, detail.category || copy.unknown],
                    [copy.entityType, detail.entityType || copy.unknown],
                  ]} />
                  <h4>{copy.aliases}</h4>
                  <Tags values={detail.aliases} empty={copy.notProvided} />
                </section>

                <section className="inhabitant-detail-section">
                  <h3>{copy.waterTank}</h3>
                  <DetailTable rows={waterRows} />
                </section>

                <section className="inhabitant-detail-section">
                  <h3>{copy.behavior}</h3>
                  <DetailTable rows={behaviorRows} />
                  <h4>{copy.sensitiveTo}</h4>
                  <Tags values={detail.care.sensitiveTo} empty={copy.notProvided} />
                  <h4>{copy.warnings}</h4>
                  {detail.care.specialWarnings.length ? <ul className="inhabitant-detail-list">{detail.care.specialWarnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : <span className="inhabitant-detail-empty">{copy.notProvided}</span>}
                </section>

                <section className="inhabitant-detail-section">
                  <h3>{copy.compatibility}</h3>
                  <DetailTable rows={habitatRows} />
                  <h4>{copy.notes}</h4>
                  <p className={detail.notes ? 'inhabitant-detail-summary' : 'inhabitant-detail-empty'}>{detail.notes || copy.notProvided}</p>
                </section>

                <section className="inhabitant-detail-section">
                  <h3>{copy.sources}</h3>
                  {detail.verification.status !== 'verified' && <p className="inhabitant-verification-note">{copy.sourcePending}</p>}
                  <DetailTable rows={[
                    [copy.verificationStatus, mapped(detail.verification.status, copy.verification, copy)],
                    [copy.confidence, mapped(detail.verification.confidence, copy.confidenceMap, copy)],
                    [copy.fieldCoverage, String(detail.fieldSources.length)],
                    [copy.unknownFields, detail.migration.unknownFields.length ? detail.migration.unknownFields.join(', ') : copy.notProvided],
                  ]} />
                  {detail.verification.notes.length > 0 && <ul className="inhabitant-detail-list">{detail.verification.notes.map((note) => <li key={note}>{note}</li>)}</ul>}
                  <h4>{copy.sources}</h4>
                  {detail.sources.length ? detail.sources.map((source) => (
                    <article className="inhabitant-source" key={source.id}>
                      <strong>{source.title}</strong>
                      <div className="inhabitant-source-meta">
                        {source.publisher && <span>{copy.publisher}: {source.publisher}</span>}
                        <span>{copy.status}: {source.status}</span>
                        <span>{copy.confidenceLabel}: {source.confidence}</span>
                        {source.location && <span>{copy.location}: {source.location}</span>}
                      </div>
                      {source.note && <p className="inhabitant-source-note">{source.note}</p>}
                    </article>
                  )) : <span className="inhabitant-detail-empty">{copy.notProvided}</span>}
                </section>
              </div>

              <footer className="inhabitant-detail-actions">
                {quantity > 0 ? (
                  <div className="inhabitant-detail-stepper" aria-label={`${copy.quantity}: ${detail.name}`}>
                    <button type="button" onClick={() => setQuantity(detail.id, quantity - 1)} aria-label={`${copy.remove}: ${detail.name}`}>−</button>
                    <output aria-live="polite">{quantity}</output>
                    <button type="button" onClick={() => setQuantity(detail.id, quantity + 1)} aria-label={`${copy.add}: ${detail.name}`}>+</button>
                  </div>
                ) : (
                  <button className="inhabitant-detail-add" type="button" onClick={() => setQuantity(detail.id, 1)}>{copy.add}</button>
                )}
              </footer>
            </aside>
          </div>
        )}
      </>
    );
  }

  window.UI.FishStep = InhabitantDetailFishStep;
  window.UI.inhabitantDetailVersion = 1;
})();
