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
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { formatRupiah } from '../utils/seo';

export const OrdersView: React.FC = () => {
  const { orders, currentUser, updateOrderStatus, setSelectedProduct, products } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  // Filter orders related to current user
  const userOrders = orders.filter((o) => {
    if (currentUser?.role === 'admin') return true; // Admin can see all
    if (currentUser?.role === 'seller') return o.sellerId === currentUser.id;
    return o.buyerId === currentUser?.id;
  });

  const filteredOrders = userOrders.filter((o) => {
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchesSearch =
      o.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.some((it) => it.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

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
    const cleanNumber = '6285712345678'; // Seller whatsapp fallback
    const text = encodeURIComponent(
      `Halo, saya ingin menanyakan status pesanan saya dengan Invoice *${order.invoiceNumber}* (${order.items.map((i) => i.productName).join(', ')}). Terima kasih!`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <div id="orders-view-container" className="max-w-4xl mx-auto px-4 py-6 space-y-5 pb-24">
      {/* Title & Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Daftar Pesanan Warga
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium">
            Pantau status pesanan belanja desa dari menunggu hingga sampai ke rumah Anda.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari no. invoice atau produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-white pl-9 pr-3 py-2 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-emerald-200"
          />
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
            Anda belum memiliki riwayat pesanan dengan filter ini. Mari berbelanja produk UMKM dan hasil bumi Desa Sukamaju!
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
                <div className="text-xs font-bold text-neutral-700 mb-2">
                  Toko: <span className="text-emerald-800">{order.sellerName}</span>
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

                  {/* Review prompt when finished */}
                  {order.status === 'selesai' && (
                    <button
                      onClick={() => {
                        const targetProd = products.find((p) => p.id === order.items[0]?.productId);
                        if (targetProd) setSelectedProduct(targetProd);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-xl transition"
                    >
                      Beri Ulasan
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
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
