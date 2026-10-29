import { ThemeId } from '../data/dhikrs';
import { AmbientSoundMode } from './storage';

let audioCtx: AudioContext | null = null;
let masterCompressor: DynamicsCompressorNode | null = null;
let ambientDuckBus: GainNode | null = null;
let beadBus: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let longLoopBuffer: AudioBuffer | null = null;
let crispLoopBuffer: AudioBuffer | null = null;
let stepMelodyIndex = 0;
let unlockListenersAttached = false;

// Huzurlu Rast/Uşşak makamı esintili yumuşak ney frekans dizisi (Re4 - Mi4 - Fa#4 - Sol4 - La4)
const NEY_FREQUENCIES = [293.66, 329.63, 369.99, 392.0, 440.0, 392.0, 369.99, 329.63];

function attachAutoplayUnlockListeners(): void {
  if (unlockListenersAttached || typeof window === 'undefined') return;
  unlockListenersAttached = true;

  const unlock = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx
        .resume()
        .then(() => {
          if (audioCtx && activeAmbient) {
            applyBreathingEnvelopeToAudio(audioCtx, false, false);
          }
        })
        .catch(() => {
          // Yoksay
        });
    }
  };

  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock, { passive: true });
}

/**
 * AudioContext ve çakışma önleyici Master / Ducking ses kanallarını başlatır.
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  attachAutoplayUnlockListeners();

  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();

      masterCompressor = audioCtx.createDynamicsCompressor();
      masterCompressor.threshold.setValueAtTime(-12, audioCtx.currentTime);
      masterCompressor.knee.setValueAtTime(20, audioCtx.currentTime);
      masterCompressor.ratio.setValueAtTime(2.8, audioCtx.currentTime);
      masterCompressor.attack.setValueAtTime(0.006, audioCtx.currentTime);
      masterCompressor.release.setValueAtTime(0.22, audioCtx.currentTime);
      masterCompressor.connect(audioCtx.destination);

      ambientDuckBus = audioCtx.createGain();
      ambientDuckBus.gain.setValueAtTime(1.0, audioCtx.currentTime);
      ambientDuckBus.connect(masterCompressor);

      beadBus = audioCtx.createGain();
      beadBus.gain.setValueAtTime(1.0, audioCtx.currentTime);
      beadBus.connect(masterCompressor);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {
      // Kullanıcı etkileşimiyle otomatik devam eder
    });
  }
  return audioCtx;
}

function getAmbientOutputNode(ctx: AudioContext): AudioNode {
  return ambientDuckBus || masterCompressor || ctx.destination;
}

function getBeadOutputNode(ctx: AudioContext): AudioNode {
  return beadBus || masterCompressor || ctx.destination;
}

/**
 * Zikir boncuğu sesi çalarken ambiyans sesini 65ms boyunca %20 oranında yumuşakça geri çeker (mikro-ducking),
 * böylece ahşap boncuk sesiyle ambiyans sesi frekans/genlik olarak asla çakışmaz.
 */
function triggerAmbientMicroDuck(ctx: AudioContext): void {
  if (!ambientDuckBus || !activeAmbient) return;
  const now = ctx.currentTime;
  ambientDuckBus.gain.cancelScheduledValues(now);
  ambientDuckBus.gain.setTargetAtTime(0.78, now, 0.015);
  ambientDuckBus.gain.setTargetAtTime(1.0, now + 0.065, 0.16);
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

// Döngüsel rüzgâr ve su gövdesi için dolgun pembe gürültü tamponu (Net duyulabilir genlik)
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
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.16;
    b6 = white * 0.115926;
  }

  const fadeSamples = Math.floor(ctx.sampleRate * 0.2);
  for (let i = 0; i < fadeSamples; i++) {
    const ratio = i / fadeSamples;
    data[i] = data[i] * ratio + data[bufferSize - fadeSamples + i] * (1 - ratio);
  }

  longLoopBuffer = buffer;
  return buffer;
}

// Yağmur çisentisi ve yaprak hışırtısı için yüksek frekans zenginliğine sahip berrak doğa tamponu
function getCrispNatureBuffer(ctx: AudioContext): AudioBuffer {
  if (crispLoopBuffer) return crispLoopBuffer;
  const durationSeconds = 5;
  const bufferSize = Math.floor(ctx.sampleRate * durationSeconds);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let prev = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    // Hafif yumuşatılmış doğal beyaz/pembe hibrit doku (yağmur ve yaprak hışırtısı için)
    const sample = 0.65 * white + 0.35 * prev;
    prev = sample;
    data[i] = sample * 0.32;
  }

  const fadeSamples = Math.floor(ctx.sampleRate * 0.2);
  for (let i = 0; i < fadeSamples; i++) {
    const ratio = i / fadeSamples;
    data[i] = data[i] * ratio + data[bufferSize - fadeSamples + i] * (1 - ratio);
  }

  crispLoopBuffer = buffer;
  return buffer;
}

export type ActiveSoundProfile =
  | 'wind'
  | 'river'
  | 'ney'
  | 'rain'
  | 'birds'
  | 'night'
  | 'mountain_wind'
  | 'autumn_leaves'
  | 'ocean_waves'
  | 'winter_breeze';

/**
 * Seçili moda ve 11 ambiyans temasına göre aktif çevresel ses profilini belirler.
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
    case 'misty_mountain':
      return 'mountain_wind';
    case 'autumn_breeze':
      return 'autumn_leaves';
    case 'calm_seashore':
      return 'ocean_waves';
    case 'snowy_winter':
      return 'winter_breeze';
    default:
      return 'birds';
  }
}

// --- EMA (ÜSTEL HAREKETLİ ORTALAMA) RİTİM TAKİBİ VE NEFES ZARFI MOTORU ---

interface ActiveAmbientGraph {
  profile: ActiveSoundProfile;
  masterGain: GainNode;
  warmthFilter: BiquadFilterNode;
  lfoOsc: OscillatorNode;
  fadeOutAndCleanup: (fadeDurationSec?: number) => void;
}

const EMA_INTERVAL_ALPHA = 0.25; // Zikir hızı için EMA ağırlık katsayısı
const EMA_STABILITY_ALPHA = 0.22; // Ritim istikrarı için EMA ağırlık katsayısı

let activeAmbient: ActiveAmbientGraph | null = null;
let focusIntensity = 0.35; // 0.28 (net ve dingin başlangıç) -> 0.96 (derin tefekkür odağı)
let userVolume = 0.65; // 0.0 -> 1.0 (Varsayılan net ve huzurlu seviye: %65)
let emaIntervalMs = 1500; // EMA ile yumuşatılmış zikir dokunuş aralığı (ms)
let emaStability = 0.68; // 0.0 -> 1.0 arası ritim tutarlılığı
let rhythmCadenceHz = 0.18; // Nefes temposuna (0.12 Hz - 0.34 Hz) uyarlanmış LFO frekansı
let lastTapTimestamp = 0;
let decayIntervalId: number | null = null;

/**
 * Görsel 'Ritim Senkronizasyonu' için anlık EMA tempo çarpanını döndürür (0.88x - 1.42x).
 */
export function getCurrentRhythmTempoScale(): number {
  const speedFactor = Math.min(1.0, Math.max(0.0, (2200 - emaIntervalMs) / 1600));
  return Number((0.88 + focusIntensity * 0.34 + speedFactor * 0.2).toFixed(3));
}

/**
 * Ambiyans sesinin volume ve filtre değerlerini, EMA ile ölçülen nefes temposu zarfına (envelope)
 * ve pürüzsüz üstel geçişlere (setTargetAtTime) göre günceller.
 */
function applyBreathingEnvelopeToAudio(
  ctx: AudioContext,
  withBreathingPulse = false,
  isInitialFadeIn = false
): void {
  if (!activeAmbient) return;
  const now = ctx.currentTime;

  // Kullanıcının seçtiği ses düzeyi (0.0 - 1.0) ile net duyulabilir kazanç eğrisi
  const stabilityBonus = emaStability * 0.04;
  const volumeScale = Math.pow(Math.max(0, userVolume), 1.15);
  const rawBaseGain = 0.28 + focusIntensity * 0.28 + stabilityBonus;
  const baseTargetGain =
    userVolume <= 0.01 ? 0.0001 : Math.min(0.68, rawBaseGain * volumeScale);

  // EMA zikir hızına göre dinamik nefes alış (inhale) ve nefes veriş (exhale) süreleri
  const cycleSec = Math.min(3.4, Math.max(0.75, emaIntervalMs / 1000));
  const inhaleTimeConstant = Math.min(0.42, Math.max(0.18, cycleSec * 0.22));
  const exhaleDelaySec = Math.min(0.65, Math.max(0.28, cycleSec * 0.34));
  const exhaleTimeConstant = Math.min(0.95, Math.max(0.45, cycleSec * 0.48));

  const crestGain =
    withBreathingPulse && userVolume > 0.01
      ? Math.min(0.78, baseTargetGain * (1.16 + emaStability * 0.08))
      : baseTargetGain;

  activeAmbient.masterGain.gain.cancelScheduledValues(now);

  if (isInitialFadeIn) {
    activeAmbient.masterGain.gain.setValueAtTime(0.0001, now);
    activeAmbient.masterGain.gain.setTargetAtTime(baseTargetGain, now, 0.22);
  } else if (withBreathingPulse) {
    activeAmbient.masterGain.gain.setTargetAtTime(crestGain, now + 0.045, inhaleTimeConstant);
    activeAmbient.masterGain.gain.setTargetAtTime(
      baseTargetGain,
      now + 0.045 + exhaleDelaySec,
      exhaleTimeConstant
    );
  } else {
    activeAmbient.masterGain.gain.setTargetAtTime(baseTargetGain, now, 0.45);
  }

  // Filtre kesim frekansını doğa detaylarını boğmayacak şekilde geniş ve sıcak tut
  const baseCutoffMap: Record<ActiveSoundProfile, number> = {
    wind: 780,
    river: 1150,
    ney: 860,
    rain: 1850,
    birds: 1450,
    night: 720,
    mountain_wind: 920,
    autumn_leaves: 1580,
    ocean_waves: 1320,
    winter_breeze: 1080,
  };
  const baseCutoff = baseCutoffMap[activeAmbient.profile] || 950;
  const steadyCutoff = baseCutoff + focusIntensity * 520 + emaStability * 90;
  const pulseCutoff = steadyCutoff + (withBreathingPulse ? 140 : 0);

  activeAmbient.warmthFilter.frequency.cancelScheduledValues(now);
  activeAmbient.warmthFilter.frequency.setTargetAtTime(
    pulseCutoff,
    now,
    inhaleTimeConstant
  );
  if (withBreathingPulse) {
    activeAmbient.warmthFilter.frequency.setTargetAtTime(
      steadyCutoff,
      now + exhaleDelaySec,
      exhaleTimeConstant
    );
  }

  activeAmbient.lfoOsc.frequency.cancelScheduledValues(now);
  activeAmbient.lfoOsc.frequency.setTargetAtTime(rhythmCadenceHz, now, 0.8);
}

function ensureDecayLoop(): void {
  if (decayIntervalId !== null || typeof window === 'undefined') return;
  decayIntervalId = window.setInterval(() => {
    if (typeof document !== 'undefined' && document.hidden) return;
    const nowMs = performance.now();
    const idleMs = nowMs - lastTapTimestamp;
    if (idleMs > 3200 && focusIntensity > 0.28) {
      focusIntensity = Math.max(0.28, focusIntensity - 0.025);
      emaStability = Math.max(0.45, emaStability * 0.96);
      emaIntervalMs = Math.min(2200, emaIntervalMs * 1.04);
      rhythmCadenceHz = Math.max(0.13, rhythmCadenceHz * 0.95);
      if (audioCtx && activeAmbient) {
        applyBreathingEnvelopeToAudio(audioCtx, false, false);
      }
    }
  }, 800);
}

/**
 * Doğal iki/üç heceli kuş cıvıltısı sentezleyici (Doğa, Gün Doğumu ve Huzurlu Bahçe için)
 */
function triggerNaturalBirdSong(ctx: AudioContext, destination: AudioNode): void {
  const now = ctx.currentTime;
  const melodies = [
    [1567.98, 1975.53, 1760.0], // Sol6 - Si6 - La6
    [1318.51, 1661.22, 1975.53], // Mi6 - Sol#6 - Si6
    [1479.98, 1760.0, 1479.98], // Fa#6 - La6 - Fa#6
    [1760.0, 2093.0, 1975.53], // La6 - Do7 - Si6
  ];
  const phrase = melodies[Math.floor(Math.random() * melodies.length)];

  phrase.forEach((freq, idx) => {
    const start = now + idx * 0.13;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 0.94, start);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.05, start + 0.055);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.98, start + 0.11);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.12, start + 0.022);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(start);
    osc.stop(start + 0.13);
  });
}

function buildAmbientGraph(
  ctx: AudioContext,
  profile: ActiveSoundProfile
): ActiveAmbientGraph {
  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.0001, now);

  const warmthFilter = ctx.createBiquadFilter();
  warmthFilter.type = 'lowpass';
  warmthFilter.frequency.setValueAtTime(1200, now);

  warmthFilter.connect(masterGain);
  masterGain.connect(getAmbientOutputNode(ctx));

  const sourcesToStop: AudioScheduledSourceNode[] = [];
  const nodesToDisconnect: AudioNode[] = [masterGain, warmthFilter];
  let extraIntervalId: number | null = null;
  let primaryLfo: OscillatorNode;

  if (profile === 'birds') {
    // DOĞA / GÜN DOĞUMU / HUZURLU BAHÇE:
    // 1) Yumuşak vadi rüzgârı + 2) Ağaç yapraklarının hışırtısı + 3) Net kuş cıvıltıları
    const breezeSrc = ctx.createBufferSource();
    breezeSrc.buffer = getLoopingNatureBuffer(ctx);
    breezeSrc.loop = true;

    const breezeFilter = ctx.createBiquadFilter();
    breezeFilter.type = 'bandpass';
    breezeFilter.frequency.setValueAtTime(340, now);
    breezeFilter.Q.setValueAtTime(1.6, now);

    const breezeGain = ctx.createGain();
    breezeGain.gain.setValueAtTime(0.65, now);

    // Yaprak hışırtısı katmanı (Crisp Nature Buffer üzerinde modülasyonlu bandpass)
    const leafSrc = ctx.createBufferSource();
    leafSrc.buffer = getCrispNatureBuffer(ctx);
    leafSrc.loop = true;

    const leafFilter = ctx.createBiquadFilter();
    leafFilter.type = 'bandpass';
    leafFilter.frequency.setValueAtTime(1350, now);
    leafFilter.Q.setValueAtTime(1.8, now);

    const leafGain = ctx.createGain();
    leafGain.gain.setValueAtTime(0.28, now);

    const breezeLfo = ctx.createOscillator();
    const breezeLfoGain = ctx.createGain();
    const leafLfoGain = ctx.createGain();
    breezeLfo.type = 'sine';
    breezeLfo.frequency.setValueAtTime(0.18, now);
    breezeLfoGain.gain.setValueAtTime(110, now);
    leafLfoGain.gain.setValueAtTime(0.14, now);

    breezeLfo.connect(breezeLfoGain);
    breezeLfoGain.connect(breezeFilter.frequency);
    breezeLfo.connect(leafLfoGain);
    leafLfoGain.connect(leafGain.gain);

    breezeSrc.connect(breezeFilter);
    breezeFilter.connect(breezeGain);
    breezeGain.connect(warmthFilter);

    leafSrc.connect(leafFilter);
    leafFilter.connect(leafGain);
    leafGain.connect(masterGain);

    breezeSrc.start(now);
    leafSrc.start(now);
    breezeLfo.start(now);
    primaryLfo = breezeLfo;

    sourcesToStop.push(breezeSrc, leafSrc, breezeLfo);
    nodesToDisconnect.push(
      breezeSrc,
      breezeFilter,
      breezeGain,
      leafSrc,
      leafFilter,
      leafGain,
      breezeLfo,
      breezeLfoGain,
      leafLfoGain
    );

    // İlk kuş sesini 400ms sonra başlat ve düzenli aralıklarla tekrarla
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        if (audioCtx && audioCtx.state === 'running' && activeAmbient?.profile === 'birds') {
          triggerNaturalBirdSong(audioCtx, masterGain);
        }
      }, 450);

      extraIntervalId = window.setInterval(() => {
        try {
          if (!audioCtx || audioCtx.state !== 'running') return;
          if (typeof document !== 'undefined' && document.hidden) return;
          triggerNaturalBirdSong(audioCtx, masterGain);
        } catch {
          // Yoksay
        }
      }, 2400);
    }
  } else if (profile === 'rain') {
    // YAĞMURLU HAVA:
    // 1) Sıcak yağmur gövdesi + 2) Berrak yağmur şırıltısı + 3) Akustik su damlaları
    const warmRainSrc = ctx.createBufferSource();
    warmRainSrc.buffer = getLoopingNatureBuffer(ctx);
    warmRainSrc.loop = true;

    const warmRainFilter = ctx.createBiquadFilter();
    warmRainFilter.type = 'lowpass';
    warmRainFilter.frequency.setValueAtTime(620, now);

    const warmRainGain = ctx.createGain();
    warmRainGain.gain.setValueAtTime(0.65, now);

    // Berrak yağmur çisentisi (Crisp buffer doğrudan masterGain'e bağlanır)
    const patterSrc = ctx.createBufferSource();
    patterSrc.buffer = getCrispNatureBuffer(ctx);
    patterSrc.loop = true;

    const patterFilter = ctx.createBiquadFilter();
    patterFilter.type = 'bandpass';
    patterFilter.frequency.setValueAtTime(1480, now);
    patterFilter.Q.setValueAtTime(0.95, now);

    const patterGain = ctx.createGain();
    patterGain.gain.setValueAtTime(0.46, now);

    const rainLfo = ctx.createOscillator();
    const rainLfoGain = ctx.createGain();
    rainLfo.type = 'sine';
    rainLfo.frequency.setValueAtTime(0.2, now);
    rainLfoGain.gain.setValueAtTime(180, now);

    rainLfo.connect(rainLfoGain);
    rainLfoGain.connect(patterFilter.frequency);

    warmRainSrc.connect(warmRainFilter);
    warmRainFilter.connect(warmRainGain);
    warmRainGain.connect(warmthFilter);

    patterSrc.connect(patterFilter);
    patterFilter.connect(patterGain);
    patterGain.connect(masterGain);

    warmRainSrc.start(now);
    patterSrc.start(now);
    rainLfo.start(now);
    primaryLfo = rainLfo;

    sourcesToStop.push(warmRainSrc, patterSrc, rainLfo);
    nodesToDisconnect.push(
      warmRainSrc,
      warmRainFilter,
      warmRainGain,
      patterSrc,
      patterFilter,
      patterGain,
      rainLfo,
      rainLfoGain
    );

    // Net duyulabilir su damlası tınıları
    if (typeof window !== 'undefined') {
      const dropFreqs = [680, 790, 920, 1080, 1240];
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
          dropOsc.frequency.exponentialRampToValueAtTime(f * 1.38, t + 0.065);

          dropGain.gain.setValueAtTime(0.0001, t);
          dropGain.gain.linearRampToValueAtTime(0.095, t + 0.012);
          dropGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.095);

          dropOsc.connect(dropGain);
          dropGain.connect(masterGain);

          dropOsc.start(t);
          dropOsc.stop(t + 0.1);
        } catch {
          // Yoksay
        }
      }, 780);
    }
  } else if (profile === 'night') {
    // GECE AMBİYANSI:
    // 1) Hafif gece esintisi + 2) Dingin gece rezonansı + 3) Net gece böcekleri (cırcır böceği korosu)
    const nightAirSrc = ctx.createBufferSource();
    nightAirSrc.buffer = getLoopingNatureBuffer(ctx);
    nightAirSrc.loop = true;

    const nightFilter = ctx.createBiquadFilter();
    nightFilter.type = 'bandpass';
    nightFilter.frequency.setValueAtTime(290, now);
    nightFilter.Q.setValueAtTime(1.8, now);

    const nightAirGain = ctx.createGain();
    nightAirGain.gain.setValueAtTime(0.62, now);

    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(146.83, now);
    subGain.gain.setValueAtTime(0.18, now);

    const nightLfo = ctx.createOscillator();
    const nightLfoGain = ctx.createGain();
    nightLfo.type = 'sine';
    nightLfo.frequency.setValueAtTime(0.15, now);
    nightLfoGain.gain.setValueAtTime(75, now);

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

    // Gerçekçi ve net duyulan gece böceği (cricket) tınısı
    if (typeof window !== 'undefined') {
      const triggerCrickets = () => {
        if (!audioCtx || audioCtx.state !== 'running') return;
        const t = audioCtx.currentTime;
        [0, 0.075, 0.15].forEach((offset) => {
          if (!audioCtx) return;
          const osc = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(3450, t + offset);
          osc.frequency.exponentialRampToValueAtTime(3620, t + offset + 0.045);

          g.gain.setValueAtTime(0.0001, t + offset);
          g.gain.linearRampToValueAtTime(0.068, t + offset + 0.015);
          g.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.055);

          osc.connect(g);
          g.connect(masterGain);
          osc.start(t + offset);
          osc.stop(t + offset + 0.06);
        });
      };

      setTimeout(() => {
        if (activeAmbient?.profile === 'night') triggerCrickets();
      }, 400);

      extraIntervalId = window.setInterval(() => {
        try {
          if (typeof document !== 'undefined' && document.hidden) return;
          triggerCrickets();
        } catch {
          // Yoksay
        }
      }, 1850);
    }
  } else if (profile === 'wind') {
    // GÜN BATIMI / ESİNTİLİ VADİ: Yumuşak akşam rüzgârı + yaprak ve sakin su dokusu
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = getLoopingNatureBuffer(ctx);
    noiseSrc.loop = true;

    const windBand = ctx.createBiquadFilter();
    windBand.type = 'bandpass';
    windBand.frequency.setValueAtTime(320, now);
    windBand.Q.setValueAtTime(1.9, now);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.75, now);

    const shimmerSrc = ctx.createBufferSource();
    shimmerSrc.buffer = getCrispNatureBuffer(ctx);
    shimmerSrc.loop = true;

    const waterHintFilter = ctx.createBiquadFilter();
    waterHintFilter.type = 'bandpass';
    waterHintFilter.frequency.setValueAtTime(920, now);
    waterHintFilter.Q.setValueAtTime(2.2, now);

    const waterHintGain = ctx.createGain();
    waterHintGain.gain.setValueAtTime(0.28, now);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.17, now);
    lfoGain.gain.setValueAtTime(135, now);

    lfo.connect(lfoGain);
    lfoGain.connect(windBand.frequency);

    noiseSrc.connect(windBand);
    windBand.connect(windGain);
    windGain.connect(warmthFilter);

    shimmerSrc.connect(waterHintFilter);
    waterHintFilter.connect(waterHintGain);
    waterHintGain.connect(masterGain);

    noiseSrc.start(now);
    shimmerSrc.start(now);
    lfo.start(now);
    primaryLfo = lfo;
    sourcesToStop.push(noiseSrc, shimmerSrc, lfo);
    nodesToDisconnect.push(
      noiseSrc,
      windBand,
      windGain,
      shimmerSrc,
      waterHintFilter,
      waterHintGain,
      lfo,
      lfoGain
    );
  } else if (profile === 'river') {
    // AY IŞIĞINDA DOĞA / HUZURLU ŞADIRVAN: Berrak su dalgası ve şadırvan akışı
    const streamSrc = ctx.createBufferSource();
    streamSrc.buffer = getLoopingNatureBuffer(ctx);
    streamSrc.loop = true;

    const waterBodyFilter = ctx.createBiquadFilter();
    waterBodyFilter.type = 'lowpass';
    waterBodyFilter.frequency.setValueAtTime(540, now);

    const waterBodyGain = ctx.createGain();
    waterBodyGain.gain.setValueAtTime(0.68, now);

    const rippleSrc = ctx.createBufferSource();
    rippleSrc.buffer = getCrispNatureBuffer(ctx);
    rippleSrc.loop = true;

    const rippleFilter = ctx.createBiquadFilter();
    rippleFilter.type = 'bandpass';
    rippleFilter.frequency.setValueAtTime(1120, now);
    rippleFilter.Q.setValueAtTime(1.8, now);

    const rippleGain = ctx.createGain();
    rippleGain.gain.setValueAtTime(0.38, now);

    const waterLfo = ctx.createOscillator();
    const waterLfoGain = ctx.createGain();
    waterLfo.type = 'sine';
    waterLfo.frequency.setValueAtTime(0.24, now);
    waterLfoGain.gain.setValueAtTime(220, now);

    waterLfo.connect(waterLfoGain);
    waterLfoGain.connect(rippleFilter.frequency);

    streamSrc.connect(waterBodyFilter);
    waterBodyFilter.connect(waterBodyGain);
    waterBodyGain.connect(warmthFilter);

    rippleSrc.connect(rippleFilter);
    rippleFilter.connect(rippleGain);
    rippleGain.connect(masterGain);

    streamSrc.start(now);
    rippleSrc.start(now);
    waterLfo.start(now);
    primaryLfo = waterLfo;
    sourcesToStop.push(streamSrc, rippleSrc, waterLfo);
    nodesToDisconnect.push(
      streamSrc,
      waterBodyFilter,
      waterBodyGain,
      rippleSrc,
      rippleFilter,
      rippleGain,
      waterLfo,
      waterLfoGain
    );
  } else if (profile === 'mountain_wind') {
    // SİSLİ DAĞ ZİRVESİ:
    // 1) Derin vadi rüzgârı + 2) Yüksek irtifa kristal esintisi + 3) Uzak vadi kuş yankısı
    const valleyWindSrc = ctx.createBufferSource();
    valleyWindSrc.buffer = getLoopingNatureBuffer(ctx);
    valleyWindSrc.loop = true;

    const valleyFilter = ctx.createBiquadFilter();
    valleyFilter.type = 'bandpass';
    valleyFilter.frequency.setValueAtTime(260, now);
    valleyFilter.Q.setValueAtTime(2.1, now);

    const valleyGain = ctx.createGain();
    valleyGain.gain.setValueAtTime(0.76, now);

    const ridgeBreezeSrc = ctx.createBufferSource();
    ridgeBreezeSrc.buffer = getCrispNatureBuffer(ctx);
    ridgeBreezeSrc.loop = true;

    const ridgeFilter = ctx.createBiquadFilter();
    ridgeFilter.type = 'bandpass';
    ridgeFilter.frequency.setValueAtTime(760, now);
    ridgeFilter.Q.setValueAtTime(2.4, now);

    const ridgeGain = ctx.createGain();
    ridgeGain.gain.setValueAtTime(0.28, now);

    const mtnLfo = ctx.createOscillator();
    const mtnLfoGain = ctx.createGain();
    mtnLfo.type = 'sine';
    mtnLfo.frequency.setValueAtTime(0.14, now);
    mtnLfoGain.gain.setValueAtTime(95, now);

    mtnLfo.connect(mtnLfoGain);
    mtnLfoGain.connect(valleyFilter.frequency);

    valleyWindSrc.connect(valleyFilter);
    valleyFilter.connect(valleyGain);
    valleyGain.connect(warmthFilter);

    ridgeBreezeSrc.connect(ridgeFilter);
    ridgeFilter.connect(ridgeGain);
    ridgeGain.connect(masterGain);

    valleyWindSrc.start(now);
    ridgeBreezeSrc.start(now);
    mtnLfo.start(now);
    primaryLfo = mtnLfo;

    sourcesToStop.push(valleyWindSrc, ridgeBreezeSrc, mtnLfo);
    nodesToDisconnect.push(
      valleyWindSrc,
      valleyFilter,
      valleyGain,
      ridgeBreezeSrc,
      ridgeFilter,
      ridgeGain,
      mtnLfo,
      mtnLfoGain
    );

    // Uzak vadi yankılı dağ kuşu sesi
    if (typeof window !== 'undefined') {
      extraIntervalId = window.setInterval(() => {
        try {
          if (!audioCtx || audioCtx.state !== 'running') return;
          if (typeof document !== 'undefined' && document.hidden) return;
          const t = audioCtx.currentTime;
          const osc = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1174.66, t); // Re6
          osc.frequency.exponentialRampToValueAtTime(987.77, t + 0.36); // Si5

          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(0.075, t + 0.05);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);

          osc.connect(g);
          g.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.45);
        } catch {
          // Yoksay
        }
      }, 3600);
    }
  } else if (profile === 'autumn_leaves') {
    // SONBAHAR ESİNTİSİ:
    // 1) Ilık sonbahar rüzgârı + 2) Belirgin kuru akçaağaç yaprak hışırtısı + 3) Orman kuşları
    const warmWindSrc = ctx.createBufferSource();
    warmWindSrc.buffer = getLoopingNatureBuffer(ctx);
    warmWindSrc.loop = true;

    const warmWindFilter = ctx.createBiquadFilter();
    warmWindFilter.type = 'bandpass';
    warmWindFilter.frequency.setValueAtTime(340, now);
    warmWindFilter.Q.setValueAtTime(1.7, now);

    const warmWindGain = ctx.createGain();
    warmWindGain.gain.setValueAtTime(0.64, now);

    // Kuru sonbahar yaprağı hışırtısı (Crisp buffer + LFO kabarması)
    const dryLeafSrc = ctx.createBufferSource();
    dryLeafSrc.buffer = getCrispNatureBuffer(ctx);
    dryLeafSrc.loop = true;

    const dryLeafFilter = ctx.createBiquadFilter();
    dryLeafFilter.type = 'bandpass';
    dryLeafFilter.frequency.setValueAtTime(1620, now);
    dryLeafFilter.Q.setValueAtTime(1.4, now);

    const dryLeafGain = ctx.createGain();
    dryLeafGain.gain.setValueAtTime(0.42, now);

    const autumnLfo = ctx.createOscillator();
    const autumnFreqGain = ctx.createGain();
    const autumnAmpGain = ctx.createGain();
    autumnLfo.type = 'sine';
    autumnLfo.frequency.setValueAtTime(0.22, now);
    autumnFreqGain.gain.setValueAtTime(280, now);
    autumnAmpGain.gain.setValueAtTime(0.18, now);

    autumnLfo.connect(autumnFreqGain);
    autumnFreqGain.connect(dryLeafFilter.frequency);
    autumnLfo.connect(autumnAmpGain);
    autumnAmpGain.connect(dryLeafGain.gain);

    warmWindSrc.connect(warmWindFilter);
    warmWindFilter.connect(warmWindGain);
    warmWindGain.connect(warmthFilter);

    dryLeafSrc.connect(dryLeafFilter);
    dryLeafFilter.connect(dryLeafGain);
    dryLeafGain.connect(masterGain);

    warmWindSrc.start(now);
    dryLeafSrc.start(now);
    autumnLfo.start(now);
    primaryLfo = autumnLfo;

    sourcesToStop.push(warmWindSrc, dryLeafSrc, autumnLfo);
    nodesToDisconnect.push(
      warmWindSrc,
      warmWindFilter,
      warmWindGain,
      dryLeafSrc,
      dryLeafFilter,
      dryLeafGain,
      autumnLfo,
      autumnFreqGain,
      autumnAmpGain
    );

    if (typeof window !== 'undefined') {
      extraIntervalId = window.setInterval(() => {
        try {
          if (!audioCtx || audioCtx.state !== 'running') return;
          if (typeof document !== 'undefined' && document.hidden) return;
          triggerNaturalBirdSong(audioCtx, masterGain);
        } catch {
          // Yoksay
        }
      }, 3100);
    }
  } else if (profile === 'ocean_waves') {
    // SAKİN DENİZ KIYISI:
    // 1) Ritmik kıyıya vurup çekilen deniz dalgası + 2) Köpük şırıltısı + 3) Uzak martı/sahil tınısı
    const waveBodySrc = ctx.createBufferSource();
    waveBodySrc.buffer = getLoopingNatureBuffer(ctx);
    waveBodySrc.loop = true;

    const waveBodyFilter = ctx.createBiquadFilter();
    waveBodyFilter.type = 'lowpass';
    waveBodyFilter.frequency.setValueAtTime(480, now);

    const waveBodyGain = ctx.createGain();
    waveBodyGain.gain.setValueAtTime(0.68, now);

    const foamSrc = ctx.createBufferSource();
    foamSrc.buffer = getCrispNatureBuffer(ctx);
    foamSrc.loop = true;

    const foamFilter = ctx.createBiquadFilter();
    foamFilter.type = 'bandpass';
    foamFilter.frequency.setValueAtTime(1180, now);
    foamFilter.Q.setValueAtTime(1.2, now);

    const foamGain = ctx.createGain();
    foamGain.gain.setValueAtTime(0.32, now);

    // Kıyı dalgası ritim LFO'su (dalganın kıyıya gelişi ve çekilişi)
    const waveLfo = ctx.createOscillator();
    const waveCutoffGain = ctx.createGain();
    const foamSwellGain = ctx.createGain();
    waveLfo.type = 'sine';
    waveLfo.frequency.setValueAtTime(0.14, now);
    waveCutoffGain.gain.setValueAtTime(240, now);
    foamSwellGain.gain.setValueAtTime(0.22, now);

    waveLfo.connect(waveCutoffGain);
    waveCutoffGain.connect(waveBodyFilter.frequency);
    waveLfo.connect(foamSwellGain);
    foamSwellGain.connect(foamGain.gain);

    waveBodySrc.connect(waveBodyFilter);
    waveBodyFilter.connect(waveBodyGain);
    waveBodyGain.connect(warmthFilter);

    foamSrc.connect(foamFilter);
    foamFilter.connect(foamGain);
    foamGain.connect(masterGain);

    waveBodySrc.start(now);
    foamSrc.start(now);
    waveLfo.start(now);
    primaryLfo = waveLfo;

    sourcesToStop.push(waveBodySrc, foamSrc, waveLfo);
    nodesToDisconnect.push(
      waveBodySrc,
      waveBodyFilter,
      waveBodyGain,
      foamSrc,
      foamFilter,
      foamGain,
      waveLfo,
      waveCutoffGain,
      foamSwellGain
    );

    // Uzak kıyı martısı ve su damlası tınısı
    if (typeof window !== 'undefined') {
      extraIntervalId = window.setInterval(() => {
        try {
          if (!audioCtx || audioCtx.state !== 'running') return;
          if (typeof document !== 'undefined' && document.hidden) return;
          const t = audioCtx.currentTime;
          const gullOsc = audioCtx.createOscillator();
          const gullGain = audioCtx.createGain();
          gullOsc.type = 'sine';
          gullOsc.frequency.setValueAtTime(1480, t);
          gullOsc.frequency.exponentialRampToValueAtTime(1720, t + 0.09);
          gullOsc.frequency.exponentialRampToValueAtTime(1240, t + 0.28);

          gullGain.gain.setValueAtTime(0.0001, t);
          gullGain.gain.linearRampToValueAtTime(0.065, t + 0.04);
          gullGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);

          gullOsc.connect(gullGain);
          gullGain.connect(masterGain);
          gullOsc.start(t);
          gullOsc.stop(t + 0.35);
        } catch {
          // Yoksay
        }
      }, 3400);
    }
  } else if (profile === 'winter_breeze') {
    // KARLI KIŞ SABAHI:
    // 1) Dingin kış sabahı esintisi + 2) İnce çam iğnesi hışırtısı + 3) Kristal kar tınısı
    const winterAirSrc = ctx.createBufferSource();
    winterAirSrc.buffer = getLoopingNatureBuffer(ctx);
    winterAirSrc.loop = true;

    const winterFilter = ctx.createBiquadFilter();
    winterFilter.type = 'bandpass';
    winterFilter.frequency.setValueAtTime(310, now);
    winterFilter.Q.setValueAtTime(2.0, now);

    const winterAirGain = ctx.createGain();
    winterAirGain.gain.setValueAtTime(0.62, now);

    const pineWhisperSrc = ctx.createBufferSource();
    pineWhisperSrc.buffer = getCrispNatureBuffer(ctx);
    pineWhisperSrc.loop = true;

    const pineFilter = ctx.createBiquadFilter();
    pineFilter.type = 'bandpass';
    pineFilter.frequency.setValueAtTime(1040, now);
    pineFilter.Q.setValueAtTime(2.4, now);

    const pineGain = ctx.createGain();
    pineGain.gain.setValueAtTime(0.24, now);

    const winterLfo = ctx.createOscillator();
    const winterLfoGain = ctx.createGain();
    winterLfo.type = 'sine';
    winterLfo.frequency.setValueAtTime(0.15, now);
    winterLfoGain.gain.setValueAtTime(85, now);

    winterLfo.connect(winterLfoGain);
    winterLfoGain.connect(winterFilter.frequency);

    winterAirSrc.connect(winterFilter);
    winterFilter.connect(winterAirGain);
    winterAirGain.connect(warmthFilter);

    pineWhisperSrc.connect(pineFilter);
    pineFilter.connect(pineGain);
    pineGain.connect(masterGain);

    winterAirSrc.start(now);
    pineWhisperSrc.start(now);
    winterLfo.start(now);
    primaryLfo = winterLfo;

    sourcesToStop.push(winterAirSrc, pineWhisperSrc, winterLfo);
    nodesToDisconnect.push(
      winterAirSrc,
      winterFilter,
      winterAirGain,
      pineWhisperSrc,
      pineFilter,
      pineGain,
      winterLfo,
      winterLfoGain
    );

    // Kristal buz/kar parıltısı tınısı
    if (typeof window !== 'undefined') {
      const crystalNotes = [1046.5, 1318.51, 1567.98, 1975.53]; // Do6 - Mi6 - Sol6 - Si6
      extraIntervalId = window.setInterval(() => {
        try {
          if (!audioCtx || audioCtx.state !== 'running') return;
          if (typeof document !== 'undefined' && document.hidden) return;
          const t = audioCtx.currentTime;
          const note = crystalNotes[Math.floor(Math.random() * crystalNotes.length)];
          const osc = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(note, t);

          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(0.055, t + 0.03);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);

          osc.connect(g);
          g.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.7);
        } catch {
          // Yoksay
        }
      }, 2800);
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

    droneGain.gain.setValueAtTime(0.42, now);

    const breathSrc = ctx.createBufferSource();
    breathSrc.buffer = getLoopingNatureBuffer(ctx);
    breathSrc.loop = true;

    const breathFilter = ctx.createBiquadFilter();
    breathFilter.type = 'bandpass';
    breathFilter.frequency.setValueAtTime(480, now);
    breathFilter.Q.setValueAtTime(3.2, now);

    const breathGain = ctx.createGain();
    breathGain.gain.setValueAtTime(0.36, now);

    const neyLfo = ctx.createOscillator();
    const neyLfoGain = ctx.createGain();
    neyLfo.type = 'sine';
    neyLfo.frequency.setValueAtTime(0.18, now);
    neyLfoGain.gain.setValueAtTime(0.09, now);

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
    fadeOutAndCleanup: (fadeDurationSec = 0.6) => {
      try {
        if (extraIntervalId !== null) {
          clearInterval(extraIntervalId);
          extraIntervalId = null;
        }
        const nowTime = ctx.currentTime;
        const timeConstant = Math.max(0.08, fadeDurationSec / 3.2);
        masterGain.gain.cancelScheduledValues(nowTime);
        masterGain.gain.setTargetAtTime(0.0001, nowTime, timeConstant);
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
        }, Math.round(fadeDurationSec * 1000) + 60);
      } catch {
        // Yoksay
      }
    },
  };
}

/**
 * Arka plan ambiyans sesini kullanıcı ayarlarına ve ses düzeyine göre başlatır,
 * profil değişimlerinde 600ms pürüzsüz crossfade uygular veya durdurur.
 */
export function syncAmbientSoundscape(
  enabled: boolean,
  mode: AmbientSoundMode,
  themeId: ThemeId,
  volume = 0.65
): void {
  userVolume = Math.min(1, Math.max(0, volume));

  if (!enabled || userVolume <= 0.005) {
    stopAmbientSoundscape();
    return;
  }

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {
        // Kullanıcı etkileşimiyle açılır
      });
    }

    const targetProfile = resolveAmbientProfile(mode, themeId);

    if (activeAmbient && activeAmbient.profile === targetProfile) {
      applyBreathingEnvelopeToAudio(ctx, false, false);
      ensureDecayLoop();
      return;
    }

    const previousAmbient = activeAmbient;
    if (previousAmbient) {
      previousAmbient.fadeOutAndCleanup(0.6);
      activeAmbient = null;
    }

    activeAmbient = buildAmbientGraph(ctx, targetProfile);
    applyBreathingEnvelopeToAudio(ctx, false, true);
    ensureDecayLoop();
  } catch {
    // İlk kullanıcı etkileşiminde başlar
  }
}

/**
 * Kullanıcının zikir hızını çift katmanlı Üstel Hareketli Ortalama (EMA) algoritmasıyla takip eder
 * ve ambiyans sesini nefes temposu zarfıyla (envelope) pürüzsüzce dalgalandırır.
 */
export function pulseAmbientFocusRhythm(
  ambientEnabled: boolean,
  mode: AmbientSoundMode,
  themeId: ThemeId,
  volume = userVolume
): number {
  userVolume = Math.min(1, Math.max(0, volume));
  const nowMs = performance.now();
  const rawDeltaMs = lastTapTimestamp > 0 ? nowMs - lastTapTimestamp : emaIntervalMs;
  lastTapTimestamp = nowMs;

  // 1. Zikir aralığı için Üstel Hareketli Ortalama (EMA) güncellemesi
  const clampedDelta = Math.min(3800, Math.max(380, rawDeltaMs));
  const prevEma = emaIntervalMs;
  emaIntervalMs =
    (1 - EMA_INTERVAL_ALPHA) * emaIntervalMs + EMA_INTERVAL_ALPHA * clampedDelta;

  // 2. Ritim tutarlılığı (stability) için EMA güncellemesi
  const relativeDeviation = Math.min(
    1.0,
    Math.abs(clampedDelta - prevEma) / Math.max(350, prevEma)
  );
  const instantStability = Math.max(0, 1.0 - relativeDeviation);
  emaStability =
    (1 - EMA_STABILITY_ALPHA) * emaStability + EMA_STABILITY_ALPHA * instantStability;

  // 3. Odak yoğunluğunu EMA tutarlılığına göre yumuşakça artır
  if (rawDeltaMs >= 350 && rawDeltaMs <= 4200) {
    const stepGain = 0.065 + emaStability * 0.045;
    focusIntensity = Math.min(0.96, Math.max(0.38, focusIntensity + stepGain));
  } else if (rawDeltaMs < 350) {
    focusIntensity = Math.min(0.88, Math.max(0.36, focusIntensity + 0.04));
  } else {
    focusIntensity = Math.max(0.36, focusIntensity);
  }

  // 4. EMA zikir hızını doğal nefes temposuna (0.12 Hz - 0.34 Hz) dönüştür
  const emaTapHz = 1000 / emaIntervalMs;
  rhythmCadenceHz = Math.min(0.34, Math.max(0.12, emaTapHz * 0.22));

  if (ambientEnabled && userVolume > 0.005) {
    syncAmbientSoundscape(true, mode, themeId, userVolume);
    if (audioCtx && activeAmbient) {
      applyBreathingEnvelopeToAudio(audioCtx, true, false);
    }
  }

  return getCurrentRhythmTempoScale();
}

/**
 * Arka plan ambiyans sesini 450ms yumuşak fade-out ile kapatır.
 */
export function stopAmbientSoundscape(): void {
  if (activeAmbient) {
    activeAmbient.fadeOutAndCleanup(0.45);
    activeAmbient = null;
  }
}

/**
 * Her zikir dokunuşunda:
 * 1) Ambiyans sesine 65ms mikro-ducking uygulayarak frekans/genlik çakışmasını önler
 * 2) Gerçekçi, tok ve sıcak ahşap/kehribar boncuk değme sesi üretir
 * 3) Arka planda çok hafif, samimi bir ney nefesi üretir.
 */
export function playBeadClickSound(enabled: boolean, isDividerBead = false): void {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const outputNode = getBeadOutputNode(ctx);

    triggerAmbientMicroDuck(ctx);

    // --- 1. KATMAN: İp Sürtünmesi ve Ahşap Dokunuş Dokusu (Bandpass Noise) ---
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = getSoftNoiseBuffer(ctx);

    const woodFilter = ctx.createBiquadFilter();
    woodFilter.type = 'bandpass';
    woodFilter.frequency.setValueAtTime(isDividerBead ? 680 : 520, now);
    woodFilter.Q.setValueAtTime(3.2, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.linearRampToValueAtTime(0.135, now + 0.005);
    noiseGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.048);

    noiseSrc.connect(woodFilter);
    woodFilter.connect(noiseGain);
    noiseGain.connect(outputNode);

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
    bodyGain.gain.linearRampToValueAtTime(0.175, now + 0.004);
    bodyGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.052);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(outputNode);

    bodyOsc.start(now);
    bodyOsc.stop(now + 0.058);

    // İkinci sıcak ahşap armonik (Kehribar tınısı)
    const woodyHarmonic = ctx.createOscillator();
    const harmonicGain = ctx.createGain();

    woodyHarmonic.type = 'sine';
    woodyHarmonic.frequency.setValueAtTime(basePitch * 2.15, now);
    woodyHarmonic.frequency.exponentialRampToValueAtTime(240, now + 0.025);

    harmonicGain.gain.setValueAtTime(0.001, now);
    harmonicGain.gain.linearRampToValueAtTime(0.062, now + 0.002);
    harmonicGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.028);

    woodyHarmonic.connect(harmonicGain);
    harmonicGain.connect(outputNode);

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
    neyGain.gain.linearRampToValueAtTime(0.022, now + 0.08);
    neyGain.gain.exponentialRampToValueAtTime(0.0004, now + 0.52);

    neyOsc.connect(neyFilter);
    neySubOsc.connect(neyFilter);
    neyFilter.connect(neyGain);
    neyGain.connect(outputNode);

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
    const outputNode = getBeadOutputNode(ctx);
    triggerAmbientMicroDuck(ctx);

    const notes = [293.66, 369.99, 440.0, 587.33]; // Huzurlu Re Majör / Rast tınısı

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = now + idx * 0.13;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.072, startTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0004, startTime + 1.45);

      osc.connect(gain);
      gain.connect(outputNode);

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
