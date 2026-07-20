# AKV-DATA-012 — Bilimsel Ad ve Kimlik Denetimi

**Tarih:** 20 Temmuz 2026  
**Durum:** Tamamlandı

## Amaç

`Inhabitant v1` modelindeki 580 canlı kaydını şu başlıklarda taramak:

- yinelenen ve normalize edildiğinde çakışan kimlikler,
- aynı bilimsel adı kullanan farklı kayıtlar,
- Türkçe veya İngilizce ortak ad çakışmaları,
- belirsiz `var.`, `sp.`, `cf.` ve genetik varyant gösterimleri,
- melez placeholder adları,
- bilimsel addaki cins ile `taxonomy.genus` uyumu,
- aynı cinsin birden fazla aileye bağlanması.

Bu görev dış taksonomi kaynaklarından kabul edilmiş ad doğrulaması yapmaz. Amaç, veri setinin kendi içindeki tekrarları ve araştırma kuyruğunu görünür ve denetlenebilir hale getirmektir.

## Sonuç özeti

```text
Toplam kayıt: 580
Yinelenen kimlik grubu: 0
Normalize kimlik çakışması: 0
Cins alanı uyuşmazlığı: 0
Cins-aile çelişkisi: 0

Aynı bilimsel ad grubu: 23
Aynı İngilizce ortak ad grubu: 1
Belirsiz var. kaydı: 47
sp./cf. açık nomenklatür kaydı: 42
Genetik varyant işaretli kayıt: 2
Melez placeholder kaydı: 1
Toplam kayıtlı inceleme bulgusu: 28
```

Engelleyici veri bütünlüğü hatası bulunmadı. Bütün mevcut bulgular araştırma ve veri temizliği kuyruğuna alınmıştır.

## Muhtemel yinelenen kayıtlar

Aşağıdaki 12 grup aynı bilimsel adı paylaşır ve bilimsel ad alanında ticari varyant göstergesi taşımaz. Otomatik silinmeyeceklerdir; önce tek kanonik kimlik, alias ve bakım verisi birleştirme kararı verilecektir.

| Bilimsel ad | Kayıt kimlikleri | Önerilen işlem |
|---|---|---|
| `Danio margaritatus` | `galaxy-rasbora`, `celestial-pearl` | Tek kanonik kayıt seç; diğer ortak adı alias yap |
| `Brevibora dorsiocellata` | `rasbora-pork`, `rasbora-emerald` | Ad ve bakım verilerini karşılaştır; birleştir |
| `Ctenochaetus strigosus` | `kole-tang`, `bristletooth-yellow-eye` | Tek kanonik kayıt seç; ticari adları alias yap |
| `Centropyge vrolikii` | `pearlscale-angel`, `half-black-angel` | Ortak ad doğrulaması sonrası birleştir veya bilimsel adı düzelt |
| `Chromis viridis` | `green-chromis`, `blue-green-chromis` | Tek kanonik kayıt ve iki ortak ad |
| `Gobiodon okinawae` | `goby-clown`, `goby-yellow-clown` | Tek kanonik kayıt ve alias |
| `Synchiropus splendidus` | `mandarin`, `green-mandarin` | Tek kanonik kayıt ve alias |
| `Dendrochirus brachypterus` | `lionfish-dwarf`, `fuzzy-dwarf-lion` | Tek kanonik kayıt ve alias |
| `Rhinecanthus rectangulus` | `humu-trigger`, `rectangle-trigger` | Tek kanonik kayıt ve alias |
| `Turbo fluctuosa` | `turbo-snail`, `mexican-turbo` | Tür ve ticari ad doğrulaması sonrası birleştir |
| `Discosoma sp.` | `mushroom-coral`, `discosoma-mushroom` | Önce tür düzeyi belirsizliğini doğrula; sonra birleştirme kararı ver |
| `Chaetodon miliaris` | `milletseed-butterfly`, `lemon-butterfly` | Tek kanonik kayıt ve alias |

## Ticari varyant tekrar grupları

Aşağıdaki 11 grup aynı genel `var.` bilimsel adını kullanıyor. Bunlar doğrudan silinmeyecek; temel tür ile ticari varyant adı birbirinden ayrılacak.

| Temel bilimsel gösterim | Kayıt kimlikleri |
|---|---|
| `Pterophyllum scalare var.` | `angel-koi`, `angel-marble`, `angel-platinum` |
| `Astronotus ocellatus var.` | `oscar-tiger`, `oscar-albino` |
| `Mikrogeophagus ramirezi var.` | `ram-electric-blue`, `ram-gold` |
| `Xiphophorus maculatus var.` | `platy-mickey`, `platy-wagtail` |
| `Xiphophorus hellerii var.` | `swordtail-pineapple`, `swordtail-koi` |
| `Betta splendens var.` | `betta-halfmoon`, `betta-crowntail`, `betta-plakat` |
| `Trichopodus trichopterus var.` | `gourami-blue`, `gourami-gold`, `gourami-opaline` |
| `Carassius auratus var.` | `goldfish-fantail`, `goldfish-oranda`, `goldfish-ranchu`, `goldfish-bubble`, `goldfish-shubunkin`, `goldfish-comet` |
| `Neocaridina davidi var.` | `blue-velvet`, `yellow-shrimp` |
| `Amphiprion ocellaris var.` | `clown-black-ocellaris`, `clown-snowflake`, `clown-mocha` |
| `Amphiprion percula var.` | `clown-onyx`, `clown-platinum`, `clown-picasso` |

### Varyant modeli kararı

Hedef yapı:

```js
{
  scientificName: 'Betta splendens',
  variantName: 'Halfmoon',
  aliases: ['Halfmoon Betta']
}
```

`var.` bilimsel adın parçası olarak kullanılmayacak. Bilimsel tür ile ticari renk, yüzgeç veya üretim varyantı ayrı alanlarda tutulacak.

## Açık nomenklatür kuyruğu

42 kayıt `sp.` veya `cf.` biçiminde tür düzeyi belirsizlik taşıyor. Bu gösterimler hata değildir; fakat dış kaynak doğrulaması gerektirir.

Kayıtlar:

`acropora`, `cerith-snail`, `chalice-coral`, `colt-coral`, `cyphastrea`, `discosoma-mushroom`, `favia-coral`, `feather-duster`, `fiddler-crab`, `goniopora`, `green-star-polyp`, `kenya-tree`, `leather-coral`, `leptoseris`, `lobophyllia`, `mbuna`, `montipora`, `mushroom-coral`, `nassarius-snail`, `palythoa`, `pavona-coral`, `peacock-cichlid`, `pectinia`, `plate-coral`, `pleco-bristlenose`, `pleco-rubber`, `porites`, `psammocora`, `pulsing-xenia`, `rabbit-snail`, `rhodactis-mushroom`, `scolymia`, `sea-hare`, `sea-star-brittle`, `sea-star-serpent`, `sinularia-leather`, `snowball-shrimp`, `star-polyp-clove`, `tiger-shrimp`, `trochus-snail`, `tube-anemone`, `zoanthid`.

Çözüm kuralı:

1. Güvenilir kaynak tür düzeyi ad veriyorsa kayıt güncellenir.
2. Tür düzeyi bilinmiyorsa `sp.` veya `cf.` korunur.
3. Belirsizliğin nedeni not ve kaynak alanlarında açık tutulur.
4. Tahminle tür adı üretilmez.

## Diğer bulgular

### Genetik varyant gösterimi

- `glofish-tetra`
- `danio-glofish`

`(gen)` bilimsel adın içinde tutulmayacak. Temel tür bilimsel ad alanında, genetik/ticari varyant bilgisi ayrı etiket veya varyant alanında saklanacak.

### Melez kayıt

- `flowerhorn` — `Hybrid cichlid`

Melez olduğu açıkça korunacak. Ebeveyn bilgisi doğrulanmadan yapay bir cins veya tür adı yazılmayacak.

### Ortak ad çakışması

`pom-pom-crab` ve `pom-pom-crab-sw` farklı türler olmasına rağmen İngilizce `Pom Pom Crab` adını paylaşıyor:

- `Ptychognathus barbatus`
- `Lybia tessellata`

İngilizce adlar tatlı su/deniz veya kabul gören ayırt edici adla ayrıştırılacak; kayıtlar birleştirilmeyecek.

## Otomatik kontrol

```bash
npm run check:taxonomy
```

Denetim şu durumlarda build'i durdurur:

- yinelenen kimlik oluşursa,
- noktalama farkı kaldırıldığında kimlikler çakışırsa,
- bilimsel addaki cins ile `taxonomy.genus` uyuşmazsa,
- aynı cins birden fazla aileye bağlanırsa,
- bulgu listesi kayıtlı rapordan habersiz biçimde değişirse,
- kayıtlı rapor veya çözüm listesi kaldırılırsa.

Mevcut 28 inceleme bulgusu `data/audits/inhabitant-taxonomy-audit.json` içinde parmak iziyle sabitlenmiştir. Yeni veri eklendiğinde veya bir sorun çözüldüğünde rapor bilinçli olarak güncellenmeden CI geçmez.

## Sonraki çalışma sırası

1. Muhtemel 12 yinelenen tür grubu için kanonik kimlik kararı.
2. Ticari varyant alanının şemaya eklenmesi ve 47 `var.` kaydının taşınması.
3. 42 açık nomenklatür kaydının kaynaklı doğrulama partileri.
4. GloFish ve Flowerhorn özel kayıtlarının kaynaklı düzenlenmesi.
5. Kabul edilmiş bilimsel ad ve eş ad doğrulamasının dış taksonomi kaynaklarıyla yapılması.
