# AKV-DATA-014 — İlk 100 Minimum Tank Uzunluğu

**Tarih:** 20 Temmuz 2026  
**Durum:** Tamamlandı

## Kapsam

Legacy katalog sırasındaki ilk 100 `Inhabitant v1` kaydında `tank.minLengthCm` alanı tamamlandı. Bu sıra dış pazar popülerliği iddiası taşımaz; ürünün ilk veri tamamlama öncelik setidir.

## Türetim yöntemi

Her kayıt için iki bağımsız alt sınır hesaplanır:

1. **Hacim alt sınırı:** Dikdörtgen tankta genişlik ve yükseklik, uzunluğun yaklaşık `%45`i kabul edilir. Kayıtlı minimum hacimden uzunluk hesaplanır ve bir sonraki standart ölçüye yuvarlanır.
2. **Vücut/yüzme alt sınırı:** Yetişkin boyuna boy sınıfına göre `4,5–10` arasında katsayı uygulanır. Grup veya sürü halinde yaşayan uzun gövdeli/yüzey canlılarında ek `1,2` yüzme katsayısı kullanılır.

Sonuç, iki alt sınırın büyük olanıdır.

## Sonuç

```text
60 cm:   9 kayıt
75 cm:  49 kayıt
80 cm:   2 kayıt
90 cm:  12 kayıt
100 cm: 12 kayıt
120 cm:  6 kayıt
150 cm:  5 kayıt
180 cm:  4 kayıt
300 cm:  1 kayıt
Toplam: 100 kayıt
```

Belirleyici alt sınır:

```text
Hacim:       81
Vücut boyu:  13
İkisi eşit:   6
```

## Kaynak ve güven durumu

- Kaynak kimliği: `priority-tank-length-rules-v1`
- Alan kaynağı: `fieldSourceIds.tank`
- Doğrulama durumu: `needs_review`
- Güven: `low`
- Migrasyon alanı: `tank.minLengthCm` artık ilk 100 kayıtta `derivedFields` içindedir.

Bu sonuçlar tür bazlı dış kaynak doğrulaması değildir. Gelecekte güvenilir tür kaynakları eklendiğinde türetilmiş değerler alan bazında gözden geçirilecektir.

## Otomatik kontrol

```bash
npm run check:tanklength100
```

Kontrol; 100 kimliğin tamamını, standart ölçüleri, hacim ve vücut alt sınırlarını, kaynak bağlantılarını, düşük güven durumunu, migrasyon işaretlerini ve kayıtlı rapor dağılımını doğrular. Aynı kontrol Vite build başlangıcına ve GitHub Actions hattına bağlıdır.
