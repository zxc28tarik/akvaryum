import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const filePath = resolve(process.cwd(), 'inhabitant-detail.jsx');
let source = readFileSync(filePath, 'utf8');

const before = `          button.textContent = copy.details;
          button.setAttribute('aria-label', \`${'${copy.details}: ${catalogModel.recordName(matchedRecord, lang)}'}\`);`;
const after = `          if (button.textContent !== copy.details) button.textContent = copy.details;
          const detailLabel = \`${'${copy.details}: ${catalogModel.recordName(matchedRecord, lang)}'}\`;
          if (button.getAttribute('aria-label') !== detailLabel) button.setAttribute('aria-label', detailLabel);`;

if (!source.includes(after)) {
  if (!source.includes(before)) throw new Error('Canlı detay düğmesi güncelleme bloğu bulunamadı.');
  source = source.replace(before, after);
}

writeFileSync(filePath, source);
console.log('Canlı detay MutationObserver tekrar döngüsü engellendi.');