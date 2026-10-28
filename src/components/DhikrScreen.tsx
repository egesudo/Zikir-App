import React, { useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  SlidersHorizontal,
  Palette,
  Wind,
  Waves,
  Music,
} from 'lucide-react';
import { DhikrItem, ThemeConfig } from '../data/dhikrs';
import { AmbientSoundMode } from '../utils/storage';
import { resolveAmbientProfile } from '../utils/sound';
import { TasbihBeads } from './TasbihBeads';
import { DhikrProgressCard } from './DhikrProgressCard';

interface DhikrScreenProps {
  dhikr: DhikrItem;
  theme: ThemeConfig;
  currentCount: number;
  targetCount: number;
  soundEnabled: boolean;
  ambientEnabled: boolean;
  ambientMode: AmbientSoundMode;
  reducedMotion: boolean;
  onIncrement: () => void;
  onReset: () => void;
  onToggleSound: () => void;
  onSelectAmbient: (enabled: boolean, mode?: AmbientSoundMode) => void;
  onCycleTheme: () => void;
  onOpenGoalModal: () => void;
  onBackHome: () => void;
}

const SOUND_TYPE_OPTIONS: {
  id: 'river' | 'wind' | 'ney';
  label: string;
  Icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'river', label: 'Huzurlu Şadırvan', Icon: Waves },
  { id: 'wind', label: 'Esintili Vadi', Icon: Wind },
  { id: 'ney', label: 'Hafif Ney', Icon: Music },
];

export const DhikrScreen: React.FC<DhikrScreenProps> = ({
  dhikr,
  theme,
  currentCount,
  targetCount,
  soundEnabled,
  ambientEnabled,
  ambientMode,
  reducedMotion,
  onIncrement,
  onReset,
  onToggleSound,
  onSelectAmbient,
  onCycleTheme,
  onOpenGoalModal,
  onBackHome,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [showSoundPicker, setShowSoundPicker] = useState(false);

  const isDarkText = theme.isDarkText;
  const effectiveProfile = resolveAmbientProfile(ambientMode, theme.id);

  const activeSoundLabel = !ambientEnabled
    ? 'Sessiz'
    : effectiveProfile === 'river'
    ? 'Huzurlu Şadırvan'
    : effectiveProfile === 'wind'
    ? 'Esintili Vadi'
    : 'Hafif Ney';

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
    <main className="relative z-10 min-h-dvh flex flex-col justify-between px-5 pt-4 pb-6 max-w-xl mx-auto">
      {/* Üst Gezinme ve Kontrol Çubuğu */}
      <div className="space-y-2">
        <header className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBackHome}
            aria-label="Ana ekrana dön"
            className="min-h-[44px] px-3.5 py-2 rounded-2xl bg-[#F7F1E5]/90 hover:bg-[#F7F1E5] text-[#2C221A] border border-[#DCCEB6] shadow-sm backdrop-blur-md flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 shrink-0 text-[#6E5D4F]" />
            <span className="whitespace-nowrap">Geri</span>
          </button>

          <div className="flex items-center gap-1.5">
            {/* Zikir ve Hedef Seçici Açma Butonu */}
            <button
              type="button"
              onClick={onOpenGoalModal}
              className="min-h-[44px] px-3 py-2 rounded-2xl bg-[#F7F1E5]/90 hover:bg-[#F7F1E5] text-[#2C221A] border border-[#DCCEB6] shadow-sm backdrop-blur-md flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0 text-[#B87824]" />
              <span className="whitespace-nowrap">Zikir / Hedef</span>
            </button>

            {/* Doğa Sesi Türü Seçici Tetikleyici Buton */}
            <button
              type="button"
              onClick={() => setShowSoundPicker((prev) => !prev)}
              aria-expanded={showSoundPicker}
              aria-label="Doğa Sesi Türü seçicisini aç veya kapat"
              className={`min-h-[44px] px-3 py-2 rounded-2xl border shadow-sm backdrop-blur-md flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                showSoundPicker || ambientEnabled
                  ? 'bg-[#E5D7C0]/95 text-[#2B2118] border-[#B87824]'
                  : 'bg-[#F7F1E5]/90 hover:bg-[#F7F1E5] text-[#6E5D4F] border-[#DCCEB6]'
              }`}
            >
              <Wind
                className={`w-3.5 h-3.5 shrink-0 ${
                  ambientEnabled ? 'text-[#386B4D]' : 'text-[#8C7A6B]'
                }`}
              />
              <span className="whitespace-nowrap hidden xs:inline sm:inline">
                {activeSoundLabel}
              </span>
            </button>

            {/* Hızlı Manzara Değiştirme Kısayolu */}
            <button
              type="button"
              onClick={onCycleTheme}
              title={`Manzara: ${theme.name}`}
              aria-label={`Manzarayı değiştir (Mevcut: ${theme.name})`}
              className="min-w-[44px] min-h-[44px] px-2.5 rounded-2xl bg-[#F7F1E5]/90 hover:bg-[#F7F1E5] text-[#2C221A] border border-[#DCCEB6] shadow-sm backdrop-blur-md flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Palette className="w-4 h-4 text-[#B87824] shrink-0" />
            </button>

            {/* Tesbih Sesi Aç / Kapat Kısayolu */}
            <button
              type="button"
              onClick={onToggleSound}
              title={soundEnabled ? 'Tesbih sesi açık' : 'Tesbih sesi kapalı'}
              aria-label={soundEnabled ? 'Tesbih sesini kapat' : 'Tesbih sesini aç'}
              className="min-w-[44px] min-h-[44px] rounded-2xl bg-[#F7F1E5]/90 hover:bg-[#F7F1E5] text-[#2C221A] border border-[#DCCEB6] shadow-sm backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#3E7B58]" />
              ) : (
                <VolumeX className="w-4 h-4 text-[#8C7A6B]" />
              )}
            </button>
          </div>
        </header>

        {/* Doğa Sesi Türü Seçici Çubuğu (Huzurlu Şadırvan | Esintili Vadi | Hafif Ney) */}
        <div
          className="rounded-2xl bg-[#F6F0E4]/92 backdrop-blur-md border border-[#DCCEB6] px-3 py-2 shadow-sm transition-all"
          role="region"
          aria-label="Doğa Sesi Türü Seçici"
        >
          <div className="flex items-center justify-between gap-2 mb-1.5 px-1">
            <span className="text-[11px] font-semibold text-[#5C4D3F]">
              Doğa Sesi Türü
            </span>
            <button
              type="button"
              onClick={() => onSelectAmbient(!ambientEnabled)}
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                ambientEnabled
                  ? 'text-[#386B4D] bg-[#E2D4BC]/70 hover:bg-[#E2D4BC]'
                  : 'text-[#8C7A6B] bg-[#EDE4D3] hover:bg-[#E5D8C3]'
              }`}
            >
              {ambientEnabled ? 'Ambiyans Açık' : 'Sessiz Mod'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {SOUND_TYPE_OPTIONS.map(({ id, label, Icon }) => {
              const isSelected = ambientEnabled && effectiveProfile === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectAmbient(true, id)}
                  className={`min-h-[40px] px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#386B4D] text-[#FAF5EC] border-[#295239] shadow-xs'
                      : 'bg-[#EDE4D3]/90 hover:bg-[#E4D7C0] text-[#3A2D22] border-[#DCCEB6]'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-[#F4D086]' : 'text-[#8C6528]'
                    }`}
                  />
                  <span className="truncate whitespace-nowrap">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Üst-Orta Zikir İfadesi Alanı */}
      <section className="text-center mt-1 sm:mt-2 px-2">
        {/* Arapça Hat */}
        <h1
          dir="rtl"
          className={`font-arabic text-5xl sm:text-6xl font-bold tracking-normal select-text ${
            isDarkText
              ? 'text-[#231B14] drop-shadow-[0_2px_10px_rgba(255,255,255,0.85)]'
              : 'text-[#FAF5EC] drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)]'
          }`}
        >
          {dhikr.arabic}
        </h1>

        {/* Zarif Elmas Ayırıcı Çizgi */}
        <div className="flex items-center justify-center gap-2.5 my-2">
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
      <footer className="w-full pt-2 space-y-2">
        <button
          type="button"
          onClick={onIncrement}
          className="w-full min-h-[68px] rounded-3xl bg-gradient-to-r from-[#386B4D] via-[#2F5D41] to-[#264D36] hover:brightness-105 text-[#FAF5EC] border border-[#E6DAC3]/40 shadow-[0_12px_28px_rgba(24,42,30,0.35)] flex flex-col items-center justify-center active:scale-[0.98] transition-all cursor-pointer"
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
