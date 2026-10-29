/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Scroll,
  Heart,
  Copy,
  Check,
  ChevronUp,
  FoldHorizontal,
} from 'lucide-react';
import { ThemeConfig } from '../data/dhikrs';
import { getDailyReflection } from '../data/reflections';
import { loadFavoriteReflections, toggleFavoriteReflection } from '../utils/storage';
import { triggerHaptic } from '../utils/sound';

interface DailyReflectionCardProps {
  theme: ThemeConfig;
  reducedMotion?: boolean;
}

export const DailyReflectionCard: React.FC<DailyReflectionCardProps> = ({
  theme,
  reducedMotion = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('daily_reflection_expanded');
      return stored !== null ? JSON.parse(stored) : false; // Varsayılan olarak kompakt serit halinde baslar
    } catch {
      return false;
    }
  });

  const [favorites, setFavorites] = useState<string[]>(() => loadFavoriteReflections());
  const [copied, setCopied] = useState<boolean>(false);

  // Her gün için kesin olarak sadece TEK 1 ayet/hadis (bugünün tefekkürü)
  const { item } = getDailyReflection(0);
  const isFavorite = favorites.includes(item.id);

  // Haritayı açma/katlama durumunu sakla
  const handleToggleExpand = () => {
    triggerHaptic(true, 14);
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('daily_reflection_expanded', JSON.stringify(next));
      } catch {
        // sessizce devam et
      }
      return next;
    });
  };

  // Favoriye ekleme/çıkarma
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(true, 20);
    const result = toggleFavoriteReflection(item.id);
    setFavorites(result.favorites);
  };

  // Panoya estetik kopyalama
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(true, 16);
    const textToCopy = `« ${item.translation} »\n\n${item.arabic}\n— ${item.source}\n(Günün Tefekkürü · Allah'a Adım Adım)`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
    } catch {
      // kopyalama başarısız olursa sessizce geç
    }
  };

  useEffect(() => {
    if (copied) {
      const timer = window.setTimeout(() => setCopied(false), 2200);
      return () => window.clearTimeout(timer);
    }
  }, [copied]);

  const isDarkText = theme.isDarkText;

  return (
    <div className="w-full max-w-lg mx-auto relative select-none">
      {/* 1. KAPALI DURUM: Tek Satırlık Kompakt Şerit (Minimum Dikey Alan) */}
      {!isExpanded && (
        <article
          role="button"
          tabIndex={0}
          onClick={handleToggleExpand}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggleExpand();
            }
          }}
          aria-label="Günün Tefekkürü Haritasını Aç"
          className={`w-full group cursor-pointer rounded-2xl border transition-all duration-300 py-2 px-3.5 sm:px-4 flex items-center justify-between shadow-sm backdrop-blur-xl ${
            isDarkText
              ? 'bg-[#F7F1E5]/85 hover:bg-[#F7F1E5] border-[#D8C7B0] text-[#2C2117] hover:shadow-md'
              : 'bg-[#18211E]/75 hover:bg-[#18211E]/90 border-[#455A52]/60 text-[#FAF5EC] hover:shadow-lg'
          }`}
        >
          {/* Sol Kısım: Küçük İkon + Günün Tefekkürü Başlığı + Konu Rozeti */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-sm"
              style={{
                backgroundColor: isDarkText ? 'rgba(44, 33, 23, 0.08)' : 'rgba(255, 255, 255, 0.12)',
                color: theme.accentColor,
              }}
            >
              <Scroll className="w-3.5 h-3.5" />
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-semibold tracking-wide truncate">
                Günün Tefekkürü
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                  isDarkText
                    ? 'bg-[#E7DAC6] text-[#3D2D20]'
                    : 'bg-[#2A3933] text-[#E4D7C2]'
                }`}
              >
                {item.topic}
              </span>
            </div>
          </div>

          {/* Sağ Kısım: "Haritayı Aç" Daveti ve Açılış İkonu */}
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span
              className={`text-[11px] font-medium hidden xs:inline-block opacity-75 group-hover:opacity-100 transition-opacity ${
                isDarkText ? 'text-[#614E3D]' : 'text-[#C5D0CB]'
              }`}
            >
              Haritayı Aç
            </span>

            <div
              className="p-1 rounded-full transition-transform group-hover:scale-110"
              style={{ color: theme.accentColor }}
            >
              <FoldHorizontal className="w-4 h-4 rotate-90" />
            </div>
          </div>
        </article>
      )}

      {/* 2. AÇIK DURUM: Sağa ve Sola Doğru İki Kanatlı Harita / Parşömen Açılımı */}
      {isExpanded && (
        <article
          aria-label="Günün Tefekkürü Açılmış Harita"
          style={{ perspective: '1200px' }}
          className={`w-full rounded-3xl border relative overflow-hidden backdrop-blur-2xl transition-all duration-500 ease-out shadow-2xl ${
            reducedMotion
              ? 'opacity-100'
              : 'animate-in fade-in duration-300'
          } ${
            isDarkText
              ? 'bg-[#F9F4EB]/95 border-[#D0BF98] text-[#2C2117] shadow-[0_16px_40px_rgba(44,33,23,0.12)]'
              : 'bg-[#141C19]/90 border-[#3D524A] text-[#FAF5EC] shadow-[0_20px_48px_rgba(0,0,0,0.45)]'
          }`}
        >
          {/* Parşömen / Harita Rulosu Yan Kenarları (Sol ve Sağ Rulo Efekti) */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1.5 opacity-90 rounded-l-3xl"
            style={{
              background: `linear-gradient(180deg, ${theme.accentColor}, #8A6D3B, ${theme.accentColor})`,
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-1.5 opacity-90 rounded-r-3xl"
            style={{
              background: `linear-gradient(180deg, ${theme.accentColor}, #8A6D3B, ${theme.accentColor})`,
            }}
          />

          {/* İki Kanatlı Harita Açılım Konteyneri (Sağ ve Sola Doğru Açılma Efekti) */}
          <div
            className={`w-full px-4 sm:px-6 py-4 transition-all duration-500 ${
              reducedMotion
                ? ''
                : 'origin-center scale-x-100 animate-in zoom-in-95 duration-400'
            }`}
          >
            {/* Üst Bar: Başlık, Rozet ve Hızlı Eylemler */}
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isDarkText
                      ? 'rgba(44, 33, 23, 0.08)'
                      : 'rgba(255, 255, 255, 0.12)',
                    color: theme.accentColor,
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                    Günün Tefekkürü
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      isDarkText
                        ? 'bg-[#E7DAC6] text-[#3D2D20]'
                        : 'bg-[#2A3933] text-[#E4D7C2]'
                    }`}
                  >
                    {item.topic}
                  </span>
                </div>
              </div>

              {/* Aksiyon Butonları Grubu */}
              <div className="flex items-center gap-1">
                {/* Favori Butonu */}
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  aria-label={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                  className={`p-1.5 rounded-full transition-transform active:scale-90 ${
                    isFavorite
                      ? 'text-[#E05353] opacity-100'
                      : isDarkText
                      ? 'text-[#6B5A4B] opacity-75 hover:bg-[#EBE0CF]'
                      : 'text-[#D0DBD5] opacity-75 hover:bg-[#2A3933]'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-current' : ''}`}
                  />
                </button>

                {/* Kopyalama Butonu */}
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label="Tefekkürü Kopyala"
                  className={`p-1.5 rounded-full transition-all active:scale-90 ${
                    copied
                      ? 'text-[#2E7D32] bg-[#E8F5E9] opacity-100'
                      : isDarkText
                      ? 'text-[#6B5A4B] opacity-75 hover:bg-[#EBE0CF]'
                      : 'text-[#D0DBD5] opacity-75 hover:bg-[#2A3933]'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>

                {/* Haritayı Katla / Kapat Butonu */}
                <button
                  type="button"
                  onClick={handleToggleExpand}
                  aria-label="Haritayı Katla"
                  className={`p-1.5 rounded-full transition-colors ${
                    isDarkText
                      ? 'text-[#6B5A4B] hover:bg-[#EBE0CF]'
                      : 'text-[#D0DBD5] hover:bg-[#2A3933]'
                  }`}
                  title="Haritayı Katla"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Kopyalandı Bildirimi */}
            {copied && (
              <div
                role="status"
                className="my-2 py-1 px-3 rounded-lg text-center text-xs font-medium bg-[#2E7D32]/15 text-[#2E7D32] border border-[#2E7D32]/30 animate-in fade-in duration-200"
              >
                Tefekkür panoya kopyalandı
              </div>
            )}

            {/* Harita / Parşömen Gövdesi (Sağ & Sol İki Kanatlı Açılım Hissi) */}
            <div className="pt-3 pb-1 space-y-3">
              {/* Kısa Harekeli Arapça Metin */}
              <p
                dir="rtl"
                lang="ar"
                className={`font-arabic text-xl sm:text-2xl text-center leading-loose tracking-wide select-text ${
                  isDarkText ? 'text-[#1F1710]' : 'text-[#FFF9F0]'
                }`}
              >
                {item.arabic}
              </p>

              {/* Türkçe Meal */}
              <div className="relative text-center px-2 sm:px-4">
                <p
                  className={`text-sm sm:text-[15px] font-sans leading-relaxed tracking-normal select-text ${
                    isDarkText ? 'text-[#2D2218] font-medium' : 'text-[#F1E9DC]'
                  }`}
                >
                  « {item.translation} »
                </p>
              </div>

              {/* Alt Bilgi & Haritayı Katlama Aksiyonu (Sadece TEK günün tefekkürü) */}
              <div className="flex items-center justify-between pt-2.5 border-t border-black/5 dark:border-white/5 text-xs">
                <span
                  className={`font-medium ${
                    isDarkText ? 'text-[#5A4839]' : 'text-[#B8C6C0]'
                  }`}
                >
                  — {item.source}
                </span>

                <button
                  type="button"
                  onClick={handleToggleExpand}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    isDarkText
                      ? 'bg-[#EFE5D4] hover:bg-[#E5D8C3] text-[#3D2D20]'
                      : 'bg-[#22302A] hover:bg-[#2C3E36] text-[#E4D7C2]'
                  }`}
                >
                  <FoldHorizontal className="w-3.5 h-3.5" />
                  Haritayı Katla
                </button>
              </div>
            </div>
          </div>
        </article>
      )}
    </div>
  );
};
