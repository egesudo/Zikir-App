import React from 'react';
import { Settings, HeartHandshake } from 'lucide-react';
import { DhikrItem, ThemeConfig } from '../data/dhikrs';
import { TasbihBeads } from './TasbihBeads';

interface HomeScreenProps {
  theme: ThemeConfig;
  currentDhikr: DhikrItem;
  currentCount: number;
  targetCount: number;
  reducedMotion: boolean;
  onOpenDhikr: () => void;
  onOpenSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  theme,
  currentDhikr,
  currentCount,
  targetCount,
  reducedMotion,
  onOpenDhikr,
  onOpenSettings,
}) => {
  const isDarkText = theme.isDarkText;

  return (
    <main className="relative z-10 min-h-dvh flex flex-col justify-between px-6 pt-10 pb-8 max-w-xl mx-auto">
      {/* Üst Karşılama ve Manevi Başlık Alanı */}
      <header className="text-center pt-4">
        <p
          dir="rtl"
          className={`font-arabic text-3xl sm:text-4xl mb-3 transition-colors ${
            isDarkText
              ? 'text-[#231B14] drop-shadow-[0_1px_6px_rgba(255,255,255,0.8)]'
              : 'text-[#FAF5EC] drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]'
          }`}
        >
          بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ
        </p>

        {/* Zarif Ayırıcı Çizgi */}
        <div className="flex items-center justify-center gap-3 my-3 opacity-85">
          <span
            className="h-px w-16"
            style={{
              backgroundColor: isDarkText
                ? 'rgba(44, 34, 26, 0.35)'
                : 'rgba(250, 245, 236, 0.5)',
            }}
          />
          <span
            className="w-2 h-2 rotate-45"
            style={{ backgroundColor: theme.accentColor }}
          />
          <span
            className="h-px w-16"
            style={{
              backgroundColor: isDarkText
                ? 'rgba(44, 34, 26, 0.35)'
                : 'rgba(250, 245, 236, 0.5)',
            }}
          />
        </div>

        <h1
          className={`font-display text-4xl sm:text-5xl font-semibold tracking-tight text-balance ${
            isDarkText
              ? 'text-[#231B14] drop-shadow-[0_1px_8px_rgba(255,255,255,0.85)]'
              : 'text-[#FAF5EC] drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]'
          }`}
        >
          Allah’a Adım Adım
        </h1>

        <p
          className={`mt-3 text-sm sm:text-base max-w-sm mx-auto leading-relaxed ${
            isDarkText
              ? 'text-[#3D3126] font-medium drop-shadow-[0_1px_6px_rgba(255,255,255,0.75)]'
              : 'text-[#F3ECE0] drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)]'
          }`}
        >
          Kalbinizi dinlendiren, her nefeste huzura ve zikre eşlik eden sade manevi alanınız.
        </p>
      </header>

      {/* Orta Görsel Tesbih Önizlemesi */}
      <section className="my-auto py-2 flex flex-col items-center">
        <TasbihBeads
          currentCount={currentCount}
          theme={theme}
          reducedMotion={reducedMotion}
          onBeadTap={onOpenDhikr}
        />

        {/* Yarım Kalan Oturum Varsa Sıcak Krem Bilgilendirici Satır */}
        {currentCount > 0 && currentCount < targetCount && (
          <div className="mt-2 px-4 py-1.5 rounded-full bg-[#F7F1E5]/90 border border-[#DCCEB6] shadow-sm backdrop-blur-md">
            <p className="text-center text-xs font-semibold text-[#3A2D22] tabular-nums">
              Devam eden oturum: {currentDhikr.transliteration} · {currentCount} / {targetCount}
            </p>
          </div>
        )}
      </section>

      {/* Alt Başparmak Ergonomili İki Temel Eylem Butonu (Sıcak Krem ve Doğal Yeşil Uyumlu) */}
      <footer className="w-full space-y-3.5 pt-2">
        {/* 1. Temel Eylem: Allah'a Yaklaş */}
        <button
          type="button"
          onClick={onOpenDhikr}
          className="w-full min-h-[60px] px-6 py-4 rounded-3xl bg-gradient-to-r from-[#386B4D] via-[#2F5D41] to-[#264D36] hover:brightness-105 text-[#FAF5EC] border border-[#E6DAC3]/40 shadow-[0_12px_28px_rgba(24,42,30,0.32)] flex items-center justify-center gap-3 active:scale-[0.98] transition-all cursor-pointer"
        >
          <HeartHandshake className="w-5 h-5 text-[#F4D086] shrink-0" />
          <span className="text-lg font-semibold tracking-wide whitespace-nowrap">
            Allah’a Yaklaş
          </span>
        </button>

        {/* 2. Temel Eylem: Ayarlar */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full min-h-[54px] px-6 py-3.5 rounded-3xl bg-[#F7F1E5]/92 hover:bg-[#F7F1E5] text-[#2C221A] border border-[#DCCEB6] backdrop-blur-md shadow-sm flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4 shrink-0 text-[#8C6528]" />
          <span className="text-base font-semibold whitespace-nowrap">Ayarlar</span>
        </button>
      </footer>
    </main>
  );
};
