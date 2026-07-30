import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function replaceRequired(source, search, replacement, label) {
  if (source.includes(replacement)) return source;
  if (!source.includes(search)) throw new Error(`${label} bulunamadı.`);
  return source.replace(search, replacement);
}

const appPath = resolve(process.cwd(), 'app.jsx');
let appSource = readFileSync(appPath, 'utf8');
appSource = replaceRequired(
  appSource,
  'const { useState, useEffect, useMemo } = React;',
  'const { useState, useEffect, useMemo, startTransition } = React;',
  'App React importu',
);

const oldNext = `  function next() {
    const currentFlow = flowFor(state);
    const expectedIndex = safeStepIdx;
    const targetIndex = Math.min(expectedIndex + 1, Math.max(0, currentFlow.length - 1));
    setStepIdx(current => {
      const maxIndex = Math.max(0, currentFlow.length - 1);
      const normalized = Math.min(Math.max(0, current), maxIndex);
      return normalized === expectedIndex ? targetIndex : normalized;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }`;
const newNext = `  function next() {
    const currentFlow = flowFor(state);
    const expectedIndex = safeStepIdx;
    const targetIndex = Math.min(expectedIndex + 1, Math.max(0, currentFlow.length - 1));
    startTransition(() => {
      setStepIdx(current => {
        const maxIndex = Math.max(0, currentFlow.length - 1);
        const normalized = Math.min(Math.max(0, current), maxIndex);
        return normalized === expectedIndex ? targetIndex : normalized;
      });
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }`;
appSource = replaceRequired(appSource, oldNext, newNext, 'İleri geçişi');

const oldBack = `  function back() {
    const currentFlow = flowFor(state);
    const expectedIndex = safeStepIdx;
    const targetIndex = Math.max(0, expectedIndex - 1);
    setStepIdx(current => {
      const maxIndex = Math.max(0, currentFlow.length - 1);
      const normalized = Math.min(Math.max(0, current), maxIndex);
      return normalized === expectedIndex ? targetIndex : normalized;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }`;
const newBack = `  function back() {
    const currentFlow = flowFor(state);
    const expectedIndex = safeStepIdx;
    const targetIndex = Math.max(0, expectedIndex - 1);
    startTransition(() => {
      setStepIdx(current => {
        const maxIndex = Math.max(0, currentFlow.length - 1);
        const normalized = Math.min(Math.max(0, current), maxIndex);
        return normalized === expectedIndex ? targetIndex : normalized;
      });
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }`;
appSource = replaceRequired(appSource, oldBack, newBack, 'Geri geçişi');
writeFileSync(appPath, appSource);

const catalogPath = resolve(process.cwd(), 'catalog-filters.jsx');
let catalogSource = readFileSync(catalogPath, 'utf8');
catalogSource = replaceRequired(
  catalogSource,
  '  const { useEffect, useMemo, useState } = React;',
  '  const { useEffect, useMemo, useState, startTransition } = React;',
  'Katalog React importu',
);
catalogSource = replaceRequired(
  catalogSource,
  `    function patchFilter(key, value) {
      setFilters((current) => ({ ...current, [key]: value }));
    }`,
  `    function patchFilter(key, value) {
      startTransition(() => {
        setFilters((current) => ({ ...current, [key]: value }));
      });
    }`,
  'Filtre güncellemesi',
);
catalogSource = replaceRequired(
  catalogSource,
  `    function resetFilters() {
      setFilters(model.createDefaults());
      setAdvancedOpen(false);
    }`,
  `    function resetFilters() {
      startTransition(() => setFilters(model.createDefaults()));
      setAdvancedOpen(false);
    }`,
  'Filtre sıfırlama',
);
writeFileSync(catalogPath, catalogSource);

console.log('Etkileşim geçişleri startTransition ile ayrıştırıldı.');
