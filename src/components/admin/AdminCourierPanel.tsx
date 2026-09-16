import React, { useState } from 'react';
import {
  Bike,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  MessageCircle,
  Phone,
  Users,
  AlertCircle,
  Car,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CourierApplication } from '../../types';

export const AdminCourierPanel: React.FC = () => {
  const {
    currentUser,
    courierApplications,
    approveCourierApplication,
    rejectCourierApplication,
    refreshAdminStatus,
    settings,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedAppForReject, setSelectedAppForReject] = useState<CourierApplication | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshMessage(null);
    try {
      await refreshAdminStatus();
      setRefreshMessage('Data kurir desa berhasil diperbarui.');
      setTimeout(() => setRefreshMessage(null), 3000);
    } catch {
      setRefreshMessage('Gagal menyinkronkan data dari Cloud.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForReject || !rejectReasonInput.trim()) return;
    await rejectCourierApplication(selectedAppForReject.id, rejectReasonInput.trim());
    setRejectModalOpen(false);
    setSelectedAppForReject(null);
    setRejectReasonInput('');
  };

  const filteredApps = courierApplications.filter((app) => {
    const matchFilter = filter === 'all' || app.status === filter;
    const matchSearch =
      search === '' ||
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.phone.includes(search) ||
      app.vehicleInfo.toLowerCase().includes(search.toLowerCase()) ||
      app.dusun.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const pendingCount = courierApplications.filter((a) => a.status === 'pending').length;
  const approvedCount = courierApplications.filter((a) => a.status === 'approved').length;
  const rejectedCount = courierApplications.filter((a) => a.status === 'rejected').length;

  return (
    <div className="space-y-5">
      {/* Header & Status Banner */}
      <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-neutral-900">
                Persetujuan Mitra Kurir Desa
              </h2>
              <p className="text-xs text-neutral-500">
                Pengguna mendaftar kurir setelah membuat akun, dan admin menentukan persetujuannya
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-bold transition disabled:opacity-50 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>{isRefreshing ? 'Menyinkronkan...' : 'Sinkronkan Data'}</span>
        </button>
      </div>

      {refreshMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{refreshMessage}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`p-4 rounded-2xl border text-left transition ${
            filter === 'all'
              ? 'bg-blue-50 border-blue-500 shadow-2xs ring-2 ring-blue-500/20'
              : 'bg-white border-neutral-200 hover:border-neutral-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-600">Total Pendaftar</span>
            <Users className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-neutral-900">
            {courierApplications.length}
          </div>
        </button>

        <button
          onClick={() => setFilter('pending')}
          className={`p-4 rounded-2xl border text-left transition ${
            filter === 'pending'
              ? 'bg-amber-50 border-amber-500 shadow-2xs ring-2 ring-amber-500/20'
              : 'bg-white border-neutral-200 hover:border-neutral-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700">Perlu Ditentukan</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-900">{pendingCount}</div>
        </button>

        <button
          onClick={() => setFilter('approved')}
          className={`p-4 rounded-2xl border text-left transition ${
            filter === 'approved'
              ? 'bg-emerald-50 border-emerald-500 shadow-2xs ring-2 ring-emerald-500/20'
              : 'bg-white border-neutral-200 hover:border-neutral-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700">Kurir Aktif</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-900">{approvedCount}</div>
        </button>

        <button
          onClick={() => setFilter('rejected')}
          className={`p-4 rounded-2xl border text-left transition ${
            filter === 'rejected'
              ? 'bg-rose-50 border-rose-500 shadow-2xs ring-2 ring-rose-500/20'
              : 'bg-white border-neutral-200 hover:border-neutral-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700">Ditolak</span>
            <UserX className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-900">{rejectedCount}</div>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-neutral-200 flex items-center gap-2.5">
        <Search className="w-4 h-4 text-neutral-400 shrink-0 ml-1" />
        <input
          type="text"
          placeholder="Cari nama pemohon, nomor telepon, dusun, atau nomor kendaraan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs text-neutral-800 outline-none placeholder:text-neutral-400"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-[11px] font-bold text-neutral-400 hover:text-neutral-600 px-2"
          >
            Reset
          </button>
        )}
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {filteredApps.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-neutral-200 text-center space-y-2">
            <div className="w-12 h-12 bg-neutral-100 text-neutral-400 rounded-2xl flex items-center justify-center mx-auto">
              <Bike className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-neutral-700">
              Tidak ada permohonan pendaftaran kurir
            </p>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {filter !== 'all'
                ? `Tidak ditemukan berkas dengan status "${filter}".`
                : 'Belum ada warga yang mendaftar menjadi kurir desa.'}
            </p>
          </div>
        ) : (
          filteredApps.map((app) => {
            const cleanPhone = app.phone.replace(/[^0-9]/g, '');
            const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
            const waLink = `https://wa.me/${waPhone}?text=Halo%20${encodeURIComponent(
              app.name
            )},%20kami%20dari%20Pengurus%20BUMDes%20${encodeURIComponent(
              settings.villageName
            )}%20menghubungi%20terkait%20pendaftaran%20Anda%20sebagai%20kurir%20desa.`;

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 hover:border-neutral-300 transition shadow-2xs space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm shrink-0">
                      {app.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-neutral-900 text-sm">{app.name}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium">
                          {app.dusun || `Warga ${settings.villageName}`}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                        <Phone className="w-3 h-3 text-neutral-400" />
                        <span>{app.phone}</span>
                        {app.email && <span>• {app.email}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {app.status === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Menunggu Keputusan</span>
                      </span>
                    )}
                    {app.status === 'approved' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Kurir Disetujui</span>
                      </span>
                    )}
                    {app.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Ditolak</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs bg-neutral-50/80 p-3 rounded-xl border border-neutral-150">
                  <div>
                    <span className="text-neutral-500 text-[11px] block">Kendaraan Operasional:</span>
                    <div className="font-bold text-neutral-800 flex items-center gap-1.5 mt-0.5">
                      <Bike className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{app.vehicleType || 'Sepeda Motor'} — {app.vehicleInfo}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-neutral-500 text-[11px] block">Identitas / SIM:</span>
                    <span className="font-bold text-neutral-800 mt-0.5 block">
                      {app.driverLicenseNumber || 'Terdaftar via akun warga'}
                    </span>
                  </div>

                  {app.notes && (
                    <div className="sm:col-span-2 pt-1 border-t border-neutral-200/60">
                      <span className="text-neutral-500 text-[11px] block">Catatan Pengantaran:</span>
                      <p className="text-neutral-700 italic mt-0.5">"{app.notes}"</p>
                    </div>
                  )}

                  {app.rejectionReason && (
                    <div className="sm:col-span-2 pt-1 border-t border-rose-200 text-rose-700">
                      <span className="text-rose-500 text-[11px] font-bold block">Alasan Penolakan:</span>
                      <p className="mt-0.5 font-medium">{app.rejectionReason}</p>
                    </div>
                  )}
                </div>

                {/* Footnote & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                  <span className="text-[11px] text-neutral-400">
                    Diajukan: {new Date(app.appliedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {app.reviewedBy && ` • Diverifikasi oleh: ${app.reviewedBy}`}
                  </span>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Direct WhatsApp Contact */}
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Chat WA</span>
                    </a>

                    {/* Approve / Reject Controls */}
                    {app.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedAppForReject(app);
                            setRejectModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Tolak</span>
                        </button>
                        <button
                          onClick={() => approveCourierApplication(app.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Setujui Jadi Kurir</span>
                        </button>
                      </>
                    )}

                    {app.status === 'approved' && (
                      <button
                        onClick={() => {
                          setSelectedAppForReject(app);
                          setRejectModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-xs font-bold transition cursor-pointer"
                      >
                        Cabut Akses Kurir
                      </button>
                    )}

                    {app.status === 'rejected' && (
                      <button
                        onClick={() => approveCourierApplication(app.id)}
                        className="px-3 py-1.5 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-bold transition cursor-pointer"
                      >
                        Tinjau Ulang & Setujui
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Reason Modal */}
      {rejectModalOpen && selectedAppForReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-neutral-100">
            <div className="flex items-center gap-2.5 text-rose-700">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-base font-extrabold text-neutral-900">
                Tolak Pendaftaran Kurir
              </h3>
            </div>

            <p className="text-xs text-neutral-600">
              Berikan alasan penolakan untuk pendaftar <strong>{selectedAppForReject.name}</strong>. Keterangan ini akan ditampilkan pada akun pemohon.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Alasan Penolakan *
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectReasonInput}
                  onChange={(e) => setRejectReasonInput(e.target.value)}
                  placeholder="Contoh: Kuota kurir wilayah Dusun tersebut sudah penuh, atau data kendaraan belum lengkap."
                  className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-800 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectModalOpen(false);
                    setSelectedAppForReject(null);
                    setRejectReasonInput('');
                  }}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition"
                >
                  Konfirmasi Tolak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
