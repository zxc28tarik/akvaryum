# AKV-UI-010 — Kategori ve Gelişmiş Filtreler

**Tarih:** 21 Temmuz 2026  
**Durum:** Tamamlandı

## Amaç

580 canlılık katalog büyüdükçe mevcut canlı seçim adımının tek bir uzun liste olarak kalmasını engellemek ve kullanıcıların bakım gereksinimlerine göre uygulanabilir bir seçim kümesine ulaşmasını sağlamak.

Filtre durumu URL sorgusunda korunur. Kullanıcı sayfayı yenilediğinde veya tarayıcının geri/ileri düğmelerini kullandığında filtreler aynı sonucu üretir.

## Kategori yapısı

Canlı seçim adımına dört üst kategori eklendi:

1. Tümü
2. Balıklar
3. Omurgasızlar
4. Mercanlar

Kategori ayrımı `entityType` alanından yapılır. Yeni ana veri modeli `DB.inhabitants` ve `DB.inhabitantCatalog` kullanılır; kök statik sürümdeki eski `DB.fish` alanı için geriye dönük uyumluluk korunur.

Kategori sayaçları diğer aktif filtreleri dikkate alır fakat seçili kategoriye göre kendini sıfırlamaz. Böylece kullanıcı başka kategoriye geçtiğinde kaç sonuç göreceğini önceden görür.

## Gelişmiş filtreler

Sekiz gelişmiş filtre bulunur:

- bakım zorluğu;
- mizaç;
- sosyal yapı;
- yüzme/yaşam bölgesi;
- azami minimum tank hacmi;
- bitki güvenliği;
- resif güvenliği;
- sıralama.

Sıralama seçenekleri:

- ada göre;
- minimum tank hacmine göre küçükten büyüğe;
- yetişkin boyuna göre büyükten küçüğe;
- bakım zorluğuna göre kolaydan zora.

Üst kategori ve ortak ad araması gelişmiş filtre sayımından ayrı olsa da aynı URL sözleşmesini kullanır.

## URL sözleşmesi

Filtre modeli şu sorgu alanlarını yönetir:

| URL alanı | Anlamı |
|---|---|
| `q` | Türkçe/İngilizce ortak ad veya kimlik araması |
| `cat` | `fish`, `invertebrates`, `corals` |
| `care` | Bakım zorluğu |
| `temperament` | Mizaç |
| `social` | Sosyal yapı |
| `zone` | Yaşam bölgesi |
| `tankMax` | 40, 80, 150 veya 300 litre üst sınırı |
| `plantSafe` | Bitki güvenli kayıtlar |
| `reefSafe` | Resif güvenli kayıtlar |
| `sort` | Sıralama yöntemi |

Varsayılan değerler URL’ye yazılmaz. Filtre modelinin yönetmediği `utm_*` gibi sorgu alanları korunur. Geçersiz veya bilinmeyen filtre değerleri güvenli varsayılana döner.

Örnek:

```text
?cat=fish&care=beginner&tankMax=80&plantSafe=1&sort=tank
```

## Canlı seçim davranışı

- Filtreler mevcut `FishStep` bileşeninin yerine bağlanan yeni katalog görünümünde çalışır.
- Seçilen canlılar aktif filtrenin dışında kalsa bile ayrı “Seçtiklerin” bölümünde görünür.
- Miktar `+` ve `−` düğmeleriyle değiştirilebilir; sıfıra düşen kayıt seçimden çıkarılır.
- Büyük katalog ilk etapta 36 kartla sınırlanır ve “Daha fazla göster” düğmesiyle parça parça açılır.
- Tatlı/tuzlu su seçimi sonuç kümesinin temel filtresidir.
- Türkçe ve İngilizce arayüz metinleri aynı bileşende bulunur.

## Teknik yapı

### `catalog-filter-model.js`

Arayüzden bağımsız saf filtre modelidir. Görevleri:

- URL okuma ve yazma;
- geçerli değer denetimi;
- canonical ve legacy alanların ortak okunması;
- kategori belirleme;
- birleşik filtreleme;
- kategori sayaçları;
- sıralama;
- aktif filtre sayımı.

### `catalog-filters.jsx`

React arayüzüdür. Mevcut `window.UI.FishStep` bileşenini değiştirmeden önce yüklenir ve aynı `state/setState/lang` sözleşmesini kullanarak yerine geçer.

### Çalışma yolları

Aynı filtre modeli ve arayüz:

- kök statik sürümde `boot.js` üzerinden;
- Vite production paketinde sanal `components.jsx` modülü üzerinden

çalışır.

Vite geçişinde modül olarak alınan React, eski bileşen uyumluluğu için `window.React` alanına bağlanır.

## Otomatik doğrulama

```bash
npm run check:catalog-filters
```

Kontrol toplam 21 senaryoyu doğrular:

- URL parse/serialize turu;
- geçersiz değerlerin reddedilmesi;
- filtre dışı URL alanlarının korunması;
- tatlı/tuzlu su ayrımı;
- balık/omurgasız/mercan kategorileri;
- bakım, mizaç, sosyal yapı ve bölge filtreleri;
- tank hacmi, bitki ve resif güvenliği;
- ortak ad araması;
- tank ve boy sıralaması;
- birleşik filtre sonucu;
- kategori sayaçları;
- aktif filtre sayısı;
- statik ve Vite yükleme bağlantıları.

Kontrol bağımsız npm komutuna, GitHub Actions hattına ve Vite production build başlangıcına bağlandı.

## Kapsam sınırı

Bu görev bilimsel ad, cins, aile ve eş ad aramasını tamamlamaz. Bunlar ortak arama indeksini kullanan ayrı `AKV-UI-011` görevinin kapsamıdır.

Canlı ayrıntı sayfası ve kaynak/bakım tablosu da ayrı `AKV-UI-012` görevidir.

## Sonuç

- `AKV-UI-010` kabul kriteri karşılandı.
- Kategori ve gelişmiş filtreler URL’de kalıcıdır.
- Seçim miktarları ve mevcut sihirbaz akışı korunur.
- Kök statik sürüm ve Vite production sürümü aynı filtre davranışını kullanır.
- Katalog filtre doğrulaması, production build ve native paket kontrolleri başarıyla geçti.
