# AKV-UI-022 — Neden, Etki ve Çözüm Kartları

**Durum:** DONE  
**Başlangıç tarihi:** 24 Temmuz 2026  
**Tamamlanma tarihi:** 24 Temmuz 2026  
**Uygulama PR’ı:** #26  
**Bağımlılık:** AKV-ENG-002

## Amaç

Motorun ürettiği kritik sorun, uyarı ve önerileri yalnız başlık/açıklama listesi olarak bırakmamak; kullanıcıya her bulgunun neden oluştuğunu, akvaryuma etkisini ve uygulanabilecek çözümü ayrı alanlarda göstermek.

## Uygulanan görünüm

Sonuç ekranına üç ayrı grup eklendi:

1. Kritik sorunlar
2. Uyarılar
3. Öneriler

Her kart aşağıdaki alanları gösterir:

- başlık;
- kısa açıklama;
- neden;
- etki;
- çözüm;
- motor kural kimliği.

## Davranış

- `result.issues` kritik sorun kartlarına dönüşür.
- `result.warnings` uyarı kartlarına dönüşür.
- `result.tips` öneri kartlarına dönüşür.
- Grupların kayıt sayısı başlık yanında gösterilir.
- Boş grup açık biçimde “bulgu yok” mesajı gösterir.
- Hiç bulgu yoksa yeni panel gereksiz yere oluşturulmaz.
- Türkçe ve İngilizce metinler desteklenir.
- Kritik, uyarı ve öneri kartlarının görsel durumları ayrıdır.
- 760 piksel altında kartlar tek sütuna geçer.
- Bölüm ve grup başlıkları erişilebilir ilişki alanları taşır.

## Teknik yaklaşım

Yeni panel mevcut `app.jsx` içinde, alt puan kartlarından sonra çalışır. Motor çıktısı değiştirilmez; Engine Finding v1 alanları doğrudan görünüm modeline dönüştürülür.

Sonuç ekranı sırası:

```text
Mevcut sonuç görünümü
Dört alt puan kartı
Neden / etki / çözüm kartları
```

## Doğrulama

Yeni komut:

```bash
npm run check:finding-panel
```

Kontrol kapsamı:

- kritik, uyarı ve öneri grupları;
- `issues`, `warnings` ve `tips` motor bağlantısı;
- neden, etki ve çözüm alanları;
- Türkçe ve İngilizce arayüz;
- durum bazlı kart stilleri;
- erişilebilir bölüm/grup ilişkileri;
- mobil tek sütun düzeni;
- GitHub Actions bağlantısı.

PR #26 GitHub Actions doğrulamasında aşağıdakilerin tamamı geçti:

- `check:finding-panel`;
- dört alt puan motor ve arayüz kontrolleri;
- 32 temel motor senaryosu;
- bütün veri, migrasyon, katalog ve mobil kontroller;
- production build;
- native production paket doğrulaması.

## Kabul kriterleri

- [x] Kritik sorunlar ayrı grupta gösterilir.
- [x] Uyarılar ayrı grupta gösterilir.
- [x] Öneriler ayrı grupta gösterilir.
- [x] Her kart neden, etki ve çözüm alanlarını taşır.
- [x] Kural kimliği görünür kalır.
- [x] Türkçe ve İngilizce desteklenir.
- [x] Mobil tek sütun düzeni bulunur.
- [x] Otomatik arayüz sözleşme testi CI hattına bağlanır.
- [x] Pull request doğrulaması başarıyla tamamlanır.

## Sonraki görev

Sprint 09 bu görevle tamamlandı. Sonraki ana çalışma paketi Sprint 10 veri sürümüdür:

```text
AKV-DATA-020 — Tatlı su kayıtlarını kaynaklı partilerle 350’ye çıkarma
```
