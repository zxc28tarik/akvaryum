# AKVARYUM Geliştirme İş Planı

**Plan sürümü:** 1.0  
**Kaynak inceleme tarihi:** 16 Temmuz 2026  
**Hedef depo:** `zxc28tarik/akvaryum`

## Bu paketin amacı

Bu klasör, AKVARYUM sitesini yalnızca daha fazla balık eklenen bir liste olmaktan çıkarıp güvenilir, genişletilebilir ve test edilebilir bir **akvaryum planlama ve uyumluluk platformuna** dönüştürmek için ana çalışma kaynağıdır.

Plan şu işleri birlikte ele alır:

1. Balık, omurgasız, mercan, bitki, kum/taban ve ekipman verilerini büyütmek.
2. Verilerin doğruluğunu, kaynağını ve güncelliğini takip etmek.
3. Uyumluluk motorunu basit genellemelerden açıklanabilir kurallara taşımak.
4. Arama, karşılaştırma, kayıt, paylaşım ve mobil kullanım özelliklerini geliştirmek.
5. Mevcut tek sayfalık yapıyı sürdürülebilir bir React/TypeScript projesine dönüştürmek.
6. Test, performans, erişilebilirlik, SEO ve yayınlama sürecini kurmak.

## Mevcut doğrulanmış başlangıç noktası

| Alan | Mevcut sayı |
|---|---:|
| Tatlı su canlı kaydı | 278 |
| Tuzlu su canlı kaydı | 302 |
| Toplam canlı kaydı | 580 |
| Tatlı su bitkisi | 26 |
| Kum / taban malzemesi | 8 |
| Hazır tank ölçüsü | 6 |
| Desteklenen dil | Türkçe + İngilizce |

> Not: “Canlı” sayısı balıklarla birlikte karides, salyangoz, yengeç, mercan ve bazı diğer omurgasızları da içerir. Mevcut veri yapısında bunları kesin kategorilere ayıran ortak bir `entityType/category` alanı yoktur. İlk veri işi bu ayrımı eklemektir.

## Belgelerin kullanım sırası

1. `01_MEVCUT_DURUM_VE_BOSLUK_ANALIZI.md`
2. `02_ANA_YOL_HARITASI.md`
3. `05_VERI_MODELI_VE_KODLANACAK_ALANLAR.md`
4. `12_ONCELIKLI_BACKLOG.md`
5. Yapılan işe göre ilgili uzmanlık belgesi
6. Her görev için `14_GOREV_SABLONLARI_VE_KABUL_KRITERLERI.md`

## Projede çalışma kuralı

Her yeni iş aşağıdaki sırayla ilerlemelidir:

1. Bir görev kimliği seçilir veya oluşturulur: `AKV-DATA-001`, `AKV-ENG-001` gibi.
2. Kapsam ve kabul kriterleri yazılır.
3. Veri alanı veya kod sözleşmesi kontrol edilir.
4. Kod/veri değişikliği yapılır.
5. Otomatik doğrulama ve ilgili testler çalıştırılır.
6. Değişiklik kaynağı, tarih ve karar notuyla kaydedilir.
7. Tamamlanan görev backlog’da `DONE` yapılır.

## Belge önceliği

Birbiriyle çelişen karar olursa öncelik sırası:

1. Son tarihli açık karar kaydı
2. Veri modeli ve kod sözleşmesi
3. Ana yol haritası
4. Uzmanlık planları
5. Backlog ve sprint planı

## Durum etiketleri

- `TODO`: Henüz başlanmadı.
- `READY`: Kapsamı ve kabul kriteri net.
- `IN_PROGRESS`: Aktif çalışma var.
- `BLOCKED`: Dış karar/veri bekliyor.
- `REVIEW`: Kod veya içerik incelemesinde.
- `DONE`: Kabul kriterleri tamamlandı.
- `REMOVED`: Bilinçli olarak kapsamdan çıkarıldı.

## İlk yapılacak iş

Doğrudan yeni yüzlerce canlı eklemeye başlanmamalıdır. Önce:

1. Veri modeli ayrıştırılmalı.
2. Veri doğrulayıcı kurulmalı.
3. Mevcut 580 kayıt doğrulayıcıdan geçirilmelidir.
4. Ardından 20–25 kayıtlık kontrollü partilerle veri genişletilmelidir.

Bu sıra, yanlış verilerin büyüyerek projeye yerleşmesini engeller.
