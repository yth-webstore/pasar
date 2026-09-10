import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  Truck,
  Building,
  Upload,
  CheckCircle,
  Copy,
  AlertTriangle,
  ArrowLeft,
  FileCheck2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/seo';
import { compressAndOptimizeImage, CompressionResult } from '../utils/imageCompressor';
import { Order } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    currentUser,
    settings,
    createOrder,
    setActiveTab,
  } = useApp();

  const [deliveryMethod, setDeliveryMethod] = useState<'antar_desa' | 'ambil_toko'>('antar_desa');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'transfer'>('cod');
  const [buyerName, setBuyerName] = useState(currentUser?.name || '');
  const [buyerPhone, setBuyerPhone] = useState(currentUser?.phone || '');
  const [buyerDusun, setBuyerDusun] = useState(currentUser?.dusun || 'Dusun Krajan, RT 02 / RW 01');
  const [buyerAddressDetail, setBuyerAddressDetail] = useState('');
  const [notes, setNotes] = useState('');

  // Proof of transfer upload state
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Success state
  const [createdOrders, setCreatedOrders] = useState<Order[] | null>(null);

  if (!isCheckoutModalOpen) return null;

  const subtotal = cart.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const deliveryFee = deliveryMethod === 'antar_desa' ? settings.deliveryFeeStandard : 0;
  const grandTotal = subtotal + deliveryFee;

  // Get distinct sellers in cart for transfer details
  const uniqueSellerIds: string[] = Array.from(new Set(cart.map((it) => it.product.sellerId)));
  const uniqueSellers = uniqueSellerIds.map((id) => {
    const item = cart.find((it) => it.product.sellerId === id)!;
    return {
      id,
      name: item.product.sellerName,
      whatsapp: item.product.sellerWhatsapp,
      dusun: item.product.sellerDusun,
    };
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsCompressing(true);

    try {
      // Rejects video, resizes, converts to WebP/JPEG
      const result = await compressAndOptimizeImage(file, 900, 900, 0.75);
      setCompressionResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengompres gambar.';
      setUploadError(msg);
    } finally {
      setIsCompressing(false);
    }
  };

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(identifier);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!buyerName.trim() || !buyerPhone.trim() || !buyerDusun.trim()) {
      alert('Mohon lengkapi nama, nomor HP / WhatsApp, dan dusun alamat Anda.');
      return;
    }

    if (paymentMethod === 'transfer' && !compressionResult) {
      if (!confirm('Anda memilih metode transfer namun belum mengunggah foto bukti transfer. Tetap lanjutkan dan kirim bukti via WhatsApp nanti?')) {
        return;
      }
    }

    const fullAddress = `${buyerDusun}${buyerAddressDetail ? ` - ${buyerAddressDetail}` : ''}`;

    const newOrders = createOrder({
      buyerAddress: fullAddress,
      buyerDusun,
      buyerPhone,
      deliveryMethod,
      paymentMethod,
      paymentProofUrl: compressionResult?.dataUrl,
      notes,
    });

    setCreatedOrders(newOrders);
  };

  const handleFinish = () => {
    setIsCheckoutModalOpen(false);
    setCreatedOrders(null);
    setActiveTab('pesanan');
  };

  return (
    <div
      id="checkout-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div
        id="checkout-modal-container"
        className="bg-white rounded-3xl max-w-xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-neutral-900">
              {createdOrders ? 'Pesanan Berhasil Dibuat!' : 'Konfirmasi & Checkout'}
            </h2>
          </div>
          {!createdOrders && (
            <button
              id="close-checkout-btn"
              onClick={() => setIsCheckoutModalOpen(false)}
              className="w-8 h-8 rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-700 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 flex-1">
          {createdOrders ? (
            /* Success View */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-neutral-900">
                  Alhamdulillah, Pesanan Diterima!
                </h3>
                <p className="text-xs text-neutral-600 max-w-sm mx-auto mt-1">
                  Pesanan Anda telah diteruskan ke penjual warga desa. Anda dapat memantau status atau menghubungi penjual langsung.
                </p>
              </div>

              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 text-left space-y-2.5">
                <div className="text-xs font-bold text-neutral-800 border-b border-neutral-200 pb-2">
                  Ringkasan Nota Pesanan ({createdOrders.length} Toko)
                </div>
                {createdOrders.map((ord) => (
                  <div key={ord.id} className="text-xs space-y-1 py-1 border-b border-neutral-100 last:border-none">
                    <div className="flex justify-between font-bold">
                      <span>{ord.sellerName}</span>
                      <span className="text-emerald-800">{formatRupiah(ord.total)}</span>
                    </div>
                    <div className="text-[11px] text-neutral-500 flex justify-between">
                      <span>Invoice: {ord.invoiceNumber}</span>
                      <span className="capitalize font-semibold text-amber-700">Status: {ord.status}</span>
                    </div>
                  </div>
                ))}
                <div className="pt-2 flex justify-between font-extrabold text-sm text-neutral-900">
                  <span>Total Pembayaran:</span>
                  <span className="text-emerald-900">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  id="view-orders-btn"
                  onClick={handleFinish}
                  className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition"
                >
                  Lihat Status Pesanan Saya
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleConfirmOrder} className="space-y-4">
              {/* Data Penerima */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3">
                <div className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                  1. Alamat Pengantaran Warga
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                      Nama Penerima *
                    </label>
                    <input
                      id="buyer-name-input"
                      type="text"
                      required
                      placeholder="Nama lengkap..."
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-emerald-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                      Nomor HP / WhatsApp *
                    </label>
                    <input
                      id="buyer-phone-input"
                      type="tel"
                      required
                      placeholder="08xxxxxxxxxx"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-emerald-200 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                    Dusun & RT / RW *
                  </label>
                  <select
                    id="buyer-dusun-select"
                    value={buyerDusun}
                    onChange={(e) => setBuyerDusun(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-emerald-200 outline-none"
                  >
                    <option value="Dusun Krajan, RT 01 / RW 01">Dusun Krajan (RT 01 / RW 01)</option>
                    <option value="Dusun Krajan, RT 02 / RW 01">Dusun Krajan (RT 02 / RW 01)</option>
                    <option value="Dusun Krajan, RT 03 / RW 01">Dusun Krajan (RT 03 / RW 01)</option>
                    <option value="Dusun Sukarame, RT 01 / RW 02">Dusun Sukarame (RT 01 / RW 02)</option>
                    <option value="Dusun Sukarame, RT 02 / RW 02">Dusun Sukarame (RT 02 / RW 02)</option>
                    <option value="Dusun Dukuh Kidul, RT 01 / RW 03">Dusun Dukuh Kidul (RT 01 / RW 03)</option>
                    <option value="Dusun Dukuh Kidul, RT 04 / RW 03">Dusun Dukuh Kidul (RT 04 / RW 03)</option>
                    <option value="Dusun Mekarwangi, RT 01 / RW 04">Dusun Mekarwangi (RT 01 / RW 04)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                    Patokan Rumah / Catatan Pengantaran
                  </label>
                  <input
                    id="buyer-address-detail"
                    type="text"
                    placeholder="Contoh: Depan Mushola Al-Ikhlas / Rumah pagar hijau"
                    value={buyerAddressDetail}
                    onChange={(e) => setBuyerAddressDetail(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>
              </div>

              {/* Metode Pengiriman */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-2.5">
                <div className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                  2. Opsi Pengantaran
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('antar_desa')}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition ${
                      deliveryMethod === 'antar_desa'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold ring-1 ring-emerald-500'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">Kurir Antar Desa</div>
                      <div className="text-[11px] text-neutral-500">
                        Diantar sampai depan rumah (Ongkir flat {formatRupiah(settings.deliveryFeeStandard)})
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('ambil_toko')}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition ${
                      deliveryMethod === 'ambil_toko'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold ring-1 ring-emerald-500'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Building className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">Ambil di Toko / Balai</div>
                      <div className="text-[11px] text-neutral-500">
                        Ambil sendiri langsung ke penjual (Gratis ongkir)
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Metode Pembayaran */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3">
                <div className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                  3. Metode Pembayaran
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition ${
                      paymentMethod === 'cod'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold ring-1 ring-emerald-500'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">COD (Bayar Tunai)</div>
                      <div className="text-[11px] text-neutral-500">
                        Bayar saat barang diterima di rumah atau di balai desa.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition ${
                      paymentMethod === 'transfer'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold ring-1 ring-emerald-500'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">Transfer ke Penjual</div>
                      <div className="text-[11px] text-neutral-500">
                        Transfer bank / e-wallet & upload bukti transfer.
                      </div>
                    </div>
                  </button>
                </div>

                {/* Transfer Info and Upload Proof */}
                {paymentMethod === 'transfer' && (
                  <div className="pt-2 border-t border-neutral-200 space-y-3">
                    <div className="p-3 bg-white rounded-xl border border-neutral-200 text-xs space-y-2">
                      <div className="font-bold text-neutral-800">
                        Rekening Tujuan Transfer Penjual:
                      </div>
                      {uniqueSellers.map((s) => (
                        <div
                          key={s.id}
                          className="p-2 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-neutral-900">{s.name}</div>
                            <div className="text-[11px] text-neutral-600">
                              BRI Unit Desa: <strong>3829-01-023912-50-2</strong> (an. Penjual)
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('382901023912502', s.id)}
                            className="p-1.5 text-neutral-500 hover:text-emerald-700 transition"
                            title="Salin No. Rekening"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {copiedAccount && (
                        <div className="text-[11px] text-emerald-700 font-bold">
                          ✓ Nomor rekening berhasil disalin!
                        </div>
                      )}
                    </div>

                    {/* Image Upload with Automatic Compression */}
                    <div>
                      <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                        Upload Foto Bukti Transfer (Otomatis Dikompresi Ringan):
                      </label>
                      <div className="border-2 border-dashed border-neutral-300 hover:border-emerald-500 p-3 rounded-2xl bg-white text-center cursor-pointer relative">
                        <input
                          id="payment-proof-input"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="flex flex-col items-center justify-center space-y-1">
                          <Upload className="w-5 h-5 text-neutral-400" />
                          <span className="text-xs font-semibold text-emerald-800">
                            Pilih Foto Bukti Transfer
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            Hanya foto JPG, PNG, atau WebP (Video ditolak)
                          </span>
                        </div>
                      </div>

                      {isCompressing && (
                        <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5 animate-pulse">
                          <span>Sedang mengompres gambar agar hemat kuota...</span>
                        </div>
                      )}

                      {uploadError && (
                        <div className="mt-2 p-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-1.5">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{uploadError}</span>
                        </div>
                      )}

                      {compressionResult && (
                        <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                          <img
                            src={compressionResult.dataUrl}
                            alt="Bukti Transfer"
                            className="w-12 h-12 rounded-lg object-cover border border-emerald-300"
                          />
                          <div className="text-xs">
                            <div className="font-bold text-emerald-900 flex items-center gap-1">
                              <FileCheck2 className="w-3.5 h-3.5" />
                              Foto Berhasil Dikompresi!
                            </div>
                            <div className="text-[11px] text-emerald-700">
                              Ukuran: {compressionResult.compressedSizeKB} KB (Hemat{' '}
                              {compressionResult.reductionPercentage}% kuota)
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Rincian Biaya */}
              <div className="p-3.5 bg-neutral-100 rounded-2xl space-y-1.5 text-xs text-neutral-700">
                <div className="flex justify-between">
                  <span>Subtotal Produk:</span>
                  <span className="font-bold">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Pengantaran:</span>
                  <span className="font-bold">
                    {deliveryFee > 0 ? formatRupiah(deliveryFee) : 'Gratis (Ambil Sendiri)'}
                  </span>
                </div>
                <div className="pt-2 border-t border-neutral-200 flex justify-between text-sm font-extrabold text-neutral-900">
                  <span>Total Tagihan:</span>
                  <span className="text-emerald-900 text-base">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="px-4 py-3 border border-neutral-300 rounded-2xl text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition"
                >
                  Batal
                </button>
                <button
                  id="submit-order-btn"
                  type="submit"
                  className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition"
                >
                  Pesan Sekarang ({formatRupiah(grandTotal)})
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
