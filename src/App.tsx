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
import { CompletionOverlay } from './components/CompletionOverlay';

type ActiveScreen = 'home' | 'dhikr' | 'settings';

export default function App() {
  const [screen, setScreen] = useState<ActiveScreen>('home');
  const [session, setSession] = useState<SessionState>(() => loadSessionState());
  const [settings, setSettings] = useState<SettingsState>(() => loadSettingsState());
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);

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
      settings.themeId
    );
  }, [settings]);

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
  const currentTheme = THEMES[settings.themeId] || THEMES.misty_valley;

  const handleOpenDhikrFromHome = () => {
    syncAmbientSoundscape(
      settings.ambientEnabled,
      settings.ambientMode,
      settings.themeId
    );
    setScreen('dhikr');
    if (session.currentCount === 0 || session.isCompleted) {
      setIsGoalModalOpen(true);
    }
  };

  // Zikir Sayacını Artırma ve Odak Ritmine Göre Ambiyans Sesini Uyarlama
  const handleIncrement = useCallback(() => {
    pulseAmbientFocusRhythm(
      settings.ambientEnabled,
      settings.ambientMode,
      settings.themeId
    );

    setSession((prev) => {
      if (prev.isCompleted || prev.currentCount >= prev.targetCount) {
        return prev;
      }

      const nextCount = prev.currentCount + 1;
      const reachedGoal = nextCount >= prev.targetCount;
      const isNisaneDivider = nextCount % 11 === 0;

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
    settings.themeId,
    settings.vibrationEnabled,
  ]);

  // Yeni Hedef veya Zikir Seçerek Oturum Başlatma
  const handleStartNewSession = (dhikrId: string, target: number) => {
    syncAmbientSoundscape(
      settings.ambientEnabled,
      settings.ambientMode,
      settings.themeId
    );
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
    setSession((prev) => ({
      ...prev,
      currentCount: 0,
      isCompleted: false,
    }));
  };

  // Tamamlanma ekranından "Sıradaki Zikre Geç"
  const handleStartNextDhikr = () => {
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

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden">
      {/* Seçilen Temanın Görsel ve Atmosferik Arka Planı */}
      <SceneBackground
        themeId={settings.themeId}
        reducedMotion={settings.reducedMotion}
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
          reducedMotion={settings.reducedMotion}
          onIncrement={handleIncrement}
          onReset={handleResetSession}
          onToggleSound={() =>
            handleUpdateSettings({ soundEnabled: !settings.soundEnabled })
          }
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
