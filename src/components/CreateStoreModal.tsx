import React, { useState } from 'react';
import {
  Store,
  X,
  MapPin,
  Phone,
  CreditCard,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Sparkles,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CreateStoreModal: React.FC = () => {
  const {
    currentUser,
    isCreateStoreModalOpen,
    setIsCreateStoreModalOpen,
    createStore,
    setIsAuthModalOpen,
  } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dusun, setDusun] = useState(currentUser?.dusun || 'Dusun Krajan');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [whatsapp, setWhatsapp] = useState(currentUser?.phone || '');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState(currentUser?.name || '');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isCreateStoreModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentUser) {
      setIsCreateStoreModalOpen(false);
      setIsAuthModalOpen(true);
      return;
    }

    if (!name.trim()) {
      setErrorMessage('Nama toko / lapak wajib diisi.');
      return;
    }
    if (!dusun.trim()) {
      setErrorMessage('Wilayah dusun wajib diisi.');
      return;
    }
    if (!whatsapp.trim()) {
      setErrorMessage('Nomor WhatsApp aktif wajib diisi.');
      return;
    }

    try {
      setIsLoading(true);
      await createStore({
        name: name.trim(),
        description: description.trim() || 'Lapak resmi UMKM warga desa',
        dusun: dusun.trim(),
        address: address.trim() || dusun.trim(),
        whatsapp: whatsapp.trim(),
        logoUrl: logoUrl.trim() || undefined,
        bannerUrl: bannerUrl.trim() || undefined,
        bankName: bankName.trim() || undefined,
        bankAccountNumber: bankAccountNumber.trim() || undefined,
        bankAccountHolder: bankAccountHolder.trim() || undefined,
      });
      setIsCreateStoreModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membuat lapak. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="create-store-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={() => setIsCreateStoreModalOpen(false)}
    >
      <div
        id="create-store-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-gradient-to-r from-emerald-800 to-emerald-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Store className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-extrabold leading-tight">Buka Lapak Pasar Desa</h2>
              <p className="text-[11px] text-emerald-200/90 font-medium">
                Mulai berjualan produk lokal, hasil tani, & olahan warga
              </p>
            </div>
          </div>
          <button
            id="close-create-store-modal-btn"
            onClick={() => setIsCreateStoreModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              <strong>Gratis & Terbuka untuk Seluruh Warga!</strong> Setelah lapak dibuka, Anda dapat langsung menambahkan produk hasil kebun, kuliner rumahan, atau kerajinan tangan ke Pasar Desa.
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Nama Lapak */}
            <div>
              <label className="font-bold text-neutral-700 block mb-1">
                Nama Lapak / Usaha UMKM *
              </label>
              <input
                id="store-name-input"
                type="text"
                required
                placeholder="Contoh: Sayur Segar Bu Siti, Beras Berkah Dusun"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white text-xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
            </div>

            {/* Keterangan */}
            <div>
              <label className="font-bold text-neutral-700 block mb-1">
                Deskripsi Singkat Usaha
              </label>
              <textarea
                id="store-desc-input"
                rows={2}
                placeholder="Contoh: Menjual hasil kebun sendiri tanpa pestisida & menerima pesanan hajatan desa"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white text-xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none resize-none"
              />
            </div>

            {/* Lokasi Dusun & Alamat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Dusun / RT / RW *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="store-dusun-input"
                    type="text"
                    required
                    placeholder="Dusun Krajan RT 02"
                    value={dusun}
                    onChange={(e) => setDusun(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 bg-white text-xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Nomor WhatsApp Penjual *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="store-wa-input"
                    type="tel"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 bg-white text-xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Alamat Lengkap */}
            <div>
              <label className="font-bold text-neutral-700 block mb-1">
                Alamat Lengkap Toko / Rumah
              </label>
              <input
                id="store-address-input"
                type="text"
                placeholder="Contoh: Jl. Balai Desa No. 12, Samping Masjid Al-Huda"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white text-xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
            </div>

            {/* Foto Logo / Lapak */}
            <div>
              <label className="font-bold text-neutral-700 block mb-1">
                Foto Profil Lapak <span className="text-neutral-400 font-normal">(opsional URL)</span>
              </label>
              <div className="relative">
                <ImageIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="store-logo-input"
                  type="url"
                  placeholder="https://images.unsplash.com/... atau kosongkan untuk avatar otomatis"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 bg-white text-xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
                />
              </div>
            </div>

            {/* Rekening Pembayaran */}
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2.5">
              <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>Rekening Bank / E-Wallet Pembayaran (Opsional)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 block mb-0.5">Nama Bank</label>
                  <input
                    type="text"
                    placeholder="BRI / BCA / DANA"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full p-2 rounded-xl border border-neutral-300 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 block mb-0.5">No. Rekening</label>
                  <input
                    type="text"
                    placeholder="1234-xxxx-xxxx"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    className="w-full p-2 rounded-xl border border-neutral-300 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 block mb-0.5">Atas Nama</label>
                  <input
                    type="text"
                    placeholder="Nama Pemilik"
                    value={bankAccountHolder}
                    onChange={(e) => setBankAccountHolder(e.target.value)}
                    className="w-full p-2 rounded-xl border border-neutral-300 bg-white text-xs"
                  />
                </div>
              </div>
            </div>

            <button
              id="submit-create-store-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Membuka Lapak di Desa...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Buka Lapak Sekarang & Mulai Jualan</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
