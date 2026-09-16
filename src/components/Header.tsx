import React, { useState, useEffect } from 'react';
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
    categories,
    selectedCategory,
    setSelectedCategory,
    setIsCartOpen,
    setIsAuthModalOpen,
    setIsCreateStoreModalOpen,
    dataSaverMode,
    setDataSaverMode,
    settings,
  } = useApp();

  const [searchInput, setSearchInput] = useState(searchQuery);

  // Sync internal search input when searchQuery changes externally (e.g. reset filter)
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const cartCount = cart.reduce((acc, it) => acc + it.quantity, 0);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(!categoryId || categoryId === 'all' ? null : categoryId);
    if (activeTab !== 'kategori' && activeTab !== 'beranda') {
      setActiveTab('kategori');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
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
          {/* Universal Buka Lapak Button ("setiap pengguna dapat membuat lapak") */}
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

      {/* Row 2: Combined Search & Filter Bar with Functional Search Button */}
      <div id="header-search-category-bar" className="bg-neutral-50/80 border-t border-neutral-200/80 px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="max-w-7xl mx-auto">
          <form
            id="header-search-form"
            onSubmit={handleSearchSubmit}
            className="flex items-center w-full bg-white rounded-xl border border-neutral-300 hover:border-neutral-400 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100 shadow-2xs overflow-hidden transition"
          >
            {/* Integrated Filter Dropdown (Merged inside the search bar, no text "semua") */}
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

            {/* Search Input Bar */}
            <div className="relative flex-1 flex items-center min-w-0">
              <input
                id="search-input-header"
                type="text"
                placeholder="Cari sembako, sayur panen, ikan segar, keripik..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                className="w-full bg-transparent text-xs sm:text-sm px-3 py-2 outline-none placeholder:text-neutral-400 text-neutral-800"
              />
              {searchInput && (
                <button
                  type="button"
                  id="clear-search-btn"
                  onClick={handleClearSearch}
                  className="text-neutral-400 hover:text-neutral-600 p-1 mr-1 transition shrink-0"
                  title="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Functional Search Submit Button */}
            <button
              type="submit"
              id="submit-search-btn"
              className="bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white px-3.5 sm:px-4 py-2 self-stretch flex items-center justify-center gap-1.5 font-bold text-xs transition shrink-0 cursor-pointer"
              title="Cari Produk"
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Cari</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
};
