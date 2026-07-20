# AKV-SUB-001 — Substrate v1 Migrasyonu

**Tarih:** 20 Temmuz 2026  
**Durum:** Tamamlandı

## Amaç

Mevcut 8 taban malzemesi kaydını kimlik ve mevcut veri kaybı olmadan yeni `Substrate v1` modeline taşımak; eski arayüzü çalışır tutarken yeni taban verisini production build içinde erişilebilir yapmak.

## Erişim yapısı

```js
window.DB.substrates;          // Eski arayüz uyumluluğu
window.DB.aquariumSubstrates;  // Yeni Substrate v1 modeli
```

## Doğrudan korunan alanlar

- Kimlik
- Türkçe ve İngilizce ad
- Türkçe ve İngilizce açıklama
- Kullanılabildiği su türleri
- pH etkisi
- Bitki uyumu
- Görsel renk

## Kontrollü dönüştürülen alanlar

- Kimlikten taban kategorisi: `sand/gravel/soil/rock`
- Kimlikten kontrollü malzeme etiketi
- Eski `low/neutral/high` pH alanından `lower/neutral/raise`
- pH etkisinden `activeBuffering`
- Arama ve filtre etiketleri
- İki dilli özet alanı

## Açık eksik alanlar

Eski veride bulunmayan bilgiler uydurulmaz:

- Tane boyu
- Hedef pH aralığı
- KH ve GH etkisi
- Besin zenginliği
- Kazan canlılar için uygunluk
- Dip balığı güvenliği
- Keskinlik riski
- Önerilen taban kalınlığı
- Yenileme süresi
- En uygun ve kaçınılması gereken kullanım listeleri

Bu alanlar `null`, `unknown` veya boş dizi olarak tutulur ve `migration.unknownFields` içinde listelenir.

## Sonuç

```text
Eski taban kaydı:          8
Substrate v1 kaydı:        8
Korunan kimlik:            8
Karşılaştırılan alan:     72
Açık eksik alan işareti: 96
```

Kategori dağılımı:

```text
sand:   5
gravel: 1
soil:   1
rock:   1
```

pH etkisi dağılımı:

```text
lower:   1
neutral: 4
raise:   3
```

Tamponlama dağılımı:

```text
active:   4
inactive: 4
```

## Kaynak durumu

- Eski veri kaynağı: `legacy-substrate-dataset-v1`
- Dönüşüm kaynağı: `legacy-substrate-migration-v1`
- Doğrulama: `needs_review`
- Güven: `low`

## Otomatik kontrol

```bash
npm run check:substrates
```

Kontrol:

- 8 eski ve 8 yeni kayıt olduğunu,
- bütün kimliklerin korunduğunu,
- doğrudan alanların kaybolmadığını,
- Substrate v1 JSON Schema uyumunu,
- eksik alanlara değer uydurulmadığını,
- kaynak ve alan-kaynak bağlantılarını,
- kayıtların yanlışlıkla doğrulanmış sayılmadığını denetler.

Kontrol GitHub Actions ve Vite production build başlangıcına bağlanmıştır.
