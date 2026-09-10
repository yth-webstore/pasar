import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BannerSlider: React.FC = () => {
  const { banners, setSelectedCategory, setActiveTab, dataSaverMode } = useApp();
  const activeBanners = banners.filter((b) => b.active);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1 || dataSaverMode) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 4800);
    return () => clearInterval(interval);
  }, [activeBanners.length, dataSaverMode]);

  if (activeBanners.length === 0) return null;

  const current = activeBanners[currentIndex];

  const handleAction = () => {
    if (current.targetCategory) {
      setSelectedCategory(current.targetCategory);
      setActiveTab('kategori');
    } else {
      setActiveTab('kategori');
    }
  };

  return (
    <section id="hero-banner-slider" className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl shadow-sm border border-neutral-200/80 bg-neutral-900">
      <div className="relative h-44 sm:h-56 md:h-64 lg:h-72 w-full overflow-hidden">
        {/* Background Image with contrast gradient overlay */}
        <img
          src={current.imageUrl}
          alt={current.title}
          loading="lazy"
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            dataSaverMode ? 'filter brightness-90' : 'filter brightness-95 scale-100 hover:scale-105 transition-transform duration-1000'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/85 via-neutral-900/60 to-transparent flex items-center p-5 sm:p-8 md:p-10">
          <div className="max-w-xl text-white">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-sm mb-2 sm:mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              {current.tag}
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {current.title}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-neutral-200 mt-1.5 sm:mt-2 line-clamp-2 max-w-md font-medium">
              {current.subtitle}
            </p>

            <button
              id={`banner-action-btn-${current.id}`}
              onClick={handleAction}
              className="mt-3 sm:mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              <span>{current.linkText || 'Lihat Promo'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Prev/Next Buttons */}
        {activeBanners.length > 1 && (
          <>
            <button
              id="banner-prev-btn"
              onClick={() =>
                setCurrentIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1))
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition"
              aria-label="Banner Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              id="banner-next-btn"
              onClick={() => setCurrentIndex((prev) => (prev + 1) % activeBanners.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition"
              aria-label="Banner Selanjutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Indicator Dots */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full">
              {activeBanners.map((b, idx) => (
                <button
                  key={b.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    currentIndex === idx ? 'w-5 bg-emerald-400' : 'w-1.5 bg-white/60'
                  }`}
                  aria-label={`Pindah ke banner ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
