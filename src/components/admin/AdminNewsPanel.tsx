import React, { useState } from 'react';
import { Newspaper, Plus, Edit, Trash2, Pin, Calendar, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VillageNews } from '../../types';
import { createSlug } from '../../utils/seo';

export const AdminNewsPanel: React.FC = () => {
  const { news, addNews, updateNews, deleteNews, settings } = useApp();

  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<VillageNews | null>(null);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsCategory, setNewsCategory] = useState<'pengumuman' | 'kegiatan' | 'bumdes' | 'pertanian'>('pengumuman');
  const [newsImageUrl, setNewsImageUrl] = useState('');
  const [newsIsImportant, setNewsIsImportant] = useState(false);

  const handleOpenAddNews = () => {
    setEditingNews(null);
    setNewsTitle('');
    setNewsSummary('');
    setNewsContent('');
    setNewsCategory('pengumuman');
    setNewsImageUrl('https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80');
    setNewsIsImportant(false);
    setIsNewsModalOpen(true);
  };

  const handleOpenEditNews = (n: VillageNews) => {
    setEditingNews(n);
    setNewsTitle(n.title);
    setNewsSummary(n.summary);
    setNewsContent(n.content);
    setNewsCategory(n.category);
    setNewsImageUrl(n.imageUrl || '');
    setNewsIsImportant(n.isImportant || false);
    setIsNewsModalOpen(true);
  };

  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsSummary.trim()) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    if (editingNews) {
      updateNews({
        ...editingNews,
        title: newsTitle.trim(),
        slug: createSlug(newsTitle),
        summary: newsSummary.trim(),
        content: newsContent.trim(),
        category: newsCategory,
        imageUrl: newsImageUrl,
        isImportant: newsIsImportant,
      });
    } else {
      addNews({
        title: newsTitle.trim(),
        slug: createSlug(newsTitle),
        summary: newsSummary.trim(),
        content: newsContent.trim(),
        author: `Admin ${settings.villageName} & BUMDes`,
        date: dateStr,
        category: newsCategory,
        imageUrl: newsImageUrl,
        isImportant: newsIsImportant,
      });
    }
    setIsNewsModalOpen(false);
  };

  return (
    <div id="admin-news-panel" className="space-y-4 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
        <div>
          <h2 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-emerald-700" />
            Manajemen Berita & Pengumuman {settings.villageName}
          </h2>
          <p className="text-xs text-emerald-800 mt-0.5">
            Berita dan surat edaran desa resmi hanya dapat diterbitkan dan dikelola oleh Administrator Desa.
          </p>
        </div>
        <button
          onClick={handleOpenAddNews}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pengumuman Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {news.map((n) => (
          <div
            key={n.id}
            className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs flex gap-3.5"
          >
            {n.imageUrl && (
              <img
                src={n.imageUrl}
                alt={n.title}
                className="w-24 h-24 rounded-xl object-cover shrink-0 bg-neutral-100 border border-neutral-200"
              />
            )}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {n.category}
                  </span>
                  <span className="text-[10px] text-neutral-400">{n.date}</span>
                </div>
                <h3 className="font-bold text-xs text-neutral-900 mt-1 line-clamp-2">
                  {n.title}
                </h3>
                <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1">
                  {n.summary}
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  onClick={() => handleOpenEditNews(n)}
                  className="p-1 text-neutral-600 hover:text-emerald-700 transition"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Hapus pengumuman "${n.title}"?`)) deleteNews(n.id);
                  }}
                  className="p-1 text-neutral-400 hover:text-red-600 transition"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL BERITA DESA */}
      {isNewsModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto"
          onClick={() => setIsNewsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-neutral-200 space-y-4 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h2 className="text-base font-extrabold text-neutral-900">
                {editingNews ? 'Edit Berita / Pengumuman Desa' : 'Buat Pengumuman Desa Baru'}
              </h2>
              <button
                onClick={() => setIsNewsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNews} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Judul Pengumuman *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Penyaluran Pupuk Subsidi Kelompok Tani..."
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Kategori *</label>
                  <select
                    value={newsCategory}
                    onChange={(e) => setNewsCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                  >
                    <option value="pengumuman">Pengumuman Resmi</option>
                    <option value="kegiatan">Kegiatan Warga</option>
                    <option value="pertanian">Pertanian & Panen</option>
                    <option value="bumdes">BUMDes & Ekonomi</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Prioritas Penting</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newsIsImportant}
                      onChange={(e) => setNewsIsImportant(e.target.checked)}
                      className="rounded text-emerald-600 w-4 h-4"
                    />
                    <span className="font-semibold text-neutral-800">Pin di Atas (Penting)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Ringkasan Singkat *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ringkasan 1-2 kalimat untuk tampilan beranda..."
                  value={newsSummary}
                  onChange={(e) => setNewsSummary(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Isi Lengkap Berita</label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan detail tempat, waktu, ketentuan, dan tindak lanjut warga..."
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">URL Foto Berita</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newsImageUrl}
                  onChange={(e) => setNewsImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewsModalOpen(false)}
                  className="px-4 py-2.5 border border-neutral-300 rounded-xl font-bold text-neutral-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md transition"
                >
                  Terbitkan Pengumuman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
