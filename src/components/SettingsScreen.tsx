import React from 'react';
import {
  ArrowLeft,
  Volume2,
  Vibrate,
  Sparkles,
  Check,
  Palette,
  Clock,
  Wind,
  Waves,
  Music,
  CloudRain,
  Bird,
  Moon,
  Feather,
  Sunrise,
  Layers,
  Bell,
} from 'lucide-react';
import { THEMES, THEME_ORDER } from '../data/dhikrs';
import { AmbientSoundMode, LastSessionSummary, SettingsState } from '../utils/storage';
import { pulseAmbientFocusRhythm } from '../utils/sound';

interface SettingsScreenProps {
  settings: SettingsState;
  lastSession: LastSessionSummary | null;
  currentCount: number;
  targetCount: number;
  currentDhikrName: string;
  onUpdateSettings: (partial: Partial<SettingsState>) => void;
  onBackHome: () => void;
}

const AMBIENT_MODES: {
  id: AmbientSoundMode;
  label: string;
  desc: string;
  Icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: 'auto',
    label: 'Temaya Uygun Enstrüman (Otomatik)',
    desc: 'Seçili manevi atmosfer temasına en uygun akustik enstrüman tınısı',
    Icon: Sparkles,
  },
  {
    id: 'ney',
    label: 'Hafif Ney (Bambu & Nefes Nağmeleri)',
    desc: 'Derinden gelen sıcak ney nefesi, Rast dem tınısı ve huzurlu nağmeler',
    Icon: Music,
  },
  {
    id: 'kanun',
    label: 'Zarif Kanun (Su Damlası Tel Tınısı)',
    desc: 'Su gibi berrak dökülen 3-4 notalık duru akustik tel arpejleri',
    Icon: Sparkles,
  },
  {
    id: 'oud',
    label: 'Sakin Ud & Tanbur (Tok Ahşap Tını)',
    desc: 'Tok ahşap tekne rezonansı, pes frekanslar ve kadife mızrap dokunuşları',
    Icon: Feather,
  },
  {
    id: 'kalimba',
    label: 'Dingin Kalimba (Meditatif Kristal Çan)',
    desc: 'Masalsı, berrak ve iç ferahlatan metal lamelli kutu çan titreşimi',
    Icon: Bell,
  },
  {
    id: 'ambient_pad',
    label: 'Sıcak Pad (432 Hz Kadife Zemin)',
    desc: '432 Hz referanslı, nefes döngüsüyle hareketlenen kadife ses örtüsü',
    Icon: Layers,
  },
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  lastSession,
  currentCount,
  targetCount,
  currentDhikrName,
  onUpdateSettings,
  onBackHome,
}) => {
  const activeTheme = THEMES[settings.themeId] || THEMES.nature;
  const isDarkText = activeTheme.isDarkText;

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

  const volumePercent = Math.round((settings.ambientVolume ?? 0.20) * 100);

  return (
    <main className="relative z-10 min-h-dvh flex flex-col px-5 pt-5 pb-8 max-w-xl mx-auto">
      {/* Üst Başlık ve Geri Dönüş */}
      <header className="flex items-center justify-between gap-4 mb-5">
        <button
          type="button"
          onClick={onBackHome}
          aria-label="Ana ekrana dön"
          className="min-h-[44px] px-4 py-2 rounded-2xl bg-[#F7F1E5]/90 hover:bg-[#F7F1E5] text-[#2C221A] border border-[#DCCEB6] shadow-sm backdrop-blur-md flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 shrink-0 text-[#6E5D4F]" />
          <span>Ana Ekran</span>
        </button>

        <h1
          className={`font-display text-2xl sm:text-3xl font-semibold ${
            isDarkText ? 'text-[#231B14]' : 'text-[#FAF5EC] drop-shadow'
          }`}
        >
          Ayarlar
        </h1>

        <div className="w-24" aria-hidden="true" />
      </header>

      {/* Sıcak Krem ve Bej Ayarlar Kartı */}
      <div className="rounded-3xl bg-[#F6F0E4]/95 text-[#2C221A] backdrop-blur-xl border border-[#D8C8B0] p-5 sm:p-6 shadow-[0_18px_42px_rgba(35,25,15,0.22)] space-y-6">
        {/* 1. Dinamik ve Animasyonlu 7 Huzur Ambiyansı Seçimi (Küçük Önizleme Kartları) */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-[#B87824] shrink-0" />
            <h2 className="text-sm font-semibold tracking-wide text-[#2B2118]">
              Dinamik Huzur Ambiyansları ({THEME_ORDER.length} Canlı Tema)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {THEME_ORDER.map((tId) => {
              const t = THEMES[tId];
              const isSelected = settings.themeId === tId;
              return (
                <button
                  key={tId}
                  type="button"
                  onClick={() => {
                    onUpdateSettings({ themeId: tId, ambientMode: 'auto', ambientEnabled: true });
                    pulseAmbientFocusRhythm(
                      true,
                      'auto',
                      tId,
                      settings.ambientVolume
                    );
                  }}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#E5D7C0] border-[#B87824] shadow-sm'
                      : 'bg-[#EDE4D3] border-[#DCCEB6] hover:bg-[#E6DBC7]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-12 h-12 rounded-xl shrink-0 border border-[#CBB99E] shadow-inner"
                      style={{ background: t.swatch }}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#2B2118] truncate">
                        {t.name}{' '}
                        <span className="text-[11px] font-normal text-[#6B5A4B]">
                          ({t.englishName})
                        </span>
                      </div>
                      <div className="text-[11px] text-[#6B5A4B] line-clamp-1 mt-0.5">
                        {t.subtitle}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="w-6 h-6 rounded-full bg-[#B87824] text-[#FAF5EC] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <div className="h-px bg-[#DFD2BC]" />

        {/* 2. Ses, Doğa Ambiyansı, Ses Seviyesi, Titreşim ve Animasyon Tercihleri */}
        <section className="space-y-3.5">
          {/* Tesbih Dokunuş Sesi (Ambiyans sesinden bağımsız kontrol) */}
          <div className="flex items-center justify-between gap-4 py-1.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EAE0CE] flex items-center justify-center shrink-0">
                <Volume2 className="w-4 h-4 text-[#B87824]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#2B2118]">
                  Zikir Tesbih Boncuğu Sesi
                </div>
                <div className="text-xs text-[#6E5D4F]">
                  Her zikirde doğal ahşap boncuk dokunuşu ve hafif ney tınısı
                </div>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.soundEnabled}
              onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`min-w-[52px] h-8 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                settings.soundEnabled
                  ? 'bg-[#386B4D] justify-end'
                  : 'bg-[#D6C7AE] justify-start'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-[#FAF5EC] shadow-sm" />
            </button>
          </div>

          {/* Çevresel Ambiyans Sesi ve Ses Düzeyi Kontrolü */}
          <div className="p-4 rounded-2xl bg-[#EDE4D3]/90 border border-[#DCCEB6] space-y-3.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E2D4BC] flex items-center justify-center shrink-0">
                  <Wind className="w-4 h-4 text-[#386B4D]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#2B2118]">
                    Çevresel Ambiyans Sesi
                  </div>
                  <div className="text-xs text-[#6E5D4F]">
                    {activeTheme.soundDescription}
                  </div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-label="Çevresel Ambiyans Sesi"
                aria-checked={settings.ambientEnabled}
                onClick={handleToggleAmbient}
                className={`min-w-[52px] h-8 rounded-full p-1 transition-colors cursor-pointer flex items-center shrink-0 ${
                  settings.ambientEnabled
                    ? 'bg-[#386B4D] justify-end'
                    : 'bg-[#D6C7AE] justify-start'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-[#FAF5EC] shadow-sm" />
              </button>
            </div>

            {/* Ambiyans Ses Düzeyi Kaydırıcısı */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-[#4A3C30]">
                <label htmlFor="settings-ambient-volume" className="font-semibold">
                  Ambiyans Ses Düzeyi
                </label>
                <span className="font-bold tabular-nums text-[#386B4D]">
                  %{volumePercent}
                </span>
              </div>
              <input
                id="settings-ambient-volume"
                type="range"
                min={0}
                max={100}
                step={5}
                value={volumePercent}
                onChange={handleVolumeChange}
                className="w-full h-2 rounded-lg appearance-none bg-[#D6C7AE] accent-[#386B4D] cursor-pointer"
              />
            </div>

            {/* Döngüsel Doğa Sesi Seçenekleri */}
            {settings.ambientEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {AMBIENT_MODES.map(({ id, label, desc, Icon }) => {
                  const active = settings.ambientMode === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectAmbientMode(id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        active
                          ? 'bg-[#E3D3B8] border-[#B87824] shadow-xs'
                          : 'bg-[#F5EFE2] border-[#DCCEB6] hover:bg-[#EAE0CE]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              active ? 'text-[#386B4D]' : 'text-[#8C6528]'
                            }`}
                          />
                          <span className="text-xs font-semibold text-[#2B2118] truncate">
                            {label}
                          </span>
                        </div>
                        {active && (
                          <Check className="w-3.5 h-3.5 text-[#9E641A] shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#6E5D4F] mt-1 line-clamp-1">
                        {desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Titreşim (Haptik) */}
          <div className="flex items-center justify-between gap-4 py-1.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EAE0CE] flex items-center justify-center shrink-0">
                <Vibrate className="w-4 h-4 text-[#B87824]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#2B2118]">Titreşim Desteği</div>
                <div className="text-xs text-[#6E5D4F]">
                  Destekleyen cihazlarda nazik dokunsal geri bildirim
                </div>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.vibrationEnabled}
              onClick={() =>
                onUpdateSettings({ vibrationEnabled: !settings.vibrationEnabled })
              }
              className={`min-w-[52px] h-8 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                settings.vibrationEnabled
                  ? 'bg-[#386B4D] justify-end'
                  : 'bg-[#D6C7AE] justify-start'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-[#FAF5EC] shadow-sm" />
            </button>
          </div>

          {/* Animasyon Yoğunluğunu Azaltma */}
          <div className="flex items-center justify-between gap-4 py-1.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EAE0CE] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#B87824]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#2B2118]">
                  Animasyon Yoğunluğunu Azalt
                </div>
                <div className="text-xs text-[#6E5D4F]">
                  Arka plan ambiyans hareketlerini ve boncuk kaymasını sadeleştirir
                </div>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.reducedMotion}
              onClick={() =>
                onUpdateSettings({ reducedMotion: !settings.reducedMotion })
              }
              className={`min-w-[52px] h-8 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                settings.reducedMotion
                  ? 'bg-[#386B4D] justify-end'
                  : 'bg-[#D6C7AE] justify-start'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-[#FAF5EC] shadow-sm" />
            </button>
          </div>
        </section>

        <div className="h-px bg-[#DFD2BC]" />

        {/* 3. Son Oturum Bilgisi */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-[#B87824] shrink-0" />
            <h2 className="text-sm font-semibold tracking-wide text-[#2B2118]">
              Son Oturum Bilgisi
            </h2>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#EDE4D3] border border-[#DCCEB6] text-xs text-[#4A3C30] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[#6E5D4F]">Mevcut Oturum:</span>
              <span className="font-semibold text-[#2B2118] tabular-nums">
                {currentDhikrName} · {currentCount} / {targetCount}
              </span>
            </div>

            {lastSession ? (
              <div className="flex items-center justify-between pt-1.5 border-t border-[#DCCEB6]">
                <span className="text-[#6E5D4F]">Son Tamamlanan:</span>
                <span className="font-semibold text-[#386B4D] tabular-nums">
                  {lastSession.dhikrName} · {lastSession.count} / {lastSession.target}
                </span>
              </div>
            ) : (
              <div className="text-[#7E6C5B] pt-1.5 border-t border-[#DCCEB6]">
                Henüz tamamlanmış bir zikir oturumu kaydedilmedi.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};
