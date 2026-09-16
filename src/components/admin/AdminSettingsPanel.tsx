import React, { useState } from 'react';
import { Settings as SettingsIcon, KeyRound, Eye, EyeOff, ShieldCheck, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminSettingsPanel: React.FC = () => {
  const { settings, updateSettings, resetToDefaults } = useApp();

  const [villageNameInput, setVillageNameInput] = useState(settings.villageName);
  const [bumdesNameInput, setBumdesNameInput] = useState(settings.bumdesName);
  const [deliveryFeeInput, setDeliveryFeeInput] = useState(settings.deliveryFeeStandard);
  const [emergencyInput, setEmergencyInput] = useState(settings.emergencyContact);
  const [adminAuthCodeInput, setAdminAuthCodeInput] = useState(settings.adminAuthCode || 'DESA2025');
  const [showAuthCode, setShowAuthCode] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      villageName: villageNameInput,
      bumdesName: bumdesNameInput,
      deliveryFeeStandard: deliveryFeeInput,
      emergencyContact: emergencyInput,
      adminAuthCode: adminAuthCodeInput.trim().toUpperCase(),
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  return (
    <div id="admin-settings-panel" className="bg-white rounded-3xl border border-neutral-200 p-5 sm:p-6 shadow-xs max-w-xl space-y-4 animate-in fade-in">
      <div>
        <h2 className="font-extrabold text-base text-neutral-900 flex items-center gap-2">
          <SettingsIcon className="w-4 h-4 text-emerald-700" />
          Pengaturan Sistem Pasar Desa
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Kelola nama desa, lembaga BUMDes, tarif flat kurir desa, dan keamanan pendaftaran admin.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
        <div>
          <label className="font-bold text-neutral-700 block mb-1">Nama Desa</label>
          <input
            type="text"
            value={villageNameInput}
            onChange={(e) => setVillageNameInput(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="font-bold text-neutral-700 block mb-1">Nama BUMDes</label>
          <input
            type="text"
            value={bumdesNameInput}
            onChange={(e) => setBumdesNameInput(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-neutral-700 block mb-1">Ongkir Flat Kurir Desa (Rp)</label>
            <input
              type="number"
              step={500}
              value={deliveryFeeInput}
              onChange={(e) => setDeliveryFeeInput(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="font-bold text-neutral-700 block mb-1">Kontak Darurat / BUMDes</label>
            <input
              type="text"
              value={emergencyInput}
              onChange={(e) => setEmergencyInput(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>Kode Otorisasi Pendaftaran Admin Desa & BUMDes</span>
            </label>
            <button
              type="button"
              onClick={() => setShowAuthCode(!showAuthCode)}
              className="text-amber-700 hover:text-amber-900 text-[11px] font-bold flex items-center gap-1"
            >
              {showAuthCode ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Sembunyikan</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Kode</span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <input
              id="admin-auth-code-input"
              type={showAuthCode ? 'text' : 'password'}
              required
              value={adminAuthCodeInput}
              onChange={(e) => setAdminAuthCodeInput(e.target.value.toUpperCase())}
              placeholder="Misal: DESA2025"
              className="w-full p-2.5 rounded-xl border border-amber-300 bg-white font-mono uppercase tracking-widest text-xs font-bold text-amber-950 focus:ring-2 focus:ring-amber-200 outline-none"
            />
          </div>

          <p className="text-[11px] text-amber-800 leading-relaxed">
            Kode rahasia ini digunakan oleh staf BUMDes saat mendaftar akun baru dengan peran <strong>Admin Desa</strong> agar permohonan dapat masuk ke antrean verifikasi.
          </p>
          <div className="pt-2 border-t border-amber-200/80 flex items-start gap-2 text-[11px] text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              <strong>Persetujuan Berlapis Aktif:</strong> Pendaftaran tetap memerlukan persetujuan manual di tab <strong>Persetujuan Admin</strong> sebelum saldo kas dan data desa dapat diakses.
            </span>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md transition"
          >
            Simpan Pengaturan
          </button>
          {settingsSaved && (
            <span className="text-xs text-emerald-700 font-bold">✓ Berhasil disimpan!</span>
          )}
        </div>
      </form>

      {/* Reset Demo Data Button */}
      <div className="pt-5 border-t border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-xs text-neutral-900">Reset Data Demo</div>
            <div className="text-[11px] text-neutral-500">
              Kembalikan produk, lapak, berita, dan toko ke data awal.
            </div>
          </div>
          <button
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke kondisi awal?')) {
                resetToDefaults();
                alert('Data berhasil di-reset!');
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-100 hover:bg-red-50 text-neutral-700 hover:text-red-700 text-xs font-bold rounded-xl border border-neutral-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
