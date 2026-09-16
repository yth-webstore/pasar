import React, { useState } from 'react';
import {
  X,
  Bike,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Phone,
  MapPin,
  FileText,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CourierApplicationModal: React.FC = () => {
  const {
    isCourierModalOpen,
    setIsCourierModalOpen,
    currentUser,
    applyCourier,
    setIsAuthModalOpen,
    settings,
  } = useApp();

  const [vehicleType, setVehicleType] = useState<string>('Sepeda Motor');
  const [vehicleInfo, setVehicleInfo] = useState<string>('');
  const [driverLicenseNumber, setDriverLicenseNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isCourierModalOpen) return null;

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-neutral-900">Perlu Masuk Terlebih Dahulu</h3>
          <p className="text-xs text-neutral-600">
            Anda harus memiliki akun dan masuk sebelum dapat mengajukan permohonan menjadi kurir desa.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setIsCourierModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                setIsCourierModalOpen(false);
                setIsAuthModalOpen(true);
              }}
              className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs"
            >
              Masuk / Daftar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!vehicleInfo.trim()) {
      setError('Keterangan kendaraan dan plat nomor wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      await applyCourier({
        vehicleType,
        vehicleInfo: vehicleInfo.trim(),
        driverLicenseNumber: driverLicenseNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Gagal mengirim pendaftaran kurir.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="courier-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
    >
      <div
        id="courier-modal-container"
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-100 animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-neutral-200/80 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-neutral-900 leading-tight">
                Pendaftaran Kurir Desa
              </h2>
              <p className="text-[11px] text-neutral-500">
                Mitra Resmi Pengantaran {settings.villageName}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsCourierModalOpen(false);
              setIsSuccess(false);
            }}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {isSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-black text-neutral-900">
                Pendaftaran Berhasil Dikirim!
              </h3>
              <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
                Terima kasih, <strong>{currentUser.name}</strong>. Permohonan Anda telah diteruskan ke Admin BUMDes {settings.villageName} untuk diverifikasi. Status kurir akan aktif setelah disetujui Admin.
              </p>
              <div className="pt-3">
                <button
                  onClick={() => {
                    setIsCourierModalOpen(false);
                    setIsSuccess(false);
                  }}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Selesai & Tutup
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Notice Info */}
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs text-blue-950 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Ketentuan & Persetujuan Admin Desa:</p>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Setelah Anda mendaftar, Admin BUMDes akan memeriksa kelengkapan data sebelum memberikan persetujuan akses pengantaran pesanan warga.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Applicant Profile (Prefilled) */}
              <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200/80 space-y-2">
                <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Data Pemohon Terdaftar
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-neutral-500 text-[11px] block">Nama Pemohon:</span>
                    <span className="font-bold text-neutral-900">{currentUser.name}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[11px] block">Nomor WhatsApp:</span>
                    <span className="font-bold text-neutral-900">{currentUser.phone}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-neutral-500 text-[11px] block">Dusun / Domisili:</span>
                    <span className="font-bold text-neutral-900">{currentUser.dusun}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Jenis Kendaraan Operasional *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Sepeda Motor', 'Sepeda Listrik', 'Bentor / Roda Tiga'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setVehicleType(type)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                        vehicleType === type
                          ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-2xs'
                          : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <Bike className="w-4 h-4 text-blue-600" />
                      <span className="text-center">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle Info & Plate Number */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Merek, Warna & Nomor Polisi Kendaraan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Honda Beat Hitam - AG 4567 DES"
                  value={vehicleInfo}
                  onChange={(e) => setVehicleInfo(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white text-xs text-neutral-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              {/* Driver License / ID */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Nomor SIM C atau KTP Pemohon (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 3507xxxxxxxxxxxx / SIM C Aktif"
                  value={driverLicenseNumber}
                  onChange={(e) => setDriverLicenseNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white text-xs text-neutral-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              {/* Notes or Experience */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Catatan / Pengalaman Pengantaran di Desa (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder={`Contoh: Siap siaga sore hari, hafal rute RT/RW wilayah ${settings.villageName}.`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white text-xs text-neutral-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sedang Mengirim Pendaftaran...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Kirim Pendaftaran Kurir ke Admin Desa</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
