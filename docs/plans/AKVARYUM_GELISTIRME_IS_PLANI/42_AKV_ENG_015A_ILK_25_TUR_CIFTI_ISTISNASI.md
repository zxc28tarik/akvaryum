# AKV-ENG-015A — İlk 25 Tür Çifti İstisnası

**Durum:** Tamamlandı  
**Tarih:** 23 Temmuz 2026  
**Ana görev:** `AKV-ENG-015`  
**Ana görev ilerlemesi:** 25/50

## 1. Amaç

Genel agresyon, boy, avcılık ve resif güvenliği kurallarının yanlış veya yetersiz kaldığı belirli canlı çiftleri için kaynaklı sonuçlar üretmek.

Bu parti, `AKV-ENG-015` kabul ölçütünün ilk yarısıdır. İkinci 25 kayıt `AKV-ENG-015B` kapsamında eklenecektir.

## 2. Veri sözleşmesi

Yeni `Compatibility Override v1` kaydı şunları taşır:

- benzersiz kayıt kimliği,
- iki canlı kimliği,
- `both`, `a_to_b` veya `b_to_a` yönü,
- `compatible`, `caution`, `conditional` veya `incompatible` durumu,
- Türkçe/İngilizce neden, koşul, etki ve çözüm,
- kaynak kimlikleri,
- doğrulama tarihi,
- doğrulama durumu ve güven düzeyi.

Dosyalar:

- `schemas/compatibility-override-v1.schema.json`
- `data/curation/compatibility-overrides-v1.json`
- `engine-compatibility-overrides.js`

## 3. İlk 25 kayıt

| No | Çift | Yön | Sonuç |
|---:|---|---|---|
| 1 | Beta ↔ Kuhli Loach | İki yönlü | Koşullu |
| 2 | Beta ↔ Köz Tetra | İki yönlü | Koşullu |
| 3 | Beta ↔ Malezya Trompet Salyangozu | İki yönlü | Koşullu |
| 4 | Beta ↔ Harlekin Rasbora | İki yönlü | Koşullu |
| 5 | Beta ↔ Bronz Koridoras | İki yönlü | Koşullu |
| 6 | Kiraz Karides ↔ Nerite Salyangozu | İki yönlü | Uyumlu |
| 7 | Kiraz Karides ↔ Mystery Salyangozu | İki yönlü | Uyumlu |
| 8 | Kiraz Karides ↔ Malezya Trompet Salyangozu | İki yönlü | Uyumlu |
| 9 | Kiraz Karides ↔ Bambu Karidesi | İki yönlü | Uyumlu |
| 10 | Kiraz Karides ↔ Vampir Karidesi | İki yönlü | Uyumlu |
| 11 | Kiraz Karides ↔ Amano Karidesi | İki yönlü | Uyumlu |
| 12 | Kiraz Karides ↔ Hayalet Karides | İki yönlü | Uyumlu |
| 13 | Kiraz Karides ↔ Otocinclus | İki yönlü | Uyumlu |
| 14 | Kiraz Karides ↔ Palyaço Pleco | İki yönlü | Dikkat |
| 15 | Kiraz Karides ↔ Köz Tetra | İki yönlü | Koşullu |
| 16 | Kiraz Karides ↔ Yeşil Neon | İki yönlü | Koşullu |
| 17 | Kiraz Karides ↔ Acı Biber Rasbora | İki yönlü | Koşullu |
| 18 | Kiraz Karides ↔ Cüce Koridoras | İki yönlü | Koşullu |
| 19 | Kiraz Karides ↔ Lepistes | İki yönlü | Koşullu |
| 20 | Kiraz Karides ↔ Endler Lepistes | İki yönlü | Koşullu |
| 21 | Beta → Kiraz Karides | Yönlü | Dikkat |
| 22 | Bezelye Puffer → Kiraz Karides | Yönlü | Uyumsuz |
| 23 | Japon Balığı → Kiraz Karides | Yönlü | Uyumsuz |
| 24 | Kiraz Karides ↔ Zebra Danyo | İki yönlü | Dikkat |
| 25 | Sarı Bekçi Goby ↔ Pistol Karides | İki yönlü | Uyumlu |

Dağılım:

- 9 uyumlu,
- 11 koşullu,
- 3 dikkat,
- 2 uyumsuz.

## 4. Kaynaklar

Dört dış bakım kaynağı kullanıldı:

- [Aquarium Co-Op — Betta Tank Mates](https://www.aquariumcoop.com/blogs/aquarium/betta-tank-mates)
- [Aquarium Co-Op — Cherry Shrimp Tank Mates](https://www.aquariumcoop.com/blogs/aquarium/cherry-shrimp-tankmates)
- [Aquarium Co-Op — Mystery Snail Care](https://www.aquariumcoop.com/blogs/aquarium/mystery-snail)
- [Bulk Reef Supply — Pico Aquarium Stocking](https://www.bulkreefsupply.com/content/post/stocking-a-pico-aquarium)

Bütün istisnalar `verified/medium` durumundadır. Bu güven düzeyi, kayıtların bakım rehberlerine dayanması; kontrollü deney veya bilimsel tür etkileşimi çalışması olmaması nedeniyle `high` yapılmadı.

## 5. Motor önceliği

Uygulama sırası:

1. Veri geçerliliği
2. Çevresel ve tank güvenliği
3. Genel ikili davranış, avcılık ve resif değerlendirmeleri
4. Kaynaklı tür çifti istisnası
5. Sonuç alanlarının ve skorun yeniden hesaplanması

İstisna şu genel ikili bulguların yerine geçebilir:

- temel `PAIRWISE_*` sonucu,
- aynı cins agresyonu,
- boy/ağız temelli avcılık sonucu,
- hedefe özel resif güvenliği sonucu.

İstisna şu bağımsız güvenlik sonuçlarını silemez:

- su tipi,
- pH,
- sıcaklık,
- GH,
- tank hacmi ve uzunluğu,
- sosyal grup ve sürü minimumu.

## 6. Sonuç ekranı bağlantısı

Motor dört yeni kural kimliği üretir:

- `PAIR_OVERRIDE_COMPATIBLE`
- `PAIR_OVERRIDE_CAUTION`
- `PAIR_OVERRIDE_CONDITIONAL`
- `PAIR_OVERRIDE_INCOMPATIBLE`

Her bulgu Türkçe/İngilizce başlık, neden, koşul, etki, çözüm, canlı kimlikleri ve kaynak kanıtı taşır. Mevcut sonuç kartları bu alanları doğrudan gösterir.

## 7. Doğrulama

Komut:

```bash
npm run check:engine-pairs
```

Geçen kontroller:

- 25/25 kayıt JSON Schema doğrulaması,
- benzersiz kayıt ve çift/yön denetimi,
- 25 çiftte iki canlı kimliğinin production kataloğunda bulunması,
- dört kaynak kimliğinin doğrulanmış kaynak kataloğunda çözülmesi,
- dört durum ve dört motor kuralı,
- iki yönlü ve yönlü kayıt desteği,
- Türkçe ve İngilizce çıktı,
- genel ikili kuralın üstüne yazılması,
- pH uyumsuzluğunun istisnaya rağmen korunması,
- statik ve Vite production yükleme bağlantısı,
- 14 odaklı motor senaryosu,
- production build.

## 8. Sonraki görev

```text
AKV-ENG-015B — İkinci 25 kaynaklı tür çifti istisnası
```

İkinci parti tamamlandığında `AKV-ENG-015` 50/50 kapanacak ve `AKV-ENG-016` dört alt skor sistemine geçilecektir.
