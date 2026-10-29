import { ThemeId } from '../data/dhikrs';
import { AmbientSoundMode } from './storage';

let audioCtx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;
let longLoopBuffer: AudioBuffer | null = null;
let stepMelodyIndex = 0;

// Huzurlu Rast/Uşşak makamı esintili yumuşak ney frekans dizisi (Re4 - Mi4 - Fa#4 - Sol4 - La4)
const NEY_FREQUENCIES = [293.66, 329.63, 369.99, 392.0, 440.0, 392.0, 369.99, 329.63];

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {
      // Kullanıcı etkileşimiyle otomatik devam eder
    });
  }
  return audioCtx;
}

function getSoftNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const bufferSize = Math.floor(ctx.sampleRate * 0.6);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + 0.04 * white) / 1.04;
    lastOut = data[i];
    data[i] *= 2.5;
  }
  noiseBuffer = buffer;
  return buffer;
}

// Döngüsel doğa sesleri için pürüzsüz (crossfade'li) 5 saniyelik pembe/kahverengi gürültü tamponu
function getLoopingNatureBuffer(ctx: AudioContext): AudioBuffer {
  if (longLoopBuffer) return longLoopBuffer;
  const durationSeconds = 5;
  const bufferSize = Math.floor(ctx.sampleRate * durationSeconds);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let b0 = 0,
    b1 = 0,
    b2 = 0,
    b3 = 0,
    b4 = 0,
    b5 = 0,
    b6 = 0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.048;
    b6 = white * 0.115926;
  }

  // Döngü geçiş noktasını pürüzsüzleştir
  const fadeSamples = Math.floor(ctx.sampleRate * 0.15);
  for (let i = 0; i < fadeSamples; i++) {
    const ratio = i / fadeSamples;
    data[i] = data[i] * ratio + data[bufferSize - fadeSamples + i] * (1 - ratio);
  }

  longLoopBuffer = buffer;
  return buffer;
}

export type ActiveSoundProfile = 'wind' | 'river' | 'ney' | 'rain' | 'birds' | 'night';

/**
 * Seçili moda ve 7 ambiyans temasına göre aktif çevresel ses profilini belirler:
 * - Doğa (nature): hafif rüzgâr ve uzaktan gelen kuş sesleri ('birds')
 * - Yağmurlu Hava (rainy): yumuşak yağmur ve damla sesleri ('rain')
 * - Gece (night): hafif gece böcekleri ve sakin doğa sesleri ('night')
 * - Gün Doğumu (sunrise): hafif esinti ve uzaktan duyulan kuş sesleri ('birds')
 * - Gün Batımı (sunset): yumuşak rüzgâr ve sakin su sesi ('wind')
 * - Ay Işığında Doğa (moonlit_nature): hafif su dalgası ve gece doğası ('river')
 * - Huzurlu Bahçe (peaceful_garden): hafif rüzgâr ve uzaktan gelen kuş sesleri ('birds')
 */
export function resolveAmbientProfile(
  mode: AmbientSoundMode,
  themeId: ThemeId
): ActiveSoundProfile {
  if (mode !== 'auto') return mode;
  switch (themeId) {
    case 'nature':
    case 'sunrise':
    case 'peaceful_garden':
      return 'birds';
    case 'rainy':
      return 'rain';
    case 'night':
      return 'night';
    case 'sunset':
      return 'wind';
    case 'moonlit_nature':
      return 'river';
    default:
      return 'birds';
  }
}

// --- ZİKİR RİTMİYLE SENKRONİZE VE SES DÜZEYİ KONTROLLÜ DOĞA AMBİYANS MOTORU ---

interface ActiveAmbientGraph {
  profile: ActiveSoundProfile;
  masterGain: GainNode;
  warmthFilter: BiquadFilterNode;
  lfoOsc: OscillatorNode;
  cleanup: () => void;
}

let activeAmbient: ActiveAmbientGraph | null = null;
let focusIntensity = 0.25; // 0.18 (dingin fısıltı) -> 1.0 (derin odak ritmi)
let userVolume = 0.35; // 0.0 -> 1.0 (Varsayılan düşük ve huzurlu seviye: %35)
let rhythmCadenceHz = 0.25; // Zikir çekim hızına göre senkronize LFO dalga frekansı
let lastTapTimestamp = 0;
let decayIntervalId: number | null = null;

function applyDynamicFocusToAudio(ctx: AudioContext, withPulseCrest = false): void {
  if (!activeAmbient) return;
  const now = ctx.currentTime;

  // Kullanıcının seçtiği ses düzeyi (0.0 - 1.0) ile odak ritmini çarp
  const volumeScale = Math.max(0.0005, userVolume * 1.45);
  const rawBaseGain = 0.022 + focusIntensity * 0.068;
  const baseTargetGain = userVolume <= 0.01 ? 0.0001 : rawBaseGain * volumeScale;
  const crestGain =
    withPulseCrest && userVolume > 0.01
      ? Math.min(0.18, baseTargetGain * 1.28)
      : baseTargetGain;

  activeAmbient.masterGain.gain.cancelScheduledValues(now);
  if (withPulseCrest) {
    activeAmbient.masterGain.gain.setTargetAtTime(crestGain, now, 0.12);
    activeAmbient.masterGain.gain.setTargetAtTime(baseTargetGain, now + 0.28, 0.45);
  } else {
    activeAmbient.masterGain.gain.setTargetAtTime(baseTargetGain, now, 0.35);
  }

  const baseCutoffMap: Record<ActiveSoundProfile, number> = {
    wind: 280,
    river: 390,
    ney: 320,
    rain: 540,
    birds: 450,
    night: 260,
  };
  const baseCutoff = baseCutoffMap[activeAmbient.profile] || 320;
  const dynamicCutoff = baseCutoff + focusIntensity * 340 + (withPulseCrest ? 85 : 0);
  activeAmbient.warmthFilter.frequency.cancelScheduledValues(now);
  activeAmbient.warmthFilter.frequency.setTargetAtTime(dynamicCutoff, now, 0.22);
  if (withPulseCrest) {
    activeAmbient.warmthFilter.frequency.setTargetAtTime(
      baseCutoff + focusIntensity * 340,
      now + 0.3,
      0.5
    );
  }

  activeAmbient.lfoOsc.frequency.setTargetAtTime(rhythmCadenceHz, now, 0.5);
}

function ensureDecayLoop(): void {
  if (decayIntervalId !== null || typeof window === 'undefined') return;
  decayIntervalId = window.setInterval(() => {
    if (typeof document !== 'undefined' && document.hidden) return;
    const nowMs = performance.now();
    const idleMs = nowMs - lastTapTimestamp;
    if (idleMs > 2800 && focusIntensity > 0.2) {
      focusIntensity = Math.max(0.2, focusIntensity - 0.04);
      rhythmCadenceHz = Math.max(0.14, rhythmCadenceHz * 0.92);
      if (audioCtx && activeAmbient) {
        applyDynamicFocusToAudio(audioCtx, false);
      }
    }
  }, 700);
}

function buildAmbientGraph(
  ctx: AudioContext,
  profile: ActiveSoundProfile
): ActiveAmbientGraph {
  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.001, now);

  const warmthFilter = ctx.createBiquadFilter();
  warmthFilter.type = 'lowpass';
  warmthFilter.frequency.setValueAtTime(380, now);

  warmthFilter.connect(masterGain);
  masterGain.connect(ctx.destination);

  const sourcesToStop: AudioScheduledSourceNode[] = [];
  const nodesToDisconnect: AudioNode[] = [masterGain, warmthFilter];
  let extraIntervalId: number | null = null;
  let primaryLfo: OscillatorNode;

  if (profile === 'wind') {
    // GÜN BATIMI / ESİNTİLİ VADİ: Yumuşak rüzgâr + hafif su yansıması dokusu
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = getLoopingNatureBuffer(ctx);
    noiseSrc.loop = true;

    const windBand = ctx.createBiquadFilter();
    windBand.type = 'bandpass';
    windBand.frequency.setValueAtTime(275, now);
    windBand.Q.setValueAtTime(2.4, now);

    const waterHintFilter = ctx.createBiquadFilter();
    waterHintFilter.type = 'bandpass';
    waterHintFilter.frequency.setValueAtTime(620, now);
    waterHintFilter.Q.setValueAtTime(3.2, now);

    const waterHintGain = ctx.createGain();
    waterHintGain.gain.setValueAtTime(0.22, now);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.16, now);
    lfoGain.gain.setValueAtTime(110, now);

    lfo.connect(lfoGain);
    lfoGain.connect(windBand.frequency);

    noiseSrc.connect(windBand);
    windBand.connect(warmthFilter);

    noiseSrc.connect(waterHintFilter);
    waterHintFilter.connect(waterHintGain);
    waterHintGain.connect(warmthFilter);

    noiseSrc.start(now);
    lfo.start(now);
    primaryLfo = lfo;
    sourcesToStop.push(noiseSrc, lfo);
    nodesToDisconnect.push(
      noiseSrc,
      windBand,
      waterHintFilter,
      waterHintGain,
      lfo,
      lfoGain
    );
  } else if (profile === 'river') {
    // AY IŞIĞINDA DOĞA / HUZURLU ŞADIRVAN: Hafif su dalgası ve gece doğası
    const streamSrc = ctx.createBufferSource();
    streamSrc.buffer = getLoopingNatureBuffer(ctx);
    streamSrc.loop = true;

    const waterBodyFilter = ctx.createBiquadFilter();
    waterBodyFilter.type = 'lowpass';
    waterBodyFilter.frequency.setValueAtTime(420, now);

    const rippleFilter = ctx.createBiquadFilter();
    rippleFilter.type = 'bandpass';
    rippleFilter.frequency.setValueAtTime(760, now);
    rippleFilter.Q.setValueAtTime(2.9, now);

    const rippleGain = ctx.createGain();
    rippleGain.gain.setValueAtTime(0.36, now);

    const waterLfo = ctx.createOscillator();
    const waterLfoGain = ctx.createGain();
    waterLfo.type = 'sine';
    waterLfo.frequency.setValueAtTime(0.24, now);
    waterLfoGain.gain.setValueAtTime(155, now);

    waterLfo.connect(waterLfoGain);
    waterLfoGain.connect(rippleFilter.frequency);

    streamSrc.connect(waterBodyFilter);
    waterBodyFilter.connect(warmthFilter);

    streamSrc.connect(rippleFilter);
    rippleFilter.connect(rippleGain);
    rippleGain.connect(warmthFilter);

    streamSrc.start(now);
    waterLfo.start(now);
    primaryLfo = waterLfo;
    sourcesToStop.push(streamSrc, waterLfo);
    nodesToDisconnect.push(
      streamSrc,
      waterBodyFilter,
      rippleFilter,
      rippleGain,
      waterLfo,
      waterLfoGain
    );
  } else if (profile === 'rain') {
    // YAĞMURLU HAVA: Yumuşak yağmur çisentisi ve su damlası tınıları
    const rainSrc = ctx.createBufferSource();
    rainSrc.buffer = getLoopingNatureBuffer(ctx);
    rainSrc.loop = true;

    const patterFilter = ctx.createBiquadFilter();
    patterFilter.type = 'bandpass';
    patterFilter.frequency.setValueAtTime(960, now);
    patterFilter.Q.setValueAtTime(1.35, now);

    const warmRainFilter = ctx.createBiquadFilter();
    warmRainFilter.type = 'lowpass';
    warmRainFilter.frequency.setValueAtTime(510, now);

    const patterGain = ctx.createGain();
    patterGain.gain.setValueAtTime(0.44, now);

    const rainLfo = ctx.createOscillator();
    const rainLfoGain = ctx.createGain();
    rainLfo.type = 'sine';
    rainLfo.frequency.setValueAtTime(0.21, now);
    rainLfoGain.gain.setValueAtTime(130, now);

    rainLfo.connect(rainLfoGain);
    rainLfoGain.connect(patterFilter.frequency);

    rainSrc.connect(warmRainFilter);
    warmRainFilter.connect(warmthFilter);

    rainSrc.connect(patterFilter);
    patterFilter.connect(patterGain);
    patterGain.connect(warmthFilter);

    rainSrc.start(now);
    rainLfo.start(now);
    primaryLfo = rainLfo;
    sourcesToStop.push(rainSrc, rainLfo);
    nodesToDisconnect.push(
      rainSrc,
      patterFilter,
      warmRainFilter,
      patterGain,
      rainLfo,
      rainLfoGain
    );

    // Aralıklı yumuşak yağmur damlası tınısı
    if (typeof window !== 'undefined') {
      const dropFreqs = [680, 790, 880, 1020];
      extraIntervalId = window.setInterval(() => {
        try {
          if (!audioCtx || audioCtx.state !== 'running') return;
          if (typeof document !== 'undefined' && document.hidden) return;
          const t = audioCtx.currentTime;
          const f = dropFreqs[Math.floor(Math.random() * dropFreqs.length)];

          const dropOsc = audioCtx.createOscillator();
          const dropGain = audioCtx.createGain();
          dropOsc.type = 'sine';
          dropOsc.frequency.setValueAtTime(f, t);
          dropOsc.frequency.exponentialRampToValueAtTime(f * 1.32, t + 0.055);

          dropGain.gain.setValueAtTime(0.0001, t);
          dropGain.gain.linearRampToValueAtTime(0.032, t + 0.01);
          dropGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

          dropOsc.connect(dropGain);
          dropGain.connect(masterGain);

          dropOsc.start(t);
          dropOsc.stop(t + 0.09);
        } catch {
          // Yoksay
        }
      }, 1900);
    }
  } else if (profile === 'birds') {
    // DOĞA / GÜN DOĞUMU / HUZURLU BAHÇE: Hafif rüzgâr ve uzaktan gelen kuş sesleri
    const breezeSrc = ctx.createBufferSource();
    breezeSrc.buffer = getLoopingNatureBuffer(ctx);
    breezeSrc.loop = true;

    const breezeFilter = ctx.createBiquadFilter();
    breezeFilter.type = 'bandpass';
    breezeFilter.frequency.setValueAtTime(330, now);
    breezeFilter.Q.setValueAtTime(2.1, now);

    const breezeLfo = ctx.createOscillator();
    const breezeLfoGain = ctx.createGain();
    breezeLfo.type = 'sine';
    breezeLfo.frequency.setValueAtTime(0.19, now);
    breezeLfoGain.gain.setValueAtTime(85, now);

    breezeLfo.connect(breezeLfoGain);
    breezeLfoGain.connect(breezeFilter.frequency);

    breezeSrc.connect(breezeFilter);
    breezeFilter.connect(warmthFilter);

    breezeSrc.start(now);
    breezeLfo.start(now);
    primaryLfo = breezeLfo;
    sourcesToStop.push(breezeSrc, breezeLfo);
    nodesToDisconnect.push(breezeSrc, breezeFilter, breezeLfo, breezeLfoGain);

    // Uzaktan gelen yumuşak kuş cıvıltıları
    if (typeof window !== 'undefined') {
      const birdNotes = [1174.66, 1318.51, 1479.98, 1567.98];
      extraIntervalId = window.setInterval(() => {
        try {
          if (!audioCtx || audioCtx.state !== 'running') return;
          if (typeof document !== 'undefined' && document.hidden) return;
          const t = audioCtx.currentTime;
          const note1 = birdNotes[Math.floor(Math.random() * birdNotes.length)];
          const note2 = birdNotes[Math.floor(Math.random() * birdNotes.length)];

          const chirpOsc = audioCtx.createOscillator();
          const chirpGain = audioCtx.createGain();
          chirpOsc.type = 'sine';
          chirpOsc.frequency.setValueAtTime(note1, t);
          chirpOsc.frequency.exponentialRampToValueAtTime(note2, t + 0.14);
          chirpOsc.frequency.exponentialRampToValueAtTime(note1 * 1.07, t + 0.28);

          chirpGain.gain.setValueAtTime(0.0001, t);
          chirpGain.gain.linearRampToValueAtTime(0.042, t + 0.05);
          chirpGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);

          chirpOsc.connect(chirpGain);
          chirpGain.connect(masterGain);

          chirpOsc.start(t);
          chirpOsc.stop(t + 0.36);
        } catch {
          // Yoksay
        }
      }, 3200);
    }
  } else if (profile === 'night') {
    // GECE AMBİYANSI: Hafif gece böcekleri ve sakin gece doğası
    const nightAirSrc = ctx.createBufferSource();
    nightAirSrc.buffer = getLoopingNatureBuffer(ctx);
    nightAirSrc.loop = true;

    const nightFilter = ctx.createBiquadFilter();
    nightFilter.type = 'lowpass';
    nightFilter.frequency.setValueAtTime(250, now);

    const nightAirGain = ctx.createGain();
    nightAirGain.gain.setValueAtTime(0.32, now);

    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(146.83, now);
    subGain.gain.setValueAtTime(0.18, now);

    const nightLfo = ctx.createOscillator();
    const nightLfoGain = ctx.createGain();
    nightLfo.type = 'sine';
    nightLfo.frequency.setValueAtTime(0.14, now);
    nightLfoGain.gain.setValueAtTime(55, now);

    nightLfo.connect(nightLfoGain);
    nightLfoGain.connect(nightFilter.frequency);

    nightAirSrc.connect(nightFilter);
    nightFilter.connect(nightAirGain);
    nightAirGain.connect(warmthFilter);

    subOsc.connect(subGain);
    subGain.connect(warmthFilter);

    nightAirSrc.start(now);
    subOsc.start(now);
    nightLfo.start(now);
    primaryLfo = nightLfo;

    sourcesToStop.push(nightAirSrc, subOsc, nightLfo);
    nodesToDisconnect.push(
      nightAirSrc,
      nightFilter,
      nightAirGain,
      subOsc,
      subGain,
      nightLfo,
      nightLfoGain
    );

    // Uzaktan gelen çok hafif gece böceği (cricket) tınısı
    if (typeof window !== 'undefined') {
      extraIntervalId = window.setInterval(() => {
        try {
          if (!audioCtx || audioCtx.state !== 'running') return;
          if (typeof document !== 'undefined' && document.hidden) return;
          const t = audioCtx.currentTime;
          [0, 0.09].forEach((offset) => {
            if (!audioCtx) return;
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(2480, t + offset);
            g.gain.setValueAtTime(0.0001, t + offset);
            g.gain.linearRampToValueAtTime(0.018, t + offset + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.065);
            osc.connect(g);
            g.connect(masterGain);
            osc.start(t + offset);
            osc.stop(t + offset + 0.07);
          });
        } catch {
          // Yoksay
        }
      }, 2900);
    }
  } else {
    // HAFİF NEY: Rast/Uşşak Re3 (146.83 Hz) + La3 (220 Hz) sıcak nefes dem katmanı
    const droneOsc1 = ctx.createOscillator();
    const droneOsc2 = ctx.createOscillator();
    const droneGain = ctx.createGain();

    droneOsc1.type = 'sine';
    droneOsc1.frequency.setValueAtTime(146.83, now);

    droneOsc2.type = 'triangle';
    droneOsc2.frequency.setValueAtTime(220.0, now);

    droneGain.gain.setValueAtTime(0.32, now);

    const breathSrc = ctx.createBufferSource();
    breathSrc.buffer = getLoopingNatureBuffer(ctx);
    breathSrc.loop = true;

    const breathFilter = ctx.createBiquadFilter();
    breathFilter.type = 'bandpass';
    breathFilter.frequency.setValueAtTime(440, now);
    breathFilter.Q.setValueAtTime(4.0, now);

    const breathGain = ctx.createGain();
    breathGain.gain.setValueAtTime(0.22, now);

    const neyLfo = ctx.createOscillator();
    const neyLfoGain = ctx.createGain();
    neyLfo.type = 'sine';
    neyLfo.frequency.setValueAtTime(0.18, now);
    neyLfoGain.gain.setValueAtTime(0.08, now);

    neyLfo.connect(neyLfoGain);
    neyLfoGain.connect(droneGain.gain);

    droneOsc1.connect(droneGain);
    droneOsc2.connect(droneGain);
    droneGain.connect(warmthFilter);

    breathSrc.connect(breathFilter);
    breathFilter.connect(breathGain);
    breathGain.connect(warmthFilter);

    droneOsc1.start(now);
    droneOsc2.start(now);
    breathSrc.start(now);
    neyLfo.start(now);
    primaryLfo = neyLfo;

    sourcesToStop.push(droneOsc1, droneOsc2, breathSrc, neyLfo);
    nodesToDisconnect.push(
      droneOsc1,
      droneOsc2,
      droneGain,
      breathSrc,
      breathFilter,
      breathGain,
      neyLfo,
      neyLfoGain
    );
  }

  return {
    profile,
    masterGain,
    warmthFilter,
    lfoOsc: primaryLfo,
    cleanup: () => {
      try {
        if (extraIntervalId !== null) {
          clearInterval(extraIntervalId);
          extraIntervalId = null;
        }
        const stopTime = ctx.currentTime + 0.15;
        masterGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.04);
        setTimeout(() => {
          sourcesToStop.forEach((s) => {
            try {
              s.stop();
            } catch {
              // Yoksay
            }
          });
          nodesToDisconnect.forEach((n) => {
            try {
              n.disconnect();
            } catch {
              // Yoksay
            }
          });
        }, Math.max(180, (stopTime - ctx.currentTime) * 1000));
      } catch {
        // Yoksay
      }
    },
  };
}

/**
 * Arka plan ambiyans sesini kullanıcı ayarlarına ve ses düzeyine göre başlatır, günceller veya durdurur.
 */
export function syncAmbientSoundscape(
  enabled: boolean,
  mode: AmbientSoundMode,
  themeId: ThemeId,
  volume = 0.35
): void {
  userVolume = Math.min(1, Math.max(0, volume));

  if (!enabled || userVolume <= 0.005) {
    stopAmbientSoundscape();
    return;
  }

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const targetProfile = resolveAmbientProfile(mode, themeId);

    if (activeAmbient && activeAmbient.profile === targetProfile) {
      applyDynamicFocusToAudio(ctx, false);
      ensureDecayLoop();
      return;
    }

    if (activeAmbient) {
      activeAmbient.cleanup();
      activeAmbient = null;
    }

    activeAmbient = buildAmbientGraph(ctx, targetProfile);
    applyDynamicFocusToAudio(ctx, false);
    ensureDecayLoop();
  } catch {
    // İlk kullanıcı etkileşiminde başlar
  }
}

/**
 * Kullanıcının her zikir dokunuşunda odak ritmini ölçer ve çevresel doğa sesini zikir ritmiyle senkronize dalgalandırır.
 */
export function pulseAmbientFocusRhythm(
  ambientEnabled: boolean,
  mode: AmbientSoundMode,
  themeId: ThemeId,
  volume = userVolume
): number {
  userVolume = Math.min(1, Math.max(0, volume));
  const nowMs = performance.now();
  const deltaMs = lastTapTimestamp > 0 ? nowMs - lastTapTimestamp : 1400;
  lastTapTimestamp = nowMs;

  if (deltaMs >= 350 && deltaMs <= 4200) {
    focusIntensity = Math.min(1.0, Math.max(0.42, focusIntensity + 0.14));
    const tapFreqHz = 1000 / deltaMs;
    rhythmCadenceHz = Math.min(0.75, Math.max(0.18, tapFreqHz * 0.45));
  } else if (deltaMs < 350) {
    focusIntensity = Math.min(0.92, Math.max(0.4, focusIntensity + 0.08));
    rhythmCadenceHz = 0.55;
  } else {
    focusIntensity = Math.max(0.42, focusIntensity);
    rhythmCadenceHz = 0.24;
  }

  if (ambientEnabled && userVolume > 0.005) {
    syncAmbientSoundscape(true, mode, themeId, userVolume);
    if (audioCtx && activeAmbient) {
      applyDynamicFocusToAudio(audioCtx, true);
    }
  }

  return focusIntensity;
}

/**
 * Arka plan ambiyans sesini yumuşakça kapatır.
 */
export function stopAmbientSoundscape(): void {
  if (activeAmbient) {
    activeAmbient.cleanup();
    activeAmbient = null;
  }
}

/**
 * Her zikir dokunuşunda:
 * 1) Gerçekçi, tok ve sıcak ahşap/kehribar boncuk değme sesi
 * 2) Arka planda çok hafif, samimi bir ney nefesi üretir.
 * (Ambiyans sesinden bağımsız olarak soundEnabled ile yönetilir)
 */
export function playBeadClickSound(enabled: boolean, isDividerBead = false): void {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // --- 1. KATMAN: İp Sürtünmesi ve Ahşap Dokunuş Dokusu (Bandpass Noise) ---
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = getSoftNoiseBuffer(ctx);

    const woodFilter = ctx.createBiquadFilter();
    woodFilter.type = 'bandpass';
    woodFilter.frequency.setValueAtTime(isDividerBead ? 680 : 520, now);
    woodFilter.Q.setValueAtTime(3.2, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.linearRampToValueAtTime(0.14, now + 0.005);
    noiseGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.048);

    noiseSrc.connect(woodFilter);
    woodFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noiseSrc.start(now);
    noiseSrc.stop(now + 0.055);

    // --- 2. KATMAN: Tok Zeytin Ağacı / Kehribar Gövde Rezonansı ---
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();

    const basePitch = isDividerBead ? 340 : 275 + (Math.random() * 14 - 7);
    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(basePitch, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(128, now + 0.044);

    bodyGain.gain.setValueAtTime(0.001, now);
    bodyGain.gain.linearRampToValueAtTime(0.18, now + 0.004);
    bodyGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.052);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);

    bodyOsc.start(now);
    bodyOsc.stop(now + 0.058);

    // İkinci sıcak ahşap armonik (Kehribar tınısı)
    const woodyHarmonic = ctx.createOscillator();
    const harmonicGain = ctx.createGain();

    woodyHarmonic.type = 'sine';
    woodyHarmonic.frequency.setValueAtTime(basePitch * 2.15, now);
    woodyHarmonic.frequency.exponentialRampToValueAtTime(240, now + 0.025);

    harmonicGain.gain.setValueAtTime(0.001, now);
    harmonicGain.gain.linearRampToValueAtTime(0.065, now + 0.002);
    harmonicGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.028);

    woodyHarmonic.connect(harmonicGain);
    harmonicGain.connect(ctx.destination);

    woodyHarmonic.start(now);
    woodyHarmonic.stop(now + 0.032);

    // --- 3. KATMAN: Samimi ve Huzurlu Ney / Seher Rüzgârı Nefesi ---
    const neyFreq = NEY_FREQUENCIES[stepMelodyIndex % NEY_FREQUENCIES.length];
    stepMelodyIndex++;

    const neyOsc = ctx.createOscillator();
    const neySubOsc = ctx.createOscillator();
    const neyFilter = ctx.createBiquadFilter();
    const neyGain = ctx.createGain();

    neyOsc.type = 'sine';
    neyOsc.frequency.setValueAtTime(neyFreq, now);
    neyOsc.frequency.exponentialRampToValueAtTime(neyFreq * 1.004, now + 0.25);

    neySubOsc.type = 'triangle';
    neySubOsc.frequency.setValueAtTime(neyFreq * 0.5, now);

    neyFilter.type = 'lowpass';
    neyFilter.frequency.setValueAtTime(620, now);

    neyGain.gain.setValueAtTime(0.0001, now);
    neyGain.gain.linearRampToValueAtTime(0.024, now + 0.08);
    neyGain.gain.exponentialRampToValueAtTime(0.0004, now + 0.52);

    neyOsc.connect(neyFilter);
    neySubOsc.connect(neyFilter);
    neyFilter.connect(neyGain);
    neyGain.connect(ctx.destination);

    neyOsc.start(now);
    neySubOsc.start(now);
    neyOsc.stop(now + 0.55);
    neySubOsc.stop(now + 0.55);
  } catch {
    // Ses donanımı kısıtlıysa sessizce devam et
  }
}

/**
 * Zikir hedefi tamamlandığında huzurlu, sıcak bir akustik ney/kanun akoru çalar.
 */
export function playCompletionChime(enabled: boolean): void {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [293.66, 369.99, 440.0, 587.33]; // Huzurlu Re Majör / Rast tınısı

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = now + idx * 0.13;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.075, startTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0004, startTime + 1.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 1.5);
    });
  } catch {
    // Sessizce devam et
  }
}

/**
 * Titreşim desteği bulunan mobil cihazlarda nazik dokunsal geri bildirim verir.
 */
export function triggerHaptic(enabled: boolean, pattern: number | number[] = 16): void {
  if (!enabled) return;
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Cihaz desteklemiyorsa yoksay
  }
}
