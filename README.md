# AKVARYUM

Türkçe ve İngilizce akvaryum tasarım ve uyumluluk asistanı.

## Geçiş durumu

Projenin mevcut statik sürümü kökte korunmaktadır. Yeni Vite + React yapısı `vite-app/` altında geliştirilmektedir. Vite production paketinde tarayıcı içi Babel, `eval` ve runtime gzip açma kaldırılmıştır.

Büyük eski kaynak arşivleri geçici olarak yalnız Vite build sırasında Node.js ile açılır ve normal JavaScript/CSS paketine çevrilir. Tarayıcıya `.gz.b64` dosyaları veya kaynak derleyici gönderilmez.

Ortak eski-veri sözleşmesi `schemas/akvaryum.schema.json`, yeni canlı sözleşmesi ise `schemas/inhabitant-v1.schema.json` dosyasındadır. Production build, 580 legacy canlı kaydını kimlikleri değiştirmeden `Inhabitant v1` modeline taşır.

Kaynak kataloğu `data/sources/source-catalog.json`, kaynak ve doğrulama sözleşmesi ise `schemas/source-provenance.schema.json` dosyasındadır. Uygulama verileri `sourceIds`, alan bazlı `fieldSourceIds` ve `verification` bilgisi taşır. Eski veriler dış kaynaklarla doğrulanana kadar `needs_review` durumunda kalır.

Canlı katalog modülleri `data/catalog/` altındadır. Yeni modeldeki 580 kayıt balık, omurgasız ve mercan koleksiyonlarına ayrılır; bütün kayıtlar aynı ortak arama indeksinde tutulur. `DB.fish` eski arayüz uyumluluğu için korunur, yeni ana model `DB.inhabitants`, katalog erişimi ise `DB.inhabitantCatalog` alanıdır.

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
- `check:catalog`: yeni modeldeki 580 canlıyı balık, omurgasız ve mercan koleksiyonlarına ayırır; kayıt kaybı, çifte üyelik ve eksik arama indeksi durumlarını reddeder.
- `build`: başlamadan önce veri, kaynak, migrasyon ve katalog doğrulamalarını otomatik olarak yeniden çalıştırır.
- `check:native`: production paketinde eski runtime yükleyicisi, Babel standalone, gzip açıcı veya `eval` bulunmadığını doğrular.
- Build çıktısı `dist/` klasörüne yazılır.
- GitHub Pages taban yolu `/akvaryum/` olarak ayarlanmıştır.

## Yeni canlı modeli

```js
const inhabitants = window.DB.inhabitants;
const { collections, searchIndex, counts } = window.DB.inhabitantCatalog;

inhabitants[0].name.tr;
inhabitants[0].water.temperatureC;
inhabitants[0].migration.unknownFields;

collections.fish;
collections.invertebrates;
collections.corals;
searchIndex;
counts;
```

Eski veride bulunmayan etkinlik, bölgesellik, beslenme zorluğu, akıntı, oksijen ve bakım zorluğu gibi alanlar tahmin edilmez; `unknown` olarak işaretlenir ve veri tamamlama görevlerine bırakılır.

## Kaynaklandırma ilkesi

- Tek bir kaynak bütün kaydı desteklemek zorunda değildir; kaynaklar destekledikleri alanları `fields` içinde belirtir.
- İç eski veriler `internal_legacy`, otomatik türetilen alanlar `derived` olarak işaretlenir.
- `verified` bir kayıt yalnız doğrulanmış kaynaklara bağlanabilir.
- Kaynaksız veya çelişkili bilgi doğrulanmış sayılmaz ve production verisine kesin bilgi gibi eklenmez.

## Plan

Geliştirme sırası ve görev durumları `docs/plans/AKVARYUM_GELISTIRME_IS_PLANI/` altında tutulur.
