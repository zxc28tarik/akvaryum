// AKVARYUM — Plant/Substrate/Tank presets + SVG helpers + assembled fish DB
// (Fish data lives in fish-fresh.js and fish-salt.js — loaded BEFORE this file)

window.DB = {};

// ─── Fish silhouette SVG (rich: gradients, fins, eye highlight) ───
let __svgUid = 0;
function fishSVG(shape, color1, color2) {
  const uid = 'fg' + (++__svgUid);
  const defs = `<defs><linearGradient id="${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color1}"/><stop offset="0.55" stop-color="${color1}"/><stop offset="1" stop-color="${color2}" stop-opacity="0.85"/></linearGradient></defs>`;
  const eye = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#0a1f2e"/><circle cx="${cx + r*0.35}" cy="${cy - r*0.35}" r="${r*0.38}" fill="#fff" opacity="0.9"/>`;
  const shapes = {
    classic: `<svg viewBox="0 0 100 60">${defs}
      <path d="M88,30 L99,16 Q96,30 99,44 Z" fill="${color1}" opacity="0.9"/>
      <path d="M45,10 Q56,-2 66,8 Q57,10 52,16 Z" fill="${color1}" opacity="0.75"/>
      <path d="M48,50 Q56,60 64,52 Q56,50 52,45 Z" fill="${color1}" opacity="0.75"/>
      <path d="M10,30 Q25,8 55,8 Q80,8 90,30 Q80,52 55,52 Q25,52 10,30 Z" fill="url(#${uid})"/>
      <path d="M40,20 L70,20 M40,30 L72,30 M40,40 L70,40" stroke="${color2}" stroke-width="2.2" opacity="0.55" stroke-linecap="round"/>
      <path d="M78,20 Q84,30 78,40" stroke="${color2}" stroke-width="1.6" fill="none" opacity="0.5"/>
      <path d="M52,30 Q60,24 66,32 Q60,38 52,30 Z" fill="${color2}" opacity="0.35"/>
      ${eye(72, 25, 3)}</svg>`,
    long: `<svg viewBox="0 0 100 60">${defs}
      <path d="M90,30 L100,20 Q97,30 100,40 Z" fill="${color1}" opacity="0.9"/>
      <path d="M40,13 Q50,4 60,11 Q51,13 46,17 Z" fill="${color1}" opacity="0.75"/>
      <path d="M42,47 Q50,56 58,49 Q51,47 47,44 Z" fill="${color1}" opacity="0.75"/>
      <path d="M5,30 Q15,12 50,12 Q85,12 92,30 Q85,48 50,48 Q15,48 5,30 Z" fill="url(#${uid})"/>
      <path d="M25,22 Q50,17 75,23 M25,38 Q50,43 75,37" stroke="${color2}" stroke-width="2" fill="none" opacity="0.5"/>
      <path d="M82,23 Q87,30 82,37" stroke="${color2}" stroke-width="1.5" fill="none" opacity="0.5"/>
      ${eye(80, 26, 2.6)}</svg>`,
    round: `<svg viewBox="0 0 100 60">${defs}
      <path d="M84,30 L98,16 Q95,30 98,44 Z" fill="${color1}" opacity="0.9"/>
      <path d="M42,10 Q50,0 60,7 Q51,9 47,14 Z" fill="${color1}" opacity="0.75"/>
      <path d="M42,50 Q50,60 60,53 Q51,51 47,46 Z" fill="${color1}" opacity="0.75"/>
      <ellipse cx="48" cy="30" rx="38" ry="22" fill="url(#${uid})"/>
      <path d="M28,14 Q46,30 28,46 M40,11 Q58,30 40,49" stroke="${color2}" stroke-width="2.2" fill="none" opacity="0.5"/>
      <path d="M72,22 Q77,30 72,38" stroke="${color2}" stroke-width="1.5" fill="none" opacity="0.5"/>
      ${eye(70, 25, 3)}</svg>`,
    tall: `<svg viewBox="0 0 100 60">${defs}
      <path d="M86,30 L98,20 Q95,30 98,40 Z" fill="${color1}" opacity="0.9"/>
      <path d="M48,9 Q58,-4 70,6 Q58,8 53,14 Z" fill="${color1}" opacity="0.75"/>
      <path d="M48,51 Q58,64 70,54 Q58,52 53,46 Z" fill="${color1}" opacity="0.75"/>
      <path d="M15,30 Q30,5 55,8 Q80,12 88,30 Q80,48 55,52 Q30,55 15,30 Z" fill="url(#${uid})"/>
      <path d="M36,13 Q36,30 36,47 M50,10 Q50,30 50,50" stroke="${color2}" stroke-width="2.4" fill="none" opacity="0.5"/>
      <path d="M74,22 Q79,29 74,36" stroke="${color2}" stroke-width="1.5" fill="none" opacity="0.5"/>
      ${eye(70, 22, 3)}</svg>`,
    eel: `<svg viewBox="0 0 100 60">${defs}
      <path d="M5,30 Q25,13 50,29 Q75,46 95,29 L92,35 Q75,50 50,35 Q25,19 8,36 Z" fill="url(#${uid})"/>
      <path d="M12,28 Q30,17 48,29 M52,32 Q70,44 88,32" stroke="${color2}" stroke-width="1.6" fill="none" opacity="0.5"/>
      ${eye(90, 29, 2)}</svg>`,
  };
  return shapes[shape] || shapes.classic;
}

function plantSVG(kind, color) {
  const uid = 'pg' + (++__svgUid);
  const defs = `<defs><linearGradient id="${uid}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${color}" stop-opacity="0.72"/></linearGradient></defs>`;
  const k = {
    stem: `<svg viewBox="0 0 60 80">${defs}
      <path d="M30,76 Q29,45 30,12" stroke="${color}" stroke-width="3" fill="none"/>
      <path d="M30,60 Q18,56 14,46 Q26,48 30,54 Z" fill="url(#${uid})"/>
      <path d="M30,48 Q42,44 46,34 Q34,36 30,42 Z" fill="url(#${uid})"/>
      <path d="M30,36 Q18,32 14,22 Q26,24 30,30 Z" fill="url(#${uid})"/>
      <path d="M30,24 Q42,20 46,10 Q34,12 30,18 Z" fill="url(#${uid})"/>
      <ellipse cx="30" cy="11" rx="4" ry="6" fill="${color}"/></svg>`,
    grass: `<svg viewBox="0 0 60 80">${defs}
      <path d="M20,76 Q21,42 27,12 Q24,44 24,76 Z" fill="url(#${uid})"/>
      <path d="M30,76 Q32,38 39,8 Q35,42 34,76 Z" fill="url(#${uid})"/>
      <path d="M40,76 Q42,44 49,16 Q45,48 44,76 Z" fill="url(#${uid})"/>
      <path d="M14,76 Q14,52 19,28 Q18,54 18,76 Z" fill="url(#${uid})"/>
      <path d="M48,76 Q49,58 54,38 Q52,60 52,76 Z" fill="url(#${uid})" opacity="0.8"/></svg>`,
    rosette: `<svg viewBox="0 0 60 80">${defs}
      <path d="M30,76 Q22,54 10,40 Q8,36 12,38 Q26,50 32,72 Z" fill="url(#${uid})"/>
      <path d="M30,76 Q38,54 50,40 Q52,36 48,38 Q34,50 28,72 Z" fill="url(#${uid})"/>
      <path d="M30,76 Q20,48 8,28 Q6,24 11,27 Q24,44 32,70 Z" fill="url(#${uid})" opacity="0.85"/>
      <path d="M30,76 Q40,48 52,28 Q54,24 49,27 Q36,44 28,70 Z" fill="url(#${uid})" opacity="0.85"/>
      <path d="M28,76 Q28,44 30,16 Q32,44 32,76 Z" fill="url(#${uid})"/></svg>`,
    moss: `<svg viewBox="0 0 60 80">${defs}
      <circle cx="20" cy="45" r="7" fill="url(#${uid})"/>
      <circle cx="33" cy="37" r="9" fill="url(#${uid})"/>
      <circle cx="45" cy="48" r="6" fill="url(#${uid})"/>
      <circle cx="27" cy="55" r="6.5" fill="url(#${uid})"/>
      <circle cx="40" cy="61" r="7" fill="url(#${uid})"/>
      <circle cx="17" cy="60" r="6" fill="url(#${uid})"/>
      <circle cx="26" cy="44" r="2" fill="${color}" opacity="0.55"/>
      <circle cx="38" cy="50" r="2" fill="${color}" opacity="0.55"/>
      <circle cx="31" cy="60" r="2" fill="${color}" opacity="0.55"/></svg>`,
    floating: `<svg viewBox="0 0 60 80">${defs}
      <ellipse cx="20" cy="20" rx="9" ry="5.5" fill="url(#${uid})"/>
      <ellipse cx="39" cy="17" rx="10" ry="5.5" fill="url(#${uid})"/>
      <ellipse cx="29" cy="31" rx="9" ry="5.5" fill="url(#${uid})"/>
      <path d="M20,19 L14,21 M39,16 L33,18 M29,30 L23,32" stroke="${color}" stroke-width="1.2" opacity="0.5"/>
      <path d="M20,25 Q19,42 21,56 M39,22 Q38,38 40,50 M29,36 Q28,50 30,62" stroke="${color}" stroke-width="1.2" opacity="0.45" fill="none"/></svg>`,
  };
  return k[kind] || k.stem;
}

// ─── PLANTS (freshwater only) ───
window.DB.plants = [
  {id:'anubias', tr:'Anubias Nana', en:'Anubias Nana', sci:'Anubias barteri var. nana', light:'low', co2:false, difficulty:'easy', kind:'rosette', placement:'mid', color:'#4a6b3a'},
  {id:'java-fern', tr:'Java Eğreltisi', en:'Java Fern', sci:'Microsorum pteropus', light:'low', co2:false, difficulty:'easy', kind:'rosette', placement:'mid', color:'#4a6b3a'},
  {id:'amazon-sword', tr:'Amazon Kılıç', en:'Amazon Sword', sci:'Echinodorus bleheri', light:'medium', co2:false, difficulty:'easy', kind:'rosette', placement:'background', color:'#6b8e4e'},
  {id:'vallisneria', tr:'Vallisneria', en:'Vallisneria', sci:'Vallisneria spiralis', light:'medium', co2:false, difficulty:'easy', kind:'grass', placement:'background', color:'#6b8e4e'},
  {id:'cryptocoryne-wendtii', tr:'Kriptokoryne Wendtii', en:'Cryptocoryne Wendtii', sci:'Cryptocoryne wendtii', light:'low', co2:false, difficulty:'easy', kind:'rosette', placement:'mid', color:'#4a6b3a'},
  {id:'cryptocoryne-becketti', tr:'Kriptokoryne Becketti', en:'Cryptocoryne Becketti', sci:'Cryptocoryne beckettii', light:'low', co2:false, difficulty:'easy', kind:'rosette', placement:'mid', color:'#6b8e4e'},
  {id:'java-moss', tr:'Java Moss', en:'Java Moss', sci:'Taxiphyllum barbieri', light:'low', co2:false, difficulty:'easy', kind:'moss', placement:'mid', color:'#6b8e4e'},
  {id:'christmas-moss', tr:'Noel Yosunu', en:'Christmas Moss', sci:'Vesicularia montagnei', light:'low', co2:false, difficulty:'easy', kind:'moss', placement:'mid', color:'#4a6b3a'},
  {id:'rotala-rotundifolia', tr:'Rotala Rotundifolia', en:'Rotala Rotundifolia', sci:'Rotala rotundifolia', light:'high', co2:true, difficulty:'medium', kind:'stem', placement:'background', color:'#b85450'},
  {id:'rotala-hra', tr:'Rotala HRA', en:'Rotala H\'ra', sci:'Rotala sp. H\'ra', light:'high', co2:true, difficulty:'medium', kind:'stem', placement:'background', color:'#d44648'},
  {id:'ludwigia-repens', tr:'Ludwigia Repens', en:'Ludwigia Repens', sci:'Ludwigia repens', light:'high', co2:true, difficulty:'medium', kind:'stem', placement:'background', color:'#d97757'},
  {id:'ludwigia-super-red', tr:'Süper Kırmızı Ludwigia', en:'Ludwigia Super Red', sci:'Ludwigia palustris', light:'high', co2:true, difficulty:'medium', kind:'stem', placement:'background', color:'#b85450'},
  {id:'limnophila', tr:'Ambulia', en:'Limnophila Sessiliflora', sci:'Limnophila sessiliflora', light:'medium', co2:false, difficulty:'easy', kind:'stem', placement:'background', color:'#6b8e4e'},
  {id:'cabomba', tr:'Cabomba', en:'Cabomba', sci:'Cabomba caroliniana', light:'high', co2:true, difficulty:'medium', kind:'stem', placement:'background', color:'#4a6b3a'},
  {id:'hornwort', tr:'Boynuz Otu', en:'Hornwort', sci:'Ceratophyllum demersum', light:'low', co2:false, difficulty:'easy', kind:'stem', placement:'background', color:'#6b8e4e'},
  {id:'glossostigma', tr:'Glossostigma', en:'Glossostigma', sci:'Glossostigma elatinoides', light:'high', co2:true, difficulty:'hard', kind:'grass', placement:'foreground', color:'#6b8e4e'},
  {id:'monte-carlo', tr:'Monte Carlo', en:'Monte Carlo', sci:'Micranthemum tweediei', light:'medium', co2:true, difficulty:'medium', kind:'grass', placement:'foreground', color:'#6b8e4e'},
  {id:'dwarf-hairgrass', tr:'Cüce Saç Çimi', en:'Dwarf Hairgrass', sci:'Eleocharis parvula', light:'high', co2:true, difficulty:'medium', kind:'grass', placement:'foreground', color:'#4a6b3a'},
  {id:'hc-cuba', tr:'HC Cuba', en:'Dwarf Baby Tears', sci:'Hemianthus callitrichoides', light:'high', co2:true, difficulty:'hard', kind:'grass', placement:'foreground', color:'#6b8e4e'},
  {id:'duckweed', tr:'Su Mercimeği', en:'Duckweed', sci:'Lemna minor', light:'low', co2:false, difficulty:'easy', kind:'floating', placement:'surface', color:'#6b8e4e'},
  {id:'frogbit', tr:'Kurbağa Otu', en:'Amazon Frogbit', sci:'Limnobium laevigatum', light:'medium', co2:false, difficulty:'easy', kind:'floating', placement:'surface', color:'#4a6b3a'},
  {id:'red-root-floater', tr:'Kırmızı Köklü Yüzücü', en:'Red Root Floater', sci:'Phyllanthus fluitans', light:'high', co2:false, difficulty:'medium', kind:'floating', placement:'surface', color:'#b85450'},
  {id:'bucephalandra', tr:'Bucephalandra', en:'Bucephalandra', sci:'Bucephalandra sp.', light:'low', co2:false, difficulty:'easy', kind:'rosette', placement:'mid', color:'#2d4a2b'},
  {id:'bolbitis', tr:'Bolbitis', en:'African Water Fern', sci:'Bolbitis heudelotii', light:'low', co2:false, difficulty:'easy', kind:'rosette', placement:'mid', color:'#4a6b3a'},
  {id:'pogostemon-helferi', tr:'Downoi', en:'Downoi', sci:'Pogostemon helferi', light:'high', co2:true, difficulty:'medium', kind:'rosette', placement:'foreground', color:'#6b8e4e'},
  {id:'staurogyne', tr:'Staurogyne Repens', en:'Staurogyne Repens', sci:'Staurogyne repens', light:'medium', co2:true, difficulty:'medium', kind:'stem', placement:'foreground', color:'#6b8e4e'},
];

// ─── SUBSTRATES ───
window.DB.substrates = [
  {id:'fine-sand', tr:'İnce Kum', en:'Fine Sand', water:['fresh','salt'], plantFriendly:false, ph:'neutral', color:'#f4ecd8', desc:'Doğal görünüm, dipte yaşayan balıklar için ideal.', descEn:'Natural look, ideal for bottom-dwellers.'},
  {id:'aragonite', tr:'Aragonit Kumu', en:'Aragonite Sand', water:['salt'], plantFriendly:false, ph:'high', color:'#faf6ec', desc:'pH ve sertliği tamponlar. Tuzlu su standardı.', descEn:'Buffers pH and hardness. Saltwater standard.'},
  {id:'crushed-coral', tr:'Mercan Kumu', en:'Crushed Coral', water:['salt'], plantFriendly:false, ph:'high', color:'#e8dcc4', desc:'pH yükseltici. Tuzlu su ve sert su balıkları (Afrika çiklit) için.', descEn:'pH-raising. For saltwater or hard-water fish (African cichlids).'},
  {id:'gravel', tr:'Çakıl', en:'Aquarium Gravel', water:['fresh'], plantFriendly:false, ph:'neutral', color:'#8a7f6a', desc:'Klasik akvaryum çakılı, kolay temizlenir.', descEn:'Classic aquarium gravel, easy to clean.'},
  {id:'aqua-soil', tr:'Bitkisel Toprak', en:'Aqua Soil', water:['fresh'], plantFriendly:true, ph:'low', color:'#3a2818', desc:'Besinli toprak. pH ve KH düşürür, bitkili akvaryum için.', descEn:'Nutrient-rich soil. Lowers pH/KH, for planted tanks.'},
  {id:'black-sand', tr:'Siyah Kum', en:'Black Sand', water:['fresh'], plantFriendly:false, ph:'neutral', color:'#1a1410', desc:'Renkli balıkların öne çıkmasını sağlar.', descEn:'Makes colored fish pop.'},
  {id:'lava-rock', tr:'Lav Taşı Kırığı', en:'Lava Rock Substrate', water:['fresh'], plantFriendly:true, ph:'neutral', color:'#3a1818', desc:'Bakteri kolonizasyonu için yüksek yüzey alanı.', descEn:'High surface area for bacterial colonization.'},
  {id:'live-sand', tr:'Canlı Kum', en:'Live Sand', water:['salt'], plantFriendly:false, ph:'high', color:'#f4ecd8', desc:'Aktif bakteri yatağı içeren tuzlu su kumu. Cycle hızlandırır.', descEn:'Saltwater sand pre-seeded with bacteria, speeds cycling.'},
];

// ─── TANK PRESETS ───
window.DB.tankPresets = [
  {id:'nano', tr:'Nano (30L)', en:'Nano (30L)', l:30, w:25, h:30, vol:30},
  {id:'small', tr:'Küçük (60L)', en:'Small (60L)', l:60, w:30, h:35, vol:60},
  {id:'medium', tr:'Orta (120L)', en:'Medium (120L)', l:80, w:35, h:45, vol:120},
  {id:'large', tr:'Büyük (240L)', en:'Large (240L)', l:120, w:45, h:50, vol:240},
  {id:'xlarge', tr:'Çok Büyük (450L)', en:'X-Large (450L)', l:150, w:60, h:55, vol:450},
  {id:'xxlarge', tr:'Dev (700L)', en:'XX-Large (700L)', l:180, w:65, h:60, vol:700},
];

// ─── Assemble combined fish DB from fish-fresh.js + fish-salt.js ───
window.DB.fish = [].concat(window.DB_FRESH || [], window.DB_SALT || []);

// Also expose helpers globally
window.fishSVG = fishSVG;
window.plantSVG = plantSVG;
