import React, { useState, useEffect } from 'react';
import {
  Bike,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Store,
  User as UserIcon,
  DollarSign,
  Star,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { formatRupiah } from '../utils/seo';

export const CourierDashboard: React.FC = () => {
  const {
    orders,
    currentUser,
    users,
    courierPickupPackage,
    courierDeliverPackage,
    forceAutoCompleteOrder,
    settings,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'assigned' | 'delivering' | 'delivered' | 'completed'>('assigned');
  const [, setTimerTick] = useState<number>(Date.now());

  // Update timer tick every 10 seconds to keep countdown accurate
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerTick(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Filter orders assigned to courier (or show all courier orders in demo mode if admin/buyer testing)
  const isDedicatedCourier = currentUser?.role === 'courier';
  const courierOrders = orders.filter((o) => {
    if (o.deliveryMethod !== 'antar_desa') return false;
    if (isDedicatedCourier) {
      return o.courierId === currentUser?.id || !o.courierId;
    }
    // In preview/demo mode, let anyone view courier operations
    return Boolean(o.courierId) || o.status === 'dikirim' || o.deliveryStatus === 'assigned';
  });

  // Step 1: Menunggu Kurir Menerima Paket
  const assignedOrders = courierOrders.filter(
    (o) => o.status === 'dikirim' && (o.deliveryStatus === 'assigned' || !o.courierPickedUpAt)
  );

  // Step 2: Kurir Menerima Paket & Dalam Perjalanan
  const deliveringOrders = courierOrders.filter(
    (o) => o.status === 'dikirim' && o.deliveryStatus === 'picked_up'
  );

  // Step 2.5: Paket Terkirim & Menunggu Konfirmasi Pembeli (Maks 5 Jam)
  const waitingBuyerOrders = courierOrders.filter(
    (o) => o.deliveryStatus === 'delivered' && o.status !== 'selesai' && o.status !== 'dibatalkan'
  );

  // Step 3: Selesai
  const completedOrders = courierOrders.filter(
    (o) => o.status === 'selesai' && (o.deliveryStatus === 'delivered' || o.courierId)
  );

  // Courier earnings calculation
  const totalEarnings = completedOrders.length * (settings.deliveryFeeStandard || 3000);

  // Format remaining time from 5 hours deadline
  const formatRemainingTime = (deliveredAtStr?: string, autoAtStr?: string) => {
    const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;
    const targetMs = autoAtStr
      ? new Date(autoAtStr).getTime()
      : deliveredAtStr
      ? new Date(deliveredAtStr).getTime() + FIVE_HOURS_MS
      : Date.now();

    const diff = targetMs - Date.now();
    if (diff <= 0) return 'Batas 5 jam tercapai (segera selesai otomatis)';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} jam ${minutes} menit lagi`;
  };

  const openWhatsApp = (phone: string, text: string) => {
    const raw = phone.replace(/[^0-9]/g, '');
    const clean = raw.startsWith('0') ? '62' + raw.slice(1) : raw;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div id="courier-dashboard" className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner Kurir Desa */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-blue-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/30 border border-blue-400/40 flex items-center justify-center text-white shrink-0">
              <Bike className="w-9 h-9 text-blue-200" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-xs font-bold mb-1 border border-blue-400/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Mitra Resmi Kurir {settings.villageName}
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                {currentUser?.name || 'Kang Ujang Pengantar Desa'}
              </h1>
              <p className="text-xs text-blue-200/90 mt-0.5 font-medium">
                {currentUser?.vehicleInfo || 'Motor Honda Beat • B 4567 DES'} • Ongkir Flat Rp 3.000 / Antaran
              </p>
            </div>
          </div>

          {/* Quick Earnings Stat */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 flex items-center gap-4 self-start md:self-auto">
            <div>
              <div className="text-[11px] text-blue-200 font-medium">Total Ongkir Terkumpul</div>
              <div className="text-lg sm:text-xl font-black text-amber-300">
                {formatRupiah(totalEarnings)}
              </div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <div className="text-[11px] text-blue-200 font-medium">Paket Sukses</div>
              <div className="text-lg sm:text-xl font-black text-white">
                {completedOrders.length} <span className="text-xs font-normal text-blue-200">titipan</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Step Workflow Explanation */}
        <div className="mt-5 pt-4 border-t border-blue-700/50 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-2 bg-blue-950/40 p-2.5 rounded-xl border border-blue-700/40">
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white font-black flex items-center justify-center text-[10px] shrink-0">1</span>
            <div>
              <div className="font-bold text-white">Menerima Paket</div>
              <div className="text-[11px] text-blue-200">Ambil barang pesanan dari lapak penjual</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-950/40 p-2.5 rounded-xl border border-blue-700/40">
            <span className="w-5 h-5 rounded-full bg-amber-400 text-neutral-950 font-black flex items-center justify-center text-[10px] shrink-0">2</span>
            <div>
              <div className="font-bold text-white">Paket Terkirim</div>
              <div className="text-[11px] text-blue-200">Serahkan ke pembeli & hitung mundur 5 jam</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-950/40 p-2.5 rounded-xl border border-blue-700/40">
            <span className="w-5 h-5 rounded-full bg-emerald-400 text-neutral-950 font-black flex items-center justify-center text-[10px] shrink-0">3</span>
            <div>
              <div className="font-bold text-white">Selesai</div>
              <div className="text-[11px] text-blue-200">Dikonfirmasi pembeli / otomatis 5 jam</div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Navigation Sub-tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveSubTab('assigned')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'assigned'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>1. Ambil Paket di Lapak</span>
          {assignedOrders.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-400 text-neutral-950 text-[10px] font-black flex items-center justify-center">
              {assignedOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('delivering')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'delivering'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>2. Dalam Perjalanan Antar</span>
          {deliveringOrders.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-400 text-neutral-950 text-[10px] font-black flex items-center justify-center">
              {deliveringOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('delivered')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'delivered'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Menunggu Konfirmasi (Maks 5 Jam)</span>
          {waitingBuyerOrders.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] font-black flex items-center justify-center">
              {waitingBuyerOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('completed')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'completed'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>3. Selesai</span>
          <span className="text-[11px] opacity-80">({completedOrders.length})</span>
        </button>
      </div>

      {/* Tab 1: Menerima Paket dari Penjual */}
      {activeSubTab === 'assigned' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-neutral-900 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-blue-700" />
              <span>Daftar Paket Siap Diambil dari Lapak Penjual ({assignedOrders.length})</span>
            </h2>
            <span className="text-xs text-neutral-500">
              Silakan datangi lapak penjual untuk mengambil paket
            </span>
          </div>

          {assignedOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-10 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-neutral-900 text-sm">Tidak Ada Paket Menunggu Penjemputan</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Saat penjual memilih Anda sebagai kurir pengantar, pesanan akan otomatis muncul di daftar ini.
              </p>
            </div>
          ) : (
            assignedOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-3xl border-2 border-blue-200 p-5 shadow-xs space-y-4 hover:border-blue-300 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-neutral-900">
                        Invoice #{ord.orderNumber || ord.invoiceNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase">
                        Ditugaskan ke Kurir
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      Waktu pesan: {new Date(ord.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-neutral-500">Ongkos Kirim Kurir:</span>
                    <div className="text-sm font-black text-emerald-700">
                      {formatRupiah(ord.ongkir || 3000)}
                    </div>
                  </div>
                </div>

                {/* Seller Pickup Point */}
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                      <Store className="w-4 h-4 text-amber-700" />
                      <span>Titik Penjemputan (Lapak Penjual):</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        openWhatsApp(
                          ord.sellerWhatsapp || '085712345678',
                          `Halo Lapak *${ord.sellerName}*, saya kurir ${currentUser?.name || 'desa'}. Saya sedang menuju lapak untuk mengambil paket pesanan #${ord.orderNumber}. Mohon disiapkan ya!`
                        )
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-700 text-white rounded-xl text-[11px] font-bold hover:bg-emerald-800 transition"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Chat Penjual</span>
                    </button>
                  </div>
                  <div className="text-xs text-neutral-800">
                    <span className="font-bold text-neutral-900">{ord.sellerName}</span>
                    <p className="text-[11px] text-neutral-600 mt-0.5">
                      {ord.storeName || 'Lapak Desa'} • Dusun Sukarame / Dusun Krajan
                    </p>
                  </div>
                </div>

                {/* Items to pick up */}
                <div className="text-xs space-y-1 bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                  <div className="font-bold text-neutral-700 text-[11px]">Rincian Barang yang Diambil:</div>
                  {ord.items.map((it, idx) => (
                    <div key={`courier-item-${ord.id}-${it.productId || idx}-${idx}`} className="flex justify-between text-[11px] text-neutral-600">
                      <span>• {it.productName} ({it.quantity} {it.unit})</span>
                      <span className="font-semibold">{formatRupiah(it.price * it.quantity)}</span>
                    </div>
                  ))}
                  {ord.buyerNote && (
                    <div className="mt-2 text-[11px] bg-amber-100/70 text-amber-900 p-2 rounded-xl border border-amber-200">
                      <strong>Catatan Khusus:</strong> {ord.buyerNote}
                    </div>
                  )}
                </div>

                {/* Action: Step 1 Terima Paket */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-neutral-600">
                    Tujuan Antar: <strong className="text-neutral-900">{ord.buyerName}</strong> ({ord.buyerDusun})
                  </div>
                  <button
                    id={`courier-pickup-btn-${ord.id}`}
                    onClick={() => courierPickupPackage(ord.id)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    <span>Langkah 1: Terima Paket dari Penjual</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Dalam Perjalanan Antar ke Pembeli */}
      {activeSubTab === 'delivering' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-neutral-900 flex items-center gap-1.5">
              <Bike className="w-4 h-4 text-amber-600" />
              <span>Paket Sedang Dibawa Menuju Rumah Pembeli ({deliveringOrders.length})</span>
            </h2>
            <span className="text-xs text-neutral-500">
              Antar barang dengan aman dan serahkan langsung ke warga
            </span>
          </div>

          {deliveringOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-10 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                <Bike className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-neutral-900 text-sm">Tidak Ada Paket yang Sedang Diantar</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Setelah Anda menekan tombol "Terima Paket dari Penjual", paket akan berpindah ke tab ini.
              </p>
            </div>
          ) : (
            deliveringOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-3xl border-2 border-amber-300 p-5 shadow-xs space-y-4 hover:border-amber-400 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-neutral-900">
                        Invoice #{ord.orderNumber || ord.invoiceNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase">
                        Sedang Diantar Kurir
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      Paket diambil: {ord.courierPickedUpAt ? new Date(ord.courierPickedUpAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Baru saja'} WIB
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-neutral-500">Metode Bayar:</span>
                    <div className="text-xs font-black uppercase text-neutral-900">
                      {ord.paymentMethod === 'cod' ? '💵 Bayar di Tempat (COD)' : '💳 Lunas (Transfer)'}
                    </div>
                  </div>
                </div>

                {/* Destination: Buyer info */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                      <MapPin className="w-4 h-4 text-emerald-700" />
                      <span>Tujuan Antar (Alamat Rumah Pembeli):</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        openWhatsApp(
                          ord.buyerPhone,
                          `Halo Kak *${ord.buyerName}*, saya kurir pengantar ${currentUser?.name || 'desa'}. Saya sedang menuju rumah Anda untuk mengantarkan pesanan #${ord.orderNumber}. Mohon ditunggu ya!`
                        )
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-700 text-white rounded-xl text-[11px] font-bold hover:bg-emerald-800 transition"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp Pembeli</span>
                    </button>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="font-extrabold text-neutral-900 text-sm">
                      {ord.buyerName} <span className="text-xs font-medium text-neutral-500">({ord.buyerPhone})</span>
                    </div>
                    <div className="text-neutral-700 font-medium">
                      📍 {ord.buyerAddress} • <span className="font-bold text-emerald-900">{ord.buyerDusun}</span>
                    </div>
                  </div>

                  {ord.buyerNote && (
                    <div className="text-[11px] bg-white/80 p-2.5 rounded-xl border border-emerald-300/80 text-neutral-800">
                      <span className="font-bold text-emerald-900">Catatan Warga:</span> "{ord.buyerNote}"
                    </div>
                  )}

                  {ord.paymentMethod === 'cod' && (
                    <div className="bg-amber-100 text-amber-950 p-2.5 rounded-xl border border-amber-300 text-xs flex items-center justify-between font-bold">
                      <span>Tagih Uang Tunai COD ke Pembeli:</span>
                      <span className="text-sm font-black text-amber-900">{formatRupiah(ord.total)}</span>
                    </div>
                  )}
                </div>

                {/* Action: Step 2 Paket Terkirim */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-neutral-500">
                    Setelah diserahkan ke pembeli, waktu batas konfirmasi 5 jam akan langsung berjalan.
                  </div>
                  <button
                    id={`courier-delivered-btn-${ord.id}`}
                    onClick={() => courierDeliverPackage(ord.id)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Langkah 2: Paket Terkirim / Serahkan ke Pembeli</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2.5: Menunggu Konfirmasi Pembeli atau 5 Jam Otomatis */}
      {activeSubTab === 'delivered' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-neutral-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-700" />
              <span>Paket Sudah Diserahkan - Menunggu Konfirmasi Pembeli ({waitingBuyerOrders.length})</span>
            </h2>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-xs text-purple-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-700" />
              <span>Aturan Alur Penyelesaian Transaksi Desa:</span>
            </div>
            <p className="text-purple-900 leading-relaxed">
              Pembeli dapat langsung mengonfirmasi penerimaan barang di aplikasi. Apabila tidak dikonfirmasi selesai oleh pembeli, maka <strong>sistem akan otomatis menyelesaikannya tepat 5 jam setelah kurir menyerahkan paket</strong>.
            </p>
          </div>

          {waitingBuyerOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-10 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-neutral-900 text-sm">Tidak Ada Paket dalam Masa Tunggu 5 Jam</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Paket yang baru saja Anda serahkan ke pembeli akan tercatat di sini dengan timer hitung mundur.
              </p>
            </div>
          ) : (
            waitingBuyerOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-3xl border border-purple-200 p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-neutral-900">
                        Invoice #{ord.orderNumber || ord.invoiceNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase">
                        Paket Diserahkan ke Pembeli
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      Waktu Serah: {ord.courierDeliveredAt ? new Date(ord.courierDeliveredAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'} WIB
                    </div>
                  </div>

                  {/* Countdown Badge */}
                  <div className="bg-purple-100 text-purple-900 px-3 py-1 rounded-xl text-xs font-bold border border-purple-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-700 animate-spin" />
                    <span>Otomatis Selesai: {formatRemainingTime(ord.courierDeliveredAt, ord.autoCompleteAt)}</span>
                  </div>
                </div>

                <div className="text-xs space-y-1 text-neutral-600">
                  <div>Penerima: <strong className="text-neutral-900">{ord.buyerName}</strong> ({ord.buyerPhone})</div>
                  <div>Alamat: {ord.buyerAddress} ({ord.buyerDusun})</div>
                  <div>Lapak: {ord.sellerName}</div>
                </div>

                {/* Fast testing / simulation helper */}
                <div className="bg-neutral-50 rounded-2xl p-3 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-[11px] text-neutral-500">
                    💡 <em>Fitur Pengujian Cepat: Klik untuk menyimulasikan lewatnya batas 5 jam secara instan.</em>
                  </div>
                  <button
                    onClick={() => forceAutoCompleteOrder(ord.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition whitespace-nowrap self-start sm:self-auto"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Percepat 5 Jam (Simulasi Selesai)</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Pengantaran Selesai */}
      {activeSubTab === 'completed' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-neutral-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Riwayat Pengantaran Selesai ({completedOrders.length})</span>
            </h2>
            <span className="text-xs text-neutral-500">
              Total Ongkir: <strong className="text-emerald-800">{formatRupiah(totalEarnings)}</strong>
            </span>
          </div>

          {completedOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-10 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-neutral-900 text-sm">Belum Ada Pengantaran yang Selesai</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Pesanan yang telah dikonfirmasi oleh pembeli atau otomatis selesai setelah 5 jam akan tertera di sini.
              </p>
            </div>
          ) : (
            completedOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-3xl border border-neutral-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-neutral-900">
                        Invoice #{ord.orderNumber || ord.invoiceNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Selesai
                      </span>
                      {ord.completedBy === 'system_auto_5h' ? (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                          ⏱️ Otomatis Sistem (5 Jam)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                          👤 Dikonfirmasi Pembeli
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      Waktu Selesai: {ord.completedAt ? new Date(ord.completedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : ord.updatedAt}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-neutral-500">Ongkir Masuk:</span>
                    <div className="text-sm font-black text-emerald-700">
                      +{formatRupiah(ord.ongkir || 3000)}
                    </div>
                  </div>
                </div>

                <div className="text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-600">
                  <div>
                    <span className="text-neutral-400">Pembeli:</span> {ord.buyerName} ({ord.buyerDusun})
                  </div>
                  <div>
                    <span className="text-neutral-400">Lapak Penjual:</span> {ord.sellerName}
                  </div>
                </div>

                {/* Rating & Review by Buyer */}
                {ord.courierRating && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1 font-bold text-amber-950">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>Rating dari Pembeli: {ord.courierRating} / 5</span>
                      </div>
                      {ord.courierReview && (
                        <p className="text-[11px] text-amber-900 mt-0.5 italic">
                          "{ord.courierReview}"
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-amber-800 font-semibold uppercase bg-amber-100 px-2 py-0.5 rounded-full">
                      Ulasan Warga
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
