import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const appPath = resolve(process.cwd(), 'app.jsx');
let source = readFileSync(appPath, 'utf8');

source = source.replace('  const navigationPendingRef = useRef(false);\n', '');

const oldBlock = `  function scheduleStepChange(expectedIndex, targetIndex, currentFlow) {
    if (navigationPendingRef.current) return;
    navigationPendingRef.current = true;
    window.setTimeout(() => {
      setStepIdx(current => {
        const maxIndex = Math.max(0, currentFlow.length - 1);
        const normalized = Math.min(Math.max(0, current), maxIndex);
        return normalized === expectedIndex ? targetIndex : normalized;
      });
      navigationPendingRef.current = false;
    }, 0);
  }`;

const newBlock = `  function scheduleStepChange(expectedIndex, targetIndex, currentFlow) {
    setStepIdx(current => {
      const maxIndex = Math.max(0, currentFlow.length - 1);
      const normalized = Math.min(Math.max(0, current), maxIndex);
      return normalized === expectedIndex ? targetIndex : normalized;
    });
  }`;

if (!source.includes(newBlock)) {
  if (!source.includes(oldBlock)) throw new Error('Zamanlayıcılı adım geçiş bloğu bulunamadı.');
  source = source.replace(oldBlock, newBlock);
}

if (source.includes('navigationPendingRef') || source.includes('window.setTimeout(() => {\n      setStepIdx')) {
  throw new Error('Eski zamanlayıcılı geçiş kodu tamamen kaldırılamadı.');
}

writeFileSync(appPath, source);
console.log('Adım geçişi doğrudan fonksiyonel state güncellemesine taşındı.');