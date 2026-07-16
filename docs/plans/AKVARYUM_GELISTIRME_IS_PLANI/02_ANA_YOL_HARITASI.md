# 02 — Ana Yol Haritası

## Ana hedef

AKVARYUM’u şu dört niteliğe ulaştırmak:

1. **Geniş:** Yaygın ve önemli akvaryum canlıları ile ekipman seçeneklerini kapsar.
2. **Güvenilir:** Her önemli veri alanı kaynak ve doğrulama tarihi taşır.
3. **Açıklanabilir:** Her uyumluluk sonucu hangi kurala dayandığını söyler.
4. **Sürdürülebilir:** Yeni veri ve özellik eklemek mevcut kodu kırmaz.

## Aşama 0 — Projeyi sabitle

**Amaç:** Yeni geliştirmeden önce mevcut davranışı koruyacak tabanı kurmak.

### Çıktılar

- Mevcut kaynakların normal proje yapısına çıkarılması.
- Veri ve motor için temel otomatik testler.
- Mevcut 580 canlı, 26 bitki ve 8 tabanın envanter raporu.
- Bilinen hatalar listesi.
- Veri doğrulayıcı ilk sürüm.

### Tamamlanma ölçütü

- Tüm mevcut veriler doğrulayıcıdan geçiyor veya açık hata listesinde.
- En az bir tatlı su ve bir tuzlu su uçtan uca senaryo testte çalışıyor.
- Ana sayfa, sihirbaz ve sonuç ekranı mobil/masaüstü duman testinden geçiyor.

## Aşama 1 — Veri temelini yeniden kur

**Amaç:** Canlı, bitki, taban, dekor ve ekipman verilerini ayrı, şemalı dosyalara taşımak.

### Çıktılar

- JSON veya TypeScript veri şemaları.
- `entityType`, `category`, `family`, `sources`, `verifiedAt`, `confidence` alanları.
- Balık / omurgasız / mercan ayrımı.
- Tekrarlı kimlik ve bilimsel ad kontrolü.
- Veri sürümü ve migrasyon kuralı.

### Tamamlanma ölçütü

- Kod içinde yüzlerce satırlık canlı tanımı kalmaz.
- Her kayıt şema doğrulamasından geçer.
- Eski kayıt kimlikleri bozulmadan yeni modele çevrilir.

## Aşama 2 — Kaliteli veri genişlemesi

**Amaç:** Sayıyı artırırken veri kalitesini korumak.

### Hedef basamakları

| Basamak | Toplam canlı | Bitki | Taban | Açıklama |
|---|---:|---:|---:|---|
| Başlangıç | 580 | 26 | 8 | Mevcut durum |
| Veri sürümü 1 | 750 | 40 | 15 | Yaygın eksikleri kapat |
| Veri sürümü 2 | 1.000 | 60 | 22 | Bölgesel ve uzman türleri ekle |
| Veri sürümü 3 | 1.300 | 80+ | 30+ | Geniş katalog ve ayrıntılı bakım bilgisi |

> Sayı tek başına başarı ölçütü değildir. Eksik kaynaklı veya düşük kaliteli kayıtlar hedefe dahil edilmez.

### Tamamlanma ölçütü

- Yeni kayıtların %100’ünde en az iki kaynak veya bir güçlü birincil/kurumsal kaynak bulunur.
- Kayıtların en az %95’inde zorunlu bakım alanları doludur.
- Her 25 kayıtlık parti otomatik doğrulama ve editör kontrolünden geçer.

## Aşama 3 — Uyumluluk motoru 2.0

**Amaç:** Basit eşleşme mantığını katmanlı ve açıklanabilir hale getirmek.

### Çıktılar

- Parametre, davranış, avcılık, tank geometrisi, sürü/cinsiyet, taban, akıntı ve resif kuralları.
- Tür çifti istisna tablosu.
- Sorun kodları ve önem derecesi.
- Çözüm önerisi üreten kural çıktısı.
- Yeni ağırlıklı skor sistemi.

### Tamamlanma ölçütü

- En az 100 referans akvaryum senaryosunda beklenen sonuçlar test edilir.
- Her uyarı bir `ruleId` ve açıklama taşır.
- Çelişkili ortak parametre olduğunda sonuç “ortak aralık yok” gösterir.

## Aşama 4 — Ürün deneyimi

**Amaç:** Kullanıcının yalnız kurulum yapmasını değil, karar vermesini kolaylaştırmak.

### Çıktılar

- Gelişmiş arama ve filtreleme.
- İki ila dört canlıyı karşılaştırma.
- Kurulum kaydetme ve paylaşılabilir bağlantı.
- Favoriler ve son kurulumlar.
- Canlı/bitki/taban ayrıntı sayfaları.
- Hatalı bilgi bildirme mekanizması.
- Mobil ve erişilebilir arayüz iyileştirmeleri.

## Aşama 5 — Teknik üretim kalitesi

**Amaç:** Projeyi güvenli, hızlı ve bakımı kolay hale getirmek.

### Çıktılar

- Vite + React + TypeScript.
- Modüler kaynak yapısı.
- Unit, integration ve E2E testleri.
- GitHub Actions doğrulama hattı.
- Performans bütçeleri.
- Otomatik sürümleme ve changelog.

## Aşama 6 — Yayın ve büyüme

**Amaç:** Siteyi arama motorlarından bulunabilen, ölçülebilen ve içerik üretilebilen ürüne dönüştürmek.

### Çıktılar

- İndekslenebilir tür ve rehber sayfaları.
- Sitemap, meta veriler ve yapılandırılmış veri.
- Gizlilik dostu analitik.
- İçerik yayın takvimi.
- Veri katkı ve düzeltme süreci.

## Aşama 7 — İleri özellikler

Bu aşama önceki temel tamamlanmadan başlamamalıdır.

- Musluk suyu değerine göre öneri.
- Tank ölçüsü ve yüzme uzunluğuna göre hesap.
- Bütçe ve ekipman sınıfı planlama.
- Bakım takvimi dışa aktarma.
- Kurulum varyantlarını karşılaştırma.
- Kullanıcı hesabı veya yerel profil.
- Topluluk kurulumları ve moderasyon.

## Değişmez geliştirme ilkeleri

- Önce veri kalitesi, sonra veri sayısı.
- Genel kural + istisna tablosu birlikte kullanılır.
- Kullanıcıya yalnız “uyumsuz” değil, **neden ve çözüm** gösterilir.
- Kimlikler yayınlandıktan sonra değiştirilmez; gerekiyorsa `aliases` kullanılır.
- Türkçe ve İngilizce içerik aynı değişiklikte tamamlanır.
- Yeni özellik test ve kabul kriteri olmadan bitmiş sayılmaz.
