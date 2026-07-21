# AKV-ENG-011 — Sosyal Yapı Kuralları

**Tarih:** 21 Temmuz 2026  
**Durum:** Tamamlandı

## Amaç

Motorun yalnız eski `schooling` alanını değil, `Inhabitant v1` içindeki canonical sosyal yapı alanlarını kullanmasını sağlamak.

## Uygulanan kurallar

### Sürü, grup ve koloni

`social.mode` değeri `school`, `group` veya `colony` ise seçili adet `social.minGroup` altındaysa uyarı oluşturulur.

Eski motor aynı kayıt için `SCHOOLING_MINIMUM` üretmişse ikinci bir sosyal uyarı eklenmez.

### Çift

`social.mode = pair` olan kayıt tam 2 birey gerektirir. Bir veya üç ve üzeri birey seçilirse `SOCIAL_PAIR_COUNT` uyarısı oluşturulur.

### Harem

`social.mode = harem` olan kayıt, yalnız `social.minGroup` kayıtlıysa bu alt sınıra göre değerlendirilir.

### Erkek–dişi oranı

Inhabitant v1 şemasına isteğe bağlı `social.sexRatio` alanı eklendi:

```js
{
  minMales: 1,
  minFemales: 2,
  maxMales: 1
}
```

Motor cinsiyet oranını yalnız şu iki koşul birlikte karşılanırsa değerlendirir:

1. Canlı kaydında kaynaklı bir `social.sexRatio` bulunması.
2. Seçimde `maleQty` ve `femaleQty` adetlerinin verilmesi.

Bu bilgilerden biri yoksa motor tahmin yapmaz ve cinsiyet uyarısı üretmez. Mevcut 580 kaydın hiçbirine cinsiyet oranı uydurulmadı.

## Motor çıktıları

Dört sosyal kural bulunur:

- `SOCIAL_GROUP_MINIMUM`
- `SOCIAL_PAIR_COUNT`
- `SOCIAL_HAREM_MINIMUM`
- `SOCIAL_SEX_RATIO`

Bu bulgular Engine Finding v1 zorunlu alanlarının tamamını taşır. Ana 27 eski kuralın kimlik kataloğu değiştirilmedi; sosyal uzantılar `Engine.socialRuleIds` altında tutulur.

Her yeni sosyal uyarı skoru 8 puan düşürür. Sosyal uyarılar kritik sorun değildir; tek başına sağlıklı kompozisyon önerisini engellemez.

## Teknik yapı

`engine-social-rules.js`, mevcut `Engine.analyze` sonucunu veri tabanlı sosyal uyarılarla genişletir. Kök statik sürümde `boot.js`, Vite production sürümünde sanal `engine.js` modülü üzerinden yüklenir.

## Otomatik doğrulama

```bash
npm run check:engine-social
```

Kontrol 15 odaklı senaryoyu kapsar:

- şema ve sosyal kural kataloğu;
- grup minimumunun altı ve sınırı;
- legacy sürü uyarısının çoğaltılmaması;
- çift için bir, iki ve üç birey;
- harem minimumunun altı ve sınırı;
- yanlış ve doğru cinsiyet oranı;
- cinsiyet adetleri yokken tahmin yapılmaması;
- İngilizce çıktı;
- Engine Finding v1 şema uygunluğu.

## Sonuç

- `AKV-ENG-011` kabul kriteri karşılandı.
- Mevcut sürü/grup verileri production motorunda kullanılabilir.
- Çift ve harem kayıtları eklendiğinde ek motor değişikliği gerektirmeden çalışır.
- Cinsiyet oranı yalnız gerçek veri ve kullanıcı girdisi bulunduğunda değerlendirilir.
- Production build ve native paket kontrolleri başarıyla geçti.
