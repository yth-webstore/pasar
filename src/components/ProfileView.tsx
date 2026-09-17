import React from 'react';
import {
  User,
  Store,
  ShieldCheck,
  Phone,
  MapPin,
  Package,
  Heart,
  Zap,
  HelpCircle,
  LogOut,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Bike,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  LogIn,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    firebaseUser,
    logout,
    setIsAuthModalOpen,
    setIsCreateStoreModalOpen,
    setIsCourierModalOpen,
    setActiveTab,
    favorites,
    orders,
    dataSaverMode,
    setDataSaverMode,
    settings,
  } = useApp();

  const userOrders = orders.filter((o) => {
    if (currentUser?.role === 'seller') return o.sellerId === currentUser.id;
    return o.buyerId === currentUser?.id;
  });

  if (!currentUser) {
    return (
      <div id="profile-logged-out-container" className="max-w-md mx-auto py-12 px-4 text-center space-y-5 animate-in fade-in duration-200">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-800 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
          <User className="w-10 h-10" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-neutral-900">Anda Sedang Keluar dari Akun</h2>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
            Silakan masuk atau daftar akun warga untuk mengelola lapak UMKM desa, mendaftar kurir antar desa, dan memantau rincian status pesanan belanja Anda.
          </p>
        </div>
        <button
          id="profile-login-btn"
          onClick={() => setIsAuthModalOpen(true)}
          className="w-full py-3 px-5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogIn className="w-5 h-5" />
          <span>Login</span>
        </button>
      </div>
    );
  }

  return (
    <div id="profile-view-container" className="max-w-3xl mx-auto space-y-5 pb-24">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <img
            src={
              currentUser?.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
            }
            alt={currentUser?.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-600/30 p-0.5 bg-neutral-100"
          />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl font-black text-neutral-900">{currentUser?.name}</h1>
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  currentUser?.role === 'admin'
                    ? 'bg-neutral-900 text-white'
                    : currentUser?.role === 'seller'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : currentUser?.role === 'courier'
                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}
              >
                {currentUser?.role === 'admin'
                  ? 'Admin BUMDes'
                  : currentUser?.role === 'seller'
                  ? 'Penjual UMKM'
                  : currentUser?.role === 'courier'
                  ? 'Kurir Desa Resmi'
                  : 'Warga Pembeli'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-neutral-500 mt-1.5 font-medium">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                {currentUser?.phone}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                {currentUser?.dusun}
              </span>
            </div>

            {currentUser?.shopName && (
              <div className="mt-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl inline-block">
                🏪 Toko Terdaftar: {currentUser.shopName}
              </div>
            )}

            {/* User Session Tag */}
            <div className="mt-2 flex items-center justify-center sm:justify-start">
              {firebaseUser ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Akun Terverifikasi ({firebaseUser.email || currentUser?.phone})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                  Akun Warga Lokal
                </span>
              )}
            </div>
          </div>

          <button
            id="profile-header-logout-btn"
            onClick={logout}
            className="px-3.5 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Keluar dari Akun"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </div>

      {/* Role Action 1: Toko / Lapak Desa ("pengguna dapat membuat lapak") */}
      {!currentUser?.storeId && currentUser?.role !== 'seller' ? (
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-700/50">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <Store className="w-4 h-4 text-emerald-400" />
              <span>Peluang Usaha Warga Desa</span>
            </div>
            <h3 className="font-black text-base text-white">Buka Lapak Dagang Sendiri (Gratis)</h3>
            <p className="text-xs text-emerald-200/90 leading-relaxed max-w-xl">
              Setiap warga dapat membuka lapak gratis untuk menjual hasil panen, sembako, kuliner, atau kerajinan tangan langsung ke seluruh warga desa.
            </p>
          </div>
          <button
            id="profile-create-store-btn"
            onClick={() => {
              if (!currentUser) {
                setIsAuthModalOpen(true);
              } else {
                setIsCreateStoreModalOpen(true);
              }
            }}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-neutral-950 rounded-xl text-xs font-black shadow-xs transition shrink-0 self-start sm:self-auto flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buka Lapak Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 mb-0.5">
              <Store className="w-4 h-4 text-amber-950" />
              <span>Lapak UMKM Aktif</span>
            </div>
            <h3 className="font-black text-base">{currentUser.shopName || 'Lapak Dagang Anda'}</h3>
            <p className="text-xs text-amber-950/80 font-medium">
              Tambah produk dagang, pantau pesanan masuk, dan proses penjualan warga.
            </p>
          </div>
          <button
            id="profile-manage-store-btn"
            onClick={() => setActiveTab('toko')}
            className="px-4 py-2 bg-neutral-950 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-neutral-800 transition shrink-0 self-start sm:self-auto"
          >
            Buka Panel Lapak Saya
          </button>
        </div>
      )}

      {/* Role Action 2: Kurir Desa ("pengguna bisa mendaftar jadi kurir setelah membuat akun namun admin yang menentukan") */}
      <div className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-neutral-900">Mitra Kurir Pengantar Desa</h3>
              <p className="text-[11px] text-neutral-500">
                Layanan antar belanja warga antar dusun dengan ongkir flat Rp 3.000
              </p>
            </div>
          </div>

          {/* Courier Status Pill */}
          {currentUser?.role === 'courier' || currentUser?.courierApprovalStatus === 'approved' ? (
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Kurir Resmi
            </span>
          ) : currentUser?.courierApprovalStatus === 'pending' ? (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600 animate-spin" />
              Menunggu Admin
            </span>
          ) : currentUser?.courierApprovalStatus === 'rejected' ? (
            <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-black border border-red-300 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-red-600" />
              Belum Disetujui
            </span>
          ) : null}
        </div>

        {currentUser?.role === 'courier' || currentUser?.courierApprovalStatus === 'approved' ? (
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-blue-950">Status: Mitra Kurir Desa BUMDes Terdaftar</p>
              <p className="text-blue-800 text-[11px] mt-0.5">
                Kendaraan: <span className="font-semibold">{currentUser.vehicleType || 'Sepeda Motor'}</span> • Nomor Plat: <span className="font-semibold">{currentUser.vehiclePlate || '-'}</span>
              </p>
            </div>
            <button
              onClick={() => setActiveTab('courier')}
              className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold transition whitespace-nowrap self-start sm:self-auto text-xs flex items-center gap-1.5"
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Buka Panel Kurir Desa</span>
            </button>
          </div>
        ) : currentUser?.courierApprovalStatus === 'pending' ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-black text-amber-950">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Pendaftaran Kurir Sedang Ditinjau oleh Admin BUMDes</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Data pendaftaran Anda telah tercatat di sistem BUMDes. Admin desa akan memverifikasi identitas, kendaraan, dan nomor WhatsApp Anda sebelum mengaktifkan peran kurir.
            </p>
          </div>
        ) : currentUser?.courierApprovalStatus === 'rejected' ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-red-900">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Pendaftaran Sebelumnya Belum Disetujui</span>
              </div>
              <p className="text-[11px] text-red-800">
                Silakan hubungi admin BUMDes atau ajukan ulang dengan melengkapi data kendaraan dan nomor WhatsApp.
              </p>
            </div>
            <button
              onClick={() => setIsCourierModalOpen(true)}
              className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold transition whitespace-nowrap self-start sm:self-auto"
            >
              Ajukan Ulang
            </button>
          </div>
        ) : (
          <div className="bg-neutral-50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <p className="text-neutral-600 text-[11px] leading-relaxed max-w-lg">
              Ingin mendapatkan penghasilan tambahan mengantar pesanan warga desa? Daftarkan diri Anda sekarang. Admin BUMDes yang akan menentukan dan memverifikasi kelayakan Anda.
            </p>
            <button
              id="profile-apply-courier-btn"
              onClick={() => {
                if (!currentUser) {
                  setIsAuthModalOpen(true);
                } else {
                  setIsCourierModalOpen(true);
                }
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-xs whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5"
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Daftar Jadi Kurir</span>
            </button>
          </div>
        )}
      </div>

      {/* Role Action 3: Admin Desa (Hanya jika role admin resmi) */}
      {currentUser?.role === 'admin' && (
        <div className="bg-neutral-900 text-white rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <h3 className="font-black text-base">Panel Kendali Admin Desa & BUMDes</h3>
            <p className="text-xs text-neutral-400 font-medium">
              Kelola kas desa, persetujuan kurir warga, lapak UMKM, berita resmi, dan monitoring produk.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('admin')}
            className="px-4 py-2 bg-emerald-500 text-neutral-950 rounded-xl text-xs font-black shadow-xs hover:bg-emerald-400 transition shrink-0"
          >
            Buka Panel Admin
          </button>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setActiveTab('pesanan')}
          className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs hover:border-emerald-300 transition text-left flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-neutral-900">{userOrders.length}</div>
              <div className="text-[11px] text-neutral-500 font-medium">Riwayat Pesanan</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
        </button>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs text-left flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-neutral-900">{favorites.length}</div>
              <div className="text-[11px] text-neutral-500 font-medium">Produk Disukai</div>
            </div>
          </div>
        </div>
      </div>

      {/* App Preferences & Tools */}
      <div className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-xs space-y-3">
        <h3 className="font-extrabold text-sm text-neutral-900">Pengaturan Aplikasi & Performa</h3>

        {/* Data Saver Mode Toggle */}
        <div className="flex items-center justify-between py-2 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-neutral-900">Mode Hemat Kuota Internet Desa</div>
              <div className="text-[11px] text-neutral-500">
                Pangkas animasi & optimalkan memori HP kentang
              </div>
            </div>
          </div>
          <button
            onClick={() => setDataSaverMode(!dataSaverMode)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              dataSaverMode ? 'bg-emerald-600' : 'bg-neutral-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform shadow-xs ${
                dataSaverMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* BUMDes Help Contact */}
        <div className="pt-2 flex items-center justify-between text-xs border-b border-neutral-100 pb-2">
          <div>
            <div className="font-bold text-neutral-800">Bantuan BUMDes & Balai Desa</div>
            <div className="text-[11px] text-neutral-500">Hubungi petugas lapangan jika butuh bantuan</div>
          </div>
          <button
            onClick={() => {
              window.open(
                `https://wa.me/${settings.emergencyContact.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo Admin BUMDes ${settings.villageName}`)}`,
                '_blank'
              );
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs hover:bg-emerald-200 transition"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>Chat BUMDes</span>
          </button>
        </div>

        {/* Firebase Logout Action */}
        <div className="pt-2">
          <button
            id="logout-button"
            onClick={logout}
            className="w-full flex items-center justify-between py-2 text-left hover:bg-red-50 text-red-600 rounded-xl px-1 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs">Keluar dari Akun</div>
                <div className="text-[11px] text-red-400">
                  Akhiri sesi akun pada perangkat ini
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
