import { validateFindingExplanationPanel } from './lib/validate-finding-explanation-panel.mjs';

try {
  const report = validateFindingExplanationPanel(process.cwd());
  console.log(JSON.stringify(report, null, 2));
  console.log(`AKV-UI-022 doğrulandı: ${report.scenarios} senaryo, ${report.groups} bulgu grubu.`);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
