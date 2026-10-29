export interface DhikrItem {
  id: string;
  arabic: string;
  transliteration: string;
  meaningTr: string;
  meaningEn: string;
  noteTr: string;
  recommendedTarget: number;
}

export type ThemeId =
  | 'nature'
  | 'rainy'
  | 'night'
  | 'sunrise'
  | 'sunset'
  | 'moonlit_nature'
  | 'peaceful_garden';

export interface BeadColorStop {
  name: string;
  base: string;
  highlight: string;
  shadow: string;
  glow: string;
  faceted?: boolean;
  starry?: boolean;
  woodGrain?: boolean;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  englishName: string;
  subtitle: string;
  soundDescription: string;
  swatch: string;
  isDarkText: boolean;
  accentColor: string;
  ringGradientStart: string;
  ringGradientEnd: string;
  buttonBg: string;
  buttonText: string;
  beadStyle:
    | 'olive_amber'
    | 'sandstone_pearl'
    | 'lavender_amethyst'
    | 'pastel_pearls'
    | 'ruby_faceted'
    | 'cosmic_galaxy'
    | 'emerald_amber'
    | 'warm_blossom';
  beads: BeadColorStop[];
}

export const DHIKR_LIST: DhikrItem[] = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ اللّٰهِ',
    transliteration: 'Sübhanallah',
    meaningTr: 'Allah her türlü eksiklikten uzaktır, yücedir',
    meaningEn: 'Glory be to Allah',
    noteTr: 'Kâinattaki kusursuz düzeni ve Yaratıcının yüceliğini tefekkür etmek için okunur.',
    recommendedTarget: 33,
  },
  {
    id: 'alhamdulillah',
    arabic: 'اَلْحَمْدُ لِلّٰهِ',
    transliteration: 'Elhamdülillah',
    meaningTr: 'Hamd ve şükür yalnızca Allah’adır',
    meaningEn: 'All praise is due to Allah',
    noteTr: 'Verilen tüm nimetlere, nefese ve huzura gönülden teşekkür etmek için okunur.',
    recommendedTarget: 33,
  },
  {
    id: 'allahuakbar',
    arabic: 'اَللّٰهُ أَكْبَرُ',
    transliteration: 'Allahu Ekber',
    meaningTr: 'Allah en büyüktür',
    meaningEn: 'Allah is the Greatest',
    noteTr: 'Dünyevi kaygıların ötesinde en büyük kudretin Allah’a ait olduğunu hatırlatır.',
    recommendedTarget: 33,
  },
  {
    id: 'astaghfirullah',
    arabic: 'أَسْتَغْفِرُ اللّٰهَ',
    transliteration: 'Estağfirullah',
    meaningTr: 'Allah’tan bağışlanma dilerim',
    meaningEn: 'I seek forgiveness from Allah',
    noteTr: 'Kalbi arındırmak, hatalardan dönmek ve içsel ferahlığa kavuşmak için okunur.',
    recommendedTarget: 100,
  },
  {
    id: 'lailaheillallah',
    arabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ',
    transliteration: 'Lâ ilâhe illallah',
    meaningTr: 'Allah’tan başka ilah yoktur',
    meaningEn: 'There is no god but Allah',
    noteTr: 'Tevhid inancının özüdür; kalbe sükûnet ve tam bir teslimiyet kazandırır.',
    recommendedTarget: 100,
  },
  {
    id: 'subhanallahivebihamdihi',
    arabic: 'سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ',
    transliteration: 'Sübhanallahi ve bihamdihi',
    meaningTr: 'Allah’ı hamd ile tesbih eder, yüceltirim',
    meaningEn: 'Glory and praise be to Allah',
    noteTr: 'Dilde hafif, anlamca derin ve huzur veren tesbihat ifadelerinden biridir.',
    recommendedTarget: 100,
  },
];

export const THEMES: Record<ThemeId, ThemeConfig> = {
  nature: {
    id: 'nature',
    name: 'Doğa',
    englishName: 'Nature',
    subtitle: 'Yeşil tepeler, rüzgârla salınan çimenler, uzakta süzülen kuşlar ve yumuşak güneş',
    soundDescription: 'Hafif rüzgâr ve uzaktan gelen kuş sesleri',
    swatch: 'linear-gradient(135deg, #bae6fd 0%, #fde68a 48%, #4ade80 100%)',
    isDarkText: true,
    accentColor: '#15803d',
    ringGradientStart: '#22c55e',
    ringGradientEnd: '#eab308',
    buttonBg: 'from-emerald-700/90 to-green-800/90',
    buttonText: 'text-white',
    beadStyle: 'olive_amber',
    beads: [
      {
        name: 'Zeytin Ağacı',
        base: '#a16207',
        highlight: '#fef08a',
        shadow: '#422006',
        glow: 'rgba(161, 98, 7, 0.55)',
        woodGrain: true,
      },
      {
        name: 'Yaprak Yeşili',
        base: '#16a34a',
        highlight: '#dcfce7',
        shadow: '#14532d',
        glow: 'rgba(22, 163, 74, 0.55)',
      },
      {
        name: 'Damla Kehribar',
        base: '#d97706',
        highlight: '#fef3c7',
        shadow: '#78350f',
        glow: 'rgba(217, 119, 6, 0.55)',
        woodGrain: true,
      },
    ],
  },
  rainy: {
    id: 'rainy',
    name: 'Yağmurlu Hava',
    englishName: 'Rainy',
    subtitle: 'İnce yağmur çisentisi, süzülen su damlaları ve bulut arasından yumuşak ışık',
    soundDescription: 'Yumuşak yağmur ve damla sesleri',
    swatch: 'linear-gradient(135deg, #475569 0%, #818cf8 52%, #6ee7b7 100%)',
    isDarkText: false,
    accentColor: '#93c5fd',
    ringGradientStart: '#93c5fd',
    ringGradientEnd: '#6ee7b7',
    buttonBg: 'from-slate-700/90 to-teal-900/90',
    buttonText: 'text-white',
    beadStyle: 'sandstone_pearl',
    beads: [
      {
        name: 'Yağmur Damlacığı',
        base: '#60a5fa',
        highlight: '#eff6ff',
        shadow: '#1e3a8a',
        glow: 'rgba(96, 165, 250, 0.6)',
      },
      {
        name: 'Sedef İnci',
        base: '#e2e8f0',
        highlight: '#ffffff',
        shadow: '#475569',
        glow: 'rgba(226, 232, 240, 0.6)',
      },
      {
        name: 'Su Yeşili',
        base: '#34d399',
        highlight: '#d1fae5',
        shadow: '#064e3b',
        glow: 'rgba(52, 211, 153, 0.55)',
      },
    ],
  },
  night: {
    id: 'night',
    name: 'Gece Ambiyansı',
    englishName: 'Night',
    subtitle: 'Derin lacivert gökyüzü, gümüş ay ışığı, sakin yıldızlar ve ateş böcekleri',
    soundDescription: 'Hafif gece böcekleri ve sakin doğa sesleri',
    swatch: 'linear-gradient(135deg, #0f172a 0%, #312e81 55%, #a855f7 100%)',
    isDarkText: false,
    accentColor: '#c084fc',
    ringGradientStart: '#c084fc',
    ringGradientEnd: '#818cf8',
    buttonBg: 'from-indigo-900/90 to-slate-900/90',
    buttonText: 'text-white',
    beadStyle: 'cosmic_galaxy',
    beads: [
      {
        name: 'Gece Safiri',
        base: '#6366f1',
        highlight: '#e0e7ff',
        shadow: '#1e1b4b',
        glow: 'rgba(99, 102, 241, 0.65)',
        starry: true,
      },
      {
        name: 'Gümüş Ay',
        base: '#cbd5e1',
        highlight: '#ffffff',
        shadow: '#334155',
        glow: 'rgba(203, 213, 225, 0.65)',
      },
      {
        name: 'Mor Kehribar',
        base: '#9333ea',
        highlight: '#f3e8ff',
        shadow: '#3b0764',
        glow: 'rgba(147, 51, 234, 0.65)',
        starry: true,
      },
    ],
  },
  sunrise: {
    id: 'sunrise',
    name: 'Gün Doğumu',
    englishName: 'Sunrise',
    subtitle: 'Ufuktan yavaşça yükselen güneş, şeftali-altın gökyüzü ve uyanan çiçekler',
    soundDescription: 'Hafif esinti ve uzaktan duyulan kuş sesleri',
    swatch: 'linear-gradient(135deg, #93c5fd 0%, #fda4af 50%, #fde047 100%)',
    isDarkText: true,
    accentColor: '#d97706',
    ringGradientStart: '#f59e0b',
    ringGradientEnd: '#fb7185',
    buttonBg: 'from-amber-700/90 to-rose-800/90',
    buttonText: 'text-white',
    beadStyle: 'warm_blossom',
    beads: [
      {
        name: 'Seher Kehribarı',
        base: '#f59e0b',
        highlight: '#fffbeb',
        shadow: '#78350f',
        glow: 'rgba(245, 158, 11, 0.6)',
        woodGrain: true,
      },
      {
        name: 'Şafak Mercanı',
        base: '#fb7185',
        highlight: '#ffe4e6',
        shadow: '#881337',
        glow: 'rgba(251, 113, 133, 0.55)',
      },
      {
        name: 'Altın İnci',
        base: '#fcd34d',
        highlight: '#fef9c3',
        shadow: '#92400e',
        glow: 'rgba(252, 211, 77, 0.6)',
      },
    ],
  },
  sunset: {
    id: 'sunset',
    name: 'Gün Batımı',
    englishName: 'Sunset',
    subtitle: 'Tepelerin ardında alçalan güneş, turuncu-mor ufuk ve sakin su yansımaları',
    soundDescription: 'Yumuşak rüzgâr ve dingin su sesi',
    swatch: 'linear-gradient(135deg, #311042 0%, #be185d 52%, #fb923c 100%)',
    isDarkText: false,
    accentColor: '#fdba74',
    ringGradientStart: '#fde047',
    ringGradientEnd: '#fb7185',
    buttonBg: 'from-rose-700/90 to-purple-900/90',
    buttonText: 'text-white',
    beadStyle: 'ruby_faceted',
    beads: [
      {
        name: 'Yakut Kırmızısı',
        base: '#e11d48',
        highlight: '#fda4af',
        shadow: '#4c0519',
        glow: 'rgba(244, 63, 94, 0.65)',
        faceted: true,
      },
      {
        name: 'Akşam Kehribarı',
        base: '#f97316',
        highlight: '#ffedd5',
        shadow: '#7c2d12',
        glow: 'rgba(249, 115, 22, 0.65)',
      },
      {
        name: 'Alacakaranlık Moru',
        base: '#a855f7',
        highlight: '#f3e8ff',
        shadow: '#4c1d95',
        glow: 'rgba(168, 85, 247, 0.6)',
        faceted: true,
      },
    ],
  },
  moonlit_nature: {
    id: 'moonlit_nature',
    name: 'Ay Işığında Doğa',
    englishName: 'Moonlit Nature',
    subtitle: 'Ay ışığıyla aydınlanan sakin göl, suda gümüş dalgalanmalar ve kıyı çiçekleri',
    soundDescription: 'Hafif su dalgası ve gece doğası',
    swatch: 'linear-gradient(135deg, #0f172a 0%, #115e59 55%, #99f6e4 100%)',
    isDarkText: false,
    accentColor: '#5eead4',
    ringGradientStart: '#99f6e4',
    ringGradientEnd: '#38bdf8',
    buttonBg: 'from-teal-800/90 to-slate-900/90',
    buttonText: 'text-white',
    beadStyle: 'emerald_amber',
    beads: [
      {
        name: 'Zümrüt Yeşili',
        base: '#10b981',
        highlight: '#d1fae5',
        shadow: '#064e3b',
        glow: 'rgba(16, 185, 129, 0.65)',
      },
      {
        name: 'Ay İncisi',
        base: '#e2e8f0',
        highlight: '#ffffff',
        shadow: '#475569',
        glow: 'rgba(226, 232, 240, 0.65)',
      },
      {
        name: 'Göl Turkuazı',
        base: '#14b8a6',
        highlight: '#ccfbf1',
        shadow: '#134e4a',
        glow: 'rgba(20, 184, 166, 0.6)',
      },
    ],
  },
  peaceful_garden: {
    id: 'peaceful_garden',
    name: 'Huzurlu Bahçe',
    englishName: 'Peaceful Garden',
    subtitle: 'Renkli çiçekler, uçuşan kelebekler, yumuşak gün ışığı ve ince ışık parçacıkları',
    soundDescription: 'Hafif rüzgâr ve uzaktan gelen kuş sesleri',
    swatch: 'linear-gradient(135deg, #bae6fd 0%, #fbcfe8 50%, #86efac 100%)',
    isDarkText: true,
    accentColor: '#db2777',
    ringGradientStart: '#f472b6',
    ringGradientEnd: '#34d399',
    buttonBg: 'from-emerald-600/90 to-teal-700/90',
    buttonText: 'text-white',
    beadStyle: 'pastel_pearls',
    beads: [
      {
        name: 'Turkuaz Yeşil',
        base: '#5eead4',
        highlight: '#ccfbf1',
        shadow: '#0f766e',
        glow: 'rgba(94, 234, 212, 0.55)',
      },
      {
        name: 'Gül Pembesi',
        base: '#f472b6',
        highlight: '#fce7f3',
        shadow: '#9d174d',
        glow: 'rgba(244, 114, 182, 0.55)',
      },
      {
        name: 'Altın Kehribar',
        base: '#fcd34d',
        highlight: '#fef9c3',
        shadow: '#b45309',
        glow: 'rgba(252, 211, 77, 0.55)',
      },
      {
        name: 'Lavanta Moru',
        base: '#c084fc',
        highlight: '#f3e8ff',
        shadow: '#6b21a8',
        glow: 'rgba(192, 132, 252, 0.55)',
      },
    ],
  },
};

export const THEME_ORDER: ThemeId[] = [
  'nature',
  'rainy',
  'night',
  'sunrise',
  'sunset',
  'moonlit_nature',
  'peaceful_garden',
];

export const PRESET_TARGETS = [33, 99, 100];
