# AKV-PLANT-001 — Plant v1 Migrasyonu

**Tarih:** 20 Temmuz 2026  
**Durum:** Doğrulama aşamasında

## Amaç

Mevcut 26 tatlı su bitkisi kaydını kimlik kaybı olmadan yeni `Plant v1` modeline taşımak; eski arayüzü çalışır tutarken yeni bitki verisini production build içinde erişilebilir yapmak.

## Erişim yapısı

```js
window.DB.plants;        // Eski arayüz uyumluluğu
window.DB.aquaticPlants; // Yeni Plant v1 modeli
```

## Doğrudan korunan alanlar

- Kimlik
- Türkçe ve İngilizce ad
- Bilimsel ad
- Işık seviyesi
- Görsel büyüme biçimi
- Renk

## Dönüştürülen alanlar

- `kind` → `category`
- Eski yerleşim → `placement[]`
- `co2` → `co2Need`
- Eski zorluk → `beginner/intermediate/advanced`
- Etiketler ve iki dilli migrasyon özeti

## Açık eksik alanlar

Eski veride bulunmayan bilgiler uydurulmaz:

- Sıcaklık
- pH
- GH
- Büyüme hızı
- Besin talebi
- Kökten veya su kolonundan beslenme
- Yetişkin boy aralığı
- Çoğaltma yöntemi
- Sert zemine bağlanma

Bu alanlar `null`, `unknown` veya boş dizi olarak tutulur ve `migration.unknownFields` içinde listelenir.

## Kaynak durumu

- Eski veri kaynağı: `legacy-plant-dataset-v1`
- Dönüşüm kaynağı: `legacy-plant-migration-v1`
- Doğrulama: `needs_review`
- Güven: `low`

## Otomatik kontrol

```bash
npm run check:plants
```

Kontrol:

- 26 eski ve 26 yeni kayıt olduğunu,
- bütün kimliklerin korunduğunu,
- doğrudan alanların kaybolmadığını,
- Plant v1 JSON Schema uyumunu,
- eksik alanlara değer uydurulmadığını,
- kaynak ve alan-kaynak bağlantılarını,
- kayıtların yanlışlıkla doğrulanmış sayılmadığını denetler.

Kontrol GitHub Actions ve Vite production build başlangıcına bağlanmıştır.
