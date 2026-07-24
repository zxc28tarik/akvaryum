# AKV-ENG-015B — İkinci 25 Tür Çifti İstisnası

**Durum:** Tamamlandı  
**Tamamlanma tarihi:** 23 Temmuz 2026  
**Ana görev:** `AKV-ENG-015 — Tür çifti istisna tablosu`

## Amaç

`AKV-ENG-015A` ile production motoruna bağlanan ilk 25 kaynaklı tür çifti kaydını ikinci 25 kayıtla tamamlamak ve ana görevin en az 50 doğrulanmış istisna kabul ölçütünü kapatmak.

## Uygulanan değişiklikler

- `data/curation/compatibility-overrides-v1.json` 25 kayıttan 50 kayda çıkarıldı.
- İkinci parti 14 `compatible`, 6 `conditional`, 2 `caution` ve 3 `incompatible` kayıt içeriyor.
- Toplam dağılım 23 uyumlu, 17 koşullu, 5 dikkat ve 5 uyumsuz sonuç oldu.
- Beş yeni Aquarium Co-Op bakım kaynağı `data/sources/source-catalog.json` dosyasına eklendi.
- Bütün yeni kayıtlar katalogdaki gerçek canlı kimliklerine bağlandı.
- Her kayıt Türkçe/İngilizce neden, koşul, etki ve çözüm metni taşıyor.
- Yönlü tehditler `a_to_b` veya `b_to_a`, karşılıklı ilişkiler `both` olarak kaydedildi.
- Genel ikili davranış/avcılık/resif bulgularının üstüne yazma davranışı korundu.
- pH, sıcaklık, GH, su tipi, tank hacmi ve sosyal grup kuralları istisnalardan bağımsız bırakıldı.

## İkinci parti kapsamı

| Grup | Kayıt sayısı | Örnekler |
|---|---:|---|
| Japon balığı | 9 | Hillstream loach, weather loach, pleco, white cloud, medaka, rosy barb, corydoras, otocinclus |
| Habrosus koridoras | 5 | Chili rasbora, celestial pearl danio, clown killifish, green neon, yetişkin kiraz karides |
| Cüce koridoras | 5 | Neon tetra, chili rasbora, celestial pearl danio, otocinclus, sakin beta |
| Lepistes | 4 | Koridoras, neon tetra, kaplan barbı, bala köpekbalığı |
| Melek balığı | 2 | Siyah etekli tetra, kiraz karides |

## Kaynaklar

- Aquarium Co-Op — `10 Best Tank Mates for Your Goldfish`
- Aquarium Co-Op — `Care Guide for Habrosus Corydoras`
- Aquarium Co-Op — `Care Guide for Pygmy Corydoras`
- Aquarium Co-Op — `Care Guide for Guppies`
- Aquarium Co-Op — `Care Guide for Freshwater Angelfish`

Kaynak kayıtları `verified/medium` durumundadır. Bu değer, uzman bakım rehberinin ilişkiyi açıkça desteklediğini; buna karşın akademik bir türler arası deney verisi olmadığını belirtir.

## Otomatik doğrulama

`npm run check:engine-pairs` şu kabul noktalarını 19 odaklı senaryoyla doğrular:

- JSON Schema uygunluğu
- Tam olarak 50 benzersiz çift/yön kaydı
- 23/17/5/5 durum dağılımı
- Dokuz kaynak kimliğinin çözülmesi
- Bütün canlı kimliklerinin production kataloğunda bulunması
- Uyumlu, koşullu, dikkat ve uyumsuz motor çıktıları
- Türkçe ve İngilizce neden–etki–çözüm metinleri
- Yön bilgisinin motor bulgusunda korunması
- Genel ikili bulgunun istisnayla değiştirilmesi
- Çevresel pH uyumsuzluğunun silinmemesi
- Statik ve Vite production yükleme bağlantıları

## Sonuç

`AKV-ENG-015` ana görevi 50/50 tamamlandı. Sıradaki motor görevi `AKV-ENG-016 — dört alt skorlu açıklanabilir sonuç sistemi`.
