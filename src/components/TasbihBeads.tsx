import React, { useEffect, useRef, useState } from 'react';
import { ThemeConfig } from '../data/dhikrs';

interface TasbihBeadsProps {
  currentCount: number;
  theme: ThemeConfig;
  reducedMotion: boolean;
  onBeadTap?: () => void;
}

// Kavisli ip üzerindeki noktaları hesaplayan yardımcı fonksiyon (Quadratic Bezier + Çekiş Esnemesi)
function getPointOnCurve(t: number, sagExtra = 0): { x: number; y: number } {
  const p0 = { x: -35, y: 64 };
  const p1 = { x: 200, y: 156 + sagExtra };
  const p2 = { x: 435, y: 58 };

  const invT = 1 - t;
  const x = invT * invT * p0.x + 2 * invT * t * p1.x + t * t * p2.x;
  const y = invT * invT * p0.y + 2 * invT * t * p1.y + t * t * p2.y;
  return { x, y };
}

export const TasbihBeads: React.FC<TasbihBeadsProps> = ({
  currentCount,
  theme,
  reducedMotion,
  onBeadTap,
}) => {
  // pullProgress: 1 -> yeni çekildi (sağdan sola kayıyor), 0 -> yerine oturdu
  const [pullProgress, setPullProgress] = useState(0);
  const [plusOneKey, setPlusOneKey] = useState<number | null>(null);
  const prevCountRef = useRef<number>(currentCount);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (currentCount === prevCountRef.current) return;
    const isIncrement = currentCount > prevCountRef.current;
    prevCountRef.current = currentCount;

    if (!isIncrement || currentCount === 0) {
      setPullProgress(0);
      return;
    }

    setPlusOneKey(currentCount);

    if (reducedMotion) {
      setPullProgress(0);
      return;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    const duration = 290; // ms - doğal parmak çekiş süresi
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const rawT = Math.min(1, elapsed / duration);
      // Doğal yay/sürtünme eğrisi (Ease-Out Quart)
      const eased = 1 - Math.pow(1 - rawT, 3.6);
      setPullProgress(1 - eased);

      if (rawT < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setPullProgress(0);
      }
    };

    setPullProgress(1);
    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [currentCount, reducedMotion]);

  // Çekiş sırasında ipin merkezde hafifçe aşağı esnemesi (gerçekçi parmak çekiş fiziği)
  const cordSag = Math.sin(pullProgress * Math.PI) * 6.5;

  // İmame (Baş Boncuk) sol-orta odakta (t = 0.22), sağdan sola doğru çekilen boncuklar
  const imameT = 0.21;
  const imamePos = getPointOnCurve(imameT, cordSag * 0.65);
  const stepT = 0.088;

  // İmamenin soluna geçmiş (çekilmiş) boncuklar (-2, -1) ve sağdan gelen boncuklar (1..9)
  const beadSlots = [-2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  // Aktif çekilen odak boncuğu (slot 2 - tam merkezde)
  const activeFocusPos = getPointOnCurve(imameT + 2 * stepT, cordSag);

  return (
    <div
      onClick={onBeadTap}
      role="presentation"
      className="relative w-full max-w-[460px] mx-auto h-44 sm:h-48 flex items-center justify-center cursor-pointer select-none"
    >
      {/* +1 Mikro Geri Bildirim Animasyonu */}
      {plusOneKey !== null && currentCount > 0 && (
        <div
          key={plusOneKey}
          className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 z-30 animate-rise-fade"
        >
          <span
            className="font-bold text-xl tracking-tight px-2.5 py-0.5 rounded-full bg-[#FAF5EC]/85 text-[#9E641A] shadow-sm border border-[#E5D7C0]"
          >
            +1
          </span>
        </div>
      )}

      <svg
        viewBox="0 0 400 195"
        className="w-full h-full overflow-visible drop-shadow-[0_10px_18px_rgba(0,0,0,0.28)]"
      >
        <defs>
          {/* Altın İmame Gradyanı */}
          <radialGradient id="goldImameGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="35%" stopColor="#facc15" />
            <stop offset="75%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#713f12" />
          </radialGradient>

          {/* Altın Püskül Gradyanı */}
          <linearGradient id="goldTasselGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>

          {/* Her tema boncuğu için 3B küresel parlaklık gradyanları */}
          {theme.beads.map((bead, idx) => (
            <radialGradient
              key={idx}
              id={`beadGrad-${theme.id}-${idx}`}
              cx="32%"
              cy="28%"
              r="72%"
            >
              <stop offset="0%" stopColor={bead.highlight} />
              <stop offset="42%" stopColor={bead.base} />
              <stop offset="84%" stopColor={bead.shadow} />
              <stop offset="100%" stopColor="#09090b" />
            </radialGradient>
          ))}
        </defs>

        {/* Boydan Boya Kavisli Tesbih İpi (Çekiş esnasında doğal esner) */}
        <path
          d={`M -35 64 Q 200 ${156 + cordSag} 435 58`}
          fill="none"
          stroke={theme.isDarkText ? 'rgba(92, 64, 48, 0.55)' : 'rgba(250, 245, 236, 0.65)'}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        {/* İp İkinci İnce Dokuma Parıltısı */}
        <path
          d={`M -35 63 Q 200 ${155 + cordSag} 435 57`}
          fill="none"
          stroke="rgba(254, 240, 138, 0.35)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />

        {/* Merkez Odak Boncuğu Etrafındaki Zarif Huzur Halkası */}
        <g transform={`translate(${activeFocusPos.x}, ${activeFocusPos.y})`}>
          <circle
            cx="0"
            cy="0"
            r={26 + pullProgress * 4}
            fill="none"
            stroke="#FAF5EC"
            strokeWidth="1.4"
            opacity={0.55 + pullProgress * 0.25}
          />
          <circle
            cx="0"
            cy="0"
            r={33 + pullProgress * 5}
            fill="none"
            stroke={theme.accentColor}
            strokeWidth="0.9"
            opacity="0.35"
          />
        </g>

        {/* Kavis Üzerinde Gerçekçi Biçimde Kayan Boncuklar */}
        {beadSlots.map((slotIndex) => {
          // Her dokunuşta sağdaki boncuk bir önceki boncuğun (solundaki) konumuna doğru eğri boyunca kayar
          const effectiveSlot = slotIndex + pullProgress;
          const t = imameT + effectiveSlot * stepT;
          const pos = getPointOnCurve(t, cordSag);

          // Boncuğun mutlak zikir sıra numarası (her dokunuşta tüm dizi 1 adım sola ilerler)
          const beadAbsoluteIndex = Math.max(0, currentCount + slotIndex);
          const colorIdx = beadAbsoluteIndex % theme.beads.length;
          const beadColor = theme.beads[colorIdx];

          // Geleneksel 11 ve 22. duraklarda "Nişane/Durak" altın halkalı boncuk işareti
          const isNisaneDivider =
            beadAbsoluteIndex > 0 && beadAbsoluteIndex % 11 === 0;

          // Merkez odak boncuğu (slot 2) parmakla çekilirken hafifçe büyür
          const distFromFocus = Math.abs(effectiveSlot - 2);
          const perspectiveScale =
            distFromFocus < 1.2
              ? 1 + (1.2 - distFromFocus) * 0.11 + pullProgress * 0.04
              : 0.96;

          const isFocusedBead = slotIndex === 2 || slotIndex === 1;

          return (
            <g
              key={slotIndex}
              transform={`translate(${pos.x}, ${pos.y}) scale(${perspectiveScale})`}
            >
              {/* Boncuk Alt Gölgesi */}
              <circle
                cx="0"
                cy="3"
                r="16.5"
                fill="rgba(0,0,0,0.22)"
              />

              {/* Boncuk Dış Işıması */}
              {isFocusedBead && (
                <circle
                  cx="0"
                  cy="0"
                  r="20"
                  fill={beadColor.glow}
                  style={{ filter: 'blur(5px)' }}
                  opacity="0.6"
                />
              )}

              {/* Ana Boncuk Küresi */}
              <circle
                cx="0"
                cy="0"
                r="16.5"
                fill={`url(#beadGrad-${theme.id}-${colorIdx})`}
              />

              {/* Ahşap / Kehribar Damar Dokusu */}
              {beadColor.woodGrain && (
                <g opacity="0.24" stroke="#fef3c7" fill="none" strokeWidth="1.1">
                  <path d="M -11 -6 Q -2 -10 9 -4" />
                  <path d="M -12 3 Q 0 8 11 2" />
                </g>
              )}

              {/* Yakut / Ametist Kesme (Faceted) Deseni */}
              {beadColor.faceted && (
                <g opacity="0.32">
                  <polygon points="0,-14 11,-5 7,10 -7,10 -11,-5" fill={beadColor.highlight} />
                  <polygon points="0,-8 7,-2 4,7 -4,7 -7,-2" fill="#ffffff" />
                </g>
              )}

              {/* Kozmik Yıldız Tozu Deseni */}
              {beadColor.starry && (
                <g>
                  <circle cx="-4" cy="-3" r="1.4" fill="#ffffff" opacity="0.9" />
                  <circle cx="5" cy="4" r="1.1" fill="#f5d0fe" opacity="0.85" />
                  <circle cx="3" cy="-6" r="0.9" fill="#ffffff" opacity="0.75" />
                  <circle cx="-6" cy="5" r="1" fill="#e879f9" opacity="0.8" />
                </g>
              )}

              {/* Her 11. Boncukta Geleneksel Altın Nişane (Durak) Kuşağı */}
              {isNisaneDivider && (
                <g>
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="3.2"
                    ry="16.6"
                    fill="none"
                    stroke="#fde047"
                    strokeWidth="2.2"
                    opacity="0.9"
                  />
                  <circle cx="0" cy="-16.5" r="2.2" fill="#fef08a" />
                </g>
              )}

              {/* Boncuk Üst Parlama Noktası (Specular Highlight) */}
              <ellipse
                cx="-5"
                cy="-5.5"
                rx="5.5"
                ry="3.2"
                transform="rotate(-28 -5 -5.5)"
                fill="#ffffff"
                opacity="0.68"
              />
            </g>
          );
        })}

        {/* Altın İmame (Baş Boncuk) ve Çekişle Salınan Püskülü */}
        <g transform={`translate(${imamePos.x}, ${imamePos.y})`}>
          {/* İmame Üst Işıltısı */}
          <g transform="translate(-8, -28)">
            <path
              d="M 0 -7 Q 0 0 7 0 Q 0 0 0 7 Q 0 0 -7 0 Q 0 0 0 -7 Z"
              fill="#ffffff"
              opacity={0.75 + pullProgress * 0.25}
            />
          </g>

          {/* Altın Püskül (Her boncuk çekilişinde doğal biçimde salınır) */}
          <g
            transform={`translate(0, 16) rotate(${
              4 + Math.sin(pullProgress * Math.PI) * 7.5
            })`}
          >
            {/* Püskül Boğumu */}
            <rect x="-3.5" y="0" width="7" height="6" rx="2" fill="url(#goldTasselGrad)" />
            {/* Püskül Telleri */}
            <path
              d="M -3 5 L -11 46 L 11 46 L 3 5 Z"
              fill="url(#goldTasselGrad)"
            />
            {[-8, -5, -2, 1, 4, 7].map((lx, i) => (
              <line
                key={i}
                x1={lx * 0.3}
                y1="6"
                x2={lx}
                y2="46"
                stroke="#713f12"
                strokeWidth="0.65"
                opacity="0.55"
              />
            ))}
          </g>

          {/* Altın İmame Küresi */}
          <circle cx="0" cy="0" r="20.5" fill="url(#goldImameGrad)" />

          {/* İmame Üzerindeki Geleneksel Yatay Oluk Çizgileri */}
          <path
            d="M -19 -5 Q 0 -2 19 -5"
            fill="none"
            stroke="#854d0e"
            strokeWidth="1.2"
            opacity="0.65"
          />
          <path
            d="M -20 1 Q 0 4 20 1"
            fill="none"
            stroke="#854d0e"
            strokeWidth="1.3"
            opacity="0.7"
          />
          <path
            d="M -18 7 Q 0 10 18 7"
            fill="none"
            stroke="#854d0e"
            strokeWidth="1.2"
            opacity="0.65"
          />

          {/* İmame Parlaklık Noktası */}
          <ellipse
            cx="-6"
            cy="-7"
            rx="6.5"
            ry="3.8"
            transform="rotate(-25 -6 -7)"
            fill="#ffffff"
            opacity="0.78"
          />
        </g>
      </svg>
    </div>
  );
};
