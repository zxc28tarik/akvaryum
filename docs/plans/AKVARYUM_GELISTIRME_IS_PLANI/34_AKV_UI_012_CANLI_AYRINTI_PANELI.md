# AKV-UI-012 — Canlı Ayrıntı Paneli

**Tarih:** 21 Temmuz 2026  
**Durum:** Tamamlandı

## Amaç

Katalog kartındaki kısa özetin yanında, kullanıcıya seçim yapmadan önce canlı gereksinimlerini, veri kaynağını ve doğrulama durumunu tek ekranda göstermek.

## Panel bölümleri

Ayrıntı paneli beş ana bölümden oluşur:

1. **Genel bilgiler** — ortak ad, bilimsel ad, eş adlar, cins, aile, kategori ve canlı türü.
2. **Su ve tank** — su tipi, sıcaklık, pH, GH, tuzluluk, yetişkin boyu, minimum tank hacmi, minimum tank uzunluğu ve ek canlı hacmi.
3. **Davranış ve bakım** — bakım zorluğu, mizaç, aktivite, sosyal yapı, grup sayısı, bölgesellik, aynı tür agresyonu ve beslenme.
4. **Uyumluluk ve yaşam alanı** — bitki/mercan güvenliği, akıntı, oksijen, taban, saklanma alanı, hassasiyetler ve özel uyarılar.
5. **Kaynak ve doğrulama** — kaynak başlığı, yayıncı, durum, güven düzeyi, alan bağlantıları, doğrulama notları ve açık eksik alanlar.

## Veri ilkesi

- Panel `Inhabitant v1` alanlarını doğrudan kullanır.
- Legacy kayıtlar için mevcut alanlardan güvenli geri dönüş uygulanır.
- Kayıtlı olmayan değerler tahmin edilmez; **Bilinmiyor** olarak gösterilir.
- `needs_review` ve düşük güvenli kayıtlar dış kaynak doğrulaması beklediği açıkça belirtilerek gösterilir.
- `DB.sources`, `sourceIds` ve `fieldSourceIds` bağlantıları panelde görünür hale getirilir.

## Kullanım davranışı

- Her katalog kartına **Detay** düğmesi eklenir.
- Panel sağdan açılır; mobil görünümde tam genişlik kullanır.
- Escape tuşu, kapatma düğmesi veya panel dışına tıklama ile kapanır.
- Kapanınca odak, paneli açan düğmeye geri döner.
- Panel açıkken arka sayfanın kaydırılması durdurulur.
- Canlı panel içinden akvaryuma eklenebilir; seçiliyse adet artırılıp azaltılabilir.
- Türkçe ve İngilizce metinler aynı bileşende desteklenir.

## Teknik yapı

### `inhabitant-detail-model.js`

Arayüzden bağımsız veri hazırlama katmanıdır. Canonical ve legacy kayıtları ortak ayrıntı görünümüne dönüştürür; eksik alan üretmez ve kaynak kimliklerini katalog kayıtlarıyla eşler.

### `inhabitant-detail.jsx`

Mevcut katalog seçim bileşenini saran React katmanıdır. Katalog kartlarını ayrıntı düğmesiyle güçlendirir ve erişilebilir modal paneli gösterir.

### Çalışma yolları

Aynı model ve panel:

- kök statik sürümde `boot.js` üzerinden;
- Vite production paketinde sanal `components.jsx` modülü üzerinden

çalışır.

## Otomatik doğrulama

```bash
npm run check:inhabitant-detail
```

Kontrol 10 odaklı senaryoyu doğrular:

- canonical Türkçe kayıt dönüşümü;
- su, tank ve boy alanları;
- sosyal, davranış, beslenme ve uyumluluk alanları;
- kaynak ve doğrulama çözümlemesi;
- İngilizce yerelleştirme;
- eksik alanlara değer uydurulmaması;
- legacy kayıt geri dönüşü;
- dialog, Escape ve kart ayrıntı düğmesi sözleşmesi;
- kaynak listesi ve panel içi adet yönetimi;
- statik ve Vite production yükleme bağlantıları.

## Sonuç

- `AKV-UI-012` kabul kriteri karşılandı.
- Kaynak ve bakım tablosu katalogdan ayrılmadan görüntülenebilir.
- Eksik ve doğrulanmamış veri kullanıcıdan gizlenmez.
- Production build ve native paket kontrolleri başarıyla geçti.
