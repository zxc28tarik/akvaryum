# AKV-CORAL-001 — Mercan Bakım Profilleri

## Sonuç

Mevcut katalogdaki 50 mercanın tamamı soft, LPS ve SPS ayrımıyla ışık, akıntı ve mercan-agresyon alanlarına kavuştu.

Dağılım:

- 18 soft coral
- 20 LPS coral
- 12 SPS coral

Tamamlanan alanlar:

- `habitat.light`: 50/50
- `habitat.flow`: 50/50
- `compatibility.coralAggression`: 50/50

## Veri yöntemi

Soft/LPS/SPS genel bakım profilleri ile cins düzeyindeki istisnalar `data/curation/coral-care-v1.mjs` içinde tutulur.

Genel tabanlar:

- Soft mercan: orta ışık, orta akıntı, düşük agresyon
- LPS mercan: orta ışık, orta akıntı, orta agresyon
- SPS mercan: yüksek ışık, yüksek akıntı, orta agresyon

Cins istisnaları taban değerlerinden önce uygulanır. Örnekler:

- `Discosoma`: düşük ışık ve düşük akıntı
- `Galaxea`: değişken akıntı ve yüksek agresyon
- `Tubastraea`: düşük ışık ve düşük akıntı
- `Acropora`: yüksek ışık ve yüksek akıntı
- `Leptoseris`: düşük ışık ve orta akıntı

Mevcut 50 mercanın tamamı kayıtlı bir cins profiliyle eşleşti.

## Güven ve kaynak ilkesi

Bu alanlar tür bazlı doğrulanmış ölçümler olarak sunulmaz. Mercan bakım kütüphanesi, kategori rehberleri ve cins bakım sayfaları gözden geçirilerek oluşturulmuş düşük güvenli curation değerleridir.

- Kaynak kimliği: `coral-care-curation-rules-v1`
- Kaynak durumu: `reviewed`
- Güven düzeyi: `low`
- Canlı doğrulama durumu: `needs_review`
- Tür bazlı dış kaynak incelemesi: gerekli

Mercan olmayan 530 kayıt değiştirilmedi.

## Şema değişikliği

`Inhabitant v1` aşağıdaki isteğe bağlı alanları tanır:

- `habitat.light`: `low | medium | high | unknown`
- `compatibility.coralAggression`: `none | low | medium | high | unknown`

Alanlar genel şemada isteğe bağlıdır. Mercanlarda dolu olma zorunluluğu `check:corals` doğrulayıcısıyla uygulanır.

## Production bağlantısı

Vite production verisi aşağıdaki sırayla hazırlanır:

1. Legacy kayıtlar `Inhabitant v1` modeline taşınır.
2. Sosyal/bakım curation uygulanır.
3. Tank uzunluğu curation uygulanır.
4. Mercan bakım profilleri uygulanır.
5. Ortak katalog oluşturulur.

## Doğrulama

`npm run check:corals` şu kontrolleri yapar:

- gerçek 580 kayıt üzerinde çalışma
- 50 mercanın tamamının bulunması
- soft/LPS/SPS gruplarının tamamının bulunması
- ışık, akıntı ve agresyon alanlarında `unknown` kalmaması
- kaynak ve alan-kaynak bağlantılarının korunması
- kayıtların düşük güvenli kalması
- mercan olmayan kayıtların değişmemesi
- seçili cins istisnalarının doğru uygulanması
- Inhabitant v1 JSON Schema uyumu
- Vite production bağlantısı

Toplam 11 odaklı doğrulama senaryosu bulunur.

## Kabul durumu

- [x] Soft/LPS/SPS ayrımı çalışıyor.
- [x] 50 mercanın ışık alanı dolu.
- [x] 50 mercanın akıntı alanı dolu.
- [x] 50 mercanın agresyon alanı dolu.
- [x] Kaynak ve güven durumu açık.
- [x] Production build başarılı.
- [x] Native production paketi başarılı.

`AKV-CORAL-001` tamamlandı. Sprint 08 içinde sıradaki görev `AKV-ENG-014` omurgasız ve mercan güvenliği ayrımıdır.
