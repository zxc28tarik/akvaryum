# AKV-DATA-002 — Canlı Sınıflandırma Uygulama Notu

**Tarih:** 16 Temmuz 2026  
**Durum:** Tamamlandı

## Amaç

Mevcut 580 canlı kaydına veri kaybetmeden şu alanları eklemek:

- `entityType`
- `category`
- `taxonomy.genus`
- `taxonomy.family`
- `taxonomy.reviewStatus`

## Uygulama yöntemi

Eski kaynak dosyaları henüz gerçek veri modüllerine ayrılmadığı için sınıflandırma, kaynak dosyalardaki bölüm başlıkları ve bilimsel adın cins bölümü kullanılarak build sırasında uygulanır.

Tek sınıflandırma çekirdeği:

```text
scripts/lib/classify-legacy-fish.mjs
```

Bu çekirdek hem Node.js veri doğrulamasında hem Vite production build'inde kullanılır. Test verisi ile uygulamanın kullandığı veri ayrı algoritmalarla üretilmez.

## Sonuç

- Sınıflandırılan toplam kayıt: **580**
- Kontrollü kategori: **29**
- `entityType` sınıfı: **14**
- Aile alanı bulunan kayıt: **580**
- Cins alanı otomatik çıkarılan kayıt: **579**
- Açık inceleme kaydı: **1** (`flowerhorn`, yapay melez)

## Ana entityType dağılımı

| Tür | Kayıt |
|---|---:|
| Tatlı su balığı | 256 |
| Deniz balığı | 211 |
| Tatlı su karidesi | 11 |
| Deniz karidesi | 7 |
| Salyangoz | 12 |
| Yengeç | 10 |
| Kerevit | 2 |
| Çift kabuklu | 4 |
| Derisidikenli | 9 |
| Anemon | 5 |
| Diğer omurgasız | 3 |
| Yumuşak mercan | 18 |
| LPS mercan | 20 |
| SPS mercan | 12 |

## Taksonomi güven durumu

Aile eşlemeleri bu aşamada `inferred` olarak işaretlenir. Bu, alanın boş olmadığını fakat henüz kaynak modeliyle alan bazında doğrulanmadığını belirtir.

`AKV-DATA-003` tamamlandıktan sonra aile ve kabul edilmiş bilimsel ad alanları kaynak kimlikleriyle doğrulanacaktır. Kaynak doğrulaması yapılmadan `verified` durumu verilmeyecektir.

## Otomatik kontroller

```bash
npm run check:schema
npm run check:classification
npm run build
npm run check:native
```

Yeni veya değiştirilen bir canlıda kategori, entityType veya taksonomi alanı üretilemezse build başarısız olur.

## Production bağlantısı

Vite, tatlı ve tuzlu su kaynaklarını build sırasında okur, aynı sınıflandırma çekirdeğini çalıştırır ve oluşan alanları `window.DB_FRESH` ile `window.DB_SALT` kayıtlarına ekler. Tarayıcıda ayrıca sınıflandırma hesabı yapılmaz.

## Sonraki görev

`AKV-DATA-003`: kaynak ve doğrulama modeli. İlk hedef, sınıflandırma ve taksonomi alanlarının hangi kaynakla ve hangi tarihte doğrulandığını alan bazında tutmaktır.
