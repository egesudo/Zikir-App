import React, { useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { DhikrItem, ThemeConfig } from '../data/dhikrs';
import { TasbihBeads } from './TasbihBeads';
import { DhikrProgressCard } from './DhikrProgressCard';

interface DhikrScreenProps {
  dhikr: DhikrItem;
  theme: ThemeConfig;
  currentCount: number;
  targetCount: number;
  soundEnabled: boolean;
  reducedMotion: boolean;
  onIncrement: () => void;
  onReset: () => void;
  onToggleSound: () => void;
  onOpenGoalModal: () => void;
  onBackHome: () => void;
}

export const DhikrScreen: React.FC<DhikrScreenProps> = ({
  dhikr,
  theme,
  currentCount,
  targetCount,
  soundEnabled,
  reducedMotion,
  onIncrement,
  onReset,
  onToggleSound,
  onOpenGoalModal,
  onBackHome,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  const isDarkText = theme.isDarkText;

  const handleResetClick = () => {
    if (currentCount === 0) return;
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3200);
      return;
    }
    setConfirmReset(false);
    onReset();
  };

  return (
    <main className="relative z-10 min-h-dvh flex flex-col justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-6 max-w-xl mx-auto">
      {/* Üst Gezinme ve Kontrol Çubuğu (Sol: Geri, Sağ: Zikir/Hedef Seç ve Ses) */}
      <header className="w-full flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackHome}
          aria-label="Ana ekrana dön"
          className="shrink-0 min-h-[44px] px-4 py-2 rounded-2xl bg-[#F7F1E5]/92 hover:bg-[#F7F1E5] text-[#2C221A] border border-[#DCCEB6] shadow-sm backdrop-blur-md flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 shrink-0 text-[#6E5D4F]" />
          <span className="whitespace-nowrap">Geri</span>
        </button>

        <div className="ml-auto flex items-center justify-end gap-2 sm:gap-2.5 shrink-0">
          {/* Zikir ve Hedef Seçici Açma Butonu */}
          <button
            type="button"
            onClick={onOpenGoalModal}
            className="min-h-[44px] px-3.5 sm:px-4 py-2 rounded-2xl bg-[#F7F1E5]/92 hover:bg-[#F7F1E5] text-[#2C221A] border border-[#DCCEB6] shadow-sm backdrop-blur-md flex items-center gap-2 text-xs font-semibold transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 shrink-0 text-[#B87824]" />
            <span className="whitespace-nowrap">Zikir ve Hedef Seç</span>
          </button>

          {/* Ses Aç / Kapat Kısayolu */}
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Sesi kapat' : 'Sesi aç'}
            className="min-w-[44px] min-h-[44px] rounded-2xl bg-[#F7F1E5]/92 hover:bg-[#F7F1E5] text-[#2C221A] border border-[#DCCEB6] shadow-sm backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#3E7B58]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#8C7A6B]" />
            )}
          </button>
        </div>
      </header>

      {/* Üst-Orta Zikir İfadesi Alanı (Üst butonlarla ferah dikey mesafe ve harekeler için güvenli satır yüksekliği) */}
      <section className="text-center mt-8 sm:mt-11 pt-2 pb-1 px-3">
        {/* Arapça Hat */}
        <h1
          dir="rtl"
          className={`font-arabic text-4xl sm:text-6xl font-bold tracking-normal leading-[1.55] py-1 select-text ${
            isDarkText
              ? 'text-[#231B14] drop-shadow-[0_2px_10px_rgba(255,255,255,0.85)]'
              : 'text-[#FAF5EC] drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)]'
          }`}
        >
          {dhikr.arabic}
        </h1>

        {/* Zarif Elmas Ayırıcı Çizgi */}
        <div className="flex items-center justify-center gap-2.5 my-2.5">
          <span
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: theme.accentColor }}
          />
          <span
            className="h-px w-20 sm:w-24"
            style={{
              backgroundColor: isDarkText
                ? 'rgba(44, 34, 26, 0.35)'
                : 'rgba(250, 245, 236, 0.55)',
            }}
          />
          <span
            className="w-2 h-2 rotate-45"
            style={{ backgroundColor: theme.accentColor }}
          />
          <span
            className="h-px w-20 sm:w-24"
            style={{
              backgroundColor: isDarkText
                ? 'rgba(44, 34, 26, 0.35)'
                : 'rgba(250, 245, 236, 0.55)',
            }}
          />
          <span
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: theme.accentColor }}
          />
        </div>

        {/* Latin Harfleriyle Okunuşu */}
        <p
          className={`font-display text-3xl sm:text-4xl font-semibold tracking-wide ${
            isDarkText
              ? 'text-[#231B14] drop-shadow-[0_1px_8px_rgba(255,255,255,0.8)]'
              : 'text-[#FAF5EC] drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]'
          }`}
        >
          {dhikr.transliteration}
        </p>

        {/* Türkçe Anlamı */}
        <p
          className={`mt-1 text-sm sm:text-base max-w-md mx-auto leading-snug ${
            isDarkText
              ? 'text-[#3D3126] font-medium drop-shadow-[0_1px_6px_rgba(255,255,255,0.75)]'
              : 'text-[#F3ECE0] drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]'
          }`}
        >
          {dhikr.meaningTr}
        </p>
      </section>

      {/* Orta Bölüm: Kavisli Tesbih Boncukları + Yarı Saydam Dairesel Progress Ring */}
      <section className="my-auto flex flex-col items-center w-full gap-1">
        <TasbihBeads
          currentCount={currentCount}
          theme={theme}
          reducedMotion={reducedMotion}
          onBeadTap={onIncrement}
        />

        {/* Yarı Saydam, Zarif Dairesel Progress Ring Sayaç Bileşeni */}
        <DhikrProgressCard
          currentCount={currentCount}
          targetCount={targetCount}
          dhikrName={dhikr.transliteration}
          onIncrement={onIncrement}
        />
      </section>

      {/* Alt Bölüm: Başparmak Ergonomili Büyük Zikir Butonu ve Sıfırlama Koruması */}
      <footer className="w-full pt-3 space-y-2.5">
        <button
          type="button"
          onClick={onIncrement}
          className="w-full min-h-[70px] rounded-3xl bg-gradient-to-r from-[#386B4D] via-[#2F5D41] to-[#264D36] hover:brightness-105 text-[#FAF5EC] border border-[#E6DAC3]/40 shadow-[0_12px_28px_rgba(24,42,30,0.35)] flex flex-col items-center justify-center active:scale-[0.98] transition-all cursor-pointer"
        >
          <span className="text-lg font-semibold tracking-wide whitespace-nowrap">
            Zikir Çek (Dokun)
          </span>
          <span className="text-xs text-[#E5DEC9] mt-0.5">
            Her dokunuşta tesbih boncuğu kayarak ilerler
          </span>
        </button>

        {/* Yanlışlıkla Sıfırlamayı Önleyen Onaylı Sıfırlama Satırı */}
        <div className="flex items-center justify-center h-9">
          {currentCount > 0 && (
            <button
              type="button"
              onClick={handleResetClick}
              className={`min-h-[36px] px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md border transition-colors cursor-pointer ${
                confirmReset
                  ? 'bg-[#B93829] text-[#FAF5EC] border-[#E8A598]'
                  : 'bg-[#F7F1E5]/88 hover:bg-[#F7F1E5] text-[#5C4D3C] border-[#DCCEB6]'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>
                {confirmReset
                  ? 'Sayacı sıfırlamak için tekrar dokunun'
                  : 'Sayacı Sıfırla'}
              </span>
            </button>
          )}
        </div>
      </footer>
    </main>
  );
};
