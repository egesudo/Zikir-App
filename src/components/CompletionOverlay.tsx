import React from 'react';
import { RotateCcw, ArrowRight, Home } from 'lucide-react';
import { DhikrItem } from '../data/dhikrs';

interface CompletionOverlayProps {
  isOpen: boolean;
  currentDhikr: DhikrItem;
  nextDhikr: DhikrItem;
  targetCount: number;
  onRestartSame: () => void;
  onStartNextDhikr: () => void;
  onGoHome: () => void;
}

export const CompletionOverlay: React.FC<CompletionOverlayProps> = ({
  isOpen,
  currentDhikr,
  nextDhikr,
  targetCount,
  onRestartSame,
  onStartNextDhikr,
  onGoHome,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#231B14]/50 backdrop-blur-md p-4 transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-title"
    >
      {/* Sıcak Krem ve Bej Tamamlanma Kartı */}
      <div className="w-full max-w-md rounded-3xl bg-[#F6F0E4] border border-[#D8C8B0] p-7 text-center text-[#2C221A] shadow-[0_22px_50px_rgba(35,25,15,0.28)] relative overflow-hidden">
        {/* Yumuşak Kehribar Işık Halesi */}
        <div
          className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-35 blur-2xl"
          style={{
            background: 'radial-gradient(circle, #E5B869 0%, #D99B3C 55%, transparent 100%)',
          }}
        />

        <div className="relative z-10">
          {/* Arapça İfade */}
          <p dir="rtl" className="font-arabic text-4xl text-[#9E641A] font-bold mb-2">
            {currentDhikr.arabic}
          </p>

          <h2
            id="completion-title"
            className="font-display text-3xl font-semibold tracking-wide text-[#2B2118]"
          >
            Allah Kabul Etsin
          </h2>

          <p className="text-sm text-[#5C4D3F] mt-2 leading-relaxed">
            <span className="font-semibold text-[#2B2118]">{currentDhikr.transliteration}</span>{' '}
            zikrini{' '}
            <span className="font-bold text-[#9E641A] tabular-nums">{targetCount}</span> defa
            huzurla tamamladınız. Kalbinize ferahlık ve sükûnet olsun.
          </p>

          <div className="my-6 h-px w-full bg-[#DFD2BC]" />

          <div className="space-y-3">
            {/* 1. Sıradaki Zikre Geç */}
            <button
              type="button"
              onClick={onStartNextDhikr}
              className="w-full min-h-[52px] px-5 py-3 rounded-2xl bg-gradient-to-r from-[#386B4D] via-[#326145] to-[#295239] text-[#FAF5EC] font-semibold text-sm flex items-center justify-center gap-2.5 shadow-md hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>Sıradaki Zikre Geç: {nextDhikr.transliteration}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>

            {/* 2. Aynı Zikirle Yeni Oturum */}
            <button
              type="button"
              onClick={onRestartSame}
              className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-[#EDE4D3] hover:bg-[#E4D8C2] border border-[#DCCEB6] text-[#2B2118] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 shrink-0 text-[#9E641A]" />
              <span>Yeni Oturum Başlat ({currentDhikr.transliteration})</span>
            </button>

            {/* 3. Ana Ekrana Dön */}
            <button
              type="button"
              onClick={onGoHome}
              className="w-full min-h-[46px] px-5 py-2.5 rounded-2xl text-[#6E5D4F] hover:text-[#2B2118] hover:bg-[#EDE4D3]/60 text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4 shrink-0" />
              <span>Ana Ekrana Dön</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
