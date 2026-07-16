import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateRepositoryData } from './lib/validate-data-schema.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const report = validateRepositoryData(repositoryRoot);
const { classification } = report;

console.log('AKVARYUM canlı sınıflandırması doğrulandı.');
console.log(`Sınıflandırılan canlı: ${report.fish}`);
console.log(`Aile eşlenen kayıt: ${classification.familyMapped}`);
console.log(`Taksonomi incelemesi gereken kayıt: ${classification.taxonomyNeedsReview}`);
console.log(JSON.stringify({
  entityTypes: classification.entityTypes,
  categories: classification.categories,
}, null, 2));
