const { useState, useEffect, useLayoutEffect, useMemo, useRef } = React;
const { Bubbles, Topbar, RecipeStrip, Progress, Landing, PathStep, TankStep, WaterStep, FishStep, PlantsStep, SubstrateStep, ResultStep } = window.UI;

const SCORE_SECTION_ORDER = Object.freeze(['environmental', 'behavior', 'tank', 'habitat']);
const SCORE_ENVIRONMENTAL_RULE_IDS = new Set([
  'WATER_TYPE_MISMATCH',
  'PARAMETER_PH_NO_COMMON_RANGE',
  'PARAMETER_TEMPERATURE_NO_COMMON_RANGE',
  'PARAMETER_GH_NO_COMMON_RANGE',
]);
const SCORE_TANK_RULE_IDS = new Set(['TANK_CAPACITY_EXCEEDED', 'TANK_CAPACITY_HIGH', 'SPECIES_MINIMUM_VOLUME']);
const SCORE_HABITAT_RULE_IDS = new Set([
  'PLANT_DAMAGE_RISK', 'SUBSTRATE_WATER_MISMATCH', 'REEF_UNSAFE_INHABITANT',
  'REEF_SOFT_CORAL_RISK', 'REEF_LPS_CORAL_RISK', 'REEF_SPS_CORAL_RISK',
  'REEF_SHRIMP_RISK', 'REEF_SNAIL_RISK', 'REEF_CRAB_RISK', 'REEF_CLAM_RISK',
]);
const SCORE_BEHAVIOR_PREFIXES = Object.freeze(['SOCIAL_', 'CONSPECIFIC_', 'CONGENERIC_', 'PREDATION_', 'PAIR_OVERRIDE_']);
const SCORE_ENVIRONMENTAL_TEXT = /pH|sıcaklık|temperature|su sertliği|hardness|su tipi|water type/i;

const SCORE_COPY = Object.freeze({
  tr: Object.freeze({
    title: 'Puanın nasıl oluştu?',
    subtitle: 'Toplam puan dört bağımsız bölümün sonucudur. Bir bölümü açarak puanı düşüren nedenleri ve çözüm adımlarını görebilirsin.',
    overall: 'Toplam uyum puanı',
    capLabel: 'Kritik güvenlik sınırı uygulandı',
    capText: cap => `Kritik bir sorun bulunduğu için toplam puan en fazla ${cap} olabilir.`,
    critical: 'Kritik', warning: 'Uyarı', good: 'İyi', notEvaluated: 'Değerlendirilmedi',
    pointsLost: count => `${count} puan kaybı`, noLoss: 'Puan kaybı yok',
    details: (critical, warning) => `${critical} kritik, ${warning} uyarı`,
    noFinding: 'Bu bölümde puanı düşüren belirgin bir bulgu yok.',
    reason: 'Neden', impact: 'Etkisi', resolution: 'Ne yapılmalı',
    uncapped: score => `Bölüm toplamı: ${score}/100`,
  }),
  en: Object.freeze({
    title: 'How was the score calculated?',
    subtitle: 'The total score is built from four independent sections. Open a section to see what reduced the score and how to improve it.',
    overall: 'Overall compatibility score',
    capLabel: 'Critical safety cap applied',
    capText: cap => `A critical issue limits the total score to ${cap}.`,
    critical: 'Critical', warning: 'Warning', good: 'Good', notEvaluated: 'Not evaluated',
    pointsLost: count => `${count} points lost`, noLoss: 'No points lost',
    details: (critical, warning) => `${critical} critical, ${warning} warnings`,
    noFinding: 'No clear finding reduced this section score.',
    reason: 'Reason', impact: 'Impact', resolution: 'What to do',
    uncapped: score => `Section total: ${score}/100`,
  }),
});

function scoreSectionForFinding(finding) {
  const ruleId = String(finding?.ruleId || '');
  if (SCORE_ENVIRONMENTAL_RULE_IDS.has(ruleId)) return 'environmental';
  if (SCORE_TANK_RULE_IDS.has(ruleId)) return 'tank';
  if (SCORE_HABITAT_RULE_IDS.has(ruleId) || ruleId.startsWith('REEF_')) return 'habitat';
  if (SCORE_BEHAVIOR_PREFIXES.some(prefix => ruleId.startsWith(prefix))) return 'behavior';
  if (ruleId === 'SCHOOLING_MINIMUM') return 'behavior';
  if (ruleId === 'PAIRWISE_INCOMPATIBLE' || ruleId === 'PAIRWISE_CAUTION') {
    const text = `${finding?.reason || ''} ${finding?.desc || ''}`;
    return SCORE_ENVIRONMENTAL_TEXT.test(text) ? 'environmental' : 'behavior';
  }
  return null;
}

function scoreStatusLabel(status, copy) {
  if (status === 'critical') return copy.critical;
  if (status === 'warning') return copy.warning;
  if (status === 'good') return copy.good;
  return copy.notEvaluated;
}

function normalizeScoreFinding(finding, severity) {
  return {
    ruleId: String(finding?.ruleId || ''), severity,
    title: String(finding?.title || finding?.desc || finding?.ruleId || ''),
    reason: String(finding?.reason || finding?.desc || ''),
    impact: String(finding?.impact || ''),
    resolution: String(finding?.resolution || ''),
  };
}

function buildScorePanelModel(result, lang) {
  const breakdown = result?.scoreBreakdown;
  if (!breakdown?.sections) return null;
  const copy = SCORE_COPY[lang === 'en' ? 'en' : 'tr'];
  const grouped = Object.fromEntries(SCORE_SECTION_ORDER.map(key => [key, { critical: [], warning: [] }]));

  for (const finding of result.issues || []) {
    const section = scoreSectionForFinding(finding);
    if (section) grouped[section].critical.push(normalizeScoreFinding(finding, 'critical'));
  }
  for (const finding of result.warnings || []) {
    const section = scoreSectionForFinding(finding);
    if (section) grouped[section].warning.push(normalizeScoreFinding(finding, 'warning'));
  }

  const sections = SCORE_SECTION_ORDER.map(key => {
    const section = breakdown.sections[key];
    if (!section) return null;
    const critical = grouped[key].critical;
    const warning = grouped[key].warning;
    const maxScore = Number(section.maxScore || 0);
    const score = Number(section.score || 0);
    const pointsLost = Math.max(0, maxScore - score);
    return {
      key, label: section.label, score, maxScore,
      percent: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
      status: section.status, statusLabel: scoreStatusLabel(section.status, copy),
      summary: section.summary, pointsLost,
      pointsLostLabel: pointsLost > 0 ? copy.pointsLost(pointsLost) : copy.noLoss,
      criticalCount: critical.length, warningCount: warning.length,
      detailsLabel: copy.details(critical.length, warning.length),
      findings: [...critical, ...warning],
    };
  }).filter(Boolean);

  const appliedCap = breakdown.appliedCap === null || breakdown.appliedCap === undefined
    ? null : Number(breakdown.appliedCap);
  return {
    score: Number(breakdown.score ?? result.score ?? 0),
    maxScore: Number(breakdown.maxScore || 100),
    appliedCap, hasCap: appliedCap !== null,
    title: copy.title, subtitle: copy.subtitle, overallLabel: copy.overall,
    capLabel: copy.capLabel, capText: appliedCap === null ? '' : copy.capText(appliedCap),
    uncappedLabel: copy.uncapped(Number(breakdown.uncappedScore ?? result.score ?? 0)),
    noFindingLabel: copy.noFinding,
    fieldLabels: { reason: copy.reason, impact: copy.impact, resolution: copy.resolution },
    sections,
  };
}

const SCORE_STYLE_ID = 'akvaryum-score-breakdown-panel-styles';
if (!document.getElementById(SCORE_STYLE_ID)) {
  const style = document.createElement('style');
  style.id = SCORE_STYLE_ID;
  style.textContent = `
    .score-breakdown-panel{max-width:1120px;margin:28px auto 0;padding:0 20px 36px;color:#102a35}
    .score-breakdown-shell{background:linear-gradient(145deg,#f8fcfc,#eef8f7);border:1px solid rgba(28,111,114,.18);border-radius:24px;padding:24px;box-shadow:0 18px 50px rgba(16,42,53,.08)}
    .score-breakdown-head{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:20px}.score-breakdown-copy{max-width:720px}.score-breakdown-title{margin:0 0 8px;font-size:clamp(1.35rem,2vw,1.9rem);line-height:1.15}.score-breakdown-subtitle{margin:0;color:#536b74;line-height:1.55}
    .score-breakdown-total{flex:0 0 auto;min-width:148px;text-align:center;background:#fff;border:1px solid rgba(28,111,114,.16);border-radius:18px;padding:14px 18px}.score-breakdown-total strong{display:block;font-size:2rem;line-height:1}.score-breakdown-total span{display:block;margin-top:7px;font-size:.78rem;color:#61757d}
    .score-breakdown-cap{margin:0 0 18px;padding:13px 15px;border-radius:14px;background:#fff4e5;border:1px solid #efc07b;color:#6f4812}.score-breakdown-cap strong{display:block;margin-bottom:3px}
    .score-breakdown-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.score-breakdown-card{background:#fff;border:1px solid rgba(28,111,114,.14);border-radius:18px;padding:18px;min-width:0}.score-breakdown-card[data-status="critical"]{border-color:#d88a8a}.score-breakdown-card[data-status="warning"]{border-color:#d9b66d}.score-breakdown-card[data-status="good"]{border-color:#8fc7ad}
    .score-breakdown-card-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.score-breakdown-card h3{margin:0;font-size:1rem}.score-breakdown-score{font-weight:800;white-space:nowrap}.score-breakdown-status{display:inline-flex;margin-top:8px;padding:4px 8px;border-radius:999px;font-size:.72rem;font-weight:750;background:#edf4f4;color:#34545d}.score-breakdown-card[data-status="critical"] .score-breakdown-status{background:#fdeaea;color:#8a2f2f}.score-breakdown-card[data-status="warning"] .score-breakdown-status{background:#fff3d8;color:#765116}.score-breakdown-card[data-status="good"] .score-breakdown-status{background:#e7f5ed;color:#24633f}
    .score-breakdown-track{height:9px;margin:14px 0 12px;border-radius:999px;background:#e4ecec;overflow:hidden}.score-breakdown-fill{height:100%;border-radius:inherit;background:#2b8b88}.score-breakdown-card[data-status="critical"] .score-breakdown-fill{background:#bd5454}.score-breakdown-card[data-status="warning"] .score-breakdown-fill{background:#c38a2f}.score-breakdown-card[data-status="good"] .score-breakdown-fill{background:#3c9a68}
    .score-breakdown-summary{margin:0;color:#506970;font-size:.9rem;line-height:1.5}.score-breakdown-loss{margin-top:10px;font-size:.78rem;font-weight:750;color:#52666d}.score-breakdown-details{margin-top:14px;border-top:1px solid #e3ecec;padding-top:12px}.score-breakdown-details>summary{cursor:pointer;font-weight:750;font-size:.84rem}.score-breakdown-finding-list{display:grid;gap:10px;margin-top:12px}.score-breakdown-finding{border-radius:13px;padding:12px;background:#f7fbfb;border:1px solid #e0ebeb}.score-breakdown-finding[data-severity="critical"]{background:#fff6f6;border-color:#f0cccc}.score-breakdown-finding-title{font-weight:800;font-size:.88rem;margin-bottom:8px}.score-breakdown-field{margin-top:7px;font-size:.82rem;line-height:1.45;color:#4d626a}.score-breakdown-field strong{color:#243e47}.score-breakdown-empty{margin-top:12px;font-size:.82rem;color:#557077}
    @media (max-width:760px){.score-breakdown-panel{padding:0 14px 28px}.score-breakdown-shell{padding:18px;border-radius:20px}.score-breakdown-head{display:block}.score-breakdown-total{margin-top:16px;min-width:0}.score-breakdown-grid{grid-template-columns:1fr}}
  `;
  document.head.append(style);
}

function ScoreFinding({ finding, labels }) {
  return (
    <article className="score-breakdown-finding" data-severity={finding.severity}>
      <div className="score-breakdown-finding-title">{finding.title}</div>
      {finding.reason && <div className="score-breakdown-field"><strong>{labels.reason}:</strong> {finding.reason}</div>}
      {finding.impact && <div className="score-breakdown-field"><strong>{labels.impact}:</strong> {finding.impact}</div>}
      {finding.resolution && <div className="score-breakdown-field"><strong>{labels.resolution}:</strong> {finding.resolution}</div>}
    </article>
  );
}

function ScoreBreakdownPanel({ result, state, lang }) {
  const model = useMemo(() => buildScorePanelModel(result || window.Engine.analyze({ ...state, lang }), lang), [result, state, lang]);
  if (!model) return null;
  return (
    <section className="score-breakdown-panel" aria-labelledby="score-breakdown-title">
      <div className="score-breakdown-shell">
        <header className="score-breakdown-head">
          <div className="score-breakdown-copy"><h2 className="score-breakdown-title" id="score-breakdown-title">{model.title}</h2><p className="score-breakdown-subtitle">{model.subtitle}</p></div>
          <div className="score-breakdown-total" aria-label={`${model.overallLabel}: ${model.score}/${model.maxScore}`}><strong>{model.score}/{model.maxScore}</strong><span>{model.overallLabel}</span></div>
        </header>
        {model.hasCap && <div className="score-breakdown-cap" role="note"><strong>{model.capLabel}</strong><span>{model.capText} {model.uncappedLabel}</span></div>}
        <div className="score-breakdown-grid">
          {model.sections.map(section => (
            <article className="score-breakdown-card" data-status={section.status} key={section.key}>
              <div className="score-breakdown-card-head"><div><h3>{section.label}</h3><span className="score-breakdown-status">{section.statusLabel}</span></div><div className="score-breakdown-score">{section.score}/{section.maxScore}</div></div>
              <div className="score-breakdown-track" role="progressbar" aria-label={section.label} aria-valuemin="0" aria-valuemax={section.maxScore} aria-valuenow={section.score}><div className="score-breakdown-fill" style={{ width: `${section.percent}%` }} /></div>
              <p className="score-breakdown-summary">{section.summary}</p><div className="score-breakdown-loss">{section.pointsLostLabel}</div>
              {section.findings.length > 0 ? <details className="score-breakdown-details" open={section.status === 'critical'}><summary>{section.detailsLabel}</summary><div className="score-breakdown-finding-list">{section.findings.map((finding, index) => <ScoreFinding key={`${finding.ruleId}-${index}`} finding={finding} labels={model.fieldLabels} />)}</div></details> : <div className="score-breakdown-empty">{model.noFindingLabel}</div>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const FINDING_COPY = Object.freeze({
  tr: Object.freeze({
    title: 'Sorunlar, uyarılar ve öneriler',
    subtitle: 'Her bulgu neden oluştuğunu, akvaryuma etkisini ve uygulanabilecek çözümü ayrı ayrı gösterir.',
    critical: 'Kritik sorunlar', warning: 'Uyarılar', tip: 'Öneriler',
    reason: 'Neden', impact: 'Etkisi', resolution: 'Çözüm',
    empty: 'Bu grupta gösterilecek bulgu yok.',
  }),
  en: Object.freeze({
    title: 'Issues, warnings and recommendations',
    subtitle: 'Each finding explains why it occurred, how it affects the aquarium and what action can resolve it.',
    critical: 'Critical issues', warning: 'Warnings', tip: 'Recommendations',
    reason: 'Reason', impact: 'Impact', resolution: 'Resolution',
    empty: 'There are no findings in this group.',
  }),
});

function normalizeExplanationFinding(finding, severity) {
  return {
    key: `${finding?.ruleId || severity}-${finding?.title || finding?.desc || ''}`,
    ruleId: String(finding?.ruleId || ''), severity,
    title: String(finding?.title || finding?.desc || finding?.ruleId || ''),
    description: String(finding?.desc || ''),
    reason: String(finding?.reason || finding?.desc || ''),
    impact: String(finding?.impact || ''),
    resolution: String(finding?.resolution || ''),
  };
}

function buildFindingExplanationModel(result, lang) {
  const copy = FINDING_COPY[lang === 'en' ? 'en' : 'tr'];
  const groups = [
    { key: 'critical', label: copy.critical, findings: (result?.issues || []).map(f => normalizeExplanationFinding(f, 'critical')) },
    { key: 'warning', label: copy.warning, findings: (result?.warnings || []).map(f => normalizeExplanationFinding(f, 'warning')) },
    { key: 'tip', label: copy.tip, findings: (result?.tips || []).map(f => normalizeExplanationFinding(f, 'tip')) },
  ];
  return {
    title: copy.title, subtitle: copy.subtitle,
    labels: { reason: copy.reason, impact: copy.impact, resolution: copy.resolution },
    empty: copy.empty, groups,
    total: groups.reduce((sum, group) => sum + group.findings.length, 0),
  };
}

const FINDING_STYLE_ID = 'akvaryum-finding-explanation-styles';
if (!document.getElementById(FINDING_STYLE_ID)) {
  const style = document.createElement('style');
  style.id = FINDING_STYLE_ID;
  style.textContent = `
    .finding-explanation-panel{max-width:1120px;margin:0 auto;padding:0 20px 42px;color:#102a35}
    .finding-explanation-shell{background:#fff;border:1px solid rgba(28,111,114,.16);border-radius:24px;padding:24px;box-shadow:0 14px 40px rgba(16,42,53,.06)}
    .finding-explanation-head{margin-bottom:20px}.finding-explanation-title{margin:0 0 8px;font-size:clamp(1.3rem,2vw,1.8rem)}.finding-explanation-subtitle{margin:0;max-width:760px;color:#536b74;line-height:1.55}
    .finding-group+.finding-group{margin-top:22px}.finding-group-head{display:flex;align-items:center;gap:9px;margin-bottom:12px}.finding-group-title{margin:0;font-size:1rem}.finding-group-count{display:inline-flex;align-items:center;justify-content:center;min-width:25px;height:25px;padding:0 7px;border-radius:999px;background:#edf4f4;font-size:.75rem;font-weight:800}
    .finding-card-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.finding-card{border:1px solid #e0eaea;border-radius:16px;padding:16px;background:#f9fcfc;min-width:0}.finding-card[data-severity="critical"]{background:#fff7f7;border-color:#efcaca}.finding-card[data-severity="warning"]{background:#fffbf2;border-color:#ead6a6}.finding-card[data-severity="tip"]{background:#f4fbf7;border-color:#cfe6d7}
    .finding-card-title{margin:0 0 7px;font-size:.98rem}.finding-card-desc{margin:0 0 12px;color:#566d75;font-size:.86rem;line-height:1.48}.finding-card-fields{display:grid;gap:9px}.finding-card-field{padding-top:9px;border-top:1px solid rgba(50,90,98,.12);font-size:.83rem;line-height:1.48;color:#4c626a}.finding-card-field strong{display:block;margin-bottom:3px;color:#203b44}.finding-card-rule{margin-top:11px;font-size:.68rem;letter-spacing:.02em;color:#7b8d93;overflow-wrap:anywhere}.finding-group-empty{padding:14px;border:1px dashed #d5e3e3;border-radius:13px;color:#62777d;font-size:.84rem}
    @media (max-width:760px){.finding-explanation-panel{padding:0 14px 32px}.finding-explanation-shell{padding:18px;border-radius:20px}.finding-card-grid{grid-template-columns:1fr}}
  `;
  document.head.append(style);
}

function FindingExplanationCard({ finding, labels }) {
  return (
    <article className="finding-card" data-severity={finding.severity}>
      <h4 className="finding-card-title">{finding.title}</h4>
      {finding.description && <p className="finding-card-desc">{finding.description}</p>}
      <div className="finding-card-fields">
        <div className="finding-card-field"><strong>{labels.reason}</strong>{finding.reason}</div>
        <div className="finding-card-field"><strong>{labels.impact}</strong>{finding.impact}</div>
        <div className="finding-card-field"><strong>{labels.resolution}</strong>{finding.resolution}</div>
      </div>
      {finding.ruleId && <div className="finding-card-rule">{finding.ruleId}</div>}
    </article>
  );
}

function FindingExplanationPanel({ result, state, lang }) {
  const model = useMemo(() => buildFindingExplanationModel(result || window.Engine.analyze({ ...state, lang }), lang), [result, state, lang]);
  if (!model.total) return null;
  return (
    <section className="finding-explanation-panel" aria-labelledby="finding-explanation-title">
      <div className="finding-explanation-shell">
        <header className="finding-explanation-head">
          <h2 className="finding-explanation-title" id="finding-explanation-title">{model.title}</h2>
          <p className="finding-explanation-subtitle">{model.subtitle}</p>
        </header>
        {model.groups.map(group => (
          <section className="finding-group" key={group.key} aria-labelledby={`finding-group-${group.key}`}>
            <div className="finding-group-head">
              <h3 className="finding-group-title" id={`finding-group-${group.key}`}>{group.label}</h3>
              <span className="finding-group-count" aria-label={`${group.label}: ${group.findings.length}`}>{group.findings.length}</span>
            </div>
            {group.findings.length > 0 ? (
              <div className="finding-card-grid">
                {group.findings.map((finding, index) => <FindingExplanationCard key={`${finding.key}-${index}`} finding={finding} labels={model.labels} />)}
              </div>
            ) : <div className="finding-group-empty">{model.empty}</div>}
          </section>
        ))}
      </div>
    </section>
  );
}

function ResultEnhancements({ state, lang }) {
  const result = useMemo(() => window.Engine.analyze({ ...state, lang }), [state, lang]);
  return (
    <>
      <ScoreBreakdownPanel result={result} state={state} lang={lang} />
      <FindingExplanationPanel result={result} state={state} lang={lang} />
    </>
  );
}

const RAW_FLOWS = {
  tank: ['path', 'tank', 'water', 'fish', 'plants', 'substrate', 'result'],
  fish: ['path', 'water', 'fish', 'tank', 'plants', 'substrate', 'result'],
  water: ['path', 'water', 'tank', 'fish', 'plants', 'substrate', 'result'],
};
function flowFor(state) {
  if (!state.path) return ['path'];
  let f = RAW_FLOWS[state.path];
  if (state.water === 'salt') f = f.filter(s => s !== 'plants');
  return f;
}

function App() {
  const [lang, setLang] = useState('tr');
  const [view, setView] = useState('home');
  const [state, setState] = useState({ lang: 'tr', fish: [], plants: [] });
  const [stepIdx, setStepIdx] = useState(0);
  const navigationPendingRef = useRef(false);

  useEffect(() => { setState(s => ({ ...s, lang })); }, [lang]);
  useLayoutEffect(() => {
    if (!state.water) return;
    setState(current => {
      const originalFish = current.fish || [];
      const originalPlants = current.plants || [];
      const fish = originalFish.filter(item => {
        const definition = window.DB?.fish?.find(candidate => candidate.id === item.id);
        const waterTypes = Array.isArray(definition?.water?.types)
          ? definition.water.types
          : [definition?.water];
        return waterTypes.includes(current.water);
      });
      const plants = current.water === 'fresh' ? originalPlants : [];
      const substrateDefinition = window.DB?.substrates?.find(item => item.id === current.substrate);
      const substrate = substrateDefinition?.water?.includes(current.water) ? current.substrate : null;
      const changed = fish.length !== originalFish.length
        || plants.length !== originalPlants.length
        || substrate !== current.substrate;
      return changed ? { ...current, fish, plants, substrate } : current;
    });
  }, [state.water]);
  const t = window.I18N[lang];
  const flow = flowFor(state);
  const maxStepIdx = Math.max(0, flow.length - 1);
  const safeStepIdx = Math.min(Math.max(0, stepIdx), maxStepIdx);
  const stepName = flow[safeStepIdx] || 'path';

  useEffect(() => {
    if (stepIdx !== safeStepIdx) setStepIdx(safeStepIdx);
  }, [stepIdx, safeStepIdx]);

  function restart() {
    setState({ lang, fish: [], plants: [] }); setStepIdx(0); setView('home');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  function scheduleStepChange(expectedIndex, targetIndex, currentFlow) {
    if (navigationPendingRef.current) return;
    navigationPendingRef.current = true;
    window.setTimeout(() => {
      setStepIdx(current => {
        const maxIndex = Math.max(0, currentFlow.length - 1);
        const normalized = Math.min(Math.max(0, current), maxIndex);
        return normalized === expectedIndex ? targetIndex : normalized;
      });
      navigationPendingRef.current = false;
    }, 0);
  }
  function next() {
    const currentFlow = flowFor(state);
    const expectedIndex = safeStepIdx;
    const targetIndex = Math.min(expectedIndex + 1, Math.max(0, currentFlow.length - 1));
    scheduleStepChange(expectedIndex, targetIndex, currentFlow);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  function back() {
    const currentFlow = flowFor(state);
    const expectedIndex = safeStepIdx;
    const targetIndex = Math.max(0, expectedIndex - 1);
    scheduleStepChange(expectedIndex, targetIndex, currentFlow);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  function jumpTo(target) {
    const currentFlow = flowFor(state);
    const expectedIndex = safeStepIdx;
    const targetIndex = typeof target === 'number' ? target : currentFlow.indexOf(target);
    if (targetIndex >= 0 && targetIndex < currentFlow.length) {
      scheduleStepChange(expectedIndex, targetIndex, currentFlow);
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  const STEP_LABELS = { tank: t.tank_eyebrow, water: t.water_eyebrow, fish: t.fish_eyebrow, plants: t.plants_eyebrow, substrate: t.substrate_eyebrow, result: t.result_eyebrow };
  function pickPath(id) { setState(s => ({ ...s, path: id })); setStepIdx(1); }

  let canProceed = true;
  if (stepName === 'tank' && !state.volume) canProceed = false;
  if (stepName === 'water' && !state.water) canProceed = false;
  if (stepName === 'fish' && (!state.fish || state.fish.length === 0)) canProceed = false;

  let stepEl = null;
  if (stepName === 'path') stepEl = <PathStep onPick={pickPath} t={t} />;
  if (stepName === 'tank') stepEl = <TankStep state={state} setState={setState} t={t} />;
  if (stepName === 'water') stepEl = <WaterStep state={state} setState={setState} t={t} />;
  if (stepName === 'fish') stepEl = <FishStep state={state} setState={setState} t={t} lang={lang} />;
  if (stepName === 'plants') stepEl = <PlantsStep state={state} setState={setState} t={t} lang={lang} />;
  if (stepName === 'substrate') stepEl = <SubstrateStep state={state} setState={setState} t={t} lang={lang} />;
  if (stepName === 'result') stepEl = <><ResultStep state={state} setState={setState} t={t} lang={lang} /><ResultEnhancements state={state} lang={lang} /></>;

  const showRecipe = stepName !== 'path' && stepName !== 'fish' && stepName !== 'result';
  const isResult = stepName === 'result';
  const stepsForProgress = flow.slice(1);
  const progressCurrent = Math.max(0, safeStepIdx - 1);

  if (view === 'home') {
    return <div className="app"><Bubbles /><Topbar lang={lang} setLang={setLang} step={0} total={0} onRestart={restart} t={t} /><Landing t={t} onStart={() => { setView('wizard'); setStepIdx(0); window.scrollTo({ top: 0 }); }} /></div>;
  }

  return (
    <div className="app app-wizard">
      <Topbar lang={lang} setLang={setLang} step={progressCurrent} total={stepsForProgress.length} onRestart={restart} t={t} />
      <main className="stage">{showRecipe && <RecipeStrip state={state} t={t} jumpTo={jumpTo} />}{stepEl}</main>
      {stepName !== 'path' && <div className="foot-nav"><button className="btn btn-ghost" onClick={back}>← {t.back}</button><Progress steps={stepsForProgress} current={progressCurrent} labels={stepsForProgress.map(s => STEP_LABELS[s] || s)} onJump={i => jumpTo(i + 1)} />{isResult ? <button className="btn btn-secondary" onClick={restart}>{t.restart} ↻</button> : <button className="btn btn-primary" onClick={next} disabled={!canProceed}>{safeStepIdx === flow.length - 2 ? t.finish : t.next} →</button>}</div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
