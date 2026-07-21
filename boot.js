// AKVARYUM — source loader
(() => {
  'use strict';

  const root = document.getElementById('root');

  async function fetchText(path) {
    const response = await fetch(path, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`${path} yüklenemedi (${response.status})`);
    return response.text();
  }

  async function inflateBase64(path) {
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('Tarayıcınız sıkıştırılmış kaynakları açmayı desteklemiyor. Güncel Chrome, Edge veya Firefox kullanın.');
    }

    const encoded = (await fetchText(path)).trim();
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

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
    if (!window.Babel) throw new Error('Babel yüklenemedi. İnternet bağlantısını kontrol edin.');
    const compiled = Babel.transform(source, {
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
    panel.style.cssText = 'max-width:760px;margin:80px auto;padding:28px;font-family:Inter,system-ui,sans-serif;background:#fff;border:1px solid #c9e2e3;border-radius:18px;color:#0a1f2e;box-shadow:0 20px 70px rgba(10,31,46,.12)';

    const title = document.createElement('h1');
    title.textContent = 'AKVARYUM yüklenemedi';
    title.style.marginTop = '0';

    const text = document.createElement('p');
    text.textContent = 'Sayfayı yenileyin. Sorun devam ederse tarayıcı konsolundaki hata kaydını kontrol edin.';

    const detail = document.createElement('pre');
    detail.textContent = error && error.message ? error.message : String(error);
    detail.style.cssText = 'white-space:pre-wrap;background:#eef7f7;padding:14px;border-radius:10px;overflow:auto';

    panel.append(title, text, detail);
    root.append(panel);
  }

  async function start() {
    try {
      const [
        styles,
        i18n,
        freshFish,
        saltFish,
        data,
        engine,
        engineHealthGuard,
        engineSocialRules,
        engineConspecificRules,
        engineDomainResults,
        resultViews,
        components,
        catalogFilterModel,
        catalogFilters,
        inhabitantDetailModel,
        inhabitantDetail,
        mobileFlowGuard,
        app,
      ] = await Promise.all([
        inflateBase64('.runtime/styles.css.gz.b64'),
        fetchText('i18n.js'),
        inflateBase64('.runtime/fish-fresh.js.gz.b64'),
        inflateBase64('.runtime/fish-salt.js.gz.b64'),
        fetchText('data.js'),
        fetchText('engine.js'),
        fetchText('engine-health-guard.js'),
        fetchText('engine-social-rules.js'),
        fetchText('engine-conspecific-rules.js'),
        fetchText('engine-domain-results.js'),
        inflateBase64('.runtime/result-views.jsx.gz.b64'),
        inflateBase64('.runtime/components.jsx.gz.b64'),
        fetchText('catalog-filter-model.js'),
        fetchText('catalog-filters.jsx'),
        fetchText('inhabitant-detail-model.js'),
        fetchText('inhabitant-detail.jsx'),
        fetchText('mobile-flow-guard.js'),
        fetchText('app.jsx'),
      ]);

      const style = document.createElement('style');
      style.dataset.source = 'akvaryum-styles';
      style.textContent = styles;
      document.head.append(style);

      runJavaScript(i18n, 'i18n.js');
      runJavaScript(freshFish, 'fish-fresh.js');
      runJavaScript(saltFish, 'fish-salt.js');
      runJavaScript(data, 'data.js');
      runJavaScript(engine, 'engine.js');
      runJavaScript(engineHealthGuard, 'engine-health-guard.js');
      runJavaScript(engineSocialRules, 'engine-social-rules.js');
      runJavaScript(engineConspecificRules, 'engine-conspecific-rules.js');
      runJavaScript(engineDomainResults, 'engine-domain-results.js');
      runJavaScript(catalogFilterModel, 'catalog-filter-model.js');
      runJavaScript(inhabitantDetailModel, 'inhabitant-detail-model.js');
      runJsx(resultViews, 'result-views.jsx');
      runJsx(components, 'components.jsx');
      runJsx(catalogFilters, 'catalog-filters.jsx');
      runJsx(inhabitantDetail, 'inhabitant-detail.jsx');
      runJavaScript(mobileFlowGuard, 'mobile-flow-guard.js');
      runJsx(app, 'app.jsx');
    } catch (error) {
      showError(error);
    }
  }

  start();
})();
