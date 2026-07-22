# AKV-ENG-013 — Kaynaklı Avcı–Av Modeli

## Durum

`DONE`

## Amaç

Eski motorun yalnız agresiflik ve gövde boyu oranına dayanan avcılık tahminini, kaynak gösterilebilen avcı profilleriyle genişletmek.

## Profil sözleşmesi

Her kaynaklı avcı profili şu alanları taşır:

- `predatorId`
- `mouthWidthCm`
- `maxSwallowablePreyLengthCm`
- `safeSpeciesIds`
- `riskySpeciesIds`
- `sourceIds`
- doğrulama durumu ve güven düzeyi

Ağız genişliğinden otomatik yutma oranı türetilmez. En büyük yutulabilir av boyu da kaynaklı bir değer olarak ayrıca kaydedilir.

## Kural sırası

1. Avcı için profil yoksa eski motor sonucu korunur.
2. Açık güvenli tür istisnası varsa eski kaba avcılık uyarısı kaldırılır.
3. Açık riskli tür istisnası varsa av riski üretilir.
4. İstisna yoksa avın yetişkin alt boyu, kayıtlı en büyük yutulabilir av boyuyla karşılaştırılır.
5. pH, sıcaklık, agresyon veya başka bir uyumsuzluk varsa güvenli av istisnası bunları silmez.

## Bulgu ve güven

Yeni kural kimliği:

- `PREDATION_SIZE_RISK`

Bulgu Engine Finding v1 sözleşmesini taşır ve kanıtta şunları gösterir:

- avcı ve av kimlikleri,
- ağız genişliği,
- yutulabilir av boyu eşiği,
- avın yetişkin alt boyu,
- değerlendirme yöntemi,
- profil kaynak kimlikleri,
- doğrulama ve güven düzeyi.

`verified/high` profil kritik sonuç, `reviewed/medium` profil uyarı üretir.

## Davranış alanı

`PREDATION_SIZE_RISK` bulguları `domains.behavior` sonucuna katılır. Avcılık riski çevresel parametre çakışmalarıyla karıştırılmaz.

## Mevcut veri durumu

Production katalogda henüz kaynaklı avcı profili bulunmamaktadır. `DB.predatorPreyProfiles` bilinçli olarak boş başlatılır.

Bu nedenle:

- herhangi bir canlıya ağız ölçüsü veya av eşiği uydurulmamıştır,
- profil eklenmeyen türlerde eski davranış korunur,
- gerçek katalog iyileştirmesi ayrı bir kaynaklı veri doldurma işi gerektirir.

## Doğrulama

`npm run check:engine-predation` 15 odaklı senaryoyu çalıştırır.

Kapsanan durumlar:

- profil JSON Schema doğrulaması,
- profilsiz legacy fallback,
- güvenli istisna,
- riskli istisna,
- kaynaklı boy eşiği,
- orta ve yüksek güvenin farklı önem düzeyleri,
- pH uyumsuzluğunun korunması,
- Türkçe ve İngilizce çıktı,
- Engine Finding v1 doğrulaması,
- statik `boot.js` ve Vite production yükleme sırası,
- davranış alanı bağlantısı.

Bütün mevcut veri, motor, katalog, production build ve native paket kontrolleriyle birlikte GitHub Actions hattında çalışır.
