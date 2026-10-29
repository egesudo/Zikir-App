/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ReflectionItem {
  id: string;
  category: 'verse' | 'hadith';
  arabic: string;
  translation: string;
  source: string;
  topic: string;
}

export const DAILY_REFLECTIONS: ReflectionItem[] = [
  {
    id: 'ref-01',
    category: 'verse',
    arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    translation: 'Bilesiniz ki, kalpler ancak Allah’ı anmakla huzur ve sükûna kavuşur.',
    source: 'Ra’d Sûresi, 28. Âyet',
    topic: 'Kalp Huzuru',
  },
  {
    id: 'ref-02',
    category: 'verse',
    arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    translation: 'Öyleyse siz beni anın ki, ben de sizi anayım. Bana şükredin, nankörlük etmeyin.',
    source: 'Bakara Sûresi, 152. Âyet',
    topic: 'Zikir & Şükür',
  },
  {
    id: 'ref-03',
    category: 'hadith',
    arabic: 'مَثَلُ الَّذِي يَذْكُرُ رَبَّهُ وَالَّذِي لا يَذْكُرُ رَبَّهُ مَثَلُ الحَيِّ وَالمَيِّتِ',
    translation: 'Rabbini zikreden kimse ile zikretmeyen kimsenin misali, diri ile ölünün misali gibidir.',
    source: 'Sahih-i Buhârî, Daavât 66',
    topic: 'Manevi Canlılık',
  },
  {
    id: 'ref-04',
    category: 'verse',
    arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اذْكُرُوا اللَّهَ ذِكْرًا كَثِيرًا',
    translation: 'Ey iman edenler! Allah’ı çokça zikredin ve O’nu sabah akşam tesbih edin.',
    source: 'Ahzâb Sûresi, 41-42. Âyetler',
    topic: 'Çokça Zikir',
  },
  {
    id: 'ref-05',
    category: 'hadith',
    arabic: 'كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    translation: 'Dile hafif, mizanda ağır, Rahmân’a sevimli iki kelime: Sübhânallâhi ve bi-hamdihî, Sübhânallâhil-azîm.',
    source: 'Sahih-i Buhârî & Müslim',
    topic: 'Mizan Ağırlığı',
  },
  {
    id: 'ref-06',
    category: 'verse',
    arabic: 'وَاقْصِدْ فِي مَشْيِكَ وَاغْضُضْ مِنْ صَوْتِكَ',
    translation: 'Yürüyüşünde mutedil ol, sesini de alçalt; vakar ve sükûneti elden bırakma.',
    source: 'Lokmân Sûresi, 19. Âyet',
    topic: 'Sükûnet & Vakar',
  },
  {
    id: 'ref-07',
    category: 'hadith',
    arabic: 'أَحَبُّ الْكَلاَمِ إِلَى اللَّهِ أَرْبَعٌ: سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلاَ إِلَهَ إِلاَّ اللَّهُ، وَاللَّهُ أَكْبَرُ',
    translation: 'Allah katında sözlerin en sevimlisi dörttür: Sübhânallah, Elhamdülillâh, Lâ ilâhe illallâh ve Allâhu ekber.',
    source: 'Sahih-i Müslim, Âdâb 12',
    topic: 'En Sevilen Kelimeler',
  },
  {
    id: 'ref-08',
    category: 'verse',
    arabic: 'وَتَوَكَّلْ عَلَى الْحَيِّ الَّذِي لَا يَمُوتُ وَسَبِّحْ بِحَمْدِهِ',
    translation: 'Ölmeyen, daima diri olan Allah’a güvenip dayan ve O’nu hamd ile tesbih et.',
    source: 'Furkân Sûresi, 58. Âyet',
    topic: 'Tevekkül',
  },
  {
    id: 'ref-09',
    category: 'hadith',
    arabic: 'سَبَقَ الْمُفَرِّدُونَ، قَالُوا: وَمَا الْمُفَرِّدُونَ يَا رَسُولَ اللَّهِ؟ قَالَ: الذَّاكِرُونَ اللَّهَ كَثِيرًا وَالذَّاكِرَاتُ',
    translation: 'Müferridûn olanlar öne geçti! Ashab sordu: Onlar kimdir ey Allah’ın Resûlü? Buyurdu: Allah’ı çokça zikreden erkekler ve kadınlardır.',
    source: 'Sahih-i Müslim, Zikr 4',
    topic: 'Manevi Öncüler',
  },
  {
    id: 'ref-10',
    category: 'verse',
    arabic: 'وَاذْكُر رَّبَّكَ فِي نَفْسِكَ تَضَرُّعًا وَخِيفَةً وَدُونَ الْجَهْرِ مِنَ الْقَوْلِ',
    translation: 'Rabbini içinden, yalvararak ve korkarak, yüksek olmayan bir sesle sabah akşam an; gafillerden olma.',
    source: 'A’râf Sûresi, 205. Âyet',
    topic: 'Huşû ile Zikir',
  },
  {
    id: 'ref-11',
    category: 'hadith',
    arabic: 'إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ فِي الأَمْرِ كُلِّهِ',
    translation: 'Şüphesiz Allah yumuşak ve şefkatlidir; her işte nezaket ve yumuşaklığı sever.',
    source: 'Sahih-i Buhârî, İstitâbe 4',
    topic: 'Nezaket & Hilm',
  },
  {
    id: 'ref-12',
    category: 'verse',
    arabic: 'وَسَبِّحْ بِحَمْدِ رَبِّكَ قَبْلَ طُلُوعِ الشَّمْسِ وَقَبْلَ غُرُوبِهَا',
    translation: 'Güneşin doğmasından önce de batmasından önce de Rabbini hamd ile tesbih et.',
    source: 'Tâhâ Sûresi, 130. Âyet',
    topic: 'Sabah Akşam Tesbih',
  },
  {
    id: 'ref-13',
    category: 'hadith',
    arabic: 'لا يَزَالُ لِسَانُكَ رَطْبًا مِنْ ذِكْرِ اللَّهِ',
    translation: 'Dilin Allah’ı zikretmekten ötürü daima ıslak ve taze kalsın.',
    source: 'Sünen-i Tirmizî, Daavât 4',
    topic: 'Daimi Zikir',
  },
  {
    id: 'ref-14',
    category: 'verse',
    arabic: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
    translation: 'Andolsun ki eğer şükrederseniz, elbette size olan nimetimi artırırım.',
    source: 'İbrâhîm Sûresi, 7. Âyet',
    topic: 'Şükür ve Bereket',
  },
  {
    id: 'ref-15',
    category: 'hadith',
    arabic: 'أَنَا عِنْدَ ظَنِّ عَبْدِي بِي، وَأَنَا مَعَهُ إِذَا ذَكَرَنِي',
    translation: 'Kulum beni nasıl düşünürse ben öyleyimdir. O beni andığı zaman ben muhakkak onunla beraberim.',
    source: 'Hadis-i Kudsî, Buhârî & Müslim',
    topic: 'İlahi Beraberlik',
  },
  {
    id: 'ref-16',
    category: 'verse',
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: 'Şüphesiz her zorlukla beraber bir kolaylık vardır.',
    source: 'İnşirâh Sûresi, 6. Âyet',
    topic: 'İnşirah & Umut',
  },
  {
    id: 'ref-17',
    category: 'hadith',
    arabic: 'مَنْ لَزِمَ الاسْتِغْفَارَ جَعَلَ اللَّهُ لَهُ مِنْ كُلِّ ضِيقٍ مَخْرَجًا وَمِنْ كُلِّ هَمٍّ فَرَجًا',
    translation: 'Kim istiğfara devam ederse, Allah ona her darlıktan bir çıkış, her kederden bir ferahlık bahşeder.',
    source: 'Sünen-i Ebû Dâvûd, Vitr 26',
    topic: 'İstiğfarın Ferahlığı',
  },
  {
    id: 'ref-18',
    category: 'verse',
    arabic: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ',
    translation: 'Nerede olursanız olun, O daima sizinle beraberdir.',
    source: 'Hadîd Sûresi, 4. Âyet',
    topic: 'Kurbiyet & Yakınlık',
  },
  {
    id: 'ref-19',
    category: 'hadith',
    arabic: 'الطَّهُورُ شَطْرُ الإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلأُ الْمِيزَانَ',
    translation: 'Temizlik imanın yarısıdır. Elhamdülillâh zikri ise mizanı doldurur.',
    source: 'Sahih-i Müslim, Tahâret 1',
    topic: 'Hamdin Fazileti',
  },
  {
    id: 'ref-20',
    category: 'verse',
    arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
    translation: 'Ve de ki: Rabbim, benim ilmimi, idrakimi ve hikmetimi artır.',
    source: 'Tâhâ Sûresi, 114. Âyet',
    topic: 'Hikmet & Dua',
  },
  {
    id: 'ref-21',
    category: 'hadith',
    arabic: 'لا حَوْلَ وَلا قُوَّةَ إِلا بِاللَّهِ، كَنْزٌ مِنْ كُنُوزِ الْجَنَّةِ',
    translation: 'Lâ havle ve lâ kuvvete illâ billâh zikri, cennet hazinelerinden paha biçilmez bir hazinedir.',
    source: 'Sahih-i Buhârî, Megâzî 38',
    topic: 'Cennet Hazinesi',
  },
  {
    id: 'ref-22',
    category: 'verse',
    arabic: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
    translation: 'Kullarım beni sana soracak olurlarsa, bilsinler ki ben şüphesiz onlara pek yakınım. Dua edenin duasına icabet ederim.',
    source: 'Bakara Sûresi, 186. Âyet',
    topic: 'Dualara İcabet',
  },
  {
    id: 'ref-23',
    category: 'hadith',
    arabic: 'مَا جَلَسَ قَوْمٌ يَذْكُرُونَ اللَّهَ إِلا حَفَّتْهُمُ الْمَلائِكَةُ، وَغَشِيَتْهُمُ الرَّحْمَةُ',
    translation: 'Bir topluluk Allah’ı zikretmek üzere bir araya gelirse, melekler onları kuşatır ve üzerlerine ilahi rahmet ile sekinet iner.',
    source: 'Sahih-i Müslim, Zikr 39',
    topic: 'Sekinet & Rahmet',
  },
  {
    id: 'ref-24',
    category: 'verse',
    arabic: 'رَبَّنَا مَا خَلَقْتَ هَذَا بَاطِلاً سُبْحَانَكَ فَقِنَا عَذَابَ النَّارِ',
    translation: 'Rabbimiz! Sen bu kainatı ve yaratılışı boşuna yaratmadın. Sen her türlü noksanlıktan münezzehsin.',
    source: 'Âl-i İmrân Sûresi, 191. Âyet',
    topic: 'Tefekkür',
  },
  {
    id: 'ref-25',
    category: 'hadith',
    arabic: 'عَجَبًا لأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ',
    translation: 'Müminin haline hayran olmamak elde değil; zira onun her hali kendisi için bir hayırdır.',
    source: 'Sahih-i Müslim, Zühd 64',
    topic: 'Rıza & Hayır',
  },
  {
    id: 'ref-26',
    category: 'verse',
    arabic: 'قُلْ بِفَضْلِ اللَّهِ وَبِرَحْمَتِهِ فَبِذَلِكَ فَلْيَفْرَحُوا',
    translation: 'De ki: Ancak Allah’ın lütfu ve rahmetiyle sevinsinler; bu, dünyada toplayıp durdukları şeylerden çok daha hayırlıdır.',
    source: 'Yûnus Sûresi, 58. Âyet',
    topic: 'İlahi Lütuf',
  },
  {
    id: 'ref-27',
    category: 'hadith',
    arabic: 'مَنْ قَالَ سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ غُرِسَتْ لَهُ نَخْلَةٌ فِي الْجَنَّةِ',
    translation: 'Kim "Sübhânallâhil-azîmi ve bi-hamdihî" derse, onun için cennette kutlu bir hurma ağacı dikilir.',
    source: 'Sünen-i Tirmizî, Daavât 60',
    topic: 'Ebedi Kazanç',
  },
  {
    id: 'ref-28',
    category: 'verse',
    arabic: 'وَالصَّابِرِينَ فِي الْبَأْسَاءِ وَالضَّرَّاءِ وَحِينَ الْبَأْسِ',
    translation: 'Zorlukta, darlıkta ve sarsıcı anlarda sabır gösterenler... İşte özü sözü doğru olanlar onlardır.',
    source: 'Bakara Sûresi, 177. Âyet',
    topic: 'Sabır & Metanet',
  },
  {
    id: 'ref-29',
    category: 'hadith',
    arabic: 'الصَّدَقَةُ تَقَعُ فِي يَدِ الرَّحْمَنِ قَبْلَ أَنْ تَقَعَ فِي يَدِ السَّائِلِ',
    translation: 'Gönülden verilen iyilik ve sadaka, muhtacın eline varmadan evvel Rahmân’ın kabul dergahına ulaşır.',
    source: 'Tirmizî, Zekât 28',
    topic: 'İhsan & Cömertlik',
  },
  {
    id: 'ref-30',
    category: 'verse',
    arabic: 'فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ إِنَّهُ كَانَ تَوَّابًا',
    translation: 'Rabbini hamd ile tesbih et ve O’ndan mağfiret dile. Şüphesiz O, tevbeleri daima kabul buyurandır.',
    source: 'Nasr Sûresi, 3. Âyet',
    topic: 'Tevbe & Hamd',
  },
];

/**
 * Günün tarihine göre deterministik olarak bir tefekkür öğesi döner.
 * offsetDays parametresi ile önceki veya sonraki günlerin tefekkürü de okunabilir.
 */
export function getDailyReflection(offsetDays = 0): { item: ReflectionItem; index: number; dayString: string } {
  const now = new Date();
  if (offsetDays !== 0) {
    now.setDate(now.getDate() + offsetDays);
  }
  
  // UTC gün hesabı ile her gün saat 00:00'da tutarlı geçiş
  const epochDay = Math.floor(now.getTime() / 86400000);
  const total = DAILY_REFLECTIONS.length;
  // Negatif index olmamasını garantile
  const index = ((epochDay % total) + total) % total;
  
  const dayString = now.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return {
    item: DAILY_REFLECTIONS[index],
    index,
    dayString,
  };
}

export function getReflectionById(id: string): ReflectionItem | undefined {
  return DAILY_REFLECTIONS.find((r) => r.id === id);
}
