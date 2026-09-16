import React, { useState } from 'react';
import { Users, CheckCircle2, Search, Phone, ShieldAlert, Bike, Store, ShoppingBag, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const AdminUsersPanel: React.FC = () => {
  const { users } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  const filteredUsers = users
    .filter((u) => {
      if (roleFilter === 'all') return true;
      return u.role === roleFilter;
    })
    .filter((u) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        (u.shopName && u.shopName.toLowerCase().includes(q)) ||
        u.dusun.toLowerCase().includes(q) ||
        u.phone.includes(q)
      );
    });

  return (
    <div id="admin-users-panel" className="space-y-4 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
        <div>
          <h2 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-700" />
            Daftar Akun Pengguna Pasar Desa ({users.length})
          </h2>
          <p className="text-xs text-emerald-800 mt-0.5">
            Semua warga pembeli, penjual UMKM, kurir antar desa, dan admin pengurus.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'all', label: 'Semua Akun' },
              { id: 'buyer', label: 'Warga Pembeli' },
              { id: 'seller', label: 'Penjual UMKM' },
              { id: 'courier', label: 'Kurir Desa' },
              { id: 'admin', label: 'Admin BUMDes' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                roleFilter === tab.id
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
            placeholder="Cari nama, dusun, telepon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl w-full sm:w-64 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredUsers.map((u) => {
          const cleanPhone = (u.phone || '').replace(/[^0-9]/g, '');
          return (
            <div
              key={u.id}
              className="bg-white rounded-2xl border border-neutral-200 p-3.5 shadow-xs flex items-center gap-3"
            >
              <img
                src={
                  u.avatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                }
                alt={u.name}
                className="w-12 h-12 rounded-xl object-cover bg-neutral-100 border border-neutral-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <h3 className="font-bold text-xs text-neutral-900 truncate">{u.name}</h3>
                  {u.verifiedSeller && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                </div>
                <div className="text-[11px] text-neutral-500 truncate">{u.dusun}</div>
                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <span
                    className={`font-bold capitalize px-2 py-0.5 rounded ${
                      u.role === 'buyer'
                        ? 'bg-neutral-100 text-neutral-700'
                        : u.role === 'seller'
                        ? 'bg-amber-100 text-amber-900'
                        : u.role === 'courier'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-purple-100 text-purple-900'
                    }`}
                  >
                    {u.role === 'buyer'
                      ? 'Warga Pembeli'
                      : u.role === 'seller'
                      ? `UMKM: ${u.shopName || 'Lapak'}`
                      : u.role === 'courier'
                      ? `Kurir (${u.courierRatingAverage ? `⭐ ${u.courierRatingAverage.toFixed(1)}` : 'Baru'})`
                      : 'Admin BUMDes'}
                  </span>

                  {u.phone && (
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:underline font-mono"
                    >
                      {u.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
