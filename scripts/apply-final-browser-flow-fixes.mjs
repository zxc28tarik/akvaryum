import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function replaceRequired(source, search, replacement, label) {
  if (source.includes(replacement)) return source;
  if (!source.includes(search)) throw new Error(`${label} için beklenen kaynak bulunamadı.`);
  return source.replace(search, replacement);
}

const appPath = resolve(process.cwd(), 'app.jsx');
let app = readFileSync(appPath, 'utf8');

const deferredComponent = `function DeferredFishStep(props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timer = null;
    const frame = window.requestAnimationFrame(() => {
      timer = window.setTimeout(() => setReady(true), 0);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [props.state?.water, props.lang]);

  if (!ready) {
    return (
      <section className="catalog-loading" aria-live="polite" aria-busy="true">
        <p>Canlı kataloğu hazırlanıyor…</p>
      </section>
    );
  }
  return <FishStep {...props} />;
}

`;

if (!app.includes('function DeferredFishStep(props)')) {
  app = replaceRequired(app, 'const RAW_FLOWS = {', `${deferredComponent}const RAW_FLOWS = {`, 'Ertelenmiş katalog bileşeni');
}
app = replaceRequired(
  app,
  `if (stepName === 'fish') stepEl = <FishStep state={state} setState={setState} t={t} lang={lang} />;`,
  `if (stepName === 'fish') stepEl = <DeferredFishStep state={state} setState={setState} t={t} lang={lang} />;`,
  'Katalog adımı ertelenmiş bağlantısı',
);
writeFileSync(appPath, app);

const catalogPath = resolve(process.cwd(), 'catalog-filters.jsx');
let catalog = readFileSync(catalogPath, 'utf8');
const flushReset = `    function resetFilters() {
      const defaults = model.createDefaults();
      const nextSearch = model.serializeSearch(defaults, window.location.search);
      const nextUrl = \`${'${window.location.pathname}${nextSearch}${window.location.hash}'}\`;
      window.history.replaceState(window.history.state, '', nextUrl);
      ReactDOM.flushSync(() => {
        setAdvancedOpen(false);
        setFilters(defaults);
        setVisibleCount(PAGE_SIZE);
      });
    }`;
const safeReset = `    function resetFilters() {
      const defaults = model.createDefaults();
      const nextSearch = model.serializeSearch(defaults, window.location.search);
      const nextUrl = \`${'${window.location.pathname}${nextSearch}${window.location.hash}'}\`;
      window.history.replaceState(window.history.state, '', nextUrl);
      setAdvancedOpen(false);
      setFilters(defaults);
      setVisibleCount(PAGE_SIZE);
    }`;
catalog = replaceRequired(catalog, flushReset, safeReset, 'ReactDOM bağımsız filtre sıfırlama');
writeFileSync(catalogPath, catalog);

console.log('Son tarayıcı akış düzeltmeleri uygulandı.');
