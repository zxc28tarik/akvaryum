const { useState, useEffect, useMemo } = React;
const { Bubbles, Topbar, RecipeStrip, Progress, Landing, PathStep, TankStep, WaterStep, FishStep, PlantsStep, SubstrateStep, ResultStep } = window.UI;

// Step flows per path. Plants step is freshwater-only — filtered at render time.
const RAW_FLOWS = {
  tank: ['path', 'tank', 'water', 'fish', 'plants', 'substrate', 'result'],
  fish: ['path', 'water', 'fish', 'tank', 'plants', 'substrate', 'result'],
  water: ['path', 'water', 'tank', 'fish', 'plants', 'substrate', 'result'],
};
function flowFor(state) {
  if (!state.path) return ['path'];
  let f = RAW_FLOWS[state.path];
  // skip plants step for saltwater (corals are part of fish DB)
  if (state.water === 'salt') f = f.filter(s => s !== 'plants');
  return f;
}

function App() {
  const [lang, setLang] = useState('tr');
  const [view, setView] = useState('home');
  const [state, setState] = useState({ lang: 'tr', fish: [], plants: [] });
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => { setState(s => ({ ...s, lang })); }, [lang]);

  const t = window.I18N[lang];
  const flow = flowFor(state);
  const stepName = flow[stepIdx];

  // Reset
  function restart() {
    setState({ lang, fish: [], plants: [] });
    setStepIdx(0);
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function next() {
    if (stepIdx < flow.length - 1) {
      setStepIdx(stepIdx + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  function back() {
    if (stepIdx > 0) {
      setStepIdx(stepIdx - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  function jumpTo(target) {
    // target is either an index or step name
    const idx = typeof target === 'number' ? target : flow.indexOf(target);
    if (idx >= 0 && idx < flow.length) {
      setStepIdx(idx);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  // Step name → human label for progress dots
  const STEP_LABELS = {
    tank: t.tank_eyebrow, water: t.water_eyebrow, fish: t.fish_eyebrow,
    plants: t.plants_eyebrow, substrate: t.substrate_eyebrow, result: t.result_eyebrow
  };

  function pickPath(id) {
    setState(s => ({ ...s, path: id }));
    setStepIdx(1);
  }

  // Validation: can we proceed?
  let canProceed = true;
  if (stepName === 'tank' && !state.volume) canProceed = false;
  if (stepName === 'water' && !state.water) canProceed = false;
  if (stepName === 'fish' && (!state.fish || state.fish.length === 0)) canProceed = false;

  // Render step
  let stepEl = null;
  if (stepName === 'path') stepEl = <PathStep onPick={pickPath} t={t} />;
  if (stepName === 'tank') stepEl = <TankStep state={state} setState={setState} t={t} />;
  if (stepName === 'water') stepEl = <WaterStep state={state} setState={setState} t={t} />;
  if (stepName === 'fish') stepEl = <FishStep state={state} setState={setState} t={t} lang={lang} />;
  if (stepName === 'plants') stepEl = <PlantsStep state={state} setState={setState} t={t} lang={lang} />;
  if (stepName === 'substrate') stepEl = <SubstrateStep state={state} setState={setState} t={t} lang={lang} />;
  if (stepName === 'result') stepEl = <ResultStep state={state} setState={setState} t={t} lang={lang} />;

  const showRecipe = stepName !== 'path' && stepName !== 'result';
  const isResult = stepName === 'result';
  const stepsForProgress = flow.slice(1); // hide path-pick from progress
  const progressCurrent = Math.max(0, stepIdx - 1);

  if (view === 'home') {
    return (
      <div className="app">
        <Bubbles />
        <Topbar lang={lang} setLang={setLang} step={0} total={0} onRestart={restart} t={t} />
        <Landing t={t} onStart={() => { setView('wizard'); setStepIdx(0); window.scrollTo({ top: 0 }); }} />
      </div>
    );
  }

  return (
    <div className="app">
      <Bubbles />
      <Topbar lang={lang} setLang={setLang} step={progressCurrent} total={stepsForProgress.length} onRestart={restart} t={t} />
      <main className="stage">
        {showRecipe && <RecipeStrip state={state} t={t} jumpTo={jumpTo} />}
        {stepEl}
      </main>
      {stepName !== 'path' && (
        <div className="foot-nav">
          <button className="btn btn-ghost" onClick={back}>← {t.back}</button>
          <Progress steps={stepsForProgress}
            current={progressCurrent}
            labels={stepsForProgress.map(s => STEP_LABELS[s] || s)}
            onJump={(i) => jumpTo(i + 1)} />
          {isResult ? (
            <button className="btn btn-secondary" onClick={restart}>{t.restart} ↻</button>
          ) : (
            <button className="btn btn-primary" onClick={next} disabled={!canProceed}>
              {stepIdx === flow.length - 2 ? t.finish : t.next} →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
