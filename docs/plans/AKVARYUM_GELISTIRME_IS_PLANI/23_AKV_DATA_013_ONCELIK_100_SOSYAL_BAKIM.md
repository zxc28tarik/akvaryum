# AKV-DATA-013 — İlk 100 Sosyal Yapı ve Bakım Zorluğu

**Tarih:** 20 Temmuz 2026  
**Durum:** Tamamlandı

## Amaç

`Inhabitant v1` modelindeki ilk ürün öncelik setinde yer alan 100 kaydın:

- `social.territoriality`
- `care.difficulty`

alanlarını `unknown` durumundan çıkarmak ve bütün sosyal yapı alanlarının kullanılabilir olduğunu doğrulamak.

## Öncelik seti

Görevdeki “en popüler 100” ifadesi için dış pazar veya satış sıralaması varmış gibi davranılmadı. İlk parti, legacy katalog sırasındaki ilk 100 kayıt olarak sabitlendi.

Bu kararın nedenleri:

- mevcut veri sırası korunur,
- seçim tekrarlanabilir olur,
- kayıt listesi habersiz değişmez,
- dış popülerlik verisi varmış gibi yanlış iddia üretilmez.

Sabit liste:

```text
data/curation/priority-social-care-v1.mjs#PRIORITY_100_IDS
```

## Tamamlanan sosyal yapı

Her öncelikli kayıt için şunlar doğrulanır:

- `social.mode` bilinmeyen değildir,
- `social.conspecificAggression` bilinmeyen değildir,
- `social.territoriality` bilinmeyen değildir,
- sürü veya grup kaydında `minGroup` ve `recommendedGroup` vardır.

Bölgesellik kuralı:

| Koşul | Sonuç |
|---|---|
| aggressive veya predatory | `high` |
| semi_aggressive | `medium` |
| peaceful ve grup büyüklüğü en az 2 | `none` |
| peaceful ve grup gereksinimi yok | `low` |

Başlangıç sonucu:

```text
none: 72
low: 0
medium: 19
high: 9
```

## Bakım zorluğu puanı

Bakım zorluğu, tür hakkında yeni bir gerçek uydurularak değil mevcut kayıt kısıtlarından türetilir.

Puan girdileri:

- minimum tank hacmi,
- yetişkin boyu,
- genel mizaç,
- etçil beslenme işareti,
- sıcaklık aralığının darlığı,
- pH aralığının darlığı,
- yüksek asgari grup büyüklüğü.

Puan eşikleri:

| Puan | Zorluk |
|---|---|
| 0–1 | `beginner` |
| 2–3 | `intermediate` |
| 4–5 | `advanced` |
| 6+ | `expert` |

Başlangıç sonucu:

```text
beginner: 69
intermediate: 18
advanced: 5
expert: 8
```

Kurallar ve rapor:

```text
data/curation/priority-social-care-v1.mjs
data/curation/priority-social-care-report.json
```

## Kaynak ve güven durumu

Yeni türetilen alanlar şu kaynak kimliğini taşır:

```text
priority-social-care-rules-v1
```

Kaynak türü `derived`, güven düzeyi `low` olarak tutulur. Bu görev tür bazlı dış kaynak doğrulaması değildir.

Her öncelikli kayıt:

- kaynak kimliğini `sourceIds` içinde taşır,
- `fieldSourceIds.social` ve `fieldSourceIds.care` içinde alan kaynağını taşır,
- `needs_review/low` durumunda kalır,
- tamamlanan alanları `migration.derivedFields` içine alır,
- bu iki alanı `migration.unknownFields` listesinden çıkarır.

## Otomatik kontrol

```bash
npm run check:priority100
```

Kontrol şu durumlarda hata verir:

- öncelik listesi 100 değilse,
- kimlikler tekrar ederse,
- liste legacy katalog sırasının ilk 100 kaydıyla eşleşmezse,
- kayıt bulunamazsa,
- sosyal yapı alanlarından biri `unknown` kalırsa,
- bakım zorluğu `unknown` kalırsa,
- grup/sürü büyüklüğü eksikse,
- kaynak kimliği veya alan kaynağı eksikse,
- tamamlanan alan hâlâ `unknownFields` içindeyse,
- değer yanlışlıkla `verified` sayılırsa,
- dağılım raporu güncel kurallarla eşleşmezse,
- öncelik dışındaki kayda bu katman uygulanırsa,
- son veri `Inhabitant v1` şemasından geçmezse.

Kontrol GitHub Actions ve Vite production build başlangıcına bağlanmıştır.

## Sınır

Bu görev, 100 kaydın tür bazlı bakım kılavuzlarıyla doğrulandığı anlamına gelmez. Türetilmiş değerler motor ve arayüz geliştirmesini mümkün kılan düşük güvenli geçiş verileridir.

Dış kaynak doğrulaması yapıldığında:

- türetilmiş değer doğrudan kaynaklı değerle değiştirilebilir,
- alan kaynağı güncellenebilir,
- doğrulama durumu yükseltilebilir,
- rapor dağılımı bilinçli olarak yenilenebilir.

## Sonraki görev

`AKV-DATA-014` kapsamında aynı ilk 100 kayıt için minimum tank uzunluğu alanı doldurulacaktır. Bilinmeyen uzunluklar hacimden rastgele tahmin edilmeyecek; kullanılan geometrik veya kaynaklı yöntem açıkça kaydedilecektir.
