import React from 'react';
import {
  User,
  Store,
  ShieldCheck,
  Phone,
  MapPin,
  Package,
  Heart,
  Globe,
  Zap,
  HelpCircle,
  LogOut,
  ChevronRight,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    firebaseUser,
    logout,
    switchRole,
    setIsAuthModalOpen,
    setActiveTab,
    favorites,
    orders,
    dataSaverMode,
    setDataSaverMode,
    setIsSeoModalOpen,
    settings,
  } = useApp();

  const userOrders = orders.filter((o) => {
    if (currentUser?.role === 'seller') return o.sellerId === currentUser.id;
    return o.buyerId === currentUser?.id;
  });

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
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}
              >
                {currentUser?.role === 'admin'
                  ? 'Admin BUMDes'
                  : currentUser?.role === 'seller'
                  ? 'Penjual UMKM'
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

            {/* Firebase Auth Live Tag */}
            <div className="mt-2 flex items-center justify-center sm:justify-start">
              {firebaseUser ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Firebase Auth Aktif ({firebaseUser.email || currentUser?.phone})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                  Mode Demo Lokal • Hubungkan Akun Firebase
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            {firebaseUser ? 'Ganti Akun' : 'Masuk / Daftar Firebase'}
          </button>
        </div>

        {/* Role Switcher Pills (User Request Requirement) */}
        <div className="pt-3 border-t border-neutral-100">
          <div className="text-[11px] font-bold text-neutral-500 mb-2">
            Pindah Peran Aplikasi Desa (Simulasi Akun):
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => switchRole('buyer')}
              className={`p-2.5 rounded-2xl font-bold flex flex-col items-center gap-1 transition ${
                currentUser?.role === 'buyer'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Warga Pembeli</span>
            </button>

            <button
              onClick={() => switchRole('seller')}
              className={`p-2.5 rounded-2xl font-bold flex flex-col items-center gap-1 transition ${
                currentUser?.role === 'seller'
                  ? 'bg-amber-500 text-neutral-950 shadow-xs font-black'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Penjual UMKM</span>
            </button>

            <button
              onClick={() => switchRole('admin')}
              className={`p-2.5 rounded-2xl font-bold flex flex-col items-center gap-1 transition ${
                currentUser?.role === 'admin'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin BUMDes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role-Specific Action Shortcut */}
      {currentUser?.role === 'seller' && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 rounded-3xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm sm:text-base">Kelola Toko & Stok Produk</h3>
            <p className="text-xs text-amber-950/80 font-medium">
              Tambah produk kompres WebP, proses pesanan masuk, dan atur promo diskon.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('toko')}
            className="px-4 py-2 bg-neutral-950 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-neutral-800 transition shrink-0"
          >
            Buka Panel Toko
          </button>
        </div>
      )}

      {currentUser?.role === 'admin' && (
        <div className="bg-neutral-900 text-white rounded-3xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm sm:text-base">Panel Kendali Admin Desa & BUMDes</h3>
            <p className="text-xs text-neutral-400 font-medium">
              Kelola berita resmi desa, iklan berbayar warga, dan monitoring transaksi.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('admin')}
            className="px-4 py-2 bg-emerald-500 text-neutral-950 rounded-xl text-xs font-black shadow-xs hover:bg-emerald-400 transition shrink-0"
          >
            Buka Admin Web
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

        {/* SEO & Structured Data Inspector */}
        <button
          onClick={() => setIsSeoModalOpen(true)}
          className="w-full flex items-center justify-between py-2 border-b border-neutral-100 text-left hover:bg-neutral-50 rounded-xl px-1 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-neutral-900">SEO & Structured Data (Schema.org)</div>
              <div className="text-[11px] text-neutral-500">
                Lihat metadata Google, Rich Snippets, dan Sitemap XML
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
        </button>

        {/* BUMDes Help Contact */}
        <div className="pt-2 flex items-center justify-between text-xs border-b border-neutral-100 pb-2">
          <div>
            <div className="font-bold text-neutral-800">Bantuan BUMDes & Balai Desa</div>
            <div className="text-[11px] text-neutral-500">Hubungi petugas lapangan jika butuh bantuan</div>
          </div>
          <button
            onClick={() => {
              window.open(
                `https://wa.me/${settings.emergencyContact.replace(/[^0-9]/g, '')}?text=Halo%20Admin%20BUMDes%20Sukamaju`,
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
                  Akhiri sesi login Firebase pada perangkat ini
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
