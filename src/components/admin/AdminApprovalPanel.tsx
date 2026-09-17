import React, { useState } from 'react';
import {
  ShieldAlert,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  MessageCircle,
  Phone,
  Sparkles,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminApprovalRequest } from '../../types';

export const AdminApprovalPanel: React.FC = () => {
  const {
    currentUser,
    adminApprovals,
    approveAdminRequest,
    rejectAdminRequest,
    revokeAdminAccess,
    refreshAdminStatus,
    settings,
  } = useApp();

  const [approvalFilter, setApprovalFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [approvalSearch, setApprovalSearch] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedReqForReject, setSelectedReqForReject] = useState<AdminApprovalRequest | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [selectedReqForRevoke, setSelectedReqForRevoke] = useState<AdminApprovalRequest | null>(null);
  const [revokeReasonInput, setRevokeReasonInput] = useState('');
  const [isSubmittingRevoke, setIsSubmittingRevoke] = useState(false);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [statusRefreshMessage, setStatusRefreshMessage] = useState<string | null>(null);

  const handleRefreshClick = async () => {
    setIsRefreshingStatus(true);
    setStatusRefreshMessage(null);
    try {
      await refreshAdminStatus();
      setStatusRefreshMessage('Data permohonan admin berhasil disinkronkan dengan Cloud Firestore.');
      setTimeout(() => setStatusRefreshMessage(null), 4000);
    } catch {
      setStatusRefreshMessage('Gagal memperbarui data dari Cloud.');
    } finally {
      setIsRefreshingStatus(false);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqForReject || !rejectReasonInput.trim()) return;
    await rejectAdminRequest(selectedReqForReject.id, rejectReasonInput.trim());
    setRejectModalOpen(false);
    setSelectedReqForReject(null);
    setRejectReasonInput('');
  };

  const filteredApprovals = adminApprovals
    .filter((req) => {
      if (approvalFilter === 'all') return true;
      return req.status === approvalFilter;
    })
    .filter((req) => {
      if (!approvalSearch.trim()) return true;
      const q = approvalSearch.toLowerCase();
      return (
        (req.name && req.name.toLowerCase().includes(q)) ||
        (req.position && req.position.toLowerCase().includes(q)) ||
        (req.dusun && req.dusun.toLowerCase().includes(q)) ||
        (req.phone && req.phone.includes(q)) ||
        (req.email && req.email.toLowerCase().includes(q))
      );
    });

  const pendingCount = adminApprovals.filter((a) => a.status === 'pending').length;
  const approvedCount = adminApprovals.filter((a) => a.status === 'approved').length;
  const rejectedCount = adminApprovals.filter((a) => a.status === 'rejected').length;

  return (
    <div id="admin-approval-panel" className="space-y-5 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-neutral-900 text-white p-5 sm:p-6 rounded-3xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center font-bold shadow-sm shrink-0">
              <ShieldAlert className="w-6 h-6 text-amber-950" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                Protokol Keamanan Kas & Data Desa
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Persetujuan Manual (Approval Flow) Akun Admin
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isRefreshingStatus}
              onClick={handleRefreshClick}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingStatus ? 'animate-spin' : ''}`} />
              <span>Perbarui Data</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-emerald-100/90 leading-relaxed max-w-3xl">
          Hanya pendaftaran akun <strong>Admin Desa</strong> yang melewati alur persetujuan manual ini. Akun yang baru mendaftar tidak dapat melihat atau mengubah saldo kas BUMDes dan data warga sebelum disetujui satu per satu di panel kendali ini.
        </p>

        {statusRefreshMessage && (
          <div className="p-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-emerald-200">
            {statusRefreshMessage}
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex justify-between items-center text-xs text-neutral-500 font-bold">
            <span>Total Permohonan</span>
            <Users className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900 mt-2">
            {adminApprovals.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Semua berkas masuk</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-amber-300 shadow-xs bg-amber-50/30">
          <div className="flex justify-between items-center text-xs text-amber-800 font-bold">
            <span>Menunggu Persetujuan</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 mt-2 flex items-center gap-2">
            {pendingCount}
            {pendingCount > 0 && (
              <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
                Perlu Tindakan
              </span>
            )}
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5">Menanti verifikasi desa</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex justify-between items-center text-xs text-emerald-700 font-bold">
            <span>Disetujui Aktif</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800 mt-2">
            {approvedCount}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Memiliki akses admin</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex justify-between items-center text-xs text-rose-700 font-bold">
            <span>Ditolak / Dicabut</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-800 mt-2">
            {rejectedCount}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Akses ditolak/dinonaktifkan</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'all', label: 'Semua Status' },
              { id: 'pending', label: `Menunggu (${pendingCount})` },
              { id: 'approved', label: `Disetujui (${approvedCount})` },
              { id: 'rejected', label: `Ditolak (${rejectedCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setApprovalFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                approvalFilter === tab.id
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
            placeholder="Cari nama pemohon, dusun, WA..."
            value={approvalSearch}
            onChange={(e) => setApprovalSearch(e.target.value)}
            className="pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl w-full sm:w-64 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
        </div>
      </div>

      {/* List of Approval Requests */}
      {filteredApprovals.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-neutral-200 space-y-2">
          <ShieldAlert className="w-12 h-12 text-neutral-300 mx-auto" />
          <h3 className="font-bold text-neutral-800 text-sm">Tidak Ada Permohonan Ditemukan</h3>
          <p className="text-neutral-500 text-xs max-w-sm mx-auto">
            {approvalSearch
              ? `Tidak ada pemohon dengan kata kunci "${approvalSearch}".`
              : 'Belum ada berkas pendaftaran akun admin pada filter ini.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApprovals.map((req) => {
            const isSuperAdminCandidate = req.email.toLowerCase() === 'yth.abdurrohman@gmail.com';
            const cleanPhone = (req.phone || '').replace(/[^0-9]/g, '');

            return (
              <div
                key={req.id}
                className={`bg-white rounded-3xl p-5 border transition shadow-xs ${
                  req.status === 'pending'
                    ? 'border-amber-300 ring-2 ring-amber-100'
                    : req.status === 'approved'
                    ? 'border-emerald-200'
                    : 'border-neutral-200 opacity-80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          req.status === 'pending'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : req.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}
                      >
                        {req.status === 'pending' && 'Menunggu Verifikasi'}
                        {req.status === 'approved' && 'Telah Disetujui (Aktif)'}
                        {req.status === 'rejected' && 'Ditolak / Dinonaktifkan'}
                      </span>

                      {isSuperAdminCandidate && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-700" />
                          Super Admin Utama
                        </span>
                      )}

                      <span className="text-neutral-400 text-[11px]">
                        Diajukan:{' '}
                        {new Date(req.requestedAt).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-black text-neutral-900">
                          {req.name}
                        </h3>
                        <p className="text-xs font-semibold text-emerald-700">
                          {req.position || 'Pengurus Desa / BUMDes'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                      <div className="flex items-center gap-1.5 text-neutral-600">
                        <span className="font-semibold text-neutral-800">Dusun:</span>
                        <span>{req.dusun}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-neutral-600">
                        <span className="font-semibold text-neutral-800">WhatsApp:</span>
                        <a
                          href={`https://wa.me/${cleanPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 hover:underline flex items-center gap-1 font-mono"
                        >
                          <Phone className="w-3 h-3" />
                          {req.phone}
                        </a>
                      </div>

                      <div className="flex items-center gap-1.5 text-neutral-600 truncate">
                        <span className="font-semibold text-neutral-800">Email:</span>
                        <span className="truncate">{req.email}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs text-neutral-700 space-y-1">
                      <span className="font-bold text-neutral-900 block text-[11px] uppercase tracking-wider">
                        Alasan & Kebutuhan Akses Administrasi:
                      </span>
                      <p className="italic text-neutral-600">
                        "{req.reason || 'Mengelola operasional pasar desa dan katalog sembako UMKM warga.'}"
                      </p>
                    </div>

                    {req.status === 'approved' && req.reviewedBy && (
                      <div className="text-[11px] text-emerald-800 flex items-center gap-1.5 pt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          Disetujui oleh <strong>{req.reviewedBy}</strong> pada{' '}
                          {req.reviewedAt
                            ? new Date(req.reviewedAt).toLocaleString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '-'}
                        </span>
                      </div>
                    )}

                    {req.status === 'rejected' && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
                        <span className="font-bold block">Alasan Penolakan Resmi:</span>
                        <p className="italic">
                          "{req.rejectionReason || 'Tidak memenuhi kualifikasi perangkat atau pengurus desa.'}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-between gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                        `Halo ${req.name}, kami dari Kantor BUMDes / Pengurus ${settings.villageName} ingin mengonfirmasi permohonan pendaftaran akun Admin Pasar Desa Anda.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-xs shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Chat WhatsApp Pemohon</span>
                    </a>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      {req.status === 'pending' && (
                        <>
                          <button
                            id={`reject-btn-${req.id}`}
                            type="button"
                            onClick={() => {
                              setSelectedReqForReject(req);
                              setRejectReasonInput('');
                              setRejectModalOpen(true);
                            }}
                            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-xl font-bold flex items-center gap-1.5 transition text-xs"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>

                          <button
                            id={`approve-btn-${req.id}`}
                            type="button"
                            onClick={() => approveAdminRequest(req.id)}
                            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition text-xs"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Setujui Akun Admin</span>
                          </button>
                        </>
                      )}

                      {req.status === 'approved' && (
                        <button
                          id={`revoke-btn-${req.id}`}
                          type="button"
                          onClick={() => {
                            setSelectedReqForRevoke(req);
                            setRevokeReasonInput('Hak akses admin dicabut oleh Administrator Utama Desa.');
                            setRevokeModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl font-bold flex items-center gap-1.5 transition text-[11px] cursor-pointer"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Cabut Hak Akses</span>
                        </button>
                      )}

                      {req.status === 'rejected' && (
                        <button
                          type="button"
                          onClick={() => approveAdminRequest(req.id)}
                          className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl font-bold flex items-center gap-1.5 transition text-[11px]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Tinjau Ulang & Berikan Akses</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Helpful Demo Guide Note */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-extrabold block text-emerald-900">
            Uji Coba Alur Pendaftaran Admin Baru:
          </span>
          <p className="text-emerald-800 leading-relaxed text-[11px]">
            Untuk mensimulasikan pendaftaran admin baru: Klik tombol <strong>"Keluar / Masuk Warga"</strong> di bilah atas, pilih tab <strong>"Daftar Akun Baru"</strong>, lalu pilih peran <strong>"Admin Desa"</strong>. Isi nama, nomor WhatsApp, jabatan dan alasan kebutuhan akses. Setelah diajukan, akun tersebut akan langsung berstatus <em>Menunggu Persetujuan</em> dan terdaftar di tabel permohonan ini secara real-time.
          </p>
        </div>
      </div>

      {/* Modal Penolakan Permohonan Admin */}
      {rejectModalOpen && selectedReqForReject && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto animate-in fade-in"
          onClick={() => setRejectModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-neutral-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2 text-rose-700">
                <ShieldAlert className="w-5 h-5" />
                <h2 className="text-base font-extrabold text-neutral-900">
                  Tolak Permohonan Akun Admin
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-950 space-y-1">
              <span className="font-bold block">Pemohon:</span>
              <p className="font-extrabold text-neutral-900 text-sm">
                {selectedReqForReject.name}{' '}
                <span className="font-normal text-xs text-neutral-600">
                  ({selectedReqForReject.position || 'Pengurus Desa'})
                </span>
              </p>
              <p className="text-[11px] text-neutral-500">
                {selectedReqForReject.dusun} • {selectedReqForReject.phone}
              </p>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Pilih Opsi Alasan Cepat:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Bukan pengurus atau perangkat desa aktif',
                    'Data identitas KTP belum dapat diverifikasi',
                    'Sudah ada perwakilan pengurus untuk unit BUMDes ini',
                    'Harap konfirmasi langsung ke Kantor Kepala Desa',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectReasonInput(preset)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-medium transition text-left"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Keterangan Alasan Penolakan Resmi *
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectReasonInput}
                  onChange={(e) => setRejectReasonInput(e.target.value)}
                  placeholder="Tuliskan catatan alasan penolakan secara jelas dan santun..."
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-rose-200 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2.5 border border-neutral-300 rounded-xl font-bold text-neutral-700 hover:bg-neutral-100"
                >
                  Batal
                </button>
                <button
                  id="confirm-reject-admin-btn"
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Konfirmasi Tolak Akses</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog Cabut Hak Akses Admin (In-App Modal Tanpa window.confirm) */}
      {revokeModalOpen && selectedReqForRevoke && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-neutral-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-neutral-900">Cabut Hak Akses Admin</h3>
                <p className="text-xs text-neutral-500">Konfirmasi pencabutan wewenang kelola desa</p>
              </div>
            </div>

            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-1">
              <p className="text-xs font-bold text-neutral-800">
                {selectedReqForRevoke.name}{' '}
                <span className="text-neutral-500 font-normal">
                  ({selectedReqForRevoke.position || 'Admin Desa'})
                </span>
              </p>
              <p className="text-[11px] text-neutral-500">
                {selectedReqForRevoke.dusun} • {selectedReqForRevoke.phone}
              </p>
            </div>

            <p className="text-xs text-neutral-700 leading-relaxed">
              Apakah Anda yakin ingin mencabut hak akses admin untuk akun ini? Setelah dicabut, akun tidak dapat lagi membuka panel admin desa dan wewenangnya dialihkan ke akun warga biasa.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Pilih Catatan / Alasan Cepat:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Masa tugas atau jabatan pengurus telah berakhir',
                    'Rotasi penugasan internal kantor desa / BUMDes',
                    'Permintaan penonaktifan dari yang bersangkutan',
                    'Pelanggaran kebijakan pengelolaan panel desa',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRevokeReasonInput(preset)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-medium transition text-left"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Catatan Alasan Pencabutan Hak Akses:
                </label>
                <textarea
                  rows={2}
                  value={revokeReasonInput}
                  onChange={(e) => setRevokeReasonInput(e.target.value)}
                  placeholder="Tuliskan catatan pencabutan..."
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-rose-200 outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmittingRevoke}
                  onClick={() => {
                    setRevokeModalOpen(false);
                    setSelectedReqForRevoke(null);
                  }}
                  className="px-4 py-2.5 border border-neutral-300 rounded-xl font-bold text-neutral-700 hover:bg-neutral-100 transition"
                >
                  Batal
                </button>
                <button
                  id="confirm-revoke-admin-action-btn"
                  type="button"
                  disabled={isSubmittingRevoke}
                  onClick={async () => {
                    setIsSubmittingRevoke(true);
                    try {
                      await revokeAdminAccess(
                        selectedReqForRevoke.userId,
                        revokeReasonInput.trim() || undefined
                      );
                      setRevokeModalOpen(false);
                      setSelectedReqForRevoke(null);
                    } finally {
                      setIsSubmittingRevoke(false);
                    }
                  }}
                  className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserX className="w-4 h-4" />
                  <span>{isSubmittingRevoke ? 'Mencabut Akses...' : 'Ya, Cabut Hak Akses'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
