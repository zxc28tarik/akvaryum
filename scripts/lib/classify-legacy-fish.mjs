const HEADING_PATTERN = /\/\/\s*[═ ]*(.*?)(?:\s*~\d+[^═]*)?\s*[═ ]*$/;
const RECORD_ID_PATTERN = /f\(\{id:'([^']+)'/;

export const FISH_CATEGORIES = [
  'tetra',
  'rasbora_danio',
  'barb',
  'cichlid',
  'catfish_loach',
  'livebearer',
  'anabantoid',
  'killifish_rainbowfish',
  'goldfish_coldwater',
  'freshwater_oddball',
  'freshwater_invertebrate',
  'clownfish',
  'surgeonfish',
  'marine_angelfish',
  'damselfish',
  'wrasse',
  'goby',
  'blenny',
  'basslet_dottyback',
  'cardinalfish',
  'dragonet',
  'anthias',
  'butterflyfish',
  'marine_predator',
  'hawkfish_grouper_rabbitfish',
  'marine_invertebrate',
  'seahorse_pipefish',
  'coral',
  'filefish_boxfish_eel',
];

const GROUP_CATEGORY_RULES = [
  [/TETRALAR/, 'tetra'],
  [/RASBORALAR/, 'rasbora_danio'],
  [/BARBLAR/, 'barb'],
  [/CIKLITLER/, 'cichlid'],
  [/KORİDORAS/, 'catfish_loach'],
  [/LIVEBEARERS/, 'livebearer'],
  [/ANABANTOIDS/, 'anabantoid'],
  [/KILLIFISH/, 'killifish_rainbowfish'],
  [/GOLDFISH/, 'goldfish_coldwater'],
  [/BICHIRS/, 'freshwater_oddball'],
  [/KARIDESLER/, 'freshwater_invertebrate'],
  [/CLOWNFISH/, 'clownfish'],
  [/TANG/, 'surgeonfish'],
  [/ANGELFISH/, 'marine_angelfish'],
  [/DAMSELS/, 'damselfish'],
  [/WRASSES/, 'wrasse'],
  [/GOBIES/, 'goby'],
  [/BLENNIES/, 'blenny'],
  [/BASSLETS/, 'basslet_dottyback'],
  [/CARDINALFISH/, 'cardinalfish'],
  [/DRAGONETS/, 'dragonet'],
  [/ANTHIAS/, 'anthias'],
  [/BUTTERFLYFISH/, 'butterflyfish'],
  [/TRIGGERS/, 'marine_predator'],
  [/HAWKFISH/, 'hawkfish_grouper_rabbitfish'],
  [/FOXFACE/, 'hawkfish_grouper_rabbitfish'],
  [/INVERTS/, 'marine_invertebrate'],
  [/SEAHORSES/, 'seahorse_pipefish'],
  [/CORALS/, 'coral'],
  [/MERCANLAR/, 'coral'],
  [/FILEFISH/, 'filefish_boxfish_eel'],
];

const ENTITY_TYPE_BY_GENUS = new Map();
function assignEntityType(type, genera) {
  for (const genus of genera) ENTITY_TYPE_BY_GENUS.set(genus, type);
}

assignEntityType('freshwater_shrimp', ['Atya', 'Atyopsis', 'Caridina', 'Neocaridina', 'Palaemonetes']);
assignEntityType('marine_shrimp', ['Alpheus', 'Hymenocera', 'Lysmata', 'Stenopus']);
assignEntityType('snail', ['Astraea', 'Cerithium', 'Clea', 'Melanoides', 'Nassarius', 'Neritina', 'Planorbarius', 'Pomacea', 'Trochus', 'Turbo', 'Tylomelania']);
assignEntityType('crab', ['Clibanarius', 'Limnopilos', 'Lybia', 'Mithraculus', 'Neopetrolisthes', 'Paguristes', 'Percnon', 'Ptychognathus', 'Stenorhynchus', 'Uca']);
assignEntityType('crayfish', ['Cambarellus', 'Procambarus']);
assignEntityType('bivalve', ['Lima', 'Tridacna']);
assignEntityType('echinoderm', ['Astropecten', 'Eucidaris', 'Holothuria', 'Linckia', 'Lytechinus', 'Mespilia', 'Ophiocoma', 'Ophiothrix', 'Protoreaster']);
assignEntityType('anemone', ['Cerianthus', 'Entacmaea', 'Heteractis', 'Stichodactyla']);
assignEntityType('other_invertebrate', ['Aplysia', 'Limulus', 'Sabellastarte']);
assignEntityType('soft_coral', ['Capnella', 'Cladiella', 'Clavularia', 'Discosoma', 'Pachyclavularia', 'Palythoa', 'Rhodactis', 'Ricordea', 'Sarcophyton', 'Sinularia', 'Tubipora', 'Xenia', 'Zoanthus']);
assignEntityType('lps_coral', ['Acanthastrea', 'Blastomussa', 'Catalaphyllia', 'Caulastrea', 'Duncanopsammia', 'Echinophyllia', 'Euphyllia', 'Favia', 'Fungia', 'Galaxea', 'Goniopora', 'Lobophyllia', 'Micromussa', 'Pectinia', 'Plerogyra', 'Scolymia', 'Trachyphyllia', 'Tubastraea']);
assignEntityType('sps_coral', ['Acropora', 'Cyphastrea', 'Echinopora', 'Leptoseris', 'Montipora', 'Pavona', 'Pocillopora', 'Porites', 'Psammocora', 'Seriatopora', 'Stylophora', 'Turbinaria']);

const FAMILY_BY_GENUS = new Map();
function assignFamily(family, genera) {
  for (const genus of genera) FAMILY_BY_GENUS.set(genus, family);
}

assignFamily('Characidae', ['Aphyocharax', 'Astyanax', 'Boehlkea', 'Exodon', 'Gymnocorymbus', 'Hasemania', 'Hemigrammus', 'Hyphessobrycon', 'Inpaichthys', 'Moenkhausia', 'Nematobrycon', 'Paracheirodon', 'Petitella', 'Pristella', 'Thayeria']);
assignFamily('Gasteropelecidae', ['Carnegiella', 'Gasteropelecus']);
assignFamily('Lebiasinidae', ['Copella', 'Nannostomus']);
assignFamily('Serrasalmidae', ['Metynnis', 'Myloplus', 'Piaractus', 'Pygocentrus']);
assignFamily('Alestidae', ['Phenacogrammus']);
assignFamily('Danionidae', ['Boraras', 'Brevibora', 'Danio', 'Devario', 'Rasbora', 'Tanichthys', 'Trigonostigma']);
assignFamily('Cyprinidae', ['Balantiocheilos', 'Barbodes', 'Barbonymus', 'Carassius', 'Crossocheilus', 'Cyprinus', 'Dawkinsia', 'Desmopuntius', 'Epalzeorhynchos', 'Haludaria', 'Oliotius', 'Pethia', 'Pimephales', 'Puntigrus', 'Puntius', 'Sahyadria']);
assignFamily('Cichlidae', ['Altolamprologus', 'Amatitlania', 'Amphilophus', 'Andinoacara', 'Apistogramma', 'Astronotus', 'Aulonocara', 'Chindongo', 'Cleithracara', 'Cyphotilapia', 'Geophagus', 'Herichthys', 'Heros', 'Herotilapia', 'Hybrid', 'Julidochromis', 'Labidochromis', 'Maylandia', 'Melanochromis', 'Mikrogeophagus', 'Neolamprologus', 'Parachromis', 'Pelvicachromis', 'Pseudotropheus', 'Pterophyllum', 'Rocio', 'Satanoperca', 'Symphysodon', 'Thorichthys', 'Trichromis', 'Tropheus', 'Uaru']);
assignFamily('Botiidae', ['Ambastaia', 'Botia', 'Chromobotia', 'Yasuhikotakia']);
assignFamily('Cobitidae', ['Misgurnus', 'Pangio']);
assignFamily('Gastromyzontidae', ['Sewellia']);
assignFamily('Loricariidae', ['Ancistrus', 'Chaetostoma', 'Hypancistrus', 'Otocinclus', 'Panaqolus', 'Panaque', 'Pterygoplichthys']);
assignFamily('Callichthyidae', ['Corydoras']);
assignFamily('Siluridae', ['Kryptopterus']);
assignFamily('Pimelodidae', ['Phractocephalus', 'Pimelodus']);
assignFamily('Mochokidae', ['Synodontis']);
assignFamily('Poeciliidae', ['Gambusia', 'Heterandria', 'Poecilia', 'Xiphophorus']);
assignFamily('Osphronemidae', ['Betta', 'Macropodus', 'Osphronemus', 'Parosphromenus', 'Sphaerichthys', 'Trichogaster', 'Trichopodus', 'Trichopsis']);
assignFamily('Helostomatidae', ['Helostoma']);
assignFamily('Nothobranchiidae', ['Aphyosemion', 'Epiplatys', 'Fundulopanchax']);
assignFamily('Melanotaeniidae', ['Glossolepis', 'Iriatherina', 'Melanotaenia']);
assignFamily('Pseudomugilidae', ['Pseudomugil']);
assignFamily('Telmatherinidae', ['Marosatherina']);
assignFamily('Adrianichthyidae', ['Oryzias']);
assignFamily('Apteronotidae', ['Apteronotus']);
assignFamily('Sternopygidae', ['Eigenmannia']);
assignFamily('Gymnotidae', ['Electrophorus']);
assignFamily('Tetraodontidae', ['Arothron', 'Canthigaster', 'Carinotetraodon', 'Colomesus', 'Tetraodon']);
assignFamily('Channidae', ['Channa']);
assignFamily('Notopteridae', ['Chitala']);
assignFamily('Datnioididae', ['Datnioides']);
assignFamily('Polypteridae', ['Erpetoichthys', 'Polypterus']);
assignFamily('Mormyridae', ['Gnathonemus']);
assignFamily('Mastacembelidae', ['Macrognathus', 'Mastacembelus']);
assignFamily('Osteoglossidae', ['Osteoglossum', 'Scleropages']);
assignFamily('Pantodontidae', ['Pantodon']);
assignFamily('Potamotrygonidae', ['Potamotrygon']);
assignFamily('Atyidae', ['Atya', 'Atyopsis', 'Caridina', 'Neocaridina']);
assignFamily('Palaemonidae', ['Hymenocera', 'Palaemonetes']);
assignFamily('Ampullariidae', ['Pomacea']);
assignFamily('Neritidae', ['Neritina']);
assignFamily('Planorbidae', ['Planorbarius']);
assignFamily('Thiaridae', ['Melanoides']);
assignFamily('Pachychilidae', ['Tylomelania']);
assignFamily('Nassariidae', ['Clea', 'Nassarius']);
assignFamily('Cambaridae', ['Cambarellus', 'Procambarus']);
assignFamily('Ocypodidae', ['Uca']);
assignFamily('Hymenosomatidae', ['Limnopilos']);
assignFamily('Varunidae', ['Ptychognathus']);

assignFamily('Pomacentridae', ['Abudefduf', 'Amphiprion', 'Chromis', 'Chrysiptera', 'Dascyllus', 'Premnas']);
assignFamily('Acanthuridae', ['Acanthurus', 'Ctenochaetus', 'Naso', 'Paracanthurus', 'Zebrasoma']);
assignFamily('Pomacanthidae', ['Apolemichthys', 'Centropyge', 'Holacanthus', 'Pomacanthus', 'Pygoplites']);
assignFamily('Labridae', ['Bodianus', 'Cirrhilabrus', 'Coris', 'Halichoeres', 'Labroides', 'Macropharyngodon', 'Paracheilinus', 'Pseudocheilinus', 'Thalassoma']);
assignFamily('Gobiidae', ['Cryptocentrus', 'Ctenogobiops', 'Elacatinus', 'Gobiodon', 'Koumansetta', 'Lythrypnus', 'Nemateleotris', 'Stonogobiops', 'Valenciennea']);
assignFamily('Pholidichthyidae', ['Pholidichthys']);
assignFamily('Blenniidae', ['Ecsenius', 'Meiacanthus', 'Ophioblennius', 'Salarias', 'Scartella']);
assignFamily('Grammatidae', ['Gramma']);
assignFamily('Pseudochromidae', ['Manonichthys', 'Pictichromis', 'Pseudochromis']);
assignFamily('Serranidae', ['Cephalopholis', 'Cromileptes', 'Liopropoma', 'Pseudanthias', 'Serranocirrhitus', 'Serranus']);
assignFamily('Apogonidae', ['Apogon', 'Pterapogon', 'Sphaeramia', 'Zoramia']);
assignFamily('Callionymidae', ['Synchiropus']);
assignFamily('Chaetodontidae', ['Chaetodon', 'Chelmon', 'Forcipiger', 'Hemitaurichthys', 'Heniochus']);
assignFamily('Balistidae', ['Balistoides', 'Melichthys', 'Odonus', 'Rhinecanthus', 'Xanthichthys']);
assignFamily('Diodontidae', ['Diodon']);
assignFamily('Muraenidae', ['Echidna', 'Gymnomuraena', 'Gymnothorax', 'Rhinomuraena']);
assignFamily('Scorpaenidae', ['Dendrochirus', 'Pterois']);
assignFamily('Cirrhitidae', ['Cirrhitichthys', 'Neocirrhites', 'Oxycirrhites', 'Paracirrhites']);
assignFamily('Siganidae', ['Siganus']);
assignFamily('Monacanthidae', ['Acreichthys', 'Oxymonacanthus']);
assignFamily('Ostraciidae', ['Lactoria', 'Ostracion']);
assignFamily('Syngnathidae', ['Doryrhamphus', 'Hippocampus']);
assignFamily('Opistognathidae', ['Opistognathus']);

assignFamily('Alpheidae', ['Alpheus']);
assignFamily('Lysmatidae', ['Lysmata']);
assignFamily('Stenopodidae', ['Stenopus']);
assignFamily('Turbinidae', ['Astraea', 'Turbo']);
assignFamily('Cerithiidae', ['Cerithium']);
assignFamily('Trochidae', ['Trochus']);
assignFamily('Diogenidae', ['Clibanarius', 'Paguristes']);
assignFamily('Mithracidae', ['Mithraculus']);
assignFamily('Percnidae', ['Percnon']);
assignFamily('Xanthidae', ['Lybia']);
assignFamily('Porcellanidae', ['Neopetrolisthes']);
assignFamily('Inachidae', ['Stenorhynchus']);
assignFamily('Limulidae', ['Limulus']);
assignFamily('Toxopneustidae', ['Lytechinus', 'Mespilia']);
assignFamily('Cidaridae', ['Eucidaris']);
assignFamily('Ophiotrichidae', ['Ophiothrix']);
assignFamily('Ophiocomidae', ['Ophiocoma']);
assignFamily('Astropectinidae', ['Astropecten']);
assignFamily('Ophidiasteridae', ['Linckia']);
assignFamily('Oreasteridae', ['Protoreaster']);
assignFamily('Holothuriidae', ['Holothuria']);
assignFamily('Sabellidae', ['Sabellastarte']);
assignFamily('Aplysiidae', ['Aplysia']);
assignFamily('Limidae', ['Lima']);
assignFamily('Cardiidae', ['Tridacna']);
assignFamily('Cerianthidae', ['Cerianthus']);
assignFamily('Actiniidae', ['Entacmaea']);
assignFamily('Stichodactylidae', ['Heteractis', 'Stichodactyla']);

assignFamily('Zoanthidae', ['Palythoa', 'Zoanthus']);
assignFamily('Discosomidae', ['Discosoma', 'Rhodactis']);
assignFamily('Ricordeidae', ['Ricordea']);
assignFamily('Alcyoniidae', ['Capnella', 'Cladiella', 'Sarcophyton', 'Sinularia']);
assignFamily('Xeniidae', ['Xenia']);
assignFamily('Briareidae', ['Pachyclavularia']);
assignFamily('Clavulariidae', ['Clavularia']);
assignFamily('Tubiporidae', ['Tubipora']);
assignFamily('Euphylliidae', ['Catalaphyllia', 'Euphyllia', 'Galaxea', 'Plerogyra']);
assignFamily('Dendrophylliidae', ['Duncanopsammia', 'Tubastraea', 'Turbinaria']);
assignFamily('Lobophylliidae', ['Acanthastrea', 'Blastomussa', 'Echinophyllia', 'Lobophyllia', 'Micromussa']);
assignFamily('Merulinidae', ['Caulastrea', 'Cyphastrea', 'Echinopora', 'Favia', 'Pectinia', 'Trachyphyllia']);
assignFamily('Acroporidae', ['Acropora', 'Montipora']);
assignFamily('Pocilloporidae', ['Pocillopora', 'Seriatopora', 'Stylophora']);
assignFamily('Fungiidae', ['Fungia']);
assignFamily('Poritidae', ['Goniopora', 'Porites']);
assignFamily('Agariciidae', ['Leptoseris', 'Pavona']);
assignFamily('Psammocoridae', ['Psammocora']);
assignFamily('Mussidae', ['Scolymia']);

function normalizeHeading(rawHeading) {
  return rawHeading.replace(/\s+/g, ' ').trim();
}

function categoryForHeading(heading) {
  const match = GROUP_CATEGORY_RULES.find(([pattern]) => pattern.test(heading));
  if (!match) throw new Error(`Sınıflandırılamayan kaynak grubu: ${heading}`);
  return match[1];
}

function sourceGroupsById(source) {
  const groups = new Map();
  let currentHeading = null;

  for (const line of source.split(/\r?\n/)) {
    if (line.includes('═') && line.includes('//')) {
      const headingMatch = line.match(HEADING_PATTERN);
      if (headingMatch) currentHeading = normalizeHeading(headingMatch[1]);
    }

    const recordMatch = line.match(RECORD_ID_PATTERN);
    if (recordMatch) {
      if (!currentHeading) throw new Error(`${recordMatch[1]} için kaynak grubu bulunamadı.`);
      groups.set(recordMatch[1], currentHeading);
    }
  }

  return groups;
}

function scientificGenus(scientificName) {
  const genus = scientificName.trim().split(/\s+/)[0];
  return genus === 'Hybrid' ? null : genus;
}

function entityTypeFor(record, genus, category) {
  const mapped = genus ? ENTITY_TYPE_BY_GENUS.get(genus) : null;
  if (mapped) return mapped;
  if (category === 'coral') throw new Error(`${record.id}: mercan entityType eşlemesi bulunamadı (${genus}).`);
  if (category.endsWith('invertebrate')) {
    throw new Error(`${record.id}: omurgasız entityType eşlemesi bulunamadı (${genus}).`);
  }
  return record.water === 'fresh' ? 'freshwater_fish' : 'marine_fish';
}

export function buildLegacyFishClassification(source, records) {
  const groups = sourceGroupsById(source);
  const metadata = {};

  for (const record of records) {
    const sourceGroup = groups.get(record.id);
    if (!sourceGroup) throw new Error(`${record.id}: kaynak dosyada grup eşleşmesi bulunamadı.`);

    const category = categoryForHeading(sourceGroup);
    const genus = scientificGenus(record.sci);
    const family = FAMILY_BY_GENUS.get(genus ?? 'Hybrid') ?? null;

    metadata[record.id] = {
      entityType: entityTypeFor(record, genus, category),
      category,
      taxonomy: {
        genus,
        family,
        reviewStatus: family && genus ? 'inferred' : 'needs_review',
      },
    };
  }

  return metadata;
}

export function enrichLegacyFish(records, source) {
  const metadata = buildLegacyFishClassification(source, records);
  return records.map((record) => ({ ...record, ...metadata[record.id] }));
}
