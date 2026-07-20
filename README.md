# AKVARYUM

Türkçe ve İngilizce akvaryum tasarım ve uyumluluk asistanı.

## Geçiş durumu

Projenin mevcut statik sürümü kökte korunmaktadır. Yeni Vite + React yapısı `vite-app/` altında geliştirilmektedir. Vite production paketinde tarayıcı içi Babel, `eval` ve runtime gzip açma kaldırılmıştır.

Büyük eski kaynak arşivleri geçici olarak yalnız Vite build sırasında Node.js ile açılır ve normal JavaScript/CSS paketine çevrilir. Tarayıcıya `.gz.b64` dosyaları veya kaynak derleyici gönderilmez.

Ortak eski-veri sözleşmesi `schemas/akvaryum.schema.json`, yeni canlı sözleşmesi ise `schemas/inhabitant-v1.schema.json` dosyasındadır. Production build, 580 legacy canlı kaydını kimlikleri değiştirmeden `Inhabitant v1` modeline taşır.

Kaynak kataloğu `data/sources/source-catalog.json`, kaynak ve doğrulama sözleşmesi ise `schemas/source-provenance.schema.json` dosyasındadır. Uygulama verileri `sourceIds`, alan bazlı `fieldSourceIds` ve `verification` bilgisi taşır. Eski veriler dış kaynaklarla doğrulanana kadar `needs_review` durumunda kalır.

Canlı katalog modülleri `data/catalog/` altındadır. Yeni modeldeki 580 kayıt balık, omurgasız ve mercan koleksiyonlarına ayrılır; bütün kayıtlar aynı ortak arama indeksinde tutulur. `DB.fish` eski arayüz uyumluluğu için korunur, yeni ana model `DB.inhabitants`, katalog erişimi ise `DB.inhabitantCatalog` alanıdır.

Bilimsel ad ve kimlik denetiminin kayıtlı sonucu `data/audits/inhabitant-taxonomy-audit.json` dosyasındadır. Mevcut bulgular parmak iziyle sabitlenmiştir; yeni veya kaldırılan bir bulgu rapor bilinçli olarak güncellenmeden build'i durdurur.

İlk ürün öncelik setindeki 100 kayıt için sosyal bölgesellik ve bakım zorluğu `data/curation/priority-social-care-v1.mjs` kurallarıyla tamamlanır. Bu liste dış pazar popülerlik sıralaması değildir; legacy katalog sırasındaki ilk 100 kayıt olarak sabitlenmiştir. Sonuç özeti `data/curation/priority-social-care-report.json` dosyasındadır.

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
npm run check:priority100
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
npm run check:priority100
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
- `check:priority100`: ilk ürün öncelik setindeki 100 kaydın sosyal yapı ve bakım zorluğu alanlarını, kaynak izini, düşük güven durumunu ve rapor sayımlarını doğrular.
- `check:taxonomy`: kimlik ve bilimsel ad tekrarlarını, ortak ad çakışmalarını, `var./sp./cf.` kayıtlarını ve cins-aile tutarlılığını denetler; güncel bulguları kayıtlı raporla karşılaştırır.
- `check:catalog`: yeni modeldeki 580 canlıyı balık, omurgasız ve mercan koleksiyonlarına ayırır; kayıt kaybı, çifte üyelik ve eksik arama indeksi durumlarını reddeder.
- `build`: başlamadan önce veri, kaynak, migrasyon, öncelik 100, taksonomi raporu ve katalog doğrulamalarını otomatik olarak yeniden çalıştırır.
- `check:native`: production paketinde eski runtime yükleyicisi, Babel standalone, gzip açıcı veya `eval` bulunmadığını doğrular.
- Build çıktısı `dist/` klasörüne yazılır.
- GitHub Pages taban yolu `/akvaryum/` olarak ayarlanmıştır.

## Yeni canlı modeli

```js
const inhabitants = window.DB.inhabitants;
const { collections, searchIndex, counts } = window.DB.inhabitantCatalog;

inhabitants[0].name.tr;
inhabitants[0].water.temperatureC;
inhabitants[0].social.territoriality;
inhabitants[0].care.difficulty;
inhabitants[0].migration.unknownFields;

collections.fish;
collections.invertebrates;
collections.corals;
searchIndex;
counts;
```

İlk 100 kayıt dışında eski veride bulunmayan etkinlik, bölgesellik, beslenme zorluğu, akıntı, oksijen ve bakım zorluğu gibi alanlar tahmin edilmez; `unknown` olarak işaretlenir ve veri tamamlama görevlerine bırakılır.

## Öncelik 100 türetim ilkesi

- Tamamlanan alanlar `social.territoriality` ve `care.difficulty` alanlarıdır.
- Zorluk puanı minimum tank hacmi, yetişkin boyu, mizaç, etçil beslenme işareti, su aralığı genişliği ve grup büyüklüğünden türetilir.
- Bölgesellik; agresif kayıtta `high`, yarı agresifte `medium`, barışçıl grup türünde `none`, barışçıl tekil kayıtta `low` olur.
- Sonuç dağılımı: 69 beginner, 18 intermediate, 5 advanced ve 8 expert.
- Bütün değerler `priority-social-care-rules-v1` kaynak kimliğini taşır.
- Bu türetim tür bazlı dış kaynak doğrulaması değildir. Kayıtlar `needs_review/low` durumunda kalır.

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
