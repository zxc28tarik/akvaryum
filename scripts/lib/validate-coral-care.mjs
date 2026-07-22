import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import Ajv2020 from 'ajv/dist/2020.js';

import {
  applyCoralCareProfiles,
  CORAL_CARE_SOURCE_ID,
  CORAL_ENTITY_TYPES,
  deriveCoralCareProfile,
  isCoralRecord,
} from '../../data/curation/coral-care-v1.mjs';
import { loadLegacyData } from './load-legacy-data.mjs';

const VALID_LIGHT = new Set(['low', 'medium', 'high']);
const VALID_FLOW = new Set(['low', 'medium', 'high', 'variable']);
const VALID_AGGRESSION = new Set(['none', 'low', 'medium', 'high']);

function increment(counter, key) {
  counter[key] = (counter[key] ?? 0) + 1;
}

function synthetic(entityType, genus = null) {
  return {
    id: `synthetic-${entityType}-${genus || 'default'}`.toLowerCase().replaceAll('_', '-'),
    entityType,
    taxonomy: { genus },
  };
}

export function validateCoralCare(repositoryRoot) {
  const data = loadLegacyData(repositoryRoot, {
    withProvenance: true,
    withMigration: true,
  });
  const before = data.inhabitants;
  const after = applyCoralCareProfiles(before);

  const schema = JSON.parse(
    readFileSync(resolve(repositoryRoot, 'schemas/inhabitant-v1.schema.json'), 'utf8'),
  );
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);
  assert(validate(after), ajv.errorsText(validate.errors));

  const sourceCatalog = JSON.parse(
    readFileSync(resolve(repositoryRoot, 'data/sources/source-catalog.json'), 'utf8'),
  );
  const source = sourceCatalog.sources.find((entry) => entry.id === CORAL_CARE_SOURCE_ID);
  assert(source, `${CORAL_CARE_SOURCE_ID}: kaynak kataloğunda bulunamadı.`);
  assert(source.fields.includes('habitat'));
  assert(source.fields.includes('compatibility'));
  assert.equal(source.status, 'reviewed');
  assert.equal(source.confidence, 'low');

  const corals = after.filter(isCoralRecord);
  assert(corals.length > 0, 'Mercan kaydı bulunamadı.');

  const byType = {};
  const light = {};
  const flow = {};
  const aggression = {};
  let genusOverrides = 0;

  for (const coral of corals) {
    increment(byType, coral.entityType);
    increment(light, coral.habitat.light);
    increment(flow, coral.habitat.flow);
    increment(aggression, coral.compatibility.coralAggression);

    assert(CORAL_ENTITY_TYPES.includes(coral.entityType), `${coral.id}: mercan entityType hatalı.`);
    assert(VALID_LIGHT.has(coral.habitat.light), `${coral.id}: ışık alanı tamamlanmadı.`);
    assert(VALID_FLOW.has(coral.habitat.flow), `${coral.id}: akıntı alanı tamamlanmadı.`);
    assert(VALID_AGGRESSION.has(coral.compatibility.coralAggression), `${coral.id}: agresyon alanı tamamlanmadı.`);
    assert(coral.sourceIds.includes(CORAL_CARE_SOURCE_ID), `${coral.id}: mercan bakım kaynak kimliği eksik.`);
    assert(coral.fieldSourceIds.habitat.includes(CORAL_CARE_SOURCE_ID), `${coral.id}: habitat kaynak bağlantısı eksik.`);
    assert(coral.fieldSourceIds.compatibility.includes(CORAL_CARE_SOURCE_ID), `${coral.id}: uyumluluk kaynak bağlantısı eksik.`);
    assert.equal(coral.verification.confidence, 'low');
    assert(coral.migration.derivedFields.includes('habitat.light'));
    assert(coral.migration.derivedFields.includes('habitat.flow'));
    assert(coral.migration.derivedFields.includes('compatibility.coralAggression'));

    const profile = deriveCoralCareProfile(coral);
    if (profile.genusOverride) genusOverrides += 1;
  }

  for (let index = 0; index < before.length; index += 1) {
    if (!isCoralRecord(before[index])) {
      assert.equal(after[index], before[index], `${before[index].id}: mercan olmayan kayıt değiştirilmemelidir.`);
    }
  }

  assert.deepEqual(
    Object.keys(byType).sort(),
    [...CORAL_ENTITY_TYPES].sort(),
    'Soft, LPS ve SPS gruplarının tamamı bulunmalıdır.',
  );
  assert(genusOverrides > 0, 'Hiçbir cins istisnası uygulanmadı.');

  const softDefault = deriveCoralCareProfile(synthetic('soft_coral'));
  const lpsDefault = deriveCoralCareProfile(synthetic('lps_coral'));
  const spsDefault = deriveCoralCareProfile(synthetic('sps_coral'));
  assert.deepEqual(
    [softDefault.light, softDefault.flow, softDefault.aggression],
    ['medium', 'medium', 'low'],
  );
  assert.deepEqual(
    [lpsDefault.light, lpsDefault.flow, lpsDefault.aggression],
    ['medium', 'medium', 'medium'],
  );
  assert.deepEqual(
    [spsDefault.light, spsDefault.flow, spsDefault.aggression],
    ['high', 'high', 'medium'],
  );

  const discosoma = deriveCoralCareProfile(synthetic('soft_coral', 'Discosoma'));
  assert.deepEqual([discosoma.light, discosoma.flow], ['low', 'low']);
  const galaxea = deriveCoralCareProfile(synthetic('lps_coral', 'Galaxea'));
  assert.deepEqual([galaxea.flow, galaxea.aggression], ['variable', 'high']);
  const tubastraea = deriveCoralCareProfile(synthetic('lps_coral', 'Tubastraea'));
  assert.deepEqual([tubastraea.light, tubastraea.flow], ['low', 'low']);
  const acropora = deriveCoralCareProfile(synthetic('sps_coral', 'Acropora'));
  assert.deepEqual([acropora.light, acropora.flow], ['high', 'high']);
  const leptoseris = deriveCoralCareProfile(synthetic('sps_coral', 'Leptoseris'));
  assert.deepEqual([leptoseris.light, leptoseris.flow], ['low', 'medium']);

  const viteConfig = readFileSync(resolve(repositoryRoot, 'vite.config.js'), 'utf8');
  assert(viteConfig.includes("coral-care-v1.mjs"), 'Vite mercan bakım modülünü yüklemiyor.');
  assert(viteConfig.includes('applyCoralCareProfiles'), 'Vite mercan bakım profillerini uygulamıyor.');

  return {
    version: 1,
    corals: corals.length,
    byType,
    completedLight: corals.filter((record) => VALID_LIGHT.has(record.habitat.light)).length,
    completedFlow: corals.filter((record) => VALID_FLOW.has(record.habitat.flow)).length,
    completedAggression: corals.filter((record) => VALID_AGGRESSION.has(record.compatibility.coralAggression)).length,
    genusOverrides,
    light,
    flow,
    aggression,
    scenarios: 11,
  };
}
