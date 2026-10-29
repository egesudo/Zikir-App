import React from 'react';
import {
  X,
  Check,
  Palette,
  Volume2,
  VolumeX,
  Waves,
  Wind,
  Music,
  CloudRain,
  Bird,
  Moon,
  Sparkles,
} from 'lucide-react';
import { THEMES, THEME_ORDER, ThemeId } from '../data/dhikrs';
import {
  AmbientSoundMode,
  AMBIENT_MODE_LABELS,
  AMBIENT_MODE_ORDER,
  SettingsState,
} from '../utils/storage';
import { pulseAmbientFocusRhythm } from '../utils/sound';

interface AmbianceModalProps {
  isOpen: boolean;
  settings: SettingsState;
  onUpdateSettings: (partial: Partial<SettingsState>) => void;
  onClose: () => void;
}

export const AmbianceModal: React.FC<AmbianceModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleSelectTheme = (themeId: ThemeId) => {
    onUpdateSettings({ themeId, ambientMode: 'auto', ambientEnabled: true });
    pulseAmbientFocusRhythm(true, 'auto', themeId, settings.ambientVolume);
  };

  const handleToggleAmbient = () => {
    const nextEnabled = !settings.ambientEnabled;
    onUpdateSettings({ ambientEnabled: nextEnabled });
    if (nextEnabled) {
      pulseAmbientFocusRhythm(
        true,
        settings.ambientMode,
        settings.themeId,
        settings.ambientVolume
      );
    }
  };

  const handleSelectAmbientMode = (mode: AmbientSoundMode) => {
    onUpdateSettings({ ambientEnabled: true, ambientMode: mode });
    pulseAmbientFocusRhythm(true, mode, settings.themeId, settings.ambientVolume);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVol = Math.min(1, Math.max(0, Number(e.target.value) / 100));
    onUpdateSettings({
      ambientVolume: nextVol,
      ambientEnabled: nextVol > 0.01 ? true : settings.ambientEnabled,
    });
  };

  const renderModeIcon = (mode: AmbientSoundMode, active: boolean) => {
    const cls = `w-3.5 h-3.5 shrink-0 ${active ? 'text-[#386B4D]' : 'text-[#8C6528]'}`;
    switch (mode) {
      case 'river':
        return <Waves className={cls} />;
      case 'wind':
        return <Wind className={cls} />;
      case 'ney':
        return <Music className={cls} />;
      case 'rain':
        return <CloudRain className={cls} />;
      case 'birds':
        return <Bird className={cls} />;
      case 'night':
        return <Moon className={cls} />;
      case 'auto':
      default:
        return <Sparkles className={cls} />;
    }
  };

  const volumePercent = Math.round((settings.ambientVolume ?? 0.35) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#1C1611]/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ambiance-modal-title"
    >
      <div className="w-full max-w-lg max-h-[86dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#F6F0E4] text-[#2B2118] border border-[#D8C8B0] p-5 sm:p-6 shadow-[0_24px_56px_rgba(24,18,12,0.38)] space-y-5">
        {/* Üst Başlık */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EAE0CE] flex items-center justify-center shrink-0">
              <Palette className="w-4 h-4 text-[#B87824]" />
            </div>
            <div>
              <h2
                id="ambiance-modal-title"
                className="font-display text-xl sm:text-2xl font-semibold text-[#2B2118]"
              >
                Huzur Ambiyansları ve Doğa Sesi
              </h2>
              <p className="text-xs text-[#6E5D4F]">
                Zikir oturumunuz sıfırlanmadan atmosferi ve sesi kişiselleştirin
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Paneli kapat"
            className="min-w-[40px] min-h-[40px] rounded-xl bg-[#EDE4D3] hover:bg-[#E3D6BF] text-[#4A3C30] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Küçük Önizleme Kartlarıyla 7 Dinamik Ambiyans Teması */}
        <section>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#7A6856] mb-2.5">
            Canlı Arka Plan Teması Seçin (7 Ambiyans)
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {THEME_ORDER.map((tId) => {
              const t = THEMES[tId];
              const isSelected = settings.themeId === tId;
              return (
                <button
                  key={tId}
                  type="button"
                  onClick={() => handleSelectTheme(tId)}
                  className={`group relative rounded-2xl p-2.5 border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[92px] overflow-hidden ${
                    isSelected
                      ? 'bg-[#E5D7C0] border-[#B87824] ring-1 ring-[#B87824]/50 shadow-sm'
                      : 'bg-[#EDE4D3] border-[#DCCEB6] hover:bg-[#E6DBC7]'
                  }`}
                >
                  {/* Canlı Mini Önizleme Şeridi */}
                  <div
                    className="w-full h-10 rounded-xl border border-black/10 shadow-inner relative overflow-hidden mb-2"
                    style={{ background: t.swatch }}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#B87824] text-[#FAF5EC] flex items-center justify-center shadow">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-[#2B2118] truncate">
                      {t.name}
                    </div>
                    <div className="text-[10px] text-[#6E5D4F] truncate">
                      {t.englishName}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <div className="h-px bg-[#DFD2BC]" />

        {/* 2. Ambiyans Sesi Aç/Kapat, Ses Düzeyi Kaydırıcısı ve Ses Türü */}
        <section className="p-3.5 rounded-2xl bg-[#EDE4D3] border border-[#DCCEB6] space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {settings.ambientEnabled ? (
                <Volume2 className="w-4 h-4 text-[#386B4D] shrink-0" />
              ) : (
                <VolumeX className="w-4 h-4 text-[#8C7A6B] shrink-0" />
              )}
              <div>
                <div className="text-xs font-semibold text-[#2B2118]">
                  Çevresel Doğa ve Ambiyans Sesi
                </div>
                <div className="text-[11px] text-[#6E5D4F]">
                  {THEMES[settings.themeId]?.soundDescription}
                </div>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={settings.ambientEnabled}
              onClick={handleToggleAmbient}
              className={`min-w-[48px] h-7 rounded-full p-1 transition-colors cursor-pointer flex items-center shrink-0 ${
                settings.ambientEnabled
                  ? 'bg-[#386B4D] justify-end'
                  : 'bg-[#D6C7AE] justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#FAF5EC] shadow-xs" />
            </button>
          </div>

          {/* Ses Düzeyi Kontrolü (0% - 100%) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-[#5C4D3C]">
              <label htmlFor="ambient-volume-slider" className="font-medium">
                Ambiyans Ses Düzeyi
              </label>
              <span className="font-semibold tabular-nums">%{volumePercent}</span>
            </div>
            <input
              id="ambient-volume-slider"
              type="range"
              min={0}
              max={100}
              step={5}
              value={volumePercent}
              onChange={handleVolumeChange}
              className="w-full h-2 rounded-lg appearance-none bg-[#D8C8B0] accent-[#386B4D] cursor-pointer"
            />
          </div>

          {/* Ses Türü Seçenekleri */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {AMBIENT_MODE_ORDER.map((mId) => {
              const active = settings.ambientEnabled && settings.ambientMode === mId;
              return (
                <button
                  key={mId}
                  type="button"
                  onClick={() => handleSelectAmbientMode(mId)}
                  className={`px-2.5 py-2 rounded-xl border text-left flex items-center justify-between gap-1.5 transition-all cursor-pointer ${
                    active
                      ? 'bg-[#E3D3B8] border-[#B87824]'
                      : 'bg-[#F5EFE2] border-[#DCCEB6] hover:bg-[#EAE0CE]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    {renderModeIcon(mId, active)}
                    <span className="text-[11px] font-semibold text-[#2B2118] truncate">
                      {AMBIENT_MODE_LABELS[mId]}
                    </span>
                  </div>
                  {active && <Check className="w-3 h-3 text-[#9E641A] shrink-0" />}
                </button>
              );
            })}
          </div>
        </section>

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[46px] rounded-2xl bg-[#386B4D] hover:bg-[#2F5D41] text-[#FAF5EC] text-sm font-semibold transition-colors cursor-pointer"
        >
          Zikre Devam Et
        </button>
      </div>
    </div>
  );
};
