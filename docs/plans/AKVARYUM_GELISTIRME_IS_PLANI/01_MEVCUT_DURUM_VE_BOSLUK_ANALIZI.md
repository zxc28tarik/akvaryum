# 01 — Mevcut Durum ve Boşluk Analizi

## Amaç

Mevcut uygulamadaki çalışan parçaları, veri kapsamını ve ürünün güvenilir bir akvaryum uyumluluk aracı olabilmesi için kapatılması gereken boşlukları kaydetmek.

## Mevcut veri kapsamı

- Tatlı ve tuzlu su canlı kayıtları
- Bitki kayıtları
- Taban malzemeleri
- Hazır tank ölçüleri
- Türkçe ve İngilizce ad/açıklamalar
- Basit hacim, su aralığı ve davranış kontrolleri

## Mevcut analiz motorundaki sınırlamalar

### Hacim hesabı

Mevcut yaklaşım her türün minimum tank hacmini toplayıp ek birey başına litre ekliyor. Bu başlangıç için anlaşılır olsa da gerçek stoklamayı her zaman doğru temsil etmez. Örneğin iki küçük sürü türünün minimum tank hacimlerini doğrudan toplamak gereğinden yüksek; çok iri ve yüksek atıklı türlerde ise düşük sonuç verebilir.

### Parametre kesişimi

pH/sıcaklık aralıkları çakışmadığında hata üretiliyor; ancak sonuç parametresi hesaplanırken çakışma bulunamazsa önceki aralık korunabiliyor. Sonuç ekranı bu durumda yanıltıcı bir ortak aralık gösterebilir. Bu düzeltilmelidir.

### Davranış kuralları

- Genel `peaceful / semi / aggressive` sınıfları fazla kaba.
- Tür içi bölgecilik çoğu canlı için modellenmiyor.
- Cinsiyet oranı ve çiftleşme davranışı yok.
- Avcı-av ilişkisi yalnız yetişkin boy oranına dayanıyor.
- Tang ve palyaço balığı gibi bazı özel kurallar kimlik adına bağlı.
- Mercanlar balıklarla aynı listeye konduğu için bazı kurallar dolaylı çalışıyor.

### Bitki ve taban

- Bitkilerde sıcaklık, pH, GH, büyüme hızı, besin talebi, yetişkin boyu ve çoğaltma alanları eksik.
- Tabanlarda tane boyu, KH/GH etkisi, besin zenginliği, dip canlısı güvenliği ve kullanım kalınlığı eksik.
- Eski içeriklerin önemli bölümü dış kaynak doğrulaması bekliyor.

### Kaynak ve güven

- Kaynak kimliği ile doğrulanmış bilgi birbirinden ayrılmalıdır.
- Alan bazlı kaynak bağlantıları korunmalıdır.
- Doğrulanmamış içerik kesin bilgi gibi gösterilmemelidir.

## Öncelikli boşluklar

1. Parametre ortak aralık hatası
2. Standart ve açıklanabilir motor sonucu
3. Katalog, gelişmiş filtre ve bilimsel ad araması
4. Sürü, çift, harem ve aynı tür agresyon kuralları
5. Hacim, biyolojik yük ve davranış alanının ayrılması
6. Avcı-av ve omurgasız/mercan güvenliği
7. Alt skorlar ve altın motor testleri
8. Tür bazlı kaynak doğrulaması ve veri büyütme
