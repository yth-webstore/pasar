import React, { useState } from 'react';
import {
  ShieldCheck,
  Newspaper,
  Megaphone,
  ShoppingBag,
  Users,
  Settings,
  Plus,
  Trash2,
  Edit,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VillageNews, VillageAd, Banner, Category, Product } from '../types';
import { formatRupiah, createSlug } from '../utils/seo';
import { compressAndOptimizeImage } from '../utils/imageCompressor';

export const AdminDashboard: React.FC = () => {
  const {
    news,
    addNews,
    updateNews,
    deleteNews,
    ads,
    addAd,
    updateAd,
    deleteAd,
    products,
    categories,
    orders,
    users,
    banners,
    addBanner,
    updateBanner,
    deleteBanner,
    settings,
    updateSettings,
    deleteProduct,
    reviews,
    resetToDefaults,
    setActiveTab,
  } = useApp();

  const [activeTab, setActiveTabState] = useState<
    'statistik' | 'berita' | 'iklan' | 'produk' | 'banner' | 'pengguna' | 'pengaturan'
  >('statistik');

  // News Modal State
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<VillageNews | null>(null);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsCategory, setNewsCategory] = useState<'pengumuman' | 'kegiatan' | 'bumdes' | 'pertanian'>('pengumuman');
  const [newsImageUrl, setNewsImageUrl] = useState('');
  const [newsIsImportant, setNewsIsImportant] = useState(false);

  // Ad Modal State
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

  // Banner Modal State
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerTag, setBannerTag] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');

  // Settings State
  const [villageNameInput, setVillageNameInput] = useState(settings.villageName);
  const [bumdesNameInput, setBumdesNameInput] = useState(settings.bumdesName);
  const [deliveryFeeInput, setDeliveryFeeInput] = useState(settings.deliveryFeeStandard);
  const [emergencyInput, setEmergencyInput] = useState(settings.emergencyContact);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Metrics
  const totalOmset = orders
    .filter((o) => o.status === 'selesai')
    .reduce((acc, o) => acc + o.total, 0);

  const totalSellers = users.filter((u) => u.role === 'seller').length;
  const totalBuyers = users.filter((u) => u.role === 'buyer').length;

  // News Handlers
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
        author: 'Admin Desa Sukamaju & BUMDes',
        date: dateStr,
        category: newsCategory,
        imageUrl: newsImageUrl,
        isImportant: newsIsImportant,
      });
    }
    setIsNewsModalOpen(false);
  };

  // Ad Handlers
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

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...settings,
      villageName: villageNameInput,
      bumdesName: bumdesNameInput,
      deliveryFeeStandard: Number(deliveryFeeInput),
      emergencyContact: emergencyInput,
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  return (
    <div id="admin-dashboard-page" className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Top Banner */}
      <div className="bg-neutral-900 text-white rounded-3xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Panel Kendali Admin Desa & BUMDes
              </h1>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Pusat pengelolaan UMKM desa, verifikasi warga, pengumuman resmi, dan iklan desa.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('beranda')}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition"
          >
            Buka Marketplace Warga
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold no-scrollbar">
        {[
          { id: 'statistik', label: 'Statistik & Laporan', icon: TrendingUp },
          { id: 'berita', label: 'Berita & Pengumuman Desa', icon: Newspaper },
          { id: 'iklan', label: 'Iklan Warga Desa', icon: Megaphone },
          { id: 'produk', label: 'Produk & Kategori', icon: Package },
          { id: 'banner', label: 'Banner Promosi', icon: ImageIcon },
          { id: 'pengguna', label: 'Warga & UMKM', icon: Users },
          { id: 'pengaturan', label: 'Pengaturan BUMDes', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabState(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. STATISTIK & LAPORAN */}
      {activeTab === 'statistik' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
              <div className="flex justify-between items-center text-xs text-neutral-500 font-bold">
                <span>Omset Transaksi Desa</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-900 mt-2">
                {formatRupiah(totalOmset)}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">Total perputaran uang di desa</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
              <div className="flex justify-between items-center text-xs text-neutral-500 font-bold">
                <span>Total Pesanan Warga</span>
                <ShoppingBag className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-neutral-900 mt-2">{orders.length}</div>
              <div className="text-[11px] text-neutral-400 mt-1">Transaksi tercatat</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
              <div className="flex justify-between items-center text-xs text-neutral-500 font-bold">
                <span>UMKM & Penjual Aktif</span>
                <Users className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-neutral-900 mt-2">{totalSellers}</div>
              <div className="text-[11px] text-neutral-400 mt-1">Unit usaha binaan BUMDes</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
              <div className="flex justify-between items-center text-xs text-neutral-500 font-bold">
                <span>Produk Terdaftar</span>
                <Package className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-black text-neutral-900 mt-2">{products.length}</div>
              <div className="text-[11px] text-neutral-400 mt-1">Komoditas & olahan desa</div>
            </div>
          </div>

          {/* Transaksi Terkini Table */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-5 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-neutral-900">
              Transaksi Terkini Seluruh Desa
            </h3>
            {orders.length === 0 ? (
              <p className="text-xs text-neutral-500 py-3">Belum ada transaksi.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-500">
                      <th className="py-2">No. Invoice</th>
                      <th>Pembeli</th>
                      <th>Penjual / Toko</th>
                      <th>Total</th>
                      <th>Metode</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {orders.slice(0, 8).map((ord) => (
                      <tr key={ord.id} className="py-2.5">
                        <td className="py-2.5 font-bold text-neutral-900">{ord.invoiceNumber}</td>
                        <td>{ord.buyerName}</td>
                        <td>{ord.sellerName}</td>
                        <td className="font-bold text-emerald-800">{formatRupiah(ord.total)}</td>
                        <td className="uppercase">{ord.paymentMethod}</td>
                        <td>
                          <span className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded font-semibold capitalize">
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. BERITA & PENGUMUMAN DESA (Hanya Admin) */}
      {activeTab === 'berita' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
            <div>
              <h2 className="font-extrabold text-sm text-emerald-950">
                Manajemen Berita & Pengumuman Desa Sukamaju
              </h2>
              <p className="text-xs text-emerald-800 mt-0.5">
                *Sesuai ketentuan: Berita desa hanya dapat dibuat, diedit, dan dihapus oleh Admin Desa.
              </p>
            </div>
            <button
              onClick={handleOpenAddNews}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
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
        </div>
      )}

      {/* 3. IKLAN DESA (Hanya Admin) */}
      {activeTab === 'iklan' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
            <div>
              <h2 className="font-extrabold text-sm text-amber-950">
                Manajemen Iklan Usaha Warga Desa
              </h2>
              <p className="text-xs text-amber-800 mt-0.5">
                *Sesuai ketentuan: Iklan hanya dapat dibuat, diedit, dan dihapus oleh Admin Desa.
              </p>
            </div>
            <button
              onClick={handleOpenAddAd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Iklan Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ads.map((ad) => (
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
                      <span className="text-[10px] text-neutral-400">WA: {ad.whatsapp}</span>
                    </div>
                    <h3 className="font-bold text-xs text-neutral-900 mt-1 line-clamp-1">{ad.title}</h3>
                    <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">
                      {ad.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[11px]">
                    <span className="text-neutral-500 truncate">{ad.ownerName} - {ad.dusun}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditAd(ad)}
                        className="p-1 text-neutral-600 hover:text-emerald-700 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus iklan "${ad.title}"?`)) deleteAd(ad.id);
                        }}
                        className="p-1 text-neutral-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PRODUK & KATEGORI */}
      {activeTab === 'produk' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-neutral-900">
              Semua Produk yang Beredar di Pasar Desa ({products.length})
            </h2>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600">
                  <tr>
                    <th className="p-3">Produk</th>
                    <th className="p-3">Penjual</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Harga</th>
                    <th className="p-3">Stok</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="p-3 flex items-center gap-2.5">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-100"
                        />
                        <span className="font-bold text-neutral-900 max-w-xs truncate">{p.name}</span>
                      </td>
                      <td className="p-3 text-neutral-600">{p.sellerName}</td>
                      <td className="p-3">{p.categoryName}</td>
                      <td className="p-3 font-bold text-emerald-800">{formatRupiah(p.price)}</td>
                      <td className="p-3">{p.stock}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Hapus produk "${p.name}" dari sistem?`)) deleteProduct(p.id);
                          }}
                          className="p-1 text-red-500 hover:text-red-700"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. BANNER PROMOSI */}
      {activeTab === 'banner' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-neutral-900">
              Banner Promosi Beranda ({banners.length})
            </h2>
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
                    <span className="text-emerald-700 font-semibold">Aktif di Beranda</span>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus banner "${ban.title}"?`)) deleteBanner(ban.id);
                      }}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. PENGGUNA & VERIFIKASI */}
      {activeTab === 'pengguna' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-neutral-900">
              Daftar Warga & Penjual UMKM ({users.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {users.map((u) => (
              <div
                key={u.id}
                className="bg-white rounded-2xl border border-neutral-200 p-3.5 shadow-xs flex items-center gap-3"
              >
                <img
                  src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={u.name}
                  className="w-12 h-12 rounded-xl object-cover bg-neutral-100 border border-neutral-200"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h3 className="font-bold text-xs text-neutral-900 truncate">{u.name}</h3>
                    {u.verifiedSeller && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </div>
                  <div className="text-[11px] text-neutral-500 truncate">{u.dusun}</div>
                  <div className="text-[10px] font-bold text-emerald-800 capitalize mt-0.5">
                    {u.role === 'buyer' ? 'Warga Pembeli' : u.role === 'seller' ? `UMKM: ${u.shopName}` : 'Admin BUMDes'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. PENGATURAN BUMDES & APLIKASI */}
      {activeTab === 'pengaturan' && (
        <div className="bg-white rounded-3xl border border-neutral-200 p-5 sm:p-6 shadow-xs max-w-xl space-y-4">
          <div>
            <h2 className="font-extrabold text-base text-neutral-900">
              Pengaturan Sistem Pasar Desa
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Kelola nama desa, lembaga BUMDes, ongkir flat kurir desa, dan rekening kas desa.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Nama Desa</label>
              <input
                type="text"
                value={villageNameInput}
                onChange={(e) => setVillageNameInput(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Nama BUMDes</label>
              <input
                type="text"
                value={bumdesNameInput}
                onChange={(e) => setBumdesNameInput(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Ongkir Flat Kurir Desa (Rp)</label>
                <input
                  type="number"
                  step={500}
                  value={deliveryFeeInput}
                  onChange={(e) => setDeliveryFeeInput(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                />
              </div>
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Kontak Darurat / BUMDes</label>
                <input
                  type="text"
                  value={emergencyInput}
                  onChange={(e) => setEmergencyInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md transition"
              >
                Simpan Pengaturan
              </button>
              {settingsSaved && (
                <span className="text-xs text-emerald-700 font-bold">✓ Berhasil disimpan!</span>
              )}
            </div>
          </form>

          {/* Reset Demo Data Button */}
          <div className="pt-5 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-neutral-900">Reset Data Demo</div>
                <div className="text-[11px] text-neutral-500">
                  Kembalikan produk, berita, dan toko ke data awal.
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke kondisi awal?')) {
                    resetToDefaults();
                    alert('Data berhasil di-reset!');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-100 hover:bg-red-50 text-neutral-700 hover:text-red-700 text-xs font-bold rounded-xl border border-neutral-200 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Contoh</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BERITA DESA (Admin only) */}
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
                {editingNews ? 'Edit Berita / Pengumuman Desa' : 'Buat Berita / Pengumuman Desa Baru'}
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

      {/* MODAL IKLAN DESA (Admin only) */}
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
