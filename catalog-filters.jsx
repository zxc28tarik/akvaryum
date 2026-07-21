// AKVARYUM — category and advanced filter UI

(() => {
  'use strict';

  if (!window.React || !window.UI || !window.CatalogFilterModel) {
    throw new Error('Katalog filtre arayüzü için React, UI ve CatalogFilterModel gereklidir.');
  }

  const { useEffect, useMemo, useState } = React;
  const model = window.CatalogFilterModel;
  const PAGE_SIZE = 36;
  const STYLE_ID = 'akvaryum-catalog-filters-style';

  const COPY = {
    tr: {
      eyebrow: 'CANLI KATALOĞU',
      title: 'Canlılarını seç',
      subtitle: 'Kategori ve bakım gereksinimlerine göre listeyi daralt. Filtreler bağlantıda korunur.',
      search: 'Türkçe veya İngilizce ada göre ara',
      categories: { all: 'Tümü', fish: 'Balıklar', invertebrates: 'Omurgasızlar', corals: 'Mercanlar' },
      advanced: 'Gelişmiş filtreler',
      active: 'aktif',
      reset: 'Filtreleri temizle',
      care: 'Bakım zorluğu',
      temperament: 'Mizaç',
      social: 'Sosyal yapı',
      zone: 'Yüzme bölgesi',
      tankMax: 'Azami minimum tank',
      sort: 'Sırala',
      plantSafe: 'Bitki güvenli',
      reefSafe: 'Resif güvenli',
      all: 'Tümü',
      results: 'sonuç',
      selected: 'seçili',
      selectedTitle: 'Seçtiklerin',
      add: 'Ekle',
      remove: 'Çıkar',
      quantity: 'Adet',
      loadMore: 'Daha fazla göster',
      noResults: 'Bu filtrelerle eşleşen canlı bulunamadı.',
      noResultsHint: 'Bir veya daha fazla filtreyi kaldırmayı dene.',
      waterFresh: 'Tatlı su',
      waterSalt: 'Tuzlu su',
      liters: 'L',
      cm: 'cm',
      unknown: 'Bilinmiyor',
      careOptions: { beginner: 'Başlangıç', intermediate: 'Orta', advanced: 'İleri', expert: 'Uzman', unknown: 'Bilinmiyor' },
      temperamentOptions: { peaceful: 'Barışçıl', semi_aggressive: 'Yarı agresif', aggressive: 'Agresif', predatory: 'Avcı', unknown: 'Bilinmiyor' },
      socialOptions: { solitary: 'Tekil', pair: 'Çift', harem: 'Harem', group: 'Grup', school: 'Sürü', colony: 'Koloni', unknown: 'Bilinmiyor' },
      zoneOptions: { surface: 'Yüzey', mid: 'Orta', bottom: 'Dip', rockwork: 'Kayalık', sand: 'Kum', open_water: 'Açık su', unknown: 'Bilinmiyor' },
      sortOptions: { name: 'Ada göre', tank: 'Tank hacmi — küçükten', size: 'Boy — büyükten', difficulty: 'Zorluk — kolaydan' },
      collection: { fish: 'Balık', invertebrates: 'Omurgasız', corals: 'Mercan' },
      minTank: 'Min. tank',
      adultSize: 'Yetişkin boyu',
    },
    en: {
      eyebrow: 'INHABITANT CATALOG',
      title: 'Choose your inhabitants',
      subtitle: 'Narrow the list by category and care needs. Filters are preserved in the URL.',
      search: 'Search by Turkish or English common name',
      categories: { all: 'All', fish: 'Fish', invertebrates: 'Invertebrates', corals: 'Corals' },
      advanced: 'Advanced filters',
      active: 'active',
      reset: 'Clear filters',
      care: 'Care difficulty',
      temperament: 'Temperament',
      social: 'Social structure',
      zone: 'Swimming zone',
      tankMax: 'Maximum minimum tank',
      sort: 'Sort',
      plantSafe: 'Plant-safe',
      reefSafe: 'Reef-safe',
      all: 'All',
      results: 'results',
      selected: 'selected',
      selectedTitle: 'Your selection',
      add: 'Add',
      remove: 'Remove',
      quantity: 'Quantity',
      loadMore: 'Show more',
      noResults: 'No inhabitants match these filters.',
      noResultsHint: 'Try removing one or more filters.',
      waterFresh: 'Freshwater',
      waterSalt: 'Saltwater',
      liters: 'L',
      cm: 'cm',
      unknown: 'Unknown',
      careOptions: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', expert: 'Expert', unknown: 'Unknown' },
      temperamentOptions: { peaceful: 'Peaceful', semi_aggressive: 'Semi-aggressive', aggressive: 'Aggressive', predatory: 'Predatory', unknown: 'Unknown' },
      socialOptions: { solitary: 'Solitary', pair: 'Pair', harem: 'Harem', group: 'Group', school: 'School', colony: 'Colony', unknown: 'Unknown' },
      zoneOptions: { surface: 'Surface', mid: 'Midwater', bottom: 'Bottom', rockwork: 'Rockwork', sand: 'Sand', open_water: 'Open water', unknown: 'Unknown' },
      sortOptions: { name: 'Name', tank: 'Tank volume — ascending', size: 'Adult size — descending', difficulty: 'Difficulty — easiest' },
      collection: { fish: 'Fish', invertebrates: 'Invertebrate', corals: 'Coral' },
      minTank: 'Min. tank',
      adultSize: 'Adult size',
    },
  };

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .catalog-step{width:min(1180px,calc(100% - 32px));margin:0 auto 120px;color:#0a1f2e}
      .catalog-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin:24px 0 22px}
      .catalog-eyebrow{margin:0 0 8px;font:600 12px/1.2 Inter,sans-serif;letter-spacing:.18em;color:#258b92}
      .catalog-title{margin:0;font:600 clamp(32px,5vw,58px)/1.02 Lora,serif;letter-spacing:-.035em}
      .catalog-subtitle{max-width:720px;margin:12px 0 0;color:#48636b;font:400 15px/1.65 Inter,sans-serif}
      .catalog-water-badge{flex:none;padding:10px 14px;border:1px solid #c3dcdd;border-radius:999px;background:rgba(255,255,255,.75);font:600 12px/1 Inter,sans-serif;color:#236c73}
      .catalog-toolbar{position:sticky;top:68px;z-index:8;padding:14px;border:1px solid rgba(169,207,210,.9);border-radius:20px;background:rgba(244,251,251,.94);box-shadow:0 14px 38px rgba(27,84,89,.08);backdrop-filter:blur(14px)}
      .catalog-search-row{display:grid;grid-template-columns:minmax(220px,1fr) auto auto;gap:10px;align-items:center}
      .catalog-search{width:100%;box-sizing:border-box;padding:13px 15px;border:1px solid #bdd7d9;border-radius:13px;background:#fff;color:#0a1f2e;font:500 14px/1.2 Inter,sans-serif;outline:none}
      .catalog-search:focus,.catalog-select:focus{border-color:#258b92;box-shadow:0 0 0 3px rgba(37,139,146,.13)}
      .catalog-filter-toggle,.catalog-reset,.catalog-more{border:1px solid #b8d4d6;border-radius:12px;background:#fff;color:#155d64;font:600 13px/1 Inter,sans-serif;cursor:pointer;transition:.18s ease}
      .catalog-filter-toggle{padding:13px 15px}.catalog-reset{padding:13px 14px}.catalog-more{display:block;margin:22px auto 0;padding:13px 22px}
      .catalog-filter-toggle:hover,.catalog-reset:hover,.catalog-more:hover{border-color:#258b92;transform:translateY(-1px)}
      .catalog-count-pill{display:inline-flex;min-width:18px;height:18px;align-items:center;justify-content:center;margin-left:7px;padding:0 5px;border-radius:999px;background:#d9eeee;color:#155d64;font-size:10px}
      .catalog-tabs{display:flex;gap:8px;margin-top:12px;overflow-x:auto;padding-bottom:2px}
      .catalog-tab{white-space:nowrap;border:1px solid #c2dcde;border-radius:999px;padding:9px 13px;background:rgba(255,255,255,.76);color:#41656a;font:600 12px/1 Inter,sans-serif;cursor:pointer}
      .catalog-tab[aria-pressed=true]{border-color:#1d7c83;background:#1d7c83;color:#fff}
      .catalog-advanced{display:grid;grid-template-columns:repeat(4,minmax(150px,1fr));gap:12px;margin-top:14px;padding-top:14px;border-top:1px solid #d4e7e8}
      .catalog-field{display:grid;gap:6px}.catalog-label{font:600 11px/1.2 Inter,sans-serif;color:#54747a;letter-spacing:.02em}
      .catalog-select{width:100%;padding:11px 12px;border:1px solid #c2d9db;border-radius:11px;background:#fff;color:#15363c;font:500 13px/1.2 Inter,sans-serif;outline:none}
      .catalog-checks{display:flex;align-items:center;gap:16px;grid-column:span 2;padding:4px 2px}
      .catalog-check{display:flex;align-items:center;gap:8px;color:#284e54;font:600 13px/1.2 Inter,sans-serif;cursor:pointer}.catalog-check input{width:17px;height:17px;accent-color:#1d7c83}
      .catalog-summary{display:flex;justify-content:space-between;gap:12px;align-items:center;margin:18px 2px 12px;color:#4f6c72;font:600 13px/1.3 Inter,sans-serif}
      .catalog-selected{margin:0 0 18px;padding:16px;border:1px solid #c8dfe1;border-radius:18px;background:rgba(255,255,255,.72)}
      .catalog-selected-title{display:flex;justify-content:space-between;align-items:center;margin:0 0 11px;font:600 14px/1.2 Inter,sans-serif}
      .catalog-selected-list{display:flex;flex-wrap:wrap;gap:9px}.catalog-selected-item{display:flex;align-items:center;gap:8px;padding:7px 8px 7px 11px;border-radius:999px;background:#e8f4f4;color:#1b555b;font:600 12px/1 Inter,sans-serif}
      .catalog-selected-item button{width:25px;height:25px;border:0;border-radius:50%;background:#fff;color:#1b555b;font:700 15px/1 Inter,sans-serif;cursor:pointer}
      .catalog-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
      .catalog-card{position:relative;display:grid;grid-template-columns:auto 1fr;gap:13px;min-height:164px;padding:17px;border:1px solid #c7dfe0;border-radius:18px;background:rgba(255,255,255,.9);box-shadow:0 10px 30px rgba(28,75,80,.055);transition:.18s ease}
      .catalog-card:hover{border-color:#86bfc3;transform:translateY(-2px);box-shadow:0 14px 34px rgba(28,75,80,.09)}
      .catalog-card.is-selected{border-color:#258b92;box-shadow:0 0 0 2px rgba(37,139,146,.11),0 14px 34px rgba(28,75,80,.09)}
      .catalog-swatch{width:45px;height:45px;border-radius:14px;background:linear-gradient(135deg,var(--c1,#8ac9ce),var(--c2,#276e76));box-shadow:inset 0 0 0 1px rgba(255,255,255,.55)}
      .catalog-card-body{min-width:0}.catalog-card-kicker{display:flex;justify-content:space-between;gap:8px;margin-bottom:5px;color:#4a777c;font:700 10px/1.2 Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase}
      .catalog-card h3{margin:0;font:600 18px/1.18 Lora,serif;letter-spacing:-.015em}.catalog-scientific{margin:4px 0 10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#71878b;font:italic 12px/1.2 Lora,serif}
      .catalog-meta{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:13px}.catalog-meta span{padding:6px 8px;border-radius:8px;background:#edf6f6;color:#385e63;font:600 10px/1 Inter,sans-serif}
      .catalog-card-action{grid-column:1/-1;display:flex;justify-content:flex-end;align-items:center;min-height:34px}
      .catalog-add{border:0;border-radius:10px;padding:10px 16px;background:#176e75;color:#fff;font:700 12px/1 Inter,sans-serif;cursor:pointer}
      .catalog-stepper{display:flex;align-items:center;gap:8px}.catalog-stepper button{width:34px;height:34px;border:1px solid #b5d1d3;border-radius:10px;background:#fff;color:#176e75;font:700 18px/1 Inter,sans-serif;cursor:pointer}.catalog-stepper output{min-width:28px;text-align:center;font:700 14px/1 Inter,sans-serif;color:#153f45}
      .catalog-empty{padding:54px 24px;text-align:center;border:1px dashed #aacdce;border-radius:20px;background:rgba(255,255,255,.55)}.catalog-empty strong{display:block;margin-bottom:7px;font:600 20px/1.3 Lora,serif}.catalog-empty span{color:#668086;font:400 14px/1.5 Inter,sans-serif}
      @media(max-width:920px){.catalog-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.catalog-advanced{grid-template-columns:repeat(2,minmax(150px,1fr))}.catalog-toolbar{top:58px}}
      @media(max-width:640px){.catalog-step{width:min(100% - 20px,1180px);margin-bottom:150px}.catalog-head{align-items:flex-start;flex-direction:column}.catalog-water-badge{align-self:flex-start}.catalog-toolbar{position:relative;top:auto;padding:11px}.catalog-search-row{grid-template-columns:1fr 1fr}.catalog-search{grid-column:1/-1}.catalog-grid{grid-template-columns:1fr}.catalog-advanced{grid-template-columns:1fr}.catalog-checks{grid-column:1;flex-direction:column;align-items:flex-start;gap:10px}.catalog-summary{align-items:flex-start;flex-direction:column}.catalog-title{font-size:38px}}
    `;
    document.head.append(style);
  }

  function optionList(allLabel, values, labels) {
    return [
      <option key="all" value="all">{allLabel}</option>,
      ...values.map((value) => <option key={value} value={value}>{labels[value]}</option>),
    ];
  }

  function recordView(record, lang) {
    const name = model.recordName(record, lang);
    const scientificName = record?.scientificName || record?.sci || '';
    const colors = record?.appearance?.colors || record?.color || ['#8ac9ce', '#276e76'];
    const collection = model.recordCollection(record);
    return {
      id: record.id,
      name,
      scientificName,
      colors,
      collection,
      tank: model.recordTankVolume(record),
      size: model.recordAdultSize(record),
      care: model.recordCare(record),
      temperament: model.recordTemperament(record),
    };
  }

  function CatalogFishStep({ state, setState, lang }) {
    ensureStyles();
    const copy = COPY[lang] || COPY.tr;
    const [filters, setFilters] = useState(() => model.parseSearch(window.location.search));
    const [advancedOpen, setAdvancedOpen] = useState(() => model.activeFilterCount(model.parseSearch(window.location.search)) > 0);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    const records = window.DB?.inhabitantCatalog?.all || window.DB?.inhabitants || window.DB?.fish || [];
    const water = state.water || null;

    useEffect(() => {
      const onPopState = () => setFilters(model.parseSearch(window.location.search));
      window.addEventListener('popstate', onPopState);
      return () => window.removeEventListener('popstate', onPopState);
    }, []);

    useEffect(() => {
      const nextSearch = model.serializeSearch(filters, window.location.search);
      if (nextSearch !== window.location.search) {
        const nextUrl = `${window.location.pathname}${nextSearch}${window.location.hash}`;
        window.history.replaceState(window.history.state, '', nextUrl);
      }
      setVisibleCount(PAGE_SIZE);
    }, [filters]);

    const filtered = useMemo(
      () => model.filterRecords(records, filters, { water, lang }),
      [records, filters, water, lang],
    );

    const categoryCounts = useMemo(
      () => model.countByCategory(records, filters, { water, lang }),
      [records, filters, water, lang],
    );

    const selectedMap = useMemo(
      () => new Map((state.fish || []).map((item) => [item.id, item.qty])),
      [state.fish],
    );

    const selectedRecords = useMemo(() => (
      (state.fish || []).map((item) => {
        const record = records.find((candidate) => candidate.id === item.id);
        return record ? { record, qty: item.qty } : null;
      }).filter(Boolean)
    ), [records, state.fish]);

    const activeCount = model.activeFilterCount(filters);
    const visibleRecords = filtered.slice(0, visibleCount);
    const totalSelected = (state.fish || []).reduce((sum, item) => sum + item.qty, 0);

    function patchFilter(key, value) {
      setFilters((current) => ({ ...current, [key]: value }));
    }

    function resetFilters() {
      setFilters(model.createDefaults());
      setAdvancedOpen(false);
    }

    function setQuantity(id, nextQuantity) {
      setState((current) => {
        const fish = [...(current.fish || [])];
        const index = fish.findIndex((item) => item.id === id);
        const quantity = Math.max(0, Math.min(99, Number(nextQuantity) || 0));

        if (quantity === 0 && index >= 0) fish.splice(index, 1);
        else if (index >= 0) fish[index] = { ...fish[index], qty: quantity };
        else if (quantity > 0) fish.push({ id, qty: quantity });

        return { ...current, fish };
      });
    }

    return (
      <section className="catalog-step" aria-labelledby="catalog-title">
        <header className="catalog-head">
          <div>
            <p className="catalog-eyebrow">{copy.eyebrow}</p>
            <h1 className="catalog-title" id="catalog-title">{copy.title}</h1>
            <p className="catalog-subtitle">{copy.subtitle}</p>
          </div>
          <span className="catalog-water-badge">
            {water === 'salt' ? copy.waterSalt : copy.waterFresh}
          </span>
        </header>

        <div className="catalog-toolbar">
          <div className="catalog-search-row">
            <input
              className="catalog-search"
              type="search"
              value={filters.q}
              onChange={(event) => patchFilter('q', event.target.value)}
              placeholder={copy.search}
              aria-label={copy.search}
            />
            <button
              className="catalog-filter-toggle"
              type="button"
              aria-expanded={advancedOpen}
              onClick={() => setAdvancedOpen((value) => !value)}
            >
              {copy.advanced}
              {activeCount > 0 && <span className="catalog-count-pill">{activeCount}</span>}
            </button>
            <button className="catalog-reset" type="button" onClick={resetFilters} disabled={activeCount === 0}>
              {copy.reset}
            </button>
          </div>

          <div className="catalog-tabs" role="group" aria-label={copy.categories.all}>
            {['all', 'fish', 'invertebrates', 'corals'].map((category) => (
              <button
                key={category}
                className="catalog-tab"
                type="button"
                aria-pressed={filters.category === category}
                onClick={() => patchFilter('category', category)}
              >
                {copy.categories[category]} <span aria-hidden="true">{categoryCounts[category]}</span>
              </button>
            ))}
          </div>

          {advancedOpen && (
            <div className="catalog-advanced">
              <label className="catalog-field">
                <span className="catalog-label">{copy.care}</span>
                <select className="catalog-select" value={filters.care} onChange={(event) => patchFilter('care', event.target.value)}>
                  {optionList(copy.all, ['beginner', 'intermediate', 'advanced', 'expert', 'unknown'], copy.careOptions)}
                </select>
              </label>

              <label className="catalog-field">
                <span className="catalog-label">{copy.temperament}</span>
                <select className="catalog-select" value={filters.temperament} onChange={(event) => patchFilter('temperament', event.target.value)}>
                  {optionList(copy.all, ['peaceful', 'semi_aggressive', 'aggressive', 'predatory', 'unknown'], copy.temperamentOptions)}
                </select>
              </label>

              <label className="catalog-field">
                <span className="catalog-label">{copy.social}</span>
                <select className="catalog-select" value={filters.social} onChange={(event) => patchFilter('social', event.target.value)}>
                  {optionList(copy.all, ['solitary', 'pair', 'harem', 'group', 'school', 'colony', 'unknown'], copy.socialOptions)}
                </select>
              </label>

              <label className="catalog-field">
                <span className="catalog-label">{copy.zone}</span>
                <select className="catalog-select" value={filters.zone} onChange={(event) => patchFilter('zone', event.target.value)}>
                  {optionList(copy.all, ['surface', 'mid', 'bottom', 'rockwork', 'sand', 'open_water', 'unknown'], copy.zoneOptions)}
                </select>
              </label>

              <label className="catalog-field">
                <span className="catalog-label">{copy.tankMax}</span>
                <select className="catalog-select" value={filters.tankMax} onChange={(event) => patchFilter('tankMax', Number(event.target.value))}>
                  <option value="0">{copy.all}</option>
                  {[40, 80, 150, 300].map((value) => <option key={value} value={value}>≤ {value} {copy.liters}</option>)}
                </select>
              </label>

              <label className="catalog-field">
                <span className="catalog-label">{copy.sort}</span>
                <select className="catalog-select" value={filters.sort} onChange={(event) => patchFilter('sort', event.target.value)}>
                  {Object.entries(copy.sortOptions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>

              <div className="catalog-checks">
                <label className="catalog-check">
                  <input type="checkbox" checked={filters.plantSafe} onChange={(event) => patchFilter('plantSafe', event.target.checked)} />
                  {copy.plantSafe}
                </label>
                <label className="catalog-check">
                  <input type="checkbox" checked={filters.reefSafe} onChange={(event) => patchFilter('reefSafe', event.target.checked)} />
                  {copy.reefSafe}
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="catalog-summary" aria-live="polite">
          <span>{filtered.length} {copy.results}</span>
          <span>{totalSelected} {copy.selected}</span>
        </div>

        {selectedRecords.length > 0 && (
          <aside className="catalog-selected" aria-label={copy.selectedTitle}>
            <h2 className="catalog-selected-title">
              <span>{copy.selectedTitle}</span>
              <span>{totalSelected}</span>
            </h2>
            <div className="catalog-selected-list">
              {selectedRecords.map(({ record, qty }) => (
                <span className="catalog-selected-item" key={record.id}>
                  {model.recordName(record, lang)} × {qty}
                  <button type="button" onClick={() => setQuantity(record.id, 0)} aria-label={`${copy.remove}: ${model.recordName(record, lang)}`}>×</button>
                </span>
              ))}
            </div>
          </aside>
        )}

        {visibleRecords.length === 0 ? (
          <div className="catalog-empty">
            <strong>{copy.noResults}</strong>
            <span>{copy.noResultsHint}</span>
          </div>
        ) : (
          <div className="catalog-grid">
            {visibleRecords.map((record) => {
              const view = recordView(record, lang);
              const quantity = selectedMap.get(record.id) || 0;
              const selected = quantity > 0;
              return (
                <article className={`catalog-card${selected ? ' is-selected' : ''}`} key={record.id}>
                  <div className="catalog-swatch" style={{ '--c1': view.colors[0], '--c2': view.colors[1] }} aria-hidden="true" />
                  <div className="catalog-card-body">
                    <div className="catalog-card-kicker">
                      <span>{copy.collection[view.collection]}</span>
                      <span>{copy.careOptions[view.care] || copy.unknown}</span>
                    </div>
                    <h3>{view.name}</h3>
                    <p className="catalog-scientific">{view.scientificName}</p>
                    <div className="catalog-meta">
                      <span>{copy.minTank}: {view.tank || '—'} {view.tank ? copy.liters : ''}</span>
                      <span>{copy.adultSize}: {view.size || '—'} {view.size ? copy.cm : ''}</span>
                      <span>{copy.temperamentOptions[view.temperament] || copy.unknown}</span>
                    </div>
                  </div>
                  <div className="catalog-card-action">
                    {selected ? (
                      <div className="catalog-stepper" aria-label={`${copy.quantity}: ${view.name}`}>
                        <button type="button" onClick={() => setQuantity(record.id, quantity - 1)} aria-label={`${copy.remove}: ${view.name}`}>−</button>
                        <output aria-live="polite">{quantity}</output>
                        <button type="button" onClick={() => setQuantity(record.id, quantity + 1)} aria-label={`${copy.add}: ${view.name}`}>+</button>
                      </div>
                    ) : (
                      <button className="catalog-add" type="button" onClick={() => setQuantity(record.id, 1)}>{copy.add}</button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {visibleCount < filtered.length && (
          <button className="catalog-more" type="button" onClick={() => setVisibleCount((value) => value + PAGE_SIZE)}>
            {copy.loadMore} ({Math.min(PAGE_SIZE, filtered.length - visibleCount)})
          </button>
        )}
      </section>
    );
  }

  window.UI.FishStep = CatalogFishStep;
  window.UI.catalogFiltersVersion = 1;
})();
