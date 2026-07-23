# AKV-ENG-014 — Omurgasız ve Mercan Güvenliği Ayrımı

**Durum:** DONE  
**Tamamlanma tarihi:** 23 Temmuz 2026  
**Uygulama PR’ı:** #21  
**Merge commit:** `da0d586eb5c5ea21572e8ea643ef12727131a5b4`

## 1. Amaç

Eski motor, tuzlu su kurulumlarında tek bir `reefSafe` değeri üzerinden birleşik bir uyarı üretiyordu:

- mercan riski,
- karides riski,
- salyangoz riski,
- yengeç riski,
- çift kabuklu riski

aynı sonuç içinde değerlendiriliyordu.

Bu görevle güvenlik değerlendirmesi hedef canlı grubuna göre ayrıldı. Motor artık bir canlının genel olarak “resif güvenli” olup olmadığını söylemek yerine, seçili kurulumdaki gerçek hedef grubuna göre sonuç üretir.

## 2. Ayrılan hedef grupları

Motor aşağıdaki yedi hedefi ayrı değerlendirir:

1. Soft mercan
2. LPS mercan
3. SPS mercan
4. Karides
5. Salyangoz
6. Yengeç
7. Çift kabuklu / clam

## 3. Yeni veri alanları

`Inhabitant v1` içindeki `compatibility` alanına aşağıdaki isteğe bağlı alanlar eklendi:

```text
softCoralSafe
lpsSafe
spsSafe
shrimpSafe
snailSafe
crabSafe
clamSafe
```

Kabul edilen değerler:

```text
true
false
yes
with_caution
no
not_applicable
unknown
```

Alanların isteğe bağlı tutulmasının nedeni, mevcut 580 kayda doğrulanmamış güvenlik değeri uydurmamaktır.

## 4. Motor öncelik sırası

Motor bir hedef grubu değerlendirirken şu sırayı kullanır:

1. Hedefe özel alan varsa onu kullanır.
2. Soft/LPS/SPS için hedefe özel alan yoksa genel `coralSafe` alanına dönebilir.
3. Canonical mercan verisi yoksa eski `reefSafe` alanı yalnız mercan hedefleri için geriye dönük uyumluluk amacıyla kullanılabilir.
4. Karides, salyangoz, yengeç veya clam için hedefe özel veri yoksa sonuç `unknown` kalır.
5. Eksik veriden risk veya güvenli sonuç tahmin edilmez.

Bu yapı sayesinde genel mercan alanı, omurgasız güvenliği için yanlış biçimde kullanılmaz.

## 5. Yeni motor çıktıları

Eski birleşik kural kaldırıldı:

```text
REEF_UNSAFE_INHABITANT
```

Yeni kural kimlikleri:

```text
REEF_SOFT_CORAL_RISK
REEF_LPS_CORAL_RISK
REEF_SPS_CORAL_RISK
REEF_SHRIMP_RISK
REEF_SNAIL_RISK
REEF_CRAB_RISK
REEF_CLAM_RISK
```

Sonuç ayrıca `result.reefSafety` altında açıklanır. Bu alanda şunlar bulunur:

- değerlendirme aktif mi,
- kurulumda hangi hedef grupları var,
- hangi canlı değerlendirildi,
- hangi veri alanı kullanıldı,
- sonuç güvenli, dikkatli, riskli veya bilinmiyor mu,
- doğrudan alan mı yoksa geriye dönük fallback mi kullanıldı,
- kaç değerlendirmede veri eksik kaldı.

## 6. Bulgu davranışı

- `no` veya `false`: uyarı üretir.
- `with_caution`: uyarı üretir.
- `yes` veya `true`: uyarı üretmez.
- `not_applicable`: uyarı üretmez.
- `unknown` veya eksik alan: uyarı üretmez, bilinmeyen değerlendirme olarak kaydedilir.

Her yeni bulgu Engine Finding v1 sözleşmesini taşır:

```text
ruleId
severity
title
desc
reason
impact
resolution
subjects
evidence
```

## 7. Önemli örnekler

### Mercanlara riskli, karidese bilinmeyen balık

Bir balığın `coralSafe: no` değeri varsa soft/LPS/SPS hedeflerinde uyarı üretilebilir. Ancak `shrimpSafe` alanı yoksa karides için otomatik olarak riskli kabul edilmez.

### Soft mercana güvenli, genel mercan alanı riskli balık

```text
coralSafe: no
softCoralSafe: true
```

Bu durumda hedefe özel alan önceliklidir ve soft mercan için uyarı üretilmez.

### LPS ve SPS sonucu farklı balık

```text
lpsSafe: false
spsSafe: with_caution
```

Motor iki ayrı uyarı üretir ve her bulguda kullanılan hedef alanını kanıt bölümüne yazar.

## 8. Eklenen dosyalar

```text
engine-reef-invertebrate-rules.js
scripts/check-engine-reef-invertebrate-rules.mjs
scripts/lib/validate-engine-reef-invertebrate-rules.mjs
```

Güncellenen ana dosyalar:

```text
schemas/inhabitant-v1.schema.json
package.json
boot.js
vite.config.js
.github/workflows/vite-verify.yml
```

## 9. Yükleme sırası

Yeni motor katmanı mevcut ana motor ve diğer uyumluluk katmanlarından sonra çalışır.

Statik sürümde `boot.js`, Vite production sürümünde `vite.config.js` üzerinden yüklenir.

Temel sıra:

```text
engine.js
engine-finding-contract.js
engine-health-guard.js
engine-social-rules.js
engine-conspecific-rules.js
engine-predator-prey-rules.js
engine-domain-results.js
engine-reef-invertebrate-rules.js
```

## 10. Doğrulama

Yeni komut:

```bash
npm run check:engine-reef
```

Odaklı doğrulama kapsamı:

- 15 senaryo,
- 7 yeni kural kimliği,
- Türkçe ve İngilizce çıktılar,
- hedefe özel alanın genel alana üstünlüğü,
- mercan fallback davranışı,
- omurgasız verisi eksikken tahmin yapılmaması,
- eski birleşik uyarının kaldırılması,
- Engine Finding v1 şema uyumu,
- statik ve Vite production yükleme bağlantıları.

Görev kapanışında ayrıca şunlar başarıyla geçti:

- 32 temel motor senaryosu,
- veri ve migrasyon kontrolleri,
- sosyal yapı kuralları,
- aynı/yakın tür agresyonu,
- avcı–av kuralları,
- mercan bakım doğrulaması,
- katalog, ayrıntı ve mobil kontroller,
- production build,
- native production paket kontrolü.

## 11. Bilinen sınırlamalar

- Mevcut katalogdaki canlıların çoğunda yedi hedefe özel güvenlik alanının tamamı henüz dolu değildir.
- Eksik alanlar `unknown` davranışıyla korunur.
- Motor, tür adına, beslenme tipine veya genel agresyon değerine bakarak resif güvenliği uydurmaz.
- Gerçek ürün doğruluğu için hedefe özel alanların kaynaklı veri partileriyle doldurulması gerekir.
- Tür çifti düzeyindeki özel durumlar bu görevin kapsamına dahil değildir.

## 12. Sonraki görev

Sıradaki motor işi:

```text
AKV-ENG-015 — Tür çifti istisna tablosu
```

Bu görevde genel tür alanlarını geçersiz kılan, kaynaklı ve doğrulanmış canlı çifti istisnaları tanımlanacaktır.
