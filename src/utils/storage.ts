import { DHIKR_LIST, THEME_ORDER, ThemeId } from '../data/dhikrs';

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

const VALID_DHIKR_IDS = new Set(DHIKR_LIST.map((d) => d.id));
const VALID_THEME_IDS = new Set<ThemeId>(THEME_ORDER);
const VALID_AMBIENT_MODES: AmbientSoundMode[] = ['auto', 'wind', 'river', 'ney'];

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

function sanitizeNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  const rounded = Math.floor(value);
  if (rounded < min || rounded > max) return fallback;
  return rounded;
}

function sanitizeLastSession(raw: unknown): LastSessionSummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Partial<LastSessionSummary>;
  if (
    typeof candidate.dhikrId !== 'string' ||
    !VALID_DHIKR_IDS.has(candidate.dhikrId) ||
    typeof candidate.dhikrName !== 'string' ||
    candidate.dhikrName.length === 0 ||
    candidate.dhikrName.length > 80 ||
    typeof candidate.completedAt !== 'string' ||
    candidate.completedAt.length > 40
  ) {
    return null;
  }

  const target = sanitizeNumber(candidate.target, 1, 10000, 33);
  const count = sanitizeNumber(candidate.count, 0, 10000, target);

  return {
    dhikrId: candidate.dhikrId,
    dhikrName: candidate.dhikrName,
    count,
    target,
    completedAt: candidate.completedAt,
  };
}

export function loadSessionState(): SessionState {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return DEFAULT_SESSION;
    const parsed = JSON.parse(raw) as Partial<SessionState>;

    const targetCount = sanitizeNumber(parsed.targetCount, 1, 10000, 33);
    const rawCurrent = sanitizeNumber(parsed.currentCount, 0, 10000, 0);
    const currentCount = Math.min(rawCurrent, targetCount);

    const selectedDhikrId =
      typeof parsed.selectedDhikrId === 'string' && VALID_DHIKR_IDS.has(parsed.selectedDhikrId)
        ? parsed.selectedDhikrId
        : 'subhanallah';

    return {
      currentCount,
      targetCount,
      selectedDhikrId,
      isCompleted: Boolean(parsed.isCompleted || currentCount >= targetCount),
      lastSession: sanitizeLastSession(parsed.lastSession),
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

    const themeId: ThemeId =
      typeof parsed.themeId === 'string' && VALID_THEME_IDS.has(parsed.themeId as ThemeId)
        ? (parsed.themeId as ThemeId)
        : 'misty_valley';

    const ambientMode: AmbientSoundMode =
      parsed.ambientMode && VALID_AMBIENT_MODES.includes(parsed.ambientMode)
        ? parsed.ambientMode
        : 'auto';

    return {
      themeId,
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
