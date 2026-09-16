import React, { useState } from 'react';
import { Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Banner } from '../../types';

export const AdminBannersPanel: React.FC = () => {
  const { banners, addBanner, deleteBanner } = useApp();
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerTag, setBannerTag] = useState('PROMO DESA');
  const [bannerImageUrl, setBannerImageUrl] = useState('');

  const handleOpenAddBanner = () => {
    setBannerTitle('');
    setBannerSubtitle('');
    setBannerTag('PROMO DESA');
    setBannerImageUrl('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80');
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim() || !bannerImageUrl.trim()) return;

    addBanner({
      title: bannerTitle.trim(),
      subtitle: bannerSubtitle.trim(),
      tag: bannerTag.trim(),
      imageUrl: bannerImageUrl.trim(),
    });
    setIsBannerModalOpen(false);
  };

  return (
    <div id="admin-banners-panel" className="space-y-4 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
        <div>
          <h2 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-700" />
            Banner Promosi Beranda ({banners.length})
          </h2>
          <p className="text-xs text-emerald-800 mt-0.5">
            Banner slider utama yang tampil di beranda aplikasi warga.
          </p>
        </div>
        <button
          onClick={handleOpenAddBanner}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Banner Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((ban) => (
          <div
            key={ban.id}
            className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs flex flex-col"
          >
            <img src={ban.imageUrl} alt={ban.title} className="h-36 w-full object-cover" />
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  {ban.tag}
                </span>
                <h3 className="font-bold text-xs text-neutral-900 mt-1">{ban.title}</h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">{ban.subtitle}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-neutral-100 flex justify-between items-center text-xs">
                <span className="text-emerald-700 font-semibold text-[11px]">Aktif di Beranda</span>
                <button
                  onClick={() => {
                    if (confirm(`Hapus banner "${ban.title}"?`)) deleteBanner(ban.id);
                  }}
                  className="text-red-500 hover:text-red-700 text-xs font-semibold"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isBannerModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto"
          onClick={() => setIsBannerModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-neutral-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h2 className="text-base font-extrabold text-neutral-900">
                Tambah Banner Promosi Baru
              </h2>
              <button
                onClick={() => setIsBannerModalOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Judul Banner *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Panen Raya Beras Organik"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Sub Judul</label>
                <input
                  type="text"
                  placeholder="Misal: Harga Petani Langsung Antar ke Rumah"
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Tag / Label</label>
                <input
                  type="text"
                  value={bannerTag}
                  onChange={(e) => setBannerTag(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">URL Gambar Banner *</label>
                <input
                  type="url"
                  required
                  value={bannerImageUrl}
                  onChange={(e) => setBannerImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2.5 border border-neutral-300 rounded-xl font-bold text-neutral-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md transition"
                >
                  Simpan Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
