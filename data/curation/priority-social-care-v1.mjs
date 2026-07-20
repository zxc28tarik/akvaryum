export const PRIORITY_SOCIAL_CARE_VERSION = 1;
export const PRIORITY_SOCIAL_CARE_SOURCE_ID = 'priority-social-care-rules-v1';
export const PRIORITY_SOCIAL_CARE_PROGRAM = 'priority-100-social-care-v1';

export const PRIORITY_100_IDS = Object.freeze([
  'neon-tetra', 'cardinal-tetra', 'green-neon', 'rummy-nose', 'glowlight',
  'black-neon', 'serpae-tetra', 'lemon-tetra', 'rosy-tetra', 'bleeding-heart',
  'black-skirt', 'white-skirt', 'glofish-tetra', 'congo-tetra', 'penguin-tetra',
  'emperor-tetra', 'diamond-tetra', 'redeye-tetra', 'flame-tetra', 'silvertip',
  'buenos-aires', 'ember-tetra', 'rummy-false', 'cochu-blue', 'pristella',
  'green-fire', 'bloodfin', 'splash-tetra', 'pencilfish', 'dwarf-pencil',
  'three-line-pencil', 'hatchet-marble', 'hatchet-silver', 'pacu-red', 'silver-dollar',
  'red-hook', 'piranha-red', 'cardinal-flame', 'kerri-tetra', 'red-phantom',
  'black-phantom', 'cave-tetra', 'bucktoothed', 'colombian-tetra', 'rainbow-emperor',
  'gold-tetra', 'head-tail-light', 'green-tetra', 'rasbora-harlequin', 'rasbora-lambchop',
  'rasbora-hengeli', 'chili-rasbora', 'phoenix-rasbora', 'pygmy-rasbora', 'galaxy-rasbora',
  'scissortail', 'rasbora-pork', 'rasbora-emerald', 'rasbora-clown', 'danio-zebra',
  'danio-leopard', 'danio-pearl', 'danio-gold', 'danio-glofish', 'giant-danio',
  'celestial-pearl', 'glow-light-danio', 'rosy-danio', 'white-cloud', 'gold-white-cloud',
  'barb-tiger', 'barb-green-tiger', 'barb-cherry', 'barb-rosy', 'barb-gold',
  'barb-checkered', 'barb-tinfoil', 'barb-denisonii', 'barb-five-banded', 'barb-odessa',
  'barb-melon', 'barb-arulius', 'barb-black-ruby', 'angelfish', 'angel-altum',
  'angel-koi', 'angel-marble', 'angel-platinum', 'discus', 'discus-blue',
  'discus-heckel', 'oscar', 'oscar-tiger', 'oscar-albino', 'jack-dempsey',
  'firemouth', 'convict', 'convict-pink', 'green-terror', 'blue-acara',
]);

const PRIORITY_RANK_BY_ID = new Map(
  PRIORITY_100_IDS.map((id, index) => [id, index + 1]),
);

export const DIFFICULTY_REASON_NOTES = Object.freeze({
  very_large_tank: 'Minimum tank hacmi 500 litre veya üzeri.',
  large_tank: 'Minimum tank hacmi 250 litre veya üzeri.',
  medium_large_tank: 'Minimum tank hacmi 120 litre veya üzeri.',
  very_large_adult: 'Yetişkin boyu 30 cm veya üzeri.',
  large_adult: 'Yetişkin boyu 15 cm veya üzeri.',
  high_aggression: 'Eski kayıtta yüksek agresyon işareti bulunuyor.',
  semi_aggressive: 'Eski kayıtta yarı agresif davranış işareti bulunuyor.',
  carnivorous: 'Eski kayıtta etçil beslenme işareti bulunuyor.',
  narrow_temperature: 'Kayıtlı sıcaklık aralığı 3°C veya daha dar.',
  narrow_ph: 'Kayıtlı pH aralığı 0,8 veya daha dar.',
  large_group_requirement: 'Önerilen asgari grup 8 veya daha fazla.',
});

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function rangeWidth(range) {
  if (!Array.isArray(range) || range.length !== 2) return Number.POSITIVE_INFINITY;
  return Number(range[1]) - Number(range[0]);
}

function difficultyProfile(record) {
  let score = 0;
  const reasons = [];
  const minVolumeL = record.tank?.minVolumeL ?? 0;
  const adultCm = record.size?.adultCm?.[1] ?? 0;
  const temperament = record.behavior?.temperament;
  const diets = record.feeding?.diet ?? [];
  const minGroup = record.social?.minGroup ?? 0;

  if (minVolumeL >= 500) {
    score += 3;
    reasons.push('very_large_tank');
  } else if (minVolumeL >= 250) {
    score += 2;
    reasons.push('large_tank');
  } else if (minVolumeL >= 120) {
    score += 1;
    reasons.push('medium_large_tank');
  }

  if (adultCm >= 30) {
    score += 2;
    reasons.push('very_large_adult');
  } else if (adultCm >= 15) {
    score += 1;
    reasons.push('large_adult');
  }

  if (temperament === 'aggressive' || temperament === 'predatory') {
    score += 2;
    reasons.push('high_aggression');
  } else if (temperament === 'semi_aggressive') {
    score += 1;
    reasons.push('semi_aggressive');
  }

  if (diets.includes('carnivore')) {
    score += 1;
    reasons.push('carnivorous');
  }
  if (rangeWidth(record.water?.temperatureC) <= 3) {
    score += 1;
    reasons.push('narrow_temperature');
  }
  if (rangeWidth(record.water?.pH) <= 0.8) {
    score += 1;
    reasons.push('narrow_ph');
  }
  if (minGroup >= 8) {
    score += 1;
    reasons.push('large_group_requirement');
  }

  const difficulty = score <= 1
    ? 'beginner'
    : score <= 3
      ? 'intermediate'
      : score <= 5
        ? 'advanced'
        : 'expert';

  return { difficulty, score, reasons };
}

function territorialityProfile(record) {
  const temperament = record.behavior?.temperament;
  if (temperament === 'aggressive' || temperament === 'predatory') {
    return { territoriality: 'high', rule: 'aggressive' };
  }
  if (temperament === 'semi_aggressive') {
    return { territoriality: 'medium', rule: 'semi_aggressive' };
  }
  if ((record.social?.minGroup ?? 0) >= 2) {
    return { territoriality: 'none', rule: 'peaceful_group' };
  }
  return { territoriality: 'low', rule: 'peaceful_solitary' };
}

export function derivePrioritySocialCareProfile(record) {
  const priorityRank = PRIORITY_RANK_BY_ID.get(record.id);
  if (!priorityRank) return null;
  const difficulty = difficultyProfile(record);
  const territoriality = territorialityProfile(record);
  return {
    program: PRIORITY_SOCIAL_CARE_PROGRAM,
    version: PRIORITY_SOCIAL_CARE_VERSION,
    priorityRank,
    selectionMethod: 'legacy_catalog_priority_order',
    method: 'derived_from_legacy_constraints',
    fieldsCompleted: ['social.territoriality', 'care.difficulty'],
    difficulty: difficulty.difficulty,
    difficultyScore: difficulty.score,
    difficultyReasons: difficulty.reasons,
    difficultyReasonNotes: difficulty.reasons.map((reason) => DIFFICULTY_REASON_NOTES[reason]),
    territoriality: territoriality.territoriality,
    territorialityRule: territoriality.rule,
    externalReviewRequired: true,
  };
}

export function applyPrioritySocialCare(records) {
  return records.map((record) => {
    const profile = derivePrioritySocialCareProfile(record);
    if (!profile) return record;

    const note = 'Öncelik 100 sosyal yapı ve bakım zorluğu mevcut kayıt kısıtlarından türetildi; dış tür kaynağı doğrulaması bekliyor.';
    return {
      ...record,
      social: { ...record.social, territoriality: profile.territoriality },
      care: { ...record.care, difficulty: profile.difficulty },
      sourceIds: unique([...(record.sourceIds ?? []), PRIORITY_SOCIAL_CARE_SOURCE_ID]),
      fieldSourceIds: {
        ...record.fieldSourceIds,
        social: unique([...(record.fieldSourceIds?.social ?? []), PRIORITY_SOCIAL_CARE_SOURCE_ID]),
        care: unique([...(record.fieldSourceIds?.care ?? []), PRIORITY_SOCIAL_CARE_SOURCE_ID]),
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
          'social.territoriality',
          'care.difficulty',
        ]),
        unknownFields: (record.migration?.unknownFields ?? []).filter(
          (field) => field !== 'social.territoriality' && field !== 'care.difficulty',
        ),
      },
    };
  });
}
