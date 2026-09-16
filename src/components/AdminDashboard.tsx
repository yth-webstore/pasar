import React, { useState } from 'react';
import {
  ShieldCheck,
  Newspaper,
  Megaphone,
  Store,
  Users,
  Settings,
  TrendingUp,
  Package,
  Image as ImageIcon,
  ShieldAlert,
  Sparkles,
  Bike,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AdminStatsPanel } from './admin/AdminStatsPanel';
import { AdminApprovalPanel } from './admin/AdminApprovalPanel';
import { AdminCourierPanel } from './admin/AdminCourierPanel';
import { AdminStoresPanel } from './admin/AdminStoresPanel';
import { AdminNewsPanel } from './admin/AdminNewsPanel';
import { AdminAdsPanel } from './admin/AdminAdsPanel';
import { AdminProductsPanel } from './admin/AdminProductsPanel';
import { AdminBannersPanel } from './admin/AdminBannersPanel';
import { AdminUsersPanel } from './admin/AdminUsersPanel';
import { AdminSettingsPanel } from './admin/AdminSettingsPanel';

export const AdminDashboard: React.FC = () => {
  const { currentUser, pendingAdminCount, pendingCourierCount, settings, setActiveTab: setGlobalTab } = useApp();

  const [activeTab, setActiveTab] = useState<
    'statistik' | 'persetujuan' | 'kurir' | 'toko' | 'berita' | 'iklan' | 'produk' | 'banner' | 'pengguna' | 'pengaturan'
  >('statistik');

  const isSuperAdmin = currentUser?.email.toLowerCase() === 'yth.abdurrohman@gmail.com';

  return (
    <div className="space-y-6 pb-20">
      {/* Header Panel */}
      <div className="bg-white rounded-3xl border border-neutral-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-extrabold text-neutral-900">
                Panel Kendali Admin BUMDes & Pasar Desa
              </h1>
              {isSuperAdmin && (
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-black border border-purple-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-700" />
                  Super Admin Utama
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Kelola kas desa, verifikasi admin, persetujuan kurir desa, lapak UMKM, berita resmi, iklan warga, dan katalog komoditas {settings.villageName}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setGlobalTab('beranda')}
            className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold transition whitespace-nowrap"
          >
            Lihat Pasar Warga
          </button>
        </div>
      </div>

      {/* Urgent Approval Alert Banner (if there are pending admin requests) */}
      {pendingAdminCount > 0 && activeTab !== 'persetujuan' && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab('persetujuan')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setActiveTab('persetujuan');
            }
          }}
          className="bg-amber-500 text-amber-950 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs cursor-pointer hover:bg-amber-400 transition"
        >
          <div className="flex items-center gap-2.5 text-xs font-black">
            <ShieldAlert className="w-5 h-5 text-amber-950 shrink-0" />
            <span>
              Ada {pendingAdminCount} Permohonan Akun Admin Menunggu Persetujuan Anda!
            </span>
          </div>
          <span className="px-3 py-1 bg-amber-950 text-amber-100 rounded-xl text-[11px] font-extrabold whitespace-nowrap">
            Buka Verifikasi →
          </span>
        </div>
      )}

      {/* Urgent Courier Alert Banner (if there are pending courier registrations) */}
      {pendingCourierCount > 0 && activeTab !== 'kurir' && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab('kurir')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setActiveTab('kurir');
            }
          }}
          className="bg-blue-600 text-white px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs cursor-pointer hover:bg-blue-700 transition"
        >
          <div className="flex items-center gap-2.5 text-xs font-black">
            <Bike className="w-5 h-5 text-blue-200 shrink-0" />
            <span>
              Ada {pendingCourierCount} Warga Mendaftar Jadi Kurir Menunggu Persetujuan Admin!
            </span>
          </div>
          <span className="px-3 py-1 bg-white text-blue-900 rounded-xl text-[11px] font-extrabold whitespace-nowrap">
            Tentukan Kurir →
          </span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        {[
          { id: 'statistik', label: 'Statistik & Transaksi', icon: TrendingUp },
          {
            id: 'persetujuan',
            label: 'Persetujuan Admin',
            icon: ShieldAlert,
            badge: pendingAdminCount > 0 ? pendingAdminCount : undefined,
          },
          {
            id: 'kurir',
            label: 'Mitra Kurir Desa',
            icon: Bike,
            badge: pendingCourierCount > 0 ? pendingCourierCount : undefined,
          },
          { id: 'toko', label: 'Lapak & UMKM Desa', icon: Store },
          { id: 'berita', label: 'Berita & Pengumuman', icon: Newspaper },
          { id: 'iklan', label: 'Iklan Usaha Warga', icon: Megaphone },
          { id: 'produk', label: 'Produk Beredar', icon: Package },
          { id: 'banner', label: 'Banner Promosi', icon: ImageIcon },
          { id: 'pengguna', label: 'Akun Pengguna', icon: Users },
          { id: 'pengaturan', label: 'Pengaturan Sistem', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold transition whitespace-nowrap shrink-0 shadow-2xs ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-200' : 'text-neutral-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-amber-400 text-neutral-950' : 'bg-amber-500 text-white'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'statistik' && <AdminStatsPanel />}
      {activeTab === 'persetujuan' && <AdminApprovalPanel />}
      {activeTab === 'kurir' && <AdminCourierPanel />}
      {activeTab === 'toko' && <AdminStoresPanel />}
      {activeTab === 'berita' && <AdminNewsPanel />}
      {activeTab === 'iklan' && <AdminAdsPanel />}
      {activeTab === 'produk' && <AdminProductsPanel />}
      {activeTab === 'banner' && <AdminBannersPanel />}
      {activeTab === 'pengguna' && <AdminUsersPanel />}
      {activeTab === 'pengaturan' && <AdminSettingsPanel />}
    </div>
  );
};
