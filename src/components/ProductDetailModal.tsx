import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  MessageCircle,
  ShoppingCart,
  Heart,
  Store,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Send,
  Plus,
  Minus,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah, injectProductJsonLd } from '../utils/seo';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    toggleFavorite,
    isFavorite,
    reviews,
    addReview,
    currentUser,
    setIsCartOpen,
    setIsAuthModalOpen,
  } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'deskripsi' | 'ulasan' | 'toko'>('deskripsi');

  // Review Form State
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      injectProductJsonLd(selectedProduct);
      setQuantity(1);
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const productReviews = reviews.filter((r) => r.productId === selectedProduct.id);
  const favorite = isFavorite(selectedProduct.id);

  const handleWhatsApp = () => {
    const cleanNumber = selectedProduct.sellerWhatsapp.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Halo *${selectedProduct.sellerName}*,\nSaya tertarik dengan produk *${selectedProduct.name}* (Rp ${selectedProduct.price.toLocaleString('id-ID')}/${selectedProduct.unit}).\nApakah stok masih ada dan bisa diantar ke rumah saya?`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity);
    setIsCartOpen(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!newComment.trim()) return;

    addReview({
      productId: selectedProduct.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userDusun: currentUser.dusun.split(',')[0],
      rating: newRating,
      comment: newComment.trim(),
    });

    setNewComment('');
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  return (
    <div
      id="product-detail-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={() => setSelectedProduct(null)}
    >
      <div
        id="product-detail-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in duration-200"
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
              {selectedProduct.categoryName}
            </span>
            <span className="text-xs text-neutral-500 font-medium truncate max-w-48">
              {selectedProduct.sellerName}
            </span>
          </div>
          <button
            id="close-product-detail-btn"
            onClick={() => setSelectedProduct(null)}
            className="w-8 h-8 rounded-full bg-neutral-200/80 hover:bg-neutral-300 text-neutral-700 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 space-y-5 flex-1">
          {/* Main Visual & Key Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Product Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              <button
                id="modal-fav-toggle-btn"
                onClick={() => toggleFavorite(selectedProduct.id)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-neutral-700 shadow-md flex items-center justify-center transition"
              >
                <Heart
                  className={`w-5 h-5 ${
                    favorite ? 'fill-red-500 text-red-500' : 'text-neutral-600'
                  }`}
                />
              </button>
              {selectedProduct.isPromo && (
                <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                  {selectedProduct.promoBadge || 'Promo Spesial'}
                </div>
              )}
            </div>

            {/* Price & Seller Brief */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-neutral-900 leading-tight">
                  {selectedProduct.name}
                </h1>

                {/* Rating & Sold */}
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{selectedProduct.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-neutral-400">•</span>
                  <span className="text-neutral-600 font-medium">
                    {selectedProduct.soldCount} terjual
                  </span>
                  <span className="text-neutral-400">•</span>
                  <span className="text-emerald-700 font-bold">
                    Stok: {selectedProduct.stock} {selectedProduct.unit}
                  </span>
                </div>

                {/* Price Display */}
                <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                  <div className="text-xs text-emerald-800 font-semibold">Harga Warga Desa</div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-emerald-900">
                      {formatRupiah(selectedProduct.price)}
                    </span>
                    <span className="text-xs text-neutral-600 font-medium">/{selectedProduct.unit}</span>
                  </div>
                  {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="line-through text-neutral-400">
                        {formatRupiah(selectedProduct.originalPrice)}
                      </span>
                      <span className="bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">
                        Hemat {formatRupiah(selectedProduct.originalPrice - selectedProduct.price)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Seller Mini Card */}
                <div className="mt-3 p-3 rounded-2xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-neutral-900 flex items-center gap-1">
                        {selectedProduct.sellerName}
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                      </div>
                      <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-neutral-400" />
                        {selectedProduct.sellerDusun}
                      </div>
                    </div>
                  </div>
                  <button
                    id="wa-detail-btn"
                    onClick={handleWhatsApp}
                    className="p-2 text-emerald-700 hover:bg-emerald-100 rounded-xl transition"
                    title="Chat via WhatsApp"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Quantity selector */}
              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-700">Jumlah Beli:</span>
                <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-xl">
                  <button
                    id="qty-minus-btn"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-7 h-7 bg-white rounded-lg text-neutral-700 flex items-center justify-center hover:bg-neutral-200 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-neutral-900">{quantity}</span>
                  <button
                    id="qty-plus-btn"
                    onClick={() => setQuantity((prev) => Math.min(selectedProduct.stock, prev + 1))}
                    disabled={quantity >= selectedProduct.stock}
                    className="w-7 h-7 bg-white rounded-lg text-neutral-700 flex items-center justify-center hover:bg-neutral-200 transition disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-neutral-200 flex gap-4 text-xs font-bold">
            <button
              id="tab-deskripsi-btn"
              onClick={() => setActiveTab('deskripsi')}
              className={`pb-2 transition ${
                activeTab === 'deskripsi'
                  ? 'text-emerald-800 border-b-2 border-emerald-700'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Deskripsi Produk
            </button>
            <button
              id="tab-ulasan-btn"
              onClick={() => setActiveTab('ulasan')}
              className={`pb-2 transition flex items-center gap-1.5 ${
                activeTab === 'ulasan'
                  ? 'text-emerald-800 border-b-2 border-emerald-700'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <span>Ulasan Warga</span>
              <span className="bg-neutral-200 text-neutral-700 px-1.5 py-0.2 rounded-full text-[10px]">
                {productReviews.length}
              </span>
            </button>
            <button
              id="tab-toko-btn"
              onClick={() => setActiveTab('toko')}
              className={`pb-2 transition ${
                activeTab === 'toko'
                  ? 'text-emerald-800 border-b-2 border-emerald-700'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Tentang Penjual & BUMDes
            </button>
          </div>

          {/* Tab Content: Deskripsi */}
          {activeTab === 'deskripsi' && (
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed whitespace-pre-line font-normal">
                {selectedProduct.description}
              </p>
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Jaminan Kualitas Warga Desa</div>
                  <div className="text-[11px] text-emerald-800 mt-0.5">
                    Produk ini bersumber asli dari warga / UMKM binaan BUMDes Desa Sukamaju. Jika barang rusak atau tidak sesuai, dapat ditukar langsung dengan menghubungi penjual atau pengurus desa.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Ulasan */}
          {activeTab === 'ulasan' && (
            <div className="space-y-4">
              {/* Add review form */}
              <form onSubmit={handleSubmitReview} className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                <div className="text-xs font-bold text-neutral-800 flex items-center justify-between">
                  <span>Tulis Pengalaman Belanja Anda</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-0.5 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  id="review-comment-input"
                  rows={2}
                  placeholder="Ceritakan kualitas produk, kesegaran, atau keramahan penjual..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 outline-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500">
                    Masuk sebagai: <strong>{currentUser ? currentUser.name : 'Tamu (Perlu Masuk)'}</strong>
                  </span>
                  <button
                    id="submit-review-btn"
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Kirim Ulasan
                  </button>
                </div>
                {reviewSuccess && (
                  <div className="text-xs text-emerald-700 font-bold bg-emerald-100 p-2 rounded-lg">
                    ✓ Terima kasih! Ulasan Anda telah berhasil diterbitkan.
                  </div>
                )}
              </form>

              {/* Review list */}
              <div className="space-y-3">
                {productReviews.length === 0 ? (
                  <p className="text-xs text-neutral-500 text-center py-4">
                    Belum ada ulasan untuk produk ini. Jadilah yang pertama memberikan ulasan!
                  </p>
                ) : (
                  productReviews.map((rev) => (
                    <div key={rev.id} className="p-3 rounded-xl border border-neutral-100 bg-white space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-neutral-900">{rev.userName} ({rev.userDusun})</span>
                        <span className="text-[10px] text-neutral-400">{rev.createdAt}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-neutral-700 mt-1">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab Content: Toko */}
          {activeTab === 'toko' && (
            <div className="space-y-3 text-xs text-neutral-700">
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-emerald-700" />
                  {selectedProduct.sellerName}
                </div>
                <p className="text-xs text-neutral-600">
                  Unit usaha mikro warga binaan yang terdaftar resmi pada sistem pendataan BUMDes Desa Sukamaju.
                </p>
                <div className="pt-2 border-t border-neutral-200 flex flex-col gap-1 text-[11px]">
                  <div>📍 <strong>Lokasi:</strong> {selectedProduct.sellerDusun}</div>
                  <div>📱 <strong>WhatsApp Toko:</strong> +{selectedProduct.sellerWhatsapp}</div>
                  <div>🚚 <strong>Opsi Kirim:</strong> Diantar Kurir Desa Sukamaju / Ambil di Lokasi Toko</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 border-t border-neutral-200 bg-white flex items-center justify-between gap-3">
          <button
            id="chat-wa-modal-btn"
            onClick={handleWhatsApp}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs sm:text-sm font-bold transition"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Chat WhatsApp</span>
          </button>

          <button
            id="modal-add-cart-btn"
            onClick={handleAddToCart}
            disabled={selectedProduct.stock <= 0}
            className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md transition ${
              selectedProduct.stock > 0
                ? 'bg-emerald-700 hover:bg-emerald-800 active:scale-98'
                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{selectedProduct.stock > 0 ? 'Beli Sekarang' : 'Stok Habis'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
