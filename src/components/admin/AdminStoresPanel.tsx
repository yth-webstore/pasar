import React, { useState } from 'react';
import {
  Store as StoreIcon,
  CheckCircle2,
  XCircle,
  Phone,
  Search,
  MapPin,
  Package,
  ShieldCheck,
  Star,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Store } from '../../types';

export const AdminStoresPanel: React.FC = () => {
  const { stores, products, verifyStore, setActiveTab, setSelectedStoreId } = useApp();
  const [search, setSearch] = useState('');
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');

  const filteredStores = stores
    .filter((s) => {
      if (filterVerified === 'verified') return s.isVerified;
      if (filterVerified === 'unverified') return !s.isVerified;
      return true;
    })
    .filter((s) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.dusun.toLowerCase().includes(q) ||
        s.sellerName.toLowerCase().includes(q) ||
        s.phone.includes(q)
      );
    });

  return (
    <div id="admin-stores-panel" className="space-y-4 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
        <div>
          <h2 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
            <StoreIcon className="w-4 h-4 text-emerald-700" />
            Manajemen Lapak & UMKM Binaan Desa ({stores.length})
          </h2>
          <p className="text-xs text-emerald-800 mt-0.5">
            Admin desa memverifikasi legalitas dan lokasi lapak UMKM warga untuk menjamin keamanan transaksi sembako dan produk lokal.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          {(
            [
              { id: 'all', label: 'Semua Lapak' },
              { id: 'verified', label: 'Terverifikasi Resmi' },
              { id: 'unverified', label: 'Belum Terverifikasi' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterVerified(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                filterVerified === tab.id
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama lapak, pemilik, dusun..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl w-full sm:w-64 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
          />
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStores.map((store) => {
          const storeProducts = products.filter((p) => p.storeId === store.id || p.sellerId === store.sellerId);
          const cleanPhone = (store.phone || store.whatsapp || '').replace(/[^0-9]/g, '');

          return (
            <div
              key={store.id}
              className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="relative h-28 bg-neutral-100">
                  <img
                    src={store.bannerUrl || store.logoUrl}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                        store.isVerified
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {store.isVerified ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Terverifikasi
                        </>
                      ) : (
                        'Belum Verifikasi'
                      )}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <img
                      src={store.logoUrl}
                      alt={store.name}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-xs -mt-7 bg-white shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-sm text-neutral-900 truncate">
                        {store.name}
                      </h3>
                      <p className="text-[11px] text-neutral-500 truncate">
                        Pemilik: <span className="font-medium text-neutral-700">{store.sellerName}</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                    {store.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600 pt-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">{store.dusun}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{storeProducts.length} Produk</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-[11px] font-bold text-neutral-800 flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-emerald-700" />
                  <span>WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => verifyStore(store.id, !store.isVerified)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 ${
                    store.isVerified
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                  }`}
                >
                  {store.isVerified ? (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Batalkan Verifikasi</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verifikasi Lapak</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
