import React, { useEffect, useRef, useState } from 'react';
import { ThemeId } from '../data/dhikrs';

interface SceneBackgroundProps {
  themeId: ThemeId;
  reducedMotion: boolean;
}

export const SceneBackground: React.FC<SceneBackgroundProps> = ({ themeId, reducedMotion }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isTabHidden, setIsTabHidden] = useState<boolean>(false);
  const [osReducedMotion, setOsReducedMotion] = useState<boolean>(false);

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

  // Performans dostu requestAnimationFrame çevresel atmosfer katmanı (Yağmur damlaları, ateş böcekleri, polen/ışık zerreleri)
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

    // Temaya göre hafif parçacık havuzu (Mobil pil dostu düşük yoğunluk: 14-26 adet)
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      phase: number;
      kind: 'rain' | 'glass_drop' | 'firefly' | 'mote';
    }

    const particles: Particle[] = [];

    if (themeId === 'rainy') {
      // İnce yağmur çizgileri (24 adet) + camda yavaşça süzülen su damlaları (8 adet)
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
    } else if (themeId === 'night' || themeId === 'moonlit_nature') {
      // Çok hafif ateş böcekleri ve ay ışığı zerrecikleri (14 adet)
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
      // Doğa, Gün Doğumu, Gün Batımı, Huzurlu Bahçe: yumuşak gün ışığı parçacıkları (14 adet)
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
      const dt = Math.min(32, now - lastTime) / 16.67;
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
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transition-colors duration-700 ${
        isMotionPaused ? 'animations-paused' : ''
      }`}
      aria-hidden="true"
    >
      {/* A. NATURE — DOĞA (Yeşil tepeler, ağaçlar, rüzgârla salınan çimenler, kuşlar ve yumuşak güneş) */}
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
            </defs>

            {/* Yumuşak Güneş Işığı */}
            <circle cx="310" cy="145" r="175" fill="url(#natureSun)" className="animate-pulse-soft" />
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

      {/* B. RAINY — YAĞMURLU HAVA (Gri-mavi, açık mor ve yumuşak yeşil tonlarında huzurlu yağmur atmosferi) */}
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
                <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Bulutların Arasından Süzülen Yumuşak Işık */}
            <circle cx="200" cy="210" r="210" fill="url(#rainCloudLight)" className="animate-pulse-soft" />
            <polygon points="130,0 240,0 310,550 70,550" fill="url(#softRainBeam)" />

            {/* Yumuşak Yağmur Bulutları */}
            <g className="animate-cloud-drift">
              <ellipse cx="110" cy="110" rx="115" ry="34" fill="#64748b" opacity="0.55" />
              <ellipse cx="280" cy="135" rx="125" ry="38" fill="#475569" opacity="0.65" />
              <ellipse cx="195" cy="85" rx="130" ry="32" fill="#94a3b8" opacity="0.35" />
            </g>

            {/* Yağmur Altında Sakin Tepeler (Gri-mavi, açık mor ve yumuşak yeşil tonları) */}
            <path
              d="M -30 480 Q 105 435 235 475 T 430 450 L 430 800 L -30 800 Z"
              fill="#4c566a"
              opacity="0.7"
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

            {/* Su Birikintisinde Yumuşak Damla Halkaları */}
            <g className="animate-water-ripple" style={{ transformOrigin: '140px 690px' }}>
              <ellipse cx="140" cy="690" rx="36" ry="8" fill="none" stroke="#cbd5e1" strokeWidth="1" opacity="0.45" />
            </g>
            <g
              className="animate-water-ripple"
              style={{ transformOrigin: '265px 725px', animationDelay: '2.5s' }}
            >
              <ellipse cx="265" cy="725" rx="44" ry="10" fill="none" stroke="#cbd5e1" strokeWidth="1" opacity="0.4" />
            </g>
          </svg>
        </div>
      )}

      {/* C. NIGHT — GECE AMBİYANSI (Derin lacivert gökyüzü, ay ışığı, sakin yıldızlar ve doğa silüeti) */}
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
            </defs>

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

            {/* Uzakta Sakin Doğa ve Çam Silüetleri */}
            <path
              d="M -30 515 Q 105 465 235 505 T 430 480 L 430 800 L -30 800 Z"
              fill="#1e1b4b"
              opacity="0.85"
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

      {/* D. SUNRISE — GÜN DOĞUMU (Ufuktan yavaşça yükselen güneş, mavi-pembe-şeftali-altın geçişler) */}
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
            </defs>

            {/* Kesintisiz ve Yavaşça Yükselen Seher Güneşi */}
            <g className="animate-sunrise-cycle">
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

            {/* Gün Doğumu Tepeleri */}
            <path
              d="M -30 485 Q 95 435 225 475 T 430 455 L 430 800 L -30 800 Z"
              fill="#84a98c"
              opacity="0.65"
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

      {/* E. SUNSET — GÜN BATIMI (Dağların ardında alçalan güneş, turuncu-pembe-mor geçişler, sis ve su yansıması) */}
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

            {/* Ufukta Hafif Sis */}
            <g className="animate-cloud-drift" style={{ animationDelay: '3s' }}>
              <ellipse cx="200" cy="548" rx="220" ry="20" fill="#fed7aa" opacity="0.2" />
            </g>

            {/* Sakin Göl Yüzeyi ve Gün Batımı Su Yansımaları */}
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
                opacity="0.45"
                className="animate-water-ripple"
                style={{ transformOrigin: `200px ${rp.y}px`, animationDelay: rp.d }}
              />
            ))}
          </svg>
        </div>
      )}

      {/* F. MOONLIT NATURE — AY IŞIĞINDA DOĞA (Ay ışığıyla aydınlanan sakin göl, suda dalgalanmalar ve çiçekler) */}
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
            </defs>

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

            {/* Ay Işığında Sakin Göl ve Gümüş Su Dalgalanmaları */}
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
                opacity="0.42"
                className="animate-water-ripple"
                style={{ transformOrigin: `200px ${rp.y}px`, animationDelay: rp.d }}
              />
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

      {/* G. PEACEFUL GARDEN — HUZURLU BAHÇE (Renkli çiçekler, kelebekler, yumuşak gün ışığı ve pastel tonlar) */}
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
            </defs>

            {/* Yumuşak Bahçe Güneşi */}
            <circle cx="88" cy="140" r="190" fill="url(#gardenSun)" className="animate-pulse-soft" />
            <circle cx="88" cy="140" r="36" fill="#fffbeb" opacity="0.92" />

            {/* Yumuşak Pastel Bulutlar */}
            <g className="animate-cloud-drift">
              <ellipse cx="285" cy="145" rx="72" ry="19" fill="#ffffff" opacity="0.8" />
              <ellipse cx="145" cy="215" rx="64" ry="16" fill="#ffffff" opacity="0.72" />
            </g>

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

      {/* Performans Dostu Çevresel Parçacık ve Yağmur Katmanı */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
};
