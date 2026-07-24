# AKV-UI-021 — Sonuç Alt Puan Kartları

**Durum:** DONE  
**Başlangıç tarihi:** 24 Temmuz 2026  
**Tamamlanma tarihi:** 24 Temmuz 2026  
**Uygulama PR’ı:** #25  
**Bağımlılık:** AKV-ENG-016

## Amaç

Motorun ürettiği dört alt puanı sonuç ekranında açık ve anlaşılır biçimde göstermek:

1. Çevresel uyum — 30 puan
2. Davranış ve sosyal uyum — 30 puan
3. Tank ve biyolojik yük — 25 puan
4. Habitat ve bakım uyumu — 15 puan

## Uygulanan görünüm

- Sonuç ekranının altında dört ayrı puan kartı bulunur.
- Her kart bölüm puanını, azami puanı, durumunu ve kaybedilen puanı gösterir.
- Kritik, uyarı, iyi ve değerlendirilmedi durumları görsel olarak ayrılır.
- Bölümdeki bulgular açılır ayrıntı alanında listelenir.
- Her bulguda neden, etki ve çözüm alanları gösterilir.
- Kritik üst sınır uygulandıysa ham bölüm toplamı ve uygulanan toplam puan sınırı ayrıca açıklanır.
- Türkçe ve İngilizce metinler desteklenir.
- 760 piksel altında kartlar tek sütuna geçer.
- Puan çubukları erişilebilir `progressbar` özellikleri taşır.

## Teknik yaklaşım

Yeni görünüm doğrudan mevcut `app.jsx` içinde çalışır. Böylece:

- kök statik sürüm ve Vite production sürümü aynı kodu kullanır;
- sıkıştırılmış legacy bileşen kaynakları değiştirilmez;
- motor puan hesabı yeniden yazılmaz;
- görünüm `result.scoreBreakdown` verisini okur;
- kritik ve uyarı bulguları motorla aynı bölüm sınıflandırmasıyla kartlara bağlanır.

## Doğrulama

Yeni komut:

```bash
npm run check:score-panel
```

Kontrol kapsamı:

- dört bölümün varlığı;
- çevre, davranış, tank ve habitat bulgularının doğru sınıflandırılması;
- Türkçe ve İngilizce metinler;
- kritik toplam puan sınırı açıklaması;
- neden, etki ve çözüm alanları;
- erişilebilir puan çubukları;
- mobil tek sütun düzeni;
- GitHub Actions bağlantısı.

PR #25 GitHub Actions doğrulamasında aşağıdakilerin tamamı geçti:

- `check:score-panel`;
- dört alt puan motor testi;
- 32 temel motor senaryosu;
- bütün veri, migrasyon, katalog ve mobil kontroller;
- production build;
- native production paket doğrulaması.

## Kabul kriterleri

- [x] Dört bölüm puanı sonuç ekranında görünür.
- [x] Her bölüm puan/azami puan ve durum gösterir.
- [x] Puan kaybının nedeni açılır ayrıntıda görünür.
- [x] Kritik sınır uygulaması açıklanır.
- [x] Türkçe ve İngilizce desteklenir.
- [x] Mobil tek sütun düzeni bulunur.
- [x] Otomatik arayüz sözleşme testi CI hattına bağlanır.
- [x] Pull request doğrulaması başarıyla tamamlanır.

## Sonraki görev

```text
AKV-UI-022 — Neden / etki / çözüm kartlarını ana sonuç bulgularına yayma
```
