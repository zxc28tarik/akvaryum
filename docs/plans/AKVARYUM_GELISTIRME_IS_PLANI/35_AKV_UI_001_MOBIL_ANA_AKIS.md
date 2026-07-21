# AKV-UI-001 — Mobil Ana Akış Koruması

**Tarih:** 21 Temmuz 2026  
**Durum:** Tamamlandı

## Amaç

Akvaryum kurulum sihirbazının 360 px genişliğindeki telefonlarda yatay taşma oluşturmadan kullanılmasını sağlamak ve yeni ekranların mobil düzeni bozmasını hafif bir otomatik kontrolle görünür hale getirmek.

## Uygulanan korumalar

- Sayfa, ana uygulama, sahne ve içerik panellerinde genişlik sınırları ortaklaştırıldı.
- Kart ve form ızgaraları dar ekranda tek sütuna düşürülür.
- Görsel, tablo, kod ve form elemanlarının ekran dışına taşması engellenir.
- Giriş alanları 16 px yazı boyutuyla mobil tarayıcının istemsiz yakınlaştırmasına karşı korunur.
- Tarif/ilerleme şeritleri gerektiğinde bilinçli yatay kaydırma kullanır.
- Sabit alt gezinme, telefon güvenli alanlarını dikkate alır.
- 420 px altında ilerleme göstergesi üst satıra, geri/ileri düğmeleri alt satıra alınır.
- Katalog kartları ve canlı ayrıntı paneli için ek mobil genişlik kuralları uygulanır.

## Çalışma anı taşma denetimi

`mobile-flow-guard.js`, 640 px ve altındaki ekranlarda sayfa ve görünür eleman sınırlarını kontrol eder.

Son rapor:

```js
window.__AKVARYUM_MOBILE_AUDIT__;
```

alanına yazılır. Gerçek ekran dışı taşma bulunursa konsolda uyarı oluşturulur ve `html` elemanına `data-mobile-overflow="true"` eklenir.

Tablo, tarif şeridi veya kod alanı gibi bilinçli yatay kaydırılan elemanlar hata sayılmaz.

## Otomatik doğrulama

```bash
npm run check:mobile-flow
```

Kontrol şunları doğrular:

- hedef duman genişliğinin 360 px olması;
- taşmasız sentetik DOM örneği;
- 30 px taşmalı sentetik DOM örneğinin yakalanması;
- mobil viewport etiketi;
- güvenli alan destekli alt gezinme;
- 640 px ve 420 px kırılımları;
- katalog ve ayrıntı panelinin mobil kuralları;
- statik ve Vite production yükleme bağlantıları.

## Kapsam sınırı

Bu görev Playwright, Selenium veya cihaz çiftliği kurmaz. Proje ölçeğine uygun ortak CSS koruması ve hafif duman denetimi sağlar. Gerçek cihazlarda görsel ince ayar gerekirse bulunan somut sorun üzerinden küçük düzeltme yapılır.

## Sonuç

- `AKV-UI-001` kabul kriteri karşılandı.
- 360 px ana akış sözleşmesi CI ve build başlangıcına bağlandı.
- Katalog, ayrıntı paneli ve sabit alt gezinme mobilde güvenli düzene geçti.
- Production build ve native paket kontrolleri başarıyla tamamlandı.
- Sprint 05 katalog ve arama paketi kapatıldı.
