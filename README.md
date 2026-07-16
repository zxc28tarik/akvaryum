# AKVARYUM

Türkçe ve İngilizce akvaryum tasarım ve uyumluluk asistanı.

## Geçiş durumu

Projenin mevcut statik sürümü kökte korunmaktadır. Yeni Vite + React yapısı `vite-app/` altında kurulmuştur. Yeni production build doğrulanıp yayınlama ayarı değiştirilene kadar kökteki canlı sürüm kaldırılmayacaktır.

## Mevcut statik sürüm

```bash
python -m http.server 8000
```

Ardından `http://localhost:8000` adresini açın.

## Yeni Vite sürümü

```bash
npm install
npm run check:legacy
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

Build çıktısı `dist/` klasörüne yazılır. GitHub Pages taban yolu `/akvaryum/` olarak ayarlanmıştır.

## Plan

Geliştirme sırası ve görev durumları `docs/plans/AKVARYUM_GELISTIRME_IS_PLANI/` altında tutulur.
