import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Store, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/seo';

export const CartModal: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    updateCartItemNote,
    clearCart,
    getCartTotal,
    setIsCheckoutModalOpen,
    setSelectedProduct,
    settings,
  } = useApp();

  if (!isCartOpen) return null;

  const { subtotal, count } = getCartTotal();

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  return (
    <div
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end transition-opacity"
      onClick={() => setIsCartOpen(false)}
    >
      <div
        id="cart-drawer-container"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-250"
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-extrabold text-neutral-900">
              Keranjang Belanja ({count})
            </h2>
          </div>
          <button
            id="close-cart-btn"
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-700 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-neutral-800 text-base">Keranjang Anda Masih Kosong</h3>
              <p className="text-xs text-neutral-500 max-w-xs">
                Yuk jelajahi hasil panen segar, sembako, dan camilan enak dari tetangga & UMKM {settings.villageName}!
              </p>
              <button
                id="empty-cart-browse-btn"
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                Mulai Belanja
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-neutral-500 pb-1">
                <span>Daftar Barang Belanjaan</span>
                <button
                  id="clear-all-cart-btn"
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Kosongkan
                </button>
              </div>

              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3 bg-white rounded-2xl border border-neutral-200/90 shadow-xs flex gap-3 items-center"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-neutral-100 shrink-0 cursor-pointer"
                    onClick={() => {
                      setIsCartOpen(false);
                      setSelectedProduct(item.product);
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1 truncate">
                      <Store className="w-3 h-3 text-neutral-400 shrink-0" />
                      {item.product.sellerName}
                    </div>
                    {/* Tag kategori berada di bawah nama lapak */}
                    <div className="mt-0.5">
                      <span className="inline-block bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-1.5 py-0.2 rounded border border-emerald-200">
                        {item.product.categoryName}
                      </span>
                    </div>
                    <h4
                      className="font-bold text-xs text-neutral-900 truncate cursor-pointer hover:text-emerald-700 mt-0.5"
                      onClick={() => {
                        setIsCartOpen(false);
                        setSelectedProduct(item.product);
                      }}
                    >
                      {item.product.name}
                    </h4>
                    <div className="text-xs font-extrabold text-emerald-800 mt-0.5">
                      {formatRupiah(item.product.price)}{' '}
                      <span className="text-[10px] text-neutral-500 font-normal">
                        /{item.product.unit}
                      </span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5 bg-neutral-100 p-0.5 rounded-lg">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-md bg-white text-neutral-700 flex items-center justify-center hover:bg-neutral-200 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-neutral-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-6 h-6 rounded-md bg-white text-neutral-700 flex items-center justify-center hover:bg-neutral-200 transition disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-neutral-800">
                          {formatRupiah(item.product.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-neutral-400 hover:text-red-600 transition"
                          title="Hapus dari keranjang"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Sisipkan Catatan Barang */}
                    <div className="mt-2 pt-2 border-t border-dashed border-neutral-200">
                      <div className="flex items-center gap-1.5 bg-neutral-50 hover:bg-neutral-100/80 p-1.5 px-2 rounded-xl border border-neutral-200/90 transition focus-within:ring-2 focus-within:ring-emerald-200 focus-within:bg-white">
                        <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <input
                          type="text"
                          value={item.catatanProduk || item.notes || ''}
                          onChange={(e) => updateCartItemNote(item.product.id, e.target.value)}
                          placeholder="Sisipkan catatan barang (cth: tidak pedas, potong 4, dll)..."
                          className="w-full text-[11px] bg-transparent outline-none text-neutral-700 placeholder:text-neutral-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-neutral-200 bg-neutral-50 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-600">
              <span>Subtotal Belanja:</span>
              <span className="text-base font-black text-emerald-900">{formatRupiah(subtotal)}</span>
            </div>
            <p className="text-[11px] text-neutral-500">
              *Ongkir kurir desa flat (Rp 3.000) atau ambil sendiri dihitung saat checkout.
            </p>
            <button
              id="proceed-checkout-btn"
              onClick={handleProceedCheckout}
              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Lanjut ke Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
