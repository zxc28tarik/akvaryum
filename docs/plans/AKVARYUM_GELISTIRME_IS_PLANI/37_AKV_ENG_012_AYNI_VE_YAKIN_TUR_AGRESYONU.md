# AKV-ENG-012 — Aynı Tür ve Yakın Tür Agresyonu

**Tarih:** 21 Temmuz 2026  
**Durum:** Tamamlandı

## Amaç

Motorun yalnız türler arası genel mizaç karşılaştırması yapmakla kalmayıp, aynı türden birden fazla birey ve aynı cinse ait farklı türler arasındaki davranış risklerini canonical veri alanlarından değerlendirmesini sağlamak.

## Aynı tür kuralı

Aynı kayıt için seçili adet 2 veya daha fazlaysa:

- `social.conspecificAggression = high/extreme` olduğunda uyarı oluşturulur;
- `social.conspecificAggression = medium` ve `social.mode = solitary` olduğunda uyarı oluşturulur;
- düşük agresyon, tek birey veya grup/sürü yapısındaki orta agresyon için ek uyarı üretilmez.

Beta gibi mevcut özel kritik kuralla zaten yakalanan durumlar ikinci kez uyarılmaz.

## Yakın tür kuralı

İki farklı kayıt:

1. aynı `taxonomy.genus` değerini taşıyorsa ve
2. kayıtlardan en az birinde yüksek/aşırı aynı tür agresyonu veya yüksek bölgesellik varsa

`CONGENERIC_AGGRESSION` uyarısı oluşturulur.

Aşağıdaki durumlarda uyarı oluşturulmaz:

- cins bilgisi eksikse;
- cinsler farklıysa;
- agresyon ve bölgesellik düşükse;
- eski motor aynı çift için zaten dikkat veya kritik uyumsuzluk sonucu üretmişse.

## Güven ilkesi

Mevcut sosyal/agresyon verilerinin önemli bölümü eski mizaç alanlarından türetilmiş ve `needs_review/low` durumundadır. Bu nedenle yeni kurallar yalnız **uyarı** üretir; kritik uyumsuzluk üretmez.

Her bulgunun kanıtında:

- doğrulama durumu;
- güven düzeyi;
- taksonomi inceleme durumu;
- aynı tür veya aynı cins ilişkisinin türü

saklanır.

## Motor çıktıları

İki uzantı kuralı bulunur:

- `CONSPECIFIC_AGGRESSION`
- `CONGENERIC_AGGRESSION`

Uyarı üretildiğinde ilgili `compat` kaydı da `warn` durumuna geçirilir. Her yeni uyarı skoru 8 puan düşürür. Ana Engine Finding v1 içindeki 27 kural kimliği değiştirilmez; uzantılar `Engine.conspecificRuleIds` altında tutulur.

## Teknik yapı

`engine-conspecific-rules.js`, sağlık ve sosyal yapı katmanlarından sonra çalışır. Böylece:

- beta özel kritik kuralını görebilir;
- sosyal yapı uyarılarıyla birlikte toplam skoru korur;
- mevcut ikili uyumluluk kayıtlarını tekrar üretmeden genişletir.

Aynı dosya kök statik sürümde `boot.js`, Vite production sürümünde sanal motor modülü üzerinden yüklenir.

## Otomatik doğrulama

```bash
npm run check:engine-conspecific
```

Kontrol 14 odaklı senaryoyu kapsar:

- yüksek agresyonlu aynı türde çoklu ve tek birey;
- orta agresyonlu tekil ve grup türü;
- düşük agresyonlu çoklu birey;
- beta özel kritik kuralında tekrar engeli;
- aynı cinste yüksek risk;
- farklı cins ve eksik cins bilgisi;
- mevcut ikili dikkat sonucunda tekrar engeli;
- Türkçe/İngilizce çıktı;
- Engine Finding v1 şema uygunluğu;
- uyumluluk kaydının uyarıya dönüşmesi.

## Sonuç

- `AKV-ENG-012` kabul kriteri karşılandı.
- Aynı tür ve aynı cinse ait yakın tür riskleri veri tabanlı olarak değerlendiriliyor.
- Düşük güvenli veri kritik sonuç olarak sunulmuyor.
- Eski özel kurallar ve ikili uyarılar çoğaltılmıyor.
- Production build ve native paket kontrolleri başarıyla geçti.
