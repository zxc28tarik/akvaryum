# AKVARYUM

Türkçe ve İngilizce akvaryum tasarım ve uyumluluk asistanı.

## Geçiş durumu

Projenin mevcut statik sürümü kökte korunmaktadır. Yeni Vite + React yapısı `vite-app/` altında geliştirilmektedir. Vite production paketinde tarayıcı içi Babel, `eval` ve runtime gzip açma kaldırılmıştır.

Büyük eski kaynak arşivleri geçici olarak yalnız Vite build sırasında Node.js ile açılır ve normal JavaScript/CSS paketine çevrilir. Tarayıcıya `.gz.b64` dosyaları veya kaynak derleyici gönderilmez.

Ortak eski-veri sözleşmesi `schemas/akvaryum.schema.json`, yeni canlı sözleşmesi `schemas/inhabitant-v1.schema.json`, bitki sözleşmesi `schemas/plant-v1.schema.json`, taban sözleşmesi ise `schemas/substrate-v1.schema.json` dosyasındadır. Production build, 580 canlıyı `Inhabitant v1`, 26 bitkiyi `Plant v1` ve 8 tabanı `Substrate v1` modeline kimlikleri değiştirmeden taşır.

Kaynak kataloğu `data/sources/source-catalog.json`, kaynak ve doğrulama sözleşmesi ise `schemas/source-provenance.schema.json` dosyasındadır. Uygulama verileri `sourceIds`, alan bazlı `fieldSourceIds` ve `verification` bilgisi taşır. Eski veriler dış kaynaklarla doğrulanana kadar `needs_review` durumunda kalır.

Canlı katalog modülleri `data/catalog/` altındadır. Yeni modeldeki 580 kayıt balık, omurgasız ve mercan koleksiyonlarına ayrılır; bütün kayıtlar aynı ortak arama indeksinde tutulur. `DB.fish` eski arayüz uyumluluğu için korunur, yeni ana model `DB.inhabitants`, katalog erişimi ise `DB.inhabitantCatalog` alanıdır.

Bitkilerde eski `DB.plants` alanı arayüz uyumluluğu için korunur. Yeni `Plant v1` kayıtları `DB.aquaticPlants` alanında bulunur. Su aralıkları, büyüme hızı, besin talebi, boy ve çoğaltma gibi eski veride olmayan alanlar uydurulmadan açık eksik tutulur.

Tabanlarda eski `DB.substrates` alanı arayüz uyumluluğu için korunur. Yeni `Substrate v1` kayıtları `DB.aquariumSubstrates` alanında bulunur. Tane boyu, güvenlik, önerilen derinlik, yenileme süresi ve besin alanları kaynak olmadan doldurulmaz.

Motor pH, sıcaklık ve GH ortak aralıklarını bütün seçili türler boyunca kesiştirir. Ortak güvenli aralık yoksa sonuç `null` olur; önceki türün aralığı korunmaz ve çakışan tür çiftleri kritik sorun olarak gösterilir.

Bilimsel ad ve kimlik denetiminin kayıtlı sonucu `data/audits/inhabitant-taxonomy-audit.json` dosyasındadır. Mevcut bulgular parmak iziyle sabitlenmiştir; yeni veya kaldırılan bir bulgu rapor bilinçli olarak güncellenmeden build'i durdurur.

İlk ürün öncelik setindeki 100 kayıt için sosyal bölgesellik ve bakım zorluğu `data/curation/priority-social-care-v1.mjs`, minimum tank uzunluğu ise `data/curation/priority-tank-length-v1.mjs` kurallarıyla tamamlanır. Bu liste dış pazar popülerlik sıralaması değildir; legacy katalog sırasındaki ilk 100 kayıt olarak sabitlenmiştir.

## Mevcut statik sürüm

```bash
python -m http.server 8000
```

Ardından `http://localhost:8000` adresini açın.

## Yeni Vite sürümü

```bash
npm install
npm run check:legacy
npm run check:schema
npm run check:classification
npm run check:sources
npm run check:migration
npm run check:plants
npm run check:substrates
npm run check:engine-params
npm run check:priority100
npm run check:tanklength100
npm run check:taxonomy
npm run check:catalog
npm run dev
```

## Production build ve kontroller

```bash
npm run check:legacy
npm run check:schema
npm run check:classification
npm run check:sources
npm run check:migration
npm run check:plants
npm run check:substrates
npm run check:engine-params
npm run check:priority100
npm run check:tanklength100
npm run check:taxonomy
npm run check:catalog
npm run build
npm run check:native
npm run preview
```

- `check:legacy`: canlı, bitki ve taban sayılarıyla canlı kimliği tekrarlarını kontrol eder.
- `check:schema`: 620 eski kaydın alan tiplerini, zorunlu değerlerini, bütün kimliklerini ve sayısal aralıklarını doğrular.
- `check:classification`: 580 canlıda `entityType`, kategori, cins ve aile kapsamını doğrular.
- `check:sources`: kaynak kataloğunu, kayıtların kaynak kimliklerini, alan-kaynak bağlantılarını ve doğrulama durumlarını denetler.
- `check:migration`: 580 legacy kayıtla 580 `Inhabitant v1` kaydını birebir karşılaştırır; kimlik, doğrudan değer ve kaynak kaybını reddeder.
- `check:plants`: 26 legacy bitkiyle 26 `Plant v1` kaydını karşılaştırır; kimlik ve mevcut alan kaybını, kaynak kopmasını veya eksik alanlara uydurma değer yazılmasını reddeder.
- `check:substrates`: 8 legacy tabanla 8 `Substrate v1` kaydını karşılaştırır; kimlik ve mevcut alan kaybını, kaynak kopmasını veya eksik güvenlik/kullanım alanlarına uydurma değer yazılmasını reddeder.
- `check:engine-params`: pH, sıcaklık ve GH ortak aralıklarının doğru daraltılmasını; ortak aralık yoksa `null` ve Türkçe/İngilizce kritik sorun üretilmesini 10 sınır senaryosuyla doğrular.
- `check:priority100`: ilk ürün öncelik setindeki 100 kaydın sosyal yapı ve bakım zorluğu alanlarını, kaynak izini, düşük güven durumunu ve rapor sayımlarını doğrular.
- `check:tanklength100`: aynı 100 kaydın minimum tank uzunluğunu, hacim ve vücut/yüzme alt sınırlarını, standart ölçü yuvarlamasını ve kaynak izini doğrular.
- `check:taxonomy`: kimlik ve bilimsel ad tekrarlarını, ortak ad çakışmalarını, `var./sp./cf.` kayıtlarını ve cins-aile tutarlılığını denetler; güncel bulguları kayıtlı raporla karşılaştırır.
- `check:catalog`: yeni modeldeki 580 canlıyı balık, omurgasız ve mercan koleksiyonlarına ayırır; kayıt kaybı, çifte üyelik ve eksik arama indeksi durumlarını reddeder.
- `build`: başlamadan önce veri, kaynak, canlı/bitki/taban migrasyonları, motor parametre kesişimi, öncelik 100, tank uzunluğu, taksonomi raporu ve katalog doğrulamalarını otomatik olarak yeniden çalıştırır.
- `check:native`: production paketinde eski runtime yükleyicisi, Babel standalone, gzip açıcı veya `eval` bulunmadığını doğrular.
- Build çıktısı `dist/` klasörüne yazılır.
- GitHub Pages taban yolu `/akvaryum/` olarak ayarlanmıştır.

## Yeni veri modelleri

```js
const inhabitants = window.DB.inhabitants;
const aquaticPlants = window.DB.aquaticPlants;
const aquariumSubstrates = window.DB.aquariumSubstrates;
const { collections, searchIndex, counts } = window.DB.inhabitantCatalog;

inhabitants[0].name.tr;
inhabitants[0].tank.minLengthCm;

aquaticPlants[0].name.tr;
aquaticPlants[0].light.min;
aquaticPlants[0].co2Need;

aquariumSubstrates[0].name.tr;
aquariumSubstrates[0].waterTypes;
aquariumSubstrates[0].phEffect;
aquariumSubstrates[0].migration.unknownFields;

collections.fish;
collections.invertebrates;
collections.corals;
searchIndex;
counts;
```

Bitkilerde doğrudan korunan alanlar adlar, bilimsel ad, ışık ve görünüm bilgileridir. Yerleşim, CO₂ gereksinimi ve zorluk kontrollü biçimde dönüştürülür. Sıcaklık, pH, GH, büyüme hızı, besin talebi, beslenme biçimi, boy, çoğaltma ve sert zemine bağlanma dış kaynak doğrulamasına bırakılır.

Tabanlarda adlar, açıklama, su türleri, pH etkisi, bitki uyumu ve renk korunur. Kategori, malzeme etiketi ve tamponlama durumu kontrollü biçimde türetilir. Tane boyu, KH/GH etkisi, besin zenginliği, dip canlısı güvenliği, keskinlik, önerilen derinlik ve yenileme süresi dış kaynak doğrulamasına bırakılır.

## Ortak parametre kesişimi

- pH, sıcaklık ve GH aynı güvenli kesişim çekirdeğini kullanır.
- Bütün seçili türlerin aralıkları sırayla daraltılır.
- Ortak aralık kaybolduğunda sonuç `null` olur; önceki aralığa geri dönülmez.
- Çakışmayan tür çiftleri sonuçtaki kritik sorun açıklamasında gösterilir.
- Tek noktada buluşan aralık geçerli kabul edilir.
- GH bilgisi olmayan kayıt GH kesişimine katılmaz.
- Standart `ruleId/severity/resolution` çıktısı ayrı `AKV-ENG-002` görevidir.

## Öncelik 100 türetim ilkesi

- Sosyal bakım alanları `social.territoriality` ve `care.difficulty` alanlarıdır.
- Zorluk puanı minimum tank hacmi, yetişkin boyu, mizaç, etçil beslenme işareti, su aralığı genişliği ve grup büyüklüğünden türetilir.
- Bölgesellik; agresif kayıtta `high`, yarı agresifte `medium`, barışçıl grup türünde `none`, barışçıl tekil kayıtta `low` olur.
- Minimum tank uzunluğu, hacim geometrisinden gelen alt sınır ile yetişkin boyu/yüzme gereksiniminden gelen alt sınırın büyük olanıdır.
- Tank uzunlukları bir sonraki standart ölçüye yukarı yuvarlanır; sonuçlar 60–300 cm aralığındadır.
- Bütün değerler ayrı türetim kaynak kimlikleri taşır.
- Bu türetimler tür bazlı dış kaynak doğrulaması değildir. Kayıtlar `needs_review/low` durumunda kalır.

## Taksonomi denetimi ilkesi

- Aynı veya normalize edildiğinde çakışan kimlikler engelleyici hatadır.
- Bilimsel addaki cins ile `taxonomy.genus` uyuşmazlığı engelleyici hatadır.
- Aynı cinsin birden fazla aileye bağlanması engelleyici hatadır.
- Aynı bilimsel adı taşıyan kayıtlar otomatik silinmez; kanonik kimlik, alias veya ticari varyant kararı bekler.
- `sp.`, `cf.` ve melez gösterimleri belirsizlik olarak korunur; kaynak olmadan tür adı tahmin edilmez.
- Bu iç denetim kabul edilmiş bilimsel ad doğrulaması değildir. 580 kaydın dış taksonomi kaynaklarıyla doğrulanması ayrı veri çalışmasıdır.

## Kaynaklandırma ilkesi

- Tek bir kaynak bütün kaydı desteklemek zorunda değildir; kaynaklar destekledikleri alanları `fields` içinde belirtir.
- İç eski veriler `internal_legacy`, otomatik türetilen alanlar `derived` olarak işaretlenir.
- `verified` bir kayıt yalnız doğrulanmış kaynaklara bağlanabilir.
- Kaynaksız veya çelişkili bilgi doğrulanmış sayılmaz ve production verisine kesin bilgi gibi eklenmez.

## Plan

Geliştirme sırası ve görev durumları `docs/plans/AKVARYUM_GELISTIRME_IS_PLANI/` altında tutulur.
