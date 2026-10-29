# Dinamik ve Animasyonlu Huzur Ambiyansları — Uygulama Planı

Mevcut **“Allah'a Adım Adım”** uygulamasının çalışan mimarisi, zikir sayacı, kavisli tesbih mekaniği ve üst kısayol yapısı korunarak; doğayla bütünleşmiş **7 dinamik, çok katmanlı animasyonlu ambiyans teması**, **bağımsız ambiyans ses düzeyi kontrolü** ve **önizleme kartlı hızlı ambiyans seçici** entegre edilecektir.

---

## 1. 7 Özgün ve Canlı Ambiyans Teması (`src/data/dhikrs.ts` & `src/components/SceneBackground.tsx`)
Her tema yalnızca renk filtresiyle değil, kendine özgü SVG/CSS ve hafif `requestAnimationFrame` (Canvas) katmanlarıyla birbirinden tamamen ayrışacak şekilde tasarlanacaktır:

1. **Nature — Doğa (`nature`):**
   - Yeşil tepeler, ağaçlar, pastel mavi-sarı gökyüzü ve yumuşak güneş huzmeleri.
   - Rüzgârla yavaşça salınan çimenler/yapraklar, süzülen bulutlar ve uzakta kanat çırparak süzülen kuş sürüleri.
2. **Rainy — Yağmurlu Hava (`rainy`):**
   - Gri-mavi, açık mor ve yumuşak yeşil tonlarında huzurlu yağmur atmosferi (kasvetli olmayan ferah bulut arası ışıklar).
   - Hafif `requestAnimationFrame` tabanlı ince yağmur çisentisi ve cam yüzeyde yavaşça süzülen su damlacıkları.
3. **Night — Gece Ambiyansı (`night`):**
   - Derin lacivert-mor gökyüzü, gümüşi ay ışığı halesi, yavaş hareket eden gece bulutları ve sakin doğa silüeti.
   - Göz yormayan yumuşak yıldız parıltıları ve çimenlerin üzerinde süzülen hafif ateş böcekleri.
4. **Sunrise — Gün Doğumu (`sunrise`):**
   - Ufuk çizgisinden yavaş ve kesintisiz bir atmosfer döngüsüyle yükselen altın güneş.
   - Gökyüzünde mavi, pembe, şeftali ve altın sarısı renk geçişleri, bulut yansımaları ve uyanan doğa/çiçek detayları.
5. **Sunset — Gün Batımı (`sunset`):**
   - Dağların arkasında yavaşça alçalan sıcak güneş; turuncu, pembe, mor ve koyu mavi gökyüzü geçişleri.
   - Ufukta hafif sis katmanı ve sakin su yüzeyinde gün batımı ışık yansımaları.
6. **Moonlit Nature — Ay Işığında Doğa (`moonlit_nature`):**
   - Gümüş, koyu mavi, yumuşak mor ve zümrüt yeşili tonlarında ay ışığıyla aydınlanan sakin göl ve kıyı çiçekleri.
   - Suda yavaşça genişleyen ay ışığı dalgalanmaları (ripples) ve hafif esintiyle salınan kıyı bitkileri.
7. **Peaceful Garden — Huzurlu Bahçe (`peaceful_garden`):**
   - Pastel yeşil, pembe, sarı ve açık mavi tonlarında çiçekli bahçe.
   - Hafif rüzgârla sallanan renkli çiçekler, uçuşan kelebekler ve yumuşak gün ışığı polen/ışık parçacıkları.

*(Not: Mevcut kayıtlı oturumlarla geriye dönük uyumluluk korunacak; her temada zikir metni, sayaç ve tesbih boncukları yüksek kontrastla okunaklı kalacaktır.)*

---

## 2. Performans Dostu ve Modüler Animasyon Sistemi (`src/components/SceneBackground.tsx` & `src/index.css`)
- **Sekme Görünürlüğü Yönetimi (`document.hidden`):** Sekme arka plana geçtiğinde (`visibilitychange`), `requestAnimationFrame` döngüsü ve CSS animasyonları otomatik olarak duraklatılarak mobil pil tüketimi sıfıra indirilecek.
- **Hareket Hassasiyeti (`prefers-reduced-motion`):** Hem işletim sisteminin `prefers-reduced-motion: reduce` medya sorgusu hem de uygulama içi *"Animasyon Yoğunluğunu Azalt"* ayarı dinlenerek hareketler yumuşatılacak veya sabitlenecek.

---

## 3. Tema Uyumlu Ambiyans Sesleri ve Ses Düzeyi Kontrolü (`src/utils/sound.ts` & `src/utils/storage.ts`)
- **Temaya Özel Çevresel Ses Eşleşmesi:**
  - `nature` & `peaceful_garden` & `sunrise` → Hafif meltem ve uzaktan gelen kuş sesleri.
  - `rainy` → Yumuşak yağmur çisentisi ve su damlası tınıları.
  - `night` → Hafif gece böcekleri (cırcır böceği tınısı) ve sakin gece esintisi.
  - `sunset` → Yumuşak akşam rüzgârı ve dingin su sesi.
  - `moonlit_nature` → Hafif su dalgası şırıltısı ve gece doğası.
- **Ayrı Ses Kontrolleri ve Ses Düzeyi Kaydırıcısı (`ambientVolume`):**
  - Zikir boncuğu sesi (`soundEnabled`) ile ambiyans sesi (`ambientEnabled`) ayrı yönetilmeye devam edecek.
  - Ambiyans sesleri varsayılan olarak düşük ve huzurlu bir seviyede (`%35`) başlayacak; kullanıcı **Ambiyans Ses Düzeyi (`0% - 100%`)** kaydırıcısı ile ses yüksekliğini istediği gibi ayarlayabilecek.

---

## 4. Önizleme Kartlı Hızlı Ambiyans Seçici (`src/components/AmbianceModal.tsx`, `DhikrScreen.tsx`, `SettingsScreen.tsx`)
- **Zikir Ekranı İkon Kısayolu:** Zikir ekranının sağ üst kısmındaki metinsiz manzara ikonuna dokunulduğunda, zikir ekranından uzaklaştırmayan kompakt bir **Ambiyans ve Doğa Sesi Önizleme Paneli** açılacak.
- **Küçük Önizleme Kartları:** 7 tema (`Nature`, `Rainy`, `Night`, `Sunrise`, `Sunset`, `Moonlit Nature`, `Peaceful Garden`) canlı mini önizleme kartlarıyla listelenecek; aynı panelden ambiyans sesi açılıp kapatılabilecek ve ses seviyesi ayarlanabilecek.
- **Oturum Koruma:** Tema veya ses değiştirildiğinde mevcut zikir sayısı, seçili zikir ve hedef **kesinlikle sıfırlanmayacak**, tercih `localStorage` üzerinde güvenle saklanacaktır.
