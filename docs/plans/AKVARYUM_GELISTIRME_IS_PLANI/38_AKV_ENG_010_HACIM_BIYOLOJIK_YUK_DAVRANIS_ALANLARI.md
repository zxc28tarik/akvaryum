# AKV-ENG-010 — Hacim, Biyolojik Yük ve Davranış Alanları

## Durum

`DONE`

## Amaç

Eski motorun tek bir toplamsal litre değeri altında birleştirdiği üç farklı soruyu ayrı sonuçlar hâline getirmek:

1. Akvaryum fiziksel olarak yeterli mi?
2. Seçilen canlıların toplamsal stok yükü ne kadar?
3. Sosyal ve davranışsal uyum nasıl?

## Uygulanan sonuç modeli

Motor sonucu `domains` alanını taşır:

- `domains.volume`
- `domains.bioload`
- `domains.behavior`

### Fiziksel hacim

- Seçilen türler içindeki en yüksek minimum tank hacmi kullanılır.
- Kayıtlı minimum tank uzunluğu ayrıca değerlendirilir.
- Kullanıcı tank uzunluğu vermediyse uzunluk sonucu `not_evaluated` kalır.
- Hacim ve uzunluk birbirinden bağımsız görünür.

### Biyolojik yük

- Eski `neededVol` toplamsal hesabı korunur.
- Bu değer gerçek atık üretimi ölçümü olarak sunulmaz.
- Yöntem `legacy_additive_stocking_proxy_v1`, güven düzeyi `low` olarak işaretlenir.
- Kapasite yüzdesi 100’ün üzerine çıkabilir; sonuç yapay biçimde kırpılmaz.

### Davranış

Aşağıdaki bulgular ayrı davranış sonucuna katılır:

- sürü, grup, çift ve harem kuralları,
- aynı tür ve yakın tür agresyonu,
- avcılık,
- genel agresyon,
- yüzgeç çekiştirme.

pH, sıcaklık ve GH çakışmaları davranış sorunu sayılmaz.

## Geriye dönük uyumluluk

Aşağıdaki eski alanlar korunmuştur:

- `neededVol`
- `bioloadPct`
- `score`
- `verdict`
- mevcut sorun, uyarı ve uyumluluk kayıtları

Yeni sonuçlar yalnız `result.domains` altında eklenmiştir.

## Doğrulama

`npm run check:engine-domains` komutu 13 odaklı senaryoyu çalıştırır.

Kapsanan sınırlar:

- boş ve tek canlı kurulumu,
- fiziksel hacim uygunken toplamsal yükün kritik olması,
- tank hacmi ve tank uzunluğunun ayrı sonucu,
- sosyal uyarı ve avcılık kritik sonucu,
- yüzgeç çekiştirme,
- pH çakışmasının davranış alanına sızmaması,
- eski sonuç alanlarının korunması,
- statik ve Vite production yükleme yolları.

Bu doğrulama GitHub Actions ve Vite build başlangıcına bağlanmıştır.
