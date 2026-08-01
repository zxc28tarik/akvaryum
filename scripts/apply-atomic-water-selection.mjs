import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const appPath = resolve(process.cwd(), 'app.jsx');
let source = readFileSync(appPath, 'utf8');

source = source.replace(
  'const { useState, useEffect, useLayoutEffect, useMemo, useRef } = React;',
  'const { useState, useEffect, useMemo, useRef } = React;',
);

const oldCleanup = `  useEffect(() => { setState(s => ({ ...s, lang })); }, [lang]);
  useLayoutEffect(() => {
    if (!state.water) return;
    setState(current => {
      const originalFish = current.fish || [];
      const originalPlants = current.plants || [];
      const fish = originalFish.filter(item => {
        const definition = window.DB?.fish?.find(candidate => candidate.id === item.id);
        const waterTypes = Array.isArray(definition?.water?.types)
          ? definition.water.types
          : [definition?.water];
        return waterTypes.includes(current.water);
      });
      const plants = current.water === 'fresh' ? originalPlants : [];
      const substrateDefinition = window.DB?.substrates?.find(item => item.id === current.substrate);
      const substrate = substrateDefinition?.water?.includes(current.water) ? current.substrate : null;
      const changed = fish.length !== originalFish.length
        || plants.length !== originalPlants.length
        || substrate !== current.substrate;
      return changed ? { ...current, fish, plants, substrate } : current;
    });
  }, [state.water]);`;

const atomicCleanup = `  useEffect(() => { setState(s => ({ ...s, lang })); }, [lang]);
  function setWaterState(updater) {
    setState(current => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      if (!next || !next.water || next.water === current.water) return next;

      const originalFish = next.fish || [];
      const fish = originalFish.filter(item => {
        const definition = window.DB?.fish?.find(candidate => candidate.id === item.id);
        const waterTypes = Array.isArray(definition?.water?.types)
          ? definition.water.types
          : [definition?.water];
        return waterTypes.includes(next.water);
      });
      const plants = next.water === 'fresh' ? (next.plants || []) : [];
      const substrateDefinition = window.DB?.substrates?.find(item => item.id === next.substrate);
      const substrate = substrateDefinition?.water?.includes(next.water) ? next.substrate : null;
      return { ...next, fish, plants, substrate };
    });
  }`;

if (!source.includes(atomicCleanup)) {
  if (!source.includes(oldCleanup)) throw new Error('Eski su temizleme bloğu bulunamadı.');
  source = source.replace(oldCleanup, atomicCleanup);
}

source = source.replace(
  "  if (stepName === 'water') stepEl = <WaterStep state={state} setState={setState} t={t} />;",
  "  if (stepName === 'water') stepEl = <WaterStep state={state} setState={setWaterState} t={t} />;",
);

writeFileSync(appPath, source);
console.log('Su seçimi ve eski seçim temizliği tek state güncellemesine taşındı.');