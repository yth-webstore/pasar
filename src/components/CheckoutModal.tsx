import React, { useState, useEffect } from 'react';
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
  MessageCircle,
  BellRing,
  Store,
  Home,
  MapPin,
  Plus,
  Bookmark,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/seo';
import { compressAndOptimizeImage, CompressionResult } from '../utils/imageCompressor';
import { Order, HouseLandmark } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    currentUser,
    settings,
    createOrder,
    sendOrderWhatsAppToSeller,
    updateCartItemNote,
    setActiveTab,
    savedLandmarks,
    addSavedLandmark,
    setSelectedOrderIdForTracking,
  } = useApp();

  const [deliveryMethod, setDeliveryMethod] = useState<'antar_desa' | 'ambil_toko'>('antar_desa');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'transfer'>('cod');
  const [buyerName, setBuyerName] = useState(currentUser?.name || '');
  const [buyerPhone, setBuyerPhone] = useState(currentUser?.phone || '');
  const [buyerDusun, setBuyerDusun] = useState(currentUser?.dusun || 'Dusun Krajan, RT 02 / RW 01');
  const [buyerAddressDetail, setBuyerAddressDetail] = useState('');
  const [notes, setNotes] = useState('');

  // Landmark / Patokan Rumah State
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string>(
    savedLandmarks[0]?.id || 'lm-1'
  );
  const [isAwayFromHome, setIsAwayFromHome] = useState<boolean>(false);
  const [saveNewLandmark, setSaveNewLandmark] = useState<boolean>(true);
  const [formError, setFormError] = useState<string | null>(null);

  // New Landmark Modal / Inline Form
  const [isAddingLandmark, setIsAddingLandmark] = useState<boolean>(false);
  const [newLmLabel, setNewLmLabel] = useState<string>('');
  const [newLmDusun, setNewLmDusun] = useState<string>('Dusun Krajan, RT 01 / RW 01');
  const [newLmDetail, setNewLmDetail] = useState<string>('');
  const [newLmRecipientNote, setNewLmRecipientNote] = useState<string>('');

  // Sync with selected landmark when changed
  useEffect(() => {
    if (selectedLandmarkId && selectedLandmarkId !== 'custom') {
      const lm = savedLandmarks.find((l) => l.id === selectedLandmarkId);
      if (lm) {
        setBuyerDusun(lm.dusun);
        setBuyerAddressDetail(lm.detail);
      }
    }
  }, [selectedLandmarkId, savedLandmarks]);

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
    setFormError(null);

    if (!buyerName.trim() || !buyerPhone.trim() || !buyerDusun.trim()) {
      setFormError('Mohon lengkapi nama penerima, nomor HP/WhatsApp, dan wilayah dusun pengantaran.');
      return;
    }

    if (!buyerAddressDetail.trim()) {
      setFormError('Mohon isi patokan rumah atau alamat pengantaran agar kurir desa mudah menemukan lokasi Anda.');
      return;
    }

    const selectedLandmark = savedLandmarks.find((l) => l.id === selectedLandmarkId);

    // Save as new landmark if requested
    if (saveNewLandmark && (selectedLandmarkId === 'custom' || !selectedLandmark)) {
      addSavedLandmark({
        label: isAwayFromHome ? 'Titip Rumah Lain' : 'Patokan Rumah',
        dusun: buyerDusun,
        detail: buyerAddressDetail,
        recipientNote: isAwayFromHome ? 'Sedang tidak di rumah (titip paket)' : undefined,
      });
    }

    const fullAddress = `${buyerDusun}${buyerAddressDetail ? ` - ${buyerAddressDetail}` : ''}`;
    const landmarkLabel = selectedLandmark ? selectedLandmark.label : (isAwayFromHome ? 'Titip Rumah Lain' : 'Patokan Rumah');

    const newOrders = createOrder({
      buyerAddress: fullAddress,
      buyerDusun,
      buyerPhone,
      deliveryMethod,
      paymentMethod,
      paymentProofUrl: compressionResult?.dataUrl,
      notes,
      patokanRumah: buyerAddressDetail,
      landmarkLabel,
    });

    setCreatedOrders(newOrders);
  };

  const handleFinish = (orderId?: string) => {
    setIsCheckoutModalOpen(false);
    if (orderId) {
      setSelectedOrderIdForTracking(orderId);
    } else if (createdOrders && createdOrders.length > 0) {
      setSelectedOrderIdForTracking(createdOrders[0].id);
    }
    setCreatedOrders(null);
    setActiveTab('pesanan');
  };

  // Quick helper to add a brand new landmark
  const handleSaveNewLandmarkModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLmLabel.trim() || !newLmDetail.trim()) return;

    addSavedLandmark({
      label: newLmLabel.trim(),
      dusun: newLmDusun,
      detail: newLmDetail.trim(),
      recipientNote: newLmRecipientNote.trim() || undefined,
    });

    // Automatically select the new landmark
    setBuyerDusun(newLmDusun);
    setBuyerAddressDetail(
      newLmRecipientNote.trim()
        ? `(Titip: ${newLmRecipientNote.trim()}) ${newLmDetail.trim()}`
        : newLmDetail.trim()
    );
    setSelectedLandmarkId('custom');
    setIsAddingLandmark(false);
    setNewLmLabel('');
    setNewLmDetail('');
    setNewLmRecipientNote('');
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

              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                  <span className="text-xs font-bold text-neutral-800">
                    Ringkasan Nota Pesanan ({createdOrders.length} Toko)
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <BellRing className="w-3 h-3" /> Notifikasi HP Terkirim
                  </span>
                </div>

                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2.5 text-[11px] text-emerald-900 leading-relaxed">
                  📲 <strong>Notifikasi Pesanan:</strong> HP penjual telah menerima peringatan getar & notifikasi pesanan baru. Klik tombol di bawah untuk meneruskan rincian lengkap pesanan langsung ke WhatsApp penjual!
                </div>

                {createdOrders.map((ord) => (
                  <div key={ord.id} className="p-3 bg-white rounded-xl border border-neutral-200 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-neutral-900 text-xs flex items-center gap-1">
                          <Store className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{ord.sellerName}</span>
                        </div>
                        {/* Tag Kategori berada di bawah nama lapak */}
                        <div className="mt-1">
                          <span className="inline-block bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
                            {ord.items[0]?.categoryName || 'Makanan & Olahan'}
                          </span>
                        </div>
                      </div>
                      <span className="text-emerald-800 font-extrabold text-xs">{formatRupiah(ord.total)}</span>
                    </div>

                    <div className="text-[11px] text-neutral-500 flex justify-between pt-1 border-t border-neutral-100">
                      <span>Invoice: <strong>{ord.invoiceNumber}</strong></span>
                      <span className="capitalize font-semibold text-amber-700">Status: {ord.status}</span>
                    </div>

                    <div className="text-[11px] text-neutral-600 bg-neutral-50 p-2 rounded-lg">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{it.quantity}x {it.productName}</span>
                          <span>{formatRupiah(it.price * it.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tombol Kirim Rincian Pesanan ke WhatsApp Penjual */}
                    <button
                      type="button"
                      id={`wa-seller-btn-${ord.id}`}
                      onClick={() => sendOrderWhatsAppToSeller(ord)}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Kirim Rincian Pesanan ke WhatsApp {ord.sellerName}</span>
                    </button>
                  </div>
                ))}

                <div className="pt-2 flex justify-between font-extrabold text-sm text-neutral-900 border-t border-neutral-200">
                  <span>Total Pembayaran:</span>
                  <span className="text-emerald-900">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  id="view-orders-btn"
                  onClick={() => handleFinish(createdOrders?.[0]?.id)}
                  className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Lihat Status Pesanan Saya</span>
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleConfirmOrder} className="space-y-4">
              {/* Data Penerima & Alamat Lengkap */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-neutral-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-emerald-700" />
                    <span>1. Alamat Pengantaran & Patokan Rumah</span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Bisa Titip Rumah Lain
                  </span>
                </div>

                {/* Form Error Banner */}
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{formError}</span>
                  </div>
                )}

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

                {/* Opsi Sedang Tidak di Rumah & Pilihan Patokan Rumah */}
                <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/90 space-y-3 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Pilih Patokan Rumah Pengantaran:</span>
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Pilih rumah utama Anda, atau pilih opsi titip jika sedang tidak di rumah.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddingLandmark(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-xl border border-emerald-200 transition shrink-0 cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Tambah Patokan Rumah Baru</span>
                    </button>
                  </div>

                  {/* Daftar Pilihan Patokan Rumah Tersimpan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {savedLandmarks.map((lm) => {
                      const isSelected = selectedLandmarkId === lm.id;
                      return (
                        <button
                          key={lm.id}
                          type="button"
                          onClick={() => {
                            setSelectedLandmarkId(lm.id);
                            setBuyerDusun(lm.dusun);
                            setBuyerAddressDetail(lm.detail);
                            if (lm.recipientNote) {
                              setIsAwayFromHome(true);
                            }
                          }}
                          className={`text-left p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/20 shadow-2xs'
                              : 'bg-neutral-50/70 border-neutral-200 hover:bg-neutral-100/70'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-xs text-neutral-900 truncate">
                              {lm.label}
                            </span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-600 line-clamp-2 leading-relaxed">
                            {lm.detail}
                          </p>
                          <div className="text-[10px] text-neutral-400 mt-1 flex items-center justify-between">
                            <span>{lm.dusun.split(',')[0]}</span>
                            {lm.recipientNote && (
                              <span className="text-emerald-700 font-medium">Titip: {lm.recipientNote}</span>
                            )}
                          </div>
                        </button>
                      );
                    })}

                    {/* Opsi Custom / Tulis Patokan Lain */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLandmarkId('custom');
                        setIsAwayFromHome(true);
                      }}
                      className={`text-left p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                        selectedLandmarkId === 'custom'
                          ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/20 shadow-2xs'
                          : 'bg-neutral-50/70 border-neutral-200 hover:bg-neutral-100/70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs text-neutral-900">
                          📝 Tulis Patokan / Rumah Lain
                        </span>
                        {selectedLandmarkId === 'custom' && (
                          <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Isi alamat khusus untuk pesanan kali ini atau simpan sebagai patokan baru.
                      </p>
                      <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                        Kustom alamat & titip
                      </div>
                    </button>
                  </div>

                  {/* Banner Info Sedang Tidak di Rumah */}
                  <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2 text-[11px] text-amber-900">
                    <Home className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong>Sedang tidak berada di rumah?</strong> Anda dapat memilih opsi titip ke rumah tetangga, nenek/saudara, atau kantor balai desa agar kurir tidak bolak-balik.
                    </div>
                  </div>
                </div>

                {/* Dusun & Detail Patokan */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                    Wilayah Dusun & RT/RW Tujuan *
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
                    Detail Patokan Rumah & Petunjuk Pengantaran *
                  </label>
                  <textarea
                    rows={2}
                    id="buyer-address-detail"
                    placeholder="Contoh: Depan mushola Al-Ikhlas, pagar cat hijau, titip di teras Bu RT jika saya sedang ke ladang"
                    value={buyerAddressDetail}
                    onChange={(e) => setBuyerAddressDetail(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-emerald-200 outline-none resize-none"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-1.5 text-[11px] text-neutral-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={saveNewLandmark}
                        onChange={(e) => setSaveNewLandmark(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                      />
                      <span>Simpan patokan rumah ini ke daftar alamat saya</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Daftar Barang & Sisipkan Catatan */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                    2. Barang & Sisipkan Catatan Produk
                  </div>
                  <span className="text-[11px] text-neutral-500 font-medium">
                    {cart.length} macam barang
                  </span>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="bg-white p-2.5 rounded-xl border border-neutral-200 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-10 h-10 rounded-lg object-cover border border-neutral-200"
                          />
                          <div>
                            <div className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                              <Store className="w-3 h-3 text-emerald-600" />
                              <span>{item.product.sellerName}</span>
                            </div>
                            {/* Tag Kategori berada di bawah nama lapak */}
                            <div className="mt-0.5">
                              <span className="inline-block bg-emerald-50 text-emerald-800 text-[9px] font-semibold px-1.5 py-0.2 rounded border border-emerald-200">
                                {item.product.categoryName}
                              </span>
                            </div>
                            <div className="font-bold text-neutral-900 line-clamp-1 mt-0.5">
                              {item.product.name}
                            </div>
                            <div className="text-[10px] text-neutral-500">
                              {item.quantity} {item.product.unit} • {formatRupiah(item.product.price * item.quantity)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-neutral-50 p-1.5 px-2 rounded-lg border border-neutral-200 focus-within:ring-2 focus-within:ring-emerald-200 focus-within:bg-white">
                        <span className="text-[10px] font-bold text-emerald-800 shrink-0">Catatan:</span>
                        <input
                          type="text"
                          value={item.catatanProduk || item.notes || ''}
                          onChange={(e) => updateCartItemNote(item.product.id, e.target.value)}
                          placeholder="Sisipkan catatan untuk barang ini (cth: tidak pedas, iris tipis)..."
                          className="w-full text-[11px] bg-transparent outline-none text-neutral-800 placeholder:text-neutral-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metode Pengiriman */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-2.5">
                <div className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                  3. Opsi Pengantaran
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
                  4. Metode Pembayaran
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

      {/* Modal Tambah Patokan Rumah Baru / Opsi Titip Rumah */}
      {isAddingLandmark && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveNewLandmarkModal}
            className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-neutral-200 space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-neutral-900">
                    Tambah Patokan Rumah / Titip
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Simpan patokan rumah lain jika sedang tidak di rumah
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingLandmark(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                  Nama Label Patokan *
                </label>
                <input
                  type="text"
                  required
                  value={newLmLabel}
                  onChange={(e) => setNewLmLabel(e.target.value)}
                  placeholder="Contoh: Titip Rumah Nenek, Rumah Paman Anton, Toko Bu RT"
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                  Wilayah Dusun & RT/RW *
                </label>
                <select
                  value={newLmDusun}
                  onChange={(e) => setNewLmDusun(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-emerald-200 outline-none"
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
                <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                  Detail Ciri-Ciri Patokan Jalan & Rumah *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newLmDetail}
                  onChange={(e) => setNewLmDetail(e.target.value)}
                  placeholder="Contoh: Sebelah barat pos kamling RT 01, pagar bambu kuning, ada pohon mangga di depan"
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-emerald-200 outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                  Catatan Penerima / Instruksi Titip (Opsional)
                </label>
                <input
                  type="text"
                  value={newLmRecipientNote}
                  onChange={(e) => setNewLmRecipientNote(e.target.value)}
                  placeholder="Contoh: Titip ke Bude Siti, atau taruh di rak sepatu teras"
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingLandmark(false)}
                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl border border-neutral-200 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan & Gunakan</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
