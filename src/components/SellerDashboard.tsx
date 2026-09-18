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
  MessageCircle,
  Bell,
  Truck,
  Bike,
  Clock,
  Send,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, Order, OrderStatus } from '../types';
import { formatRupiah, createSlug } from '../utils/seo';
import { compressAndOptimizeImage, CompressionResult } from '../utils/imageCompressor';
import { SellerStoreHoursTab } from './seller/SellerStoreHoursTab';
import { checkStoreOpenStatus } from '../utils/storeHours';

export const SellerDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    products,
    categories,
    orders,
    stores,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    acceptOrder,
    processOrder,
    shipOrderWithCourier,
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

  // Seller store data and operational status
  const sellerStore =
    (stores || []).find(
      (s) =>
        s.sellerId === currentUser?.id ||
        s.id === currentUser?.storeId ||
        s.name === currentUser?.shopName
    ) || (currentUser?.role === 'admin' ? (stores || [])[0] : undefined);

  const storeStatus = checkStoreOpenStatus(sellerStore);

  const [activeTab, setActiveTabState] = useState<'produk' | 'pesanan' | 'jam_operasional'>('produk');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState((categories || [])[0]?.id || '');
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

  // Modal Kirim & Pilih Kurir
  const [selectedOrderForShipping, setSelectedOrderForShipping] = useState<Order | null>(null);
  const [selectedCourierId, setSelectedCourierId] = useState<string>('user-courier-1');

  // Available village couriers
  const registeredCouriers = users.filter(
    (u) => u.role === 'courier' || u.courierApprovalStatus === 'approved'
  );
  const availableCouriers =
    registeredCouriers.length > 0
      ? registeredCouriers
      : [
          {
            id: 'user-courier-1',
            name: 'Kang Ujang Pengantar Desa',
            phone: '082211445566',
            dusun: 'Dusun Krajan RT 01',
            vehicleInfo: 'Honda Beat Merah (B 4567 DES)',
            role: 'courier' as const,
          },
        ];

  // Metrics
  const totalOmset = sellerOrders
    .filter((o) => o.status === 'selesai')
    .reduce((acc, o) => acc + o.total, 0);

  const pendingOrdersCount = sellerOrders.filter((o) => o.status === 'menunggu').length;

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId((categories || [])[0]?.id || '');
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

    const cat = (categories || []).find((c) => c.id === categoryId) || (categories || [])[0] || { id: 'cat-1', name: 'Pertanian & Kebun' };

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

      {/* Store Operational Status Ribbon Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200/60">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-500">Status Operasional Lapak:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${storeStatus.badgeBg} ${storeStatus.badgeText} border ${storeStatus.badgeBorder}`}>
                {storeStatus.statusText}
              </span>
            </div>
            <div className="text-xs sm:text-sm font-black text-neutral-900 mt-0.5">
              {storeStatus.displayText}
            </div>
            <div className="text-[11px] text-neutral-500">
              Jam buka: <strong>{sellerStore?.openingHours || '06:00 - 21:00 WIB'}</strong> • Libur: <strong>{sellerStore?.closedDays || 'Buka Setiap Hari'}</strong>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTabState('jam_operasional')}
          className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
        >
          <Clock className="w-4 h-4" />
          <span>Atur Waktu Buka & Libur</span>
        </button>
      </div>

      {/* Tabs: Produk vs Pesanan Toko vs Jam & Libur Lapak */}
      <div className="border-b border-neutral-200 flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTabState('produk')}
          className={`pb-2.5 transition flex items-center gap-1.5 ${
            activeTab === 'produk'
              ? 'text-emerald-800 border-b-2 border-emerald-700'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Katalog Produk ({sellerProducts.length})</span>
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
        <button
          id="seller-tab-hours-btn"
          onClick={() => setActiveTabState('jam_operasional')}
          className={`pb-2.5 transition flex items-center gap-1.5 ${
            activeTab === 'jam_operasional'
              ? 'text-emerald-800 border-b-2 border-emerald-700'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Waktu Buka & Libur Lapak</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${storeStatus.badgeBg} ${storeStatus.badgeText} border ${storeStatus.badgeBorder}`}>
            {storeStatus.statusText}
          </span>
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
          {/* Notification Alert Banner */}
          {sellerOrders.some((o) => o.status === 'menunggu') && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-center justify-between text-xs text-amber-900 shadow-2xs">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-700 shrink-0 animate-bounce" />
                <span>
                  Ada <strong>{sellerOrders.filter((o) => o.status === 'menunggu').length} pesanan baru</strong> masuk yang menunggu konfirmasi. Peringatan notifikasi telah dikirimkan ke HP Anda!
                </span>
              </div>
            </div>
          )}

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
                    <div className="font-bold text-neutral-900 text-xs">
                      {ord.sellerName || currentUser?.name || 'Lapak Desa'}
                    </div>
                    {/* Tag kategori berada di bawah nama lapak */}
                    <div className="mt-0.5">
                      <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                        {ord.items?.[0]?.categoryName || 'Makanan & Olahan'}
                      </span>
                    </div>
                    <div className="text-neutral-500 text-[11px] mt-1">
                      Invoice: <span className="font-semibold text-neutral-800">{ord.invoiceNumber}</span> • {ord.createdAt}
                    </div>
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

                {/* Seller 3-Step Fulfillment Workflow */}
                <div className="bg-neutral-50/80 rounded-2xl p-3 border border-neutral-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-neutral-500">
                      Alur Pengiriman Penjual:
                    </span>
                    <span className="text-[11px] font-bold text-neutral-700">
                      {ord.status === 'menunggu' && !ord.orderAcceptedAt && 'Langkah 1: Menunggu Konfirmasi'}
                      {ord.status === 'menunggu' && ord.orderAcceptedAt && 'Langkah 1 Selesai: Pesanan Diterima'}
                      {ord.status === 'diproses' && 'Langkah 2: Sedang Diproses/Dikemas'}
                      {ord.status === 'dikirim' && 'Langkah 3: Dikirimkan via Kurir'}
                      {ord.status === 'selesai' && 'Selesai: Transaksi Tuntas'}
                      {ord.status === 'dibatalkan' && 'Pesanan Dibatalkan'}
                    </span>
                  </div>

                  {/* Visual Step Tracker */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                    <div
                      className={`p-1.5 rounded-xl font-bold flex items-center justify-center gap-1 ${
                        ord.orderAcceptedAt || ord.status !== 'menunggu'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>1. Diterima</span>
                    </div>

                    <div
                      className={`p-1.5 rounded-xl font-bold flex items-center justify-center gap-1 ${
                        ord.status === 'diproses'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300 animate-pulse'
                          : ord.status === 'dikirim' || ord.status === 'selesai'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-neutral-200/70 text-neutral-500'
                      }`}
                    >
                      <Package className="w-3 h-3" />
                      <span>2. Diproses</span>
                    </div>

                    <div
                      className={`p-1.5 rounded-xl font-bold flex items-center justify-center gap-1 ${
                        ord.status === 'dikirim'
                          ? 'bg-purple-100 text-purple-900 border border-purple-300 animate-pulse'
                          : ord.status === 'selesai'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-neutral-200/70 text-neutral-500'
                      }`}
                    >
                      <Truck className="w-3 h-3" />
                      <span>3. Dikirim & Kurir</span>
                    </div>
                  </div>

                  {/* Courier Info if already shipped */}
                  {ord.status === 'dikirim' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-2.5 text-xs text-purple-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-black">
                          <Bike className="w-4 h-4 text-purple-700" />
                          <span>Kurir Pengantar: {ord.courierName || 'Mitra Kurir Desa'}</span>
                        </div>
                        <p className="text-[11px] text-purple-800 font-medium">
                          {ord.courierVehicle || 'Motor Desa'} • Status Kurir:{' '}
                          <strong>
                            {ord.deliveryStatus === 'assigned'
                              ? 'Menunggu kurir mengambil paket di lapak'
                              : ord.deliveryStatus === 'picked_up'
                              ? 'Kurir sedang membawa paket menuju pembeli'
                              : ord.deliveryStatus === 'delivered'
                              ? 'Paket sudah diserahkan ke pembeli (Maks 5 jam)'
                              : 'Dalam Pengantaran'}
                          </strong>
                        </p>
                      </div>

                      {ord.courierPhone && (
                        <button
                          type="button"
                          onClick={() => {
                            const raw = ord.courierPhone!.replace(/[^0-9]/g, '');
                            const clean = raw.startsWith('0') ? '62' + raw.slice(1) : raw;
                            window.open(
                              `https://wa.me/${clean}?text=${encodeURIComponent(
                                `Halo Kang ${ord.courierName}, dari Lapak *${ord.sellerName}*. Mau tanya perihal paket pesanan #${ord.orderNumber}. Terima kasih!`
                              )}`,
                              '_blank'
                            );
                          }}
                          className="px-2.5 py-1 bg-purple-700 text-white rounded-lg text-[11px] font-bold hover:bg-purple-800 transition shrink-0 self-start sm:self-auto flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Chat Kurir</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                  <div className="text-xs">
                    Total: <strong className="text-emerald-900 text-sm">{formatRupiah(ord.total)}</strong>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Hubungi Pembeli via WhatsApp */}
                    <button
                      type="button"
                      onClick={() => {
                        const raw = ord.buyerPhone.replace(/[^0-9]/g, '');
                        const clean = raw.startsWith('0') ? '62' + raw.slice(1) : raw;
                        const msg = encodeURIComponent(
                          `Halo Kak ${ord.buyerName}, kami dari Lapak *${ord.sellerName}* telah menerima orderan Anda (${ord.invoiceNumber}). Pesanan sedang kami siapkan ya!`
                        );
                        window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition"
                      title="Hubungi Pembeli via WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WA Pembeli</span>
                    </button>

                    {ord.paymentProofUrl && (
                      <button
                        onClick={() => setProofModalUrl(ord.paymentProofUrl!)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Bukti Transfer
                      </button>
                    )}

                    {/* Step 1: Pesanan Diterima */}
                    {ord.status === 'menunggu' && !ord.orderAcceptedAt && (
                      <button
                        id={`seller-accept-btn-${ord.id}`}
                        onClick={() => acceptOrder(ord.id)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>1. Terima Pesanan</span>
                      </button>
                    )}

                    {/* Step 2: Diproses */}
                    {ord.status === 'menunggu' && ord.orderAcceptedAt && (
                      <button
                        id={`seller-process-btn-${ord.id}`}
                        onClick={() => processOrder(ord.id)}
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>2. Siapkan & Proses</span>
                      </button>
                    )}

                    {/* Step 3: Dikirim (lalu pilih kurir pengirim) */}
                    {ord.status === 'diproses' && (
                      <button
                        id={`seller-ship-btn-${ord.id}`}
                        onClick={() => {
                          setSelectedOrderForShipping(ord);
                          setSelectedCourierId((availableCouriers || [])[0]?.id || 'user-courier-1');
                        }}
                        className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>3. Kirim & Pilih Kurir</span>
                      </button>
                    )}

                    {/* Status change fallback select */}
                    <select
                      value={ord.status}
                      onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                      className="text-xs font-bold p-1.5 rounded-xl border border-neutral-300 bg-white"
                      title="Ubah Status Manual"
                    >
                      <option value="menunggu">Menunggu</option>
                      <option value="diproses">Diproses</option>
                      <option value="dikirim">Dikirim</option>
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

      {/* Content: Waktu Buka, Tutup & Libur Lapak */}
      {activeTab === 'jam_operasional' && <SellerStoreHoursTab />}

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

      {/* Modal 3: Pilih Kurir Pengirim */}
      {selectedOrderForShipping && (
        <div
          id="courier-selection-modal"
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedOrderForShipping(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-neutral-200 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Bike className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-neutral-900">
                    Langkah 3: Pilih Kurir Pengirim
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Pesanan #{selectedOrderForShipping.orderNumber || selectedOrderForShipping.invoiceNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderForShipping(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Destination summary */}
            <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-neutral-800">
                <span>Tujuan Pengantaran Warga:</span>
                <span className="text-emerald-700">Ongkir: {formatRupiah(selectedOrderForShipping.ongkir || 3000)}</span>
              </div>
              <div className="text-neutral-700">
                Penerima: <strong className="text-neutral-900">{selectedOrderForShipping.buyerName}</strong> ({selectedOrderForShipping.buyerPhone})
              </div>
              <div className="text-neutral-600">
                Alamat: {selectedOrderForShipping.buyerAddress} • <strong>{selectedOrderForShipping.buyerDusun}</strong>
              </div>
            </div>

            {/* Available couriers selector */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-neutral-700 flex items-center justify-between">
                <span>Pilih Mitra Kurir Desa yang Siap Mengantar:</span>
                <span className="text-[11px] text-purple-700 font-bold">
                  {availableCouriers.length} Kurir Tersedia
                </span>
              </label>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {availableCouriers.map((courier) => (
                  <div
                    key={courier.id}
                    onClick={() => setSelectedCourierId(courier.id)}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between gap-3 ${
                      selectedCourierId === courier.id
                        ? 'border-purple-600 bg-purple-50/70 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                        <Bike className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-xs text-neutral-900 flex items-center gap-1.5">
                          <span>{courier.name}</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                            Siap Antar
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          {courier.vehicleInfo || 'Motor Honda Beat'} • {courier.phone}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedCourierId === courier.id
                          ? 'border-purple-600 bg-purple-600 text-white'
                          : 'border-neutral-300'
                      }`}
                    >
                      {selectedCourierId === courier.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Courier Dispatch Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const courier =
                    (availableCouriers || []).find((c) => c.id === selectedCourierId) ||
                    (availableCouriers || [])[0];
                  if (!courier) return;

                  // Ship order with chosen courier
                  shipOrderWithCourier(selectedOrderForShipping.id, {
                    id: courier.id,
                    name: courier.name,
                    phone: courier.phone,
                    vehicle: courier.vehicleInfo,
                  });

                  // Notify courier on WhatsApp
                  const raw = courier.phone.replace(/[^0-9]/g, '');
                  const clean = raw.startsWith('0') ? '62' + raw.slice(1) : raw;
                  const message = encodeURIComponent(
                    `Halo Kang *${courier.name}*, ada pesanan baru dari Lapak *${selectedOrderForShipping.sellerName}* (Invoice #${selectedOrderForShipping.orderNumber}). Mohon diambil di lapak untuk diantar ke Kak ${selectedOrderForShipping.buyerName} di ${selectedOrderForShipping.buyerDusun}. Terima kasih!`
                  );
                  window.open(`https://wa.me/${clean}?text=${message}`, '_blank');

                  setSelectedOrderForShipping(null);
                }}
                className="w-full sm:flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black shadow-xs transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Kirimkan & Chat WhatsApp Kurir</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const courier =
                    (availableCouriers || []).find((c) => c.id === selectedCourierId) ||
                    (availableCouriers || [])[0];
                  if (!courier) return;

                  // Ship order without opening WhatsApp
                  shipOrderWithCourier(selectedOrderForShipping.id, {
                    id: courier.id,
                    name: courier.name,
                    phone: courier.phone,
                    vehicle: courier.vehicleInfo,
                  });

                  setSelectedOrderForShipping(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition"
              >
                Kirimkan Saja
              </button>
            </div>
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
