// AKVARYUM — Freshwater fish database loader
window.DB_FRESH = [];
window.__addFreshFish = function(o) {
  window.DB_FRESH.push({
    id:o.id, nameTr:o.tr, nameEn:o.en, sci:o.sci, water:'fresh',
    minVolume:o.vol, perFishL:o.perL||Math.max(4,Math.round(o.vol/8)),
    pH:o.pH, temp:o.temp, gh:o.gh||[3,20],
    aggression:o.agg, schooling:o.school||0, diet:o.diet,
    adultSize:o.size, layer:o.layer||'mid',
    plantSafe:o.plantSafe!==false, reefSafe:false,
    finNippers:o.finNip||false, longFinned:o.longFin||false,
    silhouette:o.silh||'classic', color:o.color||['#d97757','#c89b3c'],
    notes:o.notes||'', notesEn:o.notesEn||''
  });
};
// AKVARYUM — Saltwater fish database loader
window.DB_SALT = [];
window.__addSaltFish = function(o) {
  window.DB_SALT.push({
    id:o.id, nameTr:o.tr, nameEn:o.en, sci:o.sci, water:'salt',
    minVolume:o.vol, perFishL:o.perL||Math.max(40,Math.round(o.vol/4)),
    pH:o.pH||[8.1,8.4], temp:o.temp||[24,27], gh:[8,12],
    salinity:o.sal||[33,35],
    aggression:o.agg, schooling:o.school||0, diet:o.diet,
    adultSize:o.size, layer:o.layer||'mid',
    plantSafe:true, reefSafe:o.reefSafe!==false,
    finNippers:o.finNip||false, longFinned:o.longFin||false,
    silhouette:o.silh||'classic', color:o.color||['#d97757','#c89b3c'],
    notes:o.notes||'', notesEn:o.notesEn||''
  });
};
