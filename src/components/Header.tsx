import React from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  Store,
  ShieldCheck,
  Zap,
  Globe,
  MapPin,
  X,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    currentUser,
    firebaseUser,
    activeTab,
    setActiveTab,
    cart,
    favorites,
    searchQuery,
    setSearchQuery,
    setIsCartOpen,
    setIsAuthModalOpen,
    setIsSeoModalOpen,
    dataSaverMode,
    setDataSaverMode,
    settings,
    switchRole,
  } = useApp();

  const cartCount = cart.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      {/* Top Village Notice Bar */}
      <div id="village-top-bar" className="bg-emerald-800 text-white text-xs px-3 py-1.5 font-medium flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[11px] font-bold tracking-wide shrink-0">
            {settings.bumdesName.split(' ')[0]}
          </span>
          <span className="truncate">
            📢 Layanan Pasar Digital Resmi {settings.villageName} • Ongkir flat se-desa hanya Rp 3.000
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-2">
          {/* Data Saver Toggle */}
          <button
            id="data-saver-toggle-btn"
            onClick={() => setDataSaverMode(!dataSaverMode)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition text-[11px] ${
              dataSaverMode ? 'bg-amber-400 text-neutral-900 font-bold' : 'bg-emerald-700/70 hover:bg-emerald-700 text-emerald-100'
            }`}
            title="Mode Hemat Data untuk HP ramah kuota & koneksi lambat"
          >
            <Zap className="w-3 h-3" />
            <span className="hidden sm:inline">Hemat Kuota</span>
            <span>{dataSaverMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* SEO & Sitemap quick modal */}
          <button
            id="seo-sitemap-btn"
            onClick={() => setIsSeoModalOpen(true)}
            className="flex items-center gap-1 text-emerald-200 hover:text-white transition text-[11px]"
            title="SEO, Schema JSON-LD & Sitemap"
          >
            <Globe className="w-3 h-3" />
            <span className="hidden md:inline">SEO & Info</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand Logo & Village Tag */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            id="logo-brand-btn"
            onClick={() => {
              setActiveTab('beranda');
            }}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-black text-xl shadow-sm group-hover:scale-105 transition-transform">
              🌿
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl text-neutral-900 tracking-tight leading-none">
                  Pasar<span className="text-emerald-700">Desa</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                  Mandiri
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-medium flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-600 inline" />
                {settings.villageName}
              </p>
            </div>
          </button>
        </div>

        {/* Quick Search Bar */}
        <div className="flex-1 max-w-xl mx-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
            <input
              id="search-input-header"
              type="text"
              placeholder="Cari sembako, beras panen, sayur, keripik..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-100/90 hover:bg-neutral-100 focus:bg-white text-sm pl-9 pr-8 py-2 rounded-xl border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
            />
            {searchQuery && (
              <button
                id="clear-search-btn"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Action Controls & Role Portal Badges */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Role Switcher Pills */}
          <div className="hidden lg:flex items-center bg-neutral-100 p-1 rounded-xl text-xs font-semibold">
            <button
              id="switch-buyer-btn"
              onClick={() => switchRole('buyer')}
              className={`px-2.5 py-1 rounded-lg transition ${
                currentUser?.role === 'buyer' && activeTab !== 'admin' && activeTab !== 'seller'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Pembeli
            </button>
            <button
              id="switch-seller-btn"
              onClick={() => switchRole('seller')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                activeTab === 'seller' || currentUser?.role === 'seller'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Store className="w-3 h-3" />
              Mode Toko
            </button>
            <button
              id="switch-admin-btn"
              onClick={() => switchRole('admin')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                activeTab === 'admin' || currentUser?.role === 'admin'
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Admin Desa
            </button>
          </div>

          {/* Favorites Wishlist */}
          <button
            id="wishlist-btn"
            onClick={() => setActiveTab('beranda')}
            className="hidden sm:flex relative p-2 text-neutral-600 hover:text-emerald-700 hover:bg-neutral-100 rounded-xl transition"
            title="Produk Favorit"
          >
            <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Cart Trigger */}
          <button
            id="cart-trigger-btn"
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-neutral-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition"
            title="Keranjang Belanja"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white text-[10px] font-bold min-w-4.5 h-4.5 px-1 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Account / Profile */}
          {currentUser ? (
            <button
              id="user-profile-header-btn"
              onClick={() => setActiveTab('profil')}
              className="flex items-center gap-2 p-1 pl-2 hover:bg-neutral-100 rounded-xl transition border border-neutral-200"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-neutral-800 leading-tight truncate max-w-28">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold capitalize">
                  {currentUser.role === 'buyer' ? 'Warga/Pembeli' : currentUser.role === 'seller' ? 'Penjual UMKM' : 'Admin Desa'}
                </div>
              </div>
              <div className="relative">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover border border-emerald-500/30"
                />
                {firebaseUser && (
                  <span
                    title="Terhubung Firebase"
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"
                  />
                )}
              </div>
            </button>
          ) : (
            <button
              id="login-register-header-btn"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              <UserCheck className="w-4 h-4" />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
