import { validateScoreBreakdownPanel } from './lib/validate-score-breakdown-panel.mjs';

try {
  const report = validateScoreBreakdownPanel(process.cwd());
  console.log(JSON.stringify(report, null, 2));
  console.log(`AKV-UI-021 doğrulandı: ${report.scenarios} senaryo, ${report.sections} alt puan kartı.`);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
