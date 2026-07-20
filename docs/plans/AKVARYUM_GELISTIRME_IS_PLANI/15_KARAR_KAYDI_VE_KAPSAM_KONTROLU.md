# 15 — Karar Kaydı ve Kapsam Kontrolü

## Amaç

Projenin veri ekledikçe veya özellik büyüttükçe dağılmasını engellemek.

## Karar kaydı şablonu

```md
## ADR-000 — Karar başlığı

- Tarih:
- Durum: önerildi / kabul / kaldırıldı
- Bağlam:
- Karar:
- Neden:
- Alternatifler:
- Sonuçlar:
- Etkilenen görevler:
```

## Başlangıç kararları

### ADR-001 — Veri kalitesi sayıdan önce gelir

- **Durum:** Kabul
- **Karar:** Doğrulayıcı ve kaynak modeli kurulmadan büyük veri partisi yapılmaz.

### ADR-002 — Canlı türleri ayrılır

- **Durum:** Kabul
- **Karar:** Balık, omurgasız ve mercan aynı genel temel modeli paylaşabilir; fakat `entityType` ve özel alt alanlarla ayrılır.

### ADR-003 — Kimlikler kalıcıdır

- **Durum:** Kabul
- **Karar:** Yayınlanmış `id` değiştirilmez. Ad değişiminde alias veya yönlendirme kullanılır.

### ADR-004 — Motor açıklanabilir olmalıdır

- **Durum:** Kabul
- **Karar:** Her uyarı kural kimliği, neden ve çözüm taşır.

### ADR-005 — Genel kural tek başına yeterli değildir

- **Durum:** Kabul
- **Karar:** Genel heuristikler, kaynaklı tür çifti istisnalarıyla desteklenir.

### ADR-006 — İki dil aynı sürümde tamamlanır

- **Durum:** Kabul
- **Karar:** Türkçe veya İngilizce alanı eksik özellik/veri `DONE` olmaz.

### ADR-007 — Vite geçişi paralel yapılır

- **Tarih:** 16 Temmuz 2026
- **Durum:** Kabul
- **Bağlam:** Kökteki statik uygulama GitHub Pages üzerinden çalışırken Vite girişine doğrudan geçmek canlı sürümü bozabilir.
- **Karar:** Yeni Vite + React uygulaması ilk aşamada `vite-app/` altında tutulur. Kökteki mevcut statik giriş, production build ve tarayıcı duman testi tamamlanana kadar korunur.
- **Neden:** Migrasyon sırasında kullanıcıya açık sürümün kesintisiz çalışmasını sağlamak.
- **Alternatifler:** Kökteki `index.html` dosyasını doğrudan Vite girişine çevirmek veya ayrı dalda bekletmek.
- **Sonuçlar:** Bir süre iki giriş yapısı birlikte bulunur. `AKV-ARCH-002` tamamlanırken eski yükleyici kaldırılır ve yayınlama yeni build’e geçirilir.
- **Etkilenen görevler:** AKV-ARCH-001, AKV-ARCH-002, AKV-CI-001

### ADR-008 — Eski arşivler yalnız build sırasında açılır

- **Tarih:** 16 Temmuz 2026
- **Durum:** Kabul
- **Bağlam:** Büyük balık ve arayüz kaynakları depoda gzip + base64 arşivleri olarak bulunuyor. Bunların tarayıcıda açılması `eval`, Babel standalone ve modern tarayıcıya özel `DecompressionStream` gerektiriyordu.
- **Karar:** Geçiş süresince arşivler yalnız Vite build aşamasında Node.js ile açılıp sanal ES modüllerine dönüştürülecek. Tarayıcı yalnız normal derlenmiş JavaScript ve CSS alacak.
- **Neden:** Runtime güvenlik ve performans sorunlarını hemen kaldırırken canlı veri içeriğini ve mevcut akışı korumak.
- **Alternatifler:** Bütün büyük kaynakları tek seferde elle gerçek modüllere ayırmak veya eski runtime yükleyicisini korumak.
- **Sonuçlar:** `AKV-ARCH-002` kabul kriteri karşılanır. Arşiv dosyaları geçici build girdisi olarak kalır; kalıcı kaynak modüllerine ayrıştırma Aşama B ve veri migrasyonu görevlerinde yapılır.
- **Etkilenen görevler:** AKV-ARCH-002, AKV-DATA-001, AKV-DATA-010, AKV-PERF-001

### ADR-009 — Ortak veri sözleşmesi JSON Schema olur

- **Tarih:** 16 Temmuz 2026
- **Durum:** Kabul
- **Bağlam:** Mevcut canlı, bitki ve taban kayıtları JavaScript nesneleri içinde tutuluyor ve alan hataları yalnız uygulama çalışırken fark edilebiliyordu.
- **Karar:** Projenin ortak veri sözleşmesi JSON Schema Draft 2020-12 biçiminde tutulacak. Ajv doğrulaması hem bağımsız komutta hem Vite build başlangıcında çalışacak.
- **Neden:** Veri sayısı büyürken alan tipi, zorunlu değer, kimlik, enum ve aralık hatalarını production öncesinde durdurmak.
- **Alternatifler:** Yalnız elle yazılmış JavaScript kontrolleri kullanmak, TypeScript tiplerini tek kaynak kabul etmek veya doğrulamayı veri migrasyonunun sonuna bırakmak.
- **Sonuçlar:** Hedef `BaseEntity`, kaynak, canlı, bitki ve taban modelleri şemayla tanımlanır. Mevcut kayıtlar geçiş süresince `legacy*` şemalarıyla korunur. Bilinmeyen bilgi tahmin edilmez.
- **Etkilenen görevler:** AKV-DATA-001, AKV-DATA-002, AKV-DATA-003, AKV-PLANT-001, AKV-SUB-001, AKV-CI-001

### ADR-010 — Taksonomi eşlemesi doğrulanana kadar çıkarımsal kabul edilir

- **Tarih:** 16 Temmuz 2026
- **Durum:** Kabul
- **Bağlam:** Mevcut 580 kayıtta bilimsel ad bulunuyor; ancak aile ve kabul edilmiş ad alanları henüz alan bazlı kaynak kimliği taşımıyor.
- **Karar:** `entityType`, kategori, cins ve aile alanları tek sınıflandırma çekirdeğiyle üretilecek. Aile eşlemeleri kaynak modeli tamamlanana kadar `inferred`, belirsiz kayıtlar `needs_review` olarak işaretlenecek.
- **Neden:** Katalog ve dosya ayrıştırma çalışmalarını başlatırken doğrulanmamış taksonomiyi yanlış biçimde `verified` göstermemek.
- **Alternatifler:** Aile alanlarını boş bırakmak, bütün kayıtları tek seferde elle doğrulamak veya kaynak olmadan doğrulanmış saymak.
- **Sonuçlar:** 580 kaydın tamamı sınıflandırılabilir ve filtrelenebilir. Yapay melez gibi cinsi olmayan kayıtlar açık inceleme durumunda kalır.
- **Etkilenen görevler:** AKV-DATA-002, AKV-DATA-003, AKV-DATA-010, AKV-DATA-011, AKV-UI-010

### ADR-011 — Kaynak varlığı ile doğrulanmış bilgi birbirinden ayrılır

- **Tarih:** 18 Temmuz 2026
- **Durum:** Kabul
- **Bağlam:** Eski prototip verilerinin hangi dosyadan geldiği biliniyor; fakat bu dosyaların varlığı bakım değerlerinin bilimsel veya kurumsal olarak doğrulandığı anlamına gelmiyor.
- **Karar:** Her kayıt `sourceIds`, alan bazlı `fieldSourceIds` ve ayrı `verification` durumu taşıyacak. İç eski dosyalar `internal_legacy`, otomatik türetilen alanlar `derived` kaynak türü sayılacak. Dış doğrulama yapılmayan kayıtlar `needs_review/low` durumda kalacak.
- **Neden:** Kaynak izini kaybetmeden doğrulanmamış bilgiyi kesin gerçek gibi göstermemek ve daha sonra alan bazında güvenilir kaynak ekleyebilmek.
- **Alternatifler:** Kaynak dosyasını doğrulama saymak, bütün kaydı tek kaynakla ilişkilendirmek veya kaynaklandırmayı veri migrasyonunun sonuna bırakmak.
- **Sonuçlar:** Kaynak kimliği bulunmayan, kataloğa bağlanmayan veya alan desteği tutarsız kayıt build’i durdurur. `verified` kayıt yalnız doğrulanmış kaynaklarla oluşturulabilir.
- **Etkilenen görevler:** AKV-DATA-003, AKV-DATA-010, AKV-DATA-011, AKV-DATA-012, AKV-PLANT-001, AKV-SUB-001, AKV-ENG-015, AKV-FEED-001, AKV-SEO-001

### ADR-012 — Ayrı canlı koleksiyonları tek ana kayıttan türetilir

- **Tarih:** 19 Temmuz 2026
- **Durum:** Kabul
- **Bağlam:** Balık, omurgasız ve mercanların ayrı kataloglarda kullanılması gerekiyor; ancak 580 kaydı üç ayrı veri kopyasına bölmek kimlik, kaynak ve bakım alanlarının zamanla birbirinden sapmasına neden olabilir.
- **Karar:** `DB.fish` geçiş süresince tek ana kayıt dizisi olarak korunacak. Production verisinde ayrı koleksiyonlar ve ortak arama indeksi `DB.inhabitantCatalog` altında üretilecek.
- **Neden:** Mevcut arayüzü bozmadan kategori ayrımı sağlamak, veri kopyasını önlemek ve migrasyona tek doğruluk kaynağıyla girmek.
- **Alternatifler:** 580 tam kaydı üç JSON dosyasına kopyalamak, eski `DB.fish` alanını hemen kaldırmak veya koleksiyon ayrımını yalnız arayüz filtrelerine bırakmak.
- **Sonuçlar:** Başlangıçta 467 balık, 63 omurgasız ve 50 mercan koleksiyonu oluşur. Bilinmeyen `entityType`, kayıt kaybı, çifte üyelik veya eksik arama indeksi build’i durdurur.
- **Etkilenen görevler:** AKV-DATA-010, AKV-DATA-011, AKV-DATA-012, AKV-CORAL-001, AKV-INVERT-001, AKV-UI-010, AKV-UI-011, AKV-ENG-014

### ADR-013 — Yeni canlı modeli eski ekranlarla paralel yaşar

- **Tarih:** 19 Temmuz 2026
- **Durum:** Kabul
- **Bağlam:** 580 canlı kaydı hedef `Inhabitant v1` modeline taşınırken mevcut arayüz ve eski uyumluluk motoru hâlâ `DB.fish` alanlarını kullanıyor.
- **Karar:** Production build legacy kayıtları `DB.inhabitants` altında `Inhabitant v1` modeline dönüştürecek. `DB.fish` yalnız geçici uyumluluk katmanı olarak korunacak.
- **Neden:** Kimlikleri ve mevcut kullanıcı akışını korurken yeni veri modeline aşamalı ve test edilebilir geçiş sağlamak.
- **Alternatifler:** Legacy alanı tek seferde kaldırmak, 580 yeni kaydı ayrı kopya olarak elle tutmak veya yeni modeli yalnız belge düzeyinde bırakmak.
- **Sonuçlar:** 580 eski ve 580 yeni kayıt CI’da birebir karşılaştırılır. Doğrudan değer veya kaynak kimliği kaybı build’i durdurur. Eski veride bulunmayan alanlar `unknown` ve migrasyon raporuyla işaretlenir.
- **Etkilenen görevler:** AKV-DATA-011, AKV-DATA-012, AKV-DATA-013, AKV-DATA-014, AKV-UI-011, AKV-UI-012, AKV-ENG-010, AKV-ENG-013

### ADR-014 — Taksonomi bulguları otomatik silme nedeni değildir

- **Tarih:** 20 Temmuz 2026
- **Durum:** Kabul
- **Bağlam:** Aynı bilimsel ad bazen gerçek yinelenen kayıt, bazen ortak ad/eş ad, bazen ticari renk veya üretim varyantı olabilir.
- **Karar:** Yinelenen bilimsel adlar otomatik birleştirilmeyecek veya silinmeyecek. Her grup kanonik tür, alias/eş ad, ticari varyant veya açık nomenklatür olarak incelenecek. Mevcut bulgular raporda parmak iziyle sabitlenecek.
- **Neden:** Kalıcı kimlikleri korumak, yanlış pozitif birleştirmeleri önlemek ve taksonomi temizliğini izlenebilir kararlarla yapmak.
- **Alternatifler:** Aynı bilimsel adı taşıyan bütün kayıtları otomatik silmek, hiçbir denetim yapmamak veya raporu yalnız belge olarak tutup CI’a bağlamamak.
- **Sonuçlar:** Kimlik çakışması, cins uyuşmazlığı ve cins-aile çelişkisi engelleyici hata olur. `var.`, `sp.`, `cf.`, melez ve aynı bilimsel ad bulguları çözüm kuyruğunda tutulur.
- **Etkilenen görevler:** AKV-DATA-012, AKV-DATA-013, AKV-DATA-020, AKV-DATA-021, AKV-UI-011, AKV-SEO-001

### ADR-015 — Plant v1 eksik alanları açık bırakır ve eski ekranla paralel yaşar

- **Tarih:** 20 Temmuz 2026
- **Durum:** Kabul
- **Bağlam:** Eski 26 bitki kaydında ad, bilimsel ad, ışık, CO₂ bayrağı, zorluk, biçim, yerleşim ve renk var; sıcaklık, pH, GH, büyüme hızı, besin talebi, boy ve çoğaltma bilgisi yok. Mevcut arayüz `DB.plants` yapısını kullanıyor.
- **Karar:** Production build eski kayıtları `DB.aquaticPlants` altında `Plant v1` modeline dönüştürecek; `DB.plants` geçici uyumluluk alanı olarak korunacak. Eski veride bulunmayan alanlar `null`, `unknown` veya boş dizi olarak tutulacak ve `migration.unknownFields` içinde listelenecek.
- **Neden:** Mevcut bitki arayüzünü bozmadan yeni veri sözleşmesine geçmek ve kaynak olmadan bakım değeri uydurulmasını engellemek.
- **Alternatifler:** Eksik alanlara tahmini varsayılanlar yazmak, eski alanı tek seferde kaldırmak veya 26 kaydı ayrı elle yönetilen kopyalar halinde tutmak.
- **Sonuçlar:** 26 eski ve 26 yeni kayıt CI’da birebir karşılaştırılır. Kimlik, ad, bilimsel ad, ışık, CO₂, zorluk, yerleşim veya görünüm kaybı build’i durdurur. Yeni bitki kayıtları dış kaynak doğrulamasına kadar `needs_review/low` kalır.
- **Etkilenen görevler:** AKV-PLANT-001, AKV-PLANT-010, AKV-UI-010, AKV-UI-012, AKV-SUB-001

## Şimdilik kapsam dışı

Temel aşamalar bitene kadar:

- Canlı veya ekipman satışı
- Mağaza fiyat karşılaştırması
- Kullanıcılar arası mesajlaşma
- Sınırsız topluluk içerik yayını
- Yapay zekânın kaynaksız bakım bilgisi üretmesi
- Otomatik hastalık teşhisi
- Veterinerlik önerisi
- Gerçek zamanlı sensör/IoT entegrasyonu
- Yerel mevzuatın otomatik hukuki yorumu

## Yeni özellik değerlendirme soruları

1. Mevcut ana kullanıcı akışlarından hangisini iyileştiriyor?
2. Veri modeli hazır mı?
3. Güvenilir kaynak gerektiriyor mu?
4. Motor testlerini etkiliyor mu?
5. Mobil ve iki dil maliyeti nedir?
6. Bakım yükü ne kadar?
7. Daha küçük bir çözüm aynı değeri sağlar mı?
8. Hangi mevcut görevi geciktiriyor?

Bu sorulara cevap verilmeden özellik backlog’a P0/P1 olarak alınmamalıdır.
