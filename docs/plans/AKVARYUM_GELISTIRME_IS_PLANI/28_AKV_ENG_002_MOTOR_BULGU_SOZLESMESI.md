# AKV-ENG-002 — Motor Bulgu Sözleşmesi

**Tarih:** 20 Temmuz 2026  
**Durum:** Tamamlandı

## Amaç

Eski motor sorun, uyarı ve önerileri yalnız `title` ve `desc` alanlarıyla üretiyordu. Bu yapı mevcut kartları göstermek için yeterli olsa da:

- aynı kuralı güvenilir biçimde tanımlamıyordu;
- önem seviyesi nesne içinde bulunmuyordu;
- neden, etki ve çözüm birbirinden ayrılmıyordu;
- testler başlığa bağlı kalıyordu;
- gelecekteki sonuç kartları ve alt skorlar için sağlam bir sözleşme oluşturmuyordu.

## Engine Finding v1

Yeni sözleşme `schemas/engine-finding-v1.schema.json` dosyasındadır. Her motor bulgusu şu zorunlu alanları taşır:

```js
{
  ruleId,
  severity,
  title,
  desc,
  reason,
  impact,
  resolution,
  subjects,
  evidence
}
```

### Alanlar

- `ruleId`: Değişmeyen büyük harfli kural kimliği.
- `severity`: `critical`, `warning` veya `info`.
- `title`: Mevcut sonuç kartının başlığı.
- `desc`: Eski arayüzle geriye dönük uyumlu açıklama.
- `reason`: Kuralın neden çalıştığı.
- `impact`: Sorun çözülmezse veya öneri uygulanırsa beklenen etki.
- `resolution`: Kullanıcının yapabileceği işlem.
- `subjects`: Bulguyla ilgili canlı, bitki veya taban kimlikleri.
- `evidence`: Kuralın dayandığı yapılandırılmış ek bilgi.

## Geriye dönük uyumluluk

Mevcut arayüzün kullandığı alanlar kaldırılmadı:

- sorun, uyarı ve önerilerde `title` ile `desc` korunur;
- ekipman önerilerinde `label`, `name` ve `desc` korunur;
- ikili uyumluluk kayıtlarında `a`, `b`, `status` ve `reasons` korunur.

Yeni alanlar bunların üzerine eklenir. Böylece mevcut sonuç ekranı çalışmaya devam ederken yeni arayüzler neden/etki/çözüm kartlarını doğrudan kullanabilir.

## Tanımlı kural alanları

Toplam **27 sabit kural kimliği** vardır.

### Genel motor bulguları

- `WATER_TYPE_MISMATCH`
- `TANK_CAPACITY_EXCEEDED`
- `TANK_CAPACITY_HIGH`
- `TANK_CAPACITY_AVAILABLE`
- `SPECIES_MINIMUM_VOLUME`
- `SCHOOLING_MINIMUM`
- `PARAMETER_PH_NO_COMMON_RANGE`
- `PARAMETER_TEMPERATURE_NO_COMMON_RANGE`
- `PARAMETER_GH_NO_COMMON_RANGE`
- `PLANT_DAMAGE_RISK`
- `PLANT_CO2_RECOMMENDED`
- `SUBSTRATE_WATER_MISMATCH`
- `REEF_UNSAFE_INHABITANT`
- `COMPOSITION_HEALTHY`

### İkili uyumluluk sonuçları

- `PAIRWISE_SELF`
- `PAIRWISE_COMPATIBLE`
- `PAIRWISE_CAUTION`
- `PAIRWISE_INCOMPATIBLE`

Bu aşamada eski ikili uyumluluk nedenleri metin olarak korunur. Avcı-av, aynı tür agresyonu ve tür çifti istisnaları kendi motor görevlerinde daha ayrıntılı alt kural kimliklerine ayrılacaktır.

### Ekipman önerileri

- `EQUIPMENT_FILTER_FLOW`
- `EQUIPMENT_HEATER_POWER`
- `EQUIPMENT_REEF_LIGHT`
- `EQUIPMENT_PROTEIN_SKIMMER`
- `EQUIPMENT_SALTWATER_FLOW`
- `EQUIPMENT_LIVE_ROCK`
- `EQUIPMENT_REFRACTOMETER`
- `EQUIPMENT_FRESHWATER_LIGHT`
- `EQUIPMENT_CO2_SYSTEM`

## Geçiş yöntemi

`engine-finding-contract.js`, mevcut motorun çıktısını Vite production build içinde standart sözleşmeye dönüştürür.

Bu yöntem bilinçli olarak seçildi:

1. Kökteki çalışan statik sürüm değiştirilmez.
2. Mevcut motor davranışı ve skor hesabı korunur.
3. Vite production motoru yeni sözleşmeyi hemen kullanabilir.
4. Motor kuralları sonraki görevlerde tek tek yeni çekirdeğe taşınabilir.

Tanınmayan yeni bir eski motor başlığı otomatik ve belirsiz bir kimliğe dönüştürülmez. Geçiş katmanı hata üretir; yeni kuralın bilinçli olarak sözleşmeye eklenmesi gerekir.

## Otomatik doğrulama

```bash
npm run check:engine-findings
```

Kontrol şunları doğrular:

- Engine Finding v1 JSON Schema uyumu;
- dokuz zorunlu alanın tamamı;
- önem seviyesinin bulunduğu listeyle uyumu;
- 27 kural kimliğinin benzersizliği;
- sorun, uyarı ve öneri çıktıları;
- ikili uyumluluk kayıtları;
- tatlı ve tuzlu su ekipman önerileri;
- Türkçe ve İngilizce çıktılar;
- tanınmayan veya `UNCLASSIFIED` çıktı bulunmaması.

Kontrol bağımsız komuta, GitHub Actions hattına ve Vite production build başlangıcına bağlanmıştır.

## Sonuç

- `AKV-ENG-002` kabul kriteri karşılandı.
- Her kullanıcıya dönük motor bulgusu `ruleId`, önem seviyesi ve çözüm taşır.
- Neden, etki ve çözüm ayrı alanlarda kullanılabilir.
- Eski sonuç kartları kırılmadı.
- `AKV-UI-022` neden/etki/çözüm kartlarına başlayabilir.
- `AKV-TEST-010` altın senaryoları artık başlık yerine kural kimliği üzerinden doğrulayabilir.
