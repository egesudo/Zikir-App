import { ThemeId } from '../data/dhikrs';

export type AmbientSoundMode = 'auto' | 'wind' | 'river' | 'ney';

export interface LastSessionSummary {
  dhikrId: string;
  dhikrName: string;
  count: number;
  target: number;
  completedAt: string;
}

export interface SessionState {
  currentCount: number;
  targetCount: number;
  selectedDhikrId: string;
  isCompleted: boolean;
  lastSession: LastSessionSummary | null;
}

export interface SettingsState {
  themeId: ThemeId;
  soundEnabled: boolean;
  ambientEnabled: boolean;
  ambientMode: AmbientSoundMode;
  vibrationEnabled: boolean;
  reducedMotion: boolean;
}

const SESSION_STORAGE_KEY = 'allaha_adim_adim_session_v1';
const SETTINGS_STORAGE_KEY = 'allaha_adim_adim_settings_v1';

export const DEFAULT_SESSION: SessionState = {
  currentCount: 0,
  targetCount: 33,
  selectedDhikrId: 'subhanallah',
  isCompleted: false,
  lastSession: null,
};

export const DEFAULT_SETTINGS: SettingsState = {
  themeId: 'misty_valley',
  soundEnabled: true,
  ambientEnabled: true,
  ambientMode: 'auto',
  vibrationEnabled: true,
  reducedMotion: false,
};

export function loadSessionState(): SessionState {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return DEFAULT_SESSION;
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    const targetCount =
      typeof parsed.targetCount === 'number' && parsed.targetCount > 0 ? parsed.targetCount : 33;
    const currentCount =
      typeof parsed.currentCount === 'number' && parsed.currentCount >= 0
        ? Math.min(parsed.currentCount, targetCount)
        : 0;
    return {
      currentCount,
      targetCount,
      selectedDhikrId: parsed.selectedDhikrId || 'subhanallah',
      isCompleted: Boolean(parsed.isCompleted || currentCount >= targetCount),
      lastSession: parsed.lastSession || null,
    };
  } catch {
    return DEFAULT_SESSION;
  }
}

export function saveSessionState(state: SessionState): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage kapalıysa sessizce devam et
  }
}

export function loadSettingsState(): SettingsState {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<SettingsState>;
    const validModes: AmbientSoundMode[] = ['auto', 'wind', 'river', 'ney'];
    const ambientMode: AmbientSoundMode =
      parsed.ambientMode && validModes.includes(parsed.ambientMode)
        ? parsed.ambientMode
        : 'auto';

    return {
      themeId: parsed.themeId || 'misty_valley',
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
      ambientEnabled: typeof parsed.ambientEnabled === 'boolean' ? parsed.ambientEnabled : true,
      ambientMode,
      vibrationEnabled:
        typeof parsed.vibrationEnabled === 'boolean' ? parsed.vibrationEnabled : true,
      reducedMotion: typeof parsed.reducedMotion === 'boolean' ? parsed.reducedMotion : false,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettingsState(state: SettingsState): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage kapalıysa sessizce devam et
  }
}
