import stylesArchive from '../../.runtime/styles.css.gz.b64?raw';
import freshFishArchive from '../../.runtime/fish-fresh.js.gz.b64?raw';
import saltFishArchive from '../../.runtime/fish-salt.js.gz.b64?raw';
import resultViewsArchive from '../../.runtime/result-views.jsx.gz.b64?raw';
import componentsArchive from '../../.runtime/components.jsx.gz.b64?raw';
import i18nSource from '../../i18n.js?raw';
import dataSource from '../../data.js?raw';
import engineSource from '../../engine.js?raw';
import appSource from '../../app.jsx?raw';

const root = document.getElementById('root');

async function inflateBase64(encodedSource) {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error(
      'Tarayıcınız sıkıştırılmış kaynakları açmayı desteklemiyor. Güncel Chrome, Edge veya Firefox kullanın.',
    );
  }

  const encoded = encodedSource.trim();
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'));

  return new Response(stream).text();
}

function runJavaScript(source, label) {
  try {
    (0, eval)(`${source}\n//# sourceURL=${label}`);
  } catch (error) {
    error.message = `${label}: ${error.message}`;
    throw error;
  }
}

function runJsx(source, label) {
  const compiled = window.Babel.transform(source, {
    presets: ['react'],
    sourceType: 'script',
    filename: label,
  }).code;

  runJavaScript(compiled, label);
}

function showError(error) {
  console.error(error);
  root.replaceChildren();

  const panel = document.createElement('main');
  panel.className = 'migration-error';

  const title = document.createElement('h1');
  title.textContent = 'AKVARYUM yüklenemedi';

  const text = document.createElement('p');
  text.textContent =
    'Sayfayı yenileyin. Sorun devam ederse tarayıcı konsolundaki hata kaydını kontrol edin.';

  const detail = document.createElement('pre');
  detail.textContent = error?.message ?? String(error);

  panel.append(title, text, detail);
  root.append(panel);
}

export async function startLegacyApp() {
  try {
    const [styles, freshFish, saltFish, resultViews, components] =
      await Promise.all([
        inflateBase64(stylesArchive),
        inflateBase64(freshFishArchive),
        inflateBase64(saltFishArchive),
        inflateBase64(resultViewsArchive),
        inflateBase64(componentsArchive),
      ]);

    const style = document.createElement('style');
    style.dataset.source = 'akvaryum-styles';
    style.textContent = styles;
    document.head.append(style);

    runJavaScript(i18nSource, 'i18n.js');
    runJavaScript(freshFish, 'fish-fresh.js');
    runJavaScript(saltFish, 'fish-salt.js');
    runJavaScript(dataSource, 'data.js');
    runJavaScript(engineSource, 'engine.js');
    runJsx(resultViews, 'result-views.jsx');
    runJsx(components, 'components.jsx');
    runJsx(appSource, 'app.jsx');
  } catch (error) {
    showError(error);
  }
}
