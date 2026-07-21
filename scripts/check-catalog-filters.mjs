import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateCatalogFilters } from './lib/validate-catalog-filters.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const report = validateCatalogFilters(repositoryRoot);

console.log(
  `AKVARYUM katalog filtreleri doğrulandı: ${report.scenarios} senaryo, `
  + `${report.categories} kategori, ${report.advancedFilters} gelişmiş filtre, `
  + `${report.managedQueryKeys} URL parametresi.`,
);
