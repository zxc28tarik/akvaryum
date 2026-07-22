export const CORAL_CARE_VERSION = 1;
export const CORAL_CARE_SOURCE_ID = 'coral-care-curation-rules-v1';
export const CORAL_CARE_PROGRAM = 'coral-care-v1';

export const CORAL_ENTITY_TYPES = Object.freeze([
  'soft_coral',
  'lps_coral',
  'sps_coral',
]);

const CORAL_TYPES = new Set(CORAL_ENTITY_TYPES);

const TYPE_DEFAULTS = Object.freeze({
  soft_coral: Object.freeze({ light: 'medium', flow: 'medium', aggression: 'low' }),
  lps_coral: Object.freeze({ light: 'medium', flow: 'medium', aggression: 'medium' }),
  sps_coral: Object.freeze({ light: 'high', flow: 'high', aggression: 'medium' }),
});

// Genus-level exceptions refine the broad soft/LPS/SPS baseline. These are
// reviewed care-library summaries, not species-level verified measurements.
export const CORAL_GENUS_OVERRIDES = Object.freeze({
  // Soft corals and corallimorphs
  Discosoma: Object.freeze({ light: 'low', flow: 'low', aggression: 'low' }),
  Rhodactis: Object.freeze({ light: 'medium', flow: 'low', aggression: 'medium' }),
  Ricordea: Object.freeze({ light: 'medium', flow: 'low', aggression: 'low' }),
  Clavularia: Object.freeze({ light: 'medium', flow: 'medium', aggression: 'medium' }),
  Pachyclavularia: Object.freeze({ light: 'medium', flow: 'medium', aggression: 'high' }),
  Xenia: Object.freeze({ light: 'medium', flow: 'medium', aggression: 'high' }),
  Zoanthus: Object.freeze({ light: 'medium', flow: 'medium', aggression: 'medium' }),
  Palythoa: Object.freeze({ light: 'medium', flow: 'medium', aggression: 'medium' }),
  Sarcophyton: Object.freeze({ light: 'medium', flow: 'medium', aggression: 'medium' }),
  Sinularia: Object.freeze({ light: 'medium', flow: 'medium', aggression: 'medium' }),
  Capnella: Object.freeze({ light: 'medium', flow: 'medium', aggression: 'medium' }),
  Cladiella: Object.freeze({ light: 'medium', flow: 'medium', aggression: 'medium' }),
  Tubipora: Object.freeze({ light: 'medium', flow: 'medium', aggression: 'low' }),

  // LPS corals
  Acanthastrea: Object.freeze({ light: 'medium', flow: 'low', aggression: 'high' }),
  Micromussa: Object.freeze({ light: 'medium', flow: 'low', aggression: 'high' }),
  Blastomussa: Object.freeze({ light: 'medium', flow: 'low', aggression: 'medium' }),
  Catalaphyllia: Object.freeze({ light: 'medium', flow: 'low', aggression: 'high' }),
  Caulastrea: Object.freeze({ light: 'medium', flow: 'low', aggression: 'low' }),
  Duncanopsammia: Object.freeze({ light: 'medium', flow: 'low', aggression: 'low' }),
  Echinophyllia: Object.freeze({ light: 'medium', flow: 'medium', aggression: 'high' }),
  Euphyllia: Object.freeze({ light: 'medium', flow: 'variable', aggression: 'high' }),
  Favia: Object.freeze({ light: 'medium', flow: 'medium', aggression: 'high' }),
  Fungia: Object.freeze({ light: 'medium', flow: 'low', aggression: 'medium' }),
  Galaxea: Object.freeze({ light: 'medium', flow: 'variable', aggression: 'high' }),
  Goniopora: Object.freeze({ light: 'medium', flow: 'variable', aggression: 'medium' }),
  Lobophyllia: Object.freeze({ light: 'medium', flow: 'low', aggression: 'high' }),
  Pectinia: Object.freeze({ light: 'low', flow: 'low', aggression: 'medium' }),
  Plerogyra: Object.freeze({ light: 'medium', flow: 'low', aggression: 'high' }),
  Scolymia: Object.freeze({ light: 'medium', flow: 'low', aggression: 'medium' }),
  Trachyphyllia: Object.freeze({ light: 'medium', flow: 'low', aggression: 'medium' }),
  Tubastraea: Object.freeze({ light: 'low', flow: 'low', aggression: 'medium' }),

  // SPS corals
  Acropora: Object.freeze({ light: 'high', flow: 'high', aggression: 'medium' }),
  Montipora: Object.freeze({ light: 'high', flow: 'high', aggression: 'medium' }),
  Cyphastrea: Object.freeze({ light: 'low', flow: 'medium', aggression: 'low' }),
  Echinopora: Object.freeze({ light: 'medium', flow: 'medium', aggression: 'medium' }),
  Leptoseris: Object.freeze({ light: 'low', flow: 'medium', aggression: 'medium' }),
  Pavona: Object.freeze({ light: 'medium', flow: 'medium', aggression: 'medium' }),
  Pocillopora: Object.freeze({ light: 'high', flow: 'high', aggression: 'medium' }),
  Porites: Object.freeze({ light: 'high', flow: 'high', aggression: 'low' }),
  Psammocora: Object.freeze({ light: 'medium', flow: 'high', aggression: 'medium' }),
  Seriatopora: Object.freeze({ light: 'high', flow: 'high', aggression: 'medium' }),
  Stylophora: Object.freeze({ light: 'high', flow: 'high', aggression: 'medium' }),
  Turbinaria: Object.freeze({ light: 'medium', flow: 'medium', aggression: 'medium' }),
});

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function isCoralRecord(record) {
  return CORAL_TYPES.has(record?.entityType);
}

export function deriveCoralCareProfile(record) {
  if (!isCoralRecord(record)) return null;

  const defaults = TYPE_DEFAULTS[record.entityType];
  const genus = String(record?.taxonomy?.genus || '').trim();
  const override = genus ? CORAL_GENUS_OVERRIDES[genus] : null;
  const values = override || defaults;

  if (!values) {
    throw new Error(`${record.id}: mercan bakım profili için entityType eşlemesi bulunamadı.`);
  }

  return {
    program: CORAL_CARE_PROGRAM,
    version: CORAL_CARE_VERSION,
    method: override ? 'reviewed_genus_care_profile' : 'coral_type_baseline',
    entityType: record.entityType,
    genus: genus || null,
    genusOverride: Boolean(override),
    fieldsCompleted: ['habitat.light', 'habitat.flow', 'compatibility.coralAggression'],
    light: values.light,
    flow: values.flow,
    aggression: values.aggression,
    externalSpeciesReviewRequired: true,
  };
}

export function applyCoralCareProfiles(records) {
  return records.map((record) => {
    const profile = deriveCoralCareProfile(record);
    if (!profile) return record;

    const note = 'Mercan ışık, akıntı ve agresyon alanları alt tür/cins bakım profillerinden düşük güvenle türetildi; tür bazlı dış kaynak doğrulaması bekliyor.';
    return {
      ...record,
      habitat: {
        ...record.habitat,
        light: profile.light,
        flow: profile.flow,
      },
      compatibility: {
        ...record.compatibility,
        coralAggression: profile.aggression,
      },
      sourceIds: unique([...(record.sourceIds ?? []), CORAL_CARE_SOURCE_ID]),
      fieldSourceIds: {
        ...record.fieldSourceIds,
        habitat: unique([...(record.fieldSourceIds?.habitat ?? []), CORAL_CARE_SOURCE_ID]),
        compatibility: unique([...(record.fieldSourceIds?.compatibility ?? []), CORAL_CARE_SOURCE_ID]),
      },
      verification: {
        ...record.verification,
        confidence: 'low',
        notes: unique([...(record.verification?.notes ?? []), note]),
      },
      migration: {
        ...record.migration,
        derivedFields: unique([
          ...(record.migration?.derivedFields ?? []),
          'habitat.light',
          'habitat.flow',
          'compatibility.coralAggression',
        ]),
        unknownFields: (record.migration?.unknownFields ?? []).filter(
          (field) => !['habitat.light', 'habitat.flow', 'compatibility.coralAggression'].includes(field),
        ),
      },
    };
  });
}
