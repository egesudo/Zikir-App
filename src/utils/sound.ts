import { ThemeId } from '../data/dhikrs';
import { AmbientSoundMode } from './storage';

let audioCtx: AudioContext | null = null;
let masterCompressor: DynamicsCompressorNode | null = null;
let masterLimiter: WaveShaperNode | null = null;
let ambientClarityFilter: BiquadFilterNode | null = null;
let ambientDuckBus: GainNode | null = null;
let beadBus: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let longLoopBuffer: AudioBuffer | null = null;
let crispLoopBuffer: AudioBuffer | null = null;
let stepMelodyIndex = 0;
let unlockListenersAttached = false;
let lastAccentTriggerTimestamp = 0;

// Huzurlu Rast/Uşşak makamı esintili yumuşak ney frekans dizisi (Re4 - Mi4 - Fa#4 - Sol4 - La4)
const NEY_FREQUENCIES = [293.66, 329.63, 369.99, 392.0, 440.0, 392.0, 369.99, 329.63];

/**
 * Hiperbolik tanjant yumuşak satürasyon eğrisi (Sıfır kırpılma, sıfır hoparlör patlaması).
 */
function makeSoftSaturationCurve(samples = 1024): Float32Array {
  const buffer = new ArrayBuffer(samples * 4);
  const curve = new Float32Array(buffer);
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = Math.tanh(x * 1.08);
  }
  return curve;
}

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
 * AudioContext, Akustik Netlik Filtresi, Master Kompresör ve Tepe Engelleyici Sınırlayıcıyı başlatır.
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

      // Ultra sakin ve pürüzsüz dinamik dengeleyici (-20 dBFS eşik, 32 dB yumuşak diz, 24ms koruyucu attack)
      masterCompressor = audioCtx.createDynamicsCompressor();
      masterCompressor.threshold.setValueAtTime(-20, audioCtx.currentTime);
      masterCompressor.knee.setValueAtTime(32, audioCtx.currentTime);
      masterCompressor.ratio.setValueAtTime(2.5, audioCtx.currentTime);
      masterCompressor.attack.setValueAtTime(0.024, audioCtx.currentTime);
      masterCompressor.release.setValueAtTime(0.35, audioCtx.currentTime);

      // Sıfır kırpılma ve sıfır patlama koruyucusu: Hiperbolik tanjant akustik sınırlayıcı
      masterLimiter = audioCtx.createWaveShaper();
      masterLimiter.curve = makeSoftSaturationCurve(1024) as Float32Array<ArrayBuffer>;
      masterLimiter.oversample = '2x';

      masterCompressor.connect(masterLimiter);
      masterLimiter.connect(audioCtx.destination);

      // Kristal netlikte ses diyagramı ve tiz sertliği giderici Akustik Filtre (High-shelf 4800Hz, -3.2dB)
      ambientClarityFilter = audioCtx.createBiquadFilter();
      ambientClarityFilter.type = 'highshelf';
      ambientClarityFilter.frequency.setValueAtTime(4800, audioCtx.currentTime);
      ambientClarityFilter.gain.setValueAtTime(-3.2, audioCtx.currentTime);

      ambientDuckBus = audioCtx.createGain();
      ambientDuckBus.gain.setValueAtTime(1.0, audioCtx.currentTime);

      // Ambiyans akış zinciri: Üreteçler -> ambientClarityFilter -> ambientDuckBus -> masterCompressor -> masterLimiter
      ambientClarityFilter.connect(ambientDuckBus);
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
  return ambientClarityFilter || ambientDuckBus || masterCompressor || ctx.destination;
}

function getBeadOutputNode(ctx: AudioContext): AudioNode {
  return beadBus || masterCompressor || ctx.destination;
}

/**
 * Zikir boncuğu sesi çalarken ambiyans sesini yumuşakça geri çeker (mikro-ducking),
 * böylece ahşap boncuk tınısı ile ambiyans doğa katmanları frekans ve genlik olarak asla çakışmaz.
 */
function triggerAmbientMicroDuck(ctx: AudioContext): void {
  if (!ambientDuckBus || !activeAmbient) return;
  const now = ctx.currentTime;
  ambientDuckBus.gain.cancelScheduledValues(now);
  ambientDuckBus.gain.setTargetAtTime(0.72, now, 0.015);
  ambientDuckBus.gain.setTargetAtTime(1.0, now + 0.075, 0.18);
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
  | 'ney'
  | 'kanun'
  | 'oud'
  | 'kalimba'
  | 'ambient_pad';

/**
 * Seçili moda ve 11 ambiyans temasına göre aktif akustik enstrüman profilini belirler.
 */
export function resolveAmbientProfile(
  mode: AmbientSoundMode,
  themeId: ThemeId
): ActiveSoundProfile {
  if (mode !== 'auto') {
    return mode;
  }
  switch (themeId) {
    case 'nature':
    case 'sunrise':
    case 'peaceful_garden':
      return 'ney';
    case 'rainy':
    case 'moonlit_nature':
    case 'calm_seashore':
      return 'kanun';
    case 'sunset':
    case 'misty_mountain':
      return 'oud';
    case 'autumn_breeze':
    case 'snowy_winter':
      return 'kalimba';
    case 'night':
    default:
      return 'ambient_pad';
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
let userVolume = 0.20; // 0.0 -> 1.0 (Kullanıcı tercihi doğrultusunda huzurlu kısık seviye: %20)
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

  // Kullanıcının seçtiği kısık ses düzeyi (%20) ile fısıltı düzeyinde sakinleştirici taban kazancı
  // Ani ses patlaması, yüksek giriş ve tepe taşması kesinlikle önlenir
  const volumeScale = Math.pow(Math.max(0, userVolume), 1.25);
  const rawBaseGain = 0.082 + focusIntensity * 0.014;
  const baseTargetGain =
    userVolume <= 0.005 ? 0.00001 : Math.min(0.048, rawBaseGain * volumeScale);

  // Arka plan müziğinde rahatsız edici ani ses sıçramalarını önlemek için sabit ve dinlendirici akış
  const crestGain = baseTargetGain;

  activeAmbient.masterGain.gain.cancelScheduledValues(now);

  if (isInitialFadeIn) {
    // 3 saniyelik ipeksi ve kesintisiz başlangıç (3-Second Silk Fade-In) - sıfır patlama, sıfır süreksizlik
    activeAmbient.masterGain.gain.setValueAtTime(0.00001, now);
    activeAmbient.masterGain.gain.setTargetAtTime(
      Math.max(0.00001, baseTargetGain),
      now,
      0.95
    );
  } else if (withBreathingPulse) {
    activeAmbient.masterGain.gain.setTargetAtTime(crestGain, now, 0.4);
  } else {
    // Profil veya ses düzeyi güncellenirken yumuşak geçiş
    activeAmbient.masterGain.gain.setTargetAtTime(baseTargetGain, now, 0.45);
  }

  // Filtre kesim frekansını tiz sertliği ve patlamayı önleyecek şekilde sıcak ve kadife tut
  const baseCutoffMap: Record<ActiveSoundProfile, number> = {
    ney: 580,
    kanun: 680,
    oud: 520,
    kalimba: 720,
    ambient_pad: 420,
  };
  const baseCutoff = baseCutoffMap[activeAmbient.profile] || 560;
  const steadyCutoff = baseCutoff + focusIntensity * 120 + emaStability * 40;
  const pulseCutoff = steadyCutoff;

  activeAmbient.warmthFilter.frequency.cancelScheduledValues(now);
  activeAmbient.warmthFilter.frequency.setTargetAtTime(
    pulseCutoff,
    now,
    0.45
  );
  // Sabit ve dinlendirici sıcak filtre kesimi korunur

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
      focusIntensity = Math.max(0.28, focusIntensity - 0.02);
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
 * Doğal iki/üç heceli fısıltı düzeyinde kuş cıvıltısı sentezleyici (Doğa, Gün Doğumu ve Huzurlu Bahçe için)
 */
function triggerNaturalBirdSong(ctx: AudioContext, destination: AudioNode): void {
  const now = ctx.currentTime;
  // Çok sık tetiklenmeyi engelleyen akıllı koruyucu (minimum 7 saniye aralık)
  if (now - lastAccentTriggerTimestamp < 7.0) return;
  lastAccentTriggerTimestamp = now;

  const melodies = [
    [1567.98, 1975.53, 1760.0], // Sol6 - Si6 - La6
    [1318.51, 1661.22, 1975.53], // Mi6 - Sol#6 - Si6
    [1479.98, 1760.0, 1479.98], // Fa#6 - La6 - Fa#6
    [1760.0, 2093.0, 1975.53], // La6 - Do7 - Si6
  ];
  const phrase = melodies[Math.floor(Math.random() * melodies.length)];

  phrase.forEach((freq, idx) => {
    const start = now + idx * 0.16;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 0.94, start);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.03, start + 0.065);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.98, start + 0.13);

    // Fısıltı düzeyinde sakinleştirici derinlik (0.032 tepe kazancı)
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.032, start + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(start);
    osc.stop(start + 0.15);
  });
}

// --- İÇ HUZURU DERİNLEŞTİREN AKUSTİK ENSTRÜMAN VE MAKAMSAL MOTİF MOTORU ---

// Rast / Uşşak makamında huzur veren nağmeler (Re4 - Mi4 - Fa#4 - Sol4 - La4 - Si4 - Do5 - Re5)
const MAQAM_RAST_SCALE = [
  293.66, // Re4
  329.63, // Mi4
  369.99, // Fa#4
  392.0,  // Sol4
  440.0,  // La4
  493.88, // Si4
  523.25, // Do5
  587.33, // Re5
];

// Nihavend makamında akşam ve yağmur tefekkürüne uygun dingin nağmeler
const MAQAM_NIHAVEND_SCALE = [
  261.63, // Do4
  293.66, // Re4
  311.13, // Mib4
  349.23, // Fa4
  392.0,  // Sol4
  415.3,  // Lab4
  493.88, // Si4
  523.25, // Do5
];

/**
 * Akustik kanun mızrap dokunuşu ve tel rezonansı sentezleyici.
 * Fiziksel sönümlenme eğrisi ve tını gövdesi rezonatörü ile su gibi berrak akustik ses üretir.
 */
function playGentleKanunPluck(
  ctx: AudioContext,
  destination: AudioNode,
  frequency: number,
  startTime: number,
  velocity = 0.016
): void {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const pluckGain = ctx.createGain();

  // Ana tel titreşimi (Triangle) ve hafif armonik parlaklık (Sine 2x + mikro-detune)
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(frequency, startTime);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(frequency * 2.002, startTime);

  // Gövde kutusu rezonansı (Bandpass filtre ~2.2kHz yerine sıcak 1.4kHz)
  const bodyFilter = ctx.createBiquadFilter();
  bodyFilter.type = 'bandpass';
  bodyFilter.frequency.setValueAtTime(Math.min(1800, frequency * 1.5), startTime);
  bodyFilter.Q.setValueAtTime(2.2, startTime);

  // Kanun tel sönümlenme zarfı (4ms mızrap vuruşu, 1.2s fısıltı sönüş)
  pluckGain.gain.setValueAtTime(0.00001, startTime);
  pluckGain.gain.linearRampToValueAtTime(velocity, startTime + 0.004);
  pluckGain.gain.exponentialRampToValueAtTime(velocity * 0.32, startTime + 0.2);
  pluckGain.gain.exponentialRampToValueAtTime(0.00001, startTime + 1.25);

  osc1.connect(bodyFilter);
  osc2.connect(bodyFilter);
  bodyFilter.connect(pluckGain);
  pluckGain.connect(destination);

  osc1.start(startTime);
  osc2.start(startTime);
  osc1.stop(startTime + 1.3);
  osc2.stop(startTime + 1.3);
}

/**
 * Zikir esnasında sakinleştirici 3-4 notalık kanun arpej dizeleri çalar.
 */
function triggerGentleKanunPhrase(
  ctx: AudioContext,
  destination: AudioNode,
  scale: number[] = MAQAM_RAST_SCALE
): void {
  const now = ctx.currentTime;
  const motifs = [
    [0, 2, 4, 3], // Re -> Fa# -> La -> Sol
    [3, 4, 6, 7], // Sol -> La -> Do -> Re
    [4, 3, 1, 0], // La -> Sol -> Mi -> Re
    [1, 3, 4, 3], // Mi -> Sol -> La -> Sol
  ];
  const motif = motifs[Math.floor(Math.random() * motifs.length)];
  const noteDuration = 0.32; // Akıcı ve çok sakin arpej adımı

  motif.forEach((degree, idx) => {
    const freq = scale[degree % scale.length];
    const t = now + idx * noteDuration;
    const vel = idx === 0 ? 0.013 : idx === motif.length - 1 ? 0.010 : 0.016;
    playGentleKanunPluck(ctx, destination, freq, t, vel);
  });
}

/**
 * Dinlendirici ney nağmesi sentezleyici (doğal nefes, portamento nota kayması ve yumuşak vibrato).
 */
function triggerPeacefulNeyPhrase(
  ctx: AudioContext,
  destination: AudioNode,
  scale: number[] = MAQAM_RAST_SCALE
): void {
  const now = ctx.currentTime;
  const phrases = [
    [scale[0], scale[1], scale[3], scale[0]], // Re -> Mi -> Sol -> Re
    [scale[3], scale[4], scale[6], scale[4]], // Sol -> La -> Do -> Sol
    [scale[4], scale[3], scale[2], scale[0]], // La -> Sol -> Fa# -> Re
    [scale[0], scale[3], scale[4], scale[3]], // Re -> Sol -> La -> Sol
  ];
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];

  const osc = ctx.createOscillator();
  const breathOsc = ctx.createOscillator();
  const vibratoLfo = ctx.createOscillator();
  const vibratoGain = ctx.createGain();
  const neyGain = ctx.createGain();
  const neyFilter = ctx.createBiquadFilter();

  osc.type = 'triangle';
  breathOsc.type = 'sine';

  neyFilter.type = 'lowpass';
  neyFilter.frequency.setValueAtTime(850, now);
  neyFilter.Q.setValueAtTime(1.6, now);

  // Doğal Ney vibratosu (4.2 Hz, hafif dalgalanma)
  vibratoLfo.frequency.setValueAtTime(4.2, now);
  vibratoGain.gain.setValueAtTime(0.0, now);
  vibratoGain.gain.linearRampToValueAtTime(2.2, now + 0.8);
  vibratoLfo.connect(vibratoGain);
  vibratoGain.connect(osc.frequency);

  let currentTime = now;
  osc.frequency.setValueAtTime(phrase[0], currentTime);
  breathOsc.frequency.setValueAtTime(phrase[0] * 2, currentTime);

  const stepDuration = 0.95; // Sakin, nefes derinliğinde nota süresi
  phrase.forEach((note, idx) => {
    if (idx > 0) {
      osc.frequency.setTargetAtTime(note, currentTime, 0.18);
      breathOsc.frequency.setTargetAtTime(note * 2, currentTime, 0.18);
    }
    currentTime += stepDuration;
  });

  const totalDuration = phrase.length * stepDuration;

  // Sıfır patlama korumalı yumuşak nefes zarfı (0.35s attack, 0.9s release, tepe 0.016)
  neyGain.gain.setValueAtTime(0.00001, now);
  neyGain.gain.linearRampToValueAtTime(0.016, now + 0.35);
  neyGain.gain.setValueAtTime(0.016, now + totalDuration - 0.75);
  neyGain.gain.exponentialRampToValueAtTime(0.00001, now + totalDuration);

  osc.connect(neyFilter);
  breathOsc.connect(neyFilter);
  neyFilter.connect(neyGain);
  neyGain.connect(destination);

  osc.start(now);
  breathOsc.start(now);
  vibratoLfo.start(now);

  const stopTime = now + totalDuration + 0.1;
  osc.stop(stopTime);
  breathOsc.stop(stopTime);
  vibratoLfo.stop(stopTime);
}

/**
 * Akustik Ud ve Tanbur sıcak ahşap mızrap tınısı sentezleyici.
 * Tok gövde rezonansı ve pes frekans derinliğiyle iç huzuru artıran kadife tını üretir.
 */
function playGentleOudPluck(
  ctx: AudioContext,
  destination: AudioNode,
  frequency: number,
  startTime: number,
  velocity = 0.018
): void {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const pluckGain = ctx.createGain();

  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(frequency, startTime);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(frequency * 1.996, startTime);

  const bodyFilter = ctx.createBiquadFilter();
  bodyFilter.type = 'bandpass';
  bodyFilter.frequency.setValueAtTime(Math.min(950, frequency * 1.4), startTime);
  bodyFilter.Q.setValueAtTime(2.2, startTime);

  pluckGain.gain.setValueAtTime(0.00001, startTime);
  pluckGain.gain.linearRampToValueAtTime(velocity, startTime + 0.006);
  pluckGain.gain.exponentialRampToValueAtTime(velocity * 0.4, startTime + 0.28);
  pluckGain.gain.exponentialRampToValueAtTime(0.00001, startTime + 1.25);

  osc1.connect(bodyFilter);
  osc2.connect(bodyFilter);
  bodyFilter.connect(pluckGain);
  pluckGain.connect(destination);

  osc1.start(startTime);
  osc2.start(startTime);
  osc1.stop(startTime + 1.3);
  osc2.stop(startTime + 1.3);
}

function triggerGentleOudPhrase(
  ctx: AudioContext,
  destination: AudioNode,
  scale: number[] = MAQAM_RAST_SCALE
): void {
  const now = ctx.currentTime;
  const motifs = [
    [0, 1, 3, 0], // Re -> Mi -> Sol -> Re
    [3, 4, 3, 1], // Sol -> La -> Sol -> Mi
    [0, 3, 4, 3], // Re -> Sol -> La -> Sol
    [4, 3, 1, 0], // La -> Sol -> Mi -> Re
  ];
  const motif = motifs[Math.floor(Math.random() * motifs.length)];
  const noteDuration = 0.38;

  motif.forEach((degree, idx) => {
    const baseFreq = scale[degree % scale.length];
    const freq = baseFreq > 360 ? baseFreq * 0.5 : baseFreq;
    const t = now + idx * noteDuration;
    const vel = idx === 0 ? 0.015 : idx === motif.length - 1 ? 0.012 : 0.018;
    playGentleOudPluck(ctx, destination, freq, t, vel);
  });
}

/**
 * Dingin kalimba (başparmak piyanosu) kristal çan tınısı sentezleyici.
 */
function playGentleKalimbaNote(
  ctx: AudioContext,
  destination: AudioNode,
  frequency: number,
  startTime: number,
  velocity = 0.016
): void {
  const tineOsc = ctx.createOscillator();
  const overtoneOsc = ctx.createOscillator();
  const tineGain = ctx.createGain();
  const overtoneGain = ctx.createGain();
  const masterPluck = ctx.createGain();

  tineOsc.type = 'sine';
  tineOsc.frequency.setValueAtTime(frequency, startTime);

  overtoneOsc.type = 'sine';
  overtoneOsc.frequency.setValueAtTime(frequency * 3.16, startTime);

  overtoneGain.gain.setValueAtTime(0.00001, startTime);
  overtoneGain.gain.linearRampToValueAtTime(velocity * 0.45, startTime + 0.003);
  overtoneGain.gain.exponentialRampToValueAtTime(0.00001, startTime + 0.055);

  tineGain.gain.setValueAtTime(0.00001, startTime);
  tineGain.gain.linearRampToValueAtTime(velocity, startTime + 0.004);
  tineGain.gain.exponentialRampToValueAtTime(velocity * 0.35, startTime + 0.35);
  tineGain.gain.exponentialRampToValueAtTime(0.00001, startTime + 1.45);

  tineOsc.connect(tineGain);
  overtoneOsc.connect(overtoneGain);
  tineGain.connect(masterPluck);
  overtoneGain.connect(masterPluck);
  masterPluck.connect(destination);

  tineOsc.start(startTime);
  overtoneOsc.start(startTime);
  tineOsc.stop(startTime + 1.5);
  overtoneOsc.stop(startTime + 0.06);
}

function triggerGentleKalimbaPhrase(
  ctx: AudioContext,
  destination: AudioNode,
  scale: number[] = MAQAM_RAST_SCALE
): void {
  const now = ctx.currentTime;
  const motifs = [
    [0, 2, 4], // Re -> Fa# -> La
    [3, 5, 7], // Sol -> Si -> Re5
    [4, 2, 0], // La -> Fa# -> Re
    [1, 3, 5], // Mi -> Sol -> Si
  ];
  const motif = motifs[Math.floor(Math.random() * motifs.length)];
  const noteDuration = 0.40;

  motif.forEach((degree, idx) => {
    const freq = scale[degree % scale.length];
    const t = now + idx * noteDuration;
    const vel = idx === motif.length - 1 ? 0.012 : 0.016;
    playGentleKalimbaNote(ctx, destination, freq, t, vel);
  });
}

/**
 * Sıcak ve derin ambient pad zemin akoru (432 Hz referanslı, nefes döngüsüyle hareketlenen kadife tını).
 */
function createWarmAmbientPad(
  ctx: AudioContext,
  destination: AudioNode,
  baseFreq = 146.83, // Re3
  sourcesToStop: AudioScheduledSourceNode[] = [],
  nodesToDisconnect: AudioNode[] = []
): OscillatorNode {
  const now = ctx.currentTime;
  const padOsc1 = ctx.createOscillator();
  const padOsc2 = ctx.createOscillator();
  const padOsc3 = ctx.createOscillator();
  const padGain = ctx.createGain();

  padOsc1.type = 'sine';
  padOsc1.frequency.setValueAtTime(baseFreq, now); // Kök (Re)

  padOsc2.type = 'triangle';
  padOsc2.frequency.setValueAtTime(baseFreq * 1.5, now); // Beşli (La)

  padOsc3.type = 'sine';
  padOsc3.frequency.setValueAtTime(baseFreq * 2.002, now); // Oktav + koro hissi

  const padFilter = ctx.createBiquadFilter();
  padFilter.type = 'lowpass';
  padFilter.frequency.setValueAtTime(260, now);
  padFilter.Q.setValueAtTime(1.0, now);

  const padLfo = ctx.createOscillator();
  const padLfoGain = ctx.createGain();
  padLfo.type = 'sine';
  padLfo.frequency.setValueAtTime(0.08, now);
  padLfoGain.gain.setValueAtTime(45, now);
  padLfo.connect(padLfoGain);
  padLfoGain.connect(padFilter.frequency);

  padGain.gain.setValueAtTime(0.14, now);

  padOsc1.connect(padFilter);
  padOsc2.connect(padFilter);
  padOsc3.connect(padFilter);
  padFilter.connect(padGain);
  padGain.connect(destination);

  padOsc1.start(now);
  padOsc2.start(now);
  padOsc3.start(now);
  padLfo.start(now);

  sourcesToStop.push(padOsc1, padOsc2, padOsc3, padLfo);
  nodesToDisconnect.push(
    padOsc1,
    padOsc2,
    padOsc3,
    padFilter,
    padGain,
    padLfo,
    padLfoGain
  );

  return padLfo;
}

/**
 * 12-16 saniyede bir seyrek, fısıltı düzeyinde ve dinlendirici melodik dizeleri çalan zamanlayıcı.
 */
function attachPeriodicMelodicPhrase(
  profile: ActiveSoundProfile,
  masterGain: GainNode,
  intervalIds: number[]
): void {
  if (typeof window === 'undefined') return;

  const runMelodicMotif = () => {
    try {
      if (!audioCtx || audioCtx.state !== 'running') return;
      if (typeof document !== 'undefined' && document.hidden) return;
      if (!activeAmbient || activeAmbient.profile !== profile) return;

      switch (profile) {
        case 'ney':
          triggerPeacefulNeyPhrase(audioCtx, masterGain, MAQAM_RAST_SCALE);
          break;
        case 'kanun':
          triggerGentleKanunPhrase(audioCtx, masterGain, MAQAM_RAST_SCALE);
          break;
        case 'oud':
          triggerGentleOudPhrase(audioCtx, masterGain, MAQAM_RAST_SCALE);
          break;
        case 'kalimba':
          triggerGentleKalimbaPhrase(audioCtx, masterGain, MAQAM_RAST_SCALE);
          break;
        case 'ambient_pad':
        default:
          if (Math.random() > 0.5) {
            triggerPeacefulNeyPhrase(audioCtx, masterGain, MAQAM_NIHAVEND_SCALE);
          } else {
            triggerGentleKalimbaPhrase(audioCtx, masterGain, MAQAM_RAST_SCALE);
          }
          break;
      }
    } catch {
      // Yoksay
    }
  };

  // İpeksi 3 saniyelik fade-in tamamlandıktan sonra ilk motifi 4.5 saniyede başlat
  const initialTimer = window.setTimeout(runMelodicMotif, 4500);
  // Sonrasında her 13.5 saniyede bir (12-16 sn aralığında) fısıltı düzeyinde sakin bir nağme
  const periodicInterval = window.setInterval(runMelodicMotif, 13500);

  intervalIds.push(initialTimer, periodicInterval);
}

function buildAmbientGraph(
  ctx: AudioContext,
  profile: ActiveSoundProfile
): ActiveAmbientGraph {
  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.0001, now);

  const warmthFilter = ctx.createBiquadFilter();
  warmthFilter.type = "lowpass";
  warmthFilter.frequency.setValueAtTime(1000, now);

  warmthFilter.connect(masterGain);
  masterGain.connect(getAmbientOutputNode(ctx));

  const sourcesToStop: AudioScheduledSourceNode[] = [];
  const nodesToDisconnect: AudioNode[] = [masterGain, warmthFilter];
  const activeIntervalIds: number[] = [];
  let primaryLfo: OscillatorNode;

  // --- DOĞAL TEMEL HAT: Durgun seher yeli ve uzak fısıltı kuş sesleri ---
  const dawnWindSrc = ctx.createBufferSource();
  dawnWindSrc.buffer = getLoopingNatureBuffer(ctx);
  dawnWindSrc.loop = true;

  const dawnWindFilter = ctx.createBiquadFilter();
  dawnWindFilter.type = "lowpass";
  dawnWindFilter.frequency.setValueAtTime(240, now);

  const dawnWindGain = ctx.createGain();
  dawnWindGain.gain.setValueAtTime(0.08, now);

  const dawnWindLfo = ctx.createOscillator();
  const dawnWindLfoGain = ctx.createGain();
  dawnWindLfo.type = "sine";
  dawnWindLfo.frequency.setValueAtTime(0.12, now);
  dawnWindLfoGain.gain.setValueAtTime(0.02, now);
  dawnWindLfo.connect(dawnWindLfoGain);
  dawnWindLfoGain.connect(dawnWindGain.gain);

  dawnWindSrc.connect(dawnWindFilter);
  dawnWindFilter.connect(dawnWindGain);
  dawnWindGain.connect(warmthFilter);

  dawnWindSrc.start(now);
  dawnWindLfo.start(now);

  sourcesToStop.push(dawnWindSrc, dawnWindLfo);
  nodesToDisconnect.push(
    dawnWindSrc,
    dawnWindFilter,
    dawnWindGain,
    dawnWindLfo,
    dawnWindLfoGain
  );

  // Uzak fısıltı kuş sesleri (18 saniyede bir seyrek)
  if (typeof window !== "undefined") {
    const dawnBirdTimer = window.setTimeout(() => {
      if (audioCtx && audioCtx.state === "running" && activeAmbient) {
        triggerNaturalBirdSong(audioCtx, masterGain);
      }
    }, 4500);
    const dawnBirdInterval = window.setInterval(() => {
      try {
        if (!audioCtx || audioCtx.state !== "running") return;
        if (typeof document !== "undefined" && document.hidden) return;
        triggerNaturalBirdSong(audioCtx, masterGain);
      } catch {
        // Yoksay
      }
    }, 18000);
    activeIntervalIds.push(dawnBirdTimer, dawnBirdInterval);
  }

  // --- 5 AKUSTİK ENSTRÜMAN SES ALTYAPISI ---
  if (profile === "ney") {
    // 1. HAFİF NEY: Re3 (146.83 Hz) ve La3 (220 Hz) sıcak nefes dem katmanı
    const droneOsc1 = ctx.createOscillator();
    const droneOsc2 = ctx.createOscillator();
    const droneGain = ctx.createGain();

    droneOsc1.type = "sine";
    droneOsc1.frequency.setValueAtTime(146.83, now);

    droneOsc2.type = "triangle";
    droneOsc2.frequency.setValueAtTime(220.0, now);

    droneGain.gain.setValueAtTime(0.12, now);

    const breathSrc = ctx.createBufferSource();
    breathSrc.buffer = getLoopingNatureBuffer(ctx);
    breathSrc.loop = true;

    const breathFilter = ctx.createBiquadFilter();
    breathFilter.type = "bandpass";
    breathFilter.frequency.setValueAtTime(460, now);
    breathFilter.Q.setValueAtTime(3.0, now);

    const breathGain = ctx.createGain();
    breathGain.gain.setValueAtTime(0.08, now);

    const neyLfo = ctx.createOscillator();
    const neyLfoGain = ctx.createGain();
    neyLfo.type = "sine";
    neyLfo.frequency.setValueAtTime(0.16, now);
    neyLfoGain.gain.setValueAtTime(0.04, now);

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
  } else if (profile === "kanun") {
    // 2. ZARİF KANUN: Su damlası akışında tel tınısı alt zemini
    primaryLfo = createWarmAmbientPad(
      ctx,
      warmthFilter,
      130.81,
      sourcesToStop,
      nodesToDisconnect
    );

    const kanunBedSrc = ctx.createBufferSource();
    kanunBedSrc.buffer = getCrispNatureBuffer(ctx);
    kanunBedSrc.loop = true;

    const kanunBedFilter = ctx.createBiquadFilter();
    kanunBedFilter.type = "bandpass";
    kanunBedFilter.frequency.setValueAtTime(640, now);
    kanunBedFilter.Q.setValueAtTime(2.0, now);

    const kanunBedGain = ctx.createGain();
    kanunBedGain.gain.setValueAtTime(0.06, now);

    kanunBedSrc.connect(kanunBedFilter);
    kanunBedFilter.connect(kanunBedGain);
    kanunBedGain.connect(masterGain);

    kanunBedSrc.start(now);
    sourcesToStop.push(kanunBedSrc);
    nodesToDisconnect.push(kanunBedSrc, kanunBedFilter, kanunBedGain);
  } else if (profile === "oud") {
    // 3. SAKİN UD & TANBUR: Derin ahşap tekne ve sıcak pes dem tınısı
    const oudDroneOsc = ctx.createOscillator();
    const oudDroneGain = ctx.createGain();
    oudDroneOsc.type = "sine";
    oudDroneOsc.frequency.setValueAtTime(98.0, now);
    oudDroneGain.gain.setValueAtTime(0.10, now);

    const oudAirSrc = ctx.createBufferSource();
    oudAirSrc.buffer = getLoopingNatureBuffer(ctx);
    oudAirSrc.loop = true;
    const oudAirFilter = ctx.createBiquadFilter();
    oudAirFilter.type = "lowpass";
    oudAirFilter.frequency.setValueAtTime(240, now);
    const oudAirGain = ctx.createGain();
    oudAirGain.gain.setValueAtTime(0.06, now);

    const oudLfo = ctx.createOscillator();
    oudLfo.type = "sine";
    oudLfo.frequency.setValueAtTime(0.14, now);
    const oudLfoGain = ctx.createGain();
    oudLfoGain.gain.setValueAtTime(0.03, now);
    oudLfo.connect(oudLfoGain);
    oudLfoGain.connect(oudDroneGain.gain);

    oudDroneOsc.connect(oudDroneGain);
    oudDroneGain.connect(warmthFilter);
    oudAirSrc.connect(oudAirFilter);
    oudAirFilter.connect(oudAirGain);
    oudAirGain.connect(warmthFilter);

    oudDroneOsc.start(now);
    oudAirSrc.start(now);
    oudLfo.start(now);
    primaryLfo = oudLfo;

    sourcesToStop.push(oudDroneOsc, oudAirSrc, oudLfo);
    nodesToDisconnect.push(
      oudDroneOsc,
      oudDroneGain,
      oudAirSrc,
      oudAirFilter,
      oudAirGain,
      oudLfo,
      oudLfoGain
    );
  } else if (profile === "kalimba") {
    // 4. DİNGİN KALİMBA: Meditatif kristal çan ve duru zemin
    primaryLfo = createWarmAmbientPad(
      ctx,
      warmthFilter,
      146.83,
      sourcesToStop,
      nodesToDisconnect
    );

    const kalimbaAirSrc = ctx.createBufferSource();
    kalimbaAirSrc.buffer = getCrispNatureBuffer(ctx);
    kalimbaAirSrc.loop = true;
    const kalimbaAirFilter = ctx.createBiquadFilter();
    kalimbaAirFilter.type = "bandpass";
    kalimbaAirFilter.frequency.setValueAtTime(720, now);
    kalimbaAirFilter.Q.setValueAtTime(2.2, now);
    const kalimbaAirGain = ctx.createGain();
    kalimbaAirGain.gain.setValueAtTime(0.05, now);

    kalimbaAirSrc.connect(kalimbaAirFilter);
    kalimbaAirFilter.connect(kalimbaAirGain);
    kalimbaAirGain.connect(masterGain);

    kalimbaAirSrc.start(now);
    sourcesToStop.push(kalimbaAirSrc);
    nodesToDisconnect.push(kalimbaAirSrc, kalimbaAirFilter, kalimbaAirGain);
  } else {
    // 5. SICAK AMBIENT PAD: 432 Hz kadife akor zemini
    primaryLfo = createWarmAmbientPad(
      ctx,
      warmthFilter,
      146.83,
      sourcesToStop,
      nodesToDisconnect
    );

    const padAirSrc = ctx.createBufferSource();
    padAirSrc.buffer = getLoopingNatureBuffer(ctx);
    padAirSrc.loop = true;

    const padAirFilter = ctx.createBiquadFilter();
    padAirFilter.type = "lowpass";
    padAirFilter.frequency.setValueAtTime(220, now);

    const padAirGain = ctx.createGain();
    padAirGain.gain.setValueAtTime(0.07, now);

    padAirSrc.connect(padAirFilter);
    padAirFilter.connect(padAirGain);
    padAirGain.connect(warmthFilter);

    padAirSrc.start(now);
    sourcesToStop.push(padAirSrc);
    nodesToDisconnect.push(padAirSrc, padAirFilter, padAirGain);
  }

  // Tüm ambiyans profillerine fısıltı düzeyinde, 12-16 saniyede bir seyrek çalan melodik motif dizelerini ekle
  attachPeriodicMelodicPhrase(profile, masterGain, activeIntervalIds);

  return {
    profile,
    masterGain,
    warmthFilter,
    lfoOsc: primaryLfo,
    fadeOutAndCleanup: (fadeDurationSec = 1.2) => {
      try {
        activeIntervalIds.forEach((id) => {
          clearInterval(id);
          clearTimeout(id);
        });
        activeIntervalIds.length = 0;
        const nowTime = ctx.currentTime;
        const timeConstant = Math.max(0.12, fadeDurationSec / 3.4);
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
        }, Math.round(fadeDurationSec * 1000) + 80);
      } catch {
        // Yoksay
      }
    },
  };
}

/**
 * Arka plan ambiyans sesini kullanıcı ayarlarına ve ses düzeyine göre başlatır,
 * profil değişimlerinde 1.2 saniyelik pürüzsüz ipeksi crossfade uygular veya durdurur.
 */
export function syncAmbientSoundscape(
  enabled: boolean,
  mode: AmbientSoundMode,
  themeId: ThemeId,
  volume = 0.20
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
      // 1.2 saniyelik yumuşak crossfade
      previousAmbient.fadeOutAndCleanup(1.2);
      activeAmbient = null;
    }

    activeAmbient = buildAmbientGraph(ctx, targetProfile);
    // Yeni profil 1.5s ipeksi fade-in ile açılır
    applyBreathingEnvelopeToAudio(ctx, false, true);
    ensureDecayLoop();
  } catch {
    // İlk kullanıcı etkileşiminde başlar
  }
}

/**
 * Kullanıcının zikir hızını çift katmanlı Üstel Hareketli Ortalama (EMA) algoritmasıyla takip eder
 * ve ambiyans sesini nefes temposu zarfıyla (envelope) ultra sakin sınırlar içinde dalgalandırır.
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

  // 3. Odak yoğunluğunu ultra sakin sınırlar içinde tut (asla gürültü patlaması yapmaz)
  if (rawDeltaMs >= 350 && rawDeltaMs <= 4200) {
    const stepGain = 0.025 + emaStability * 0.02;
    focusIntensity = Math.min(0.68, Math.max(0.32, focusIntensity + stepGain));
  } else if (rawDeltaMs < 350) {
    focusIntensity = Math.min(0.62, Math.max(0.30, focusIntensity + 0.015));
  } else {
    focusIntensity = Math.max(0.30, focusIntensity);
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
 * Arka plan ambiyans sesini 850ms yumuşak fade-out ile kapatır.
 */
export function stopAmbientSoundscape(): void {
  if (activeAmbient) {
    activeAmbient.fadeOutAndCleanup(0.85);
    activeAmbient = null;
  }
}

/**
 * Her zikir dokunuşunda:
 * 1) Ambiyans sesine 65ms mikro-ducking uygulayarak frekans/genlik çakışmasını önler
 * 2) Gerçekçi, tok ve sıcak ahşap/kehribar boncuk değme sesi üretir
 * 3) Arka planda seçili enstrümana özgü fısıltı seviyesinde zarif bir mikro-tını verir.
 */
export function playBeadClickSound(
  enabled: boolean,
  isDividerBead = false,
  activeMode: AmbientSoundMode = 'auto'
): void {
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
    woodFilter.frequency.setValueAtTime(isDividerBead ? 520 : 380, now);
    woodFilter.Q.setValueAtTime(2.6, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.linearRampToValueAtTime(0.035, now + 0.005);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    noiseSrc.connect(woodFilter);
    woodFilter.connect(noiseGain);
    noiseGain.connect(outputNode);

    noiseSrc.start(now);
    noiseSrc.stop(now + 0.05);

    // --- 2. KATMAN: Tok Zeytin Ağacı / Kehribar Gövde Rezonansı ---
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();

    const basePitch = isDividerBead ? 310 : 255 + (Math.random() * 8 - 4);
    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(basePitch, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(118, now + 0.042);

    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.linearRampToValueAtTime(0.052, now + 0.004);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.048);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(outputNode);

    bodyOsc.start(now);
    bodyOsc.stop(now + 0.052);

    // İkinci sıcak ahşap armonik (Yumuşak Kehribar tınısı)
    const woodyHarmonic = ctx.createOscillator();
    const harmonicGain = ctx.createGain();

    woodyHarmonic.type = 'sine';
    woodyHarmonic.frequency.setValueAtTime(basePitch * 1.95, now);
    woodyHarmonic.frequency.exponentialRampToValueAtTime(220, now + 0.024);

    harmonicGain.gain.setValueAtTime(0.0001, now);
    harmonicGain.gain.linearRampToValueAtTime(0.016, now + 0.002);
    harmonicGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.026);

    woodyHarmonic.connect(harmonicGain);
    harmonicGain.connect(outputNode);

    woodyHarmonic.start(now);
    woodyHarmonic.stop(now + 0.03);

    // --- 3. KATMAN: Seçili Enstrümana Özgü Fısıltı Seviyesinde Mikro-Tını ---
    if (activeMode === 'kanun') {
      // Kanun: Zarif ve hafif tel tınısı (Re5, fısıltı düzeyi 0.007)
      playGentleKanunPluck(ctx, outputNode, 587.33, now, 0.007);
    } else if (activeMode === 'oud') {
      // Ud: Tok ahşap mızrap tınısı (La3, fısıltı düzeyi 0.008)
      playGentleOudPluck(ctx, outputNode, 220.0, now, 0.008);
    } else if (activeMode === 'kalimba') {
      // Kalimba: Dingin kristal çan pırıltısı (Re5, fısıltı düzeyi 0.006)
      playGentleKalimbaNote(ctx, outputNode, 587.33, now, 0.006);
    } else if (activeMode === 'ambient_pad') {
      // Sıcak Pad: Meditatif kadife sinüs süzülmesi (293.66 Hz, 0.006)
      const padOsc = ctx.createOscillator();
      const padGain = ctx.createGain();
      padOsc.type = 'sine';
      padOsc.frequency.setValueAtTime(293.66, now);
      padGain.gain.setValueAtTime(0.00001, now);
      padGain.gain.linearRampToValueAtTime(0.006, now + 0.05);
      padGain.gain.exponentialRampToValueAtTime(0.00001, now + 0.28);
      padOsc.connect(padGain);
      padGain.connect(outputNode);
      padOsc.start(now);
      padOsc.stop(now + 0.3);
    } else {
      // Ney / Otomatik: Samimi ve yumuşak ney nefesi mikro-tınısı
      const neyFreq = NEY_FREQUENCIES[stepMelodyIndex % NEY_FREQUENCIES.length];
      stepMelodyIndex++;

      const neyOsc = ctx.createOscillator();
      const neyFilter = ctx.createBiquadFilter();
      const neyGain = ctx.createGain();

      neyOsc.type = 'sine';
      neyOsc.frequency.setValueAtTime(neyFreq, now);

      neyFilter.type = 'lowpass';
      neyFilter.frequency.setValueAtTime(480, now);

      neyGain.gain.setValueAtTime(0.00001, now);
      neyGain.gain.linearRampToValueAtTime(0.006, now + 0.06);
      neyGain.gain.exponentialRampToValueAtTime(0.00001, now + 0.38);

      neyOsc.connect(neyFilter);
      neyFilter.connect(neyGain);
      neyGain.connect(outputNode);

      neyOsc.start(now);
      neyOsc.stop(now + 0.4);
    }
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
