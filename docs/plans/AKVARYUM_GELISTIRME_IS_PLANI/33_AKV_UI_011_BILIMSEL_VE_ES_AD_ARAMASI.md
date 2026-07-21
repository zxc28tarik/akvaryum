# AKV-UI-011 — Bilimsel ve Eş Ad Araması

**Tarih:** 21 Temmuz 2026  
**Durum:** Tamamlandı

## Amaç

Canlı kataloğundaki tek arama kutusunun yalnız Türkçe/İngilizce ortak adla sınırlı kalmamasını sağlamak.

## Aranan alanlar

Arama artık aynı anda şu alanlarda çalışır:

- Türkçe ortak ad;
- İngilizce ortak ad;
- bilimsel ad;
- eş adlar;
- cins;
- aile;
- kayıt kimliği.

Yeni model alanları:

```text
name.tr
name.en
scientificName
aliases[]
taxonomy.genus
taxonomy.family
taxonomy.acceptedName
id
```

Eski kayıt uyumluluğu için şu alanlar da korunur:

```text
nameTr
nameEn
sci
```

## Arama davranışı

- Büyük/küçük harf farkı aranmaz.
- Türkçe `ı/i` farkı normalize edilir.
- Aksan işaretleri aramayı bozmaz.
- Kısmi bilimsel ad veya yalnız cins adı sonuç getirebilir.
- Mevcut `q` URL alanı değişmeden kullanılır.
- Arama diğer kategori ve bakım filtreleriyle birlikte çalışır.

## Örnekler

```text
Paracheirodon innesi → Neon Tetra
Paracheirodon → Neon Tetra
Characidae → Neon Tetra
Yamato Shrimp → Amano Karidesi
Mavi Neon → Neon Tetra
Poecilia reticulata → legacy Lepistes kaydı
```

## Doğrulama

Katalog filtre kontrolüne altı odaklı arama senaryosu eklendi:

1. tam bilimsel ad;
2. cins;
3. aile;
4. İngilizce eş ad;
5. Türkçe eş ad;
6. eski `sci` alanı.

Bütün mevcut katalog filtreleri, temel 32 motor senaryosu, veri kontrolleri, production build ve native paket kontrolleri başarıyla geçti.

## Sonuç

- `AKV-UI-011`: **DONE**
- Arama modeli sürümü: **2**
- URL sözleşmesi değişmedi.
- Yeni ayrı arama kutusu veya yeni sayfa eklenmedi.
- Sıradaki katalog görevi: `AKV-UI-012` canlı ayrıntı paneli/sayfası.
