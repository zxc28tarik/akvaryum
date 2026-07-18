import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import Ajv2020 from 'ajv/dist/2020.js';

import { buildInhabitantCatalog } from '../../data/catalog/index.mjs';
import { MIGRATION_SOURCE_ID } from '../../data/migration/legacy-to-inhabitant.mjs';
import { loadLegacyData } from './load-legacy-data.mjs';

const EXPECTED_TOTAL = 580;

function formatAjvErrors(errors = []) {
  return errors
    .slice(0, 50)
    .map((error) => `${error.instancePath || '/'}: ${error.message}`)
    .join('\n');
}

function equalArray(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function validateInhabitantMigration(repositoryRoot) {
  const data = loadLegacyData(repositoryRoot, {
    withProvenance: true,
    withMigration: true,
    withCatalog: false,
  });
  const legacyRecords = data.fish;
  const inhabitants = data.inhabitants;

  if (legacyRecords.length !== EXPECTED_TOTAL || inhabitants.length !== EXPECTED_TOTAL) {
    throw new Error(`Migrasyon sayısı hatalı: legacy=${legacyRecords.length}, inhabitant=${inhabitants.length}.`);
  }

  const schema = JSON.parse(
    readFileSync(resolve(repositoryRoot, 'schemas/inhabitant-v1.schema.json'), 'utf8'),
  );
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);
  if (!validate(inhabitants)) {
    throw new Error(`Inhabitant v1 şeması doğrulanamadı:\n${formatAjvErrors(validate.errors)}`);
  }

  const legacyById = new Map(legacyRecords.map((record) => [record.id, record]));
  const sourceById = new Map(data.sources.map((source) => [source.id, source]));
  const migratedIds = new Set();

  for (const inhabitant of inhabitants) {
    if (migratedIds.has(inhabitant.id)) {
      throw new Error(`Migrasyonda tekrarlanan kimlik: ${inhabitant.id}`);
    }
    migratedIds.add(inhabitant.id);

    const legacy = legacyById.get(inhabitant.id);
    if (!legacy) throw new Error(`${inhabitant.id}: eski kaydı bulunamadı.`);

    if (inhabitant.name.tr !== legacy.nameTr || inhabitant.name.en !== legacy.nameEn) {
      throw new Error(`${inhabitant.id}: ad alanı kayıpsız taşınmadı.`);
    }
    if (inhabitant.scientificName !== legacy.sci) {
      throw new Error(`${inhabitant.id}: bilimsel ad kayıpsız taşınmadı.`);
    }
    if (!equalArray(inhabitant.water.temperatureC, legacy.temp)
      || !equalArray(inhabitant.water.pH, legacy.pH)
      || !equalArray(inhabitant.water.gh, legacy.gh)) {
      throw new Error(`${inhabitant.id}: su aralıkları kayıpsız taşınmadı.`);
    }
    if (inhabitant.size.adultCm[0] !== legacy.adultSize
      || inhabitant.size.adultCm[1] !== legacy.adultSize) {
      throw new Error(`${inhabitant.id}: yetişkin boyu kayıpsız taşınmadı.`);
    }
    if (inhabitant.tank.minVolumeL !== legacy.minVolume
      || inhabitant.tank.additionalVolumePerInhabitantL !== legacy.perFishL) {
      throw new Error(`${inhabitant.id}: tank hacmi alanları kayıpsız taşınmadı.`);
    }
    if (!inhabitant.sourceIds.includes(MIGRATION_SOURCE_ID)) {
      throw new Error(`${inhabitant.id}: migrasyon kaynak kimliği eksik.`);
    }

    for (const sourceId of inhabitant.sourceIds) {
      if (!sourceById.has(sourceId)) {
        throw new Error(`${inhabitant.id}: bilinmeyen kaynak kimliği (${sourceId}).`);
      }
    }
    for (const [field, sourceIds] of Object.entries(inhabitant.fieldSourceIds)) {
      for (const sourceId of sourceIds) {
        const source = sourceById.get(sourceId);
        if (!source) throw new Error(`${inhabitant.id}.${field}: bilinmeyen kaynak (${sourceId}).`);
        if (!inhabitant.sourceIds.includes(sourceId)) {
          throw new Error(`${inhabitant.id}.${field}: ${sourceId} sourceIds içinde yok.`);
        }
        if (!source.fields.includes(field)) {
          throw new Error(`${inhabitant.id}.${field}: ${sourceId} bu alanı desteklemiyor.`);
        }
      }
    }
    for (const sourceId of legacy.sourceIds ?? []) {
      if (!inhabitant.sourceIds.includes(sourceId)) {
        throw new Error(`${inhabitant.id}: eski kaynak kimliği kayboldu (${sourceId}).`);
      }
    }
  }

  for (const legacy of legacyRecords) {
    if (!migratedIds.has(legacy.id)) throw new Error(`${legacy.id}: yeni modelde kayıt kayboldu.`);
  }

  const catalog = buildInhabitantCatalog(inhabitants);
  const unknownFields = {};
  for (const inhabitant of inhabitants) {
    for (const field of inhabitant.migration.unknownFields) {
      unknownFields[field] = (unknownFields[field] ?? 0) + 1;
    }
  }

  return {
    schemaVersion: 1,
    legacyRecords: legacyRecords.length,
    migratedRecords: inhabitants.length,
    preservedIds: migratedIds.size,
    catalog: catalog.counts,
    unknownFields,
    allDirectValuesPreserved: true,
    allSourceIdsPreserved: true,
  };
}
