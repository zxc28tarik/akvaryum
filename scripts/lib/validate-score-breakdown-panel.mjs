import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function validateScoreBreakdownPanel(repositoryRoot) {
  const app = readFileSync(resolve(repositoryRoot, 'app.jsx'), 'utf8');
  const workflow = readFileSync(resolve(repositoryRoot, '.github/workflows/vite-verify.yml'), 'utf8');
  const packageJson = JSON.parse(readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8'));
  let scenarios = 0;

  assert.match(app, /SCORE_SECTION_ORDER[^\n]+environmental[^\n]+behavior[^\n]+tank[^\n]+habitat/);
  assert.match(app, /scoreBreakdown/);
  scenarios += 1;

  assert.match(app, /function scoreSectionForFinding/);
  assert.match(app, /PAIRWISE_INCOMPATIBLE/);
  assert.match(app, /REEF_SHRIMP_RISK/);
  assert.match(app, /SCHOOLING_MINIMUM/);
  scenarios += 1;

  assert.match(app, /Puanın nasıl oluştu\?/);
  assert.match(app, /How was the score calculated\?/);
  assert.match(app, /Kritik güvenlik sınırı uygulandı/);
  assert.match(app, /Critical safety cap applied/);
  scenarios += 1;

  assert.match(app, /function ResultEnhancements/);
  assert.match(app, /<ScoreBreakdownPanel result=\{result\} state=\{state\} lang=\{lang\}/);
  assert.match(app, /window\.Engine\.analyze/);
  assert.match(app, /result\?\.scoreBreakdown/);
  scenarios += 1;

  assert.match(app, /role="progressbar"/);
  assert.match(app, /aria-valuenow=\{section\.score\}/);
  assert.match(app, /aria-labelledby="score-breakdown-title"/);
  assert.match(app, /role="note"/);
  scenarios += 1;

  assert.match(app, /labels\.reason/);
  assert.match(app, /labels\.impact/);
  assert.match(app, /labels\.resolution/);
  assert.match(app, /<details className="score-breakdown-details"/);
  scenarios += 1;

  assert.match(app, /@media \(max-width:760px\)/);
  assert.match(app, /grid-template-columns:1fr/);
  scenarios += 1;

  assert.match(workflow, /check:score-panel/);
  assert.equal(packageJson.scripts['check:score-panel'], 'node scripts/check-score-breakdown-panel.mjs');
  scenarios += 1;

  assert.equal(scenarios, 8);
  return { scenarios, sections: 4, bilingual: true, accessibleProgress: true, reasonImpactResolution: true, responsive: true, productionConnected: true };
}
