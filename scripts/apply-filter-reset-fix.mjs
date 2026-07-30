import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const filePath = resolve(process.cwd(), 'catalog-filters.jsx');
let source = readFileSync(filePath, 'utf8');

const current = `    function resetFilters() {
      startTransition(() => setFilters(model.createDefaults()));
      setAdvancedOpen(false);
    }`;
const replacement = `    function resetFilters() {
      const defaults = model.createDefaults();
      setAdvancedOpen(false);
      window.requestAnimationFrame(() => setFilters(defaults));
    }`;

if (!source.includes(replacement)) {
  if (!source.includes(current)) throw new Error('Filtre sıfırlama bloğu bulunamadı.');
  source = source.replace(current, replacement);
}

writeFileSync(filePath, source);
console.log('Filtre sıfırlama, tıklama olayından ayrılmış acil güncellemeye geçirildi.');
