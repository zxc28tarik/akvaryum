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
- **Karar:** Projenin ortak veri sözleşmesi JSON Schema Draft 2020-12 biçiminde `schemas/akvaryum.schema.json` dosyasında tutulacak. Ajv doğrulaması hem bağımsız komutta hem Vite build başlangıcında çalışacak.
- **Neden:** Veri sayısı büyürken alan tipi, zorunlu değer, kimlik, enum ve aralık hatalarını production öncesinde durdurmak.
- **Alternatifler:** Yalnız elle yazılmış JavaScript kontrolleri kullanmak, TypeScript tiplerini tek kaynak kabul etmek veya doğrulamayı veri migrasyonunun sonuna bırakmak.
- **Sonuçlar:** Hedef `BaseEntity`, kaynak, canlı, bitki ve taban modelleri aynı sözleşmede tanımlanır. Mevcut kayıtlar geçiş süresince `legacy*` şemalarıyla korunur. Bilinmeyen bilgi tahmin edilmez; sonraki migrasyon görevlerinde açıkça tamamlanır.
- **Etkilenen görevler:** AKV-DATA-001, AKV-DATA-002, AKV-DATA-003, AKV-PLANT-001, AKV-SUB-001, AKV-CI-001

### ADR-010 — Taksonomi eşlemesi doğrulanana kadar çıkarımsal kabul edilir

- **Tarih:** 16 Temmuz 2026
- **Durum:** Kabul
- **Bağlam:** Mevcut 580 kayıtta bilimsel ad bulunuyor; ancak aile ve kabul edilmiş ad alanları henüz alan bazlı kaynak kimliği taşımıyor.
- **Karar:** `entityType`, kategori, cins ve aile alanları tek sınıflandırma çekirdeğiyle üretilecek. Aile eşlemeleri kaynak modeli tamamlanana kadar `inferred`, belirsiz kayıtlar `needs_review` olarak işaretlenecek.
- **Neden:** Katalog ve dosya ayrıştırma çalışmalarını başlatırken doğrulanmamış taksonomiyi yanlış biçimde `verified` göstermemek.
- **Alternatifler:** Aile alanlarını boş bırakmak, bütün kayıtları tek seferde elle doğrulamak veya kaynak olmadan doğrulanmış saymak.
- **Sonuçlar:** 580 kaydın tamamı sınıflandırılabilir ve filtrelenebilir. `AKV-DATA-003` sonrasında aile ve kabul edilmiş adlar kaynak kimlikleriyle doğrulanır. Yapay melez gibi cinsi olmayan kayıtlar açık inceleme durumunda kalır.
- **Etkilenen görevler:** AKV-DATA-002, AKV-DATA-003, AKV-DATA-010, AKV-DATA-011, AKV-UI-010

### ADR-011 — Kaynak varlığı ile doğrulanmış bilgi birbirinden ayrılır

- **Tarih:** 18 Temmuz 2026
- **Durum:** Kabul
- **Bağlam:** Eski prototip verilerinin hangi dosyadan geldiği biliniyor; fakat bu dosyaların varlığı bakım değerlerinin bilimsel veya kurumsal olarak doğrulandığı anlamına gelmiyor.
- **Karar:** Her kayıt `sourceIds`, alan bazlı `fieldSourceIds` ve ayrı `verification` durumu taşıyacak. İç eski dosyalar `internal_legacy`, otomatik türetilen alanlar `derived` kaynak türü sayılacak. Dış doğrulama yapılmayan kayıtlar `needs_review/low` durumda kalacak.
- **Neden:** Kaynak izini kaybetmeden doğrulanmamış bilgiyi kesin gerçek gibi göstermemek ve daha sonra alan bazında güvenilir kaynak ekleyebilmek.
- **Alternatifler:** Kaynak dosyasını doğrulama saymak, bütün kaydı tek kaynakla ilişkilendirmek veya kaynaklandırmayı veri migrasyonunun sonuna bırakmak.
- **Sonuçlar:** Kaynak kimliği bulunmayan, kataloğa bağlanmayan veya alan desteği tutarsız kayıt build’i durdurur. `verified` kayıt yalnız doğrulanmış kaynaklarla oluşturulabilir. Mevcut 620 kayıt doğrulama kuyruğunda kalır.
- **Etkilenen görevler:** AKV-DATA-003, AKV-DATA-010, AKV-DATA-011, AKV-DATA-012, AKV-ENG-015, AKV-FEED-001, AKV-SEO-001

### ADR-012 — Ayrı canlı koleksiyonları tek ana kayıttan türetilir

- **Tarih:** 19 Temmuz 2026
- **Durum:** Kabul
- **Bağlam:** Balık, omurgasız ve mercanların ayrı kataloglarda kullanılması gerekiyor; ancak 580 kaydı üç ayrı veri kopyasına bölmek kimlik, kaynak ve bakım alanlarının zamanla birbirinden sapmasına neden olabilir.
- **Karar:** `DB.fish` geçiş süresince tek ana kayıt dizisi olarak korunacak. `data/catalog/fish.mjs`, `invertebrates.mjs` ve `corals.mjs` kayıtları `entityType` üzerinden seçen modüller olacak. Production verisinde ayrı koleksiyonlar ve ortak arama indeksi `DB.inhabitantCatalog` altında üretilecek.
- **Neden:** Mevcut arayüzü bozmadan kategori ayrımı sağlamak, veri kopyasını önlemek ve `AKV-DATA-011` migrasyonuna tek doğruluk kaynağıyla girmek.
- **Alternatifler:** 580 tam kaydı üç JSON dosyasına kopyalamak, eski `DB.fish` alanını hemen kaldırmak veya koleksiyon ayrımını yalnız arayüz filtrelerine bırakmak.
- **Sonuçlar:** Başlangıçta 467 balık, 63 omurgasız ve 50 mercan koleksiyonu oluşur. Bilinmeyen `entityType`, kayıt kaybı, çifte üyelik veya eksik arama indeksi build’i durdurur. Yeni katalog özellikleri `DB.inhabitantCatalog` kullanır; eski ekranlar geçici olarak `DB.fish` ile çalışmaya devam eder.
- **Etkilenen görevler:** AKV-DATA-010, AKV-DATA-011, AKV-DATA-012, AKV-CORAL-001, AKV-INVERT-001, AKV-UI-010, AKV-UI-011, AKV-ENG-014

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
