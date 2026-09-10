import React, { useState } from 'react';
import { X, Globe, Code2, Zap, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateSitemapUrls } from '../utils/seo';

export const SEOAndPerformanceModal: React.FC = () => {
  const {
    isSeoModalOpen,
    setIsSeoModalOpen,
    products,
    categories,
    news,
    settings,
    dataSaverMode,
    setDataSaverMode,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'seo' | 'structured' | 'sitemap' | 'performa'>('seo');

  if (!isSeoModalOpen) return null;

  const sitemapUrls = generateSitemapUrls(products, categories, news);

  return (
    <div
      id="seo-performance-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={() => setIsSeoModalOpen(false)}
    >
      <div
        id="seo-performance-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-extrabold text-neutral-900">
              SEO, Structured Data & Optimasi Performa Desa
            </h2>
          </div>
          <button
            onClick={() => setIsSeoModalOpen(false)}
            className="w-8 h-8 rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-700 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 bg-white px-4 text-xs font-bold gap-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('seo')}
            className={`py-3 transition border-b-2 ${
              activeTab === 'seo' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-neutral-500'
            }`}
          >
            Meta Tag & SEO Title
          </button>
          <button
            onClick={() => setActiveTab('structured')}
            className={`py-3 transition border-b-2 ${
              activeTab === 'structured' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-neutral-500'
            }`}
          >
            Structured Data (Schema.org)
          </button>
          <button
            onClick={() => setActiveTab('sitemap')}
            className={`py-3 transition border-b-2 ${
              activeTab === 'sitemap' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-neutral-500'
            }`}
          >
            Sitemap ({sitemapUrls.length} URL)
          </button>
          <button
            onClick={() => setActiveTab('performa')}
            className={`py-3 transition border-b-2 ${
              activeTab === 'performa' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-neutral-500'
            }`}
          >
            Performa HP Murah & WebP
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'seo' && (
            <div className="space-y-3">
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                <div className="font-bold text-neutral-800">Title Dokumen Aktif:</div>
                <div className="p-2 bg-white rounded-lg border font-mono text-emerald-900 break-all">
                  {document.title}
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                <div className="font-bold text-neutral-800">Meta Description Aktif:</div>
                <div className="p-2 bg-white rounded-lg border font-mono text-neutral-700 break-all">
                  {document.querySelector('meta[name="description"]')?.getAttribute('content') ||
                    'Marketplace Desa Mandiri'}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  SEO Otomatis Sinkron
                </div>
                <p className="text-[11px] text-emerald-800">
                  Setiap kali halaman dibuka, detail produk dilihat, atau berita desa diklik, title dokumen dan meta tag OpenGraph diperbarui secara dinamis untuk crawler Google & media sosial (WhatsApp previews).
                </p>
              </div>
            </div>
          )}

          {activeTab === 'structured' && (
            <div className="space-y-3">
              <p className="text-neutral-600">
                Data terstruktur Schema.org (JSON-LD) disuntikkan langsung untuk mesin pencari Google agar produk desa muncul dengan Rich Snippet (harga, stok, rating, penjual lokal):
              </p>
              <pre className="p-3 bg-neutral-900 text-emerald-400 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-60">
                {JSON.stringify(
                  {
                    '@context': 'https://schema.org/',
                    '@type': 'LocalBusiness',
                    name: 'Pasar Desa Mandiri Sukamaju',
                    description: settings.tagline,
                    areaServed: settings.villageName,
                    currenciesAccepted: 'IDR',
                    paymentAccepted: ['Cash (COD)', 'Direct Bank Transfer'],
                    department: categories.map((c) => ({
                      '@type': 'Place',
                      name: c.name,
                    })),
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}

          {activeTab === 'sitemap' && (
            <div className="space-y-3">
              <p className="text-neutral-600">
                Daftar URL SEO-friendly yang dipetakan untuk robot perayap mesin pencari:
              </p>
              <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
                {sitemapUrls.map((s, idx) => (
                  <div key={idx} className="p-2.5 bg-white hover:bg-neutral-50 flex items-center justify-between text-[11px]">
                    <div>
                      <div className="font-bold text-neutral-800">{s.title}</div>
                      <div className="text-neutral-400 font-mono truncate max-w-sm">{s.loc}</div>
                    </div>
                    <span className="bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-mono">
                      pri: {s.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'performa' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-700" />
                    <div>
                      <div className="font-extrabold text-sm text-emerald-950">Mode Hemat Data Desa</div>
                      <div className="text-[11px] text-emerald-800">
                        Mematikan animasi berat, membatasi beban memori HP, dan mengoptimalkan gambar.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setDataSaverMode(!dataSaverMode)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                      dataSaverMode ? 'bg-emerald-700 text-white' : 'bg-white text-neutral-700 border'
                    }`}
                  >
                    {dataSaverMode ? 'AKTIF' : 'NONAKTIF'}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-neutral-800">Fitur Optimasi yang Diterapkan:</div>
                <ul className="space-y-1.5 text-neutral-600 text-[11px]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.2" />
                    <span><strong>Kompresi Otomatis ke WebP:</strong> Semua foto produk & bukti transfer dikompresi di sisi browser sebelum diunggah, menghemat hingga 80% kuota internet.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.2" />
                    <span><strong>Penolakan Video Mutlak:</strong> Produk hanya boleh menyertakan gambar tanpa video sehingga aplikasi tidak memberatkan HP kentang dan loading instan.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.2" />
                    <span><strong>Native Lazy Loading:</strong> Gambar produk hanya dimuat saat digulir ke viewport layar pengguna.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex justify-end">
          <button
            onClick={() => setIsSeoModalOpen(false)}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
