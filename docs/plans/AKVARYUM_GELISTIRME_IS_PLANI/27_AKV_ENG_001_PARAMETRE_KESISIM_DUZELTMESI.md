# AKV-ENG-001 — Parametre Kesişim Düzeltmesi

**Tarih:** 20 Temmuz 2026  
**Durum:** Tamamlandı

## Sorun

Eski motor pH, sıcaklık ve GH aralıklarını sırayla kesiştirirken şu mantığı kullanıyordu:

```js
rangeOverlap(previous, next) || previous
```

Yeni türle ortak aralık bulunamadığında `rangeOverlap` değeri `null` olmasına rağmen önceki aralık korunuyordu. Bu nedenle sonuç ekranı gerçekte bütün türler için geçerli olmayan bir ortak aralık gösterebiliyordu.

## Uygulanan çözüm

- Aralık değerinin iki geçerli sayıdan oluştuğu doğrulanır.
- Bütün seçili türler boyunca kesişim sırayla daraltılır.
- Herhangi bir aşamada kesişim kaybolursa sonuç kalıcı olarak `null` olur.
- Eski veya önceki aralığa geri dönüş yapılmaz.
- Çakışmayan bütün tür çiftleri ayrıca belirlenir.
- pH, sıcaklık ve GH aynı hesaplama çekirdeğini kullanır.

## Kritik sorun çıktısı

Ortak aralık bulunamadığında motorun `issues` listesine tek bir parametre özeti eklenir:

- `Ortak güvenli pH aralığı yok`
- `Ortak güvenli sıcaklık aralığı yok`
- `Ortak güvenli GH aralığı yok`

Açıklamada çakışmaya neden olan tür çiftleri Türkçe veya İngilizce adlarıyla gösterilir. Kullanıcıya tür seçimini değiştirme veya ayrı akvaryum planlama çözümü sunulur.

İkili uyumluluk kayıtları korunmuştur; bu görev yalnız yanıltıcı toplu aralık sonucunu düzeltir. Standart `ruleId/severity/resolution` sözleşmesi `AKV-ENG-002` kapsamındadır.

## Sınır davranışları

- Tek canlıda kendi aralığı döner.
- Boş seçimde bütün parametreler `null` olur.
- İki aralık yalnız tek noktada buluşuyorsa bu geçerli kesişimdir.
- GH bilgisi olmayan kayıtlar GH hesabına katılmaz.
- Yalnız bir geçerli GH aralığı varsa o aralık döner.
- Ortak pH, sıcaklık veya GH yoksa ilgili alan `null` olur.

## Otomatik kontrol

```bash
npm run check:engine-params
```

Kontrol edilen 10 senaryo:

1. İki türde normal pH/sıcaklık/GH kesişimi
2. Üç türde daralan ortak aralık
3. Ortak pH bulunmaması
4. Ortak sıcaklık bulunmaması
5. Ortak GH bulunmaması
6. Eksik GH değerinin güvenli biçimde atlanması
7. Tek canlı sonucu
8. Boş canlı seçimi
9. Sınırda tek nokta kesişimi
10. İngilizce kritik mesaj ve tür çifti

Kontrol bağımsız komuta, GitHub Actions hattına ve Vite production build başlangıcına bağlanmıştır.

## Sonuç

- Yanıltıcı önceki aralık geri dönüşü kaldırıldı.
- Ortak aralık yoksa sonuç artık gerçekten `null`.
- pH, sıcaklık ve GH çevresel uyumsuzluğu kritik sorun olarak görünür.
- Uyuşmazlığa neden olan türler açıkça belirtilir.
- 10/10 motor senaryosu, production build ve native paket kontrolü geçti.
