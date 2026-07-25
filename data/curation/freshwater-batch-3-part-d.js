// AKV-DATA-020 tatlı su partisi 3 — kayıt grubu D
;(() => {
  const target = window.AKV_FRESHWATER_BATCH_3_SPECS || (window.AKV_FRESHWATER_BATCH_3_SPECS = []);
  target.push(...[{"id":"blue-neon-stiphodon","tr":"Mavi Neon Stiphodon","en":"Blue Neon Stiphodon","sci":"Stiphodon atropurpureus","aliases":["Blue Neon Goby"],"cat":"freshwater_oddball","family":"Gobiidae","temp":[22,27],"ph":[6.5,7.5],"gh":[4,15],"size":5.0,"tank":75,"length":75,"per":8,"school":4,"mode":"group","aggression":"peaceful","conspecific":"medium","territoriality":"low","activity":"active","zone":["bottom","rockwork"],"diet":"herbi","feeding":"hard","flow":"high","oxygen":"high","substrate":["rounded_gravel","rock"],"shelter":["rockwork"],"difficulty":"advanced","plant":true,"notes_tr":"Akıntılı kaya düzeni, yoğun oksijen ve sürekli biyofilm üretimi önemlidir.","notes_en":"An oxygen-rich rocky current and continuous biofilm growth are essential.","colors":["#367ea3","#26383f"],"silhouette":"long"},{"id":"viriosus-hillstream-loach","tr":"Viriosus Akıntı Loachu","en":"Viriosus Hillstream Loach","sci":"Gastromyzon viriosus","aliases":[],"cat":"catfish_loach","family":"Gastromyzontidae","temp":[20,25],"ph":[6.5,7.5],"gh":[4,15],"size":5.5,"tank":75,"length":75,"per":8,"school":4,"mode":"group","aggression":"peaceful","conspecific":"medium","territoriality":"low","activity":"active","zone":["bottom","rockwork"],"diet":"herbi","feeding":"medium","flow":"high","oxygen":"high","substrate":["rounded_gravel","rock"],"shelter":["rockwork"],"difficulty":"advanced","plant":true,"notes_tr":"Serin, hızlı akıntılı ve biyofilmce zengin olgun tank dışında tutulmamalıdır.","notes_en":"Keep only in a mature cool high-flow aquarium rich in biofilm.","colors":["#7c6b53","#2f3736"],"silhouette":"classic"},{"id":"scitulus-hillstream-loach","tr":"Scitulus Akıntı Loachu","en":"Scitulus Hillstream Loach","sci":"Gastromyzon scitulus","aliases":["Borneo Sucker"],"cat":"catfish_loach","family":"Gastromyzontidae","temp":[20,25],"ph":[6.5,7.5],"gh":[4,15],"size":5.0,"tank":75,"length":75,"per":8,"school":4,"mode":"group","aggression":"peaceful","conspecific":"medium","territoriality":"low","activity":"active","zone":["bottom","rockwork"],"diet":"herbi","feeding":"medium","flow":"high","oxygen":"high","substrate":["rounded_gravel","rock"],"shelter":["rockwork"],"difficulty":"advanced","plant":true,"notes_tr":"Kaya yüzeyleri, güçlü akıntı, yüksek oksijen ve doğal alg-biyofilm tabakası ister.","notes_en":"Requires rock surfaces, strong flow, high oxygen and natural algae-biofilm.","colors":["#6d6655","#303534"],"silhouette":"classic"},{"id":"short-bellied-sewellia","tr":"Kısa Karınlı Sewellia","en":"Short-bellied Sewellia","sci":"Sewellia breviventralis","aliases":[],"cat":"catfish_loach","family":"Gastromyzontidae","temp":[20,25],"ph":[6.5,7.5],"gh":[4,15],"size":6.5,"tank":90,"length":90,"per":10,"school":4,"mode":"group","aggression":"peaceful","conspecific":"medium","territoriality":"low","activity":"active","zone":["bottom","rockwork"],"diet":"herbi","feeding":"medium","flow":"high","oxygen":"high","substrate":["rounded_gravel","rock"],"shelter":["rockwork"],"difficulty":"advanced","plant":true,"notes_tr":"En az 90 cm uzunluk, güçlü sirkülasyon ve geniş biyofilmli kaya yüzeyleri gerekir.","notes_en":"Provide at least 90 cm length, strong circulation and broad biofilm-covered rocks.","colors":["#9a805b","#343839"],"silhouette":"classic"}]);

  Object.defineProperty(window, 'AKV_FRESHWATER_BATCH_3', {
    configurable: true,
    get() { return undefined; },
    set(value) {
      const renameGlowlight = (record) => {
        if (record.id !== 'glowlight-danio') return;
        record.id = 'flagrans-danio';
        if ('nameTr' in record) {
          record.nameTr = 'Flagrans Danio';
          record.nameEn = 'Flagrans Danio';
          record.sci = 'Danio flagrans';
        } else {
          record.name = { tr: 'Flagrans Danio', en: 'Flagrans Danio' };
          record.scientificName = 'Danio flagrans';
        }
        record.taxonomy.genus = 'Danio';
        record.taxonomy.family = 'Danionidae';
      };

      for (const record of value?.legacy || []) renameGlowlight(record);
      for (const record of value?.canonical || []) {
        renameGlowlight(record);
        if (record.id === 'red-spotted-rhinogobius') record.taxonomy.family = 'Gobiidae';
      }
      for (const record of window.DB_FRESH || []) {
        renameGlowlight(record);
        if (record.id === 'red-spotted-rhinogobius') record.taxonomy.family = 'Gobiidae';
      }

      const ids = new Set((value?.legacy || []).map((record) => record.id));
      for (const record of window.DB_FRESH || []) {
        if (!ids.has(record.id)) continue;
        record.taxonomy.reviewStatus = 'needs_review';
        if (record.category === 'gourami' || record.category === 'betta') {
          record.category = 'anabantoid';
        }
      }
      Object.defineProperty(window, 'AKV_FRESHWATER_BATCH_3', {
        value,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    },
  });
})();
