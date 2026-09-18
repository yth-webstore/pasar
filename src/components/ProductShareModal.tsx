import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  MessageCircle,
  ExternalLink,
  Send,
  Smartphone,
  MapPin,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/seo';

export const ProductShareModal: React.FC = () => {
  const { sharingProduct, isShareModalOpen, setIsShareModalOpen, setSharingProduct, settings } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isShareModalOpen || !sharingProduct) return null;

  const rawWa = sharingProduct.sellerWhatsapp || '081234567890';
  const cleanWa = rawWa.replace(/[^0-9]/g, '');
  const waDirectLink = `https://wa.me/${cleanWa}?text=${encodeURIComponent(`Halo ${sharingProduct.sellerName}, saya ingin memesan ${sharingProduct.name} (${formatRupiah(sharingProduct.price)}/${sharingProduct.unit}). Apakah masih tersedia?`)}`;

  // Share text using seller's WhatsApp number instead of website link
  const shareText = `🌾 *${sharingProduct.name}*\n💰 Harga: ${formatRupiah(sharingProduct.price)} / ${sharingProduct.unit}\n📍 Dusun: ${(sharingProduct.sellerDusun || '').split(',')[0]}\n🏪 Lapak: ${sharingProduct.sellerName}\n📱 Nomor WhatsApp Penjual: ${rawWa}\n\nLangsung hubungi dan pesan ke penjual via WhatsApp:\n${waDirectLink}`;

  const handleCopyWhatsAppNumber = async () => {
    try {
      await navigator.clipboard.writeText(rawWa);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  const handleShareFacebook = () => {
    const fbText = `${shareText}`;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(fbText)}&u=${encodeURIComponent(waDirectLink)}`;
    window.open(fbUrl, '_blank');
  };

  const handleShareTwitter = () => {
    const tweetText = `${sharingProduct.name} - ${formatRupiah(sharingProduct.price)}/${sharingProduct.unit} di Lapak ${sharingProduct.sellerName}. Hubungi WA Penjual: ${rawWa}`;
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(xUrl, '_blank');
  };

  const handleShareTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(waDirectLink)}&text=${encodeURIComponent(`${sharingProduct.name} (${formatRupiah(sharingProduct.price)}/${sharingProduct.unit}) - WA Penjual: ${rawWa}`)}`;
    window.open(tgUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${sharingProduct.name} - Lapak ${sharingProduct.sellerName}`,
          text: `Pesan ${sharingProduct.name} langsung ke WhatsApp Penjual (${rawWa})`,
          url: waDirectLink,
        });
      } catch {
        // User dismissed or share failed silently
      }
    }
  };

  const closeModal = () => {
    setIsShareModalOpen(false);
    setSharingProduct(null);
  };

  return (
    <div
      id="product-share-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={closeModal}
    >
      <div
        id="product-share-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-neutral-900 leading-tight">
                Bagikan Produk
              </h3>
              <p className="text-[11px] text-neutral-500">
                Sebarkan ke media sosial & grup warga
              </p>
            </div>
          </div>
          <button
            id="close-share-modal-btn"
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-neutral-200/70 hover:bg-neutral-300 text-neutral-700 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Preview Card */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80">
            <img
              src={sharingProduct.imageUrl}
              alt={sharingProduct.name}
              className="w-16 h-16 rounded-xl object-cover border border-neutral-200 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-800 uppercase tracking-wider mb-0.5">
                <Tag className="w-3 h-3 text-emerald-600" />
                <span>{sharingProduct.categoryName}</span>
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-neutral-900 truncate">
                {sharingProduct.name}
              </h4>
              <div className="text-emerald-800 font-extrabold text-xs sm:text-sm mt-0.5">
                {formatRupiah(sharingProduct.price)}
                <span className="text-neutral-500 font-normal text-[11px]">/{sharingProduct.unit}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-0.5">
                <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                <span className="truncate">{sharingProduct.sellerName} • {(sharingProduct.sellerDusun || '').split(',')[0]}</span>
              </div>
            </div>
          </div>

          {/* Social Media Sharing Grid */}
          <div>
            <div className="text-xs font-bold text-neutral-700 mb-2.5">
              Pilih Media Sosial:
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {/* WhatsApp */}
              <button
                id="share-to-wa-btn"
                onClick={handleShareWhatsApp}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 transition text-left group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-5 h-5 fill-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-xs">WhatsApp</div>
                  <div className="text-[10px] text-emerald-700 truncate">Chat / Status WA</div>
                </div>
              </button>

              {/* Facebook */}
              <button
                id="share-to-fb-btn"
                onClick={handleShareFacebook}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/80 transition text-left group"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform font-bold text-base">
                  f
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-xs">Facebook</div>
                  <div className="text-[10px] text-blue-700 truncate">Beranda / Grup</div>
                </div>
              </button>

              {/* X / Twitter */}
              <button
                id="share-to-x-btn"
                onClick={handleShareTwitter}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-300 transition text-left group"
              >
                <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform font-black text-xs">
                  𝕏
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-xs">X (Twitter)</div>
                  <div className="text-[10px] text-neutral-600 truncate">Postingan Baru</div>
                </div>
              </button>

              {/* Telegram */}
              <button
                id="share-to-telegram-btn"
                onClick={handleShareTelegram}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200/80 transition text-left group"
              >
                <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <Send className="w-4 h-4 fill-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-xs">Telegram</div>
                  <div className="text-[10px] text-sky-700 truncate">Kirim Pesan</div>
                </div>
              </button>
            </div>
          </div>

          {/* Copy Seller WhatsApp Section */}
          <div className="pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-neutral-700">
                Nomor WhatsApp Penjual:
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold">
                Lapak {sharingProduct.sellerName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-neutral-50 p-1.5 pl-3 rounded-2xl border border-neutral-200">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <input
                  type="text"
                  readOnly
                  value={rawWa}
                  className="bg-transparent text-xs font-bold text-neutral-800 flex-1 outline-none truncate font-mono select-all"
                />
              </div>
              <button
                id="copy-seller-wa-btn"
                onClick={handleCopyWhatsAppNumber}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-neutral-800 border border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Salin Nomor WA</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Native Mobile Share if Supported */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              id="native-device-share-btn"
              onClick={handleNativeShare}
              className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Smartphone className="w-4 h-4 text-neutral-300" />
              <span>Buka Menu Bagikan di HP (Instagram / Status)</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
