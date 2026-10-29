import { DHIKR_LIST, THEME_ORDER, ThemeId } from '../data/dhikrs';

export type AmbientSoundMode =
  | 'auto'
  | 'ney'
  | 'kanun'
  | 'oud'
  | 'kalimba'
  | 'ambient_pad';

export const AMBIENT_MODE_ORDER: AmbientSoundMode[] = [
  'auto',
  'ney',
  'kanun',
  'oud',
  'kalimba',
  'ambient_pad',
];

export const AMBIENT_MODE_LABELS: Record<AmbientSoundMode, string> = {
  auto: 'Temaya Uygun Enstrüman (Otomatik)',
  ney: 'Hafif Ney (Bambu & Nefes Nağmeleri)',
  kanun: 'Zarif Kanun (Su Damlası Tel Tınısı)',
  oud: 'Sakin Ud & Tanbur (Tok Ahşap Tını)',
  kalimba: 'Dingin Kalimba (Meditatif Kristal Çan)',
  ambient_pad: 'Sıcak Pad (432 Hz Kadife Zemin)',
};

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
  ambientVolume: number;
  vibrationEnabled: boolean;
  reducedMotion: boolean;
}

const SESSION_STORAGE_KEY = 'allaha_adim_adim_session_v1';
const SETTINGS_STORAGE_KEY = 'allaha_adim_adim_settings_v1';

const VALID_DHIKR_IDS = new Set(DHIKR_LIST.map((d) => d.id));
const VALID_THEME_IDS = new Set<ThemeId>(THEME_ORDER);
const VALID_AMBIENT_MODES: AmbientSoundMode[] = [
  'auto',
  'ney',
  'kanun',
  'oud',
  'kalimba',
  'ambient_pad',
];

const LEGACY_AMBIENT_MAP: Record<string, AmbientSoundMode> = {
  gentle_ney: 'ney',
  delicate_kanun: 'kanun',
  acoustic_oud: 'oud',
  peaceful_kalimba: 'kalimba',
  serene_pad: 'ambient_pad',
  sufi_serenity: 'ney',
  sacred_dawn: 'kanun',
  birds: 'ney',
  rain: 'ambient_pad',
  night: 'oud',
  wind: 'kanun',
  river: 'kanun',
  mountain_wind: 'ney',
  autumn_leaves: 'oud',
  ocean_waves: 'kalimba',
  winter_breeze: 'kalimba',
};

const LEGACY_THEME_MAP: Record<string, ThemeId> = {
  misty_valley: 'sunrise',
  mosque_courtyard: 'nature',
  lavender_hills: 'sunset',
  meadow: 'peaceful_garden',
  cosmos: 'night',
  emerald_lake: 'moonlit_nature',
  painted_valley: 'nature',
};

export const DEFAULT_SESSION: SessionState = {
  currentCount: 0,
  targetCount: 33,
  selectedDhikrId: 'subhanallah',
  isCompleted: false,
  lastSession: null,
};

export const DEFAULT_SETTINGS: SettingsState = {
  themeId: 'nature',
  soundEnabled: true,
  ambientEnabled: true,
  ambientMode: 'auto',
  ambientVolume: 0.20,
  vibrationEnabled: true,
  reducedMotion: false,
};

function sanitizeNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  const rounded = Math.floor(value);
  if (rounded < min || rounded > max) return fallback;
  return rounded;
}

function sanitizeVolume(value: unknown, fallback = 0.20): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  // Eski yüksek varsayılan (0.60 veya üzeri) kalmışsa yeni sakin seviyeye (0.20) çek
  if (value >= 0.60) return 0.20;
  return Math.min(1, Math.max(0, Number(value.toFixed(2))));
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
    const parsed = JSON.parse(raw) as Partial<SettingsState> & { themeId?: string };

    let themeId: ThemeId = 'nature';
    if (typeof parsed.themeId === 'string') {
      if (VALID_THEME_IDS.has(parsed.themeId as ThemeId)) {
        themeId = parsed.themeId as ThemeId;
      } else if (parsed.themeId in LEGACY_THEME_MAP) {
        themeId = LEGACY_THEME_MAP[parsed.themeId];
      }
    }

    let ambientMode: AmbientSoundMode = 'auto';
    if (parsed.ambientMode) {
      if (VALID_AMBIENT_MODES.includes(parsed.ambientMode as AmbientSoundMode)) {
        ambientMode = parsed.ambientMode as AmbientSoundMode;
      } else if (parsed.ambientMode in LEGACY_AMBIENT_MAP) {
        ambientMode = LEGACY_AMBIENT_MAP[parsed.ambientMode];
      }
    }

    return {
      themeId,
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
      ambientEnabled: typeof parsed.ambientEnabled === 'boolean' ? parsed.ambientEnabled : true,
      ambientMode,
      ambientVolume: sanitizeVolume(parsed.ambientVolume, 0.20),
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

const FAVORITES_STORAGE_KEY = 'allaha_adim_adim_favorites_v1';

export function loadFavoriteReflections(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function saveFavoriteReflections(favorites: string[]): void {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // sessizce devam et
  }
}

export function toggleFavoriteReflection(id: string): { favorites: string[]; isFav: boolean } {
  const current = loadFavoriteReflections();
  const index = current.indexOf(id);
  let updated: string[];
  let isFav = false;
  if (index >= 0) {
    updated = current.filter((item) => item !== id);
    isFav = false;
  } else {
    updated = [...current, id];
    isFav = true;
  }
  saveFavoriteReflections(updated);
  return { favorites: updated, isFav };
}

