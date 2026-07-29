import { readFileSync, writeFileSync } from 'node:fs';

function replaceRequired(source, pattern, replacement, label) {
  if (!pattern.test(source)) {
    if (source.includes(replacement.trim().slice(0, 48))) return source;
    throw new Error(`${label} için beklenen kod parçası bulunamadı.`);
  }
  return source.replace(pattern, replacement);
}

let app = readFileSync('app.jsx', 'utf8');
app = replaceRequired(
  app,
  /  const flow = flowFor\(state\);\n  const stepName = flow\[stepIdx\];/,
  `  const flow = flowFor(state);\n  const maxStepIdx = Math.max(0, flow.length - 1);\n  const safeStepIdx = Math.min(Math.max(0, stepIdx), maxStepIdx);\n  const stepName = flow[safeStepIdx] || 'path';\n\n  useEffect(() => {\n    if (stepIdx !== safeStepIdx) setStepIdx(safeStepIdx);\n  }, [stepIdx, safeStepIdx]);`,
  'güvenli adım indeksi',
);
app = replaceRequired(
  app,
  /  function next\(\) \{ if \(stepIdx < flow\.length - 1\) \{ setStepIdx\(stepIdx \+ 1\); window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\); \} \}\n  function back\(\) \{ if \(stepIdx > 0\) \{ setStepIdx\(stepIdx - 1\); window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\); \} \}\n  function jumpTo\(target\) \{ const idx = typeof target === 'number' \? target : flow\.indexOf\(target\); if \(idx >= 0 && idx < flow\.length\) \{ setStepIdx\(idx\); window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\); \} \}/,
  `  function next() {\n    const currentFlow = flowFor(state);\n    setStepIdx(current => {\n      const maxIndex = Math.max(0, currentFlow.length - 1);\n      const normalized = Math.min(Math.max(0, current), maxIndex);\n      return Math.min(normalized + 1, maxIndex);\n    });\n    window.scrollTo({ top: 0, behavior: 'smooth' });\n  }\n  function back() {\n    const currentFlow = flowFor(state);\n    setStepIdx(current => {\n      const maxIndex = Math.max(0, currentFlow.length - 1);\n      const normalized = Math.min(Math.max(0, current), maxIndex);\n      return Math.max(0, normalized - 1);\n    });\n    window.scrollTo({ top: 0, behavior: 'smooth' });\n  }\n  function jumpTo(target) {\n    const currentFlow = flowFor(state);\n    setStepIdx(current => {\n      const normalized = Math.min(Math.max(0, current), Math.max(0, currentFlow.length - 1));\n      const targetIndex = typeof target === 'number' ? target : currentFlow.indexOf(target);\n      return targetIndex >= 0 && targetIndex < currentFlow.length ? targetIndex : normalized;\n    });\n    window.scrollTo({ top: 0, behavior: 'smooth' });\n  }`,
  'fonksiyonel ileri geri geçişleri',
);
app = replaceRequired(
  app,
  /  const progressCurrent = Math\.max\(0, stepIdx - 1\);/,
  `  const progressCurrent = Math.max(0, safeStepIdx - 1);`,
  'güvenli ilerleme indeksi',
);
app = replaceRequired(
  app,
  /\{stepIdx === flow\.length - 2 \? t\.finish : t\.next\}/,
  `{safeStepIdx === flow.length - 2 ? t.finish : t.next}`,
  'güvenli ileri düğmesi etiketi',
);
writeFileSync('app.jsx', app);

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
packageJson.scripts['check:wizard-flow'] = 'node scripts/check-wizard-flow.mjs';
writeFileSync('package.json', `${JSON.stringify(packageJson, null, 2)}\n`);

let workflow = readFileSync('.github/workflows/vite-verify.yml', 'utf8');
if (!workflow.includes('npm run check:wizard-flow')) {
  workflow = workflow.replace(
    `      - name: İlk 100 sosyal yapı ve bakım zorluğunu doğrula\n        run: npm run check:priority100`,
    `      - name: Sihirbaz adım geçişlerini doğrula\n        run: npm run check:wizard-flow\n\n      - name: İlk 100 sosyal yapı ve bakım zorluğunu doğrula\n        run: npm run check:priority100`,
  );
}
if (!workflow.includes('npm run check:wizard-flow')) throw new Error('CI sihirbaz kontrolü eklenemedi.');
writeFileSync('.github/workflows/vite-verify.yml', workflow);

let vite = readFileSync('vite.config.js', 'utf8');
if (!vite.includes("import { validateWizardFlow } from './scripts/lib/validate-wizard-flow.mjs';")) {
  vite = vite.replace(
    "import { validateMobileFlow } from './scripts/lib/validate-mobile-flow.mjs';",
    "import { validateMobileFlow } from './scripts/lib/validate-mobile-flow.mjs';\nimport { validateWizardFlow } from './scripts/lib/validate-wizard-flow.mjs';",
  );
}
if (!vite.includes('const wizardFlowReport = validateWizardFlow(repositoryRoot);')) {
  vite = vite.replace(
    '      const mobileFlowReport = validateMobileFlow(repositoryRoot);',
    '      const mobileFlowReport = validateMobileFlow(repositoryRoot);\n      const wizardFlowReport = validateWizardFlow(repositoryRoot);',
  );
}
if (!vite.includes('AKVARYUM sihirbaz akışı doğrulandı')) {
  vite = vite.replace(
    "      this.info(`AKVARYUM mobil ana akışı doğrulandı: ${mobileFlowReport.scenarios} senaryo, ${mobileFlowReport.smokeWidthPx}px hedef.`);",
    "      this.info(`AKVARYUM mobil ana akışı doğrulandı: ${mobileFlowReport.scenarios} senaryo, ${mobileFlowReport.smokeWidthPx}px hedef.`);\n      this.info(`AKVARYUM sihirbaz akışı doğrulandı: ${wizardFlowReport.navigationScenarios} geçiş, ${wizardFlowReport.analyzedRecords} sonuç duman testi.`);",
  );
}
if (!vite.includes('validateWizardFlow(repositoryRoot)')) throw new Error('Vite sihirbaz doğrulaması eklenemedi.');
writeFileSync('vite.config.js', vite);
