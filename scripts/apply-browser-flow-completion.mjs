import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Bu betik idempotenttir; son kullanıcı akışı düzeltmelerini yeniden doğrulamak için CI'ı tetikler.
function replaceRequired(source, search, replacement, label) {
  if (source.includes(replacement)) return source;
  if (!source.includes(search)) throw new Error(`${label} için beklenen kaynak bulunamadı.`);
  return source.replace(search, replacement);
}

const appPath = resolve(process.cwd(), 'app.jsx');
let app = readFileSync(appPath, 'utf8');

app = replaceRequired(
  app,
  "const { useState, useEffect, useMemo } = React;",
  "const { useState, useEffect, useLayoutEffect, useMemo } = React;",
  'App React hookları',
);

app = app.replaceAll("behavior: 'smooth'", "behavior: 'auto'");

const transitionNavigation = `    startTransition(() => {\n      setStepIdx(current => {\n        const maxIndex = Math.max(0, currentFlow.length - 1);\n        const normalized = Math.min(Math.max(0, current), maxIndex);\n        return normalized === expectedIndex ? targetIndex : normalized;\n      });\n    });`;
const directNavigation = `    setStepIdx(current => {\n      const maxIndex = Math.max(0, currentFlow.length - 1);\n      const normalized = Math.min(Math.max(0, current), maxIndex);\n      return normalized === expectedIndex ? targetIndex : normalized;\n    });`;
app = app.replaceAll(transitionNavigation, directNavigation);

app = replaceRequired(
  app,
  `  useEffect(() => {\n    if (!state.water) return;`,
  `  useLayoutEffect(() => {\n    if (!state.water) return;`,
  'Su tipi seçim temizliği layout effect',
);

app = replaceRequired(
  app,
  `        const definition = window.DB?.fish?.find(candidate => candidate.id === item.id);\n        return definition?.water === current.water;`,
  `        const definition = window.DB?.fish?.find(candidate => candidate.id === item.id);\n        const waterTypes = Array.isArray(definition?.water?.types)\n          ? definition.water.types\n          : [definition?.water];\n        return waterTypes.includes(current.water);`,
  'Su tipi uyumluluk temizliği',
);

app = replaceRequired(
  app,
  `  const showRecipe = stepName !== 'path' && stepName !== 'result';`,
  `  const showRecipe = stepName !== 'path' && stepName !== 'fish' && stepName !== 'result';`,
  'Balık adımında gereksiz tarif şeridi',
);

writeFileSync(appPath, app);

const catalogPath = resolve(process.cwd(), 'catalog-filters.jsx');
let catalog = readFileSync(catalogPath, 'utf8');

catalog = replaceRequired(
  catalog,
  `    const records = window.DB?.inhabitantCatalog?.all || window.DB?.inhabitants || window.DB?.fish || [];`,
  `    const records = window.DB?.fish || window.DB?.inhabitantCatalog?.all || window.DB?.inhabitants || [];`,
  'Sabit katalog veri dizisi',
);

catalog = replaceRequired(
  catalog,
  `    function resetFilters() {\n      setAdvancedOpen(false);\n      setFilters(model.createDefaults());\n    }`,
  `    function resetFilters() {\n      const defaults = model.createDefaults();\n      const nextSearch = model.serializeSearch(defaults, window.location.search);\n      const nextUrl = \`${'${window.location.pathname}${nextSearch}${window.location.hash}'}\`;\n      window.history.replaceState(window.history.state, '', nextUrl);\n      ReactDOM.flushSync(() => {\n        setAdvancedOpen(false);\n        setFilters(defaults);\n        setVisibleCount(PAGE_SIZE);\n      });\n    }`,
  'Filtre sıfırlama state ve URL senkronizasyonu',
);

writeFileSync(catalogPath, catalog);
console.log('Kalan tarayıcı akış düzeltmeleri uygulandı.');
