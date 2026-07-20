# 06 — Uyumluluk Motoru 2.0 Planı

## Hedef

Motor yalnız “olur/olmaz” sonucu vermemeli; sonucu oluşturan kuralları, riskin önemini, hangi koşulda düzelebileceğini ve hangi veriye dayandığını göstermelidir.

## 1. Kural katmanları

### Katman A — Kesin çevresel uyumsuzluk

- Su tipi
- Tuzluluk
- Sıcaklık ortak aralığı
- pH ortak aralığı
- GH/KH ortak aralığı
- Özel soğuk su / yüksek oksijen ihtiyacı

Bu katmanda ortak aralık yoksa sonuç kritik olmalıdır.

### Katman B — Tank geometrisi ve kapasite

- Minimum hacim
- Minimum tank uzunluğu
- Taban alanı
- Açık yüzme alanı
- Bölge sayısı
- Yüksek tank / uzun tank uyumu
- Dekor ve taban sonrası net hacim

### Katman C — Sosyal yapı

- Minimum sürü/grup
- Çift veya harem ihtiyacı
- Erkek/dişi oranı
- Aynı tür içi agresyon
- Aynı cins/yakın tür rekabeti
- Koloni yoğunluğu

### Katman D — Davranış ve avcılık

- Agresiflik düzeyi
- Bölgecilik
- Aktivite hızı farkı
- Yüzgeç çekiştirme
- Uzun yüzgeç riski
- Ağız boyu ve avlanabilecek minimum boy
- Gece/gündüz davranışı
- Dip/surface alan kalabalığı

### Katman E — Habitat

- Taban tercihi
- Kuma gömülme
- Mağara/saklanma ihtiyacı
- Akıntı
- Oksijen
- Işık
- Kapak/zıplama
- Canlı kaya veya olgun tank ihtiyacı

### Katman F — Bitki, mercan ve omurgasız güvenliği

- Bitki güvenliği
- Karides güvenliği
- Salyangoz güvenliği
- Yengeç/clam güvenliği
- Soft/LPS/SPS mercan güvenliği
- Mercanların kimyasal ve süpürücü tentakül mesafesi
- Temizlik ekibi rol çakışması

### Katman G — Bakım zorluğu

- Beslenme zorluğu
- Olgun tank ihtiyacı
- Hassas parametreler
- Yeni başlayan için uygunluk
- Zehir/toksin güvenlik uyarısı

## 2. Hacim ve biyolojik yük modeli

Mevcut minimum hacim toplama yöntemi yerine üç ayrı ölçü kullanılmalıdır:

1. **Tür minimum tank gereksinimi:** Seçilen türler içindeki en yüksek minimum hacim/uzunluk.
2. **Biyolojik yük:** Yetişkin boy, gövde kütlesi, metabolizma, beslenme ve birey sayısından hesaplanan yük.
3. **Davranış alanı:** Sürü, bölge ve yüzme uzunluğu gereksinimi.

Önerilen yaklaşım:

```text
requiredVolume = max(
  largestSpeciesMinimum,
  bioloadRequirement,
  socialGroupRequirement,
  territorialRequirement
)
```

Tek bir litre kuralı yerine bu dört sonuç kullanıcıya ayrı gösterilmelidir.

## 3. Parametre kesişim düzeltmesi

Ortak aralık bulunamazsa:

- Sonuç `null` olmalı.
- “Ortak güvenli aralık yok” gösterilmeli.
- Önceki türün aralığı korunmamalı.
- Uyuşmazlığa neden olan türler belirtilmeli.

## 4. Genel kural ve istisna sırası

1. Veri geçerliliği
2. Kesin çevre kuralları
3. Tür çifti istisnaları
4. Takson/kategori kuralları
5. Boy ve davranış heuristikleri
6. Kullanıcı koşulları
7. Tavsiye ve optimizasyon kuralları

Tür çifti istisnası, genel kurala göre daha yüksek öncelik taşır.

## 5. Skor tasarımı

Skor dört alt puandan oluşmalıdır:

- Çevresel uyum: 30
- Davranış/sosyal uyum: 30
- Tank ve biyolojik yük: 25
- Habitat/bakım uyumu: 15

Kritik sorun varsa toplam skor yüksek görünmemelidir. Örnek:

- Kritik çevresel uyumsuzluk: ilgili bölüm 0 ve genel skor üst sınırı 39.
- Yetersiz tank: tank bölümü 0 ve genel skor üst sınırı 59.
- Yalnız küçük uyarılar: 70–90 arası olabilir.

## 6. Kural çıktı sözleşmesi

Her motor sonucu en az şu alanları taşımalıdır:

```js
{
  ruleId,
  severity,       // info | warning | critical
  category,
  entities,
  title,
  reason,
  impact,
  resolution,
  sourceIds,
  confidence
}
```

## 7. Altın test yaklaşımı

- İlk aşamada çevresel aralık, tank, sürü ve temel davranış sınır durumları yazılır.
- Her senaryo beklenen ortak parametreleri ve kritik/uyarı sayılarını sabitler.
- Motor büyüdükçe altın senaryo sayısı 100’e çıkarılır.
