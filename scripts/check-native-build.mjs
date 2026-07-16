import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const distDir = resolve('dist');
const assetsDir = join(distDir, 'assets');
const files = readdirSync(assetsDir).map((name) => join(assetsDir, name));
const jsFiles = files.filter((file) => file.endsWith('.js'));
const cssFiles = files.filter((file) => file.endsWith('.css'));

if (jsFiles.length === 0) throw new Error('Production JavaScript çıktısı bulunamadı.');
if (cssFiles.length === 0) throw new Error('Production CSS çıktısı bulunamadı.');

const javascript = jsFiles.map((file) => readFileSync(file, 'utf8')).join('\n');
const forbiddenMarkers = [
  'DecompressionStream',
  '@babel/standalone',
  '.gz.b64',
  'startLegacyApp',
  'inflateBase64',
];

for (const marker of forbiddenMarkers) {
  if (javascript.includes(marker)) {
    throw new Error(`Üretim paketinde yasak eski yükleyici izi bulundu: ${marker}`);
  }
}

const dynamicEvalPattern = /(^|[^\w$.])eval\s*\(/;
if (dynamicEvalPattern.test(javascript)) {
  throw new Error('Üretim paketinde dinamik eval kullanımı bulundu.');
}

const totalJsBytes = jsFiles.reduce((sum, file) => sum + statSync(file).size, 0);
const totalCssBytes = cssFiles.reduce((sum, file) => sum + statSync(file).size, 0);

console.log(`Native build doğrulandı: ${jsFiles.length} JS, ${cssFiles.length} CSS`);
console.log(`JS toplamı: ${totalJsBytes} bayt`);
console.log(`CSS toplamı: ${totalCssBytes} bayt`);
console.log('Runtime gzip, eval ve Babel standalone bulunmadı.');
