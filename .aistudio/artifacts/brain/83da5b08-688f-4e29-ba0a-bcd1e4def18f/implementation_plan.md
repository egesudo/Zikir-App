# Yeni Huzur Verici Canlı Arka Plan Ambiyans Temaları ve Özel Doğa Sesleri

Mevcut **“Allah'a Adım Adım”** zikir uygulamasına; kullanıcının tercih ettiği **4 yeni canlı doğa ambiyansı temasını**, her temaya özgü **çok katmanlı SVG/CSS ve Canvas parçacık animasyonlarını**, **özel Web Audio API doğa sesi dizilerini** ve **Ritim Senkronizasyonu** desteğini entegre eder.

## Kullanıcı İncelemesi ve Onaylanan Kararlar

> [!IMPORTANT]
> Kullanıcının 1. aşamada onayladığı tema ve ses tercihleri aşağıda özetlenmiştir. Tüm yeni temalar mevcut 7 temayla birlikte ambiyans seçicide yer alacak ve zikir ilerlemesini sıfırlamadan anında geçiş yapılabilecektir.

- **Onaylanan Karar 1 (Yeni Canlı Arka Plan Temaları):**
  1. **Sisli Dağ Zirvesi ve Bulut Denizi (`misty_mountain`):** Katmanlı dağ silüetleri arasında süzülen bulut denizi, nefes alan vadi sisi, yumuşak zirve ışığı ve yüksek irtifa ışık zerrecikleri.
  2. **Sonbahar Esintisi ve Altın Yapraklar (`autumn_breeze`):** Kehribar, kızıl ve altın sarısı tonlarda rüzgârla savrulan akçaağaç yaprakları, sıcak sonbahar güneşi huzmeleri ve dalgalanan altın başaklar.
  3. **Sakin Deniz Kıyısı ve Hafif Dalgalar (`calm_seashore`):** Turkuaz ve sedef mavisi kıyı suları, kıyıya vuran ritmik köpüklü dalga halkaları, ufukta süzülen martılar ve su üstü güneş parıltıları.
  4. **Karlı Kış Sabahı ve Süzülen Kar Taneleri (`snowy_winter`):** Yumuşak buz mavisi ve sedefli kış sabahı gökyüzü, karla kaplı çam tepeleri, Canvas + SVG üzerinde huzurla süzülen kristal kar taneleri ve dingin sabah sisi.
- **Onaylanan Karar 2 (Özel Doğa Sesleri ve Ritim Uyumu):** Her yeni temaya özel Web Audio API akustik doğa sesi katmanları (`mountain_wind`, `autumn_leaves`, `ocean_waves`, `winter_breeze`) eklenecek ve kullanıcının zikir ritmiyle (EMA) hem görsel animasyon hızı hem de ses nefes zarfı senkronize çalışacaktır.

---

## 1. Genel Bakış ve Temel Konsept

- **Ne Yapar:** Kullanıcının zikir çekerken doğanın farklı mevsimlerini ve coğrafyalarını (yüksek dağ zirvesi, altın sonbahar korusu, dingin deniz kıyısı, sessiz kış sabahı) canlı, derinlikli ve göz yormayan animasyonlarla deneyimlemesini sağlar.
- **Hedef Kullanıcı Deneyimi:** Uzun süreli zikir ve tefekkür oturumlarında gözü yormayan, okunabilirliği (4.5:1+ kontrast) koruyan, pil dostu ve işitsel olarak gerçekçi bir sükûnet ortamı.
- **Temel Değer:** Statik renk geçişleri yerine her temanın kendine has fiziksel hareket dili (süzülen kar taneleri, kıyıya vuran köpüklü dalgalar, bulut denizi akışı, dökülen altın yapraklar) ve akustik doğa imzası bulunur.

---

## 2. Kullanıcı Deneyimi ve Görsel Tasarım

### A. 4 Yeni Ambiyans Temasının Görsel ve Atmosferik Kimliği

1. **Sisli Dağ Zirvesi (`misty_mountain` — *Misty Mountain*)**
   - **Görsel Katmanlar:** Arka planda pastel arduvaz mavisi ve gümüş-kehribar şafak geçişi; 4 kademeli uzak dağ zirveleri; vadiler arasında yatay ve dikey nefes alarak akan çok katmanlı **Bulut Denizi (Sea of Clouds)**; zirveden süzülen yumuşak ışık huzmeleri.
   - **Tesbih Boncukları:** *Kuvars Kristali*, *Dağ Arduvazı* ve *Buzul Kehribarı* tonlarında yarı saydam parlak boncuklar.
   - **Özel Doğa Sesi (`mountain_wind`):** Yüksek irtifa yumuşak vadi esintisi, derin akustik dağ yankısı ve uzaktan gelen dingin kartal/kuş çağrıları.

2. **Sonbahar Esintisi (`autumn_breeze` — *Autumn Breeze*)**
   - **Görsel Katmanlar:** Sıcak krem-kehribar gökyüzü, kızıl ve altın sarısı sonbahar tepeleri, rüzgârla diyagonal süzülen ve kendi ekseninde salınan çoklu **Altın Yaprak (`autumnLeafFall`)** katmanları, sıcak ikindi güneşi huzmeleri.
   - **Tesbih Boncukları:** *Akçaağaç Kehribarı*, *Tarçın Ağacı* (ahşap dokulu) ve *Altın Yaprak* boncukları.
   - **Özel Doğa Sesi (`autumn_leaves`):** Belirgin kuru yaprak hışırtısı (`1450Hz` bandpass + LFO rüzgâr kabarması), ılık sonbahar rüzgârı ve sakin orman kuşları.

3. **Sakin Deniz Kıyısı (`calm_seashore` — *Calm Seashore*)**
   - **Görsel Katmanlar:** Açık gök mavisi ve turkuaz ufuk, güneşin deniz yüzeyindeki elmas parıltıları (`waterShimmer`), sahile doğru ritmik olarak genişleyip sönen **Kıyı Dalgaları (`shoreWaveRoll`)**, su yüzeyinde genişleyen halkalar ve ufukta süzülen kuşlar.
   - **Tesbih Boncukları:** *Deniz Köpüğü İncisi*, *Akdeniz Turkuazı* ve *Mercan Taşı* boncukları.
   - **Özel Doğa Sesi (`ocean_waves`):** Periyodik olarak kıyıya vurup geri çekilen ritmik deniz dalgası zarfı (`0.11 Hz` LFO modülasyonlu köpük ve su akışı), kıyı çakıl su şırıltısı ve uzaktan gelen hafif martı/kıyı esintisi.

4. **Karlı Kış Sabahı (`snowy_winter` — *Snowy Winter*)**
   - **Görsel Katmanlar:** Dingin buz mavisi, lavanta grisi ve sedef beyazı kış sabahı gökyüzü; karla örtülü yumuşak tepeler ve çam silüetleri; hem SVG hem de Canvas katmanında rüzgârla yumuşakça salınarak inen **Kar Taneleri (`snowfall` parçacık sistemi)** ve nefes alan sabah kırağı sisi.
   - **Tesbih Boncukları:** *Kış İncisi*, *Buz Kristali* (fasetli) ve *Gümüş Çam* boncukları.
   - **Özel Doğa Sesi (`winter_breeze`):** İnce, kristal berraklığında yumuşak kış esintisi, kar sessizliğini hissettiren ılık akustik rezonans ve nadir kristal çan/buz damlası tınıları.

### B. Okunabilirlik ve Ergonomi Kuralları
- **Kontrast Koruması:** Açık tonlu temalarda (`autumn_breeze`, `snowy_winter`, `calm_seashore`) koyu arduvaz/toprak metin rengi (`isDarkText: true`) ve yarı saydam krem cam yüzeyler; derin kontrastlı `misty_mountain` temasında ise fildişi metin ve koyu cam yüzeyler kullanılarak WCAG AA (4.5:1+) okunabilirlik standardı korunur.
- **Mobil Dokunma Ergonomisi:** Ambiyans seçici modalındaki ve ayarlar ekranındaki tema kartları en az `48x48px` dokunma alanına sahip olacak, küçük canlı renk önizlemeleri ve ses açıklamalarıyla tek elle kolayca seçilebilecektir.

---

## 3. Temel Ürün Kararları ve Teknik Tercihler

- **Karar 1: Hibrit SVG/CSS Keyframes + Canvas 2D Parçacık Mimarisi**
  - *Seçilen Yaklaşım:* Ufuk, dağlar, dalgalar, bulut denizi ve büyük yapraklar GPU hızlandırmalı (`transform`, `opacity`) SVG/CSS katmanlarıyla; kar taneleri (`snow`), kıyı su parıltıları (`sea_sparkle`) ve rüzgâr polenleri ise tek bir `requestAnimationFrame` Canvas döngüsüyle çizilir.
  - *Neden:* Mobil cihazlarda sıfır kare düşüşü (60 FPS) ve düşük pil tüketimi sağlar; sekme arka plana geçtiğinde (`document.hidden`) veya `prefers-reduced-motion` etkin olduğunda tüm hesaplamalar otomatik duraklatılır.
- **Karar 2: Web Animations API ile Sıçramasız Ritim Senkronizasyonu**
  - *Seçilen Yaklaşım:* Yeni eklenen 4 temadaki tüm CSS animasyonları (`cloudSeaFlow`, `autumnLeafFall`, `shoreWaveRoll`, `winterMistDrift`) ve Canvas kar/parıltı parçacıkları, mevcut `rhythmTempoScale` (`0.90x – 1.42x`) değerine bağlanır.
  - *Neden:* Kullanıcı zikir çektikçe kar tanelerinin süzülüşü, kıyı dalgalarının ritmi ve bulut denizinin akışı hiçbir animasyon sıçraması olmadan huzurlu bir ivme kazanır.

---

## 4. Teknik Mimari ve Veri Akışı

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        KULLANICI ZİKİR ETKİLEŞİMİ                        │
│          (Tesbih Dokunuşu / Tema Seçimi / Ses & Hareket Ayarları)        │
└───────────────────┬──────────────────────────────────┬───────────────────┘
                    │                                  │
                    ▼                                  ▼
┌───────────────────────────────────────┐  ┌───────────────────────────────┐
│     EMA RİTİM & SES MOTORU (Audio)    │  │   TEMA & DURUM YÖNETİMİ       │
│  • Dual-Layer EMA Hız Hesaplama       │  │  • 11 Canlı Ambiyans Teması   │
│  • 600ms Pürüzsüz Crossfade           │  │    (7 Mevcut + 4 Yeni Tema)   │
│  • Zikir Boncuğu Mikro-Ducking        │  │  • localStorage Kalıcılığı    │
│  • Özel Doğa Sesi Sentezleyicileri:   │  │  • Otomatik Ses Eşleştirme    │
│    - mountain_wind (Vadi Rüzgârı)     │  └───────────────┬───────────────┘
│    - autumn_leaves (Yaprak Hışırtısı) │                  │
│    - ocean_waves   (Kıyı Dalgaları)   │                  │
│    - winter_breeze (Kış Esintisi)     │                  │
└───────────────────┬───────────────────┘                  │
                    │ rhythmTempoScale (0.90x - 1.42x)     │ themeId
                    └───────────────────┬──────────────────┘
                                        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                 CANLI ARKA PLAN SAHNE MOTORU (SceneBackground)           │
├───────────────────────────────────┬──────────────────────────────────────┤
│   SVG + CSS GPU Katmanları        │   Canvas 2D Parçacık Sistemi         │
│   • getAnimations().playbackRate  │   • dt * rhythmScaleRef.current      │
│   • Bulut Denizi (cloudSeaFlow)   │   • Kar Taneleri (snow)              │
│   • Altın Yaprak (autumnLeafFall) │   • Deniz Parıltısı (sea_sparkle)    │
│   • Kıyı Dalgası (shoreWaveRoll)  │   • Sonbahar Tozu & Işık Zerrecikleri│
└───────────────────────────────────┴──────────────────────────────────────┘
```

### Etkileşim ve Durum Eşleştirmesi
- **Tema Veri Modeli:** `ThemeId` birleşim tipine `'misty_mountain' | 'autumn_breeze' | 'calm_seashore' | 'snowy_winter'` eklenir; her biri kendi renk paleti, kontrast bayrağı (`isDarkText`), tesbih boncuğu dizisi ve ses açıklamasıyla tanımlanır.
- **Ambiyans Ses Modları:** `AmbientSoundMode` tipine `'mountain_wind' | 'autumn_leaves' | 'ocean_waves' | 'winter_breeze'` modları eklenir. Kullanıcı ambiyans seçiciden yeni bir tema seçtiğinde otomatik mod (`auto`) ilgili temanın özgün doğa sesini 600ms crossfade ile başlatır; ayrıca Ayarlar ekranından bu sesler manuel olarak da seçilebilir.
