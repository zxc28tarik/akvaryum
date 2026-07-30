import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function mustReplace(source, search, replacement, label) {
  if (source.includes(replacement)) return source;
  if (!source.includes(search)) throw new Error(`${label} bulunamadı.`);
  return source.replace(search, replacement);
}

const appPath = resolve('app.jsx');
let app = readFileSync(appPath, 'utf8');
app = mustReplace(
  app,
  "const { useState, useEffect, useLayoutEffect, useMemo } = React;",
  "const { useState, useEffect, useLayoutEffect, useMemo, useRef } = React;",
  'React hook satırı',
);
app = mustReplace(
  app,
  `  const [stepIdx, setStepIdx] = useState(0);`,
  `  const [stepIdx, setStepIdx] = useState(0);\n  const navigationPendingRef = useRef(false);`,
  'Navigasyon kilidi',
);

const oldNavigation = `  function next() {\n    const currentFlow = flowFor(state);\n    const expectedIndex = safeStepIdx;\n    const targetIndex = Math.min(expectedIndex + 1, Math.max(0, currentFlow.length - 1));\n    setStepIdx(current => {\n      const maxIndex = Math.max(0, currentFlow.length - 1);\n      const normalized = Math.min(Math.max(0, current), maxIndex);\n      return normalized === expectedIndex ? targetIndex : normalized;\n    });\n    window.scrollTo({ top: 0, behavior: 'auto' });\n  }\n  function back() {\n    const currentFlow = flowFor(state);\n    const expectedIndex = safeStepIdx;\n    const targetIndex = Math.max(0, expectedIndex - 1);\n    setStepIdx(current => {\n      const maxIndex = Math.max(0, currentFlow.length - 1);\n      const normalized = Math.min(Math.max(0, current), maxIndex);\n      return normalized === expectedIndex ? targetIndex : normalized;\n    });\n    window.scrollTo({ top: 0, behavior: 'auto' });\n  }\n  function jumpTo(target) {\n    const currentFlow = flowFor(state);\n    setStepIdx(current => {\n      const normalized = Math.min(Math.max(0, current), Math.max(0, currentFlow.length - 1));\n      const targetIndex = typeof target === 'number' ? target : currentFlow.indexOf(target);\n      return targetIndex >= 0 && targetIndex < currentFlow.length ? targetIndex : normalized;\n    });\n    window.scrollTo({ top: 0, behavior: 'auto' });\n  }`;

const newNavigation = `  function scheduleStepChange(expectedIndex, targetIndex, currentFlow) {\n    if (navigationPendingRef.current) return;\n    navigationPendingRef.current = true;\n    window.setTimeout(() => {\n      setStepIdx(current => {\n        const maxIndex = Math.max(0, currentFlow.length - 1);\n        const normalized = Math.min(Math.max(0, current), maxIndex);\n        return normalized === expectedIndex ? targetIndex : normalized;\n      });\n      navigationPendingRef.current = false;\n    }, 0);\n  }\n  function next() {\n    const currentFlow = flowFor(state);\n    const expectedIndex = safeStepIdx;\n    const targetIndex = Math.min(expectedIndex + 1, Math.max(0, currentFlow.length - 1));\n    scheduleStepChange(expectedIndex, targetIndex, currentFlow);\n    window.scrollTo({ top: 0, behavior: 'auto' });\n  }\n  function back() {\n    const currentFlow = flowFor(state);\n    const expectedIndex = safeStepIdx;\n    const targetIndex = Math.max(0, expectedIndex - 1);\n    scheduleStepChange(expectedIndex, targetIndex, currentFlow);\n    window.scrollTo({ top: 0, behavior: 'auto' });\n  }\n  function jumpTo(target) {\n    const currentFlow = flowFor(state);\n    const expectedIndex = safeStepIdx;\n    const targetIndex = typeof target === 'number' ? target : currentFlow.indexOf(target);\n    if (targetIndex >= 0 && targetIndex < currentFlow.length) {\n      scheduleStepChange(expectedIndex, targetIndex, currentFlow);\n    }\n    window.scrollTo({ top: 0, behavior: 'auto' });\n  }`;
app = mustReplace(app, oldNavigation, newNavigation, 'Olay sınırına alınmış navigasyon');
writeFileSync(appPath, app);

const catalogPath = resolve('catalog-filters.jsx');
let catalog = readFileSync(catalogPath, 'utf8');
const oldReset = `    function resetFilters() {\n      const defaults = model.createDefaults();\n      const nextSearch = model.serializeSearch(defaults, window.location.search);\n      const nextUrl = \`${'${window.location.pathname}${nextSearch}${window.location.hash}'}\`;\n      window.history.replaceState(window.history.state, '', nextUrl);\n      ReactDOM.flushSync(() => {\n        setAdvancedOpen(false);\n        setFilters(defaults);\n        setVisibleCount(PAGE_SIZE);\n      });\n    }`;
const newReset = `    function resetFilters() {\n      const defaults = model.createDefaults();\n      const nextSearch = model.serializeSearch(defaults, window.location.search);\n      const nextUrl = \`${'${window.location.pathname}${nextSearch}${window.location.hash}'}\`;\n      window.history.replaceState(window.history.state, '', nextUrl);\n      window.setTimeout(() => {\n        setAdvancedOpen(false);\n        setFilters(defaults);\n        setVisibleCount(PAGE_SIZE);\n      }, 0);\n    }`;
catalog = mustReplace(catalog, oldReset, newReset, 'Olay sınırına alınmış filtre sıfırlama');
writeFileSync(catalogPath, catalog);
console.log('Tarayıcı olay sınırı düzeltmeleri uygulandı.');
