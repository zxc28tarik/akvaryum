# AKV-DATA-010 — Canlı Katalog Ayrımı

**Tarih:** 19 Temmuz 2026  
**Durum:** Tamamlandı

## Amaç

Mevcut `DB.fish` dizisinde birlikte tutulan balık, omurgasız ve mercan kayıtlarını veri kopyası üretmeden ayrı koleksiyonlar halinde erişilebilir yapmak ve bütün kayıtlar için ortak bir arama indeksi oluşturmak.

## Tek veri kaynağı ilkesi

Eski `DB.fish` dizisi geçiş süresince ana kayıt kaynağı ve uyumluluk alanı olarak korunur. Ayrı koleksiyonlar aynı nesnelere referans veren türetilmiş dizilerdir; kayıtlar üç farklı dosyada kopyalanmaz.

Bu yaklaşım:

- aynı kimliğin farklı kopyalarda sapmasını önler,
- kaynak ve doğrulama bilgisini tek yerde tutar,
- mevcut arayüzü kırmadan yeni katalog yapısına geçiş sağlar,
- `AKV-DATA-011` tam veri migrasyonuna güvenli temel oluşturur.

## Dosyalar

```text
data/catalog/
  fish.mjs
  invertebrates.mjs
  corals.mjs
  search-index.mjs
  index.mjs

scripts/
  check-inhabitant-catalog.mjs
  lib/validate-inhabitant-catalog.mjs
```

## Koleksiyonlar

Başlangıç veri seti:

```text
Balık: 467
Omurgasız: 63
Mercan: 50
Toplam: 580
```

Balık koleksiyonu:

- `freshwater_fish`
- `brackish_fish`
- `marine_fish`

Mercan koleksiyonu:

- `soft_coral`
- `lps_coral`
- `sps_coral`

Omurgasız koleksiyonu:

- `freshwater_shrimp`
- `marine_shrimp`
- `snail`
- `crab`
- `crayfish`
- `bivalve`
- `echinoderm`
- `anemone`
- `other_invertebrate`

Tanımlanmamış bir `entityType` otomatik olarak omurgasız sayılmaz; doğrulama hatası oluşturur.

## Uygulama erişimi

Production verisinde:

```js
window.DB.inhabitantCatalog = {
  version: 1,
  collections: {
    fish: [],
    invertebrates: [],
    corals: []
  },
  all: [],
  searchIndex: [],
  counts: {
    all: 580,
    fish: 467,
    invertebrates: 63,
    corals: 50
  }
};
```

`DB.fish` mevcut ekranların çalışması için korunur. Yeni katalog ve filtre geliştirmeleri `DB.inhabitantCatalog` üzerinden ilerlemelidir.

## Ortak arama indeksi

Her kayıt için hafif bir indeks satırı üretilir:

- kimlik
- ait olduğu koleksiyon
- `entityType`
- kategori
- Türkçe ad
- İngilizce ad
- bilimsel ad
- cins
- aile
- normalize edilmiş birleşik arama metni

Arama metni Türkçe karakter ve büyük/küçük harf farklarını azaltacak biçimde normalize edilir. Çok sözcüklü sorgularda bütün sözcüklerin kayıt metninde bulunması gerekir.

## Otomatik kontroller

```bash
npm run check:catalog
```

Kontrol şu durumlarda hata verir:

- toplam kayıt sayısı 580 değilse,
- balık sayısı 467 değilse,
- omurgasız sayısı 63 değilse,
- mercan sayısı 50 değilse,
- bir kayıt hiçbir koleksiyona girmiyorsa,
- bir kayıt birden fazla koleksiyona giriyorsa,
- arama indeksinde kayıt eksikse,
- kimlikler arama indeksinde benzersiz değilse,
- arama metni boşsa.

Kontrol Vite `buildStart` aşamasına ve GitHub Actions hattına bağlanmıştır.

## Sonraki görev

`AKV-DATA-011` kapsamında 580 kayıt eski alanlardan hedef ortak `Inhabitant` modeline taşınacaktır. Kimlikler, kaynak bağlantıları ve bu görevde oluşturulan koleksiyon ayrımı korunacaktır.
