/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useCallback } from 'react';
import { DHIKR_LIST, THEMES } from './data/dhikrs';
import {
  loadSessionState,
  saveSessionState,
  loadSettingsState,
  saveSettingsState,
  SessionState,
  SettingsState,
  AMBIENT_MODE_ORDER,
  AmbientSoundMode,
} from './utils/storage';
import {
  playBeadClickSound,
  playCompletionChime,
  pulseAmbientFocusRhythm,
  syncAmbientSoundscape,
  stopAmbientSoundscape,
  triggerHaptic,
} from './utils/sound';
import { SceneBackground } from './components/SceneBackground';
import { HomeScreen } from './components/HomeScreen';
import { DhikrScreen } from './components/DhikrScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { GoalModal } from './components/GoalModal';
import { AmbianceModal } from './components/AmbianceModal';
import { CompletionOverlay } from './components/CompletionOverlay';

type ActiveScreen = 'home' | 'dhikr' | 'settings';

export default function App() {
  const [screen, setScreen] = useState<ActiveScreen>('home');
  const [session, setSession] = useState<SessionState>(() => loadSessionState());
  const [settings, setSettings] = useState<SettingsState>(() => loadSettingsState());
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);
  const [isAmbianceModalOpen, setIsAmbianceModalOpen] = useState<boolean>(false);
  const [rhythmTempoScale, setRhythmTempoScale] = useState<number>(0.92);

  // Oturum değişikliklerini localStorage'a kaydet
  useEffect(() => {
    saveSessionState(session);
  }, [session]);

  // Ayar değişikliklerini localStorage'a kaydet ve ambiyans sesini senkronize et
  useEffect(() => {
    saveSettingsState(settings);
    syncAmbientSoundscape(
      settings.ambientEnabled,
      settings.ambientMode,
      settings.themeId,
      settings.ambientVolume
    );
  }, [settings]);

  // Zikir yapılmadığında görsel 'Ritim Senkronizasyonu' ivmesini yumuşakça dinlenme hızına (0.90x) çek
  useEffect(() => {
    const timer = window.setInterval(() => {
      setRhythmTempoScale((prev) => {
        if (prev <= 0.92) return 0.9;
        return Number((prev - 0.03).toFixed(3));
      });
    }, 1400);
    return () => window.clearInterval(timer);
  }, []);

  // Unmount durumunda ses döngüsünü temizle
  useEffect(() => {
    return () => {
      stopAmbientSoundscape();
    };
  }, []);

  const currentDhikrIndex = Math.max(
    0,
    DHIKR_LIST.findIndex((d) => d.id === session.selectedDhikrId)
  );
  const currentDhikr = DHIKR_LIST[currentDhikrIndex] || DHIKR_LIST[0];
  const nextDhikr = DHIKR_LIST[(currentDhikrIndex + 1) % DHIKR_LIST.length];
  const currentTheme = THEMES[settings.themeId] || THEMES.nature;

  const handleOpenDhikrFromHome = () => {
    syncAmbientSoundscape(
      settings.ambientEnabled,
      settings.ambientMode,
      settings.themeId,
      settings.ambientVolume
    );
    setScreen('dhikr');
    if (session.currentCount === 0 || session.isCompleted) {
      setIsGoalModalOpen(true);
    }
  };

  // Zikir Sayacını Artırma, Ses ve Görsel Ritim Senkronizasyonunu Uyarlama
  const handleIncrement = useCallback(() => {
    const emaAudioScale = pulseAmbientFocusRhythm(
      settings.ambientEnabled,
      settings.ambientMode,
      settings.themeId,
      settings.ambientVolume
    );

    setSession((prev) => {
      if (prev.isCompleted || prev.currentCount >= prev.targetCount) {
        return prev;
      }

      const nextCount = prev.currentCount + 1;
      const reachedGoal = nextCount >= prev.targetCount;
      const isNisaneDivider = nextCount % 11 === 0;

      // Zikir ilerledikçe (nextCount / targetCount) ve EMA hızı arttıkça sakinleştirici ivme (0.90x -> 1.42x)
      const progressBoost = Math.min(0.16, (nextCount / Math.max(1, prev.targetCount)) * 0.16);
      const nextVisualScale = Math.min(1.42, Number((emaAudioScale + progressBoost).toFixed(3)));
      setRhythmTempoScale(nextVisualScale);

      if (reachedGoal) {
        playCompletionChime(settings.soundEnabled);
        triggerHaptic(settings.vibrationEnabled, [30, 50, 40]);
      } else {
        playBeadClickSound(settings.soundEnabled, isNisaneDivider);
        triggerHaptic(settings.vibrationEnabled, isNisaneDivider ? [22, 30, 18] : 15);
      }

      const activeDhikr =
        DHIKR_LIST.find((d) => d.id === prev.selectedDhikrId) || DHIKR_LIST[0];

      return {
        ...prev,
        currentCount: nextCount,
        isCompleted: reachedGoal,
        lastSession: reachedGoal
          ? {
              dhikrId: activeDhikr.id,
              dhikrName: activeDhikr.transliteration,
              count: nextCount,
              target: prev.targetCount,
              completedAt: new Date().toISOString(),
            }
          : prev.lastSession,
      };
    });
  }, [
    settings.soundEnabled,
    settings.ambientEnabled,
    settings.ambientMode,
    settings.ambientVolume,
    settings.themeId,
    settings.vibrationEnabled,
  ]);

  // Yeni Hedef veya Zikir Seçerek Oturum Başlatma
  const handleStartNewSession = (dhikrId: string, target: number) => {
    syncAmbientSoundscape(
      settings.ambientEnabled,
      settings.ambientMode,
      settings.themeId,
      settings.ambientVolume
    );
    setRhythmTempoScale(0.92);
    setSession((prev) => ({
      ...prev,
      selectedDhikrId: dhikrId,
      targetCount: target,
      currentCount: 0,
      isCompleted: false,
    }));
    setIsGoalModalOpen(false);
    setScreen('dhikr');
  };

  // Mevcut Zikri Sıfırlama
  const handleResetSession = () => {
    setRhythmTempoScale(0.92);
    setSession((prev) => ({
      ...prev,
      currentCount: 0,
      isCompleted: false,
    }));
  };

  // Tamamlanma ekranından "Sıradaki Zikre Geç"
  const handleStartNextDhikr = () => {
    setRhythmTempoScale(0.92);
    setSession((prev) => ({
      ...prev,
      selectedDhikrId: nextDhikr.id,
      currentCount: 0,
      isCompleted: false,
    }));
  };

  // Ayarları Güncelleme
  const handleUpdateSettings = (partial: Partial<SettingsState>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  // Zikir ekranından tek dokunuşla doğa sesi ritmi değiştirme
  const handleCycleAmbient = (): { enabled: boolean; mode: AmbientSoundMode } => {
    if (!settings.ambientEnabled) {
      const startMode = settings.ambientMode || 'auto';
      handleUpdateSettings({ ambientEnabled: true, ambientMode: startMode });
      pulseAmbientFocusRhythm(
        true,
        startMode,
        settings.themeId,
        settings.ambientVolume
      );
      return { enabled: true, mode: startMode };
    }

    const currentIndex = AMBIENT_MODE_ORDER.indexOf(settings.ambientMode);
    const isLastMode = currentIndex === AMBIENT_MODE_ORDER.length - 1;

    if (isLastMode) {
      handleUpdateSettings({ ambientEnabled: false });
      stopAmbientSoundscape();
      return { enabled: false, mode: settings.ambientMode };
    }

    const nextMode =
      AMBIENT_MODE_ORDER[(currentIndex + 1) % AMBIENT_MODE_ORDER.length];
    handleUpdateSettings({ ambientEnabled: true, ambientMode: nextMode });
    pulseAmbientFocusRhythm(
      true,
      nextMode,
      settings.themeId,
      settings.ambientVolume
    );
    return { enabled: true, mode: nextMode };
  };

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden">
      {/* Seçilen Temanın Görsel ve Ritim Senkronlu Atmosferik Arka Planı */}
      <SceneBackground
        themeId={settings.themeId}
        reducedMotion={settings.reducedMotion}
        rhythmTempoScale={rhythmTempoScale}
      />

      {/* Ekran Geçişleri */}
      {screen === 'home' && (
        <HomeScreen
          theme={currentTheme}
          currentDhikr={currentDhikr}
          currentCount={session.currentCount}
          targetCount={session.targetCount}
          reducedMotion={settings.reducedMotion}
          onOpenDhikr={handleOpenDhikrFromHome}
          onOpenSettings={() => setScreen('settings')}
        />
      )}

      {screen === 'dhikr' && (
        <DhikrScreen
          dhikr={currentDhikr}
          theme={currentTheme}
          currentCount={session.currentCount}
          targetCount={session.targetCount}
          soundEnabled={settings.soundEnabled}
          ambientEnabled={settings.ambientEnabled}
          ambientMode={settings.ambientMode}
          reducedMotion={settings.reducedMotion}
          onIncrement={handleIncrement}
          onReset={handleResetSession}
          onToggleSound={() =>
            handleUpdateSettings({ soundEnabled: !settings.soundEnabled })
          }
          onOpenAmbianceModal={() => setIsAmbianceModalOpen(true)}
          onCycleAmbient={handleCycleAmbient}
          onOpenGoalModal={() => setIsGoalModalOpen(true)}
          onBackHome={() => setScreen('home')}
        />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          settings={settings}
          lastSession={session.lastSession}
          currentCount={session.currentCount}
          targetCount={session.targetCount}
          currentDhikrName={currentDhikr.transliteration}
          onUpdateSettings={handleUpdateSettings}
          onBackHome={() => setScreen('home')}
        />
      )}

      {/* Hedef ve Zikir Seçim Penceresi */}
      <GoalModal
        isOpen={isGoalModalOpen}
        currentDhikrId={session.selectedDhikrId}
        currentTarget={session.targetCount}
        onClose={() => setIsGoalModalOpen(false)}
        onStartSession={handleStartNewSession}
      />

      {/* Önizleme Kartlı Hızlı Ambiyans ve Doğa Sesi Seçici Penceresi */}
      <AmbianceModal
        isOpen={isAmbianceModalOpen}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onClose={() => setIsAmbianceModalOpen(false)}
      />

      {/* Hedef Tamamlandığında Gösterilen Huzurlu Tamamlanma Ekranı */}
      <CompletionOverlay
        isOpen={screen === 'dhikr' && session.isCompleted}
        currentDhikr={currentDhikr}
        nextDhikr={nextDhikr}
        targetCount={session.targetCount}
        onRestartSame={handleResetSession}
        onStartNextDhikr={handleStartNextDhikr}
        onGoHome={() => {
          setSession((prev) => ({ ...prev, currentCount: 0, isCompleted: false }));
          setScreen('home');
        }}
      />
    </div>
  );
}
