# AKVARYUM

Türkçe ve İngilizce akvaryum tasarım ve uyumluluk asistanı.

## Geçiş durumu

Projenin mevcut statik sürümü kökte korunmaktadır. Yeni Vite + React yapısı `vite-app/` altında geliştirilmektedir. Vite production paketinde tarayıcı içi Babel, `eval` ve runtime gzip açma kaldırılmıştır.

Büyük eski kaynak arşivleri geçici olarak yalnız Vite build sırasında Node.js ile açılır ve normal JavaScript/CSS paketine çevrilir. Tarayıcıya `.gz.b64` dosyaları veya kaynak derleyici gönderilmez.

Ortak veri sözleşmesi `schemas/akvaryum.schema.json` dosyasındadır. Şema; mevcut canlı, bitki, taban ve tank kayıtlarını doğrular, ayrıca yeni veri modelinin ortak alanlarını tanımlar.

Kaynak kataloğu `data/sources/source-catalog.json`, kaynak ve doğrulama sözleşmesi ise `schemas/source-provenance.schema.json` dosyasındadır. Uygulama verileri `sourceIds`, alan bazlı `fieldSourceIds` ve `verification` bilgisi taşır. Eski veriler dış kaynaklarla doğrulanana kadar `needs_review` durumunda kalır.

Canlı katalog modülleri `data/catalog/` altındadır. Tek ana canlı dizisi build sırasında balık, omurgasız ve mercan koleksiyonlarına ayrılır; bütün kayıtlar aynı ortak arama indeksinde tutulur. Mevcut `DB.fish` alanı eski arayüz uyumluluğu için korunur, yeni erişim noktası `DB.inhabitantCatalog` alanıdır.

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
npm run check:catalog
npm run dev
```

## Production build ve kontroller

```bash
npm run check:legacy
npm run check:schema
npm run check:classification
npm run check:sources
npm run check:catalog
npm run build
npm run check:native
npm run preview
```

- `check:legacy`: canlı, bitki ve taban sayılarıyla canlı kimliği tekrarlarını kontrol eder.
- `check:schema`: 620 kaydın alan tiplerini, zorunlu değerlerini, bütün kimliklerini ve sayısal aralıklarını ortak JSON Schema ile doğrular.
- `check:classification`: 580 canlıda `entityType`, kategori, cins ve aile kapsamını doğrular.
- `check:sources`: kaynak kataloğunu, 620 kaydın kaynak kimliklerini, 2.940 alan-kaynak bağlantısını ve doğrulama durumlarını denetler.
- `check:catalog`: 580 canlıyı balık, omurgasız ve mercan koleksiyonlarına ayırır; kayıt kaybı, çifte üyelik, bilinmeyen `entityType` ve eksik arama indeksi durumlarını reddeder.
- `build`: başlamadan önce veri, kaynak ve katalog doğrulamalarını otomatik olarak yeniden çalıştırır.
- `check:native`: production paketinde eski runtime yükleyicisi, Babel standalone, gzip açıcı veya `eval` bulunmadığını doğrular.
- Build çıktısı `dist/` klasörüne yazılır.
- GitHub Pages taban yolu `/akvaryum/` olarak ayarlanmıştır.

## Yeni canlı katalog erişimi

```js
const { collections, searchIndex, counts } = window.DB.inhabitantCatalog;

collections.fish;
collections.invertebrates;
collections.corals;
searchIndex;
counts;
```

Arama indeksi Türkçe ad, İngilizce ad, bilimsel ad, kimlik, kategori, canlı türü, cins ve aile alanlarını birlikte tarayabilecek biçimde hazırlanır.

## Kaynaklandırma ilkesi

- Tek bir kaynak bütün kaydı desteklemek zorunda değildir; kaynaklar destekledikleri alanları `fields` içinde belirtir.
- İç eski veriler `internal_legacy`, otomatik türetilen alanlar `derived` olarak işaretlenir.
- `verified` bir kayıt yalnız doğrulanmış kaynaklara bağlanabilir.
- Kaynaksız veya çelişkili bilgi doğrulanmış sayılmaz ve production verisine kesin bilgi gibi eklenmez.

## Plan

Geliştirme sırası ve görev durumları `docs/plans/AKVARYUM_GELISTIRME_IS_PLANI/` altında tutulur.
