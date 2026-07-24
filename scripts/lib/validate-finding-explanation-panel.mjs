import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function validateFindingExplanationPanel(repositoryRoot) {
  const app = readFileSync(resolve(repositoryRoot, 'app.jsx'), 'utf8');
  const workflow = readFileSync(resolve(repositoryRoot, '.github/workflows/vite-verify.yml'), 'utf8');
  const packageJson = JSON.parse(readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8'));
  let scenarios = 0;

  assert.match(app, /const FINDING_COPY/);
  assert.match(app, /Sorunlar, uyarılar ve öneriler/);
  assert.match(app, /Issues, warnings and recommendations/);
  scenarios += 1;

  assert.match(app, /function buildFindingExplanationModel/);
  assert.match(app, /result\?\.issues/);
  assert.match(app, /result\?\.warnings/);
  assert.match(app, /result\?\.tips/);
  scenarios += 1;

  assert.match(app, /critical: 'Kritik sorunlar'/);
  assert.match(app, /warning: 'Uyarılar'/);
  assert.match(app, /tip: 'Öneriler'/);
  assert.match(app, /critical: 'Critical issues'/);
  assert.match(app, /warning: 'Warnings'/);
  assert.match(app, /tip: 'Recommendations'/);
  scenarios += 1;

  assert.match(app, /labels\.reason/);
  assert.match(app, /labels\.impact/);
  assert.match(app, /labels\.resolution/);
  assert.match(app, /finding\.reason/);
  assert.match(app, /finding\.impact/);
  assert.match(app, /finding\.resolution/);
  scenarios += 1;

  assert.match(app, /<FindingExplanationPanel state=\{state\} lang=\{lang\}/);
  assert.match(app, /window\.Engine\.analyze/);
  assert.match(app, /<FindingExplanationCard/);
  scenarios += 1;

  assert.match(app, /data-severity=\{finding\.severity\}/);
  assert.match(app, /aria-labelledby="finding-explanation-title"/);
  assert.match(app, /aria-labelledby=\{`finding-group-\$\{group\.key\}`\}/);
  assert.match(app, /aria-label=\{`\$\{group\.label\}: \$\{group\.findings\.length\}`\}/);
  scenarios += 1;

  assert.match(app, /\.finding-card\[data-severity="critical"\]/);
  assert.match(app, /\.finding-card\[data-severity="warning"\]/);
  assert.match(app, /\.finding-card\[data-severity="tip"\]/);
  assert.match(app, /@media \(max-width:760px\)/);
  assert.match(app, /\.finding-card-grid\{grid-template-columns:1fr\}/);
  scenarios += 1;

  assert.match(workflow, /check:finding-panel/);
  assert.equal(packageJson.scripts['check:finding-panel'], 'node scripts/check-finding-explanation-panel.mjs');
  scenarios += 1;

  assert.equal(scenarios, 8);
  return {
    scenarios,
    groups: 3,
    bilingual: true,
    reasonImpactResolution: true,
    accessibleSections: true,
    responsive: true,
    productionConnected: true,
  };
}
