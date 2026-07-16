# AKVARYUM

Türkçe ve İngilizce akvaryum tasarım ve uyumluluk asistanı.

## Geçiş durumu

Projenin mevcut statik sürümü kökte korunmaktadır. Yeni Vite + React yapısı `vite-app/` altında geliştirilmektedir. Vite production paketinde tarayıcı içi Babel, `eval` ve runtime gzip açma kaldırılmıştır.

Büyük eski kaynak arşivleri geçici olarak yalnız Vite build sırasında Node.js ile açılır ve normal JavaScript/CSS paketine çevrilir. Tarayıcıya `.gz.b64` dosyaları veya kaynak derleyici gönderilmez.

Ortak veri sözleşmesi `schemas/akvaryum.schema.json` dosyasındadır. Şema; mevcut canlı, bitki, taban ve tank kayıtlarını doğrular, ayrıca yeni veri modelinin ortak alanlarını tanımlar.

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
npm run dev
```

## Production build ve kontroller

```bash
npm run check:legacy
npm run check:schema
npm run build
npm run check:native
npm run preview
```

- `check:legacy`: canlı, bitki ve taban sayılarıyla canlı kimliği tekrarlarını kontrol eder.
- `check:schema`: 620 kaydın alan tiplerini, zorunlu değerlerini, bütün kimliklerini ve sayısal aralıklarını ortak JSON Schema ile doğrular.
- `build`: başlamadan önce şema kontrolünü otomatik olarak yeniden çalıştırır.
- `check:native`: production paketinde eski runtime yükleyicisi, Babel standalone, gzip açıcı veya `eval` bulunmadığını doğrular.
- Build çıktısı `dist/` klasörüne yazılır.
- GitHub Pages taban yolu `/akvaryum/` olarak ayarlanmıştır.

## Plan

Geliştirme sırası ve görev durumları `docs/plans/AKVARYUM_GELISTIRME_IS_PLANI/` altında tutulur.
