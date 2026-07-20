# 12 — Öncelikli Backlog

## P0 — Temel ve hata önleme

| Kimlik | Durum | Görev | Bağımlılık | Kabul özeti |
|---|---|---|---|---|
| AKV-ARCH-001 | REVIEW | Vite + React proje iskeleti kur | Yok | Mevcut ana akış production build’de çalışır |
| AKV-ARCH-002 | DONE | Runtime gzip/eval yükleyicisini kaldır | ARCH-001 | Üretimde `eval` ve Babel standalone yok |
| AKV-TEST-001 | REVIEW | Veri envanter testi oluştur | Yok | Sayılar ve benzersiz kimlikler doğrulanır |
| AKV-DATA-001 | DONE | Ortak veri şeması oluştur | ARCH-001 | Şema build sırasında çalışır |
| AKV-DATA-002 | DONE | `entityType/category/family` alanlarını ekle | DATA-001 | 580 kayıt kategorilenir |
| AKV-DATA-003 | DONE | Kaynak ve doğrulama modeli ekle | DATA-001 | Kayıtlar kaynak kimliği taşıyabilir |
| AKV-ENG-001 | READY | Parametre ortak aralık hatasını düzelt | TEST-001 | Çakışma yoksa sonuç `null` ve kritik sorun |
| AKV-ENG-002 | READY | Kural çıktı tipini standartlaştır | DATA-001 | Her sonuç `ruleId/severity/resolution` taşır |
| AKV-I18N-001 | TODO | TR/EN anahtar bütünlüğü testi | TEST-001 | Eksik veya fazla anahtar CI’da hata verir |
| AKV-UI-001 | TODO | Mobil ana akış duman testi ve düzeltme | ARCH-001 | 360 px genişlikte taşma yok |

### Aktif çalışma notu — 20 Temmuz 2026

- `vite-app/` altında Vite + React geçiş yapısı kuruldu; kökteki mevcut statik sürüm korunuyor.
- `AKV-ARCH-002` tamamlandı: production paketinden tarayıcı içi Babel, `eval`, `DecompressionStream` ve runtime `.gz.b64` yükleme kaldırıldı.
- `AKV-DATA-001` tamamlandı: ortak JSON Schema, build başlangıcı ve GitHub Actions doğrulaması kuruldu.
- `AKV-DATA-002` tamamlandı: 580 canlı kaydı `entityType`, kontrollü `category` ve `taxonomy` alanlarıyla zenginleştirildi.
- Sınıflandırma sonucu: 256 tatlı su balığı, 211 deniz balığı ve 113 omurgasız/mercan kaydı.
- 580 kaydın tamamında aile alanı var; aileler dış kaynak doğrulaması tamamlanana kadar `inferred` durumunda tutuluyor.
- 579 kaydın cinsi bilimsel addan çıkarıldı. Yapay melez `flowerhorn` kaydı `needs_review` olarak işaretlendi.
- `AKV-DATA-003` tamamlandı: kaynak kataloğu ve ayrı kaynak/doğrulama JSON Schema eklendi.
- Eski kayıtların tamamı bilinçli olarak `needs_review/low` durumda; dış doğrulama yapılmadan hiçbir kayıt `verified` sayılmıyor.
- `AKV-DATA-010` tamamlandı: canlılar balık, omurgasız ve mercan koleksiyonlarına ayrıldı; 580 benzersiz kayıt ortak arama indeksinde bulunuyor.
- `AKV-DATA-011` tamamlandı: 580 legacy kayıt `Inhabitant v1` modeline kimlik değiştirmeden taşındı.
- Yeni ana erişim `DB.inhabitants`; `DB.fish` yalnız eski ekran uyumluluğu için korunuyor.
- Adlar, bilimsel adlar, su aralıkları, boy, tank hacmi ve bütün eski kaynak kimlikleri birebir kayıp testinden geçti.
- `AKV-DATA-012` tamamlandı: kimlik, bilimsel ad, ortak ad, açık nomenklatür ve cins-aile iç tutarlılığı tarandı; 28 inceleme bulgusu rapora bağlandı.
- `AKV-DATA-013` tamamlandı: legacy katalog sırasındaki ilk 100 kayıt ürün öncelik seti olarak sabitlendi.
- İlk 100 kaydın `social.territoriality` ve `care.difficulty` alanları mevcut tank, boy, mizaç, beslenme, su aralığı ve grup kısıtlarından türetildi.
- Zorluk dağılımı 69 beginner, 18 intermediate, 5 advanced ve 8 expert; bölgesellik dağılımı 72 none, 19 medium ve 9 high.
- `AKV-DATA-014` tamamlandı: ilk 100 kaydın `tank.minLengthCm` alanı hacim ve vücut/yüzme alt sınırlarının büyüğüyle türetildi.
- Tank uzunluğu dağılımında 49 kayıt 75 cm, 12 kayıt 90 cm, 12 kayıt 100 cm; en büyük sonuç 60 cm pacu için 300 cm oldu.
- 81 kayıtta hacim, 13 kayıtta vücut/yüzme alanı belirleyici oldu; 6 kayıtta iki sınır eşitti.
- Sosyal bakım ve tank uzunluğu değerleri tür bazlı dış kaynak doğrulaması değildir; kayıtlar `needs_review/low` durumunda tutuluyor.
- `npm run check:priority100` ve `npm run check:tanklength100` bağımsız komutlara, GitHub Actions hattına ve Vite production build başlangıcına bağlandı.
- Tarayıcı duman testi çalışma ortamının yerel adresleri engellemesi nedeniyle dışarıdan doğrulanamadı; `AKV-ARCH-001` ve `AKV-TEST-001` hâlâ `REVIEW` durumunda.

## P1 — Veri modeli ve katalog

| Kimlik | Durum | Görev | Bağımlılık | Kabul özeti |
|---|---|---|---|---|
| AKV-DATA-010 | DONE | Balık/omurgasız/mercan dosyalarını ayır | DATA-002 | Ayrı koleksiyonlar, ortak arama indeksi |
| AKV-DATA-011 | DONE | Mevcut 580 kaydı yeni modele migrate et | DATA-010 | Kimlikler korunur, kayıp kayıt yok |
| AKV-DATA-012 | DONE | Bilimsel ad/kimlik tekrar denetimi | DATA-011 | Rapor ve çözüm listesi oluşur |
| AKV-DATA-013 | DONE | Zorluk ve sosyal yapı alanlarını doldurma partisi 1 | DATA-011 | İlk ürün öncelik setindeki 100 kayıt tamamlanır |
| AKV-DATA-014 | DONE | Tank uzunluğu alanını doldurma partisi 1 | DATA-011 | İlk ürün öncelik setindeki 100 kayıt tamamlanır |
| AKV-PLANT-001 | READY | Bitki şemasını oluştur | DATA-001 | 26 bitki migrate edilir |
| AKV-SUB-001 | READY | Taban şemasını oluştur | DATA-001 | 8 taban migrate edilir |
| AKV-UI-010 | READY | Kategori ve gelişmiş filtreler | DATA-002 | URL’de korunabilen filtreler |
| AKV-UI-011 | READY | Bilimsel/eş ad araması | DATA-011 | Türkçe/İngilizce/bilimsel arama çalışır |
| AKV-UI-012 | READY | Canlı ayrıntı paneli/sayfası | DATA-011 | Kaynak ve bakım tablosu görünür |

## P1 — Motor 2.0 çekirdeği

| Kimlik | Durum | Görev | Bağımlılık | Kabul özeti |
|---|---|---|---|---|
| AKV-ENG-010 | READY | Hacim, biyolojik yük ve davranış alanını ayır | DATA-011 | Üç bağımsız sonuç hesaplanır |
| AKV-ENG-011 | READY | Sürü/çift/harem/cinsiyet kuralları | DATA-013 | Sosyal yapı testleri geçer |
| AKV-ENG-012 | READY | Aynı tür ve yakın tür agresyonu | DATA-013 | Conspecific kuralları veri tabanlıdır |
| AKV-ENG-013 | READY | Avcı-av modeli | DATA-011 | Ağız boyu + canlı boyu + istisna kullanır |
| AKV-ENG-014 | READY | Omurgasız ve mercan güvenliği ayrımı | DATA-010 | Soft/LPS/SPS ve shrimp/snail ayrı değerlendirilir |
| AKV-ENG-015 | READY | Tür çifti istisna tablosu | DATA-003 | En az 50 doğrulanmış istisna |
| AKV-ENG-016 | TODO | Yeni alt skor sistemi | ENG-010..015 | Dört alt puan ve açıklama |
| AKV-TEST-010 | TODO | 100 altın motor senaryosu | ENG-002 | Tüm senaryolar CI’da çalışır |

## P2 — Veri büyümesi

| Kimlik | Durum | Görev | Bağımlılık | Kabul özeti |
|---|---|---|---|---|
| AKV-DATA-020 | TODO | Tatlı su veri partileriyle 350 kayda çık | DATA-011 | Partiler kaynaklı ve doğrulanmış |
| AKV-DATA-021 | TODO | Tuzlu su veri partileriyle 400 kayda çık | DATA-011 | Partiler kaynaklı ve doğrulanmış |
| AKV-DATA-022 | TODO | Acı su kategorisi ilk 30 kayıt | DATA-002 | Ayrı su tipi kuralları |
| AKV-CORAL-001 | READY | Mercanları soft/LPS/SPS ayır | DATA-010 | Işık/akıntı/agresyon alanları dolu |
| AKV-INVERT-001 | READY | Temizlik ekibi veri partisi | DATA-010 | En az 50 omurgasız profili |
| AKV-PLANT-010 | TODO | Bitki sayısını 40’a çıkar | PLANT-001 | 14 yeni kaynaklı kayıt |
| AKV-SUB-010 | TODO | Taban sayısını 15’e çıkar | SUB-001 | 7 yeni kaynaklı profil |
| AKV-HARD-001 | TODO | Hardscape şeması ve ilk 20 kayıt | DATA-001 | Kimya ve güvenlik alanları |

## P2 — Ürün özellikleri

| Kimlik | Durum | Görev | Bağımlılık | Kabul özeti |
|---|---|---|---|---|
| AKV-UI-020 | TODO | 2–4 canlı karşılaştırma | UI-012 | Ortak aralık ve farklar görünür |
| AKV-SAVE-001 | TODO | Yerel kurulum kaydı | ARCH-001 | Adlandır, aç, kopyala, sil |
| AKV-SHARE-001 | TODO | Paylaşılabilir kurulum URL’si | SAVE-001 | Şema doğrulamalı URL |
| AKV-UI-021 | TODO | Sonuç alt skorları | ENG-016 | 4 bölüm puanı görünür |
| AKV-UI-022 | TODO | Neden/etki/çözüm kartları | ENG-002 | Her uyarıda standart çıktı |
| AKV-A11Y-001 | TODO | WCAG AA ana akış | UI-001 | Axe + klavye kontrolleri geçer |

## P3 — Üretim ve büyüme

| Kimlik | Durum | Görev | Bağımlılık | Kabul özeti |
|---|---|---|---|---|
| AKV-CI-001 | TODO | GitHub Actions kalite hattı | ARCH-001 | Test/build/veri kontrolü zorunlu |
| AKV-PERF-001 | READY | Paket ve render performans bütçesi | ARCH-002 | Bütçe aşımı CI uyarısı/hatası |
| AKV-SEO-001 | TODO | Canlı ayrıntı sayfalarının indekslenmesi | UI-012 | Canonical, meta, sitemap |
| AKV-SEO-002 | TODO | İlk 10 rehber içeriği | SEO-001 | Kaynaklı ve iki dilli plan |
| AKV-FEED-001 | READY | Hatalı veri bildirme akışı | DATA-003 | Alan ve kaynakla bildirim |
| AKV-AN-001 | TODO | Gizlilik dostu ürün analitiği | UI-020 | Kişisel veri olmadan olaylar |

## Öncelik kuralı

- P0 bitmeden toplu veri ekleme yapılmaz.
- P1 veri modeli bitmeden 750 kayıt hedefi başlanmaz.
- Motor altın testleri olmadan skor sistemi yayınlanmaz.
- SEO sayfaları kaynak modeli olmadan yayınlanmaz.
