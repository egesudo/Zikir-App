import React from 'react';

interface DhikrProgressCardProps {
  currentCount: number;
  targetCount: number;
  dhikrName: string;
  onIncrement: () => void;
}

export const DhikrProgressCard: React.FC<DhikrProgressCardProps> = ({
  currentCount,
  targetCount,
  dhikrName,
  onIncrement,
}) => {
  const safeTarget = Math.max(1, targetCount);
  const ratio = Math.min(1, Math.max(0, currentCount / safeTarget));

  // SVG Dairesel Progress Ring Hesaplamaları
  const size = 156;
  const strokeWidth = 6.5;
  const center = size / 2;
  const radius = center - strokeWidth - 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - ratio);

  // İlerleme ucundaki inci noktasının açısı (Üst merkez -90 dereceden başlar)
  const angleRad = (ratio * 360 - 90) * (Math.PI / 180);
  const tipX = center + radius * Math.cos(angleRad);
  const tipY = center + radius * Math.sin(angleRad);

  return (
    <div className="flex flex-col items-center justify-center select-none my-1">
      <div
        onClick={onIncrement}
        role="button"
        tabIndex={0}
        aria-label={`${dhikrName} sayacı: ${currentCount} / ${safeTarget}. İlerletmek için dokunun.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onIncrement();
          }
        }}
        className="group relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center rounded-full cursor-pointer active:scale-95 transition-transform duration-200"
      >
        {/* Arka planla görsel çakışmayı önleyen yumuşak dış ışık halesi */}
        <div
          className="pointer-events-none absolute -inset-3 rounded-full opacity-75 blur-xl transition-opacity"
          style={{
            background:
              'radial-gradient(circle, rgba(247, 241, 229, 0.72) 0%, rgba(235, 224, 204, 0.35) 60%, transparent 100%)',
          }}
        />

        {/* Yarı Saydam Sıcak Krem / İnci Buzlu Cam Madalyon Zemin */}
        <div className="absolute inset-2 rounded-full bg-[#F7F1E5]/82 backdrop-blur-md border border-[#E5D8C1]/90 shadow-[0_12px_30px_rgba(32,24,16,0.16),inset_0_1px_2px_rgba(255,255,255,0.75)]" />

        {/* Dairesel İlerleme Halkası (SVG Progress Ring) */}
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="relative z-10 w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="warmRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D69537" />
              <stop offset="50%" stopColor="#C28128" />
              <stop offset="100%" stopColor="#3B7A57" />
            </linearGradient>
            <filter id="softRingGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodColor="#C28128" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Arka İz Halkası (Yumuşak Kum Taşı) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(168, 146, 120, 0.28)"
            strokeWidth={strokeWidth}
          />

          {/* Aktif İlerleme Yay Çizgisi */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#warmRingGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${center} ${center})`}
            filter="url(#softRingGlow)"
            className="transition-all duration-300 ease-out"
          />

          {/* Başlangıç / İlerleme Ucundaki Zarif İnci Parıltısı */}
          <circle
            cx={currentCount > 0 ? tipX : center}
            cy={currentCount > 0 ? tipY : center - radius}
            r={4.2}
            fill="#FAF5EC"
            stroke="#C28128"
            strokeWidth="2"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Merkezdeki Sade ve Okunaklı Sayaç Rakamları */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-3">
          <span className="text-3xl sm:text-4xl font-bold tracking-tight text-[#2B2118] tabular-nums leading-none">
            {currentCount}
          </span>
          <span className="my-1.5 h-px w-8 bg-[#D5C5AC]" />
          <span className="text-xs sm:text-sm font-semibold text-[#756352] tabular-nums leading-none">
            / {safeTarget}
          </span>
        </div>
      </div>
    </div>
  );
};
