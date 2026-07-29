import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const appPath = resolve(process.cwd(), 'app.jsx');
let source = readFileSync(appPath, 'utf8');

const languageEffect = "  useEffect(() => { setState(s => ({ ...s, lang })); }, [lang]);";
const sanitizeMarker = 'const originalFish = current.fish || [];';
const sanitizeEffect = `${languageEffect}
  useEffect(() => {
    if (!state.water) return;
    setState(current => {
      const originalFish = current.fish || [];
      const originalPlants = current.plants || [];
      const fish = originalFish.filter(item => {
        const definition = window.DB?.fish?.find(candidate => candidate.id === item.id);
        return definition?.water === current.water;
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

if (!source.includes(sanitizeMarker)) {
  if (!source.includes(languageEffect)) throw new Error('Dil effect satırı bulunamadı.');
  source = source.replace(languageEffect, sanitizeEffect);
}

const navigationPattern = /  function next\(\) \{[\s\S]*?\n  \}\n  function back\(\) \{[\s\S]*?\n  \}\n  function jumpTo/;
const navigationReplacement = `  function next() {
    const currentFlow = flowFor(state);
    const expectedIndex = safeStepIdx;
    const targetIndex = Math.min(expectedIndex + 1, Math.max(0, currentFlow.length - 1));
    setStepIdx(current => {
      const maxIndex = Math.max(0, currentFlow.length - 1);
      const normalized = Math.min(Math.max(0, current), maxIndex);
      return normalized === expectedIndex ? targetIndex : normalized;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function back() {
    const currentFlow = flowFor(state);
    const expectedIndex = safeStepIdx;
    const targetIndex = Math.max(0, expectedIndex - 1);
    setStepIdx(current => {
      const maxIndex = Math.max(0, currentFlow.length - 1);
      const normalized = Math.min(Math.max(0, current), maxIndex);
      return normalized === expectedIndex ? targetIndex : normalized;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function jumpTo`;

if (!source.includes('const expectedIndex = safeStepIdx;')) {
  if (!navigationPattern.test(source)) throw new Error('İleri/geri gezinme blokları bulunamadı.');
  source = source.replace(navigationPattern, navigationReplacement);
}

writeFileSync(appPath, source);
console.log('Tarayıcı akışı düzeltmeleri app.jsx dosyasına uygulandı.');
