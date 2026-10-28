import React, { useState } from 'react';
import { ThemeId, THEMES } from '../data/dhikrs';

interface SceneBackgroundProps {
  themeId: ThemeId;
  reducedMotion: boolean;
}

export const SceneBackground: React.FC<SceneBackgroundProps> = ({ themeId, reducedMotion }) => {
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  const theme = THEMES[themeId] || THEMES.misty_valley;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none" aria-hidden="true">
      {/* 1. SEHER VAKTİ SİSLİ VADİ VE ALTIN IŞIK HUZMELERİ (Misty Dawn Valley) */}
      {themeId === 'misty_valley' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#f6d592] via-[#fbf0d4] to-[#c7e6d4]">
          <svg
            viewBox="0 0 400 800"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <radialGradient id="dawnSunGlow" cx="50%" cy="38%" r="55%">
                <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.98" />
                <stop offset="40%" stopColor="#fde68a" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="dawnBeam" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.52" />
                <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="mistLayer" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#fffbeb" stopOpacity="0.58" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Seher Güneşi ve Altın Işık Halesi */}
            <circle
              cx="200"
              cy="300"
              r="210"
              fill="url(#dawnSunGlow)"
              className={!reducedMotion ? 'animate-pulse-soft' : ''}
            />
            <circle cx="200" cy="300" r="42" fill="#fffbeb" opacity="0.9" />

            {/* Vadiden Süzülen Altın Güneş Huzmeleri */}
            <g
              transform="translate(200, 300)"
              className={!reducedMotion ? 'animate-ray' : ''}
            >
              {[-55, -30, -8, 15, 38, 60].map((angle) => (
                <polygon
                  key={angle}
                  points="0,0 -36,480 36,480"
                  fill="url(#dawnBeam)"
                  transform={`rotate(${angle})`}
                />
              ))}
            </g>

            {/* Uzak Seher Tepeleri */}
            <path
              d="M -30 430 Q 85 370 205 420 T 430 390 L 430 800 L -30 800 Z"
              fill="#84a98c"
              opacity="0.55"
            />

            {/* 1. Hareketli Sabah Sisi Katmanı */}
            <g className={!reducedMotion ? 'animate-cloud-drift' : ''}>
              <ellipse cx="180" cy="445" rx="220" ry="26" fill="url(#mistLayer)" />
            </g>

            {/* Orta Zümrüt-Adaçayı Vadi Yamaçları */}
            <path
              d="M -30 495 Q 115 440 245 485 T 430 465 L 430 800 L -30 800 Z"
              fill="#52796f"
              opacity="0.78"
            />

            {/* 2. Hareketli Sabah Sisi Katmanı */}
            <g
              className={!reducedMotion ? 'animate-cloud-drift' : ''}
              style={{ animationDelay: '3.5s' }}
            >
              <ellipse cx="230" cy="525" rx="240" ry="30" fill="url(#mistLayer)" />
            </g>

            {/* Ön Vadi Tepeleri ve Huzurlu Dere Yansıması */}
            <path
              d="M -30 565 Q 95 525 225 560 T 430 545 L 430 800 L -30 800 Z"
              fill="#354f52"
            />
            <path
              d="M -30 640 Q 130 600 275 635 T 430 620 L 430 800 L -30 800 Z"
              fill="#2f3e46"
            />

            {/* Vadinin İçinden Süzülen Altın Dere Yolu */}
            <path
              d="M 195 555 Q 160 615 215 675 T 185 800 L 245 800 Q 265 675 210 615 Z"
              fill="#fde68a"
              opacity="0.35"
            />

            {/* Seher Işık Zerrecikleri */}
            {[
              { cx: 95, cy: 365, r: 2.3, d: '0s' },
              { cx: 285, cy: 390, r: 2.6, d: '1.4s' },
              { cx: 155, cy: 485, r: 2.0, d: '2.6s' },
              { cx: 245, cy: 460, r: 2.4, d: '0.8s' },
              { cx: 198, cy: 615, r: 2.2, d: '1.9s' },
              { cx: 215, cy: 660, r: 2.5, d: '3.1s' },
            ].map((m, i) => (
              <circle
                key={i}
                cx={m.cx}
                cy={m.cy}
                r={m.r}
                fill="#fffbeb"
                className={!reducedMotion ? 'animate-mote' : ''}
                style={{ animationDelay: m.d }}
              />
            ))}
          </svg>
        </div>
      )}

      {/* 2. HUZURLU CAMİ AVLUSU, ŞADIRVAN VE ZEYTİN AĞAÇLARI (Mosque Courtyard) */}
      {themeId === 'mosque_courtyard' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#e9dcc4] via-[#f5eee0] to-[#d8cbb6]">
          <svg
            viewBox="0 0 400 800"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <radialGradient id="courtyardSun" cx="50%" cy="28%" r="60%">
                <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#fde68a" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#f5ebe0" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="stoneArchGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d6c7b2" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#b8a68e" stopOpacity="0.25" />
              </linearGradient>
            </defs>

            {/* Avlu İkindi Güneşi Halesi */}
            <circle
              cx="200"
              cy="220"
              r="220"
              fill="url(#courtyardSun)"
              className={!reducedMotion ? 'animate-pulse-soft' : ''}
            />

            {/* Zarif Geleneksel Kemer Silüeti (Arka Plan Mimari Doku) */}
            <path
              d="M 0 0 L 400 0 L 400 310 Q 340 210 290 310 L 290 290 Q 200 150 110 290 L 110 310 Q 60 210 0 310 Z"
              fill="url(#stoneArchGrad)"
            />

            {/* Sol Üstten Sarkıp Rüzgârda Salınan Zeytin Dalları */}
            <g
              className={!reducedMotion ? 'animate-flower-sway' : ''}
              style={{ transformOrigin: '0px 40px' }}
            >
              <path
                d="M -10 45 Q 55 75 115 62"
                fill="none"
                stroke="#5c5346"
                strokeWidth="2.5"
              />
              {[
                { x: 28, y: 58, rot: -25 },
                { x: 52, y: 66, rot: 20 },
                { x: 76, y: 65, rot: -18 },
                { x: 98, y: 63, rot: 15 },
              ].map((lf, i) => (
                <ellipse
                  key={i}
                  cx={lf.x}
                  cy={lf.y}
                  rx="11"
                  ry="4"
                  transform={`rotate(${lf.rot} ${lf.x} ${lf.y})`}
                  fill="#6b7f5e"
                />
              ))}
            </g>

            {/* Sağ Üstten Sarkan Zeytin Dalları */}
            <g
              className={!reducedMotion ? 'animate-flower-sway' : ''}
              style={{ transformOrigin: '400px 50px', animationDelay: '1.8s' }}
            >
              <path
                d="M 410 55 Q 340 88 282 72"
                fill="none"
                stroke="#5c5346"
                strokeWidth="2.5"
              />
              {[
                { x: 368, y: 70, rot: 22 },
                { x: 342, y: 78, rot: -20 },
                { x: 315, y: 77, rot: 18 },
                { x: 292, y: 73, rot: -15 },
              ].map((lf, i) => (
                <ellipse
                  key={i}
                  cx={lf.x}
                  cy={lf.y}
                  rx="11"
                  ry="4"
                  transform={`rotate(${lf.rot} ${lf.x} ${lf.y})`}
                  fill="#6b7f5e"
                />
              ))}
            </g>

            {/* Alt Bölüm: Mermer Şadırvan Havuzu ve Canlı Su Halkaları */}
            <ellipse
              cx="200"
              cy="695"
              rx="185"
              ry="68"
              fill="#b5c9c3"
              opacity="0.45"
            />
            <ellipse
              cx="200"
              cy="695"
              rx="150"
              ry="52"
              fill="#84a99c"
              opacity="0.38"
            />

            {/* Şadırvan Su Dalgaları (Ripples) */}
            <ellipse
              cx="200"
              cy="695"
              rx="92"
              ry="30"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
              opacity="0.55"
              className={!reducedMotion ? 'animate-pulse-soft' : ''}
            />
            <ellipse
              cx="200"
              cy="695"
              rx="52"
              ry="17"
              fill="none"
              stroke="#fffbeb"
              strokeWidth="1.4"
              opacity="0.65"
              className={!reducedMotion ? 'animate-pulse-soft' : ''}
              style={{ animationDelay: '1.5s' }}
            />

            {/* Avluda Süzülen Sıcak Güneş Zerrecikleri */}
            {[
              { cx: 115, cy: 280, r: 2.2, d: '0s' },
              { cx: 265, cy: 320, r: 2.5, d: '1.6s' },
              { cx: 160, cy: 440, r: 2.0, d: '2.4s' },
              { cx: 235, cy: 520, r: 2.4, d: '0.9s' },
              { cx: 195, cy: 675, r: 2.2, d: '1.8s' },
            ].map((m, i) => (
              <circle
                key={i}
                cx={m.cx}
                cy={m.cy}
                r={m.r}
                fill="#fde68a"
                className={!reducedMotion ? 'animate-mote' : ''}
                style={{ animationDelay: m.d }}
              />
            ))}
          </svg>
        </div>
      )}

      {/* 3. AKŞAMÜSTÜ SICAK LAVANTA VE KIR ÇİÇEKLERİ TEPESİ (Warm Lavender Hills) */}
      {themeId === 'lavender_hills' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#4c1d95] via-[#9d174d] to-[#f59e0b]">
          <svg
            viewBox="0 0 400 800"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <radialGradient id="lavenderSun" cx="50%" cy="46%" r="52%">
                <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#fde047" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Akşamüstü Altın Güneş Halesi */}
            <circle
              cx="200"
              cy="410"
              r="185"
              fill="url(#lavenderSun)"
              className={!reducedMotion ? 'animate-pulse-soft' : ''}
            />

            {/* Yavaşça Akan Pembe/Altın Akşamüstü Bulutları */}
            <g className={!reducedMotion ? 'animate-cloud-drift' : ''}>
              <ellipse cx="105" cy="155" rx="75" ry="20" fill="#fbcfe8" opacity="0.28" />
              <ellipse cx="315" cy="210" rx="85" ry="22" fill="#fde68a" opacity="0.25" />
            </g>

            {/* Katmanlı Lavanta Tepeleri */}
            <path
              d="M -30 485 Q 105 435 235 480 T 430 455 L 430 800 L -30 800 Z"
              fill="#7e22ce"
              opacity="0.72"
            />
            <path
              d="M -30 545 Q 140 495 280 540 T 430 515 L 430 800 L -30 800 Z"
              fill="#581c87"
            />
            <path
              d="M -30 615 Q 115 575 260 615 T 430 595 L 430 800 L -30 800 Z"
              fill="#3b0764"
            />

            {/* Rüzgârda Salınan Lavanta Başakları */}
            {[
              { x: 48, y: 635, s: 1, d: '0s' },
              { x: 92, y: 590, s: 0.85, d: '0.7s' },
              { x: 145, y: 655, s: 1.05, d: '1.4s' },
              { x: 205, y: 625, s: 0.95, d: '0.4s' },
              { x: 262, y: 660, s: 1.1, d: '1.9s' },
              { x: 318, y: 605, s: 0.9, d: '1.1s' },
              { x: 358, y: 645, s: 1, d: '2.3s' },
            ].map((lv, i) => (
              <g key={i} transform={`translate(${lv.x}, ${lv.y}) scale(${lv.s})`}>
                <g
                  className={!reducedMotion ? 'animate-flower-sway' : ''}
                  style={{ animationDelay: lv.d }}
                >
                  <line x1="0" y1="0" x2="0" y2="28" stroke="#4ade80" strokeWidth="1.6" opacity="0.65" />
                  <ellipse cx="0" cy="-2" rx="3.2" ry="5" fill="#d8b4fe" />
                  <ellipse cx="-2.5" cy="5" rx="2.8" ry="4" fill="#c084fc" />
                  <ellipse cx="2.5" cy="5" rx="2.8" ry="4" fill="#c084fc" />
                  <ellipse cx="0" cy="11" rx="3" ry="4" fill="#a855f7" />
                </g>
              </g>
            ))}

            {/* Süzülen Altın Polen ve Işık Zerrecikleri */}
            {[
              { cx: 85, cy: 390, r: 2.3, d: '0s' },
              { cx: 165, cy: 340, r: 2.6, d: '1.3s' },
              { cx: 245, cy: 375, r: 2.1, d: '2.5s' },
              { cx: 315, cy: 430, r: 2.5, d: '0.8s' },
              { cx: 135, cy: 520, r: 2.2, d: '1.9s' },
              { cx: 275, cy: 535, r: 2.4, d: '3.0s' },
            ].map((m, i) => (
              <circle
                key={i}
                cx={m.cx}
                cy={m.cy}
                r={m.r}
                fill="#fef08a"
                className={!reducedMotion ? 'animate-mote' : ''}
                style={{ animationDelay: m.d }}
              />
            ))}
          </svg>
        </div>
      )}

      {/* 4. BAHAR ÇAYIRI VE KELEBEKLER (Canlı Ambiyanslı Meadow) */}
      {themeId === 'meadow' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#93d5f6] via-[#dff2fc] to-[#fef3c7]">
          {/* Sol üst güneş ve nefes alan ışık huzmeleri */}
          <div className="absolute -top-10 -left-10 w-[520px] h-[520px]">
            <svg
              viewBox="0 0 400 400"
              className={`w-full h-full opacity-55 ${!reducedMotion ? 'animate-ray' : ''}`}
            >
              <defs>
                <radialGradient id="sunRayGrad" cx="25%" cy="25%" r="75%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="40%" stopColor="#fef08a" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
              </defs>
              <g transform="translate(90,90)">
                {[0, 18, 36, 54, 72, 90, 108, 126, 144].map((angle) => (
                  <polygon
                    key={angle}
                    points="0,0 360,-28 360,28"
                    fill="url(#sunRayGrad)"
                    transform={`rotate(${angle - 25})`}
                  />
                ))}
              </g>
            </svg>
            <div
              className={`absolute top-14 left-12 w-24 h-24 rounded-full ${
                !reducedMotion ? 'animate-pulse-soft' : ''
              }`}
              style={{
                background: 'radial-gradient(circle at 35% 35%, #fffbeb 0%, #fde047 65%, #facc15 100%)',
                boxShadow: '0 0 60px 24px rgba(254, 240, 138, 0.75)',
              }}
            />
          </div>

          {/* Yavaşça Süzülen Bulutlar */}
          <div
            className={`absolute top-[17%] right-[8%] w-64 h-20 rounded-full bg-white/80 blur-md ${
              !reducedMotion ? 'animate-cloud-drift' : ''
            }`}
          />
          <div
            className={`absolute top-[14%] right-[16%] w-36 h-16 rounded-full bg-white/85 blur-sm ${
              !reducedMotion ? 'animate-cloud-drift' : ''
            }`}
            style={{ animationDelay: '2.5s' }}
          />
          <div
            className={`absolute top-[25%] left-[12%] w-48 h-14 rounded-full bg-white/65 blur-md ${
              !reducedMotion ? 'animate-cloud-drift' : ''
            }`}
            style={{ animationDelay: '5s' }}
          />

          {/* Merkez ufuk parıltısı */}
          <div
            className="absolute top-[46%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(254,243,199,0.5) 50%, transparent 75%)',
            }}
          />

          <svg
            viewBox="0 0 400 800"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
          >
            <g className={!reducedMotion ? 'animate-float-slow' : ''}>
              <path
                d="M 95 340 Q 100 336 105 340 Q 110 336 115 340"
                fill="none"
                stroke="#475569"
                strokeWidth="1.3"
                opacity="0.55"
              />
              <path
                d="M 225 352 Q 229 349 233 352 Q 237 349 241 352"
                fill="none"
                stroke="#475569"
                strokeWidth="1.2"
                opacity="0.5"
              />
            </g>

            {/* Kelebekler */}
            <g className={!reducedMotion ? 'animate-butterfly' : ''} transform="translate(52, 368)">
              <path d="M 0 0 C -10 -12, -16 -2, -4 4 C -14 10, -8 18, 0 8 Z" fill="#fb923c" />
              <path d="M 2 0 C 12 -12, 18 -2, 6 4 C 16 10, 10 18, 2 8 Z" fill="#fdba74" />
              <line x1="1" y1="-2" x2="1" y2="10" stroke="#431407" strokeWidth="1.5" strokeLinecap="round" />
            </g>

            <g
              className={!reducedMotion ? 'animate-butterfly' : ''}
              style={{ animationDelay: '1.8s' }}
              transform="translate(188, 315) scale(0.85)"
            >
              <path d="M 0 0 C -10 -12, -16 -2, -4 4 C -14 10, -8 18, 0 8 Z" fill="#c084fc" />
              <path d="M 2 0 C 12 -12, 18 -2, 6 4 C 16 10, 10 18, 2 8 Z" fill="#e9d5ff" />
              <line x1="1" y1="-2" x2="1" y2="10" stroke="#3b0764" strokeWidth="1.5" strokeLinecap="round" />
            </g>

            <g
              className={!reducedMotion ? 'animate-butterfly' : ''}
              style={{ animationDelay: '3.4s' }}
              transform="translate(318, 442) scale(0.75)"
            >
              <path d="M 0 0 C -10 -12, -16 -2, -4 4 C -14 10, -8 18, 0 8 Z" fill="#f472b6" />
              <path d="M 2 0 C 12 -12, 18 -2, 6 4 C 16 10, 10 18, 2 8 Z" fill="#fbcfe8" />
              <line x1="1" y1="-2" x2="1" y2="10" stroke="#831843" strokeWidth="1.5" strokeLinecap="round" />
            </g>

            {/* Yeşil Çayır Tepeleri */}
            <path
              d="M -40 500 Q 95 450 240 495 T 440 480 L 440 820 L -40 820 Z"
              fill="#86efac"
            />
            <path
              d="M -40 545 Q 140 505 290 535 T 440 515 L 440 820 L -40 820 Z"
              fill="#4ade80"
            />
            <path
              d="M -40 610 Q 110 565 265 605 T 440 590 L 440 820 L -40 820 Z"
              fill="#22c55e"
            />

            {/* Rüzgârda Hafifçe Salınan Çayır Çiçekleri */}
            {[
              { x: 45, y: 635, color: '#ffffff', center: '#facc15', scale: 1, delay: '0s' },
              { x: 82, y: 565, color: '#ffffff', center: '#fb923c', scale: 0.75, delay: '0.8s' },
              { x: 125, y: 675, color: '#f472b6', center: '#fde047', scale: 0.9, delay: '1.6s' },
              { x: 175, y: 650, color: '#f43f5e', center: '#fef08a', scale: 1.1, delay: '0.4s' },
              { x: 225, y: 660, color: '#a855f7', center: '#fde047', scale: 0.8, delay: '2.1s' },
              { x: 288, y: 595, color: '#fbbf24', center: '#b45309', scale: 1.05, delay: '1.2s' },
              { x: 325, y: 645, color: '#ffffff', center: '#facc15', scale: 0.85, delay: '2.5s' },
              { x: 352, y: 575, color: '#f43f5e', center: '#fde047', scale: 0.9, delay: '0.9s' },
              { x: 368, y: 630, color: '#fb923c', center: '#fef08a', scale: 0.85, delay: '1.7s' },
            ].map((fl, i) => (
              <g key={i} transform={`translate(${fl.x}, ${fl.y}) scale(${fl.scale})`}>
                <g
                  className={!reducedMotion ? 'animate-flower-sway' : ''}
                  style={{ animationDelay: fl.delay }}
                >
                  <line x1="0" y1="0" x2="0" y2="18" stroke="#15803d" strokeWidth="2" />
                  <circle cx="-5" cy="-2" r="4" fill={fl.color} />
                  <circle cx="5" cy="-2" r="4" fill={fl.color} />
                  <circle cx="0" cy="-6" r="4" fill={fl.color} />
                  <circle cx="-3" cy="4" r="4" fill={fl.color} />
                  <circle cx="3" cy="4" r="4" fill={fl.color} />
                  <circle cx="0" cy="0" r="3" fill={fl.center} />
                </g>
              </g>
            ))}

            {/* Süzülen Taç Yapraklar ve Sıcak Işık Polenleri */}
            {[
              { cx: 115, cy: 315, r: 2.5, fill: '#f472b6', d: '0s' },
              { cx: 298, cy: 145, r: 3, fill: '#f472b6', d: '1.4s' },
              { cx: 355, cy: 245, r: 2.5, fill: '#f472b6', d: '2.8s' },
              { cx: 272, cy: 405, r: 3, fill: '#fb7185', d: '0.9s' },
              { cx: 148, cy: 465, r: 2.2, fill: '#fef08a', d: '2.1s' },
              { cx: 88, cy: 505, r: 2.5, fill: '#fef08a', d: '3.2s' },
            ].map((mote, i) => (
              <circle
                key={i}
                cx={mote.cx}
                cy={mote.cy}
                r={mote.r}
                fill={mote.fill}
                className={!reducedMotion ? 'animate-mote' : ''}
                style={{ animationDelay: mote.d }}
              />
            ))}
          </svg>
        </div>
      )}

      {/* 5. ŞAFAK VE DAĞ ESİNTİSİ (Sunset) */}
      {themeId === 'sunset' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#58355e] via-[#c08497] to-[#f7d0b6]">
          <svg
            viewBox="0 0 400 800"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <radialGradient id="sunsetSun" cx="50%" cy="52%" r="50%">
                <stop offset="0%" stopColor="#fffbeb" stopOpacity="1" />
                <stop offset="35%" stopColor="#fde68a" stopOpacity="0.85" />
                <stop offset="70%" stopColor="#fda4af" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#fda4af" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="rayBeam" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.42" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>

            <g
              transform="translate(200, 435)"
              className={!reducedMotion ? 'animate-ray' : ''}
            >
              {[-68, -42, -18, 6, 30, 56].map((angle) => (
                <polygon
                  key={angle}
                  points="0,0 -42,-520 42,-520"
                  fill="url(#rayBeam)"
                  transform={`rotate(${angle})`}
                />
              ))}
            </g>

            <circle
              cx="200"
              cy="435"
              r="175"
              fill="url(#sunsetSun)"
              className={!reducedMotion ? 'animate-pulse-soft' : ''}
            />
            <circle cx="200" cy="435" r="46" fill="#fef08a" opacity="0.85" />

            <g className={!reducedMotion ? 'animate-cloud-drift' : ''}>
              <ellipse cx="345" cy="125" rx="68" ry="22" fill="#ffffff" opacity="0.38" />
              <ellipse cx="85" cy="175" rx="58" ry="18" fill="#fbcfe8" opacity="0.28" />
            </g>
            <g
              className={!reducedMotion ? 'animate-cloud-drift' : ''}
              style={{ animationDelay: '4s' }}
            >
              <ellipse cx="310" cy="260" rx="95" ry="28" fill="#fde68a" opacity="0.26" />
            </g>

            <path
              d="M -20 465 L 45 390 L 115 435 L 185 415 L 255 445 L 335 385 L 420 430 L 420 800 L -20 800 Z"
              fill="#8b5cf6"
              opacity="0.38"
            />
            <path
              d="M -20 515 L 65 460 L 145 495 L 235 450 L 315 485 L 420 455 L 420 800 L -20 800 Z"
              fill="#5b3765"
            />
            <path
              d="M -20 585 L 85 545 L 165 570 L 260 530 L 345 565 L 420 540 L 420 800 L -20 800 Z"
              fill="#3d2247"
            />
            <path
              d="M -20 655 Q 110 635 215 655 T 420 645 L 420 800 L -20 800 Z"
              fill="#24112b"
            />

            {[
              { cx: 110, cy: 360, r: 2.2, d: '0s' },
              { cx: 280, cy: 340, r: 2.5, d: '1.6s' },
              { cx: 165, cy: 290, r: 1.8, d: '2.9s' },
              { cx: 235, cy: 385, r: 2.3, d: '0.8s' },
            ].map((m, i) => (
              <circle
                key={i}
                cx={m.cx}
                cy={m.cy}
                r={m.r}
                fill="#fef3c7"
                className={!reducedMotion ? 'animate-mote' : ''}
                style={{ animationDelay: m.d }}
              />
            ))}
          </svg>
        </div>
      )}

      {/* 6. GECE VE KOZMİK SEMÂ (Cosmos) */}
      {themeId === 'cosmos' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#14092b] via-[#2e145c] to-[#1a0b36]">
          <svg
            viewBox="0 0 400 800"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <radialGradient id="nebulaGlow" cx="50%" cy="48%" r="55%">
                <stop offset="0%" stopColor="#9333ea" stopOpacity="0.36" />
                <stop offset="60%" stopColor="#4f46e5" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#14092b" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="planetBody" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#fed7aa" />
                <stop offset="55%" stopColor="#c08497" />
                <stop offset="100%" stopColor="#4c1d95" />
              </radialGradient>
              <radialGradient id="blueMoon" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="50%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </radialGradient>
            </defs>

            <circle
              cx="200"
              cy="390"
              r="240"
              fill="url(#nebulaGlow)"
              className={!reducedMotion ? 'animate-pulse-soft' : ''}
            />

            {[
              [42, 78, 1.3], [128, 52, 1.6], [240, 88, 1.1], [350, 180, 1.5],
              [68, 210, 1.8], [312, 240, 1.3], [92, 330, 1.4], [285, 315, 1.5],
              [45, 450, 1.2], [155, 480, 1.4], [338, 465, 1.7], [85, 560, 1.3],
              [290, 580, 1.5], [140, 670, 1.4], [320, 685, 1.2], [210, 725, 1.5],
            ].map(([cx, cy, r], idx) => (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r={r}
                fill="#ffffff"
                className={!reducedMotion ? 'animate-twinkle' : ''}
                style={{ animationDelay: `${(idx % 5) * 0.85}s` }}
              />
            ))}

            <line
              x1="135"
              y1="245"
              x2="92"
              y2="290"
              stroke="#e9d5ff"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.7"
            />
            <circle cx="92" cy="290" r="3" fill="#ffffff" />

            <g className={!reducedMotion ? 'animate-float-slow' : ''}>
              <g transform="translate(325, 92) rotate(-16)">
                <ellipse
                  cx="0"
                  cy="0"
                  rx="64"
                  ry="16"
                  fill="none"
                  stroke="#e9d5ff"
                  strokeWidth="2.5"
                  opacity="0.45"
                />
                <ellipse
                  cx="0"
                  cy="0"
                  rx="52"
                  ry="12"
                  fill="none"
                  stroke="#f5d0fe"
                  strokeWidth="1.4"
                  opacity="0.65"
                />
                <circle cx="0" cy="0" r="28" fill="url(#planetBody)" />
              </g>
            </g>

            <circle
              cx="48"
              cy="618"
              r="16"
              fill="url(#blueMoon)"
              className={!reducedMotion ? 'animate-pulse-soft' : ''}
            />

            {[
              { x: 345, y: 128, s: 1, d: '0s' },
              { x: 65, y: 198, s: 0.75, d: '1.2s' },
              { x: 142, y: 398, s: 0.9, d: '2.4s' },
              { x: 245, y: 638, s: 0.85, d: '0.7s' },
            ].map((st, i) => (
              <g key={i} transform={`translate(${st.x}, ${st.y}) scale(${st.s})`}>
                <g
                  className={!reducedMotion ? 'animate-twinkle' : ''}
                  style={{ animationDelay: st.d }}
                >
                  <circle cx="0" cy="0" r="8" fill="#c084fc" opacity="0.35" />
                  <path
                    d="M 0 -10 Q 0 0 10 0 Q 0 0 0 10 Q 0 0 -10 0 Q 0 0 0 -10 Z"
                    fill="#ffffff"
                  />
                </g>
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* 7. ZÜMRÜT GÖL VE YEŞİL TEPELER */}
      {themeId === 'emerald_lake' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#14532d] via-[#065f46] to-[#064e3b]">
          {theme.imageUrl && !imgError[themeId] && (
            <img
              src={theme.imageUrl}
              alt="Zümrüt Göl ve Yeşil Tepeler"
              referrerPolicy="no-referrer"
              onError={() => setImgError((prev) => ({ ...prev, [themeId]: true }))}
              className={`w-full h-full object-cover object-center ${
                !reducedMotion ? 'animate-ambient-pan' : 'scale-105'
              }`}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-emerald-950/25 to-black/55" />

          {!reducedMotion && (
            <svg
              viewBox="0 0 400 800"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 w-full h-full"
            >
              {[
                { cx: 185, cy: 525, r: 2.2, d: '0s' },
                { cx: 225, cy: 540, r: 2.6, d: '1.1s' },
                { cx: 260, cy: 530, r: 2.0, d: '2.3s' },
                { cx: 205, cy: 555, r: 2.4, d: '0.6s' },
                { cx: 150, cy: 545, r: 1.8, d: '1.8s' },
                { cx: 120, cy: 310, r: 2.2, d: '0.9s' },
                { cx: 295, cy: 260, r: 2.0, d: '2.7s' },
              ].map((sp, i) => (
                <circle
                  key={i}
                  cx={sp.cx}
                  cy={sp.cy}
                  r={sp.r}
                  fill="#fef9c3"
                  className="animate-twinkle"
                  style={{ animationDelay: sp.d }}
                />
              ))}
            </svg>
          )}
        </div>
      )}

      {/* 8. ÇİÇEKLİ PATİKA TABLOSU */}
      {themeId === 'painted_valley' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#7dd3fc] via-[#65a30d] to-[#3f6212]">
          {theme.imageUrl && !imgError[themeId] && (
            <img
              src={theme.imageUrl}
              alt="Çiçekli Patika Tablosu"
              referrerPolicy="no-referrer"
              onError={() => setImgError((prev) => ({ ...prev, [themeId]: true }))}
              className={`w-full h-full object-cover object-center ${
                !reducedMotion ? 'animate-ambient-pan' : 'scale-105'
              }`}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/45 via-stone-900/20 to-stone-950/60" />

          {!reducedMotion && (
            <svg
              viewBox="0 0 400 800"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 w-full h-full"
            >
              {[
                { cx: 95, cy: 580, r: 2.5, fill: '#fef08a', d: '0s' },
                { cx: 185, cy: 620, r: 2.2, fill: '#fed7aa', d: '1.5s' },
                { cx: 280, cy: 550, r: 2.6, fill: '#fef08a', d: '2.8s' },
                { cx: 145, cy: 440, r: 2.0, fill: '#ffffff', d: '0.7s' },
                { cx: 255, cy: 380, r: 2.3, fill: '#fef3c7', d: '2.1s' },
                { cx: 320, cy: 490, r: 2.1, fill: '#fed7aa', d: '3.3s' },
              ].map((m, i) => (
                <circle
                  key={i}
                  cx={m.cx}
                  cy={m.cy}
                  r={m.r}
                  fill={m.fill}
                  className="animate-mote"
                  style={{ animationDelay: m.d }}
                />
              ))}
            </svg>
          )}
        </div>
      )}
    </div>
  );
};
