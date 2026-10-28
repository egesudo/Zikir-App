# Allah'a Adım Adım — Zikir Ekranı 'Doğa Sesi Türü' Seçici Güncelleme Planı

Bu güncelleme, zikir ekranına doğrudan erişilebilen, sıcak krem/bej tasarımıyla uyumlu ve dikkat dağıtmayan bir **'Doğa Sesi Türü' seçici** ekler. Kullanıcılar Ayarlar ekranına gitmeye gerek kalmadan zikir esnasında **'Huzurlu Şadırvan'**, **'Esintili Vadi'** veya **'Hafif Ney'** ambiyansları arasında tek dokunuşla geçiş yapabilir.

---

## Kullanıcı İncelemesi ve Tasarım Kararları

> [!IMPORTANT]
> İsteğiniz doğrultusunda zikir ekranındaki ambiyans ses seçici aşağıdaki şekilde tasarlanmıştır:

- **Karar 1 — Zikir Ekranında Zarif 'Doğa Sesi Türü' Seçici:** Zikir ekranının üst kontrol çubuğundaki ambiyans butonuna dokunulduğunda (veya kompakt seçici çubuğunda) açılan, sıcak krem/kum taşı (`#F7F1E5/92 backdrop-blur-md`) yüzeyli bir **Doğa Sesi Türü** seçici sunulur.
- **Karar 2 — 3 Temel Huzurlu Ambiyans Seçeneği (+ Sessiz Mod):**
  1. **Huzurlu Şadırvan (`river`):** Dingin su akışı ve mermer şadırvan su şırıltısı.
  2. **Esintili Vadi (`wind`):** Seher vakti vadide yavaşça esen yumuşak rüzgâr.
  3. **Hafif Ney (`ney`):** Derinden gelen sıcak ney nefesi ve Rast/Uşşak dem tınısı.
  4. **Kapalı:** Arka plan ambiyans sesini tek dokunuşla sessize alma imkânı.
- **Karar 3 — Anında Ses Geçişi ve Kalıcılık:** Seçilen doğa sesi türü anında Web Audio API ambiyans motorunu (`syncAmbientSoundscape`) günceller, aktif seçeneği görsel olarak vurgular ve `localStorage` üzerinden Ayarlar ekranıyla senkronize kalır.

---

## Sistem ve Etkileşim Diyagramı

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ZİKİR EKRANI — DOĞA SESİ TÜRÜ SEÇİCİ                 │
├─────────────────────────────────────────────────────────────────────────┤
│  Üst Çubuk / Kompakt Seçici: [ Doğa Sesi: Huzurlu Şadırvan ▾ ]          │
│                                      │                                  │
│         ┌────────────────────────────┼────────────────────────────┐     │
│         ▼                            ▼                            ▼     │
│  ┌──────────────────┐       ┌──────────────────┐       ┌──────────────┐ │
│  │ Huzurlu Şadırvan │       │  Esintili Vadi   │       │  Hafif Ney   │ │
│  │   (Su Akışı)     │       │ (Seher Rüzgârı)  │       │ (Sıcak Dem)  │ │
│  └────────┬─────────┘       └────────┬─────────┘       └──────┬───────┘ │
│           └──────────────────────────┼────────────────────────┘         │
│                                      ▼                                  │
│             Anında Web Audio API Ambiyans Geçişi + localStorage         │
└─────────────────────────────────────────────────────────────────────────┘
```
