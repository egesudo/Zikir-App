# Uygulama Planı: 5 Enstrüman Tınısı, Doğa Ana Hattı ve Peak Limiter Ses Motoru Güncellemesi

Kullanıcının paylaştığı ekran görüntüsü ve tercihler doğrultusunda; ayarlar ve ambiyans menüsündeki eski karmaşık ses listesi ("Gece Böcekleri", "Esintili Vadi", "Hafif Su Dalgası" vb.) tamamen kaldırılarak yerine **5 ana akustik enstrüman** (Ney, Kanun, Ud/Tanbur, Kalimba, Sıcak Pad) yerleştirilecektir. Arka planda durgun seher yeli ana hat olarak akacak, 12-16 saniyede bir fısıltı düzeyinde melodik nağmeler duyulacak ve zikir boncuğu çekildikçe seçili enstrümandan çok hafif bir mikro-tını gelecektir.

---

## 1. Mimari ve Ses Tasarımı İlkeleri

1. **Görsel Ses Dizinlerinin Yenilenmesi (Arayüz Düzenlemesi):**
   - Kullanıcının ilettiği ekran görüntüsündeki eski doğa sesleri listesi tamamen kaldırılarak, doğrudan enstrüman kimliğini yansıtan zarif kartlar yerleştirilecektir:
     - **Otomatik (Manevi Temaya Göre Enstrüman)**
     - **Ney (Bambu & Nefes Nağmeleri)**
     - **Kanun (Zarif Tel Arpejleri & Berrak Tını)**
     - **Ud & Tanbur (Tok Ahşap Mızrap Tınısı)**
     - **Kalimba (Meditatif Kristal Çan Tınısı)**
     - **Sıcak Pad (432 Hz Kadife Zemin Akoru)**

2. **Durgun Seher Yeli ve Kuş Sesleri Ana Hattı:**
   - Her enstrümanın zemininde, ses patlaması yapmayan 220 Hz alçak geçiren filtreli sakin bir seher esintisi ve 18 saniyede bir beliren fısıltı düzeyinde seher kuşu akışı bulunacaktır.

3. **12–16 Saniyelik Seyrek Nağme Döngüsü:**
   - Seçili enstrümana uygun olarak her 13.5 saniyede bir (12-16 saniye aralığında), zikri bölmeyen fısıltı seviyesinde (0.014 - 0.018 gain) 3-4 notalık duru nağmeler çalacaktır.

4. **Zikir Boncuğunda Enstrümana Özel Mikro-Tını Etkileşimi:**
   - Boncuk çekildiğinde, tok ahşap boncuk dokunuşuyla birlikte **seçili enstrümana özgü mikro-fısıltı** (0.006 gain) yankılanacaktır:
     - Ney seçiliyse: hafif ney nefesi
     - Kanun seçiliyse: su gibi tek tel dokunuşu
     - Ud seçiliyse: tok ahşap mızrap tınısı
     - Kalimba seçiliyse: berrak minik çan çınlaması
     - Pad seçiliyse: kadife mikro-akustik kabarma

5. **Soft-Ramp Fade-In ve Peak Limiter Koruması:**
   - 3 saniyelik pürüzsüz ipeksi başlangıç (`soft-ramp` / `setTargetAtTime` tau=0.95).
   - Hiperbolik tanjant `WaveShaper` + `DynamicsCompressor` (-24 dBFS eşik, 32 dB knee) ile sıfır kırpılma, sıfır hoparlör cızırtısı.
   - Başlangıç ses seviyesi %20 (`0.20`), tavan kazancı maksimum 0.05 gain ile sınırlı.

---

## 2. Değişiklik Yapılacak Dosyalar

### 1. `src/utils/storage.ts`
- `AmbientSoundMode` tipini 5 ana enstrümana indirgeme:
  `'auto' | 'ney' | 'kanun' | 'oud' | 'kalimba' | 'ambient_pad'`
- `AMBIENT_MODE_ORDER` ve `AMBIENT_MODE_LABELS` listelerini arayüz için temiz ve sade olarak güncelleme.
- `DEFAULT_SETTINGS.ambientVolume` = `0.20` garantileme.

### 2. `src/utils/sound.ts`
- `ActiveSoundProfile` tipini `AmbientSoundMode` ile eşitleme (`auto`, `ney`, `kanun`, `oud`, `kalimba`, `ambient_pad`).
- 5 enstrüman için arka plan seher yeli ve enstrüman katmanlarını oluşturma.
- 12-16 saniyelik seyrek nağme motorunu seçili enstrümana bağlama.
- `playBeadClickSound` fonksiyonunu seçili enstrümanın moduna göre mikro-tını üretecek şekilde güncelleme.
- 3 saniyelik `soft-ramp` ve `peak limiter` filtreleme zincirini optimize etme.

### 3. `src/components/SettingsScreen.tsx`
- Kullanıcının ekran görüntüsünde işaret ettiği eski doğa listesini kaldırıp yerine 5 enstrüman kartını şık simgelerle (`Music`, `Sparkles`, `Feather`, `Bell`, `Layers`) yerleştirme.

### 4. `src/components/AmbianceModal.tsx`
- Hızlı ambiyans modalındaki ses seçeneklerini de aynı 5 enstrümanla senkronize etme.

---

## 3. Doğrulama ve Test Adımları

1. **Statik Kod Analizi (`lint_applet`):**
   - TypeScript derleme denetimi (`tsc --noEmit`) ile sıfır hata sağlama.
2. **Derleme Doğrulaması (`compile_applet`):**
   - Vite üretim paketlemesini başarıyla tamamlama.
3. **Kullanıcı Arayüzü ve Akustik Test:**
   - Ekran görüntüsündeki eski ses listesinin kalktığı, yerine 5 huzurlu enstrümanın geldiğinin doğrulanması.
   - %20 kısık sesle ve 3 saniyede usulca başlayan açılışın test edilmesi.
   - Boncuk çekildikçe seçili enstrümandan gelen mikro-tınıların dinlenmesi.
