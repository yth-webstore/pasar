import React, { useState, useMemo } from 'react';
import {
  Filter,
  Search,
  SlidersHorizontal,
  X,
  Tag,
  Star,
  Check,
  Wheat,
  Sprout,
  Utensils,
  Coffee,
  Palette,
  Shirt,
  Wrench,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';

const CATEGORY_ICON_MAP: { [key: string]: React.ElementType } = {
  Wheat,
  Sprout,
  Utensils,
  Coffee,
  Palette,
  Shirt,
  Wrench,
};

export const CategoriesView: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const [sortBy, setSortBy] = useState<'terbaru' | 'terlaris' | 'termurah' | 'termahal' | 'rating'>('terbaru');
  const [filterPromoOnly, setFilterPromoOnly] = useState(false);
  const [filterInStockOnly, setFilterInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 150000]);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory && p.categoryId !== selectedCategory) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(query);
          const matchCategory = p.categoryName.toLowerCase().includes(query);
          const matchSeller = p.sellerName.toLowerCase().includes(query);
          const matchDesc = p.description.toLowerCase().includes(query);
          if (!matchName && !matchCategory && !matchSeller && !matchDesc) {
            return false;
          }
        }
        // Promo only
        if (filterPromoOnly && !p.isPromo) return false;
        // In stock only
        if (filterInStockOnly && p.stock <= 0) return false;
        // Price range
        if (p.price < priceRange[0] || p.price > priceRange[1]) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'terlaris') return b.soldCount - a.soldCount;
        if (sortBy === 'termurah') return a.price - b.price;
        if (sortBy === 'termahal') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        // Default terbaru (id order or default)
        return b.id.localeCompare(a.id);
      });
  }, [
    products,
    selectedCategory,
    searchQuery,
    filterPromoOnly,
    filterInStockOnly,
    priceRange,
    sortBy,
  ]);

  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);

  return (
    <div id="categories-view-container" className="space-y-6 pb-24">
      {/* Top Header & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-neutral-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              {activeCategoryObj ? `Kategori: ${activeCategoryObj.name}` : 'Katalog Produk Desa'}
            </h1>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              Menampilkan {filteredProducts.length} produk dari seluruh petani dan UMKM Desa Sukamaju
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-bold py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <option value="terbaru">Terbaru</option>
              <option value="terlaris">Terlaris</option>
              <option value="termurah">Harga Terendah</option>
              <option value="termahal">Harga Tertinggi</option>
              <option value="rating">Rating Tertinggi</option>
            </select>

            {/* Filter Toggle on mobile */}
            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-800 font-bold rounded-xl border border-emerald-200 text-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Category Horizontal Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition cursor-pointer ${
              selectedCategory === null
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            Semua Kategori
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const IconComp = CATEGORY_ICON_MAP[cat.icon] || HelpCircle;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Filter Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-neutral-100 text-xs">
          <span className="text-[11px] text-neutral-400 font-semibold">Filter Cepat:</span>
          <button
            onClick={() => setFilterPromoOnly(!filterPromoOnly)}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
              filterPromoOnly
                ? 'bg-red-600 text-white shadow-2xs'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            <Tag className="w-3 h-3" />
            <span>Promo Saja</span>
          </button>

          <button
            onClick={() => setFilterInStockOnly(!filterInStockOnly)}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
              filterInStockOnly
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            <Check className="w-3 h-3" />
            <span>Stok Tersedia Saja</span>
          </button>

          {(filterPromoOnly || filterInStockOnly || searchQuery) && (
            <button
              onClick={() => {
                setFilterPromoOnly(false);
                setFilterInStockOnly(false);
                setSearchQuery('');
              }}
              className="text-neutral-500 hover:text-red-600 font-bold ml-auto flex items-center gap-1 text-[11px]"
            >
              <X className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid & Products Display */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center space-y-3">
          <div className="w-14 h-14 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-neutral-800 text-base">Tidak Menemukan Produk</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Tidak ada produk yang cocok dengan pencarian atau filter aktif Anda. Cobalah gunakan kata kunci lain atau reset filter.
          </p>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setFilterPromoOnly(false);
              setFilterInStockOnly(false);
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Tampilkan Semua Produk
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};
