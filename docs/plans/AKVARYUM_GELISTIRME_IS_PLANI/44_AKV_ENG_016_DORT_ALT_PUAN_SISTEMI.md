# AKV-ENG-016 — Dört Alt Puan Sistemi

**Durum:** Tamamlandı  
**Tarih:** 23 Temmuz 2026  
**Bağımlılıklar:** AKV-ENG-010, AKV-ENG-011, AKV-ENG-012, AKV-ENG-013, AKV-ENG-014, AKV-ENG-015

## Amaç

Eski tek genel puanı, kullanıcının sorunun hangi alandan kaynaklandığını anlayabileceği dört açıklanabilir bölüme ayırmak ve kritik güvenlik sorunlarının yüksek toplam puanın arkasında saklanmasını engellemek.

## Uygulanan puan sözleşmesi

| Bölüm | En fazla | Kapsam |
|---|---:|---|
| Çevresel uyum | 30 | Su tipi, pH, sıcaklık ve GH ortak aralığı |
| Davranış ve sosyal uyum | 30 | Sürü/çift/harem, agresyon, avcılık ve tür çifti istisnaları |
| Tank ve biyolojik yük | 25 | Tür minimum hacmi, tank uzunluğu ve toplamsal stok yükü |
| Habitat ve bakım uyumu | 15 | Bitki, taban, mercan ve omurgasız güvenliği |
| **Toplam** | **100** | Dört bölümün toplamı |

Motor sonucu `result.scoreBreakdown` alanında şu bilgileri taşır:

- dört bölümün puanı ve üst sınırı;
- `good`, `warning`, `critical` veya `not_evaluated` durumu;
- kritik ve uyarı sayıları;
- puanı etkileyen kural kimlikleri;
- seçili dile göre Türkçe veya İngilizce bölüm adı ve kısa açıklama;
- üst sınır uygulanmadan önceki toplam;
- uygulanan kritik toplam üst sınırı ve nedeni.

Eski `result.score` ve `result.verdict` alanları arayüz uyumluluğu için korunmuştur; artık dört alt puanın güvenlik üst sınırlarından geçen sonucunu taşır.

## Kritik güvenlik sınırları

| Kritik bölüm | Bölüm puanı | Genel puan üst sınırı |
|---|---:|---:|
| Çevresel uyum | 0 | 39 |
| Davranış ve sosyal uyum | 0 | 49 |
| Tank ve biyolojik yük | 0 | 59 |
| Habitat ve bakım uyumu | 0 | 69 |

Birden fazla kritik bölüm varsa en düşük üst sınır uygulanır. Kritik sonuç veya 65 altı genel puan bulunduğunda `COMPOSITION_HEALTHY` önerisi kaldırılır.

Uyarılar bölümü tamamen sıfırlamaz:

- çevresel uyarı başına 5 puan;
- davranış/sosyal uyarı başına 6 puan;
- tank uyarısında 7 puan;
- habitat/bakım uyarısı başına 4 puan düşer.

Tank hacmi değerlendirilmemişse tank bölümü `not_evaluated` ve 0 puandır. Boş canlı seçiminde bütün bölümler değerlendirilmemiş, genel puan 0 olur.

## Kod bağlantıları

- `engine-score-breakdown.js`: dört bölüm sınıflandırması, puan hesabı, açıklamalar ve kritik üst sınırlar.
- `scripts/lib/validate-engine-score-breakdown.mjs`: sentetik sınır senaryoları ve production bağlantı denetimi.
- `scripts/check-engine-score-breakdown.mjs`: bağımsız kontrol komutu.
- `boot.js`: kök statik çalışma yolunda motor katmanının yüklenmesi.
- `vite.config.js`: Vite production motoruna ekleme ve build başlangıcı doğrulaması.
- `.github/workflows/vite-verify.yml`: GitHub Actions kalite adımı.

## Doğrulama sonucu

`npm run check:engine-scores` içindeki 13 odaklı senaryo şunları doğrular:

1. 30 + 30 + 25 + 15 = 100 bölüm sözleşmesi;
2. boş seçimde 0 ve değerlendirilmemiş bölümler;
3. sağlıklı kurulumda 100/100;
4. yanlış su tipinde çevre puanı 0 ve genel üst sınır 39;
5. pH ortak aralığı olmadığında sorunun davranış bölümüne sızmaması;
6. kesin tank yetersizliğinde tank puanı 0 ve genel üst sınır 59;
7. avcı–av kritik sonucunda davranış puanı 0 ve genel üst sınır 49;
8. sosyal yapı uyarısının yalnız davranış puanını düşürmesi;
9. sınırdaki tank yükünün yalnız tank puanını düşürmesi;
10. bitki zarar riskinin yalnız habitat puanını düşürmesi;
11. tank hacmi yoksa tank bölümünün değerlendirilmemesi;
12. İngilizce ad, açıklama ve kritik üst sınır nedeni;
13. kök statik, Vite production ve GitHub Actions bağlantıları.

Ek olarak:

- 26 bağımsız `check:*` komutu geçti;
- 32 temel altın motor senaryosu geçti;
- 19 tür çifti istisna senaryosu geçti;
- production build başarıyla tamamlandı;
- native production paket doğrulaması geçti;
- 500 kB üzerindeki ana paket uyarısı devam ediyor ve `AKV-PERF-001` kapsamında açık tutuluyor.

## Sonraki iş

`AKV-UI-021` ile `result.scoreBreakdown` içindeki dört puan sonuç ekranında görünür hâle getirilecektir. Ardından `AKV-UI-022` her bulgunun neden, etki ve çözüm alanlarını kullanıcı kartlarına bağlayacaktır.
