# Allah'a Adım Adım — Arapça Hat Ferahlığı (Spacing), Güvenlik Denetimi ve Yayın (Deploy) Doğrulama Planı

Bu son aşama planı; zikir ekranında Arapça zikir ifadesinin üst çubuktaki **Geri**, **Zikir ve Hedef Seç** ve **Ses** butonlarıyla görsel olarak sıkışmasını önleyerek ferah bir nefes alanı açar, tüm kod tabanını güvenlik ve hata yönetimine karşı sıkılaştırır ve GitHub / Vercel üzerinde sorunsuz yayınlanacak şekilde doğrular.

---

## Kullanıcı İncelemesi ve Tasarım Kararları

> [!IMPORTANT]
> İsteğiniz doğrultusunda gerçekleştirilecek 3 temel çalışma aşağıda özetlenmiştir:

- **Karar 1 — Üst Buton Hizalaması ve Arapça Yazı İçin Ferah Boşluk (Spacing):**
  - Üst çubuk ekranın sol ve sağ kenarlarına dengeli biçimde yaslanır: **Geri** butonu sol köşede, **Zikir ve Hedef Seç** ile **Ses** butonları ise sağ köşeye çekilir.
  - Üst kontrol çubuğu ile Arapça zikir hattı arasına cömert bir dikey boşluk (`mt-7 sm:mt-10` ve ek `line-height` / `padding-top` koruması) eklenerek harekeli Arapça yazının hiçbir ekran boyutunda üst butonlarla üst üste binmemesi ve ferah bir gökyüzü alanında durması sağlanır.
- **Karar 2 — Güvenlik Sıkılaştırması (Security Hardening):**
  - `localStorage` okuma/yazma katmanında (`storage.ts`) sıkı tip ve beyaz liste (`whitelist`) doğrulaması uygulanarak bozuk veri veya `prototype pollution` / XSS vektörleri tamamen engellenir.
  - Özel hedef girişinde yalnızca güvenli tam sayı aralığı (`1 - 10.000`) kabul edilir; harici betik, `innerHTML` veya güvensiz kaynak kullanımı bulunmadığı doğrulanır.
- **Karar 3 — Build Doğrulaması ve Vercel / GitHub Yayın Yapılandırması:**
  - `vercel.json` yapılandırması ile statik çıktı (`dist`) ve güvenlik başlıkları (`X-Content-Type-Options`, `Referrer-Policy`) tanımlanır; `npm run lint` ve `npm run build` testleriyle sıfır hata garantilenir.

---

## 1. Zikir Ekranı Ferah Yerleşim ve Spacing Diyagramı

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [ ← Geri ]                                 [ Zikir / Hedef ]  [ 🔊 ]    │
│ (Sol kenara hizalı)                        (Sağ kenara çekilmiş grup)   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│          ↕ Ferah Dikey Nefes Alanı (mt-8 / sm:mt-10, ~36px-44px)        │
│            (Arapça harekeler üst butonlara asla yaklaşmaz)              │
│                                                                         │
│                         سُبْحَانَ اللّٰهِ                               │
│                      ─────── ◆ ───────                                  │
│                          Sübhanallah                                    │
│             Allah her türlü eksiklikten uzaktır, yücedir                │
│                                                                         │
│          ↕ Dengeli Orta Boşluk                                          │
│                                                                         │
│          ═══◯═══◯═══◯═══◯═══◯═══◯═══◯═══ (Kavisli Tesbih)               │
│                        ╭───────────╮                                    │
│                        │  12 / 33  │  (Yarı Saydam Progress Ring)       │
│                        ╰───────────╯                                    │
│                                                                         │
│                 [       ZİKİR ÇEK (DOKUN)       ]                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Güvenlik ve Build Kontrol Listesi
- **Veri Doğrulama (`storage.ts`):** `selectedDhikrId` ve `themeId` değerlerinin yalnızca tanımlı sabit listelerdeki (`DHIKR_LIST`, `THEME_ORDER`) geçerli kimliklerle eşleştiğinin doğrulanması.
- **Sayısal Sınır Koruması:** `currentCount` ve `targetCount` değerlerinin `Number.isFinite` ve `[0, 10000]` sınırlarıyla korunması.
- **Yayın Hazırlığı (`vercel.json`):** Statik derleme çıktısı ve güvenlik başlıklarının eklenmesi.
