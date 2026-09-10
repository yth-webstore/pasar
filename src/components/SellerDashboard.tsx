import React, { useState } from 'react';
import {
  Store,
  Plus,
  Package,
  DollarSign,
  TrendingUp,
  Tag,
  Edit2,
  Trash2,
  Upload,
  AlertCircle,
  CheckCircle,
  Eye,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, OrderStatus } from '../types';
import { formatRupiah, createSlug } from '../utils/seo';
import { compressAndOptimizeImage, CompressionResult } from '../utils/imageCompressor';

export const SellerDashboard: React.FC = () => {
  const {
    currentUser,
    products,
    categories,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    setActiveTab,
  } = useApp();

  // Active seller product list
  const sellerProducts = products.filter(
    (p) => p.sellerId === currentUser?.id || currentUser?.role === 'admin'
  );

  // Active seller orders
  const sellerOrders = orders.filter(
    (o) => o.sellerId === currentUser?.id || currentUser?.role === 'admin'
  );

  const [activeTab, setActiveTabState] = useState<'produk' | 'pesanan' | 'profil'>('produk');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [price, setPrice] = useState<number>(10000);
  const [isPromo, setIsPromo] = useState(false);
  const [originalPrice, setOriginalPrice] = useState<number>(12000);
  const [promoBadge, setPromoBadge] = useState('Diskon');
  const [unit, setUnit] = useState('kg');
  const [stock, setStock] = useState<number>(20);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Image compressor state
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Proof inspection modal
  const [proofModalUrl, setProofModalUrl] = useState<string | null>(null);

  // Metrics
  const totalOmset = sellerOrders
    .filter((o) => o.status === 'selesai')
    .reduce((acc, o) => acc + o.total, 0);

  const pendingOrdersCount = sellerOrders.filter((o) => o.status === 'menunggu').length;

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setPrice(10000);
    setIsPromo(false);
    setOriginalPrice(12000);
    setPromoBadge('Diskon');
    setUnit('kg');
    setStock(20);
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80');
    setCompressionResult(null);
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategoryId(p.categoryId);
    setPrice(p.price);
    setIsPromo(p.isPromo);
    setOriginalPrice(p.originalPrice || p.price);
    setPromoBadge(p.promoBadge || 'Diskon');
    setUnit(p.unit);
    setStock(p.stock);
    setDescription(p.description);
    setImageUrl(p.imageUrl);
    setCompressionResult(null);
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsCompressing(true);

    try {
      // Automatic Canvas compression, rejects videos strictly!
      const res = await compressAndOptimizeImage(file, 900, 900, 0.78);
      setCompressionResult(res);
      setImageUrl(res.dataUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses gambar.';
      setUploadError(msg);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !unit || !imageUrl) {
      alert('Mohon lengkapi nama produk, harga, satuan, dan foto produk.');
      return;
    }

    const cat = categories.find((c) => c.id === categoryId) || categories[0];

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: name.trim(),
        slug: createSlug(name),
        categoryId: cat.id,
        categoryName: cat.name,
        price,
        originalPrice: isPromo ? originalPrice : undefined,
        isPromo,
        promoBadge: isPromo ? promoBadge : undefined,
        unit,
        stock,
        description,
        imageUrl,
      });
    } else {
      addProduct({
        name: name.trim(),
        slug: createSlug(name),
        sellerId: currentUser?.id || 'seller-desa',
        sellerName: currentUser?.shopName || currentUser?.name || 'Toko Warga Desa',
        sellerDusun: currentUser?.dusun || 'Dusun Krajan',
        sellerWhatsapp: currentUser?.shopWhatsapp || currentUser?.phone || '6281234567890',
        categoryId: cat.id,
        categoryName: cat.name,
        price,
        originalPrice: isPromo ? originalPrice : undefined,
        isPromo,
        promoBadge: isPromo ? promoBadge : undefined,
        unit,
        stock,
        description,
        imageUrl,
        rating: 5.0,
        soldCount: 0,
        isPopular: false,
        featured: false,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div id="seller-dashboard-page" className="max-w-6xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Seller Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl border border-white/20">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                {currentUser?.shopName || 'Toko UMKM Desa'}
              </h1>
              <span className="text-[11px] bg-emerald-500/80 text-white px-2 py-0.5 rounded font-bold">
                Terverifikasi Desa
              </span>
            </div>
            <p className="text-xs text-emerald-100 mt-1 max-w-md">
              {currentUser?.shopDescription || 'Mitra binaan BUMDes untuk pemulihan dan penguatan ekonomi keluarga desa.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            id="seller-add-prod-btn"
            onClick={handleOpenAdd}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs sm:text-sm font-extrabold rounded-2xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
          <button
            onClick={() => setActiveTab('beranda')}
            className="px-3 py-2.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-2xl transition"
          >
            Lihat Pasar
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Total Produk</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900 mt-2">
            {sellerProducts.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Aktif di etalase desa</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Pesanan Menunggu</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">
            {pendingOrdersCount}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Perlu dikonfirmasi</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Total Pesanan</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900 mt-2">
            {sellerOrders.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Semua riwayat transaksi</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Omset Penjualan</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-900 mt-2 truncate">
            {formatRupiah(totalOmset)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Pesanan berhasil</div>
        </div>
      </div>

      {/* Tabs: Produk vs Pesanan Toko */}
      <div className="border-b border-neutral-200 flex gap-4 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTabState('produk')}
          className={`pb-2.5 transition flex items-center gap-1.5 ${
            activeTab === 'produk'
              ? 'text-emerald-800 border-b-2 border-emerald-700'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Katalog Produk Saya ({sellerProducts.length})</span>
        </button>
        <button
          onClick={() => setActiveTabState('pesanan')}
          className={`pb-2.5 transition flex items-center gap-1.5 ${
            activeTab === 'pesanan'
              ? 'text-emerald-800 border-b-2 border-emerald-700'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Pesanan Pelanggan ({sellerOrders.length})</span>
          {pendingOrdersCount > 0 && (
            <span className="bg-amber-500 text-neutral-900 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
              {pendingOrdersCount}
            </span>
          )}
        </button>
      </div>

      {/* Content: Produk */}
      {activeTab === 'produk' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sellerProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-neutral-200 p-3.5 shadow-xs flex flex-col justify-between"
              >
                <div className="flex gap-3">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-20 h-20 rounded-xl object-cover bg-neutral-100 shrink-0 border border-neutral-200"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {p.categoryName}
                    </span>
                    <h3 className="font-bold text-xs text-neutral-900 mt-1 line-clamp-1">{p.name}</h3>
                    <div className="text-xs font-black text-emerald-900 mt-0.5">
                      {formatRupiah(p.price)} <span className="text-[10px] text-neutral-400 font-normal">/{p.unit}</span>
                    </div>
                    {p.isPromo && (
                      <span className="inline-block mt-1 text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">
                        {p.promoBadge || 'Promo'}
                      </span>
                    )}
                    <div className="text-[11px] text-neutral-500 mt-1">
                      Stok: <strong>{p.stock}</strong> | Terjual: {p.soldCount}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between">
                  <span className={`text-[11px] font-bold ${p.stock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {p.stock > 0 ? 'Tersedia' : 'Stok Kosong'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-neutral-600 hover:text-emerald-700 hover:bg-neutral-100 rounded-lg transition"
                      title="Edit Produk"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus produk "${p.name}"?`)) {
                          deleteProduct(p.id);
                        }
                      }}
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Hapus Produk"
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

      {/* Content: Pesanan Toko */}
      {activeTab === 'pesanan' && (
        <div className="space-y-3">
          {sellerOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-8 text-center text-neutral-500">
              Belum ada pesanan masuk untuk toko Anda.
            </div>
          ) : (
            sellerOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-2">
                  <div className="text-xs">
                    <span className="font-bold text-neutral-900">{ord.invoiceNumber}</span>
                    <span className="text-neutral-400 text-[11px]"> • {ord.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">
                      {ord.paymentMethod === 'cod' ? '💵 COD' : '💳 Transfer'}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded capitalize">
                      {ord.status}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-neutral-700">
                    Pembeli: {ord.buyerName} ({ord.buyerPhone}) - {ord.buyerAddress}
                  </div>
                  <div className="text-neutral-500">
                    Barang:{' '}
                    {ord.items.map((it) => `${it.productName} (${it.quantity} ${it.unit})`).join(', ')}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                  <div className="text-xs">
                    Total: <strong className="text-emerald-900 text-sm">{formatRupiah(ord.total)}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {ord.paymentProofUrl && (
                      <button
                        onClick={() => setProofModalUrl(ord.paymentProofUrl!)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Bukti Transfer
                      </button>
                    )}

                    {/* Status change select */}
                    <select
                      value={ord.status}
                      onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                      className="text-xs font-bold p-1.5 rounded-xl border border-neutral-300 bg-white"
                    >
                      <option value="menunggu">Menunggu</option>
                      <option value="diproses">Proses Siapkan</option>
                      <option value="dikirim">Kirimkan</option>
                      <option value="selesai">Selesai</option>
                      <option value="dibatalkan">Batalkan</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-neutral-200 space-y-4 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h2 className="text-base font-extrabold text-neutral-900">
                {editingProduct ? 'Edit Produk UMKM' : 'Tambah Produk Desa Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Nama Produk *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beras Organik Sawah Krajan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Kategori *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Satuan Jual *</label>
                  <input
                    type="text"
                    required
                    placeholder="kg, ikat, botol, buah..."
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Harga Warga (Rp) *</label>
                  <input
                    type="number"
                    required
                    min={500}
                    step={500}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Stok Tersedia *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                  />
                </div>
              </div>

              {/* Promo Toggle */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900">
                  <input
                    type="checkbox"
                    checked={isPromo}
                    onChange={(e) => setIsPromo(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Aktifkan Diskon / Promo Produk Ini</span>
                </label>

                {isPromo && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] text-neutral-600 block">Harga Coret (Normal)</label>
                      <input
                        type="number"
                        min={price + 500}
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(Number(e.target.value))}
                        className="w-full p-1.5 rounded-lg border border-neutral-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-600 block">Teks Badge Promo</label>
                      <input
                        type="text"
                        value={promoBadge}
                        onChange={(e) => setPromoBadge(e.target.value)}
                        placeholder="Misal: Diskon 15%"
                        className="w-full p-1.5 rounded-lg border border-neutral-300 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Image upload with automatic compressor and strictly NO VIDEO rule */}
              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Foto Produk (Kompresi Otomatis - Tanpa Video) *
                </label>
                <div className="border-2 border-dashed border-neutral-300 hover:border-emerald-500 p-3 rounded-2xl bg-neutral-50 text-center relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <Upload className="w-5 h-5 text-neutral-400" />
                    <span className="text-xs font-bold text-emerald-800">
                      Klik untuk Pilih Foto dari Galeri HP
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      Hanya foto/gambar (Maks 1000px, WebP ringan). Video tidak diizinkan.
                    </span>
                  </div>
                </div>

                {isCompressing && (
                  <div className="text-[11px] text-neutral-500 mt-1 animate-pulse">
                    Mengompres foto ke format WebP ringan...
                  </div>
                )}

                {uploadError && (
                  <div className="mt-1.5 p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {compressionResult && (
                  <div className="mt-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center justify-between">
                    <span>
                      ✓ Terkompresi: <strong>{compressionResult.compressedSizeKB} KB</strong> (Hemat {compressionResult.reductionPercentage}%)
                    </span>
                    <span className="font-bold">WebP Optimal</span>
                  </div>
                )}

                {imageUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-14 h-14 rounded-xl object-cover border border-neutral-300"
                    />
                    <span className="text-[11px] text-neutral-500 truncate">
                      Foto siap digunakan
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Deskripsi Lengkap *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan asal usul produk, keunggulan, cara penyimpanan atau konsumsi..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-neutral-300 rounded-xl font-bold text-neutral-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md transition"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proof Modal */}
      {proofModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setProofModalUrl(null)}
        >
          <div className="bg-white p-4 rounded-3xl max-w-sm w-full space-y-3 text-center">
            <h3 className="font-bold text-sm text-neutral-800">Bukti Transfer Pembeli</h3>
            <img src={proofModalUrl} alt="Bukti" className="w-full max-h-80 object-contain rounded-xl" />
            <button
              onClick={() => setProofModalUrl(null)}
              className="w-full py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
