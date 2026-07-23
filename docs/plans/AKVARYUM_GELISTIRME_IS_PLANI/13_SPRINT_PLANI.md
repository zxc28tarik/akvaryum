# 13 — Sprint Planı

Bu plan tek geliştirici veya küçük ekip için **sıralı çalışma paketleri** olarak hazırlanmıştır. Sprint süresi ekip hızına göre belirlenebilir; önemli olan sıra ve tamamlanma ölçütüdür.

## Sprint 01 — Projeyi normal yapıya taşı

- AKV-ARCH-001
- AKV-ARCH-002
- AKV-TEST-001
- AKV-I18N-001

**Çıktı:** Vite/React build, runtime yükleyici kaldırılmış, temel doğrulamalar çalışan proje.

## Sprint 02 — Veri şeması

- AKV-DATA-001
- AKV-DATA-002
- AKV-DATA-003

**Çıktı:** Ortak şema, kategori ve kaynak modeli.

## Sprint 03 — Mevcut veri migrasyonu

- AKV-DATA-010
- AKV-DATA-011
- AKV-DATA-012
- AKV-PLANT-001
- AKV-SUB-001

**Çıktı:** Mevcut veriler yeni modelde, kayıp/tekrar raporu hazır.

## Sprint 04 — Motor düzeltmeleri

- AKV-ENG-001 — tamamlandı
- AKV-ENG-002 — tamamlandı
- AKV-TEST-010A — ilk 25 altın senaryo tamamlandı
- AKV-ENG-003 — kritik/sağlıklı mesaj çelişkisi kapatıldı
- AKV-TEST-010B — yüksek riskli 7 ek senaryo ve beta çoğulluk düzeltmesi tamamlandı

**Çıktı:** Açıklanabilir kural çıktısı, doğru parametre kesişimi, kritik sonuç koruması ve 27/27 kuralı kapsayan 32 temel motor senaryosu.

**Test politikası:** Sabit 50 veya 100 senaryo hedefi yoktur. Yeni özellik ya da gerçek hata geldiğinde yalnız onu koruyacak gerekli testler eklenir.

## Sprint 05 — Katalog ve arama — tamamlandı

- AKV-UI-010 — kategori ve URL’de kalıcı gelişmiş filtreler tamamlandı
- AKV-UI-011 — bilimsel ad, eş ad, cins ve aile araması tamamlandı
- AKV-UI-012 — kaynak ve bakım tablosu içeren canlı ayrıntı paneli tamamlandı
- AKV-UI-001 — 360 px mobil ana akış koruması tamamlandı

**Çıktı:** Tümü/balık/omurgasız/mercan kategorileri, sekiz gelişmiş filtre, seçili canlı adet yönetimi, ortak/bilimsel/eş ad araması, beş bölümlü canlı ayrıntı paneli ve 360 px mobil ana akış koruması. Katalog araması 27, ayrıntı paneli 10 ve mobil akış 7 odaklı senaryoyla doğrulanıyor.

## Sprint 06 — Sosyal ve davranış kuralları — tamamlandı

- AKV-DATA-013 — tamamlandı
- AKV-DATA-014 — tamamlandı
- AKV-ENG-011 — sürü, grup, çift, harem ve kaynaklı cinsiyet oranı kuralları tamamlandı
- AKV-ENG-012 — aynı tür ve aynı cins içindeki yakın tür agresyon kuralları tamamlandı

**Çıktı:** Motor sosyal yapı minimumlarını, çift/harem yapılarını, kaynaklı cinsiyet oranını, aynı tür çoklu birey riskini ve aynı cins yakın tür çatışmasını değerlendiriyor. Sosyal kurallar 15, agresyon kuralları 14 odaklı senaryoyla doğrulanıyor.

## Sprint 07 — Tank, biyolojik yük ve avcılık — tamamlandı

- AKV-ENG-010 — fiziksel hacim, toplamsal stok yükü ve davranış alanları ayrıldı
- AKV-ENG-013 — kaynaklı ağız genişliği, av boyu eşiği ve istisna sözleşmesi tamamlandı
- Yeni hesapların kritik davranışlarını koruyan 13 domain ve 15 avcı–av senaryosu eklendi

**Çıktı:** Hacim, biyolojik yük ve davranış ayrı hesaplanıyor. Avcı–av motoru kaynaklı profil bulunduğunda güvenli/riskli istisna ve av boyu eşiği kullanıyor; profil bulunmayan türlerde eski davranış korunuyor. Production katalog için henüz ağız ölçüsü uydurulmadı.

## Sprint 08 — Resif ve omurgasız — tamamlandı

- AKV-CORAL-001 — tamamlandı: 18 soft, 20 LPS ve 12 SPS olmak üzere 50 mercanın ışık, akıntı ve agresyon alanları dolduruldu
- AKV-ENG-014 — tamamlandı: soft/LPS/SPS ve shrimp/snail/crab/clam güvenliği ayrıldı
- AKV-ENG-015A — tamamlandı: ilk 25 kaynaklı ve doğrulanmış tür çifti istisnası production motoruna bağlandı
- AKV-ENG-015B — tamamlandı: ikinci 25 kaynaklı ve doğrulanmış tür çifti istisnası production motoruna bağlandı; AKV-ENG-015 50/50 kapandı

**Çıktı:** Soft/LPS/SPS mercan ayrımı production verisinde ışık, akıntı ve agresyon profilleriyle çalışıyor. Resif motoru yedi hedefi ayrı değerlendiriyor. İki tür çifti partisi toplam 23 uyumlu, 17 koşullu, 5 dikkat ve 5 uyumsuz kayıt içeriyor; dokuz dış kaynağa bağlı 50 kaydın tamamı `verified/medium`. `check:engine-pairs` 19 odaklı senaryoyla genel kuralın üstüne yazma sırasını ve bağımsız çevresel güvenlik kurallarının korunmasını doğruluyor.

**Sonraki iş:** Sprint 09 kapsamında `AKV-UI-021` ile hazır dört alt puanı sonuç ekranında göstermek.

## Sprint 09 — Skor ve sonuç deneyimi — devam ediyor

- AKV-ENG-016 — tamamlandı: 30/30/25/15 puan sözleşmesi ve kritik toplam üst sınırları production motoruna bağlandı
- AKV-UI-021
- AKV-UI-022
- Yeni skor sisteminin kritik davranışlarını koruyan 13 odaklı senaryo — tamamlandı

**Mevcut çıktı:** Motor `result.scoreBreakdown` altında dört alt puan, durum, ilgili kural kimlikleri, açıklama ve uygulanan kritik üst sınırları üretiyor. Çevresel kritik sonuçta toplam en fazla 39, davranışsal kritikte 49, kesin tank yetersizliğinde 59 ve kritik habitat sonucunda 69 oluyor.

**Kalan çıktı:** `AKV-UI-021` dört puanı görünür hâle getirecek; `AKV-UI-022` neden/etki/çözüm kartlarını sonuç ekranına bağlayacak.

## Sprint 10 — Veri sürümü 1

- AKV-DATA-020
- AKV-DATA-021
- AKV-PLANT-010
- AKV-SUB-010

**Çıktı:** 750 toplam canlı, 40 bitki, 15 taban hedefi.

## Sprint 11 — Karşılaştırma ve kayıt

- AKV-UI-020
- AKV-SAVE-001
- AKV-SHARE-001

**Çıktı:** Karşılaştırma, yerel kayıt ve paylaşılabilir kurulum.

## Sprint 12 — Kalite ve yayın

- AKV-CI-001
- AKV-A11Y-001
- AKV-PERF-001
- AKV-SEO-001

**Çıktı:** Otomatik kalite hattı, erişilebilirlik, performans ve indekslenebilir ayrıntı sayfaları.

## Sonraki sprint havuzu

- Acı su veri seti
- Hardscape ve ekipman veri modelleri
- 1.000 canlı hedefi
- İlk 10 rehber
- Hatalı veri bildirme
- Analitik
- Bulut kayıt/topluluk özellikleri

## Sprint kapanış kontrolü

- [ ] Tüm seçili görevler kabul kriterini karşıladı.
- [ ] Testler geçti.
- [ ] Veri doğrulama geçti.
- [ ] TR/EN içerik tamamlandı.
- [ ] Changelog güncellendi.
- [ ] Bilinen eksikler yeni göreve dönüştürüldü.
- [ ] Demo senaryosu çalıştırıldı.
