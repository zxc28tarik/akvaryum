import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const filePath = resolve(process.cwd(), 'catalog-filters.jsx');
let source = readFileSync(filePath, 'utf8');

source = source.replace(
  '  const { useDeferredValue, useEffect, useMemo, useState } = React;',
  '  const { useEffect, useMemo, useState } = React;',
);
source = source.replace('    const deferredFilters = useDeferredValue(filters);\n', '');
source = source.replace(
  '      () => model.filterRecords(records, deferredFilters, { lang }),\n      [records, deferredFilters, lang],',
  '      () => model.filterRecords(records, filters, { lang }),\n      [records, filters, lang],',
);
source = source.replace(
  '      () => model.countByCategory(records, deferredFilters, { lang }),\n      [records, deferredFilters, lang],',
  '      () => model.countByCategory(records, filters, { lang }),\n      [records, filters, lang],',
);

if (source.includes('useDeferredValue') || source.includes('deferredFilters')) {
  throw new Error('Katalogda ertelenmiş filtre kullanımı tamamen kaldırılamadı.');
}

writeFileSync(filePath, source);
console.log('Katalog filtreleri güncel state ile senkron çalışacak şekilde güncellendi.');