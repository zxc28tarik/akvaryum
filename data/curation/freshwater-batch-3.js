// AKV-DATA-020 — tatlı su veri partisi 3 (16 incelenmiş + 114 toplu taslak)
;(() => {
  'use strict';

  const SOURCE_FISHBASE = 'fishbase-freshwater-batch-3-2026';
  const SOURCE_CARE = 'seriouslyfish-freshwater-batch-3-2026';
  const SOURCE_EDITORIAL = 'freshwater-batch-3-editorial-v1';
  const SOURCE_BULK_DRAFT = 'freshwater-bulk-draft-2026-v1';
  const SOURCE_MIGRATION = 'legacy-inhabitant-migration-v1';
  const reviewedSpecs = window.AKV_FRESHWATER_BATCH_3_SPECS || [];

  const PROFILES = {
    tetra: { temp:[22,27], ph:[5.5,7.5], gh:[2,15], size:5, tank:80, length:75, per:5, school:8, mode:'school', aggression:'peaceful', conspecific:'low', territoriality:'none', activity:'active', zone:['mid','open_water'], diet:'omni', feeding:'medium', flow:'low', oxygen:'normal', substrate:['fine_sand'], shelter:['dense_plants'], difficulty:'intermediate', plant:true, colors:['#b9c7c5','#c96554'], silhouette:'long' },
    rasbora_danio: { temp:[21,27], ph:[6.0,7.5], gh:[3,15], size:5, tank:80, length:75, per:5, school:8, mode:'school', aggression:'peaceful', conspecific:'low', territoriality:'none', activity:'active', zone:['mid','open_water'], diet:'omni', feeding:'easy', flow:'medium', oxygen:'normal', substrate:['fine_sand'], shelter:['dense_plants'], difficulty:'intermediate', plant:true, colors:['#b8c8a4','#d59b55'], silhouette:'long' },
    barb: { temp:[21,27], ph:[6.0,7.5], gh:[4,18], size:7, tank:100, length:90, per:8, school:8, mode:'school', aggression:'peaceful', conspecific:'low', territoriality:'none', activity:'active', zone:['mid','open_water'], diet:'omni', feeding:'easy', flow:'medium', oxygen:'normal', substrate:['fine_sand','rounded_gravel'], shelter:['dense_plants'], difficulty:'intermediate', plant:true, colors:['#c49b58','#404744'], silhouette:'classic' },
    killifish_rainbowfish: { temp:[22,27], ph:[6.0,7.8], gh:[3,18], size:6, tank:90, length:75, per:6, school:8, mode:'school', aggression:'peaceful', conspecific:'low', territoriality:'none', activity:'active', zone:['surface','mid'], diet:'omni', feeding:'medium', flow:'low', oxygen:'normal', substrate:['fine_sand'], shelter:['floating_plants','dense_plants'], difficulty:'intermediate', plant:true, colors:['#5aa7bb','#d1a64d'], silhouette:'long' },
    livebearer: { temp:[22,27], ph:[7.0,8.2], gh:[10,25], size:7, tank:90, length:75, per:8, school:6, mode:'group', aggression:'peaceful', conspecific:'low', territoriality:'none', activity:'active', zone:['surface','mid'], diet:'omni', feeding:'easy', flow:'low', oxygen:'normal', substrate:['fine_sand','rounded_gravel'], shelter:['dense_plants'], difficulty:'intermediate', plant:true, colors:['#7c9fc0','#d28c55'], silhouette:'long' },
    catfish_loach: { temp:[22,27], ph:[6.0,7.8], gh:[3,18], size:10, tank:150, length:100, per:15, school:4, mode:'group', aggression:'peaceful', conspecific:'low', territoriality:'low', activity:'moderate', zone:['bottom','rockwork'], diet:'omni', feeding:'medium', flow:'medium', oxygen:'high', substrate:['fine_sand','rounded_gravel'], shelter:['wood','rockwork'], difficulty:'advanced', plant:true, colors:['#756b58','#343a39'], silhouette:'classic' },
    freshwater_oddball: { temp:[22,27], ph:[6.5,7.8], gh:[4,18], size:7, tank:100, length:90, per:10, school:4, mode:'group', aggression:'peaceful', conspecific:'medium', territoriality:'low', activity:'active', zone:['bottom','rockwork'], diet:'herbi', feeding:'hard', flow:'high', oxygen:'high', substrate:['rounded_gravel','rock'], shelter:['rockwork'], difficulty:'advanced', plant:true, colors:['#4d8fa3','#c76e4c'], silhouette:'long' },
    gourami: { temp:[24,28], ph:[4.5,7.0], gh:[1,10], size:6, tank:80, length:75, per:8, school:2, mode:'pair', aggression:'peaceful', conspecific:'medium', territoriality:'low', activity:'moderate', zone:['surface','mid'], diet:'omni', feeding:'hard', flow:'low', oxygen:'normal', substrate:['fine_sand'], shelter:['floating_plants','dense_plants','leaf_litter'], difficulty:'advanced', plant:true, colors:['#7c654f','#5aa0a3'], silhouette:'classic' },
    betta: { temp:[24,28], ph:[5.0,7.0], gh:[1,12], size:6, tank:60, length:60, per:8, school:1, mode:'solitary', aggression:'semi', conspecific:'high', territoriality:'high', activity:'moderate', zone:['surface','mid'], diet:'carni', feeding:'medium', flow:'low', oxygen:'normal', substrate:['fine_sand'], shelter:['floating_plants','dense_plants','leaf_litter'], difficulty:'advanced', plant:true, colors:['#a04e4e','#477d89'], silhouette:'classic' },
    cichlid: { temp:[24,28], ph:[5.0,7.5], gh:[1,15], size:9, tank:120, length:90, per:15, school:2, mode:'pair', aggression:'semi', conspecific:'high', territoriality:'high', activity:'moderate', zone:['mid','bottom'], diet:'omni', feeding:'medium', flow:'low', oxygen:'normal', substrate:['fine_sand'], shelter:['wood','rockwork','dense_plants'], difficulty:'advanced', plant:true, colors:['#b28855','#3f6974'], silhouette:'classic' }
  };

  const BULK_DRAFT_ROWS = `blue-ribbon-tetra|Blue Ribbon Tetra|Hyphessobrycon auca|Characidae|tetra
kitty-tetra|Kitty Tetra|Hyphessobrycon heliacus|Characidae|tetra
red-devil-tetra|Red Devil Tetra|Hyphessobrycon wadai|Characidae|tetra
cyan-stripe-tetra|Cyan Stripe Tetra|Hyphessobrycon cyanotaenia|Characidae|tetra
elachys-tetra|Elachys Tetra|Hyphessobrycon elachys|Characidae|tetra
coffee-bean-tetra|Coffee Bean Tetra|Hyphessobrycon takasei|Characidae|tetra
procyon-tetra|Procyon Tetra|Hyphessobrycon procyon|Characidae|tetra
epicharis-tetra|Epicharis Tetra|Hyphessobrycon epicharis|Characidae|tetra
rose-tetra|Rose Tetra|Hyphessobrycon roseus|Characidae|tetra
costae-tetra|Costae Tetra|Moenkhausia costae|Characidae|tetra
agnes-tetra|Agnes Tetra|Moenkhausia agnesae|Characidae|tetra
collett-tetra|Collett Tetra|Moenkhausia collettii|Characidae|tetra
tail-light-tetra|Tail-light Tetra|Moenkhausia dichroura|Characidae|tetra
rummy-nose-tetra|Rummy-nose Tetra|Petitella bleheri|Characidae|tetra
blackline-tetra|Blackline Tetra|Hyphessobrycon scholzei|Characidae|tetra
glass-bloodfin|Glass Bloodfin|Prionobrama filigera|Characidae|tetra
silver-tetra|Silver Tetra|Ctenobrycon spilurus|Characidae|tetra
african-red-eye-tetra|African Red-eye Tetra|Arnoldichthys spilopterus|Alestidae|tetra
redline-rasbora|Redline Rasbora|Rasbora pauciperforata|Danionidae|rasbora_danio
brilliant-rasbora|Brilliant Rasbora|Rasbora einthovenii|Danionidae|rasbora_danio
blackline-rasbora|Blackline Rasbora|Rasbora borapetensis|Danionidae|rasbora_danio
kalbar-rasbora|Kalbar Rasbora|Rasbora kalbarensis|Danionidae|rasbora_danio
browny-devario|Browny Devario|Devario browni|Danionidae|rasbora_danio
gold-ring-danio|Gold-ring Danio|Devario auropurpureus|Danionidae|rasbora_danio
fireline-devario|Fireline Devario|Devario maetaengensis|Danionidae|rasbora_danio
panther-danio|Panther Danio|Danio aesculapii|Danionidae|rasbora_danio
glowlight-danio|Glowlight Danio|Danio choprae|Danionidae|rasbora_danio
orange-finned-danio|Orange-finned Danio|Danio kyathit|Danionidae|rasbora_danio
phutunio-barb|Phutunio Barb|Pethia phutunio|Cyprinidae|barb
setnai-barb|Setnai Barb|Pethia setnai|Cyprinidae|barb
mascara-barb|Mascara Barb|Dawkinsia assimilis|Cyprinidae|barb
rohan-s-barb|Rohan's Barb|Dawkinsia rohani|Cyprinidae|barb
tambraparni-barb|Tambraparni Barb|Dawkinsia tambraparniei|Cyprinidae|barb
six-banded-barb|Six-banded Barb|Desmopuntius hexazona|Cyprinidae|barb
three-banded-barb|Three-banded Barb|Desmopuntius trifasciatus|Cyprinidae|barb
cosuatis-barb|Cosuatis Barb|Oreichthys cosuatis|Cyprinidae|barb
dwarf-oreichthys|Dwarf Oreichthys|Oreichthys parvus|Cyprinidae|barb
african-dwarf-barb|African Dwarf Barb|Enteromius jae|Cyprinidae|barb
spotted-blue-eye|Spotted Blue-eye|Pseudomugil gertrudae|Pseudomugilidae|killifish_rainbowfish
paska-s-blue-eye|Paska's Blue-eye|Pseudomugil paskai|Pseudomugilidae|killifish_rainbowfish
neon-blue-eye|Neon Blue-eye|Pseudomugil cyanodorsalis|Pseudomugilidae|killifish_rainbowfish
ivantsoff-s-blue-eye|Ivantsoff's Blue-eye|Pseudomugil ivantsoffi|Pseudomugilidae|killifish_rainbowfish
delicate-blue-eye|Delicate Blue-eye|Pseudomugil tenellus|Pseudomugilidae|killifish_rainbowfish
connie-s-blue-eye|Connie's Blue-eye|Pseudomugil connieae|Pseudomugilidae|killifish_rainbowfish
new-guinea-blue-eye|New Guinea Blue-eye|Pseudomugil novaeguineae|Pseudomugilidae|killifish_rainbowfish
inconspicuous-blue-eye|Inconspicuous Blue-eye|Pseudomugil inconspicuus|Pseudomugilidae|killifish_rainbowfish
lake-wanam-rainbowfish|Lake Wanam Rainbowfish|Glossolepis wanamensis|Melanotaeniidae|killifish_rainbowfish
kamaka-rainbowfish|Kamaka Rainbowfish|Melanotaenia kamaka|Melanotaeniidae|killifish_rainbowfish
parva-rainbowfish|Parva Rainbowfish|Melanotaenia parva|Melanotaeniidae|killifish_rainbowfish
macculloch-s-rainbowfish|Macculloch's Rainbowfish|Melanotaenia maccullochi|Melanotaeniidae|killifish_rainbowfish
goldie-river-rainbowfish|Goldie River Rainbowfish|Melanotaenia goldiei|Melanotaeniidae|killifish_rainbowfish
celebes-ricefish|Celebes Ricefish|Oryzias celebensis|Adrianichthyidae|killifish_rainbowfish
javanese-ricefish|Javanese Ricefish|Oryzias javanicus|Adrianichthyidae|killifish_rainbowfish
sarasins-ricefish|Sarasins Ricefish|Oryzias sarasinorum|Adrianichthyidae|killifish_rainbowfish
malili-ricefish|Malili Ricefish|Oryzias profundicola|Adrianichthyidae|killifish_rainbowfish
black-ricefish|Black Ricefish|Oryzias nigrimas|Adrianichthyidae|killifish_rainbowfish
chiapas-swordtail|Chiapas Swordtail|Xiphophorus alvarezi|Poeciliidae|livebearer
anders-swordtail|Anders' Swordtail|Xiphophorus andersi|Poeciliidae|livebearer
northern-mountain-swordtail|Northern Mountain Swordtail|Xiphophorus nezahualcoyotl|Poeciliidae|livebearer
highland-swordtail|Highland Swordtail|Xiphophorus multilineatus|Poeciliidae|livebearer
yellow-swordtail|Yellow Swordtail|Xiphophorus clemenciae|Poeciliidae|livebearer
liberty-molly|Liberty Molly|Poecilia salvatoris|Poeciliidae|livebearer
swamp-guppy|Swamp Guppy|Micropoecilia picta|Poeciliidae|livebearer
parae-livebearer|Parae Livebearer|Poecilia parae|Poeciliidae|livebearer
humpbacked-limia|Humpbacked Limia|Limia nigrofasciata|Poeciliidae|livebearer
blackbelly-limia|Blackbelly Limia|Limia melanogaster|Poeciliidae|livebearer
pygmy-aspidoras|Pygmy Aspidoras|Aspidoras pauciradiatus|Callichthyidae|catfish_loach
spotted-aspidoras|Spotted Aspidoras|Aspidoras spilotus|Callichthyidae|catfish_loach
taurus-aspidoras|Taurus Aspidoras|Aspidoras taurus|Callichthyidae|catfish_loach
macrospilus-otocinclus|Macrospilus Otocinclus|Otocinclus macrospilus|Loricariidae|catfish_loach
huaorani-otocinclus|Huaorani Otocinclus|Otocinclus huaorani|Loricariidae|catfish_loach
vestitus-otocinclus|Vestitus Otocinclus|Otocinclus vestitus|Loricariidae|catfish_loach
giant-oto|Giant Oto|Parotocinclus jumbo|Loricariidae|catfish_loach
redfin-oto|Redfin Oto|Parotocinclus maculicauda|Loricariidae|catfish_loach
harold-s-oto|Harold's Oto|Parotocinclus haroldoi|Loricariidae|catfish_loach
fallax-whiptail|Fallax Whiptail|Rineloricaria fallax|Loricariidae|catfish_loach
eigenmann-s-whiptail|Eigenmann's Whiptail|Rineloricaria eigenmanni|Loricariidae|catfish_loach
dwarf-whiptail|Dwarf Whiptail|Rineloricaria parva|Loricariidae|catfish_loach
gold-royal-farlowella|Gold Royal Farlowella|Sturisoma aureum|Loricariidae|catfish_loach
royal-whiptail|Royal Whiptail|Sturisoma festivum|Loricariidae|catfish_loach
panama-sturisoma|Panama Sturisoma|Sturisoma panamense|Loricariidae|catfish_loach
snowball-pleco|Snowball Pleco|Hypancistrus inspector|Loricariidae|catfish_loach
debilittera-pleco|Debilittera Pleco|Hypancistrus debilittera|Loricariidae|catfish_loach
queen-arabesque-pleco|Queen Arabesque Pleco|Hypancistrus furunculus|Loricariidae|catfish_loach
leopard-frog-pleco|Leopard Frog Pleco|Peckoltia compta|Loricariidae|catfish_loach
sabaji-pleco|Sabaji Pleco|Peckoltia sabaji|Loricariidae|catfish_loach
rainbow-stiphodon|Rainbow Stiphodon|Stiphodon percnopterygionus|Gobiidae|freshwater_oddball
elegant-stiphodon|Elegant Stiphodon|Stiphodon elegans|Gobiidae|freshwater_oddball
annie-s-stiphodon|Annie's Stiphodon|Stiphodon annieae|Gobiidae|freshwater_oddball
golden-neon-goby|Golden Neon Goby|Stiphodon rutilaureus|Gobiidae|freshwater_oddball
redlip-goby|Redlip Goby|Sicyopus zosterophorum|Oxudercidae|freshwater_oddball
ruby-goby|Ruby Goby|Sicyopus rubicundus|Oxudercidae|freshwater_oddball
hawaiian-goby|Hawaiian Goby|Lentipes concolor|Oxudercidae|freshwater_oddball
red-spotted-rhinogobius|Red-spotted Rhinogobius|Rhinogobius rubromaculatus|Oxudercidae|freshwater_oddball
eyespot-licorice-gourami|Eyespot Licorice Gourami|Parosphromenus linkei|Osphronemidae|gourami
nagy-s-licorice-gourami|Nagy's Licorice Gourami|Parosphromenus nagyi|Osphronemidae|gourami
tweedie-s-licorice-gourami|Tweedie's Licorice Gourami|Parosphromenus tweediei|Osphronemidae|gourami
ornate-licorice-gourami|Ornate Licorice Gourami|Parosphromenus ornaticauda|Osphronemidae|gourami
dwarf-chocolate-gourami|Dwarf Chocolate Gourami|Parasphaerichthys ocellatus|Osphronemidae|gourami
scarlet-betta|Scarlet Betta|Betta coccina|Osphronemidae|betta
persephone-betta|Persephone Betta|Betta persephone|Osphronemidae|betta
brown-s-betta|Brown's Betta|Betta brownorum|Osphronemidae|betta
api-api-betta|Api Api Betta|Betta api api|Osphronemidae|betta
burdigala-betta|Burdigala Betta|Betta burdigala|Osphronemidae|betta
inka-apistogramma|Inka Apistogramma|Apistogramma baenschi|Cichlidae|cichlid
banded-apistogramma|Banded Apistogramma|Apistogramma bitaeniata|Cichlidae|cichlid
hongslo-s-apistogramma|Hongslo's Apistogramma|Apistogramma hongsloi|Cichlidae|cichlid
nijssen-s-apistogramma|Nijssen's Apistogramma|Apistogramma nijsseni|Cichlidae|cichlid
panduro-apistogramma|Panduro Apistogramma|Apistogramma panduro|Cichlidae|cichlid
three-striped-apistogramma|Three-striped Apistogramma|Apistogramma trifasciata|Cichlidae|cichlid
elizabeth-s-apistogramma|Elizabeth's Apistogramma|Apistogramma elizabethae|Cichlidae|cichlid
inirida-apistogramma|Inirida Apistogramma|Apistogramma iniridae|Cichlidae|cichlid
norbert-s-apistogramma|Norbert's Apistogramma|Apistogramma norberti|Cichlidae|cichlid
spade-tail-checkerboard-cichlid|Spade-tail Checkerboard Cichlid|Dicrossus maculatus|Cichlidae|cichlid`;

  const draftSpecs = BULK_DRAFT_ROWS.trim().split('\n').map((line) => {
    const [id, en, sci, family, cat] = line.split('|');
    return {
      id, tr: en, en, sci, family, cat, aliases: [], draft: true,
      ...PROFILES[cat],
      notes_tr: 'TOPLU TASLAK — bilimsel ad ve bakım değerleri tür bazında dış doğrulama bekliyor; kesin bakım kararı için kullanılmamalıdır.',
      notes_en: 'BULK DRAFT — the scientific name and care values await species-level external review and must not be used as final care advice.'
    };
  });

  const specs = [...reviewedSpecs, ...draftSpecs];
  if (reviewedSpecs.length !== 16 || draftSpecs.length !== 114 || specs.length !== 130) {
    throw new Error(`AKV-DATA-020 parti 3: 16 incelenmiş + 114 taslak = 130 kayıt bekleniyordu; ${reviewedSpecs.length} + ${draftSpecs.length} bulundu.`);
  }

  const zoneLegacy = (zones) => zones.includes('surface') ? 'top' : (zones.includes('bottom') || zones.includes('sand') ? 'bottom' : 'mid');
  const unique = (values) => [...new Set(values.filter(Boolean))];

  function makeLegacy(spec) {
    return {
      id: spec.id, nameTr: spec.tr, nameEn: spec.en, sci: spec.sci, water: 'fresh',
      minVolume: spec.tank, perFishL: spec.per, pH: [...spec.ph], temp: [...spec.temp], gh: [...spec.gh],
      aggression: spec.aggression, schooling: spec.school, diet: spec.diet, adultSize: spec.size,
      layer: zoneLegacy(spec.zone), plantSafe: spec.plant, reefSafe: false,
      finNippers: Boolean(spec.fin), longFinned: false, silhouette: spec.silhouette, color: [...spec.colors],
      notes: spec.notes_tr, notesEn: spec.notes_en, entityType: 'freshwater_fish', category: spec.cat,
      taxonomy: { genus: spec.sci.split(' ')[0], family: spec.family, reviewStatus: spec.draft ? 'needs_review' : 'reviewed' },
    };
  }

  function makeCanonical(spec) {
    const isDraft = Boolean(spec.draft);
    const sourceIds = isDraft
      ? [SOURCE_BULK_DRAFT, SOURCE_MIGRATION]
      : [SOURCE_FISHBASE, SOURCE_CARE, SOURCE_EDITORIAL, SOURCE_MIGRATION];
    const fieldSourceIds = isDraft ? {
      name: [SOURCE_BULK_DRAFT], scientificName: [SOURCE_BULK_DRAFT],
      'taxonomy.genus': [SOURCE_BULK_DRAFT], 'taxonomy.family': [SOURCE_BULK_DRAFT],
      water: [SOURCE_BULK_DRAFT], size: [SOURCE_BULK_DRAFT], tank: [SOURCE_BULK_DRAFT],
      social: [SOURCE_BULK_DRAFT], behavior: [SOURCE_BULK_DRAFT], feeding: [SOURCE_BULK_DRAFT],
      compatibility: [SOURCE_BULK_DRAFT], habitat: [SOURCE_BULK_DRAFT], care: [SOURCE_BULK_DRAFT],
      summary: [SOURCE_BULK_DRAFT], appearance: [SOURCE_BULK_DRAFT], notes: [SOURCE_BULK_DRAFT],
      migration: [SOURCE_MIGRATION],
    } : {
      name: [SOURCE_FISHBASE, SOURCE_EDITORIAL], scientificName: [SOURCE_FISHBASE],
      'taxonomy.genus': [SOURCE_FISHBASE], 'taxonomy.family': [SOURCE_FISHBASE],
      water: [SOURCE_FISHBASE, SOURCE_CARE], size: [SOURCE_FISHBASE], tank: [SOURCE_CARE], social: [SOURCE_CARE],
      behavior: [SOURCE_CARE], feeding: [SOURCE_CARE], compatibility: [SOURCE_CARE],
      habitat: [SOURCE_FISHBASE, SOURCE_CARE], care: [SOURCE_CARE], summary: [SOURCE_CARE, SOURCE_EDITORIAL],
      appearance: [SOURCE_EDITORIAL], notes: [SOURCE_CARE, SOURCE_EDITORIAL], migration: [SOURCE_MIGRATION],
    };
    const social = { mode: spec.mode, conspecificAggression: spec.conspecific, territoriality: spec.territoriality };
    if (spec.school > 1) {
      social.minGroup = spec.school;
      social.recommendedGroup = spec.school;
    }
    if (spec.sex) social.sexRatio = { minMales: spec.sex[0], minFemales: spec.sex[1], maxMales: spec.sex[0] };
    return {
      id: spec.id, status: isDraft ? 'draft' : 'reviewed',
      name: { tr: spec.tr, en: spec.en }, scientificName: spec.sci, aliases: [...spec.aliases],
      entityType: 'freshwater_fish', category: spec.cat,
      taxonomy: { genus: spec.sci.split(' ')[0], family: spec.family, reviewStatus: isDraft ? 'needs_review' : 'reviewed' },
      tags: unique(['fresh', 'freshwater_fish', spec.cat, spec.mode, isDraft ? 'bulk_draft' : 'reviewed']),
      summary: { tr: spec.notes_tr, en: spec.notes_en },
      water: { types: ['fresh'], temperatureC: [...spec.temp], pH: [...spec.ph], gh: [...spec.gh] },
      size: { adultCm: [spec.size, spec.size] },
      tank: { minVolumeL: spec.tank, additionalVolumePerInhabitantL: spec.per, minLengthCm: spec.length },
      social,
      behavior: {
        temperament: spec.aggression === 'aggressive' ? 'aggressive' : (spec.aggression === 'semi' ? 'semi_aggressive' : 'peaceful'),
        activity: spec.activity, zone: [...spec.zone], finNipper: Boolean(spec.fin), longFinned: false,
      },
      feeding: { diet: [spec.diet === 'carni' ? 'carnivore' : (spec.diet === 'herbi' ? 'herbivore' : 'omnivore')], feedingDifficulty: spec.feeding },
      compatibility: { plantSafe: spec.plant, coralSafe: 'not_applicable' },
      habitat: { flow: spec.flow, oxygen: spec.oxygen, substrate: [...spec.substrate], shelter: [...spec.shelter] },
      care: {
        difficulty: spec.difficulty,
        sensitiveTo: unique([spec.oxygen === 'high' ? 'low_oxygen' : null, spec.flow === 'high' ? 'stagnant_water' : null, spec.feeding === 'hard' ? 'inappropriate_food_size' : null]),
        specialWarnings: [{ tr: spec.notes_tr, en: spec.notes_en }],
      },
      appearance: { silhouette: spec.silhouette, colors: [...spec.colors] },
      notes: { tr: spec.notes_tr, en: spec.notes_en }, sourceIds, fieldSourceIds,
      verification: isDraft ? {
        status: 'needs_review', confidence: 'low',
        notes: ['Toplu katalog taslağıdır. Bilimsel ad, aile ve bütün bakım alanları tür bazında dış kaynak kontrolü bekler.'],
      } : {
        status: 'reviewed', confidence: 'medium',
        notes: [
          'Kabul edilen bilimsel adlar, taksonomi ve bildirilen yetişkin boyları FishBase kayıtlarıyla incelendi.',
          'Tank, sosyal düzen ve bakım değerleri güvenli ürün kullanımı için ihtiyatlı alt sınırlardır; kesin tür ölçümü olarak sunulmaz.',
        ],
      },
      dataVersion: 1,
      migration: {
        sourceModel: 'legacyFishV1', targetModel: 'inhabitantV1', schemaVersion: 1,
        directFields: ['id','name','scientificName','water','size','tank','social','behavior','feeding','compatibility','habitat','care','appearance','notes'],
        derivedFields: ['status','category','taxonomy','tags','summary','verification'],
        unknownFields: ['compatibility.shrimpSafe','compatibility.snailSafe'],
      },
    };
  }

  const legacy = specs.map(makeLegacy);
  const canonical = specs.map(makeCanonical);
  const existing = window.DB_FRESH || [];
  const existingIds = new Set(existing.map((record) => record.id));
  window.DB_FRESH = [...existing, ...legacy.filter((record) => !existingIds.has(record.id))];
  window.AKV_FRESHWATER_BATCH_3 = {
    version: 2, taskId: 'AKV-DATA-020', reviewedAt: '2026-07-24',
    legacy, canonical,
    reviewed: canonical.filter((record) => record.status === 'reviewed'),
    drafts: canonical.filter((record) => record.status === 'draft'),
  };
})();
