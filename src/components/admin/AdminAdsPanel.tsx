import React, { useState } from 'react';
import { Megaphone, Plus, Edit, Trash2, Phone, MapPin, User, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VillageAd } from '../../types';

export const AdminAdsPanel: React.FC = () => {
  const { ads, addAd, updateAd, deleteAd } = useApp();

  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<VillageAd | null>(null);
  const [adTitle, setAdTitle] = useState('');
  const [adBusinessName, setAdBusinessName] = useState('');
  const [adOwnerName, setAdOwnerName] = useState('');
  const [adDusun, setAdDusun] = useState('');
  const [adWhatsapp, setAdWhatsapp] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [adBadge, setAdBadge] = useState('Mitra Usaha Desa');
  const [adImageUrl, setAdImageUrl] = useState('');

  const handleOpenAddAd = () => {
    setEditingAd(null);
    setAdTitle('');
    setAdBusinessName('');
    setAdOwnerName('');
    setAdDusun('Dusun Krajan RT 02');
    setAdWhatsapp('6281234567890');
    setAdDescription('');
    setAdBadge('Mitra Usaha Desa');
    setAdImageUrl('https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80');
    setIsAdModalOpen(true);
  };

  const handleOpenEditAd = (ad: VillageAd) => {
    setEditingAd(ad);
    setAdTitle(ad.title);
    setAdBusinessName(ad.businessName);
    setAdOwnerName(ad.ownerName);
    setAdDusun(ad.dusun);
    setAdWhatsapp(ad.whatsapp);
    setAdDescription(ad.description);
    setAdBadge(ad.badge);
    setAdImageUrl(ad.imageUrl);
    setIsAdModalOpen(true);
  };

  const handleSaveAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle.trim() || !adBusinessName.trim()) return;

    if (editingAd) {
      updateAd({
        ...editingAd,
        title: adTitle.trim(),
        businessName: adBusinessName.trim(),
        ownerName: adOwnerName.trim(),
        dusun: adDusun.trim(),
        whatsapp: adWhatsapp.trim(),
        description: adDescription.trim(),
        badge: adBadge,
        imageUrl: adImageUrl,
      });
    } else {
      addAd({
        title: adTitle.trim(),
        businessName: adBusinessName.trim(),
        ownerName: adOwnerName.trim(),
        dusun: adDusun.trim(),
        whatsapp: adWhatsapp.trim(),
        description: adDescription.trim(),
        badge: adBadge,
        imageUrl: adImageUrl,
        active: true,
      });
    }
    setIsAdModalOpen(false);
  };

  return (
    <div id="admin-ads-panel" className="space-y-4 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
        <div>
          <h2 className="font-extrabold text-sm text-amber-950 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-700" />
            Manajemen Iklan Usaha Warga Desa
          </h2>
          <p className="text-xs text-amber-800 mt-0.5">
            Iklan dan promosi jasa warga diverifikasi dan diatur langsung oleh Admin Desa.
          </p>
        </div>
        <button
          onClick={handleOpenAddAd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Iklan Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ads.map((ad) => {
          const cleanPhone = (ad.whatsapp || '').replace(/[^0-9]/g, '');
          return (
            <div
              key={ad.id}
              className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs flex gap-3.5"
            >
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-24 h-24 rounded-xl object-cover shrink-0 bg-neutral-100 border border-neutral-200"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {ad.badge}
                    </span>
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-2.5 h-2.5" />
                      {ad.whatsapp}
                    </a>
                  </div>
                  <h3 className="font-bold text-xs text-neutral-900 mt-1 line-clamp-1">{ad.title}</h3>
                  <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">
                    {ad.description}
                  </p>
                  <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-2">
                    <span>{ad.businessName}</span>
                    <span>•</span>
                    <span>{ad.dusun}</span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                  <button
                    onClick={() => handleOpenEditAd(ad)}
                    className="p-1 text-neutral-600 hover:text-amber-700 transition"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus iklan "${ad.title}"?`)) deleteAd(ad.id);
                    }}
                    className="p-1 text-neutral-400 hover:text-red-600 transition"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL IKLAN DESA */}
      {isAdModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto"
          onClick={() => setIsAdModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-neutral-200 space-y-4 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h2 className="text-base font-extrabold text-neutral-900">
                {editingAd ? 'Edit Iklan Usaha Desa' : 'Tambah Iklan Usaha Desa'}
              </h2>
              <button
                onClick={() => setIsAdModalOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAd} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Judul Layanan / Iklan *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Bengkel Las & Servis Motor Mas Joko"
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Nama Usaha *</label>
                  <input
                    type="text"
                    required
                    value={adBusinessName}
                    onChange={(e) => setAdBusinessName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Pemilik Usaha</label>
                  <input
                    type="text"
                    value={adOwnerName}
                    onChange={(e) => setAdOwnerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">No. WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={adWhatsapp}
                    onChange={(e) => setAdWhatsapp(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Dusun / Alamat</label>
                  <input
                    type="text"
                    value={adDusun}
                    onChange={(e) => setAdDusun(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Deskripsi Layanan Iklan</label>
                <textarea
                  rows={3}
                  required
                  value={adDescription}
                  onChange={(e) => setAdDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Foto Banner Iklan</label>
                <input
                  type="url"
                  value={adImageUrl}
                  onChange={(e) => setAdImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdModalOpen(false)}
                  className="px-4 py-2.5 border border-neutral-300 rounded-xl font-bold text-neutral-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md transition"
                >
                  Simpan Iklan Desa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
