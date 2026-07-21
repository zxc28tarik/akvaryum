# AKV-ENG-003 — Kritik Sonuçta Sağlıklı Kompozisyon Koruması

**Tarih:** 21 Temmuz 2026  
**Durum:** Tamamlandı

## Sorun

Eski motor skoru kritik sorun başına 25 puan düşürüyordu. Tek kritik sorunu bulunan bazı kurulumlar bu nedenle 65 veya üzeri puanda kalabiliyordu.

Motorun sağlıklı kompozisyon önerisi yalnız şu iki koşula bakıyordu:

- skorun 65 veya üzerinde olması;
- başka bir bilgi önerisinin bulunmaması.

Kritik sorun sayısı ayrıca kontrol edilmediği için aynı sonuçta hem kritik hata hem de `COMPOSITION_HEALTHY` / “Güzel kompozisyon” önerisi gösterilebiliyordu.

## Düzeltme

`engine-health-guard.js` ortak koruma katmanı eklendi.

Koruma:

1. normal motor analizini çalıştırır;
2. sonuçta en az bir kritik bulgu varsa önerileri inceler;
3. yalnız `COMPOSITION_HEALTHY`, “Güzel kompozisyon” veya “Nice composition” kaydını kaldırır;
4. diğer öneri, uyarı, sorun, skor ve karar alanlarına dokunmaz.

Koruma hem:

- kök statik sürümün `boot.js` yükleme zincirine;
- Vite production motor paketine

bağlandı.

## Altın senaryo v1.1

İlk 25 senaryonun tarihsel v1 beklentisi korundu. Aktif beklenti `engine-golden-scenarios-v1-1.mjs` üzerinden oluşturuldu.

V1.1 yalnız kritik bulgusu olan senaryolardan `COMPOSITION_HEALTHY` beklentisini çıkarır. Diğer bütün beklenen alanlar v1 ile aynıdır.

Düzeltmeyle beş yanlış sağlıklı öneri kaldırıldı:

- su tipi uyumsuzluğu;
- toplam tank kapasitesi aşımı;
- toplu GH çakışması;
- ileri yönde avcı-av uyumsuzluğu;
- ters yönde avcı-av uyumsuzluğu.

Altın pakette doğrulanan toplam bulgu sayısı 105’ten 100’e düştü. Engine Finding v1 içindeki 27 kuralın tamamı yine kapsanmaktadır.

## Doğrulama

`npm run check:engine-golden25` artık:

- sözleşmeli production motorunda 25 senaryoyu;
- kritik sorun bulunan hiçbir sonuçta `COMPOSITION_HEALTHY` olmamasını;
- korumanın `healthGuardVersion = 1` ile yüklenmesini;
- sözleşme katmanı olmadan çalışan ham İngilizce su tipi uyumsuzluğu sonucunu

doğrular.

GitHub Actions koşusunda altın senaryolar, veri kontrolleri, production build ve native paket doğrulaması başarıyla geçti.

## Kapsam sınırı

Bu görev eski skor hesabını değiştirmez. Kritik sorun bulunan sonucun puanı veya `verdict` değeri hâlâ eski ağırlık sisteminden gelebilir.

Yeni dört alt skorlu sistem ve kritik skor üst sınırları ayrı `AKV-ENG-016` görevidir. Bu görev yalnız kullanıcıya aynı anda hem kritik hata hem sağlıklı kompozisyon mesajı gösterilmesini engeller.

## Sonuç

- `AKV-ENG-003` kabul kriteri karşılandı.
- Kritik bulgu bulunan sonuçta sağlıklı kompozisyon önerisi yoktur.
- Uyarılı fakat kritik olmayan sonuçların mevcut davranışı korunmuştur.
- Kök statik ve Vite production çalışma yolları aynı korumayı kullanır.
