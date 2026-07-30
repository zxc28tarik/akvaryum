import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const appPath = resolve(process.cwd(), 'app.jsx');
let source = readFileSync(appPath, 'utf8');
const before = `  return (\n    <div className="app">\n      <Bubbles />\n      <Topbar lang={lang} setLang={setLang} step={progressCurrent} total={stepsForProgress.length} onRestart={restart} t={t} />`;
const after = `  return (\n    <div className="app app-wizard">\n      <Topbar lang={lang} setLang={setLang} step={progressCurrent} total={stepsForProgress.length} onRestart={restart} t={t} />`;

if (!source.includes(after)) {
  if (!source.includes(before)) throw new Error('Sihirbaz Bubbles bağlantısı bulunamadı.');
  source = source.replace(before, after);
}

writeFileSync(appPath, source);
console.log('Dekoratif baloncuklar sihirbaz akışından kaldırıldı.');
