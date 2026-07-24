# AKV-DATA-020 — Tatlı Su Veri Partisi 2

**Durum:** Tamamlandı  
**Tarih:** 24 Temmuz 2026  
**Ana görev:** Tatlı su kataloğunu 350 kayda çıkarmak

## Sonuç

İkinci kaynaklı veri partisinde 20 yeni tatlı su balığı eklendi. Tatlı su kataloğu 298 kayıttan 318 kayda, toplam canlı kataloğu 600 kayıttan 620 kayda çıktı.

Eski 278 tatlı su kaydı ve ilk partideki 20 kayıt değiştirilmeden korundu. Yeni kayıtların kimlikleri ve bilimsel adları mevcut katalogla çakışmıyor.

## Parti kapsamı

- 5 küçük sazangil ve rasbora/danio
- 5 barb
- 5 akıntı veya kum loachu
- 5 goby ve kedibalığı

## Veri modeli

Her yeni canlı için iki bağlantılı kayıt bulunur:

1. Mevcut arayüzle uyumlu legacy kayıt.
2. Kaynak, doğrulama, tank, sosyal yapı, davranış, habitat ve bakım alanlarını taşıyan `Inhabitant v1` canonical kayıt.

Kayıtlar `reviewed/medium` durumundadır. Bilimsel ad, taksonomi, bildirilen su aralıkları ve yetişkin boyu kurumsal tür özetleriyle; bakım alanları uzman bakım profilleriyle çapraz incelendi. Tank ve sosyal düzen değerleri ihtiyatlı ürün alt sınırlarıdır; tam tür bazlı doğrulama tamamlanmış gibi gösterilmez.

## Teknik bağlantılar

- Statik `boot.js` yükleme yolu ikinci partiyi çalıştırır.
- Vite production sanal modülü iki partinin canonical kayıtlarını tek haritada birleştirir.
- Node doğrulama yükleyicisi iki partiyi aynı sırayla yükler.
- Kaynak kataloğu sürümü 11 oldu.
- `check:freshwater-batch2` toplamları, şemayı, kaynakları, kimlikleri, bilimsel adları ve üç çalışma yolunu doğrular.

## Doğrulanan toplamlar

| Alan | Sonuç |
|---|---:|
| Eski tatlı su kayıtları | 278 |
| Kaynaklı parti 1 | 20 |
| Kaynaklı parti 2 | 20 |
| Toplam tatlı su | 318 |
| Tuzlu su | 302 |
| Toplam canlı | 620 |
| Balık koleksiyonu | 507 |
| Omurgasız | 63 |
| Mercan | 50 |

## Test sonucu

GitHub Actions turunda veri envanteri, ortak şema, kaynak modeli, iki tatlı su partisi, Inhabitant migrasyonu, bitki ve taban migrasyonları, mercan profilleri, 32 temel motor senaryosu, katalog, taksonomi, production build ve native paket kontrolleri geçti.

## Kalan iş

`AKV-DATA-020` ana görevi kapanmadı.

- Hedef: 350 tatlı su kaydı
- Güncel: 318
- Kalan: 32
- Sıradaki iş: Tatlı su veri partisi 3
