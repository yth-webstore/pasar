import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  Store,
  ShieldCheck,
  Zap,
  MapPin,
  X,
  UserCheck,
  Filter,
  ChevronDown,
  PlusCircle,
  History,
  Bell,
  Volume2,
  VolumeX,
  Clock,
  Trash2,
  CheckCheck,
  Bike,
  LogIn,
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
    searchHistory,
    addSearchHistory,
    removeSearchHistory,
    clearSearchHistory,
    categories,
    selectedCategory,
    setSelectedCategory,
    setIsCartOpen,
    setIsAuthModalOpen,
    setIsCreateStoreModalOpen,
    dataSaverMode,
    setDataSaverMode,
    settings,
    notifications,
    unreadNotificationCount,
    markAllNotificationsRead,
    isSoundEnabled,
    setIsSoundEnabled,
    playTestChime,
  } = useApp();

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [showHistory, setShowHistory] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Sync internal search input when searchQuery changes externally (e.g. reset filter)
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Click outside listener for search history dropdown and notification panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowHistory(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotificationPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cartCount = cart.reduce((acc, it) => acc + it.quantity, 0);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(!categoryId || categoryId === 'all' ? null : categoryId);
    if (activeTab !== 'kategori' && activeTab !== 'beranda') {
      setActiveTab('kategori');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (query) {
      addSearchHistory(query);
    }
    setSearchQuery(query);
    setShowHistory(false);
    setActiveTab('kategori');
  };

  const handleSelectHistoryItem = (term: string) => {
    setSearchInput(term);
    setSearchQuery(term);
    addSearchHistory(term);
    setShowHistory(false);
    setActiveTab('kategori');
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
  };

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
          {/* Sound Notification Quick Indicator */}
          <button
            id="header-sound-quick-btn"
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition text-[11px] ${
              isSoundEnabled ? 'bg-emerald-700 hover:bg-emerald-600 text-emerald-100' : 'bg-red-800 text-neutral-200'
            }`}
            title={isSoundEnabled ? 'Nada Notifikasi Aktif' : 'Nada Notifikasi Senyap'}
          >
            {isSoundEnabled ? <Volume2 className="w-3 h-3 text-emerald-300" /> : <VolumeX className="w-3 h-3 text-red-300" />}
            <span className="hidden md:inline">Nada: {isSoundEnabled ? 'ON' : 'OFF'}</span>
          </button>

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
        </div>
      </div>

      {/* Main Navbar Row 1: Brand & Top Actions */}
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-between gap-3">
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

        {/* Action Controls & Role Portal Badges */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Universal Buka Lapak Button */}
          {currentUser?.role === 'seller' || currentUser?.storeId ? (
            <button
              id="header-manage-store-btn"
              onClick={() => setActiveTab('toko')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs shadow-xs transition"
              title="Kelola Produk & Pesanan Lapak Anda"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Lapak Saya</span>
            </button>
          ) : (
            <button
              id="header-open-store-btn"
              onClick={() => {
                if (!currentUser) {
                  setIsAuthModalOpen(true);
                } else {
                  setIsCreateStoreModalOpen(true);
                }
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition"
              title="Buka Lapak Gratis & Jual Produk UMKM Desa"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Buka Lapak</span>
            </button>
          )}

          {/* Courier Dashboard shortcut if user is courier or admin */}
          {(currentUser?.role === 'courier' || currentUser?.role === 'admin') && (
            <button
              id="header-courier-btn"
              onClick={() => setActiveTab('courier')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition shadow-2xs ${
                activeTab === 'courier'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200'
              }`}
              title="Panel Kurir: Ambil & Antar Paket"
            >
              <Bike className="w-3.5 h-3.5 text-blue-600" />
              <span>Antaran Kurir</span>
            </button>
          )}

          {/* Admin Dashboard shortcut if user is admin */}
          {currentUser?.role === 'admin' && (
            <button
              id="header-admin-btn"
              onClick={() => setActiveTab('admin')}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition shadow-2xs ${
                activeTab === 'admin'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
              }`}
              title="Buka Panel Kendali Admin Desa"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Admin Desa</span>
            </button>
          )}

          {/* Notification Center with Sound controls */}
          <div className="relative" ref={notificationRef}>
            <button
              id="header-notifications-btn"
              onClick={() => setShowNotificationPanel(!showNotificationPanel)}
              className="relative p-2 text-neutral-700 hover:text-emerald-700 hover:bg-neutral-100 rounded-xl transition"
              title="Pemberitahuan & Nada Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotificationPanel && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-neutral-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-neutral-900">Notifikasi Pesanan & Transaksi</span>
                  </div>
                  {unreadNotificationCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3" />
                      Tandai Dibaca
                    </button>
                  )}
                </div>

                {/* Sound settings & audio chimes */}
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2.5 mb-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {isSoundEnabled ? <Volume2 className="w-4 h-4 text-emerald-700" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
                      <span className="text-xs font-bold text-neutral-800">Nada Dering Pesanan</span>
                    </div>
                    <button
                      onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition ${
                        isSoundEnabled ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {isSoundEnabled ? 'Aktif' : 'Mati'}
                    </button>
                  </div>
                  <div className="text-[10px] text-neutral-600 leading-tight">
                    Bunyi otomatis saat checkout berhasil, kurir bergerak, dan pesanan selesai diterima.
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-neutral-500 font-medium">Tes Nada:</span>
                    <button
                      onClick={() => playTestChime('checkout')}
                      className="px-2 py-0.5 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded text-[10px] font-semibold transition"
                    >
                      🔔 Checkout
                    </button>
                    <button
                      onClick={() => playTestChime('completed')}
                      className="px-2 py-0.5 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded text-[10px] font-semibold transition"
                    >
                      🎉 Selesai
                    </button>
                  </div>
                </div>

                {/* Notification list */}
                <div className="max-h-60 overflow-y-auto space-y-1.5">
                  {notifications.length === 0 ? (
                    <div className="text-center py-4 text-xs text-neutral-500">
                      Belum ada notifikasi transaksi terbaru.
                    </div>
                  ) : (
                    notifications.slice(0, 8).map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-2 rounded-xl text-xs transition border ${
                          notif.read ? 'bg-neutral-50/70 border-neutral-100' : 'bg-emerald-50/50 border-emerald-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-neutral-800 text-[11px]">
                          <span>{notif.title}</span>
                          <span className="text-[10px] text-neutral-400 font-normal">{notif.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-neutral-600 mt-0.5 leading-snug">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
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
                    title="Akun Terverifikasi"
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"
                  />
                )}
              </div>
            </button>
          ) : (
            <button
              id="login-header-btn"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-sm transition shrink-0 cursor-pointer"
              title="Login ke Akun Pasar Desa"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Combined Search & Filter Bar - Hidden on Dashboards (Kurir, Penjual, Pembeli/Pesanan, Profil, Admin) */}
      {activeTab !== 'courier' &&
        (activeTab as string) !== 'kurir' &&
        activeTab !== 'toko' &&
        activeTab !== 'seller' &&
        activeTab !== 'pesanan' &&
        activeTab !== 'profil' &&
        activeTab !== 'admin' && (
        <div id="header-search-category-bar" className="bg-neutral-50/80 border-t border-neutral-200/80 px-3 sm:px-4 py-2 sm:py-2.5">
          <div className="max-w-7xl mx-auto relative" ref={searchContainerRef}>
            <form
              id="header-search-form"
              onSubmit={handleSearchSubmit}
              className="flex items-center w-full bg-white rounded-xl border border-neutral-300 hover:border-neutral-400 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100 shadow-2xs overflow-hidden transition"
            >
            {/* Integrated Filter Dropdown */}
            <div
              className="relative flex items-center bg-neutral-100/80 hover:bg-neutral-200/70 border-r border-neutral-200 shrink-0 transition self-stretch"
              title="Filter Kategori"
            >
              <div className="px-2.5 sm:px-3 flex items-center gap-1.5 text-neutral-700 pointer-events-none">
                <Filter className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                {selectedCategory && (
                  <span className="text-xs font-bold text-emerald-800 max-w-[80px] sm:max-w-[130px] truncate">
                    {categories.find((c) => c.id === selectedCategory)?.name}
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
              </div>
              <select
                id="header-category-filter"
                aria-label="Filter Kategori"
                value={selectedCategory || ''}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Pilih Kategori"
              >
                <option value="">- Kategori -</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input Bar (clean inline icon, no separate submit button) */}
            <div className="relative flex-1 flex items-center min-w-0 px-3">
              <Search className="w-4 h-4 text-neutral-400 shrink-0 mr-2 pointer-events-none" />
              <input
                id="search-input-header"
                type="text"
                placeholder="Cari sembako, sayur panen, ikan segar, keripik..."
                value={searchInput}
                onFocus={() => setShowHistory(true)}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                className="w-full bg-transparent text-xs sm:text-sm py-2 outline-none placeholder:text-neutral-400 text-neutral-800"
              />
              {searchInput && (
                <button
                  type="button"
                  id="clear-search-btn"
                  onClick={handleClearSearch}
                  className="text-neutral-400 hover:text-neutral-600 p-1 transition shrink-0"
                  title="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* Recent Search History Dropdown */}
          {showHistory && searchHistory.length > 0 && (
            <div
              id="recent-search-history-dropdown"
              className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-neutral-200 p-3 z-50 animate-in fade-in duration-150 max-w-xl mx-auto"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-neutral-700">
                  <History className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Riwayat Pencarian Terakhir</span>
                </div>
                <button
                  type="button"
                  onClick={clearSearchHistory}
                  className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-1 font-medium transition"
                  title="Hapus semua riwayat pencarian"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus Semua</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                {searchHistory.map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center gap-1.5 bg-neutral-100 hover:bg-emerald-50 text-neutral-800 hover:text-emerald-900 border border-neutral-200 hover:border-emerald-300 rounded-xl px-2.5 py-1 text-xs transition group"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectHistoryItem(item)}
                      className="flex items-center gap-1.5 text-left font-medium"
                    >
                      <Clock className="w-3 h-3 text-neutral-400 group-hover:text-emerald-600" />
                      <span>{item}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSearchHistory(item);
                      }}
                      className="text-neutral-400 hover:text-red-600 p-0.5 rounded-full hover:bg-neutral-200 transition"
                      title={`Hapus "${item}" dari riwayat`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </header>
  );
};
