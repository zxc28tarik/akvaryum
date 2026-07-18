# AKV-DATA-011 — Inhabitant v1 Migrasyonu

**Tarih:** 19 Temmuz 2026  
**Durum:** Tamamlandı

## Amaç

Mevcut 580 canlı kaydını kimlik, doğrudan bakım değerleri ve kaynak bağlantıları kaybolmadan ortak `Inhabitant v1` modeline taşımak.

## Geçiş yapısı

Geçiş süresince iki erişim noktası birlikte bulunur:

```js
window.DB.fish;        // Eski ekran uyumluluğu
window.DB.inhabitants; // Yeni Inhabitant v1 modeli
```

Yeni katalog ve arama indeksi `DB.inhabitants` üzerinden oluşturulur. Eski arayüz tamamen yeni modele geçirildikten sonra legacy dizi ayrı bir görevde kaldırılabilir.

## Yeni şema

Yeni sözleşme:

```text
schemas/inhabitant-v1.schema.json
```

Ana alanlar:

- kimlik ve iki dilli ad
- bilimsel ad, kategori ve taksonomi
- su parametreleri
- yetişkin boyu
- minimum ve ek tank hacmi
- sosyal yapı
- davranış
- beslenme
- uyumluluk
- habitat
- bakım
- görünüm ve notlar
- kaynak kimlikleri ve doğrulama durumu
- migrasyon raporu

## Alan taşıma yaklaşımı

### Doğrudan taşınan alanlar

- `id`
- Türkçe ve İngilizce ad
- bilimsel ad
- su tipi, sıcaklık, pH, GH ve varsa tuzluluk
- yetişkin boyu
- minimum tank hacmi ve canlı başına ek hacim
- yüzme katmanı
- yüzgeç ısırma ve uzun yüzgeç bilgisi
- beslenme türü
- bitki ve mercan güvenliği
- silüet ve renkler
- Türkçe ve İngilizce notlar
- bütün mevcut kaynak kimlikleri

### Kurallı türetilen alanlar

- durum ve etiketler
- not yoksa doğrulama beklediğini bildiren özet
- sürü sayısından sosyal mod
- eski agresyon alanından genel mizaç ve aynı tür agresyonu

Türetilen alanlar `legacy-inhabitant-migration-v1` kaynak kimliğini taşır ve doğrulanmış sayılmaz.

### Bilinmeyen bırakılan alanlar

Eski veri setinde bulunmayan aşağıdaki alanlara sahte değer yazılmaz:

- `social.territoriality`
- `behavior.activity`
- `feeding.feedingDifficulty`
- `habitat.flow`
- `habitat.oxygen`
- `care.difficulty`

Bu alanlar her kayıtta `unknown` olarak tutulur ve `migration.unknownFields` listesine yazılır.

## Kaynak modeli

Kaynak kataloğu sürümü 2'ye yükseltildi. Yeni migrasyon kaynağı:

```text
legacy-inhabitant-migration-v1
```

Her yeni kayıt:

- eski kaynak kimliklerini korur,
- migrasyon kaynağını ekler,
- doğrudan ve türetilen alanların kaynaklarını ayırır,
- `needs_review/low` durumunda kalır.

## Otomatik doğrulama

```bash
npm run check:migration
```

Kontrol şu durumlarda hata verir:

- eski veya yeni kayıt sayısı 580 değilse,
- kimlik kaybolur veya tekrar ederse,
- ad veya bilimsel ad değişirse,
- sıcaklık, pH veya GH aralığı değişirse,
- yetişkin boyu değişirse,
- tank hacmi veya ek hacim değişirse,
- eski kaynak kimliği kaybolursa,
- kaynak kimliği katalogda bulunmazsa,
- alan-kaynak bağlantısı desteklenmiyorsa,
- kayıt `Inhabitant v1` şemasından geçmezse,
- yeni katalog hâlâ legacy modeli kullanırsa.

Migrasyon kontrolü Vite `buildStart` aşamasına ve GitHub Actions hattına bağlanmıştır.

## Kabul sonucu

GitHub Actions `Vite doğrulama` koşusu başarılı tamamlandı:

```text
Legacy kayıt: 580
Inhabitant v1 kayıt: 580
Korunan kimlik: 580
Balık: 467
Omurgasız: 63
Mercan: 50
Kayıp doğrudan değer: 0
Kayıp kaynak kimliği: 0
```

Aynı koşuda envanter, eski şema, sınıflandırma, kaynak modeli, yeni katalog, production build ve native paket kontrolleri de geçti.

## Ek düzeltme

CI doğrulaması sırasında GitHub’daki iki eski `.runtime` canlı arşivinin eksik yüklendiği tespit edildi. Tatlı ve tuzlu su arşivleri yerelde korunmuş tam kaynaklarla yenilendi; yeni Git blob özetleri tam yerel kaynaklarla eşleşti.

## Sonraki görev

`AKV-DATA-012` kapsamında bilimsel adlar ve kimlikler tekrar, eş ad ve kabul edilmiş taksonomi açısından taranacaktır.
