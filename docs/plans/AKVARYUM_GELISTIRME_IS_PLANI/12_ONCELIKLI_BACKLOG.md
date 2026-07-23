# 12 — Öncelikli Backlog

## P0 — Temel ve hata önleme

| Kimlik | Durum | Görev | Bağımlılık | Kabul özeti |
|---|---|---|---|---|
| AKV-ARCH-001 | REVIEW | Vite + React proje iskeleti kur | Yok | Mevcut ana akış production build’de çalışır |
| AKV-ARCH-002 | DONE | Runtime gzip/eval yükleyicisini kaldır | ARCH-001 | Üretimde `eval` ve Babel standalone yok |
| AKV-TEST-001 | REVIEW | Veri envanter testi oluştur | Yok | Sayılar ve benzersiz kimlikler doğrulanır |
| AKV-DATA-001 | DONE | Ortak veri şeması oluştur | ARCH-001 | Şema build sırasında çalışır |
| AKV-DATA-002 | DONE | `entityType/category/family` alanlarını ekle | DATA-001 | 580 kayıt kategorilenir |
| AKV-DATA-003 | DONE | Kaynak ve doğrulama modeli ekle | DATA-001 | Kayıtlar kaynak kimliği taşıyabilir |
| AKV-ENG-001 | DONE | Parametre ortak aralık hatasını düzelt | TEST-001 | Çakışma yoksa sonuç `null` ve kritik sorun |
| AKV-ENG-002 | DONE | Kural çıktı tipini standartlaştır | DATA-001 | Her sonuç `ruleId/severity/resolution` taşır |
| AKV-ENG-003 | DONE | Kritik sorun varken sağlıklı kompozisyon önerisini engelle | TEST-010A | Kritik bulgu bulunan sonuçta `COMPOSITION_HEALTHY` yok |
| AKV-I18N-001 | TODO | TR/EN anahtar bütünlüğü testi | TEST-001 | Eksik veya fazla anahtar CI’da hata verir |
| AKV-UI-001 | DONE | Mobil ana akış duman testi ve düzeltme | ARCH-001 | 360 px genişlikte ortak taşma koruması çalışır |

### Aktif çalışma notu — 23 Temmuz 2026

- `vite-app/` altında Vite + React geçiş yapısı kuruldu; kökteki mevcut statik sürüm korunuyor.
- `AKV-ARCH-002` tamamlandı: production paketinden tarayıcı içi Babel, `eval`, `DecompressionStream` ve runtime `.gz.b64` yükleme kaldırıldı.
- `AKV-DATA-001` tamamlandı: ortak JSON Schema, build başlangıcı ve GitHub Actions doğrulaması kuruldu.
- `AKV-DATA-002` tamamlandı: 580 canlı kaydı `entityType`, kontrollü `category` ve `taxonomy` alanlarıyla zenginleştirildi.
- Sınıflandırma sonucu: 256 tatlı su balığı, 211 deniz balığı ve 113 omurgasız/mercan kaydı.
- 580 kaydın tamamında aile alanı var; aileler dış kaynak doğrulaması tamamlanana kadar `inferred` durumunda tutuluyor.
- 579 kaydın cinsi bilimsel addan çıkarıldı. Yapay melez `flowerhorn` kaydı `needs_review` olarak işaretlendi.
- `AKV-DATA-003` tamamlandı: kaynak kataloğu ve ayrı kaynak/doğrulama JSON Schema eklendi.
- Eski kayıtların tamamı bilinçli olarak `needs_review/low` durumda; dış kaynaklarla doğrulanmadan hiçbir kayıt `verified` sayılmıyor.
- `AKV-DATA-010` tamamlandı: canlılar balık, omurgasız ve mercan koleksiyonlarına ayrıldı; 580 benzersiz kayıt ortak arama indeksinde bulunuyor.
- `AKV-DATA-011` tamamlandı: 580 legacy kayıt `Inhabitant v1` modeline kimlik değiştirmeden taşındı.
- Yeni ana erişim `DB.inhabitants`; `DB.fish` yalnız eski ekran uyumluluğu için korunuyor.
- Adlar, bilimsel adlar, su aralıkları, boy, tank hacmi ve bütün eski kaynak kimlikleri birebir kayıp testinden geçti.
- `AKV-DATA-012` tamamlandı: kimlik, bilimsel ad, ortak ad, açık nomenklatür ve cins-aile iç tutarlılığı tarandı; 28 inceleme bulgusu rapora bağlandı.
- `AKV-DATA-013` tamamlandı: legacy katalog sırasındaki ilk 100 kayıt ürün öncelik seti olarak sabitlendi.
- İlk 100 kaydın `social.territoriality` ve `care.difficulty` alanları mevcut tank, boy, mizaç, beslenme, su aralığı ve grup kısıtlarından türetildi.
- Zorluk dağılımı 69 beginner, 18 intermediate, 5 advanced ve 8 expert; bölgesellik dağılımı 72 none, 19 medium ve 9 high.
- `AKV-DATA-014` tamamlandı: ilk 100 kaydın `tank.minLengthCm` alanı hacim ve vücut/yüzme alt sınırlarının büyüğüyle türetildi.
- Tank uzunluğu dağılımında 49 kayıt 75 cm, 12 kayıt 90 cm, 12 kayıt 100 cm; en büyük sonuç 60 cm pacu için 300 cm oldu.
- 81 kayıtta hacim, 13 kayıtta vücut/yüzme alanı belirleyici oldu; 6 kayıtta iki sınır eşitti.
- `AKV-PLANT-001` tamamlandı: 26 eski bitki kimlik kaybı olmadan `Plant v1` modeline taşındı.
- Yeni bitki erişimi `DB.aquaticPlants`; eski `DB.plants` arayüz uyumluluğu için korunuyor.
- 286 doğrudan alan karşılaştırması geçti. Su, büyüme, beslenme, boy ve çoğaltma alanlarında toplam 260 açık eksik işareti bulunuyor; hiçbirine tahmini değer yazılmadı.
- Bitki dağılımı: 14 beginner, 10 intermediate, 2 advanced; 15 CO₂ gerektirmeyen ve 11 CO₂ gerekli kayıt.
- `AKV-SUB-001` tamamlandı: 8 eski taban kaydı kimlik kaybı olmadan `Substrate v1` modeline taşındı.
- Yeni taban erişimi `DB.aquariumSubstrates`; eski `DB.substrates` arayüz uyumluluğu için korunuyor.
- 72 doğrudan alan karşılaştırması geçti. Tane boyu, güvenlik, kullanım derinliği, yenileme ve besin alanlarında toplam 96 açık eksik işareti bulunuyor; hiçbirine tahmini değer yazılmadı.
- Taban dağılımı: 5 sand, 1 gravel, 1 soil, 1 rock; pH etkisi 1 lower, 4 neutral, 3 raise.
- `AKV-ENG-001` tamamlandı: pH, sıcaklık ve GH toplu kesişiminde ortak aralık bulunamadığında önceki aralığın korunması kaldırıldı.
- Ortak aralık yoksa ilgili parametre artık `null`; çakışan tür çiftleri Türkçe/İngilizce kritik sorun olarak gösteriliyor.
- 10 motor sınır senaryosu `npm run check:engine-params` komutuna, GitHub Actions hattına ve Vite production build başlangıcına bağlandı.
- `AKV-ENG-002` tamamlandı: sorun, uyarı, öneri, ikili uyumluluk ve ekipman çıktıları Engine Finding v1 sözleşmesine geçirildi.
- 27 sabit kural kimliği ve dokuz zorunlu alan bulunuyor: `ruleId`, `severity`, `title`, `desc`, `reason`, `impact`, `resolution`, `subjects`, `evidence`.
- Eski `title/desc`, uyumluluk ve ekipman alanları korunuyor; yeni sözleşme Vite production motoruna uyumluluk katmanı olarak ekleniyor.
- `npm run check:engine-findings` JSON Schema, Türkçe/İngilizce çıktılar ve 27/27 kural kimliği için CI ve build başlangıcında çalışıyor.
- `AKV-TEST-010A` tamamlandı: 23 analiz ve 2 ekipman olmak üzere ilk 25 altın motor senaryosu oluşturuldu.
- `AKV-TEST-010B` tamamlandı: yalnız yüksek riskli 7 ek senaryoyla temel paket 32 senaryoya çıkarıldı.
- Yeni senaryolar hacim eşikleri, ters su tipi, beta çoğulluğu, palyaço/tang davranışı ve yanlış resif uyarısı üretmeme durumlarını kapsıyor.
- Testler `qty: 2` beta seçiminin eski kavga kuralını atladığını buldu; motor sağlık koruması v2 bu durumu kritik uyumsuzluk olarak düzeltiyor.
- Sabit 100 altın test hedefi iptal edildi. Bundan sonra yalnız yeni özellik veya gerçek hata için gerekli kadar senaryo eklenecek.
- `npm run check:engine-golden` 32 temel senaryoyu, 27/27 kural kimliğini ve kritik sonuç sağlık korumasını CI/build başlangıcında doğruluyor.
- `AKV-ENG-003` tamamlandı: kritik sorun bulunan sonuçlardan `COMPOSITION_HEALTHY` / “Güzel kompozisyon” önerisi kaldırılıyor.
- Beş yanlış sağlıklı öneri v1.1 altın beklentisinde kaldırıldı; ham İngilizce motor, kök statik sürüm ve Vite production yolu aynı korumayla doğrulanıyor.
- `AKV-UI-010` tamamlandı: canlı seçim adımına tümü/balık/omurgasız/mercan kategorileri ve sekiz gelişmiş filtre eklendi.
- Filtreler URL sorgusunda korunuyor; seçili canlılar filtre dışında kalsa bile ayrı bölümde görünür ve adetleri yönetilebilir.
- Liste 36 kayıtlık dilimlerle açılır; Türkçe/İngilizce arayüz, kök statik sürüm ve Vite production yolu aynı filtre modelini kullanır.
- `AKV-UI-011` tamamlandı: arama Türkçe/İngilizce ortak ad, bilimsel ad, eş ad, cins, aile ve kimlik alanlarında çalışıyor.
- Arama modeli sürüm 2 oldu; mevcut `q` URL alanı ve diğer filtrelerle birleşik çalışma korunuyor.
- `npm run check:catalog-filters` URL, filtreler, sıralama ve altı odaklı bilimsel/eş ad senaryosunu CI/build başlangıcında doğruluyor.
- `AKV-UI-012` tamamlandı: katalog kartlarından açılan iki dilli canlı ayrıntı paneli genel bilgi, su/tank, davranış/bakım, uyumluluk/habitat ve kaynak/doğrulama bölümlerini gösteriyor.
- Eksik alanlara değer uydurulmuyor; `needs_review` ve düşük güvenli kayıtlar dış kaynak doğrulaması beklediği belirtilerek gösteriliyor.
- `npm run check:inhabitant-detail` 10 odaklı senaryoyla canonical/legacy veri, kaynak çözümleme, erişilebilir dialog ve iki production yükleme yolunu doğruluyor.
- `AKV-UI-001` tamamlandı: 360 px için yatay taşma koruması, tek sütun mobil düzen, güvenli alan destekli alt gezinme ve çalışma anı taşma raporu eklendi.
- Bilinçli yatay kaydırılan tablo ve tarif şeritleri hata sayılmıyor; yalnız gerçek ekran dışı taşmalar raporlanıyor.
- `npm run check:mobile-flow` 7 odaklı senaryoyla taşma algılama, mobil kırılımlar ve iki production yükleme yolunu doğruluyor.
- `AKV-ENG-011` tamamlandı: motor sürü/grup/koloni minimumunu, tam çift sayısını, harem minimumunu ve yalnız kayıtlı veri varsa erkek–dişi oranını değerlendiriyor.
- Mevcut 580 kayda cinsiyet oranı uydurulmadı; oran veya kullanıcı cinsiyet adedi yoksa motor tahmin yapmadan geçiyor.
- `npm run check:engine-social` 15 odaklı senaryoyla dört sosyal kuralı, skor etkisini, Türkçe/İngilizce çıktıyı ve eski sürü uyarısının çoğaltılmamasını doğruluyor.
- `AKV-ENG-012` tamamlandı: aynı türden çoklu bireyler ve aynı cinse ait farklı türler, canonical agresyon/bölgesellik verileriyle değerlendiriliyor.
- Düşük güvenli türetilmiş veriler yalnız uyarı üretir; beta ve mevcut ikili dikkat/uyumsuzluk sonuçları ikinci kez üretilmez.
- `npm run check:engine-conspecific` 14 odaklı senaryoyla aynı tür, aynı cins, tekrar engeli, skor etkisi ve Türkçe/İngilizce çıktıyı doğruluyor.
- `AKV-ENG-010` tamamlandı: fiziksel tank hacmi, düşük güvenli toplamsal stok yükü ve sosyal/davranış uyumu `result.domains` altında ayrı sonuçlara dönüştürüldü.
- `npm run check:engine-domains` 13 odaklı senaryoyla hacim/uzunluk ayrımını, stok yükünü, davranış bulgularını ve eski sonuç alanlarının korunmasını doğruluyor.
- `AKV-ENG-013` tamamlandı: kaynaklı ağız genişliği, yutulabilir av boyu eşiği ve güvenli/riskli tür istisnalarını kullanan avcı–av profil sözleşmesi eklendi.
- Production katalogda henüz kaynaklı avcı profili yoktur; hiçbir canlıya ölçü uydurulmadı ve profilsiz türlerde eski davranış korunuyor.
- `npm run check:engine-predation` 15 odaklı senaryoyla profil şemasını, fallback’i, istisnaları, güven düzeyini, TR/EN çıktıyı ve production yükleme sırasını doğruluyor.
- `AKV-CORAL-001` tamamlandı: 18 soft, 20 LPS ve 12 SPS olmak üzere 50 mercanın `habitat.light`, `habitat.flow` ve `compatibility.coralAggression` alanları dolduruldu.
- Mercan profilleri kategori/cins bakım kurallarından düşük güvenle türetildi; bütün kayıtlar `needs_review/low` kalıyor ve tür bazlı dış kaynak doğrulaması bekliyor.
- `npm run check:corals` gerçek 580 kayıt üzerinde 11 odaklı kontrolle 50/50 ışık, 50/50 akıntı, 50/50 agresyon, kaynak bağlantısı ve production entegrasyonunu doğruluyor.
- `AKV-ENG-014` tamamlandı: birleşik resif uyarısı soft/LPS/SPS mercan ile karides, salyangoz, yengeç ve çift kabuklu hedefleri için ayrı değerlendirmelere bölündü.
- Hedefe özel alan yoksa omurgasız riski uydurulmuyor; soft/LPS/SPS için yalnız gerektiğinde genel mercan alanına veya eski `reefSafe` alanına kontrollü fallback uygulanıyor.
- `npm run check:engine-reef` 15 odaklı senaryoyla yedi kural kimliğini, TR/EN çıktıyı, fallback sırasını, eski birleşik uyarının kaldırılmasını ve production bağlantılarını doğruluyor.
- `AKV-ENG-015A` tamamlandı: ilk 25 kaynaklı tür çifti istisnası production veri ve motor katmanına bağlandı.
- İlk parti 9 uyumlu, 11 koşullu, 3 dikkat ve 2 uyumsuz kayıttan oluşuyor; dört dış bakım kaynağına bağlanan bütün kayıtlar `verified/medium` durumda.
- `AKV-ENG-015B` tamamlandı: ikinci 25 kaynaklı tür çifti istisnası aynı şema ve motor katmanına eklendi.
- İkinci parti 14 uyumlu, 6 koşullu, 2 dikkat ve 3 uyumsuz kayıttan oluşuyor; beş yeni dış bakım kaynağına bağlanan bütün kayıtlar `verified/medium` durumda.
- İstisnalar genel ikili davranış/avcılık/resif bulgularının üstüne yazılıyor; pH, sıcaklık, GH, su tipi, tank ve sosyal grup kuralları bağımsız olarak korunuyor.
- Toplam 50 kayıt 23 uyumlu, 17 koşullu, 5 dikkat ve 5 uyumsuz sonuçtan oluşuyor.
- `npm run check:engine-pairs` 19 odaklı senaryoyla dört istisna kuralını, çift yönlü/yönlü ilişkiyi, TR/EN çıktıyı, dokuz kaynak çözümlemesini ve production bağlantılarını doğruluyor.
- `AKV-ENG-015` ana görevi 50/50 tamamlandı.
- `AKV-ENG-016` tamamlandı: genel puan 30 çevresel uyum, 30 davranış/sosyal uyum, 25 tank/biyolojik yük ve 15 habitat/bakım puanına ayrıldı.
- Her alt puan durum, puan, üst sınır, ilgili kural kimlikleri ve Türkçe/İngilizce kısa açıklama taşıyor.
- Kritik çevresel sonuç toplam puanı en fazla 39, kritik davranış sonucu 49, kesin tank yetersizliği 59 ve kritik habitat sonucu 69 yapıyor.
- `npm run check:engine-scores` 13 odaklı senaryoyla dört bölüm toplamını, kritik üst sınırları, küçük uyarı kesintilerini, boş seçim davranışını ve iki dili doğruluyor.
- Sıradaki iş `AKV-UI-021`: dört alt puanı sonuç ekranında görünür hâle getirmek.
- Sosyal bakım, tank uzunluğu, mercan bakım profilleri, Plant v1 ve Substrate v1 değerleri tür bazlı doğrulanmış veri değildir; kayıtlar `needs_review/low` durumunda tutuluyor.
- Gerçek cihaz görsel ince ayarı gerekirse somut taşma raporu üzerinden küçük düzeltme yapılacak; ağır bir tarayıcı test altyapısı kurulmadı.

## P1 — Veri modeli ve katalog

| Kimlik | Durum | Görev | Bağımlılık | Kabul özeti |
|---|---|---|---|---|
| AKV-DATA-010 | DONE | Balık/omurgasız/mercan dosyalarını ayır | DATA-002 | Ayrı koleksiyonlar, ortak arama indeksi |
| AKV-DATA-011 | DONE | Mevcut 580 kaydı yeni modele migrate et | DATA-010 | Kimlikler korunur, kayıp kayıt yok |
| AKV-DATA-012 | DONE | Bilimsel ad/kimlik tekrar denetimi | DATA-011 | Rapor ve çözüm listesi oluşur |
| AKV-DATA-013 | DONE | Zorluk ve sosyal yapı alanlarını doldurma partisi 1 | DATA-011 | İlk ürün öncelik setindeki 100 kayıt tamamlanır |
| AKV-DATA-014 | DONE | Tank uzunluğu alanını doldurma partisi 1 | DATA-011 | İlk ürün öncelik setindeki 100 kayıt tamamlanır |
| AKV-PLANT-001 | DONE | Bitki şemasını oluştur | DATA-001 | 26 bitki migrate edilir |
| AKV-SUB-001 | DONE | Taban şemasını oluştur | DATA-001 | 8 taban migrate edilir |
| AKV-UI-010 | DONE | Kategori ve gelişmiş filtreler | DATA-002 | URL’de korunabilen filtreler |
| AKV-UI-011 | DONE | Bilimsel/eş ad araması | DATA-011 | Ortak/bilimsel/eş ad, cins ve aile araması çalışır |
| AKV-UI-012 | DONE | Canlı ayrıntı paneli/sayfası | DATA-011 | Kaynak ve bakım tablosu görünür |

## P1 — Motor 2.0 çekirdeği

| Kimlik | Durum | Görev | Bağımlılık | Kabul özeti |
|---|---|---|---|---|
| AKV-ENG-010 | DONE | Hacim, biyolojik yük ve davranış alanını ayır | DATA-011 | Üç bağımsız sonuç production motorunda hesaplanır |
| AKV-ENG-011 | DONE | Sürü/çift/harem/cinsiyet kuralları | DATA-013 | Dört sosyal kural production motorunda çalışır |
| AKV-ENG-012 | DONE | Aynı tür ve yakın tür agresyonu | DATA-013 | Aynı tür ve aynı cins riskleri veri tabanlıdır |
| AKV-ENG-013 | DONE | Avcı-av modeli | DATA-011 | Kaynaklı ağız boyu, av boyu ve istisna sözleşmesi çalışır |
| AKV-ENG-014 | DONE | Omurgasız ve mercan güvenliği ayrımı | DATA-010 | Soft/LPS/SPS ve shrimp/snail/crab/clam ayrı değerlendirilir |
| AKV-ENG-015 | DONE | Tür çifti istisna tablosu | DATA-003 | 50/50 doğrulanmış istisna production motorunda |
| AKV-ENG-016 | DONE | Yeni alt skor sistemi | ENG-010..015 | Dört alt puan ve açıklama |
| AKV-TEST-010A | DONE | İlk 25 altın motor senaryosu | ENG-002 | 25 senaryo ve 27 kural CI/build hattında |
| AKV-TEST-010B | DONE | Yüksek riskli 7 temel motor senaryosu | TEST-010A | Temel güvenlik paketi 32 senaryodur |
| AKV-TEST-010 | CANCELLED | Altın motor senaryolarını 100'e çıkar | TEST-010B | Sabit sayı hedefi kaldırıldı; testler ihtiyaç oldukça eklenir |

## P2 — Veri büyümesi

| Kimlik | Durum | Görev | Bağımlılık | Kabul özeti |
|---|---|---|---|---|
| AKV-DATA-020 | TODO | Tatlı su veri partileriyle 350 kayda çık | DATA-011 | Partiler kaynaklı ve doğrulanmış |
| AKV-DATA-021 | TODO | Tuzlu su veri partileriyle 400 kayda çık | DATA-011 | Partiler kaynaklı ve doğrulanmış |
| AKV-DATA-022 | TODO | Acı su kategorisi ilk 30 kayıt | DATA-002 | Ayrı su tipi kuralları |
| AKV-CORAL-001 | DONE | Mercanları soft/LPS/SPS ayır | DATA-010 | 50 mercanın ışık/akıntı/agresyon alanları dolu |
| AKV-INVERT-001 | READY | Temizlik ekibi veri partisi | DATA-010 | En az 50 omurgasız profili |
| AKV-PLANT-010 | READY | Bitki sayısını 40’a çıkar | PLANT-001 | 14 yeni kaynaklı kayıt |
| AKV-SUB-010 | READY | Taban sayısını 15’e çıkar | SUB-001 | 7 yeni kaynaklı profil |
| AKV-HARD-001 | TODO | Hardscape şeması ve ilk 20 kayıt | DATA-001 | Kimya ve güvenlik alanları |

## P2 — Ürün özellikleri

| Kimlik | Durum | Görev | Bağımlılık | Kabul özeti |
|---|---|---|---|---|
| AKV-UI-020 | TODO | 2–4 canlı karşılaştırma | UI-012 | Ortak aralık ve farklar görünür |
| AKV-SAVE-001 | TODO | Yerel kurulum kaydı | ARCH-001 | Adlandır, aç, kopyala, sil |
| AKV-SHARE-001 | TODO | Paylaşılabilir kurulum URL’si | SAVE-001 | Şema doğrulamalı URL |
| AKV-UI-021 | TODO | Sonuç alt skorları | ENG-016 | 4 bölüm puanı görünür |
| AKV-UI-022 | READY | Neden/etki/çözüm kartları | ENG-002 | Her uyarıda standart çıktı |
| AKV-A11Y-001 | TODO | WCAG AA ana akış | UI-001 | Axe + klavye kontrolleri geçer |

## P3 — Üretim ve büyüme

| Kimlik | Durum | Görev | Bağımlılık | Kabul özeti |
|---|---|---|---|---|
| AKV-CI-001 | TODO | GitHub Actions kalite hattı | ARCH-001 | Test/build/veri kontrolü zorunlu |
| AKV-PERF-001 | READY | Paket ve render performans bütçesi | ARCH-002 | Bütçe aşımı CI uyarısı/hatası |
| AKV-SEO-001 | TODO | Canlı ayrıntı sayfalarının indekslenmesi | UI-012 | Canonical, meta, sitemap |
| AKV-SEO-002 | TODO | İlk 10 rehber içeriği | SEO-001 | Kaynaklı ve iki dilli plan |
| AKV-FEED-001 | READY | Hatalı veri bildirme akışı | DATA-003 | Alan ve kaynakla bildirim |
| AKV-AN-001 | TODO | Gizlilik dostu ürün analitiği | UI-020 | Kişisel veri olmadan olaylar |

## Öncelik kuralı

- P0 bitmeden toplu veri ekleme yapılmaz.
- P1 veri modeli bitmeden 750 kayıt hedefi başlanmaz.
- Motor altın testleri olmadan skor sistemi yayınlanmaz.
- SEO sayfaları kaynak modeli olmadan yayınlanmaz.
