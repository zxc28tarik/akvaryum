import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import Ajv2020 from 'ajv/dist/2020.js';

import { loadLegacyData } from './load-legacy-data.mjs';
import { buildSourceProvenanceDataset } from './source-provenance.mjs';

function formatAjvErrors(errors = []) {
  return errors.slice(0, 40).map((error) => `${error.instancePath || '/'}: ${error.message}`).join('\n');
}

function increment(counter, key) {
  counter[key] = (counter[key] ?? 0) + 1;
}

export function validateSourceProvenance(repositoryRoot) {
  const data = loadLegacyData(repositoryRoot, { withProvenance: true });
  const dataset = buildSourceProvenanceDataset(data);
  const schema = JSON.parse(readFileSync(resolve(repositoryRoot, 'schemas/source-provenance.schema.json'), 'utf8'));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);

  if (!validate(dataset)) {
    throw new Error(`AKVARYUM kaynak şeması doğrulanamadı:\n${formatAjvErrors(validate.errors)}`);
  }

  const sourceById = new Map();
  for (const source of dataset.sources) {
    if (sourceById.has(source.id)) throw new Error(`Tekrarlanan kaynak kimliği: ${source.id}`);
    sourceById.set(source.id, source);
  }

  const recordKeys = new Set();
  const verificationStatuses = {};
  let fieldLinks = 0;

  for (const record of dataset.records) {
    const recordKey = `${record.collection}:${record.id}`;
    if (recordKeys.has(recordKey)) throw new Error(`Tekrarlanan kaynak kaydı: ${recordKey}`);
    recordKeys.add(recordKey);
    increment(verificationStatuses, record.verification.status);

    for (const sourceId of record.sourceIds) {
      if (!sourceById.has(sourceId)) throw new Error(`${recordKey}: bilinmeyen kaynak kimliği ${sourceId}`);
    }

    for (const [field, sourceIds] of Object.entries(record.fieldSourceIds)) {
      fieldLinks += sourceIds.length;
      for (const sourceId of sourceIds) {
        const source = sourceById.get(sourceId);
        if (!source) throw new Error(`${recordKey}.${field}: bilinmeyen kaynak kimliği ${sourceId}`);
        if (!record.sourceIds.includes(sourceId)) {
          throw new Error(`${recordKey}.${field}: ${sourceId} record.sourceIds içinde yok.`);
        }
        if (!source.fields.includes(field)) {
          throw new Error(`${recordKey}.${field}: ${sourceId} bu alanı desteklediğini bildirmiyor.`);
        }
      }
    }

    if (record.verification.status === 'verified') {
      const unverifiedSource = record.sourceIds
        .map((sourceId) => sourceById.get(sourceId))
        .find((source) => source.status !== 'verified');
      if (unverifiedSource) {
        throw new Error(`${recordKey}: doğrulanmış kayıt doğrulanmamış kaynak taşıyor (${unverifiedSource.id}).`);
      }
    }
  }

  return {
    catalogVersion: dataset.catalogVersion,
    sources: dataset.sources.length,
    records: dataset.records.length,
    fieldLinks,
    verificationStatuses,
    allSourceIdsResolved: true,
  };
}
