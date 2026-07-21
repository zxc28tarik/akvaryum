# AKV-ENG-010 — Hacim, Biyolojik Yük ve Davranış Alanlarını Ayırma

**Tarih:** 21 Temmuz 2026  
**Durum:** Tamamlandı

## Amaç

Tek bir toplam skor altında karışan fiziksel tank alanı, toplamsal stok yükü ve davranış uyumunu ayrı sonuçlar halinde sunmak.

Mevcut `neededVol`, `bioloadPct`, `score` ve `verdict` alanları geriye dönük uyumluluk için korunur. Yeni sonuçlar `result.domains` altında bulunur.

## Hacim alanı

`domains.volume` fiziksel tank gereksinimini değerlendirir.

- Seçilen canlılar içindeki en büyük `tank.minVolumeL` minimum hacim olarak alınır.
- Kayıtlı minimum tank uzunlukları içindeki en büyük değer ayrıca gösterilir.
- Kullanıcı duruma `tankLengthCm` verirse uzunluk bağımsız değerlendirilir.
- Hacim ve uzunluktan daha kötü olan sonuç genel hacim durumunu belirler.

Durumlar:

- `good`
- `warning`
- `critical`
- `not_evaluated`

## Biyolojik yük alanı

`domains.bioload`, eski toplamsal `neededVol` hesabını ayrı bir stoklama vekili olarak gösterir.

Bu sonuç gerçek atık üretimi ölçümü değildir. Bu nedenle:

- yöntem `legacy_additive_stocking_proxy_v1` olarak açıkça belirtilir;
- güven düzeyi `low` olur;
- yüzde 100 ile sınırlandırılmaz; aşım miktarı görünür kalır.

Böylece iki türün her biri 60 litre minimum istese bile fiziksel hacim gereksinimi 60 litre, toplamsal stok vekili 120 litre olarak ayrı ayrı görülebilir.

## Davranış alanı

`domains.behavior` yalnız davranışla ilgili bulguları kullanır:

- sosyal grup minimumları;
- çift ve harem kuralları;
- aynı tür ve yakın tür agresyonu;
- avcılık;
- agresyon uyumsuzluğu;
- yüzgeç çekiştirme.

pH, sıcaklık ve GH çakışmaları davranış sorunu sayılmaz. İkili uyumluluk tablosunda uyumsuz görünseler bile davranış durumu ayrı kalır.

Davranış sonucu ayrıca:

- kritik bulgu sayısını;
- uyarı sayısını;
- ilgili kural kimliklerini;
- uyumlu, dikkat ve uyumsuz çift sayılarını

verir.

## Sonuç sözleşmesi

```js
const result = Engine.analyze(state);

result.domains.version;
result.domains.volume;
result.domains.bioload;
result.domains.behavior;
```

Sözleşme sürümü `Engine.domainResultsVersion = 1` alanında bulunur.

## Teknik yapı

`engine-domain-results.js`, sağlık, sosyal yapı ve agresyon katmanlarından sonra çalışır. Bu sayede davranış alanı bütün yeni motor uyarılarını görür.

Aynı dosya:

- kök statik sürümde `boot.js` üzerinden;
- Vite production sürümünde sanal motor modülü üzerinden

çalışır.

## Otomatik doğrulama

```bash
npm run check:engine-domains
```

Kontrol 13 odaklı senaryoyu kapsar:

- boş seçim;
- tek sağlıklı canlı;
- fiziksel hacim iyi fakat stok vekili kritik karma kurulum;
- kritik ve sınırdaki hacim;
- tank uzunluğu kritik ve ölçülmemiş durum;
- sosyal davranış uyarısı;
- avcı davranışı kritik sonucu;
- pH çakışmasının davranıştan ayrılması;
- yüzgeç çekiştirme;
- aynı tür agresyonu;
- eski motor alanlarının korunması.

## Sonuç

- `AKV-ENG-010` kabul kriteri karşılandı.
- Fiziksel tank alanı, stok yükü ve davranış artık üç bağımsız sonuçtur.
- Biyolojik yük hesabının vekil ve düşük güvenli olduğu kullanıcıya saklanmadan taşınabilir.
- Eski sonuç ekranı ve 32 temel motor senaryosu değişmeden çalışır.
- Production build ve native paket kontrolleri başarıyla geçti.
