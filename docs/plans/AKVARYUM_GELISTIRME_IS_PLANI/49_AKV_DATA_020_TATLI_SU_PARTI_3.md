# AKV-DATA-020 — Tatlı Su Veri Partisi 3

**Durum:** Kod ve doğrulama aşamasında  
**Tarih:** 24 Temmuz 2026

## Kapsam

Tatlı su kataloğuna üçüncü kaynaklı veri partisi olarak 16 yeni kayıt eklenmiştir:

- 4 mavi-göz / rainbowfish türü
- 4 nano sazangil
- 4 küçük barb ve benzeri sazangil
- 4 akıntı goby/loach türü

## Veri ilkeleri

- Eski 278 tatlı su kaydı değiştirilmeden korunur.
- İlk iki partinin 40 kaydı korunur.
- Yeni kayıtlar ayrı legacy ve `Inhabitant v1` biçiminde tutulur.
- Bilimsel ad, taksonomi ve bildirilen boy alanları FishBase kayıtlarıyla incelenir.
- Tank, sosyal düzen ve bakım değerleri kesin bilimsel ölçüm değil, ihtiyatlı ürün alt sınırlarıdır.
- Bu nedenle kayıtlar `reviewed/medium` durumunda kalır.

## Beklenen envanter

- Tatlı su: 334
- Tuzlu su: 302
- Toplam canlı: 636
- AKV-DATA-020 ilerlemesi: 334/350
- Kalan: 16 kayıt

## Doğrulama

`check:freshwater-batch3` şu durumları denetler:

- 16 legacy ve 16 canonical kayıt
- Önceki partilerle kimlik çakışmaması
- Mevcut katalogla bilimsel ad çakışmaması
- `Inhabitant v1` şema uyumu
- Kaynak ve alan-kaynak bağlantıları
- Statik, Vite production ve Node yükleme yolları
- 278 eski tatlı su kaydının korunması

Bu belge, GitHub Actions doğrulaması tamamlandıktan sonra nihai sonuçla güncellenecektir.
