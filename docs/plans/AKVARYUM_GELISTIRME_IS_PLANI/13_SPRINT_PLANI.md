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

## Sprint 05 — Katalog ve arama

- AKV-UI-010 — kategori ve URL’de kalıcı gelişmiş filtreler tamamlandı
- AKV-UI-011 — bilimsel ad, eş ad, cins ve aile araması tamamlandı
- AKV-UI-012 — kaynak ve bakım tablosu içeren canlı ayrıntı paneli tamamlandı
- AKV-UI-001

**Mevcut çıktı:** Tümü/balık/omurgasız/mercan kategorileri, sekiz gelişmiş filtre, seçili canlı adet yönetimi, ortak/bilimsel/eş ad araması ve beş bölümlü canlı ayrıntı paneli. Katalog araması 27, ayrıntı paneli 10 odaklı senaryoyla doğrulanıyor.

**Sprint çıktısı:** Kategorili, filtrelenebilir, mobil katalog ve ayrıntı görünümü.

## Sprint 06 — Sosyal ve davranış kuralları

- AKV-DATA-013
- AKV-DATA-014
- AKV-ENG-011
- AKV-ENG-012

**Çıktı:** En popüler 100 canlı için sosyal/tank boyu verisi ve yeni kurallar.

## Sprint 07 — Tank ve biyolojik yük

- AKV-ENG-010
- AKV-ENG-013
- Yeni hesapların kritik davranışlarını koruyan gerekli senaryolar

**Çıktı:** Hacim, biyolojik yük ve davranış alanı ayrı hesaplanır.

## Sprint 08 — Resif ve omurgasız

- AKV-CORAL-001
- AKV-ENG-014
- AKV-ENG-015 için ilk 25 istisna

**Çıktı:** Mercan/omurgasız güvenliği ayrılmış resif değerlendirmesi.

## Sprint 09 — Skor ve sonuç deneyimi

- AKV-ENG-016
- AKV-UI-021
- AKV-UI-022
- Yeni skor sisteminin kritik davranışlarını koruyan gerekli senaryolar

**Çıktı:** Dört alt skorlu açıklanabilir sonuç ekranı.

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
