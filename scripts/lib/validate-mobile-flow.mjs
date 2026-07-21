import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

export function validateMobileFlow(repositoryRoot) {
  const guardSource = readFileSync(resolve(repositoryRoot, 'mobile-flow-guard.js'), 'utf8');
  const indexSource = readFileSync(resolve(repositoryRoot, 'index.html'), 'utf8');
  const appSource = readFileSync(resolve(repositoryRoot, 'app.jsx'), 'utf8');
  const bootSource = readFileSync(resolve(repositoryRoot, 'boot.js'), 'utf8');
  const viteSource = readFileSync(resolve(repositoryRoot, 'vite.config.js'), 'utf8');
  const catalogSource = readFileSync(resolve(repositoryRoot, 'catalog-filters.jsx'), 'utf8');
  const detailSource = readFileSync(resolve(repositoryRoot, 'inhabitant-detail.jsx'), 'utf8');

  const context = vm.createContext({ window: {} });
  new vm.Script(guardSource, { filename: 'mobile-flow-guard.js' }).runInContext(context);
  const guard = context.window.MobileFlowGuard;
  assert.equal(guard.version, 1, 'Mobil koruma modeli sürümü değişti.');
  assert.equal(guard.smokeWidthPx, 360, 'Mobil duman genişliği 360 px olmalıdır.');

  let scenarios = 2;
  const safeRoot = {
    clientWidth: 360,
    scrollWidth: 360,
    querySelectorAll: () => [{
      tagName: 'DIV', className: 'safe', clientWidth: 320, scrollWidth: 320,
      getBoundingClientRect: () => ({ left: 10, right: 330 }),
    }],
  };
  const safeReport = guard.audit(safeRoot, 360);
  assert.equal(safeReport.hasOverflow, false);
  scenarios += 1;

  const overflowRoot = {
    clientWidth: 360,
    scrollWidth: 390,
    querySelectorAll: () => [{
      tagName: 'DIV', className: 'too-wide', clientWidth: 360, scrollWidth: 390,
      getBoundingClientRect: () => ({ left: 0, right: 390 }),
    }],
  };
  const overflowReport = guard.audit(overflowRoot, 360);
  assert.equal(overflowReport.hasOverflow, true);
  assert.equal(overflowReport.overflowPx, 30);
  assert.equal(overflowReport.offenders[0].element, 'div.too-wide');
  scenarios += 1;

  assert.match(indexSource, /width=device-width, initial-scale=1/, 'Mobil viewport meta etiketi korunmalıdır.');
  assert.match(guardSource, /safe-area-inset-bottom/, 'Alt gezinme güvenli alan boşluğunu kullanmalıdır.');
  assert.match(guardSource, /grid-template-columns:auto minmax\(0,1fr\) auto/, 'Alt gezinme dar ekranda kontrollü grid olmalıdır.');
  assert.match(guardSource, /@media\(max-width:420px\)/, 'Dar telefonlar için ikinci kırılım bulunmalıdır.');
  scenarios += 1;

  assert.match(appSource, /className="foot-nav"/, 'Ana akış alt gezinme sınıfını korumalıdır.');
  assert.match(catalogSource, /@media\(max-width:640px\)/, 'Katalog mobil kırılımı bulunmalıdır.');
  assert.match(detailSource, /@media\(max-width:640px\)/, 'Ayrıntı paneli mobil kırılımı bulunmalıdır.');
  scenarios += 1;

  assert.match(bootSource, /mobile-flow-guard\.js/, 'Statik yükleyici mobil korumayı yüklemelidir.');
  assert.match(viteSource, /mobile-flow-guard\.js/, 'Vite production mobil korumayı içermelidir.');
  scenarios += 1;

  return {
    version: guard.version,
    scenarios,
    smokeWidthPx: guard.smokeWidthPx,
    mobileBreakpointPx: guard.mobileBreakpointPx,
    overflowDetection: true,
    safeAreaSupport: true,
  };
}
