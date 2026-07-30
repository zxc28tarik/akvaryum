import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function replaceRequired(source, search, replacement, label) {
  if (source.includes(replacement)) return source;
  if (!source.includes(search)) throw new Error(`${label} için beklenen kaynak bulunamadı.`);
  return source.replace(search, replacement);
}

const appPath = resolve(process.cwd(), 'app.jsx');
let app = readFileSync(appPath, 'utf8');
app = replaceRequired(
  app,
  "const { useState, useEffect, useMemo, startTransition } = React;",
  "const { useState, useEffect, useMemo } = React;",
  'App React hookları',
);
app = app.replaceAll("behavior: 'smooth'", "behavior: 'auto'");
app = replaceRequired(
  app,
  `    startTransition(() => {\n      setStepIdx(current => {\n        const maxIndex = Math.max(0, currentFlow.length - 1);\n        const normalized = Math.min(Math.max(0, current), maxIndex);\n        return normalized === expectedIndex ? targetIndex : normalized;\n      });\n    });`,
  `    setStepIdx(current => {\n      const maxIndex = Math.max(0, currentFlow.length - 1);\n      const normalized = Math.min(Math.max(0, current), maxIndex);\n      return normalized === expectedIndex ? targetIndex : normalized;\n    });`,
  'İleri gezinme',
);
app = replaceRequired(
  app,
  `    startTransition(() => {\n      setStepIdx(current => {\n        const maxIndex = Math.max(0, currentFlow.length - 1);\n        const normalized = Math.min(Math.max(0, current), maxIndex);\n        return normalized === expectedIndex ? targetIndex : normalized;\n      });\n    });`,
  `    setStepIdx(current => {\n      const maxIndex = Math.max(0, currentFlow.length - 1);\n      const normalized = Math.min(Math.max(0, current), maxIndex);\n      return normalized === expectedIndex ? targetIndex : normalized;\n    });`,
  'Geri gezinme',
);
app = replaceRequired(
  app,
  `function ScoreBreakdownPanel({ state, lang }) {\n  const model = useMemo(() => buildScorePanelModel(window.Engine.analyze({ ...state, lang }), lang), [state, lang]);`,
  `function ScoreBreakdownPanel({ result, state, lang }) {\n  const model = useMemo(() => buildScorePanelModel(result || window.Engine.analyze({ ...state, lang }), lang), [result, state, lang]);`,
  'Alt skor paneli ortak analiz kullanımı',
);
app = replaceRequired(
  app,
  `function FindingExplanationPanel({ state, lang }) {\n  const model = useMemo(() => buildFindingExplanationModel(window.Engine.analyze({ ...state, lang }), lang), [state, lang]);`,
  `function FindingExplanationPanel({ result, state, lang }) {\n  const model = useMemo(() => buildFindingExplanationModel(result || window.Engine.analyze({ ...state, lang }), lang), [result, state, lang]);`,
  'Bulgu paneli ortak analiz kullanımı',
);
app = replaceRequired(
  app,
  `const RAW_FLOWS = {`,
  `function ResultEnhancements({ state, lang }) {\n  const result = useMemo(() => window.Engine.analyze({ ...state, lang }), [state, lang]);\n  return (\n    <>\n      <ScoreBreakdownPanel result={result} state={state} lang={lang} />\n      <FindingExplanationPanel result={result} state={state} lang={lang} />\n    </>\n  );\n}\n\nconst RAW_FLOWS = {`,
  'Ortak sonuç analizi bileşeni',
);
app = replaceRequired(
  app,
  `if (stepName === 'result') stepEl = <><ResultStep state={state} setState={setState} t={t} lang={lang} /><ScoreBreakdownPanel state={state} lang={lang} /><FindingExplanationPanel state={state} lang={lang} /></>;`,
  `if (stepName === 'result') stepEl = <><ResultStep state={state} setState={setState} t={t} lang={lang} /><ResultEnhancements state={state} lang={lang} /></>;`,
  'Sonuç ekranı ortak analiz bağlantısı',
);
writeFileSync(appPath, app);

const catalogPath = resolve(process.cwd(), 'catalog-filters.jsx');
let catalog = readFileSync(catalogPath, 'utf8');
catalog = replaceRequired(
  catalog,
  `const { useEffect, useMemo, useState, startTransition } = React;`,
  `const { useDeferredValue, useEffect, useMemo, useState } = React;`,
  'Katalog React hookları',
);
catalog = replaceRequired(
  catalog,
  `    const [filters, setFilters] = useState(() => model.parseSearch(window.location.search));\n    const [advancedOpen, setAdvancedOpen] = useState(() => model.activeFilterCount(model.parseSearch(window.location.search)) > 0);`,
  `    const [filters, setFilters] = useState(() => model.parseSearch(window.location.search));\n    const deferredFilters = useDeferredValue(filters);\n    const [advancedOpen, setAdvancedOpen] = useState(() => model.activeFilterCount(model.parseSearch(window.location.search)) > 0);`,
  'Ertelenmiş filtre state’i',
);
catalog = catalog.replace(
  `() => model.filterRecords(records, filters, { water, lang }),\n      [records, filters, water, lang],`,
  `() => model.filterRecords(records, deferredFilters, { water, lang }),\n      [records, deferredFilters, water, lang],`,
);
catalog = catalog.replace(
  `() => model.countByCategory(records, filters, { water, lang }),\n      [records, filters, water, lang],`,
  `() => model.countByCategory(records, deferredFilters, { water, lang }),\n      [records, deferredFilters, water, lang],`,
);
catalog = replaceRequired(
  catalog,
  `    function patchFilter(key, value) {\n      startTransition(() => {\n        setFilters((current) => ({ ...current, [key]: value }));\n      });\n    }`,
  `    function patchFilter(key, value) {\n      setFilters((current) => ({ ...current, [key]: value }));\n    }`,
  'Katalog filtre güncellemesi',
);
catalog = replaceRequired(
  catalog,
  `    function resetFilters() {\n      const defaults = model.createDefaults();\n      setAdvancedOpen(false);\n      window.requestAnimationFrame(() => setFilters(defaults));\n    }`,
  `    function resetFilters() {\n      setAdvancedOpen(false);\n      setFilters(model.createDefaults());\n    }`,
  'Katalog filtre sıfırlama',
);
catalog = replaceRequired(
  catalog,
  `    const selectedRecords = useMemo(() => (\n      (state.fish || []).map((item) => {\n        const record = records.find((candidate) => candidate.id === item.id);\n        return record ? { record, qty: item.qty } : null;\n      }).filter(Boolean)\n    ), [records, state.fish]);`,
  `    const recordById = useMemo(() => new Map(records.map((record) => [record.id, record])), [records]);\n\n    const selectedRecords = useMemo(() => (\n      (state.fish || []).map((item) => {\n        const record = recordById.get(item.id);\n        return record ? { record, qty: item.qty } : null;\n      }).filter(Boolean)\n    ), [recordById, state.fish]);`,
  'Seçili kayıt indekslemesi',
);
catalog = catalog.replace('backdrop-filter:blur(14px)', '');
catalog = catalog.replace(
  'transition:.18s ease}',
  'transition:.18s ease;contain:layout paint style}',
);
catalog = catalog.replace(
  '@media(max-width:640px){.catalog-step{',
  '@media(max-width:640px){.catalog-card,.catalog-card:hover,.catalog-card.is-selected{box-shadow:none;transform:none}.catalog-step{',
);
writeFileSync(catalogPath, catalog);

console.log('Kalan tarayıcı akış düzeltmeleri uygulandı.');
