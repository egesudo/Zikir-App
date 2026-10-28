import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { DHIKR_LIST, PRESET_TARGETS } from '../data/dhikrs';

interface GoalModalProps {
  isOpen: boolean;
  currentDhikrId: string;
  currentTarget: number;
  onClose: () => void;
  onStartSession: (dhikrId: string, target: number) => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  currentDhikrId,
  currentTarget,
  onClose,
  onStartSession,
}) => {
  const [selectedDhikrId, setSelectedDhikrId] = useState<string>(currentDhikrId);
  const [selectedTarget, setSelectedTarget] = useState<number>(currentTarget);
  const [customTargetInput, setCustomTargetInput] = useState<string>(
    PRESET_TARGETS.includes(currentTarget) ? '' : String(currentTarget)
  );
  const [isCustomMode, setIsCustomMode] = useState<boolean>(
    !PRESET_TARGETS.includes(currentTarget)
  );

  if (!isOpen) return null;

  const handlePresetClick = (preset: number) => {
    setIsCustomMode(false);
    setSelectedTarget(preset);
  };

  const handleCustomInputChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    setCustomTargetInput(cleaned);
    setIsCustomMode(true);
    const num = parseInt(cleaned, 10);
    if (!isNaN(num) && num > 0 && num <= 10000) {
      setSelectedTarget(num);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalTarget = selectedTarget;
    if (isCustomMode) {
      const parsed = parseInt(customTargetInput, 10);
      finalTarget = !isNaN(parsed) && parsed > 0 ? Math.min(parsed, 10000) : 33;
    }
    onStartSession(selectedDhikrId, finalTarget);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#231B14]/45 backdrop-blur-sm p-0 sm:p-4 transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="goal-modal-title"
    >
      {/* Sıcak Krem ve Doğal Bej Zikir Seçim Yüzeyi */}
      <div className="w-full max-w-lg bg-[#F6F0E4] text-[#2C221A] border border-[#D8C8B0] rounded-t-3xl sm:rounded-3xl p-6 shadow-[0_20px_50px_rgba(35,25,15,0.28)] max-h-[90vh] overflow-y-auto">
        {/* Üst Çekme Çubuğu (Mobil) */}
        <div className="w-10 h-1.5 bg-[#CBB99E] rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2
              id="goal-modal-title"
              className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#2B2118]"
            >
              Zikir ve Hedef Seçimi
            </h2>
            <p className="text-xs text-[#6E5D4F] mt-0.5">
              Kalbinize huzur veren zikri ve ulaşmak istediğiniz sayıyı belirleyin
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-[#EAE0CE] hover:bg-[#DFD2BC] text-[#4A3C30] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Zikir İfadesi Seçimi */}
          <div>
            <label className="block text-xs font-semibold text-[#5C4D3F] mb-2.5">
              Zikir İfadesi
            </label>
            <div className="grid grid-cols-1 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {DHIKR_LIST.map((item) => {
                const isSelected = item.id === selectedDhikrId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedDhikrId(item.id);
                    }}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#E5D7C0] border-[#B87824] shadow-sm'
                        : 'bg-[#EDE4D3] border-[#DCCEB6] hover:bg-[#E6DBC7]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm text-[#2B2118]">
                          {item.transliteration}
                        </span>
                        <span className="text-xs text-[#8C7A68]">·</span>
                        <span className="text-xs text-[#5A4B3E] truncate">
                          {item.meaningTr}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#756454] mt-0.5 line-clamp-1">
                        {item.noteTr}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span
                        dir="rtl"
                        className="font-arabic text-xl text-[#3A2B1E] font-bold"
                      >
                        {item.arabic}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#B87824] text-[#FAF5EC] flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Hedef Sayı Seçimi (33, 99, 100 veya Özel) */}
          <div>
            <label className="block text-xs font-semibold text-[#5C4D3F] mb-2.5">
              Zikir Hedefi
            </label>
            <div className="grid grid-cols-3 gap-2.5 mb-3">
              {PRESET_TARGETS.map((preset) => {
                const active = !isCustomMode && selectedTarget === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className={`min-h-[48px] rounded-xl font-semibold text-base tabular-nums border transition-all cursor-pointer ${
                      active
                        ? 'bg-[#B87824] text-[#FAF5EC] border-[#9E641A] shadow-sm'
                        : 'bg-[#EDE4D3] text-[#3A2D22] border-[#DCCEB6] hover:bg-[#E5D8C3]'
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>

            {/* Özel Hedef Girişi */}
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={10000}
                placeholder="Özel hedef sayısı girin (ör. 500)"
                value={customTargetInput}
                onFocus={() => setIsCustomMode(true)}
                onChange={(e) => handleCustomInputChange(e.target.value)}
                className={`w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[#EDE4D3] border text-sm text-[#2B2118] placeholder:text-[#867463] focus:outline-none transition-colors tabular-nums ${
                  isCustomMode
                    ? 'border-[#B87824] bg-[#E6D9C3]'
                    : 'border-[#DCCEB6]'
                }`}
              />
              {isCustomMode && customTargetInput && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#9E641A] font-semibold">
                  Özel Hedef
                </span>
              )}
            </div>
          </div>

          {/* Başlat Butonu */}
          <div className="pt-1">
            <button
              type="submit"
              className="w-full min-h-[52px] rounded-2xl bg-gradient-to-r from-[#386B4D] via-[#326145] to-[#295239] text-[#FAF5EC] font-semibold text-base shadow-md hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
            >
              Zikre Başla ({isCustomMode && customTargetInput ? customTargetInput : selectedTarget})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
