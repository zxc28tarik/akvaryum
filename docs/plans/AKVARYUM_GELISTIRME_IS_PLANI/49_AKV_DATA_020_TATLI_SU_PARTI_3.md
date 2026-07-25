# AKV-DATA-020 — Tatlı Su Veri Partisi 3

**Durum:** Tamamlandı  
**Tarih:** 25 Temmuz 2026

## Kapsam

Tatlı su kataloğuna üçüncü veri partisi olarak **130 yeni kayıt** eklendi:

- 16 tür `reviewed/medium`
- 114 tür `draft/needs_review/low`
- mavi-göz/rainbowfish, tetra, rasbora/danio, barb, canlı doğuran, kedibalığı/loach, goby, gourami/betta ve cichlid grupları

İlk 16 kayıt tür bazlı inceleme yaklaşımıyla hazırlandı. Kalan 114 kayıt hızlı katalog büyümesi için toplu aday havuzu olarak oluşturuldu; bunların bilimsel ad, aile ve bütün bakım değerlerinin tür bazında dış doğrulama beklediği hem kaynak kaydında hem canlı notunda açıkça belirtilir.

## Güven ayrımı

- Önceki iki parti: 40 `reviewed/medium`
- Üçüncü partinin incelenen bölümü: 16 `reviewed/medium`
- Üçüncü partinin toplu bölümü: 114 `draft/needs_review/low`
- Eski 580 kayıt: dış inceleme bekliyor
- Toplam incelenen yeni kayıt: 56
- Toplam dış inceleme bekleyen kayıt: 694

Taslak kayıtlar doğrulanmış veya kesin bakım tavsiyesi gibi gösterilmez. Kategori profilleri yalnız başlangıç taslağıdır; tür bazlı doğrulama turlarında gerçek kaynak değerleriyle değiştirilecektir.

## Envanter sonucu

- Eski tatlı su kayıtları: 278
- Yeni tatlı su kayıtları: 170
- Tatlı su toplamı: **448**
- Tuzlu su toplamı: **302**
- Toplam canlı: **750**
- Balık kataloğu: **637**
- Omurgasız: 63
- Mercan: 50

AKV-DATA-020 hedefi 350 tatlı su kaydıydı. Sonuç **448/350** oldu; hedef 98 kayıt aşıldı. Sprint 10'un 750 toplam canlı hedefi de karşılandı.

## Temizlenen çakışmalar

Toplu genişleme sırasında şu engelleyici tekrarlar yakalanıp düzeltildi:

- İkinci partide bulunan `Stiphodon semoni` tekrar eklenmedi; üçüncü kayıt `Stiphodon atropurpureus` olarak değiştirildi.
- Eski katalogdaki `Desmopuntius pentazona` tekrarından vazgeçilip `Enteromius candens` eklendi.
- Eski katalogdaki `Oliotius oligolepis` tekrarından vazgeçilip `Enteromius kerstenii` eklendi.
- Eski `glow-light-danio` kaydıyla çakışan taslak kaldırılıp `Danio flagrans` eklendi.
- `Rhinogobius` cinsinin aile eşlemesi katalog genelinde `Gobiidae` olarak tekleştirildi.

## Doğrulama

`check:freshwater-batch3` ve tam GitHub Actions hattı şunları doğrular:

- 130 legacy ve 130 canonical kayıt
- 16 reviewed ve 114 draft ayrımı
- Önceki partilerle kimlik çakışmaması
- Mevcut katalogla bilimsel ad çakışmaması
- `Inhabitant v1` şema uyumu
- Bütün kaynak ve alan-kaynak bağlantılarının çözülmesi
- 278 eski tatlı su kaydının korunması
- 448/302/750 envanteri
- statik, Vite production ve Node yükleme yolları
- taksonomi engelleyici hata bulunmaması
- mevcut 32 temel motor senaryosu
- production build ve native paket

## Sonraki çalışma

AKV-DATA-020 kayıt adedi bakımından tamamlandı. Sonraki veri işi `AKV-DATA-021` tuzlu su veri büyümesidir. Bunun yanında 114 toplu taslak, ayrı doğrulama turlarında topluca `reviewed` seviyesine yükseltilecektir.
