import React from 'react';
import { Star, MessageCircle, ShoppingCart, Heart, MapPin, Store } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/seo';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProduct, addToCart, toggleFavorite, isFavorite, dataSaverMode, openShareProduct } = useApp();
  const favorite = isFavorite(product.id);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleWhatsAppChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanNumber = product.sellerWhatsapp.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Halo ${product.sellerName}, saya melihat produk "${product.name}" di Pasar Desa Mandiri. Apakah stok masih tersedia?`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  const handleShareProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    openShareProduct(product);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <article
      id={`product-card-${product.id}`}
      onClick={() => setSelectedProduct(product)}
      className="group bg-white rounded-2xl border border-neutral-200/90 hover:border-emerald-500/40 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Product Image Box */}
      <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-300 ${
            dataSaverMode ? '' : 'group-hover:scale-105'
          }`}
        />

        {/* Promo / Discount Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
          {discountPercent && (
            <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
              -{discountPercent}%
            </span>
          )}
          {product.isPromo && product.promoBadge && (
            <span className="bg-amber-500 text-neutral-950 text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
              {product.promoBadge}
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="bg-orange-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
              Sisa {product.stock}
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-neutral-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
              Habis
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          id={`fav-btn-${product.id}`}
          onClick={handleToggleFav}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-neutral-600 hover:text-red-500 flex items-center justify-center shadow-xs backdrop-blur-xs transition z-10"
          aria-label="Simpan ke favorit"
        >
          <Heart
            className={`w-4 h-4 transition ${
              favorite ? 'fill-red-500 text-red-500 scale-110' : 'text-neutral-500'
            }`}
          />
        </button>

        {/* Unit measurement pill */}
        <div className="absolute bottom-2 left-2 bg-neutral-900/70 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-xs font-medium">
          /{product.unit}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Nama Lapak & Lokasi Dusun */}
          <div className="mb-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-neutral-800 truncate flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="truncate">{product.sellerName}</span>
              </span>
              <span className="flex items-center gap-0.5 text-neutral-400 text-[10px] shrink-0 ml-1">
                <MapPin className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
                {product.sellerDusun.split(',')[0]}
              </span>
            </div>
            {/* Tag / Kategori produk berada tepat di bawah nama lapak */}
            <div className="mt-0.5">
              <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold text-[10px] px-1.5 py-0.5 rounded-md">
                {product.categoryName}
              </span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-neutral-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-emerald-800 transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-emerald-800 font-extrabold text-sm sm:text-base">
              {formatRupiah(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[11px] text-neutral-400 line-through">
                {formatRupiah(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Rating, Sold, & Actions */}
        <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 text-[11px] text-neutral-600">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span className="font-bold text-neutral-800">{product.rating.toFixed(1)}</span>
            <span className="text-neutral-400 text-[10px]">({product.soldCount})</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* WhatsApp Chat button */}
            <button
              id={`wa-chat-btn-${product.id}`}
              onClick={handleWhatsAppChat}
              className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
              title={`Chat WhatsApp penjual ${product.sellerName}`}
              aria-label="Hubungi Penjual via WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>

            {/* Quick Add to Cart button */}
            <button
              id={`add-cart-btn-${product.id}`}
              onClick={handleQuickAdd}
              disabled={product.stock <= 0}
              className={`p-1.5 rounded-lg transition flex items-center justify-center ${
                product.stock > 0
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
              title="Tambah ke Keranjang"
              aria-label="Tambah ke Keranjang"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
