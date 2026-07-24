# AKV-DATA-020 — Tatlı Su Veri Partisi 1

**Parti durumu:** DONE  
**Ana görev durumu:** IN_PROGRESS  
**Tamamlanma tarihi:** 24 Temmuz 2026  
**Uygulama PR’ı:** #27

## Amaç

Tatlı su kataloğunu tek seferde büyük ve denetimsiz biçimde büyütmek yerine, kaynaklı ve geri alınabilir küçük partilerle 278 kayıttan 350 kayda çıkarmak.

Bu ilk parti 20 yeni tatlı su balığı ekler.

## Sonuç

| Envanter | Önce | Sonra |
|---|---:|---:|
| Tatlı su canlısı | 278 | 298 |
| Tuzlu su canlısı | 302 | 302 |
| Toplam canlı | 580 | 600 |
| Balık koleksiyonu | 467 | 487 |
| Omurgasız | 63 | 63 |
| Mercan | 50 | 50 |

AKV-DATA-020 hedefi 350 tatlı su kaydıdır. İlk parti sonrasında kalan miktar 52 kayıttır.

## Eklenen kayıtlar

### Küçük rasbora ve danio

1. `Microdevario kubotai` — Yeşil Neon Rasbora
2. `Boraras urophthalmoides` — Ünlem Rasbora
3. `Boraras naevus` — Çilek Rasbora
4. `Danio erythromicron` — Zümrüt Cüce Danio
5. `Sundadanio axelrodi` — Axelrod Rasborası

### Özel tatlı su balıkları

6. `Garra flavatra` — Panda Garra
7. `Gyrinocheilus aymonieri` — Çin Yosun Yiyici
8. `Tateurndina ocellicauda` — Tavus Gudgeon
9. `Dario dario` — Kızıl Badis
10. `Dario hysginon` — Kırmızı Badis

### Dip balıkları ve kedibalıkları

11. `Hara jerdoni` — Asya Taş Kedibalığı
12. `Bunocephalus coracoideus` — Banjo Kedibalığı
13. `Rineloricaria lanceolata` — Mızrak Kuyruklu Vatoz
14. `Farlowella vittata` — Dal Vatozu
15. `Megalechis thoracata` — Benekli Hoplo Kedibalığı

### Killifish, ricefish ve halfbeak

16. `Aplocheilus lineatus` — Altın Harika Killifish
17. `Poropanchax normani` — Norman Lampeye
18. `Oryzias woworae` — Daisy Pirinç Balığı
19. `Dermogenys pusilla` — Güreşçi Yarımgaga
20. `Nomorhamphus liemi` — Celebes Yarımgaga

## Veri modeli

Her yeni canlı iki biçimde tutulur:

1. Mevcut statik ekranların okuyabildiği legacy kayıt.
2. Kaynak, doğrulama ve ayrıntılı bakım alanlarını taşıyan `Inhabitant v1` kaydı.

Canonical kayıtlar şunları taşır:

- Türkçe ve İngilizce ad;
- bilimsel ad, cins ve aile;
- sıcaklık, pH ve GH aralığı;
- yetişkin boyu;
- minimum hacim ve tank uzunluğu;
- sosyal yapı ve grup düzeni;
- mizaç, etkinlik ve yaşam bölgesi;
- beslenme;
- habitat, akıntı, oksijen ve saklanma ihtiyacı;
- bakım zorluğu ve özel uyarılar;
- kaynak ve alan-kaynak bağlantıları;
- doğrulama durumu ve güven düzeyi.

## Kaynaklandırma ilkesi

Yeni kayıtlar iki dış bilgi katmanı ve bir editoryal katman kullanır:

- `fishbase-freshwater-batch-1-2026`: bilimsel ad, taksonomi, yetişkin boyu, dağılım ve bildirilen su aralıkları;
- `seriouslyfish-freshwater-batch-1-2026`: bakım, tank, sosyal yapı, davranış, beslenme ve habitat incelemesi;
- `freshwater-batch-1-editorial-v1`: Türkçe ad, iki dilli kısa özet, görünüm ve ürün içi eşleme.

Kayıtlar `reviewed/medium` durumundadır. Bunun anlamı:

- kaynaklar incelenmiş ve alanlara bağlanmıştır;
- eski 580 kayıt gibi yalnız iç veri değildir;
- ancak bütün bakım sınırları bağımsız ikinci editör tarafından tür tür yeniden doğrulanmadığı için `verified/high` sayılmaz.

Karides ve salyangoz güvenliği bu partide bilinmeyen alan olarak açık bırakılmıştır; tahmin yapılmamıştır.

## Dosya yapısı

```text
data/curation/freshwater-batch-1-part-a.js
data/curation/freshwater-batch-1-part-b.js
data/curation/freshwater-batch-1-part-c.js
data/curation/freshwater-batch-1-part-d.js
data/curation/freshwater-batch-1.js
data/sources/freshwater-batch-1-sources.json
scripts/check-freshwater-batch-1.mjs
scripts/lib/validate-freshwater-batch-1.mjs
```

Dört küçük kayıt dosyası tek parti üreticisine bağlanır. Böylece sonraki veri partileri eski sıkıştırılmış ana veri dosyasını yeniden üretmeden eklenebilir veya geri alınabilir.

## Doğrulama

Yeni komut:

```bash
npm run check:freshwater-batch1
```

Kontrol şunları zorunlu tutar:

- tam 20 yeni legacy ve 20 canonical kayıt;
- parti içi benzersiz kimlikler;
- legacy ve canonical kimlik eşleşmesi;
- eski 278 tatlı su kaydının eksiksiz korunması;
- 298 tatlı su, 302 tuzlu su ve 600 toplam canlı;
- `Inhabitant v1` JSON Schema uyumu;
- bütün kaynak kimliklerinin çözülebilmesi;
- bütün yeni kayıtların `reviewed/medium` olması;
- minimum hacim, tank uzunluğu, sosyal yapı ve bakım zorluğu alanlarının dolu olması;
- statik, Vite production ve Node doğrulama yükleme yolları;
- ortak katalogda 600 kayıt ve balık koleksiyonunda 487 kayıt.

PR #27 doğrulamasında ayrıca şu mevcut kontroller başarıyla geçti:

- veri envanteri ve ortak şema;
- kaynak ve Inhabitant migrasyonu;
- bitki, taban ve mercan kontrolleri;
- bütün motor kuralları ve 32 temel motor senaryosu;
- katalog, ayrıntı paneli ve mobil ana akış;
- öncelik 100 ve tank uzunluğu;
- taksonomi denetimi;
- production build ve native production paket.

## Görevde kalan

AKV-DATA-020 henüz tamamlanmadı.

```text
Mevcut: 298
Hedef: 350
Kalan: 52
```

Sonraki çalışma:

```text
AKV-DATA-020 — Tatlı su veri partisi 2
```

İkinci parti de 15–20 kayıtlık ayrı bir dosya ve bağımsız kaynak doğrulamasıyla hazırlanmalıdır.
