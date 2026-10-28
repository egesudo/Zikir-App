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
  | 'misty_valley'
  | 'mosque_courtyard'
  | 'lavender_hills'
  | 'meadow'
  | 'sunset'
  | 'cosmos'
  | 'emerald_lake'
  | 'painted_valley';

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
  subtitle: string;
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
  imageUrl?: string;
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
  misty_valley: {
    id: 'misty_valley',
    name: 'Seher Vakti Sisli Vadi',
    subtitle: 'Gün doğumunda süzülen altın ışık huzmeleri, sisli tepeler ve kehribar tesbih',
    isDarkText: true,
    accentColor: '#d97706',
    ringGradientStart: '#f59e0b',
    ringGradientEnd: '#059669',
    buttonBg: 'from-amber-700/90 to-emerald-800/90',
    buttonText: 'text-white',
    beadStyle: 'olive_amber',
    beads: [
      {
        name: 'Damla Kehribar',
        base: '#d97706',
        highlight: '#fef3c7',
        shadow: '#78350f',
        glow: 'rgba(245, 158, 11, 0.6)',
        woodGrain: true,
      },
      {
        name: 'Yeşim Taşı',
        base: '#10b981',
        highlight: '#d1fae5',
        shadow: '#064e3b',
        glow: 'rgba(16, 185, 129, 0.55)',
      },
      {
        name: 'Bal Kehribar',
        base: '#f59e0b',
        highlight: '#fffbeb',
        shadow: '#92400e',
        glow: 'rgba(251, 191, 36, 0.6)',
        woodGrain: true,
      },
    ],
  },
  mosque_courtyard: {
    id: 'mosque_courtyard',
    name: 'Huzurlu Cami Avlusu ve Zeytinler',
    subtitle: 'Taş kemerler, şadırvan su halesi, zeytin dalları ve doğal ahşap/inci tesbih',
    isDarkText: true,
    accentColor: '#b45309',
    ringGradientStart: '#d97706',
    ringGradientEnd: '#4d7c0f',
    buttonBg: 'from-stone-700/90 to-emerald-900/90',
    buttonText: 'text-white',
    beadStyle: 'sandstone_pearl',
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
        name: 'Sedef İnci',
        base: '#f5f5f4',
        highlight: '#ffffff',
        shadow: '#78716c',
        glow: 'rgba(245, 245, 244, 0.65)',
      },
      {
        name: 'Yaprak Yeşili',
        base: '#65a30d',
        highlight: '#ecfccb',
        shadow: '#365314',
        glow: 'rgba(101, 163, 13, 0.55)',
      },
    ],
  },
  lavender_hills: {
    id: 'lavender_hills',
    name: 'Akşamüstü Lavanta Tepeleri',
    subtitle: 'Sıcak gün batımı ışığında salınan lavanta tarlaları ve ametist boncuklar',
    isDarkText: false,
    accentColor: '#f59e0b',
    ringGradientStart: '#fbbf24',
    ringGradientEnd: '#a855f7',
    buttonBg: 'from-purple-800/90 to-amber-800/90',
    buttonText: 'text-white',
    beadStyle: 'lavender_amethyst',
    beads: [
      {
        name: 'Ametist Moru',
        base: '#a855f7',
        highlight: '#f3e8ff',
        shadow: '#4c1d95',
        glow: 'rgba(168, 85, 247, 0.65)',
        faceted: true,
      },
      {
        name: 'Gün Batımı Kehribarı',
        base: '#f59e0b',
        highlight: '#fef3c7',
        shadow: '#78350f',
        glow: 'rgba(245, 158, 11, 0.65)',
      },
      {
        name: 'Lavanta Çiçeği',
        base: '#c084fc',
        highlight: '#faf5ff',
        shadow: '#581c87',
        glow: 'rgba(192, 132, 252, 0.6)',
      },
    ],
  },
  meadow: {
    id: 'meadow',
    name: 'Bahar Çayırı ve Kelebekler',
    subtitle: 'Güneş ışığı, çiçekli tepeler ve pastel inci boncuklar',
    isDarkText: true,
    accentColor: '#ec4899',
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
        name: 'Lavanta Moru',
        base: '#c084fc',
        highlight: '#f3e8ff',
        shadow: '#6b21a8',
        glow: 'rgba(192, 132, 252, 0.55)',
      },
      {
        name: 'Altın Kehribar',
        base: '#fcd34d',
        highlight: '#fef9c3',
        shadow: '#b45309',
        glow: 'rgba(252, 211, 77, 0.55)',
      },
      {
        name: 'Gökyüzü Mavisi',
        base: '#7dd3fc',
        highlight: '#e0f2fe',
        shadow: '#0369a1',
        glow: 'rgba(125, 211, 252, 0.55)',
      },
      {
        name: 'Gül Pembesi',
        base: '#f472b6',
        highlight: '#fce7f3',
        shadow: '#9d174d',
        glow: 'rgba(244, 114, 182, 0.55)',
      },
    ],
  },
  sunset: {
    id: 'sunset',
    name: 'Şafak ve Dağ Esintisi',
    subtitle: 'Gün batımı huzmeleri, mor dağlar ve yakut boncuklar',
    isDarkText: false,
    accentColor: '#fb7185',
    ringGradientStart: '#fde047',
    ringGradientEnd: '#f43f5e',
    buttonBg: 'from-rose-500/85 to-purple-800/90',
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
        name: 'Derin Lal',
        base: '#be123c',
        highlight: '#fecdd3',
        shadow: '#3b0718',
        glow: 'rgba(225, 29, 72, 0.65)',
        faceted: true,
      },
    ],
  },
  cosmos: {
    id: 'cosmos',
    name: 'Gece ve Kozmik Semâ',
    subtitle: 'Yıldızlı derin uzay, gezegenler ve galaksi boncukları',
    isDarkText: false,
    accentColor: '#c084fc',
    ringGradientStart: '#e879f9',
    ringGradientEnd: '#818cf8',
    buttonBg: 'from-purple-600/85 to-indigo-900/90',
    buttonText: 'text-white',
    beadStyle: 'cosmic_galaxy',
    beads: [
      {
        name: 'Galaksi Moru',
        base: '#9333ea',
        highlight: '#f5d0fe',
        shadow: '#2e1065',
        glow: 'rgba(192, 132, 252, 0.7)',
        starry: true,
      },
      {
        name: 'Nebula İndigo',
        base: '#7e22ce',
        highlight: '#e9d5ff',
        shadow: '#1e1b4b',
        glow: 'rgba(168, 85, 247, 0.7)',
        starry: true,
      },
    ],
  },
  emerald_lake: {
    id: 'emerald_lake',
    name: 'Zümrüt Göl ve Yeşil Tepeler',
    subtitle: 'Suyun üzerindeki güneş parıltısı ve zümrüt tesbih',
    isDarkText: false,
    accentColor: '#6ee7b7',
    ringGradientStart: '#a7f3d0',
    ringGradientEnd: '#34d399',
    buttonBg: 'from-emerald-700/90 to-teal-900/90',
    buttonText: 'text-white',
    beadStyle: 'emerald_amber',
    imageUrl: '/assets/aistudio/WhatsApp_Image_2026-10-29_at_00.14.04__1__c124855f.jpeg',
    beads: [
      {
        name: 'Zümrüt Yeşili',
        base: '#10b981',
        highlight: '#d1fae5',
        shadow: '#064e3b',
        glow: 'rgba(52, 211, 153, 0.65)',
      },
      {
        name: 'İnci Beyazı',
        base: '#f8fafc',
        highlight: '#ffffff',
        shadow: '#64748b',
        glow: 'rgba(248, 250, 252, 0.6)',
      },
      {
        name: 'Çam Yeşili',
        base: '#059669',
        highlight: '#a7f3d0',
        shadow: '#022c22',
        glow: 'rgba(16, 185, 129, 0.65)',
      },
    ],
  },
  painted_valley: {
    id: 'painted_valley',
    name: 'Çiçekli Patika Tablosu',
    subtitle: 'Yağlıboya kır çiçekleri, huzurlu vadi yolu ve sıcak kehribar',
    isDarkText: false,
    accentColor: '#fcd34d',
    ringGradientStart: '#fde68a',
    ringGradientEnd: '#fb923c',
    buttonBg: 'from-amber-700/90 to-stone-800/90',
    buttonText: 'text-white',
    beadStyle: 'warm_blossom',
    imageUrl: '/assets/aistudio/WhatsApp_Image_2026-10-29_at_00.14.04_77c8b6c8.jpeg',
    beads: [
      {
        name: 'Bal Kehribar',
        base: '#f59e0b',
        highlight: '#fef3c7',
        shadow: '#78350f',
        glow: 'rgba(251, 191, 36, 0.65)',
      },
      {
        name: 'Mercan Çiçeği',
        base: '#fb7185',
        highlight: '#ffe4e6',
        shadow: '#881337',
        glow: 'rgba(251, 113, 133, 0.6)',
      },
      {
        name: 'Zeytin Yeşili',
        base: '#84cc16',
        highlight: '#ecfccb',
        shadow: '#365314',
        glow: 'rgba(163, 230, 53, 0.6)',
      },
    ],
  },
};

export const THEME_ORDER: ThemeId[] = [
  'misty_valley',
  'mosque_courtyard',
  'lavender_hills',
  'meadow',
  'emerald_lake',
  'painted_valley',
  'sunset',
  'cosmos',
];

export const PRESET_TARGETS = [33, 99, 100];
