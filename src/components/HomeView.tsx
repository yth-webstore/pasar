import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Flame,
  Newspaper,
  Megaphone,
  ArrowRight,
  TrendingUp,
  Tag,
  ShieldCheck,
  Wheat,
  Sprout,
  Utensils,
  Coffee,
  Palette,
  Shirt,
  Wrench,
  HelpCircle,
  MessageCircle,
  Heart,
  Search,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BannerSlider } from './BannerSlider';
import { ProductCard } from './ProductCard';
import { formatRupiah } from '../utils/seo';

const CATEGORY_ICON_MAP: { [key: string]: React.ElementType } = {
  Wheat,
  Sprout,
  Utensils,
  Coffee,
  Palette,
  Shirt,
  Wrench,
};

export const HomeView: React.FC = () => {
  const {
    products,
    categories,
    news,
    ads,
    favorites,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    setActiveTab,
    setSelectedNews,
    settings,
  } = useApp();

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return products.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchCategory = p.categoryName.toLowerCase().includes(q);
      const matchSeller = p.sellerName.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      return matchName || matchCategory || matchSeller || matchDesc;
    });
  }, [products, searchQuery]);

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));
  const promoProducts = products.filter((p) => p.isPromo);
  const popularProducts = products.filter((p) => p.isPopular || p.soldCount > 50);
  const latestProducts = [...products].reverse().slice(0, 6);

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    setActiveTab('kategori');
  };

  return (
    <div id="home-view" className="space-y-6 sm:space-y-8 pb-20">
      {/* 0. Dedicated Search Results Section if User Searched */}
      {searchQuery.trim() && (
        <section id="home-search-results-section" className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-4 sm:p-5 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-neutral-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>Hasil Pencarian: "{searchQuery}"</span>
              </h2>
              <p className="text-xs text-neutral-600 mt-0.5">
                Ditemukan {searchResults.length} produk di Pasar Desa
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('kategori')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white border border-emerald-200 px-3 py-1.5 rounded-xl transition shadow-2xs"
              >
                Buka Filter Lengkap →
              </button>
              <button
                onClick={() => setSearchQuery('')}
                className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-white rounded-xl transition"
                title="Hapus pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {searchResults.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-emerald-100">
              <p className="text-sm font-bold text-neutral-700">Produk tidak ditemukan</p>
              <p className="text-xs text-neutral-500 mt-1">
                Coba gunakan kata kunci lain seperti beras, sayur, telur, ikan, madu, atau keripik.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {searchResults.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 1. Hero Banner Slider */}
      <BannerSlider />

      {/* 2. Running Village Announcement Ticker */}
      {news.length > 0 && (
        <div
          id="village-news-ticker"
          onClick={() => setSelectedNews(news[0])}
          className="bg-emerald-900/90 text-white p-3 rounded-2xl flex items-center justify-between gap-3 shadow-xs hover:bg-emerald-900 cursor-pointer transition"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="bg-amber-400 text-neutral-950 text-[10px] font-black px-2 py-0.5 rounded-md uppercase shrink-0">
              Pengumuman
            </span>
            <span className="text-xs font-semibold truncate">
              {news[0].title}
            </span>
          </div>
          <span className="text-[11px] text-emerald-200 hover:text-white shrink-0 font-bold flex items-center gap-1">
            <span>Baca</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      )}

      {/* 3. Kategori Produk & Akses Favorit Langsung */}
      <section id="category-section" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight">
              Kategori Kebutuhan Warga
            </h2>
            <p className="text-xs text-neutral-500">
              Pilihan komoditas tani, sembako, kuliner, dan jasa warga se-desa
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setActiveTab('kategori');
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-emerald-50 transition"
            >
              <span>Lihat Katalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
          {categories.map((cat) => {
            const IconComp = CATEGORY_ICON_MAP[cat.icon] || HelpCircle;
            const count = products.filter((p) => p.categoryId === cat.id).length;

            return (
              <button
                key={cat.id}
                id={`cat-btn-${cat.slug}`}
                onClick={() => handleSelectCategory(cat.id)}
                className="group p-2.5 sm:p-3 bg-white hover:bg-emerald-50/80 rounded-2xl border border-neutral-200/90 hover:border-emerald-400 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col items-center text-center cursor-pointer"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100/70 text-emerald-800 group-hover:bg-emerald-700 group-hover:text-white transition-colors flex items-center justify-center mb-1.5 shadow-2xs">
                  <IconComp className="w-5 h-5" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-neutral-800 group-hover:text-emerald-900 line-clamp-1">
                  {cat.name}
                </span>
                <span className="text-[9px] text-neutral-400 font-medium">
                  {count} barang
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Promo & Diskon Spesial */}
      {promoProducts.length > 0 && (
        <section id="promo-section" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
                <Tag className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight">
                Promo Panen & Diskon Tetangga
              </h2>
            </div>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setActiveTab('kategori');
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {promoProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Produk Terlaris & Unggulan */}
      <section id="popular-section" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center shadow-xs">
              <Flame className="w-4 h-4 fill-neutral-950" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight">
                Paling Laris di {settings.villageName}
              </h2>
              <p className="text-[11px] text-neutral-500">
                Paling banyak dibeli dan direkomendasikan warga
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {popularProducts.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 6. Produk Terbaru */}
      <section id="latest-products-section" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight">
              Produk Baru Masuk
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {latestProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 7. Berita & Pengumuman Desa */}
      {news.length > 0 && (
        <section id="village-news-section" className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Newspaper className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight">
                  Kabar & Pengumuman Balai Desa
                </h2>
                <p className="text-[11px] text-neutral-500">
                  Informasi resmi dari Pemdes dan {settings.bumdesName || 'BUMDes'} {settings.villageName}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {news.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedNews(item)}
                className="bg-white rounded-2xl border border-neutral-200 p-3.5 shadow-2xs hover:shadow-xs hover:border-emerald-400 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-1">
                    <span className="font-bold text-emerald-800 uppercase bg-emerald-50 px-1.5 py-0.2 rounded">
                      {item.category}
                    </span>
                    <span>{item.date}</span>
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-neutral-900 line-clamp-2 mt-1">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1">
                    {item.summary}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] font-bold text-emerald-800">
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. Iklan Jasa & Usaha Warga Terverifikasi */}
      {ads.length > 0 && (
        <section id="village-ads-section" className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
                <Megaphone className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight">
                  Iklan Layanan & Jasa Warga
                </h2>
                <p className="text-[11px] text-neutral-500">
                  Dikelola dan diverifikasi oleh Pengurus Admin Desa
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="bg-white rounded-2xl border border-neutral-200/90 p-3.5 shadow-2xs flex gap-3.5 items-center"
              >
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-16 h-16 rounded-xl object-cover bg-neutral-100 shrink-0 border border-neutral-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                      {ad.badge}
                    </span>
                    <span className="text-[10px] text-neutral-400 truncate">{ad.dusun}</span>
                  </div>
                  <h4 className="font-bold text-xs text-neutral-900 truncate mt-0.5">{ad.title}</h4>
                  <p className="text-[11px] text-neutral-500 line-clamp-1">{ad.description}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-600 font-semibold">{ad.ownerName}</span>
                    <button
                      onClick={() => {
                        const cleanNum = ad.whatsapp.replace(/[^0-9]/g, '');
                        window.open(`https://wa.me/${cleanNum}?text=Halo%20${encodeURIComponent(ad.businessName)}`, '_blank');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 9. Desa Mandiri Trust Footer Box */}
      <div className="bg-emerald-800 text-white rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg">
            {settings.bumdesName}
          </h3>
          <p className="text-xs text-emerald-100 mt-1 max-w-lg">
            {settings.tagline} • Setiap pembelian Anda langsung membantu perekonomian petani dan UMKM lokal {settings.villageName}.
          </p>
        </div>
        <div className="shrink-0">
          <div className="text-xs font-bold text-emerald-200">Kontak Bantuan Pengurus:</div>
          <div className="text-sm font-extrabold text-white mt-0.5">{settings.emergencyContact}</div>
        </div>
      </div>
    </div>
  );
};
