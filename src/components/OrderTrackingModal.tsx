import React from 'react';
import {
  X,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  MapPin,
  Home,
  Phone,
  MessageCircle,
  FileText,
  Copy,
  Check,
  Bike,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { formatRupiah } from '../utils/seo';

interface OrderTrackingModalProps {
  orderId: string;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ orderId, onClose }) => {
  const {
    orders,
    stores,
    confirmOrderReceivedByBuyer,
    currentUser,
    settings,
  } = useApp();

  const [copiedInvoice, setCopiedInvoice] = React.useState(false);

  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="font-bold text-neutral-900">Pesanan Tidak Ditemukan</h3>
          <p className="text-xs text-neutral-500">ID pesanan ini mungkin telah dihapus atau tidak valid.</p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-emerald-700 text-white rounded-xl font-bold text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  const matchedStore = stores.find((s) => s.id === order.storeId || s.name === order.sellerName);
  const sellerWhatsapp = order.sellerWhatsapp || matchedStore?.whatsapp || matchedStore?.phone || '6285712345678';
  let cleanSellerPhone = sellerWhatsapp.replace(/[^0-9]/g, '');
  if (cleanSellerPhone.startsWith('0')) cleanSellerPhone = '62' + cleanSellerPhone.slice(1);

  let cleanCourierPhone = (order.courierPhone || '').replace(/[^0-9]/g, '');
  if (cleanCourierPhone.startsWith('0')) cleanCourierPhone = '62' + cleanCourierPhone.slice(1);

  // Stepper logic
  const steps = [
    {
      key: 'menunggu',
      title: 'Pesanan Diterima',
      desc: 'Menunggu konfirmasi ketersediaan oleh penjual lapak',
      time: order.createdAt,
    },
    {
      key: 'diproses',
      title: 'Sedang Disiapkan',
      desc: 'Penjual sedang membungkus dan menyiapkan produk pesanan Anda',
      time: order.processingAt,
    },
    {
      key: 'dikirim',
      title: order.deliveryMethod === 'antar_desa' ? 'Diantar Kurir Desa' : 'Siap Diambil di Lapak',
      desc:
        order.deliveryMethod === 'antar_desa'
          ? order.courierName
            ? `Kurir ${order.courierName} sedang dalam perjalanan mengantar ke lokasi/patokan rumah`
            : 'Menunggu kurir desa mengambil paket di lapak'
          : 'Silakan ambil pesanan Anda langsung di lapak/balai desa',
      time: order.shippedAt || order.courierPickedUpAt,
    },
    {
      key: 'selesai',
      title: 'Pesanan Tiba & Selesai',
      desc: 'Paket telah diterima dengan baik oleh pembeli atau pihak yang dititipi',
      time: order.completedAt || order.courierDeliveredAt,
    },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'menunggu':
        return 0;
      case 'diproses':
        return 1;
      case 'dikirim':
        return 2;
      case 'selesai':
        return 3;
      case 'dibatalkan':
        return -1;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  const copyInvoice = () => {
    navigator.clipboard.writeText(order.invoiceNumber || order.orderNumber);
    setCopiedInvoice(true);
    setTimeout(() => setCopiedInvoice(false), 2500);
  };

  return (
    <div
      id="order-tracking-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div
        id="order-tracking-modal-card"
        className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-emerald-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700/80 flex items-center justify-center text-white shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-1.5">
                <span>Status Pelacakan Pesanan</span>
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-emerald-100">
                <span className="font-mono">{order.invoiceNumber}</span>
                <button
                  onClick={copyInvoice}
                  className="hover:text-white flex items-center gap-0.5 cursor-pointer"
                  title="Salin Nomor Invoice"
                >
                  {copiedInvoice ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Status Alert Banner */}
          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
              order.status === 'selesai'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : order.status === 'dibatalkan'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : order.status === 'dikirim'
                ? 'bg-purple-50 border-purple-200 text-purple-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {order.status === 'selesai' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : order.status === 'dibatalkan' ? (
                <XCircle className="w-5 h-5 text-rose-600" />
              ) : order.status === 'dikirim' ? (
                <Truck className="w-5 h-5 text-purple-600" />
              ) : (
                <Clock className="w-5 h-5 text-amber-600" />
              )}
            </div>
            <div className="space-y-0.5">
              <div className="font-black text-xs sm:text-sm capitalize">
                {order.status === 'menunggu'
                  ? 'Menunggu Konfirmasi Lapak'
                  : order.status === 'diproses'
                  ? 'Sedang Dipersiapkan oleh Lapak'
                  : order.status === 'dikirim'
                  ? 'Sedang Dalam Pengantaran ke Lokasi'
                  : order.status === 'selesai'
                  ? 'Pesanan Selesai Diterima'
                  : 'Pesanan Dibatalkan'}
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                {order.status === 'menunggu' &&
                  'Pesanan telah terkirim ke sistem penjual. Penjual akan memeriksa ketersediaan stok.'}
                {order.status === 'diproses' &&
                  'Lapak telah menerima pesanan Anda dan saat ini sedang membungkus produk.'}
                {order.status === 'dikirim' &&
                  `Kurir desa sedang bergerak menuju alamat penerima (${order.buyerDusun}).`}
                {order.status === 'selesai' &&
                  'Paket telah sampai dan transaksi dinyatakan selesai. Terima kasih telah berbelanja di Pasar Desa!'}
                {order.status === 'dibatalkan' &&
                  `Pesanan ini telah dibatalkan. Alasan: ${order.cancelReason || 'Dibatalkan oleh sistem/penjual.'}`}
              </p>
            </div>
          </div>

          {/* Stepper Timeline */}
          {order.status !== 'dibatalkan' && (
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/90 space-y-3">
              <div className="font-extrabold text-neutral-800 text-xs">Perjalanan Status Pesanan:</div>
              <div className="space-y-4 pl-1">
                {steps.map((step, idx) => {
                  const isDone = currentStepIdx > idx || (order.status === 'selesai' && idx === 3);
                  const isCurrent = currentStepIdx === idx && order.status !== 'selesai';
                  return (
                    <div key={step.key} className="flex items-start gap-3 relative">
                      {/* Vertical line connector */}
                      {idx < steps.length - 1 && (
                        <div
                          className={`absolute left-3.5 top-7 bottom-0 w-0.5 -mb-4 ${
                            isDone ? 'bg-emerald-600' : 'bg-neutral-200'
                          }`}
                        />
                      )}

                      {/* Step Circle */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition font-bold text-xs ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                            : 'bg-neutral-200 text-neutral-500'
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>

                      {/* Step Details */}
                      <div className="flex-1 min-w-0 pb-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-bold text-xs ${
                              isDone
                                ? 'text-emerald-950'
                                : isCurrent
                                ? 'text-neutral-900 font-extrabold'
                                : 'text-neutral-400'
                            }`}
                          >
                            {step.title}
                          </span>
                          {step.time && (
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {step.time}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 leading-relaxed mt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Patokan Rumah & Opsi Titip (Jika pembeli tidak di rumah) */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-950 text-xs">
              <Home className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Patokan Rumah & Lokasi Pengantaran:</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-emerald-200/80 space-y-1.5">
              {order.landmarkLabel && (
                <div className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[11px] font-bold rounded-md">
                  {order.landmarkLabel}
                </div>
              )}

              <div className="text-xs text-neutral-800 font-semibold">
                {order.buyerAddress}
              </div>

              {order.patokanRumah && order.patokanRumah !== order.buyerAddress && (
                <div className="text-[11px] text-emerald-900 bg-emerald-50/80 p-2 rounded-lg border border-emerald-100 font-medium">
                  <strong>Patokan / Titip:</strong> {order.patokanRumah}
                </div>
              )}

              <div className="text-[11px] text-neutral-500 flex items-center gap-1 pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                <span>{order.buyerDusun}</span>
              </div>
            </div>
          </div>

          {/* Kontak Kurir & Penjual WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Lapak Penjual */}
            <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200 space-y-2">
              <div className="text-[11px] text-neutral-500 font-medium">Lapak Penjual:</div>
              <div className="font-bold text-xs text-neutral-900 truncate">{order.sellerName}</div>
              <a
                href={`https://wa.me/${cleanSellerPhone}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Hubungi Penjual</span>
              </a>
            </div>

            {/* Kurir Antar Desa */}
            <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200 space-y-2">
              <div className="text-[11px] text-neutral-500 font-medium">Kurir Desa:</div>
              <div className="font-bold text-xs text-neutral-900 truncate">
                {order.courierName || 'Menunggu Penugasan Kurir'}
              </div>
              {order.courierPhone ? (
                <a
                  href={`https://wa.me/${cleanCourierPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-1.5 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Hubungi Kurir</span>
                </a>
              ) : (
                <div className="text-[11px] text-neutral-400 italic text-center py-1">
                  Kurir ditugaskan saat siap kirim
                </div>
              )}
            </div>
          </div>

          {/* Rincian Produk & Tagihan */}
          <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-800">
              <span>Barang yang Dipesan ({order.items.length}):</span>
              <span className="text-emerald-900">{formatRupiah(order.total)}</span>
            </div>
            <div className="space-y-1.5 divide-y divide-neutral-200/60">
              {order.items.map((item, i) => (
                <div key={i} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs">
                  <div className="flex-1 pr-2 truncate">
                    <span className="font-semibold text-neutral-900">{item.productName}</span>
                    <span className="text-neutral-500 ml-1">x{item.quantity}</span>
                    {item.catatanProduk && (
                      <span className="block text-[10px] text-neutral-400 italic">
                        Catatan: {item.catatanProduk}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-neutral-700">
                    {formatRupiah(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Konfirmasi Terima jika sedang dikirim */}
          {order.status === 'dikirim' && (
            <button
              id="confirm-received-modal-btn"
              onClick={() => {
                confirmOrderReceivedByBuyer(order.id);
                onClose();
              }}
              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Konfirmasi Paket Sudah Diterima</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 flex items-center justify-end bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
