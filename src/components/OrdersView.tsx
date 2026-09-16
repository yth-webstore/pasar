import React, { useState } from 'react';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Eye,
  FileText,
  Star,
  ThumbsUp,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { formatRupiah } from '../utils/seo';

export const OrdersView: React.FC = () => {
  const { orders, currentUser, updateOrderStatus, setSelectedProduct, products, rateCourier, stores, settings } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  // State for courier rating modal
  const [ratingCourierOrder, setRatingCourierOrder] = useState<Order | null>(null);
  const [courierRatingScore, setCourierRatingScore] = useState<number>(5);
  const [courierReviewText, setCourierReviewText] = useState<string>('');
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);

  // Filter orders related to current user
  const userOrders = orders.filter((o) => {
    if (currentUser?.role === 'admin') return true; // Admin can see all
    if (currentUser?.role === 'seller') return o.sellerId === currentUser.id;
    return o.buyerId === currentUser?.id;
  });

  const filteredOrders = userOrders.filter((o) => {
    return filterStatus === 'all' || o.status === filterStatus;
  });

  // Handle courier rating submit
  const handleCourierRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingCourierOrder) return;
    try {
      setIsSubmittingRating(true);
      await rateCourier(
        ratingCourierOrder.id,
        ratingCourierOrder.courierId || 'courier-1',
        courierRatingScore,
        courierReviewText.trim()
      );
      setRatingCourierOrder(null);
      setCourierReviewText('');
    } catch (err) {
      console.error('Failed to rate courier:', err);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'menunggu':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            Menunggu Konfirmasi
          </span>
        );
      case 'diproses':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            <Package className="w-3 h-3" />
            Sedang Diproses
          </span>
        );
      case 'dikirim':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            <Truck className="w-3 h-3" />
            Dalam Pengantaran
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Pesanan Selesai
          </span>
        );
      case 'dibatalkan':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3" />
            Dibatalkan
          </span>
        );
      default:
        return null;
    }
  };

  const handleWhatsAppContact = (order: Order) => {
    const matchedStore = stores.find((s) => s.id === order.storeId || s.name === order.sellerName);
    const rawNumber = order.sellerWhatsapp || matchedStore?.whatsapp || matchedStore?.phone || '6285712345678';
    let cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('0')) cleanNumber = '62' + cleanNumber.slice(1);

    const itemsSummary = order.items
      .map((i) => `• ${i.quantity}x ${i.productName}${i.catatanProduk ? ` (Catatan: ${i.catatanProduk})` : ''}`)
      .join('\n');

    const text = encodeURIComponent(
      `*NOTIFIKASI PESANAN PASAR DESA ${settings.villageName.toUpperCase()}*\n\n` +
      `Halo Lapak *${order.sellerName}*,\n` +
      `Berikut rincian pesanan baru:\n` +
      `📋 *Invoice:* ${order.invoiceNumber}\n` +
      `👤 *Pemesan:* ${order.buyerName}\n` +
      `📞 *No. HP:* ${order.buyerPhone}\n` +
      `📍 *Alamat:* ${order.buyerAddress}\n` +
      `🚚 *Kirim:* ${order.deliveryMethod === 'antar_desa' ? 'Diantar Kurir Desa' : 'Ambil di Lapak'}\n` +
      `💳 *Metode Bayar:* ${order.paymentMethod.toUpperCase()}\n\n` +
      `📦 *Rincian Produk:*\n${itemsSummary}\n\n` +
      `💰 *Total Tagihan:* ${formatRupiah(order.total)}\n` +
      (order.buyerNote ? `📝 *Catatan Tambahan:* ${order.buyerNote}\n\n` : '\n') +
      `Mohon segera dicek dan disiapkan ya kak. Terima kasih!`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <div id="orders-view-container" className="max-w-4xl mx-auto px-4 py-6 space-y-5 pb-24">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Daftar Pesanan Warga
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium">
            Pantau status pesanan belanja desa dari menunggu hingga sampai ke rumah Anda.
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
        {[
          { id: 'all', label: 'Semua' },
          { id: 'menunggu', label: 'Menunggu' },
          { id: 'diproses', label: 'Diproses' },
          { id: 'dikirim', label: 'Dikirim' },
          { id: 'selesai', label: 'Selesai' },
          { id: 'dibatalkan', label: 'Dibatalkan' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              filterStatus === tab.id
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-neutral-200 p-8 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-neutral-800 text-base">Belum Ada Pesanan</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Anda belum memiliki riwayat pesanan dengan filter ini. Mari berbelanja produk UMKM dan hasil bumi {settings.villageName}!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-neutral-200 shadow-xs p-4 sm:p-5 space-y-3.5 transition-all hover:border-emerald-300"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span className="font-extrabold text-xs text-neutral-900">
                    {order.invoiceNumber}
                  </span>
                  <span className="text-[11px] text-neutral-400">• {order.createdAt}</span>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>

              {/* Seller info & items */}
              <div>
                <div className="mb-2">
                  <div className="text-xs font-bold text-neutral-800">
                    Lapak: <span className="text-emerald-800">{order.sellerName}</span>
                  </div>
                  {order.items[0] && (
                    <div className="mt-0.5">
                      <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold text-[10px] px-1.5 py-0.5 rounded-md">
                        {products.find((p) => p.id === order.items[0].productId)?.categoryName || 'Produk UMKM Desa'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-neutral-50 p-2.5 rounded-2xl">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-12 h-12 rounded-xl object-cover bg-white shrink-0 border border-neutral-200"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-neutral-900 truncate">
                          {item.productName}
                        </h4>
                        <div className="text-[11px] text-neutral-500">
                          {item.quantity} x {formatRupiah(item.price)} /{item.unit}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-xs text-neutral-900">
                          {formatRupiah(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery and payment detail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-neutral-50/70 p-3 rounded-2xl border border-neutral-100">
                <div>
                  <span className="text-[11px] text-neutral-500 block">Penerima & Alamat:</span>
                  <span className="font-bold text-neutral-800">{order.buyerName}</span> ({order.buyerPhone})
                  <div className="text-[11px] text-neutral-600 mt-0.5">{order.buyerAddress}</div>
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 block">Pembayaran & Pengiriman:</span>
                  <div className="font-semibold text-neutral-800 capitalize">
                    {order.paymentMethod === 'cod' ? '💵 Bayar di Tempat (COD)' : '💳 Transfer Penjual'}
                  </div>
                  <div className="text-[11px] text-neutral-600 mt-0.5">
                    {order.deliveryMethod === 'antar_desa' ? '🚚 Diantar Kurir Desa' : '🏠 Ambil Sendiri di Toko/Balai'}
                  </div>
                </div>
              </div>

              {/* Courier Delivery Card & Rating Section */}
              {order.deliveryMethod === 'antar_desa' && (
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                        <span>Kurir: {order.courierName || 'Kurir Antar Desa'}</span>
                        {order.courierPhone && (
                          <span className="text-[11px] text-neutral-500 font-normal">({order.courierPhone})</span>
                        )}
                      </div>
                      <div className="text-[11px] text-emerald-800 font-medium">
                        Pengantaran resmi se-desa • Ongkir Rp 3.000
                      </div>
                    </div>
                  </div>

                  {/* Courier Rating Display or Action */}
                  <div className="shrink-0">
                    {order.courierRating ? (
                      <div className="flex items-center gap-1.5 bg-white border border-amber-300 px-2.5 py-1 rounded-xl text-[11px] shadow-2xs">
                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < (order.courierRating || 0)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-neutral-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-neutral-800">{order.courierRating}/5</span>
                        {order.courierReview && (
                          <span className="text-neutral-500 max-w-36 truncate" title={order.courierReview}>
                            "{order.courierReview}"
                          </span>
                        )}
                      </div>
                    ) : order.status === 'selesai' && currentUser?.role === 'buyer' ? (
                      <button
                        onClick={() => {
                          setRatingCourierOrder(order);
                          setCourierRatingScore(5);
                          setCourierReviewText('');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-xl font-bold text-xs shadow-2xs transition"
                      >
                        <Star className="w-3.5 h-3.5 fill-neutral-950 text-neutral-950" />
                        <span>Beri Rating Kurir</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-neutral-400 italic">
                        {order.status === 'selesai' ? 'Rating kurir tersimpan' : 'Rating kurir setelah selesai'}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Total & Action Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-neutral-100">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-neutral-500">Total Pesanan:</span>
                  <span className="text-base font-black text-emerald-900">
                    {formatRupiah(order.total)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* View payment proof image if exists */}
                  {order.paymentProofUrl && (
                    <button
                      onClick={() => setSelectedProofUrl(order.paymentProofUrl!)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Lihat Bukti
                    </button>
                  )}

                  {/* WhatsApp Hubungi Penjual */}
                  <button
                    onClick={() => handleWhatsAppContact(order)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                    Hubungi Penjual
                  </button>

                  {/* Buyer action: Konfirmasi Diterima */}
                  {order.status === 'dikirim' && currentUser?.role === 'buyer' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'selesai')}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition"
                    >
                      Konfirmasi Terima
                    </button>
                  )}

                  {/* Buyer action: Rating Kurir Trigger if selesai and not yet rated */}
                  {order.status === 'selesai' &&
                    order.deliveryMethod === 'antar_desa' &&
                    !order.courierRating &&
                    currentUser?.role === 'buyer' && (
                      <button
                        onClick={() => {
                          setRatingCourierOrder(order);
                          setCourierRatingScore(5);
                          setCourierReviewText('');
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-2xs transition flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5 fill-neutral-950" />
                        <span>Nilai Kurir</span>
                      </button>
                    )}

                  {/* Review prompt when finished */}
                  {order.status === 'selesai' && (
                    <button
                      onClick={() => {
                        const targetProd = products.find((p) => p.id === order.items[0]?.productId);
                        if (targetProd) setSelectedProduct(targetProd);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition"
                    >
                      Beri Ulasan Produk
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Courier Rating Modal */}
      {ratingCourierOrder && (
        <div
          id="courier-rating-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setRatingCourierOrder(null)}
        >
          <div
            id="courier-rating-modal-container"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-neutral-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs border border-amber-200">
              <Truck className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-neutral-900">
                Beri Rating Kurir Desa
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                {ratingCourierOrder.courierName || `Kurir Antar ${settings.villageName}`} • {ratingCourierOrder.invoiceNumber}
              </p>
            </div>

            {/* 5 Star Selection */}
            <div className="py-2 bg-amber-50/50 rounded-2xl border border-amber-100/80">
              <div className="flex items-center justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCourierRatingScore(star)}
                    className="p-1 hover:scale-120 transition transform cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= courierRatingScore
                          ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                          : 'text-neutral-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-xs font-extrabold text-amber-900 mt-1.5">
                {courierRatingScore === 5
                  ? '⭐⭐⭐⭐⭐ Sangat Cepat & Memuaskan'
                  : courierRatingScore === 4
                  ? '⭐⭐⭐⭐ Pengantaran Baik & Ramah'
                  : courierRatingScore === 3
                  ? '⭐⭐⭐ Cukup Baik'
                  : courierRatingScore === 2
                  ? '⭐⭐ Kurang Memuaskan'
                  : '⭐ Perlu Perbaikan'}
              </div>
            </div>

            {/* Quick Feedback Tags */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
              {['Tepat Waktu', 'Barang Aman & Rapi', 'Sangat Ramah', 'Komunikasi Bagus', 'Hafal Alamat'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    if (courierReviewText.includes(tag)) return;
                    setCourierReviewText((prev) => (prev ? `${prev}, ${tag}` : tag));
                  }}
                  className="px-2.5 py-1 bg-neutral-100 hover:bg-emerald-50 hover:text-emerald-800 text-neutral-700 rounded-lg transition font-medium border border-neutral-200/80"
                >
                  + {tag}
                </button>
              ))}
            </div>

            {/* Review Note */}
            <form onSubmit={handleCourierRatingSubmit} className="space-y-3">
              <textarea
                rows={3}
                value={courierReviewText}
                onChange={(e) => setCourierReviewText(e.target.value)}
                placeholder="Tulis ulasan pengantaran kurir (contoh: Kurir tepat waktu, paket beras diantar sampai depan pintu dengan aman)..."
                className="w-full text-xs p-3 rounded-2xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none resize-none"
              />

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRatingCourierOrder(null)}
                  className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRating}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-black rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingRating ? 'Menyimpan...' : 'Kirim Penilaian'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proof of Transfer Modal */}
      {selectedProofUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedProofUrl(null)}
        >
          <div className="bg-white p-4 rounded-3xl max-w-sm w-full space-y-3 text-center">
            <h3 className="font-bold text-neutral-800 text-sm">Foto Bukti Transfer Pembeli</h3>
            <img
              src={selectedProofUrl}
              alt="Bukti Transfer"
              className="w-full max-h-80 object-contain rounded-xl border border-neutral-200 bg-neutral-50"
            />
            <button
              onClick={() => setSelectedProofUrl(null)}
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
