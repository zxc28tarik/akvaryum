# 17 — Projeye Yükleme ve Yapay Zekâ Çalışma Talimatı

## Önerilen konum

Plan belgeleri projede şu konumda tutulur:

```text
docs/plans/AKVARYUM_GELISTIRME_IS_PLANI/
```

## Yapay zekâya verilecek ana talimat

```text
AKVARYUM projesinde çalışırken önce
`docs/plans/AKVARYUM_GELISTIRME_IS_PLANI/00_OKU_BENI.md`,
`02_ANA_YOL_HARITASI.md`,
`05_VERI_MODELI_VE_KODLANACAK_ALANLAR.md` ve
`12_ONCELIKLI_BACKLOG.md` dosyalarını oku.

Bu belgeleri projenin geliştirme kaynağı kabul et. Aynı anda bütün yol haritasını uygulama. Öncelik sırasına göre yalnız seçilen görev kimliğini uygula. Görevin kapsamını, kapsam dışını ve kabul kriterlerini başlamadan önce özetle. Mevcut canlı kimliklerini bozma. Türkçe ve İngilizce alanları birlikte tamamla. Yeni veri eklerken şema, kaynak, doğrulama ve test kurallarına uy. İş sonunda değiştirdiğin dosyaları, çalıştırdığın testleri ve tamamlanmayan noktaları açıkça yaz.
```

## İlk uygulanan görev

```text
AKV-ARCH-001 — Vite + React proje iskeleti kur
```

Canlı siteyi korumak için uygulanan sıra:

1. Yeni yapı `vite-app/` altında kurulur.
2. Mevcut veri envanter testi çalıştırılır.
3. Production build alınır.
4. Eski ve yeni sürüm karşılaştırılır.
5. Kabul kriterleri geçmeden eski kök yükleyici kaldırılmaz.

## Veri ekleme görevi başlatırken

Modelden tek seferde yüzlerce kayıt istenmez. Şu biçim kullanılır:

```text
`DATA-FRESH-TETRA-001` görevini uygula.
En fazla 20–25 kayıt ekle.
Önce mevcut kayıtlarla tekrar kontrolü yap.
Her kayıt için zorunlu alanları ve kaynakları tamamla.
Şema doğrulama, iki dil kontrolü ve motor regresyon testlerini çalıştır.
Kaynağı belirsiz alanları uydurma; `needs_update` olarak işaretle.
```

## Görev bitirme kuralı

Her çalışma sonunda şunlar kaydedilir:

- Görev kimliği ve durum
- Değiştirilen dosyalar
- Eklenen/değişen veri sayıları
- Çalıştırılan testler
- Kabul kriteri sonucu
- Bilinen açıklar
- Sonraki önerilen tek görev

## Yol haritasını güncelleme

Bir görev tamamlandığında:

1. `12_ONCELIKLI_BACKLOG.md` içindeki durum güncellenir.
2. Önemli teknik karar varsa `15_KARAR_KAYDI_VE_KAPSAM_KONTROLU.md` içine ADR eklenir.
3. Yeni zorunlu iş çıkarsa yeni görev kimliği oluşturulur.
4. Plan sessizce değiştirilmez; değişiklik nedeni commit mesajında belirtilir.

## Kaynak dosyalarını koruma

- Orijinal kaynaklar migrasyon tamamlanana kadar silinmez.
- Veri kimlikleri değiştirilmez.
- Büyük toplu düzenleme öncesi envanter çıktısı alınır.
- Her veri migrasyonunda önce/sonra kayıt sayısı karşılaştırılır.
