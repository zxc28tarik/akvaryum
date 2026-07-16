# 08 — Teknik Mimari ve Migrasyon Planı

## Mevcut yapı

- Statik `index.html`
- CDN üzerinden React, ReactDOM ve Babel
- Tarayıcıda JSX derleme
- Büyük kaynakların gzip + base64 olarak açılması
- Dinamik kaynak çalıştırma
- Verilerin JavaScript dosyalarında tanımlanması
- Otomatik build/test hattı bulunmaması

Bu yapı prototipi çalıştırır; uzun vadede veri ve özellik büyümesine uygun değildir.

## Hedef yapı

- Vite
- React
- TypeScript
- ES modülleri
- JSON/TS veri dosyaları
- Zod veya JSON Schema doğrulaması
- Vitest
- React Testing Library
- Playwright
- ESLint + Prettier
- GitHub Actions

## Migrasyon ilkesi

Tek seferde tüm sistemi yeniden yazmak yerine çalışan uygulama korunarak aşamalı geçiş yapılmalıdır.

## Aşama A — Kaynakları normalleştir

1. Sıkıştırılmış runtime dosyalarını gerçek kaynak dosyalarına çıkar.
2. `eval` ve tarayıcı içi gzip açma ihtiyacını kaldır.
3. Mevcut davranışı değiştirmeden Vite projesi kur.
4. CDN React/Babel bağımlılığını npm paketlerine geçir.
5. GitHub Pages için doğru `base` yapılandırmasını ekle.

### Kabul kriteri

- Yeni build eski uygulamanın ana akışını aynı şekilde çalıştırır.
- Üretim çıktısında Babel standalone ve `eval` yoktur.

## Aşama B — Modüllere ayır

Önerilen yapı:

```text
src/
  app/
  components/
  features/
    wizard/
    catalog/
    comparison/
    results/
  engine/
    rules/
    scoring/
    recommendations/
  data/
  schemas/
  i18n/
  styles/
  tests/
```

Global `window.DB`, `window.Engine`, `window.UI` kullanımı kaldırılmalıdır.

## Aşama C — TypeScript

Önce veri ve motor dosyaları TypeScript’e geçirilmelidir; arayüz sonra gelebilir.

Sıra:

1. Ortak tipler
2. Veri modelleri
3. Motor giriş/çıkışları
4. Kural sistemi
5. React props ve state
6. Yardımcı fonksiyonlar

`any` kalıcı çözüm olarak kullanılmamalıdır.

## Aşama D — Veri ayrıştırma

- Canlı verileri kategori dosyalarına ayrılır.
- Şema doğrulama build sırasında çalışır.
- Kaynak kimlikleri ayrı dosyada tutulur.
- Otomatik indeks/arama verisi build sırasında üretilir.
- Veri sürümü uygulama sürümünden bağımsız tutulur.

## Aşama E — Durum yönetimi

İlk aşamada React Context + reducer yeterlidir.

Durum bölümleri:

- Kullanıcı dili
- Aktif kurulum
- Katalog filtreleri
- Kaydedilmiş kurulumlar
- UI tercihleri

Gereksiz büyük bir state kütüphanesi başlangıçta eklenmemelidir.

## Aşama F — Rotalama

Ayrıntı sayfaları için React Router veya statik sayfa üretimi kullanılabilir.

Önerilen rotalar:

```text
/
/builder
/catalog
/inhabitants/:id
/plants/:id
/substrates/:id
/compare
/setup/:shareId
/guides/:slug
```

## Aşama G — Yayın

- Preview deploy: her PR
- Production deploy: `main`
- Veri doğrulama hatasında deploy durmalı
- Lighthouse ve E2E kritik hatasında deploy durmalı

## Bağımlılık kuralı

Yeni paket eklenmeden önce:

- Gerçek ihtiyaç yazılır.
- Paket boyutu ve bakım durumu kontrol edilir.
- Yerel basit çözümün yeterli olup olmadığı değerlendirilir.
- Lisans kaydedilir.

## Migrasyon sırasında korunacak sözleşmeler

- Mevcut canlı `id` değerleri
- Paylaşılmış URL varsa uyumluluğu
- Türkçe/İngilizce ana metinler
- Mevcut tank oluşturma akışı
- Mevcut temel motor sonuçları; bilinçli değişiklikler changelog’da belirtilir
