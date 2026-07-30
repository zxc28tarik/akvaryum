import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function replaceRequired(source, search, replacement, label) {
  if (source.includes(replacement)) return source;
  if (!source.includes(search)) throw new Error(`${label} için beklenen kaynak bulunamadı.`);
  return source.replace(search, replacement);
}

const catalogPath = resolve(process.cwd(), 'catalog-filters.jsx');
let catalog = readFileSync(catalogPath, 'utf8');

catalog = replaceRequired(catalog, 'const PAGE_SIZE = 36;', 'const PAGE_SIZE = 18;', 'İlk katalog sayfa boyutu');

catalog = replaceRequired(
  catalog,
  `  function CatalogFishStep({ state, setState, lang }) {\n    ensureStyles();`,
  `  ensureStyles();\n\n  function CatalogFishStep({ state, setState, lang }) {`,
  'Katalog stillerini açılıştan önce hazırlama',
);

catalog = replaceRequired(
  catalog,
  `    const records = window.DB?.fish || window.DB?.inhabitantCatalog?.all || window.DB?.inhabitants || [];\n    const water = state.water || null;`,
  `    const allRecords = window.DB?.fish || window.DB?.inhabitantCatalog?.all || window.DB?.inhabitants || [];\n    const water = state.water || null;\n    const records = useMemo(() => (\n      water ? allRecords.filter((record) => model.recordWaterTypes(record).includes(water)) : allRecords\n    ), [allRecords, water]);`,
  'Su tipine göre katalog ön elemesi',
);

catalog = catalog.replace(
  `() => model.filterRecords(records, deferredFilters, { water, lang }),\n      [records, deferredFilters, water, lang],`,
  `() => model.filterRecords(records, deferredFilters, { lang }),\n      [records, deferredFilters, lang],`,
);
catalog = catalog.replace(
  `() => model.countByCategory(records, deferredFilters, { water, lang }),\n      [records, deferredFilters, water, lang],`,
  `() => model.countByCategory(records, deferredFilters, { lang }),\n      [records, deferredFilters, lang],`,
);

catalog = replaceRequired(
  catalog,
  `    function resetFilters() {\n      const defaults = model.createDefaults();\n      const nextSearch = model.serializeSearch(defaults, window.location.search);\n      const nextUrl = \`${'${window.location.pathname}${nextSearch}${window.location.hash}'}\`;\n      window.history.replaceState(window.history.state, '', nextUrl);\n      window.setTimeout(() => {\n        setAdvancedOpen(false);\n        setFilters(defaults);\n        setVisibleCount(PAGE_SIZE);\n      }, 0);\n    }`,
  `    function resetFilters() {\n      const defaults = model.createDefaults();\n      setAdvancedOpen(false);\n      setFilters(defaults);\n      setVisibleCount(PAGE_SIZE);\n    }`,
  'Senkron filtre sıfırlama state güncellemesi',
);

catalog = catalog.replace(
  `.catalog-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}`,
  `.catalog-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;contain:layout style}`,
);
catalog = catalog.replace(
  `.catalog-card{position:relative;display:grid;grid-template-columns:auto 1fr;gap:13px;min-height:164px;`,
  `.catalog-card{position:relative;display:grid;grid-template-columns:auto 1fr;gap:13px;min-height:164px;content-visibility:auto;contain-intrinsic-size:164px;`,
);

writeFileSync(catalogPath, catalog);

const validatorPath = resolve(process.cwd(), 'scripts/lib/validate-catalog-filters.mjs');
let validator = readFileSync(validatorPath, 'utf8');
validator = replaceRequired(
  validator,
  `assert.match(uiSource, /PAGE_SIZE\\s*=\\s*36/, 'Büyük katalog kontrollü dilimlerle gösterilmelidir.');`,
  `assert.match(uiSource, /PAGE_SIZE\\s*=\\s*18/, 'Büyük katalog kontrollü ve hızlı dilimlerle gösterilmelidir.');`,
  'Katalog sayfa boyutu doğrulaması',
);
writeFileSync(validatorPath, validator);

console.log('Katalog etkileşim ve ilk render düzeltmeleri uygulandı.');
