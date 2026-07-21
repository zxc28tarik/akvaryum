# AKV-TEST-010B — Temel Motor Senaryoları

**Tarih:** 21 Temmuz 2026  
**Durum:** Tamamlandı

## Karar

Sabit 100 altın motor testi hedefi kaldırıldı. Projenin ölçeği için mevcut 25 senaryoya yalnız yüksek riskli 7 senaryo eklenerek **32 temel senaryolu** kalıcı güvenlik paketi oluşturuldu.

Bundan sonra test sayısı hedef olarak kullanılmayacak. Yalnız:

- yeni bir motor özelliği eklendiğinde;
- gerçek bir hata bulunduğunda;
- kullanıcıya yanlış kritik sonuç veya yanlış güven mesajı verebilecek bir sınır değiştiğinde

gerekli kadar yeni senaryo eklenecek.

## Eklenen 7 senaryo

1. Yüzde 85 kapasite uyarı sınırı
2. Yüzde 40 boş kapasite öneri sınırı
3. Tuzlu su tankında tatlı su canlısı
4. Tek kayıt içinde birden fazla beta (`qty: 2`)
5. Farklı palyaço balığı türleri
6. Birden fazla tang türü
7. Mercan bulunmayan tankta yanlış resif uyarısı verilmemesi

## Bulunan gerçek hata

Eski motorda beta kavga kuralı iki ayrı `betta` kaydını karşılaştırmaya çalışıyordu. Arayüz aynı canlıyı tek kayıt ve adet alanıyla tuttuğu için kullanıcı iki beta seçtiğinde veri şu biçimdeydi:

```js
{ id: 'betta', qty: 2 }
```

Bu durumda eski ikili döngü yalnız `PAIRWISE_SELF` üretiyor ve kavga riskini hiç göstermiyordu.

Motor sağlık koruması v2:

- `betta.qty > 1` durumunu algılar;
- kritik `PAIRWISE_INCOMPATIBLE` bulgusu ekler;
- aynı kayıt uyumluluk sonucunu kritik uyumsuzluk olarak değiştirir;
- skoru yeniden hesaplar;
- kritik sonuçla birlikte sağlıklı kompozisyon önerisi gösterilmesini engeller.

## Doğrulama

```bash
npm run check:engine-golden
```

Paket:

- 32 temel senaryoyu;
- 27/27 Engine Finding v1 kural kimliğini;
- kritik sonuç sağlık korumasını;
- beta çoğulluk düzeltmesini;
- production bulgu şemasını

doğrular.

Eski `check:engine-golden25` komutu geriye dönük uyumluluk için yeni komuta yönlendirilir.

## Sonuç

- `AKV-TEST-010B`: **DONE**
- `AKV-TEST-010` sabit 100 senaryo hedefi: **CANCELLED**
- Kalıcı temel paket: **32 senaryo**
- Yeni test politikası: **özellik/hata başına gerekli kadar test**
