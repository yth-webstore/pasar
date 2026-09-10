import React, { useEffect } from 'react';
import { X, Calendar, User, Share2, Tag, ArrowRight, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { injectNewsJsonLd } from '../utils/seo';

export const VillageNewsModal: React.FC = () => {
  const { selectedNews, setSelectedNews, settings } = useApp();

  useEffect(() => {
    if (selectedNews) {
      injectNewsJsonLd(selectedNews);
    }
  }, [selectedNews]);

  if (!selectedNews) return null;

  const handleShareWA = () => {
    const text = encodeURIComponent(
      `📢 *${selectedNews.title}*\n\n${selectedNews.summary}\n\nBaca selengkapnya di aplikasi Pasar Desa Mandiri ${settings.villageName}.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div
      id="village-news-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={() => setSelectedNews(null)}
    >
      <div
        id="village-news-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase">
              {selectedNews.category}
            </span>
            {selectedNews.isImportant && (
              <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">
                Pengumuman Penting
              </span>
            )}
          </div>
          <button
            onClick={() => setSelectedNews(null)}
            className="w-8 h-8 rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-700 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {selectedNews.imageUrl && (
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
              <img
                src={selectedNews.imageUrl}
                alt={selectedNews.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-neutral-900 leading-snug">
              {selectedNews.title}
            </h1>
            <div className="flex items-center gap-3 text-xs text-neutral-400 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                {selectedNews.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-neutral-500" />
                {selectedNews.author}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed">
            {selectedNews.summary}
          </div>

          <div className="text-xs sm:text-sm text-neutral-700 leading-relaxed whitespace-pre-line space-y-2">
            {selectedNews.content}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <button
            onClick={handleShareWA}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Bagikan ke Grup RT / WhatsApp</span>
          </button>
          <button
            onClick={() => setSelectedNews(null)}
            className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
