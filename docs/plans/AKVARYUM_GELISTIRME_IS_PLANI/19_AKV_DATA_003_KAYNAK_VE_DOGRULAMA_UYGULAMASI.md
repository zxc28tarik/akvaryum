# AKV-DATA-003 — Kaynak ve Doğrulama Modeli

**Tarih:** 18 Temmuz 2026  
**Durum:** Tamamlandı

## Amaç

Her veri kaydının hangi kaynaklara dayandığını, hangi alanın hangi kaynak tarafından desteklendiğini ve kaydın doğrulama düzeyini makine tarafından denetlenebilir hale getirmek.

## Eklenen dosyalar

```text
data/sources/source-catalog.json
schemas/source-provenance.schema.json
scripts/lib/source-provenance.mjs
scripts/lib/validate-source-provenance.mjs
scripts/check-source-provenance.mjs
```

## Kaynak kataloğu

İlk katalog 8 kayıt içerir:

- Eski tatlı su veri dosyası
- Eski tuzlu su veri dosyası
- Eski bitki veri bölümü
- Eski taban malzemesi veri bölümü
- Eski tank ölçüsü veri bölümü
- Grup başlığına dayalı sınıflandırma kuralı
- Bilimsel addan cins çıkarma kuralı
- Cins-aile geçiş eşleme tablosu

Eski veri kaynakları `internal_legacy`, otomatik üretilen alanlar `derived` olarak işaretlenir. Bunlar dış kaynak doğrulaması yerine geçmez.

## Kayıt düzeyinde eklenen alanlar

Her kayıt şu alanları taşıyabilir:

```js
{
  sourceIds: ['legacy-fresh-dataset-v1'],
  fieldSourceIds: {
    core: ['legacy-fresh-dataset-v1'],
    category: ['classification-heading-rules-v1']
  },
  verification: {
    status: 'needs_review',
    confidence: 'low'
  }
}
```

Canlı kayıtlarında temel veri, sınıflandırma, cins ve aile ayrı kaynak kimliklerine bağlanır. Bitki, taban ve tank ölçüleri kendi eski veri kaynağına bağlanır.

## Doğrulama kuralları

`npm run check:sources` şu kontrolleri çalıştırır:

- Kaynak kimlikleri benzersiz olmalıdır.
- Her kayıt en az bir kaynak kimliği taşımalıdır.
- Kayıttaki her kaynak kimliği katalogda bulunmalıdır.
- Alan bazlı kaynak kimliği, kaydın genel `sourceIds` listesinde de bulunmalıdır.
- Kaynak, bağlandığı alanı `fields` listesinde desteklediğini bildirmelidir.
- `verified` durumundaki kayıt yalnız `verified` kaynaklara bağlanabilir.
- Aynı koleksiyonda aynı kayıt için iki kaynak kaydı oluşamaz.

## Başlangıç doğrulama sonucu

```text
Kaynak: 8
Veri kaydı: 620
Alan-kaynak bağlantısı: 2.940
needs_review: 620
Çözülemeyen kaynak kimliği: 0
```

Tüm eski kayıtların `needs_review/low` durumda olması bilinçli bir karardır. Bu görev kaynak altyapısını kurar; bakım değerlerinin dış kaynaklarla gerçek doğrulaması sonraki veri partilerinde yapılacaktır.

## Build ve uygulama bağlantısı

- Kaynak doğrulaması Vite `buildStart` aşamasında çalışır.
- GitHub Actions `npm run check:sources` komutunu production build öncesinde çalıştırır.
- Vite uygulamasındaki `window.DB` verileri de `sourceIds`, `fieldSourceIds` ve `verification` alanlarını taşır.
- `window.DB.sources` kaynak kataloğunu, `window.DB.sourceCatalogVersion` katalog sürümünü içerir.

## Sonraki çalışma

`AKV-DATA-010` kapsamında balık, omurgasız ve mercan kayıtları gerçek veri dosyalarına ayrılırken kaynak kimlikleri korunacaktır. Yeni kayıtlar kaynaksız eklenemeyecektir.
