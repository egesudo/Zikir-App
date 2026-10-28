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

/**
 * Seçili moda ve manzaraya göre aktif ambiyans ses profilini belirler.
 */
export function resolveAmbientProfile(
  mode: AmbientSoundMode,
  themeId: ThemeId
): 'wind' | 'river' | 'ney' {
  if (mode !== 'auto') return mode;
  switch (themeId) {
    case 'mosque_courtyard':
    case 'emerald_lake':
    case 'meadow':
    case 'painted_valley':
      return 'river';
    case 'cosmos':
      return 'ney';
    case 'misty_valley':
    case 'lavender_hills':
    case 'sunset':
    default:
      return 'wind';
  }
}

// --- ZİKİR RİTMİYLE SENKRONİZE DÖNGÜSEL DOĞA VE NEY AMBİYANS MOTORU ---

interface ActiveAmbientGraph {
  profile: 'wind' | 'river' | 'ney';
  masterGain: GainNode;
  warmthFilter: BiquadFilterNode;
  lfoOsc: OscillatorNode;
  cleanup: () => void;
}

let activeAmbient: ActiveAmbientGraph | null = null;
let focusIntensity = 0.22; // 0.18 (dingin fısıltı) -> 1.0 (derin odak ritmi)
let rhythmCadenceHz = 0.25; // Zikir çekim hızına göre senkronize LFO dalga frekansı
let lastTapTimestamp = 0;
let decayIntervalId: number | null = null;

function applyDynamicFocusToAudio(ctx: AudioContext, withPulseCrest = false): void {
  if (!activeAmbient) return;
  const now = ctx.currentTime;

  // Odak ritmine göre temel ses seviyesi
  const baseTargetGain = 0.02 + focusIntensity * 0.072;
  // Zikir dokunuşu anında ritimle senkronize yumuşak dalga tepesi (swell crest)
  const crestGain = withPulseCrest ? Math.min(0.115, baseTargetGain * 1.32) : baseTargetGain;

  activeAmbient.masterGain.gain.cancelScheduledValues(now);
  if (withPulseCrest) {
    activeAmbient.masterGain.gain.setTargetAtTime(crestGain, now, 0.12);
    activeAmbient.masterGain.gain.setTargetAtTime(baseTargetGain, now + 0.28, 0.45);
  } else {
    activeAmbient.masterGain.gain.setTargetAtTime(baseTargetGain, now, 0.45);
  }

  // Odak ritmine göre filtre sıcaklığı ve açıklığı
  const baseCutoff =
    activeAmbient.profile === 'wind'
      ? 260
      : activeAmbient.profile === 'river'
      ? 380
      : 320;
  const dynamicCutoff = baseCutoff + focusIntensity * 360 + (withPulseCrest ? 95 : 0);
  activeAmbient.warmthFilter.frequency.cancelScheduledValues(now);
  activeAmbient.warmthFilter.frequency.setTargetAtTime(dynamicCutoff, now, 0.22);
  if (withPulseCrest) {
    activeAmbient.warmthFilter.frequency.setTargetAtTime(
      baseCutoff + focusIntensity * 360,
      now + 0.3,
      0.5
    );
  }

  // Döngüsel doğa sesinin dalgalanma hızını kullanıcının zikir ritmine (cadence) senkronize et
  activeAmbient.lfoOsc.frequency.setTargetAtTime(rhythmCadenceHz, now, 0.5);
}

function ensureDecayLoop(): void {
  if (decayIntervalId !== null || typeof window === 'undefined') return;
  decayIntervalId = window.setInterval(() => {
    const nowMs = performance.now();
    const idleMs = nowMs - lastTapTimestamp;
    // Kullanıcı 2.8 saniyeden uzun süre dokunmadığında ambiyans yumuşakça dinlenme seviyesine çekilir
    if (idleMs > 2800 && focusIntensity > 0.18) {
      focusIntensity = Math.max(0.18, focusIntensity - 0.045);
      rhythmCadenceHz = Math.max(0.14, rhythmCadenceHz * 0.92);
      if (audioCtx && activeAmbient) {
        applyDynamicFocusToAudio(audioCtx, false);
      }
    }
  }, 650);
}

function buildAmbientGraph(
  ctx: AudioContext,
  profile: 'wind' | 'river' | 'ney'
): ActiveAmbientGraph {
  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.001, now);

  const warmthFilter = ctx.createBiquadFilter();
  warmthFilter.type = 'lowpass';
  warmthFilter.frequency.setValueAtTime(360, now);

  warmthFilter.connect(masterGain);
  masterGain.connect(ctx.destination);

  const sourcesToStop: AudioScheduledSourceNode[] = [];
  const nodesToDisconnect: AudioNode[] = [masterGain, warmthFilter];
  let primaryLfo: OscillatorNode;

  if (profile === 'wind') {
    // ESİNTİLİ VADİ: LFO modülasyonlu çift katmanlı vadi rüzgârı
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = getLoopingNatureBuffer(ctx);
    noiseSrc.loop = true;

    const windBand = ctx.createBiquadFilter();
    windBand.type = 'bandpass';
    windBand.frequency.setValueAtTime(285, now);
    windBand.Q.setValueAtTime(2.5, now);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.16, now);
    lfoGain.gain.setValueAtTime(115, now);

    lfo.connect(lfoGain);
    lfoGain.connect(windBand.frequency);

    noiseSrc.connect(windBand);
    windBand.connect(warmthFilter);

    noiseSrc.start(now);
    lfo.start(now);
    primaryLfo = lfo;
    sourcesToStop.push(noiseSrc, lfo);
    nodesToDisconnect.push(noiseSrc, windBand, lfo, lfoGain);
  } else if (profile === 'river') {
    // HUZURLU ŞADIRVAN: Yumuşak su akışı + ritmik şadırvan dalgalanması
    const streamSrc = ctx.createBufferSource();
    streamSrc.buffer = getLoopingNatureBuffer(ctx);
    streamSrc.loop = true;

    const waterBodyFilter = ctx.createBiquadFilter();
    waterBodyFilter.type = 'lowpass';
    waterBodyFilter.frequency.setValueAtTime(430, now);

    const rippleFilter = ctx.createBiquadFilter();
    rippleFilter.type = 'bandpass';
    rippleFilter.frequency.setValueAtTime(790, now);
    rippleFilter.Q.setValueAtTime(3.0, now);

    const rippleGain = ctx.createGain();
    rippleGain.gain.setValueAtTime(0.38, now);

    const waterLfo = ctx.createOscillator();
    const waterLfoGain = ctx.createGain();
    waterLfo.type = 'sine';
    waterLfo.frequency.setValueAtTime(0.28, now);
    waterLfoGain.gain.setValueAtTime(170, now);

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
 * Arka plan ambiyans sesini kullanıcı ayarlarına göre başlatır, günceller veya durdurur.
 */
export function syncAmbientSoundscape(
  enabled: boolean,
  mode: AmbientSoundMode,
  themeId: ThemeId
): void {
  if (!enabled) {
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
    // İlk dokunuşta başlar
  }
}

/**
 * Kullanıcının her zikir dokunuşunda (veya Ayarlar'da önizleme seçtiğinde)
 * odak ritmini ölçer ve 'Huzurlu Şadırvan' / 'Esintili Vadi' döngüsünü zikir ritmiyle senkronize dalgalandırır.
 */
export function pulseAmbientFocusRhythm(
  ambientEnabled: boolean,
  mode: AmbientSoundMode,
  themeId: ThemeId
): number {
  const nowMs = performance.now();
  const deltaMs = lastTapTimestamp > 0 ? nowMs - lastTapTimestamp : 1400;
  lastTapTimestamp = nowMs;

  // Düzenli ve tefekkür odaklı zikir temposu (350ms - 4200ms arası) odak yoğunluğunu ve ritim senkronunu ayarlar
  if (deltaMs >= 350 && deltaMs <= 4200) {
    focusIntensity = Math.min(1.0, Math.max(0.45, focusIntensity + 0.16));
    // Kullanıcının zikir hızına uyumlu yumuşak dalgalanma frekansı (0.18 Hz - 0.75 Hz arası)
    const tapFreqHz = 1000 / deltaMs;
    rhythmCadenceHz = Math.min(0.75, Math.max(0.18, tapFreqHz * 0.45));
  } else if (deltaMs < 350) {
    focusIntensity = Math.min(0.92, Math.max(0.42, focusIntensity + 0.08));
    rhythmCadenceHz = 0.55;
  } else {
    focusIntensity = Math.max(0.45, focusIntensity);
    rhythmCadenceHz = 0.24;
  }

  if (ambientEnabled) {
    syncAmbientSoundscape(true, mode, themeId);
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
 * 2) Arka planda çok hafif, samimi bir ney nefesi ve seher rüzgârı dokunuşu üretir.
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
