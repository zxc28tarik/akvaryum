# AKV-TEST-010A — İlk 25 Altın Motor Senaryosu

**Tarih:** 20 Temmuz 2026  
**Durum:** Tamamlandı

## Amaç

Motorun mevcut sonuçlarını yalnız tek tek kural testleriyle değil, gerçek kurulum benzeri bütün senaryolarla sabitlemek.

Her altın senaryo şu bilgileri birlikte doğrular:

- üretilen kritik sorunların sırası ve `ruleId` değerleri;
- uyarıların sırası ve `ruleId` değerleri;
- önerilerin sırası ve `ruleId` değerleri;
- ikili uyumluluk sonuçlarının sırası;
- ortak pH, sıcaklık ve GH aralıkları;
- skor ve karar;
- gerekli hacim ve biyolojik yük yüzdesi;
- toplam birey ve tür sayısı;
- ekipman kural sırası ile Türkçe/İngilizce başlıklar.

## Senaryo paketi

İlk paket toplam **25 senaryodan** oluşur:

- 23 analiz senaryosu;
- 2 ekipman senaryosu.

### Temel ve kapasite

1. Boş seçim
2. Tek sağlıklı canlı
3. Su tipi uyumsuzluğu
4. Toplam tank kapasitesinin aşılması
5. Tek tür minimum hacminin aşılması
6. Yüzde 85 üzeri kapasite uyarısı
7. Yüzde 40 altı boş kapasite önerisi

### Sosyal ve ikili davranış

8. Minimum sürü sayısının altında kalma
9. Minimum sürü sayısına eşit olma
10. Uyumlu tür çifti
11. pH uyumsuz tür çifti
12. Sıcaklık uyumsuz tür çifti
13. GH uyumsuz tür çifti
14. İlk türün ikinci türü avlayabilmesi
15. İkinci türün ilk türü avlayabilmesi
16. Yüzgeç çekiştirme riski
17. Agresif ve barışçıl tür uyarısı

### Habitat ve canlı güvenliği

18. Bitki zarar riski
19. CO₂ önerisi
20. Taban ile su tipi uyumsuzluğu
21. Üç türde ortak pH bulunmaması
22. pH, sıcaklık ve GH'nin aynı anda çakışmaması
23. Resif güvenli olmayan canlı

### Ekipman

24. Bitkili tatlı su ekipmanları
25. İngilizce tuzlu su ekipmanları

## Kural kapsamı

Senaryolar Engine Finding v1 içindeki **27 kural kimliğinin tamamını** en az bir kez üretir.

Toplam doğrulanan bulgu sayısı **105**'tir.

- Kritik bulgu içeren senaryo: 10
- Uyarı içeren senaryo: 8
- Bilgi/öneri içeren senaryo: 19

İkili uyumluluk kayıtları da Engine Finding v1 JSON Schema ile doğrulanır.

## Dosyalar

- `scripts/lib/engine-golden-scenarios-v1.mjs`
- `scripts/lib/validate-engine-golden-scenarios.mjs`
- `scripts/check-engine-golden-scenarios.mjs`

## Otomatik kontrol

```bash
npm run check:engine-golden25
```

Kontrol:

- tam 25 senaryo bulunmasını;
- senaryo kimliklerinin benzersizliğini;
- senaryoların amaç açıklaması taşımasını;
- balık kimliği tekrarlarının bulunmamasını;
- Engine Finding v1 JSON Schema uyumunu;
- beklenen tam sonuç ile motor çıktısının aynı olmasını;
- 27 kural kimliğinin tamamının kapsanmasını doğrular.

Kontrol GitHub Actions hattına ve Vite production build başlangıcına bağlanmıştır.

Altın test başarısız olursa küçük test günlüğü yedi gün saklanan `engine-golden25-failure` artefaktı olarak yüklenir. Başarılı koşuda artefakt oluşturulmaz.

## Tespit edilen mevcut motor kusuru

Altın senaryolar hazırlanırken eski skor mantığında şu davranış görünür hale geldi:

- Kritik sorun bulunan bazı kurulumların skoru yine 65 veya üzerinde kalabiliyor.
- Motor, ayrı bir bilgi önerisi yoksa bu kurulumlara `COMPOSITION_HEALTHY` / “Güzel kompozisyon” önerisi ekleyebiliyor.

Örnekler arasında su tipi uyumsuzluğu, tek kapasite aşımı ve bazı kritik ikili uyumsuzluklar bulunur.

Bu davranış testte gizlenmedi; mevcut motor çıktısı olarak açık biçimde sabitlendi. Düzeltme ayrı `AKV-ENG-003` görevidir. Düzeltme yapıldığında ilgili altın beklentiler bilinçli olarak güncellenecektir.

## Sonuç

- Sprint 04'ün ilk 25 altın senaryo hedefi tamamlandı.
- `AKV-TEST-010` genel hedefi henüz tamamlanmadı; toplam hedef 100 senaryodur.
- Sprint 07'de senaryo sayısı 50'ye, Sprint 09'da 100'e çıkarılacaktır.
- Kök statik uygulama değiştirilmedi.
