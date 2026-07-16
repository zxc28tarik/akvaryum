# AKVARYUM Veri Şeması Uygulama Notu

**Görev:** AKV-DATA-001  
**Tarih:** 16 Temmuz 2026  
**Durum:** Tamamlandı

## Tek kaynak

Projenin ortak veri sözleşmesi:

```text
schemas/akvaryum.schema.json
```

Şema JSON Schema Draft 2020-12 biçimindedir ve Ajv ile doğrulanır.

## Şemada bulunan hedef modeller

- `baseEntity`: bütün veri varlıklarının ortak alanları
- `sourceRef`: alan bazlı kaynak kaydı
- `inhabitant`: balık, omurgasız, anemon ve mercan hedef modeli
- `plant`: su bitkisi hedef modeli
- `substrate`: kum ve taban malzemesi hedef modeli

Hedef ortak alanlar arasında kalıcı `id`, durum, iki dilli ad ve özet, `entityType`, kategori, etiketler, kaynaklar, güven düzeyi ve veri sürümü bulunur.

## Geçiş modelleri

Mevcut uygulamanın 580 canlı, 26 bitki, 8 taban ve 6 tank ölçüsü henüz hedef modele topluca dönüştürülmedi. Canlı siteyi bozmamak için aynı şemada şu geçiş tanımları bulunur:

- `legacyFish`
- `legacyPlant`
- `legacySubstrate`
- `legacyTankPreset`

Bu tanımlar mevcut alanları sıkı biçimde doğrular. Bilinmeyen ek alanlar kabul edilmez.

## Otomatik kontroller

```bash
npm run check:schema
```

Kontrol şunları denetler:

- Kimlik yalnız küçük harf, sayı ve tire içerir.
- Bütün koleksiyonlarda kimlikler benzersizdir.
- Türkçe ve İngilizce zorunlu metinler boştur bırakılamaz.
- Sayı ve enum alanları doğru türde olmalıdır.
- Hacim, boyut ve tank ölçüleri sıfırdan büyük olmalıdır.
- Tuzlu su canlılarında tuzluluk aralığı zorunludur.
- Aralıkların alt değeri üst değerden büyük olamaz.
- Şemada tanımlanmayan alanlar reddedilir.

## Build ve CI bağlantısı

- Vite, `buildStart` aşamasında veri şemasını otomatik çalıştırır.
- GitHub Actions, envanter kontrolünden sonra `npm run check:schema` çalıştırır.
- Şema hatası varsa production build durur.

## Doğrulanan başlangıç durumu

```text
Canlı: 580
Bitki: 26
Taban: 8
Tank ölçüsü: 6
Toplam kayıt: 620
Tekrarlanan kimlik: 0
Bozuk aralık: 0
```

## Sonraki görev

`AKV-DATA-002` kapsamında mevcut 580 canlıya `entityType`, `category` ve taksonomi/aile alanları kontrollü biçimde eklenecek. Bilinmeyen aile veya kategori değerleri tahmin edilmeyecek; açıkça `needs_update` sürecine bırakılacak.
