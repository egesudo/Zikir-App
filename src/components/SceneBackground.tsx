import React, { useEffect, useRef, useState } from 'react';
import { ThemeId } from '../data/dhikrs';

interface SceneBackgroundProps {
  themeId: ThemeId;
  reducedMotion: boolean;
  rhythmTempoScale?: number;
}

export const SceneBackground: React.FC<SceneBackgroundProps> = ({
  themeId,
  reducedMotion,
  rhythmTempoScale = 1,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rhythmScaleRef = useRef<number>(rhythmTempoScale);
  const [isTabHidden, setIsTabHidden] = useState<boolean>(false);
  const [osReducedMotion, setOsReducedMotion] = useState<boolean>(false);

  // Zikir hızına göre CSS animasyonlarının (yapraklar, su, ışık, bulut) hızını sıçramasız güncelle
  useEffect(() => {
    const clampedScale = Math.min(1.5, Math.max(0.75, rhythmTempoScale));
    rhythmScaleRef.current = clampedScale;

    if (typeof Element === 'undefined' || !containerRef.current) return;
    try {
      const animations = containerRef.current.getAnimations({ subtree: true });
      animations.forEach((anim) => {
        anim.playbackRate = clampedScale;
      });
    } catch {
      // Desteklemeyen eski tarayıcılarda varsayılan hızda devam et
    }
  }, [rhythmTempoScale, themeId]);

  // Sekme arka plana geçtiğinde veya OS reduced-motion aktif olduğunda animasyonları duraklat
  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      setIsTabHidden(document.hidden);
    };

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setOsReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setOsReducedMotion(e.matches);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  const isMotionPaused = reducedMotion || osReducedMotion || isTabHidden;

  // Performans dostu requestAnimationFrame çevresel atmosfer katmanı
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    if (isMotionPaused) {
      ctx.clearRect(0, 0, width, height);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      phase: number;
      kind: 'rain' | 'glass_drop' | 'firefly' | 'mote' | 'snow' | 'sea_sparkle' | 'autumn_mote';
    }

    const particles: Particle[] = [];

    if (themeId === 'rainy') {
      for (let i = 0; i < 24; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: -0.45 - Math.random() * 0.25,
          vy: 3.4 + Math.random() * 1.8,
          size: 14 + Math.random() * 10,
          alpha: 0.14 + Math.random() * 0.16,
          phase: Math.random() * Math.PI * 2,
          kind: 'rain',
        });
      }
      for (let i = 0; i < 8; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: 0,
          vy: 0.18 + Math.random() * 0.22,
          size: 2.2 + Math.random() * 1.8,
          alpha: 0.24 + Math.random() * 0.2,
          phase: Math.random() * Math.PI * 2,
          kind: 'glass_drop',
        });
      }
    } else if (themeId === 'snowy_winter') {
      for (let i = 0; i < 28; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.28,
          vy: 0.42 + Math.random() * 0.55,
          size: 1.8 + Math.random() * 2.4,
          alpha: 0.42 + Math.random() * 0.42,
          phase: Math.random() * Math.PI * 2,
          kind: 'snow',
        });
      }
    } else if (themeId === 'calm_seashore') {
      for (let i = 0; i < 16; i++) {
        particles.push({
          x: Math.random() * width,
          y: height * 0.48 + Math.random() * (height * 0.46),
          vx: (Math.random() - 0.5) * 0.14,
          vy: (Math.random() - 0.5) * 0.08,
          size: 1.5 + Math.random() * 1.8,
          alpha: 0.28 + Math.random() * 0.45,
          phase: Math.random() * Math.PI * 2,
          kind: 'sea_sparkle',
        });
      }
    } else if (themeId === 'autumn_breeze') {
      for (let i = 0; i < 16; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: 0.24 + Math.random() * 0.26,
          vy: 0.22 + Math.random() * 0.28,
          size: 1.8 + Math.random() * 1.7,
          alpha: 0.26 + Math.random() * 0.42,
          phase: Math.random() * Math.PI * 2,
          kind: 'autumn_mote',
        });
      }
    } else if (themeId === 'night' || themeId === 'moonlit_nature') {
      for (let i = 0; i < 14; i++) {
        particles.push({
          x: Math.random() * width,
          y: height * 0.35 + Math.random() * (height * 0.6),
          vx: (Math.random() - 0.5) * 0.22,
          vy: -0.12 - Math.random() * 0.18,
          size: 1.8 + Math.random() * 1.6,
          alpha: 0.2 + Math.random() * 0.45,
          phase: Math.random() * Math.PI * 2,
          kind: 'firefly',
        });
      }
    } else {
      for (let i = 0; i < 14; i++) {
        particles.push({
          x: Math.random() * width,
          y: height * 0.2 + Math.random() * (height * 0.75),
          vx: (Math.random() - 0.5) * 0.18,
          vy: -0.14 - Math.random() * 0.15,
          size: 1.6 + Math.random() * 1.5,
          alpha: 0.18 + Math.random() * 0.35,
          phase: Math.random() * Math.PI * 2,
          kind: 'mote',
        });
      }
    }

    let lastTime = performance.now();

    const render = (now: number) => {
      const baseDt = Math.min(32, now - lastTime) / 16.67;
      // Ritim Senkronizasyonu: Zikir hızı ve sayısı arttıkça parçacıklar sakinleştirici bir ivme kazanır
      const dt = baseDt * rhythmScaleRef.current;
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.phase += 0.018 * dt;

        if (p.kind === 'rain') {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x < -20) p.x = width + 10;

          ctx.strokeStyle = `rgba(224, 242, 254, ${p.alpha})`;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 2.4, p.y + p.size);
          ctx.stroke();
        } else if (p.kind === 'glass_drop') {
          p.y += p.vy * (0.65 + 0.35 * Math.sin(p.phase)) * dt;
          p.x += Math.sin(p.phase * 0.7) * 0.08 * dt;
          if (p.y > height + 10) {
            p.y = -10;
            p.x = Math.random() * width;
          }

          ctx.fillStyle = `rgba(241, 245, 249, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === 'snow') {
          p.x += (p.vx + Math.sin(p.phase * 0.85) * 0.26) * dt;
          p.y += p.vy * dt;
          if (p.y > height + 12) {
            p.y = -10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;

          const snowAlpha = p.alpha * (0.65 + 0.35 * Math.sin(p.phase));
          ctx.fillStyle = `rgba(255, 255, 255, ${snowAlpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === 'sea_sparkle') {
          p.x += (p.vx + Math.sin(p.phase) * 0.14) * dt;
          p.y += p.vy * dt;
          const sparkleAlpha = p.alpha * Math.pow(0.5 + 0.5 * Math.sin(p.phase * 1.4), 2);
          ctx.fillStyle = `rgba(240, 253, 250, ${sparkleAlpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (0.8 + 0.35 * Math.sin(p.phase)), 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === 'autumn_mote') {
          p.x += (p.vx + Math.sin(p.phase) * 0.18) * dt;
          p.y += p.vy * dt;
          if (p.y > height + 12) {
            p.y = -10;
            p.x = Math.random() * width;
          }
          if (p.x > width + 12) p.x = -10;

          const goldAlpha = p.alpha * (0.55 + 0.45 * Math.sin(p.phase));
          ctx.fillStyle = `rgba(251, 191, 36, ${goldAlpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === 'firefly') {
          p.x += (p.vx + Math.sin(p.phase) * 0.12) * dt;
          p.y += p.vy * dt;
          if (p.y < height * 0.25) {
            p.y = height * 0.92;
            p.x = Math.random() * width;
          }
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;

          const glowAlpha = p.alpha * (0.45 + 0.55 * Math.sin(p.phase));
          const color =
            themeId === 'moonlit_nature'
              ? `rgba(167, 243, 208, ${glowAlpha})`
              : `rgba(253, 224, 71, ${glowAlpha})`;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          p.x += (p.vx + Math.cos(p.phase) * 0.1) * dt;
          p.y += p.vy * dt;
          if (p.y < height * 0.15) {
            p.y = height * 0.92;
            p.x = Math.random() * width;
          }
          const glowAlpha = p.alpha * (0.5 + 0.5 * Math.sin(p.phase));
          ctx.fillStyle = `rgba(255, 251, 235, ${glowAlpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    animationFrameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [themeId, isMotionPaused]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transition-colors duration-700 ${
        isMotionPaused ? 'animations-paused' : ''
      }`}
      aria-hidden="true"
    >
      {/* A. NATURE — DOĞA (Yeşil tepeler, nefes alan ışık huzmeleri, süzülen yapraklar ve ufuk sisi) */}
      {themeId === 'nature' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#bae6fd] via-[#e0f2fe] to-[#fef9c3]">
          <svg
            viewBox="0 0 400 800"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <radialGradient id="natureSun" cx="78%" cy="18%" r="48%">
                <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.96" />
                <stop offset="45%" stopColor="#fef08a" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#bae6fd" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="natureBeam" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#fef9c3" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="natureMist" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Yumuşak Güneş ve Nefes Alan Işık Huzmeleri */}
            <circle cx="310" cy="145" r="175" fill="url(#natureSun)" className="animate-pulse-soft" />
            <g className="animate-sunbeam-breathe" style={{ transformOrigin: '310px 145px' }}>
              <polygon points="310,145 140,620 220,620" fill="url(#natureBeam)" />
              <polygon points="310,145 245,620 335,620" fill="url(#natureBeam)" />
            </g>
            <circle cx="310" cy="145" r="36" fill="#fef9c3" opacity="0.92" />

            {/* Çok Hafif Hareket Eden Bulutlar */}
            <g className="animate-cloud-drift">
              <ellipse cx="95" cy="140" rx="68" ry="18" fill="#ffffff" opacity="0.72" />
              <ellipse cx="125" cy="135" rx="45" ry="15" fill="#ffffff" opacity="0.78" />
              <ellipse cx="265" cy="215" rx="75" ry="17" fill="#ffffff" opacity="0.62" />
            </g>

            {/* Uzakta Süzülen Kuşlar */}
            <g className="animate-bird-glide" opacity="0.58">
              <path
                d="M 75 245 Q 81 239 87 245 Q 93 239 99 245"
                fill="none"
                stroke="#334155"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <path
                d="M 108 232 Q 113 227 118 232 Q 123 227 128 232"
                fill="none"
                stroke="#334155"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M 134 248 Q 138 244 142 248 Q 146 244 150 248"
                fill="none"
                stroke="#334155"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            </g>

            {/* Uzak Doğal Yeşil Tepeler */}
            <path
              d="M -30 465 Q 95 405 225 450 T 430 425 L 430 800 L -30 800 Z"
              fill="#86efac"
              opacity="0.78"
            />

            {/* Ufukta Nefes Alan Yumuşak Vadi Sisi */}
            <ellipse
              cx="200"
              cy="475"
              rx="210"
              ry="22"
              fill="url(#natureMist)"
              className="animate-mist-breathe"
            />

            <path
              d="M -30 525 Q 135 470 275 515 T 430 490 L 430 800 L -30 800 Z"
              fill="#4ade80"
            />

            {/* Tepeler Üzerinde Doğal Ağaçlar */}
            {[
              { x: 68, y: 495, s: 1 },
              { x: 102, y: 508, s: 0.82 },
              { x: 325, y: 482, s: 1.08 },
              { x: 356, y: 498, s: 0.88 },
            ].map((tr, idx) => (
              <g key={idx} transform={`translate(${tr.x}, ${tr.y}) scale(${tr.s})`}>
                <g className="animate-flower-sway">
                  <rect x="-2.5" y="10" width="5" height="18" rx="2" fill="#78350f" />
                  <circle cx="0" cy="0" r="14" fill="#16a34a" />
                  <circle cx="-8" cy="6" r="10" fill="#15803d" />
                  <circle cx="8" cy="6" r="10" fill="#22c55e" />
                </g>
              </g>
            ))}

            {/* Rüzgârda Süzülen Yapraklar (Yeni Doğa CSS Animasyonu) */}
            {[
              { x: 85, y: 310, d: '0s', fill: '#4ade80' },
              { x: 215, y: 275, d: '4.2s', fill: '#86efac' },
              { x: 310, y: 345, d: '8.5s', fill: '#22c55e' },
            ].map((lf, idx) => (
              <g key={idx} transform={`translate(${lf.x}, ${lf.y})`}>
                <g className="animate-leaf-drift" style={{ animationDelay: lf.d }}>
                  <path
                    d="M 0 0 Q 6 -4 11 0 Q 6 5 0 0 Z"
                    fill={lf.fill}
                    opacity="0.82"
                  />
                </g>
              </g>
            ))}

            {/* Ön Çayır Katmanı */}
            <path
              d="M -30 600 Q 115 555 255 595 T 430 575 L 430 800 L -30 800 Z"
              fill="#22c55e"
            />
            <path
              d="M -30 675 Q 140 640 285 670 T 430 655 L 430 800 L -30 800 Z"
              fill="#16a34a"
            />

            {/* Hafif Rüzgârla Yavaşça Hareket Eden Çimenler ve Kır Çiçekleri */}
            {[35, 65, 98, 138, 175, 215, 255, 295, 335, 370].map((gx, i) => (
              <g
                key={i}
                transform={`translate(${gx}, ${645 + (i % 3) * 18})`}
                className="animate-grass-sway"
                style={{ animationDelay: `${(i % 4) * 0.7}s` }}
              >
                <path
                  d="M 0 24 Q -5 10 -9 0 M 0 24 Q 1 8 3 -2 M 0 24 Q 6 12 10 2"
                  fill="none"
                  stroke="#14532d"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  opacity="0.55"
                />
                {i % 2 === 0 && <circle cx="3" cy="-3" r="3" fill="#fef08a" />}
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* B. RAINY — YAĞMURLU HAVA (Bulut arası nefes alan ışık huzmeleri, ufuk sisi ve genişleyen su halkaları) */}
      {themeId === 'rainy' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#334155] via-[#475569] to-[#314e52]">
          <svg
            viewBox="0 0 400 800"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <radialGradient id="rainCloudLight" cx="50%" cy="26%" r="55%">
                <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.48" />
                <stop offset="55%" stopColor="#c7d2fe" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#334155" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="softRainBeam" x1="0%" y1="0%" x2="20%" y2="100%">
                <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.26" />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="rainMistGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0" />
                <stop offset="50%" stopColor="#e2e8f0" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Bulutların Arasından Süzülen Nefes Alan Işık Huzmeleri */}
            <circle cx="200" cy="210" r="210" fill="url(#rainCloudLight)" className="animate-pulse-soft" />
            <g className="animate-sunbeam-breathe" style={{ transformOrigin: '190px 60px' }}>
              <polygon points="130,0 240,0 310,550 70,550" fill="url(#softRainBeam)" />
            </g>

            {/* Yumuşak Yağmur Bulutları */}
            <g className="animate-cloud-drift">
              <ellipse cx="110" cy="110" rx="115" ry="34" fill="#64748b" opacity="0.55" />
              <ellipse cx="280" cy="135" rx="125" ry="38" fill="#475569" opacity="0.65" />
              <ellipse cx="195" cy="85" rx="130" ry="32" fill="#94a3b8" opacity="0.35" />
            </g>

            {/* Yağmur Altında Sakin Tepeler */}
            <path
              d="M -30 480 Q 105 435 235 475 T 430 450 L 430 800 L -30 800 Z"
              fill="#4c566a"
              opacity="0.7"
            />

            {/* Ufukta Nefes Alan Yağmur Sisi */}
            <ellipse
              cx="200"
              cy="510"
              rx="220"
              ry="24"
              fill="url(#rainMistGrad)"
              className="animate-mist-breathe"
            />

            <path
              d="M -30 545 Q 130 500 270 540 T 430 520 L 430 800 L -30 800 Z"
              fill="#3b5249"
              opacity="0.85"
            />
            <path
              d="M -30 620 Q 115 585 265 618 T 430 600 L 430 800 L -30 800 Z"
              fill="#263e3a"
            />

            {/* Su Yüzeyinde Genişleyen Konsantrik Damla Halkaları */}
            {[
              { cx: 115, cy: 685, rx: 38, ry: 9, d: '0s' },
              { cx: 265, cy: 720, rx: 46, ry: 11, d: '2.2s' },
              { cx: 185, cy: 750, rx: 34, ry: 8, d: '4.4s' },
            ].map((rp, idx) => (
              <g
                key={idx}
                className="animate-ripple-expand"
                style={{ transformOrigin: `${rp.cx}px ${rp.cy}px`, animationDelay: rp.d }}
              >
                <ellipse
                  cx={rp.cx}
                  cy={rp.cy}
                  rx={rp.rx}
                  ry={rp.ry}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1.2"
                />
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* C. NIGHT — GECE AMBİYANSI (Yumuşak kutup ışığı dalgalanması, gümüş ay ışığı ve sakin yıldızlar) */}
      {themeId === 'night' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#090d1e] via-[#1e1b4b] to-[#1e1338]">
          <svg
            viewBox="0 0 400 800"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <radialGradient id="nightMoonHalo" cx="72%" cy="20%" r="42%">
                <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.55" />
                <stop offset="45%" stopColor="#c084fc" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#090d1e" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="nightAurora1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0" />
                <stop offset="35%" stopColor="#a855f7" stopOpacity="0.28" />
                <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="nightAurora2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0" />
                <stop offset="50%" stopColor="#c084fc" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Gece Gökyüzünde Yumuşak Kutup Işığı (Aurora) Dalgalanması */}
            <path
              d="M -40 240 Q 95 190 215 235 T 440 205 L 440 295 Q 295 325 185 285 T -40 310 Z"
              fill="url(#nightAurora1)"
              className="animate-aurora-wave"
            />
            <path
              d="M -40 305 Q 125 265 255 305 T 440 280 L 440 355 Q 265 380 140 340 T -40 365 Z"
              fill="url(#nightAurora2)"
              className="animate-aurora-wave"
              style={{ animationDelay: '5s' }}
            />

            {/* Gümüş Ay Işığı Halesi */}
            <circle cx="288" cy="155" r="145" fill="url(#nightMoonHalo)" className="animate-pulse-soft" />
            <circle cx="288" cy="155" r="28" fill="#f1f5f9" opacity="0.95" />
            <circle cx="278" cy="148" r="24" fill="#131633" opacity="0.18" />

            {/* Yavaşça Parlayan Sakin Yıldızlar */}
            {[
              [48, 82, 1.3],
              [118, 64, 1.5],
              [185, 108, 1.2],
              [65, 175, 1.4],
              [145, 215, 1.3],
              [345, 95, 1.4],
              [225, 165, 1.1],
              [82, 285, 1.3],
              [332, 265, 1.5],
              [168, 310, 1.2],
              [265, 295, 1.3],
              [42, 365, 1.2],
            ].map(([cx, cy, r], idx) => (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r={r}
                fill="#e2e8f0"
                className="animate-twinkle"
                style={{ animationDelay: `${(idx % 5) * 1.1}s` }}
              />
            ))}

            {/* Hafif Hareket Eden Gece Bulutları */}
            <g className="animate-cloud-drift" opacity="0.25">
              <ellipse cx="145" cy="185" rx="85" ry="20" fill="#94a3b8" />
              <ellipse cx="295" cy="225" rx="75" ry="18" fill="#c084fc" />
            </g>

            {/* Uzakta Sakin Doğa Silüetleri ve Nefes Alan Gece Sisi */}
            <path
              d="M -30 515 Q 105 465 235 505 T 430 480 L 430 800 L -30 800 Z"
              fill="#1e1b4b"
              opacity="0.85"
            />
            <ellipse
              cx="200"
              cy="550"
              rx="210"
              ry="18"
              fill="#c084fc"
              opacity="0.14"
              className="animate-mist-breathe"
            />
            <path
              d="M -30 575 Q 130 535 275 570 T 430 545 L 430 800 L -30 800 Z"
              fill="#13112e"
            />
            <path
              d="M -30 645 Q 115 615 265 642 T 430 628 L 430 800 L -30 800 Z"
              fill="#09081a"
            />
          </svg>
        </div>
      )}

      {/* D. SUNRISE — GÜN DOĞUMU (Yükselen güneş, nefes alan seher huzmeleri, ufuk sisi ve taç yapraklar) */}
      {themeId === 'sunrise' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#93c5fd] via-[#fbcfe8] to-[#fde68a]">
          <svg
            viewBox="0 0 400 800"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <radialGradient id="sunriseGlow" cx="50%" cy="54%" r="52%">
                <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.98" />
                <stop offset="40%" stopColor="#fde047" stopOpacity="0.68" />
                <stop offset="75%" stopColor="#fda4af" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#fbcfe8" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="sunriseBeam" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#fbcfe8" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="sunriseMist" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fffbeb" stopOpacity="0" />
                <stop offset="50%" stopColor="#fffbeb" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#fffbeb" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Kesintisiz ve Yavaşça Yükselen Seher Güneşi ve Işık Huzmeleri */}
            <g className="animate-sunrise-cycle">
              <g className="animate-sunbeam-breathe" style={{ transformOrigin: '200px 430px' }}>
                <polygon points="200,430 70,90 145,90" fill="url(#sunriseBeam)" />
                <polygon points="200,430 170,70 230,70" fill="url(#sunriseBeam)" />
                <polygon points="200,430 255,90 330,90" fill="url(#sunriseBeam)" />
              </g>
              <circle cx="200" cy="430" r="195" fill="url(#sunriseGlow)" />
              <circle cx="200" cy="430" r="44" fill="#fffbeb" opacity="0.94" />
            </g>

            {/* Bulutların Üzerinde Yumuşak Şeftali ve Altın Işık Yansımaları */}
            <g className="animate-cloud-drift">
              <ellipse cx="105" cy="185" rx="78" ry="20" fill="#fff1f2" opacity="0.68" />
              <ellipse cx="120" cy="192" rx="62" ry="12" fill="#fde047" opacity="0.38" />
              <ellipse cx="305" cy="240" rx="88" ry="22" fill="#fff1f2" opacity="0.65" />
              <ellipse cx="290" cy="248" rx="68" ry="12" fill="#fda4af" opacity="0.4" />
            </g>

            {/* Gün Doğumu Tepeleri ve Nefes Alan Seher Sisi */}
            <path
              d="M -30 485 Q 95 435 225 475 T 430 455 L 430 800 L -30 800 Z"
              fill="#84a98c"
              opacity="0.65"
            />
            <ellipse
              cx="200"
              cy="512"
              rx="225"
              ry="24"
              fill="url(#sunriseMist)"
              className="animate-mist-breathe"
            />
            <path
              d="M -30 550 Q 130 505 270 545 T 430 525 L 430 800 L -30 800 Z"
              fill="#52796f"
              opacity="0.85"
            />
            <path
              d="M -30 620 Q 115 585 260 618 T 430 600 L 430 800 L -30 800 Z"
              fill="#354f52"
            />

            {/* Seher Esintisiyle Süzülen Pembe Çiçek Taç Yaprakları */}
            {[
              { x: 110, y: 330, d: '0s', fill: '#fda4af' },
              { x: 255, y: 295, d: '5s', fill: '#fbcfe8' },
              { x: 175, y: 370, d: '9.5s', fill: '#fef08a' },
            ].map((pt, idx) => (
              <g key={idx} transform={`translate(${pt.x}, ${pt.y})`}>
                <g className="animate-leaf-drift" style={{ animationDelay: pt.d }}>
                  <ellipse cx="0" cy="0" rx="4.5" ry="2.5" fill={pt.fill} opacity="0.85" />
                </g>
              </g>
            ))}

            {/* Çok Hafif Hareket Eden Sabah Çiçekleri */}
            {[55, 115, 185, 255, 330].map((fx, idx) => (
              <g
                key={idx}
                transform={`translate(${fx}, ${645 + (idx % 2) * 16})`}
                className="animate-flower-sway"
                style={{ animationDelay: `${idx * 0.8}s` }}
              >
                <line x1="0" y1="0" x2="0" y2="20" stroke="#86efac" strokeWidth="1.6" opacity="0.7" />
                <circle cx="0" cy="-3" r="4.2" fill="#fda4af" />
                <circle cx="0" cy="-3" r="2" fill="#fef08a" />
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* E. SUNSET — GÜN BATIMI (Alçalan güneş, nefes alan ufuk sisi ve su yüzeyinde genişleyen yansımalar) */}
      {themeId === 'sunset' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#2e1065] via-[#be185d] to-[#fb923c]">
          <svg
            viewBox="0 0 400 800"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <radialGradient id="sunsetGlow" cx="50%" cy="54%" r="50%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.96" />
                <stop offset="40%" stopColor="#fb923c" stopOpacity="0.68" />
                <stop offset="75%" stopColor="#f43f5e" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#2e1065" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="sunsetMist" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fed7aa" stopOpacity="0" />
                <stop offset="50%" stopColor="#fed7aa" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#fed7aa" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Yavaşça Alçalan Sıcak Gün Batımı Güneşi */}
            <g className="animate-sunset-descent">
              <circle cx="200" cy="445" r="180" fill="url(#sunsetGlow)" />
              <circle cx="200" cy="445" r="44" fill="#fde047" opacity="0.9" />
            </g>

            {/* Alacakaranlık Bulutları */}
            <g className="animate-cloud-drift">
              <ellipse cx="95" cy="175" rx="75" ry="18" fill="#fda4af" opacity="0.32" />
              <ellipse cx="310" cy="215" rx="85" ry="22" fill="#fdba74" opacity="0.28" />
            </g>

            {/* Dağ ve Tepe Silüetleri */}
            <path
              d="M -20 475 L 55 405 L 130 450 L 210 415 L 285 455 L 355 395 L 420 440 L 420 800 L -20 800 Z"
              fill="#581c87"
              opacity="0.55"
            />
            <path
              d="M -20 530 Q 110 485 240 525 T 420 505 L 420 800 L -20 800 Z"
              fill="#3b0764"
            />

            {/* Ufukta Nefes Alan Akşam Sisi */}
            <ellipse
              cx="200"
              cy="552"
              rx="230"
              ry="22"
              fill="url(#sunsetMist)"
              className="animate-mist-breathe"
            />

            {/* Sakin Göl Yüzeyi, Yakamoz Yansımaları ve Genişleyen Su Halkaları */}
            <rect x="0" y="565" width="400" height="235" fill="#1e1b4b" opacity="0.88" />
            {[
              { y: 585, rx: 58, ry: 3.5, d: '0s' },
              { y: 608, rx: 46, ry: 3, d: '1.1s' },
              { y: 632, rx: 36, ry: 2.8, d: '2.2s' },
              { y: 658, rx: 28, ry: 2.4, d: '0.7s' },
              { y: 685, rx: 20, ry: 2, d: '1.8s' },
            ].map((rp, i) => (
              <ellipse
                key={i}
                cx="200"
                cy={rp.y}
                rx={rp.rx}
                ry={rp.ry}
                fill="#fdba74"
                className="animate-water-shimmer"
                style={{ transformOrigin: `200px ${rp.y}px`, animationDelay: rp.d }}
              />
            ))}

            {/* Su Yüzeyinde Genişleyen Huzurlu Halkalar */}
            <g
              className="animate-ripple-expand"
              style={{ transformOrigin: '200px 640px' }}
            >
              <ellipse
                cx="200"
                cy="640"
                rx="54"
                ry="11"
                fill="none"
                stroke="#fed7aa"
                strokeWidth="1.1"
              />
            </g>
          </svg>
        </div>
      )}

      {/* F. MOONLIT NATURE — AY IŞIĞINDA DOĞA (Kutup ışığı tülü, genişleyen su halkaları ve ay ışığı yansıması) */}
      {themeId === 'moonlit_nature' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#134e4a] to-[#064e3b]">
          <svg
            viewBox="0 0 400 800"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <radialGradient id="moonlitGlow" cx="50%" cy="22%" r="48%">
                <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.72" />
                <stop offset="45%" stopColor="#99f6e4" stopOpacity="0.24" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="moonAurora" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0" />
                <stop offset="50%" stopColor="#99f6e4" stopOpacity="0.26" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Yumuşak Zümrüt-Gümüş Kutup Işığı Dalgalanması */}
            <path
              d="M -30 235 Q 110 185 240 230 T 430 205 L 430 285 Q 275 315 150 275 T -30 300 Z"
              fill="url(#moonAurora)"
              className="animate-aurora-wave"
            />

            {/* Dolunay ve Gümüş Hale */}
            <circle cx="200" cy="175" r="165" fill="url(#moonlitGlow)" className="animate-pulse-soft" />
            <circle cx="200" cy="175" r="32" fill="#f8fafc" opacity="0.95" />

            {/* Yavaş Hareket Eden Gece Bulutları */}
            <g className="animate-cloud-drift" opacity="0.28">
              <ellipse cx="110" cy="160" rx="75" ry="18" fill="#cbd5e1" />
              <ellipse cx="295" cy="195" rx="82" ry="19" fill="#99f6e4" />
            </g>

            {/* Uzaktaki Doğa ve Ağaç Silüetleri */}
            <path
              d="M -30 470 Q 95 425 225 465 T 430 445 L 430 540 L -30 540 Z"
              fill="#115e59"
              opacity="0.75"
            />
            <path
              d="M -30 510 Q 140 480 280 510 T 430 495 L 430 550 L -30 550 Z"
              fill="#064e3b"
            />

            {/* Göl Üzerinde Nefes Alan Gümüş Sis */}
            <ellipse
              cx="200"
              cy="535"
              rx="220"
              ry="18"
              fill="#ccfbf1"
              opacity="0.18"
              className="animate-mist-breathe"
            />

            {/* Ay Işığında Sakin Göl, Yakamozlar ve Genişleyen Su Halkaları */}
            <rect x="0" y="535" width="400" height="265" fill="#042f2e" />
            {[
              { y: 558, rx: 64, ry: 4, d: '0s' },
              { y: 584, rx: 52, ry: 3.5, d: '1.3s' },
              { y: 612, rx: 42, ry: 3, d: '2.4s' },
              { y: 642, rx: 34, ry: 2.6, d: '0.8s' },
              { y: 675, rx: 24, ry: 2.2, d: '1.9s' },
            ].map((rp, i) => (
              <ellipse
                key={i}
                cx="200"
                cy={rp.y}
                rx={rp.rx}
                ry={rp.ry}
                fill="#ccfbf1"
                className="animate-water-shimmer"
                style={{ transformOrigin: `200px ${rp.y}px`, animationDelay: rp.d }}
              />
            ))}

            {[
              { cx: 200, cy: 615, rx: 52, ry: 12, d: '0s' },
              { cx: 145, cy: 670, rx: 38, ry: 9, d: '3.2s' },
            ].map((ring, idx) => (
              <g
                key={idx}
                className="animate-ripple-expand"
                style={{ transformOrigin: `${ring.cx}px ${ring.cy}px`, animationDelay: ring.d }}
              >
                <ellipse
                  cx={ring.cx}
                  cy={ring.cy}
                  rx={ring.rx}
                  ry={ring.ry}
                  fill="none"
                  stroke="#99f6e4"
                  strokeWidth="1.1"
                />
              </g>
            ))}

            {/* Göl Kıyısında Ay Işığıyla Aydınlanan Çiçekler ve Sazlıklar */}
            {[45, 95, 310, 355].map((lx, idx) => (
              <g
                key={idx}
                transform={`translate(${lx}, ${685 + (idx % 2) * 18})`}
                className="animate-flower-sway"
                style={{ animationDelay: `${idx * 0.9}s` }}
              >
                <path d="M 0 35 Q -4 15 -6 0" fill="none" stroke="#34d399" strokeWidth="1.8" opacity="0.65" />
                <circle cx="-6" cy="-2" r="4.5" fill="#e2e8f0" opacity="0.88" />
                <circle cx="-6" cy="-2" r="2" fill="#5eead4" />
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* G. PEACEFUL GARDEN — HUZURLU BAHÇE (Nefes alan gün ışığı huzmeleri ve süzülen çiçek taç yaprakları) */}
      {themeId === 'peaceful_garden' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#bae6fd] via-[#fdf2f8] to-[#dcfce7]">
          <svg
            viewBox="0 0 400 800"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <radialGradient id="gardenSun" cx="22%" cy="18%" r="55%">
                <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.96" />
                <stop offset="45%" stopColor="#fef08a" stopOpacity="0.52" />
                <stop offset="100%" stopColor="#bae6fd" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="gardenBeam" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#fdf2f8" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Yumuşak Bahçe Güneşi ve Nefes Alan Işık Huzmeleri */}
            <circle cx="88" cy="140" r="190" fill="url(#gardenSun)" className="animate-pulse-soft" />
            <g className="animate-sunbeam-breathe" style={{ transformOrigin: '88px 140px' }}>
              <polygon points="88,140 165,600 265,600" fill="url(#gardenBeam)" />
              <polygon points="88,140 285,560 385,560" fill="url(#gardenBeam)" />
            </g>
            <circle cx="88" cy="140" r="36" fill="#fffbeb" opacity="0.92" />

            {/* Yumuşak Pastel Bulutlar */}
            <g className="animate-cloud-drift">
              <ellipse cx="285" cy="145" rx="72" ry="19" fill="#ffffff" opacity="0.8" />
              <ellipse cx="145" cy="215" rx="64" ry="16" fill="#ffffff" opacity="0.72" />
            </g>

            {/* Rüzgârda Süzülen Çiçek Taç Yaprakları */}
            {[
              { x: 75, y: 290, d: '0s', fill: '#f472b6' },
              { x: 185, y: 255, d: '3.6s', fill: '#fbcfe8' },
              { x: 275, y: 315, d: '7.2s', fill: '#c084fc' },
              { x: 135, y: 350, d: '10.5s', fill: '#fde047' },
            ].map((pt, idx) => (
              <g key={idx} transform={`translate(${pt.x}, ${pt.y})`}>
                <g className="animate-leaf-drift" style={{ animationDelay: pt.d }}>
                  <ellipse cx="0" cy="0" rx="4.8" ry="2.8" fill={pt.fill} opacity="0.86" />
                </g>
              </g>
            ))}

            {/* Uçuşan Kelebekler */}
            <g className="animate-butterfly" transform="translate(82, 360)">
              <path d="M 0 0 C -10 -12, -16 -2, -4 4 C -14 10, -8 18, 0 8 Z" fill="#f472b6" />
              <path d="M 2 0 C 12 -12, 18 -2, 6 4 C 16 10, 10 18, 2 8 Z" fill="#fbcfe8" />
              <line x1="1" y1="-2" x2="1" y2="10" stroke="#831843" strokeWidth="1.4" strokeLinecap="round" />
            </g>
            <g
              className="animate-butterfly"
              style={{ animationDelay: '2.2s' }}
              transform="translate(295, 395) scale(0.85)"
            >
              <path d="M 0 0 C -10 -12, -16 -2, -4 4 C -14 10, -8 18, 0 8 Z" fill="#c084fc" />
              <path d="M 2 0 C 12 -12, 18 -2, 6 4 C 16 10, 10 18, 2 8 Z" fill="#f3e8ff" />
              <line x1="1" y1="-2" x2="1" y2="10" stroke="#4c1d95" strokeWidth="1.4" strokeLinecap="round" />
            </g>

            {/* Pastel Yeşil Bahçe Tepeleri */}
            <path
              d="M -40 500 Q 95 450 240 495 T 440 480 L 440 820 L -40 820 Z"
              fill="#86efac"
            />
            <path
              d="M -40 555 Q 140 515 290 545 T 440 525 L 440 820 L -40 820 Z"
              fill="#4ade80"
            />
            <path
              d="M -40 620 Q 110 575 265 615 T 440 595 L 440 820 L -40 820 Z"
              fill="#22c55e"
            />

            {/* Hafif Rüzgârla Sallanan Renkli Bahçe Çiçekleri */}
            {[
              { x: 42, y: 635, color: '#ffffff', center: '#facc15', scale: 1, delay: '0s' },
              { x: 86, y: 575, color: '#f472b6', center: '#fef08a', scale: 0.85, delay: '0.8s' },
              { x: 132, y: 668, color: '#c084fc', center: '#fde047', scale: 0.95, delay: '1.6s' },
              { x: 185, y: 642, color: '#fb7185', center: '#fffbeb', scale: 1.08, delay: '0.4s' },
              { x: 238, y: 658, color: '#fde047', center: '#b45309', scale: 0.9, delay: '2.1s' },
              { x: 292, y: 598, color: '#f472b6', center: '#fef08a', scale: 1.02, delay: '1.2s' },
              { x: 348, y: 640, color: '#ffffff', center: '#fb923c', scale: 0.92, delay: '2.5s' },
            ].map((fl, i) => (
              <g key={i} transform={`translate(${fl.x}, ${fl.y}) scale(${fl.scale})`}>
                <g className="animate-flower-sway" style={{ animationDelay: fl.delay }}>
                  <line x1="0" y1="0" x2="0" y2="20" stroke="#15803d" strokeWidth="2" />
                  <circle cx="-5" cy="-2" r="4" fill={fl.color} />
                  <circle cx="5" cy="-2" r="4" fill={fl.color} />
                  <circle cx="0" cy="-6" r="4" fill={fl.color} />
                  <circle cx="-3" cy="4" r="4" fill={fl.color} />
                  <circle cx="3" cy="4" r="4" fill={fl.color} />
                  <circle cx="0" cy="0" r="3" fill={fl.center} />
                </g>
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* H. MISTY MOUNTAIN — SİSLİ DAĞ ZİRVESİ VE BULUT DENİZİ */}
      {themeId === 'misty_mountain' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#334155] to-[#475569]">
          <svg
            viewBox="0 0 400 800"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <radialGradient id="mountainCrownGlow" cx="50%" cy="24%" r="55%">
                <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.72" />
                <stop offset="45%" stopColor="#fcd34d" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="mountainBeam" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.34" />
                <stop offset="100%" stopColor="#334155" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="cloudSeaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.78" />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.18" />
              </linearGradient>
            </defs>

            {/* Zirve Şafak Halesi ve Nefes Alan Işık Huzmeleri */}
            <circle cx="200" cy="195" r="210" fill="url(#mountainCrownGlow)" className="animate-pulse-soft" />
            <g className="animate-sunbeam-breathe" style={{ transformOrigin: '200px 195px' }}>
              <polygon points="200,195 75,580 155,580" fill="url(#mountainBeam)" />
              <polygon points="200,195 245,580 325,580" fill="url(#mountainBeam)" />
            </g>

            {/* Uzakta Süzülen Yüksek İrtifa Kartalları */}
            <g className="animate-bird-glide" opacity="0.52">
              <path
                d="M 110 185 Q 118 177 126 184 Q 134 177 142 185"
                fill="none"
                stroke="#f8fafc"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M 255 162 Q 261 156 267 162 Q 273 156 279 162"
                fill="none"
                stroke="#f8fafc"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </g>

            {/* 1. Arka Plan Uzak Dağ Sırası */}
            <polygon
              points="-40,520 55,345 145,440 235,310 335,435 435,355 440,620 -40,620"
              fill="#334155"
              opacity="0.88"
            />
            {/* Karlı Zirve Sırtları */}
            <polygon points="235,310 205,360 230,352 248,368 265,350" fill="#e2e8f0" opacity="0.7" />
            <polygon points="55,345 32,388 52,380 68,392 80,382" fill="#e2e8f0" opacity="0.6" />

            {/* 1. Bulut Denizi Katmanı (Yavaşça Akan Vadi Bulutları) */}
            <g className="animate-cloud-sea">
              <path
                d="M -60 445 Q 35 422 115 442 T 285 438 T 460 446 L 460 525 L -60 525 Z"
                fill="url(#cloudSeaGrad)"
              />
              <ellipse cx="110" cy="455" rx="95" ry="22" fill="#f1f5f9" opacity="0.55" />
              <ellipse cx="290" cy="462" rx="105" ry="24" fill="#e2e8f0" opacity="0.5" />
            </g>

            {/* 2. Orta Katman Heybetli Dağ Sırtları */}
            <polygon
              points="-40,610 25,455 125,535 195,415 295,525 385,445 440,610"
              fill="#1e293b"
            />
            <polygon points="195,415 172,455 192,448 206,462 220,450" fill="#cbd5e1" opacity="0.55" />

            {/* 2. Bulut Denizi ve Nefes Alan Vadi Sisi */}
            <g className="animate-cloud-sea" style={{ animationDelay: '3.5s' }}>
              <path
                d="M -60 545 Q 55 520 155 544 T 335 536 T 460 548 L 460 650 L -60 650 Z"
                fill="url(#cloudSeaGrad)"
              />
              <ellipse cx="185" cy="560" rx="135" ry="28" fill="#f8fafc" opacity="0.58" />
            </g>

            <ellipse
              cx="200"
              cy="615"
              rx="230"
              ry="32"
              fill="#e2e8f0"
              opacity="0.34"
              className="animate-mist-breathe"
            />

            {/* 3. Ön Plan Dağ Yamacı ve Çam Silüetleri */}
            <path
              d="M -40 655 Q 110 610 265 650 T 440 625 L 440 820 L -40 820 Z"
              fill="#0f172a"
            />
          </svg>
        </div>
      )}

      {/* I. AUTUMN BREEZE — SONBAHAR ESİNTİSİ VE ALTIN YAPRAKLAR */}
      {themeId === 'autumn_breeze' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#fef3c7] via-[#fde68a] to-[#f59e0b]">
          <svg
            viewBox="0 0 400 800"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <radialGradient id="autumnSunGlow" cx="72%" cy="22%" r="52%">
                <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#fcd34d" stopOpacity="0.52" />
                <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="autumnBeam" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.46" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Sıcak Sonbahar Güneşi ve Altın Işık Huzmeleri */}
            <circle cx="288" cy="172" r="190" fill="url(#autumnSunGlow)" className="animate-pulse-soft" />
            <g className="animate-sunbeam-breathe" style={{ transformOrigin: '288px 172px' }}>
              <polygon points="288,172 80,590 175,590" fill="url(#autumnBeam)" />
              <polygon points="288,172 195,620 285,620" fill="url(#autumnBeam)" />
            </g>
            <circle cx="288" cy="172" r="36" fill="#fffbeb" opacity="0.92" />

            {/* Yumuşak Sonbahar Bulutları */}
            <g className="animate-cloud-drift" opacity="0.72">
              <ellipse cx="105" cy="155" rx="68" ry="18" fill="#fffbeb" />
              <ellipse cx="235" cy="225" rx="74" ry="17" fill="#fef3c7" />
            </g>

            {/* Uzakta Göç Eden Kuş Sürüsü */}
            <g className="animate-bird-glide" opacity="0.6">
              <path
                d="M 85 210 Q 91 203 97 209 Q 103 203 109 210"
                fill="none"
                stroke="#92400e"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M 118 196 Q 123 190 128 195 Q 133 190 138 196"
                fill="none"
                stroke="#92400e"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </g>

            {/* Katmanlı Kehribar ve Kızıl Sonbahar Tepeleri */}
            <path
              d="M -40 495 Q 95 445 235 485 T 440 470 L 440 820 L -40 820 Z"
              fill="#f59e0b"
              opacity="0.82"
            />
            <path
              d="M -40 555 Q 145 510 285 548 T 440 525 L 440 820 L -40 820 Z"
              fill="#d97706"
            />
            <path
              d="M -40 625 Q 110 580 260 618 T 440 595 L 440 820 L -40 820 Z"
              fill="#b45309"
            />

            {/* Sonbahar Ağacı Dalları (Sağ Üst Köşe Silüeti) */}
            <g transform="translate(335, 390)" className="animate-flower-sway">
              <path d="M 35 160 Q 25 85 15 20" stroke="#78350f" strokeWidth="7" fill="none" strokeLinecap="round" />
              <circle cx="5" cy="25" r="32" fill="#ea580c" opacity="0.88" />
              <circle cx="32" cy="12" r="28" fill="#dc2626" opacity="0.85" />
              <circle cx="-12" cy="42" r="24" fill="#f59e0b" opacity="0.9" />
            </g>

            {/* Rüzgârla Savrulan Altın ve Kızıl Akçaağaç Yaprakları */}
            {[
              { x: 65, y: 245, d: '0s', fill: '#dc2626' },
              { x: 145, y: 210, d: '2.4s', fill: '#ea580c' },
              { x: 225, y: 275, d: '4.8s', fill: '#d97706' },
              { x: 305, y: 235, d: '7.2s', fill: '#b91c1c' },
              { x: 105, y: 340, d: '9.6s', fill: '#f59e0b' },
              { x: 255, y: 365, d: '1.5s', fill: '#ea580c' },
            ].map((lf, idx) => (
              <g key={idx} transform={`translate(${lf.x}, ${lf.y})`}>
                <g className="animate-autumn-leaf" style={{ animationDelay: lf.d }}>
                  <path
                    d="M 0 -7 C 4 -4, 7 0, 3 5 C 1 7, -1 7, -3 5 C -7 0, -4 -4, 0 -7 Z"
                    fill={lf.fill}
                    opacity="0.88"
                  />
                </g>
              </g>
            ))}

            {/* Rüzgârla Salınan Altın Başaklar */}
            {[35, 82, 134, 192, 248, 312, 362].map((gx, i) => (
              <g
                key={i}
                transform={`translate(${gx}, 695)`}
                className="animate-grass-sway"
                style={{ animationDelay: `${(i % 4) * 0.6}s` }}
              >
                <path
                  d="M 0 40 Q -6 16 -10 0"
                  fill="none"
                  stroke="#fde68a"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  opacity="0.78"
                />
                <path
                  d="M 6 40 Q 12 18 15 4"
                  fill="none"
                  stroke="#fcd34d"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.72"
                />
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* J. CALM SEASHORE — SAKİN DENİZ KIYISI VE HAFİF DALGALAR */}
      {themeId === 'calm_seashore' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#bae6fd] via-[#7dd3fc] to-[#2dd4bf]">
          <svg
            viewBox="0 0 400 800"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <radialGradient id="seaSunGlow" cx="50%" cy="24%" r="50%">
                <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.95" />
                <stop offset="48%" stopColor="#fef08a" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#bae6fd" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="oceanHorizonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.88" />
                <stop offset="55%" stopColor="#0d9488" stopOpacity="0.92" />
                <stop offset="100%" stopColor="#99f6e4" stopOpacity="0.95" />
              </linearGradient>
            </defs>

            {/* Parlak Sahil Güneşi ve İnce Bulutlar */}
            <circle cx="200" cy="185" r="175" fill="url(#seaSunGlow)" className="animate-pulse-soft" />
            <circle cx="200" cy="185" r="36" fill="#fffbeb" opacity="0.94" />

            <g className="animate-cloud-drift" opacity="0.8">
              <ellipse cx="95" cy="145" rx="68" ry="17" fill="#ffffff" />
              <ellipse cx="305" cy="168" rx="74" ry="18" fill="#f0f9ff" />
            </g>

            {/* Ufukta Süzülen Martılar */}
            <g className="animate-bird-glide" opacity="0.68">
              <path
                d="M 120 225 Q 128 216 136 224 Q 144 216 152 225"
                fill="none"
                stroke="#0369a1"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M 255 205 Q 262 198 269 204 Q 276 198 283 205"
                fill="none"
                stroke="#0369a1"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </g>

            {/* Uzak Ada Tepeleri */}
            <path
              d="M -30 435 Q 65 395 155 435 Z"
              fill="#0369a1"
              opacity="0.45"
            />
            <path
              d="M 265 435 Q 345 402 430 435 Z"
              fill="#0f766e"
              opacity="0.45"
            />

            {/* Sakin Deniz Yüzeyi */}
            <rect x="0" y="432" width="400" height="260" fill="url(#oceanHorizonGrad)" />

            {/* Deniz Üzerinde Güneş Parıltıları */}
            {[
              { y: 455, rx: 56, ry: 3, d: '0s' },
              { y: 482, rx: 46, ry: 2.8, d: '1.2s' },
              { y: 512, rx: 38, ry: 2.5, d: '2.4s' },
              { y: 545, rx: 30, ry: 2.2, d: '0.8s' },
            ].map((sh, idx) => (
              <ellipse
                key={idx}
                cx="200"
                cy={sh.y}
                rx={sh.rx}
                ry={sh.ry}
                fill="#fef9c3"
                className="animate-water-shimmer"
                style={{ transformOrigin: `200px ${sh.y}px`, animationDelay: sh.d }}
              />
            ))}

            {/* Kıyıya Vuran Ritmik Köpüklü Dalga Katmanları */}
            <g className="animate-shore-wave">
              <path
                d="M -30 595 Q 95 582 200 596 T 430 590 L 430 625 L -30 625 Z"
                fill="#ccfbf1"
                opacity="0.62"
              />
              <path
                d="M -30 595 Q 95 582 200 596 T 430 590"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                opacity="0.85"
              />
            </g>

            <g className="animate-shore-wave" style={{ animationDelay: '2.4s' }}>
              <path
                d="M -30 638 Q 110 624 220 638 T 430 632 L 430 668 L -30 668 Z"
                fill="#f0fdfa"
                opacity="0.72"
              />
              <path
                d="M -30 638 Q 110 624 220 638 T 430 632"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                opacity="0.92"
              />
            </g>

            {/* Sıcak Kumlu Sahil Kıyısı */}
            <path
              d="M -30 662 Q 120 648 255 664 T 430 655 L 430 820 L -30 820 Z"
              fill="#fde68a"
              opacity="0.92"
            />
            <path
              d="M -30 695 Q 140 682 275 698 T 430 688 L 430 820 L -30 820 Z"
              fill="#fcd34d"
              opacity="0.85"
            />
          </svg>
        </div>
      )}

      {/* K. SNOWY WINTER — KARLI KIŞ SABAHI VE SÜZÜLEN KAR TANELERİ */}
      {themeId === 'snowy_winter' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#dbeafe] via-[#e2e8f0] to-[#f8fafc]">
          <svg
            viewBox="0 0 400 800"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <radialGradient id="winterSunGlow" cx="68%" cy="20%" r="48%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
                <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.58" />
                <stop offset="100%" stopColor="#dbeafe" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="snowSlope1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
              <linearGradient id="snowSlope2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>
            </defs>

            {/* Yumuşak Kış Güneşi ve Berrak Sabah Halesi */}
            <circle cx="272" cy="160" r="175" fill="url(#winterSunGlow)" className="animate-pulse-soft" />
            <circle cx="272" cy="160" r="32" fill="#ffffff" opacity="0.94" />

            {/* Yumuşak Kış Bulutları */}
            <g className="animate-cloud-drift" opacity="0.82">
              <ellipse cx="110" cy="150" rx="76" ry="20" fill="#ffffff" />
              <ellipse cx="235" cy="215" rx="68" ry="17" fill="#f8fafc" />
            </g>

            {/* Uzak Karlı Dağ Sırtları */}
            <polygon
              points="-40,505 70,385 175,465 285,370 430,490 430,600 -40,600"
              fill="#cbd5e1"
              opacity="0.78"
            />

            {/* Karla Örtülü Yumuşak Kış Tepeleri */}
            <path
              d="M -40 520 Q 105 468 245 512 T 440 495 L 440 820 L -40 820 Z"
              fill="url(#snowSlope1)"
            />

            {/* Nefes Alan Sabah Kırağı Sisi */}
            <ellipse
              cx="200"
              cy="555"
              rx="220"
              ry="24"
              fill="#ffffff"
              opacity="0.65"
              className="animate-mist-breathe"
            />

            {/* Karla Kaplı Huzurlu Çam Ağaçları */}
            {[
              { x: 58, y: 505, s: 0.95 },
              { x: 105, y: 528, s: 0.78 },
              { x: 315, y: 498, s: 1.02 },
              { x: 358, y: 522, s: 0.84 },
            ].map((tree, idx) => (
              <g key={idx} transform={`translate(${tree.x}, ${tree.y}) scale(${tree.s})`}>
                <polygon points="0,-42 -20,-10 20,-10" fill="#334155" />
                <polygon points="0,-42 -14,-20 14,-20" fill="#f8fafc" opacity="0.88" />
                <polygon points="0,-24 -26,12 26,12" fill="#1e293b" />
                <polygon points="0,-24 -18,-2 18,-2" fill="#f8fafc" opacity="0.85" />
                <polygon points="0,-4 -32,36 32,36" fill="#0f172a" />
                <polygon points="0,-4 -22,16 22,16" fill="#ffffff" opacity="0.82" />
              </g>
            ))}

            {/* Ön Plan Bembeyaz Kar Yamaçları */}
            <path
              d="M -40 595 Q 130 552 275 592 T 440 575 L 440 820 L -40 820 Z"
              fill="url(#snowSlope2)"
            />

            {/* SVG Katmanında Süzülen Seçkin Kar Kristalleri */}
            {[
              { x: 75, y: 240, d: '0s', r: 3.5 },
              { x: 165, y: 195, d: '2.8s', r: 3 },
              { x: 245, y: 265, d: '5.4s', r: 3.8 },
              { x: 325, y: 215, d: '8.1s', r: 3.2 },
              { x: 125, y: 335, d: '4.2s', r: 2.8 },
            ].map((sn, idx) => (
              <g key={idx} transform={`translate(${sn.x}, ${sn.y})`}>
                <g className="animate-winter-snow" style={{ animationDelay: sn.d }}>
                  <circle cx="0" cy="0" r={sn.r} fill="#ffffff" opacity="0.92" />
                </g>
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* Performans Dostu Çevresel Parçacık ve Yağmur Katmanı */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
};
