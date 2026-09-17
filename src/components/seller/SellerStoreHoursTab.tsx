import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Coffee,
  CheckCircle2,
  AlertCircle,
  Save,
  Sun,
  Moon,
  Store as StoreIcon,
  Sparkles,
  Info,
  Power,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Store } from '../../types';
import {
  checkStoreOpenStatus,
  ALL_DAYS_ORDERED,
} from '../../utils/storeHours';
import { createSlug } from '../../utils/seo';

export const SellerStoreHoursTab: React.FC = () => {
  const { currentUser, stores, updateStore, addNotification } = useApp();

  // Find seller's store or fallback to default structure
  const sellerStore =
    stores.find(
      (s) =>
        s.sellerId === currentUser?.id ||
        s.id === currentUser?.storeId ||
        s.name === currentUser?.shopName
    ) || (currentUser?.role === 'admin' ? stores[0] : null);

  // Form states
  const [openTime, setOpenTime] = useState<string>('06:00');
  const [closeTime, setCloseTime] = useState<string>('21:00');
  const [isEveryday, setIsEveryday] = useState<boolean>(true);
  const [selectedClosedDays, setSelectedClosedDays] = useState<string[]>([]);
  const [isManuallyClosed, setIsManuallyClosed] = useState<boolean>(false);
  const [manualCloseReason, setManualCloseReason] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Initialize from store data on mount or when store changes
  useEffect(() => {
    if (sellerStore) {
      // Parse open and close times
      if (sellerStore.openTime) {
        setOpenTime(sellerStore.openTime);
      } else if (sellerStore.openingHours) {
        const match = sellerStore.openingHours.match(/(\d{1,2})[:.](\d{2})\s*[-–]\s*(\d{1,2})[:.](\d{2})/);
        if (match) {
          setOpenTime(`${match[1].padStart(2, '0')}:${match[2].padStart(2, '0')}`);
          setCloseTime(`${match[3].padStart(2, '0')}:${match[4].padStart(2, '0')}`);
        }
      }

      if (sellerStore.closeTime) {
        setCloseTime(sellerStore.closeTime);
      }

      // Parse closed days
      const closed = (sellerStore.closedDays || 'Buka Setiap Hari').trim();
      const isDaily =
        closed.toLowerCase() === 'buka setiap hari' ||
        closed.toLowerCase() === 'tidak ada' ||
        closed === '-' ||
        closed === '';

      setIsEveryday(isDaily);

      if (!isDaily) {
        const days = closed
          .split(/[,;/+&]|dan/i)
          .map((d) => d.trim())
          .filter((d) => ALL_DAYS_ORDERED.some((ad) => ad.toLowerCase() === d.toLowerCase()))
          .map((d) => {
            const matched = ALL_DAYS_ORDERED.find((ad) => ad.toLowerCase() === d.toLowerCase());
            return matched || d;
          });
        setSelectedClosedDays(days);
      } else {
        setSelectedClosedDays([]);
      }

      // Manual closure
      setIsManuallyClosed(Boolean(sellerStore.isManuallyClosed));
      setManualCloseReason(sellerStore.manualCloseReason || '');
    }
  }, [sellerStore]);

  // Compute live preview of the store with current form values
  const closedDaysString = isEveryday || selectedClosedDays.length === 0
    ? 'Buka Setiap Hari'
    : selectedClosedDays.join(', ');

  const openingHoursString = `${openTime} - ${closeTime} WIB`;

  const previewStore: Store = {
    ...(sellerStore || {
      id: currentUser?.storeId || `store-${currentUser?.id || 'demo'}`,
      sellerId: currentUser?.id || 'seller-1',
      name: currentUser?.shopName || currentUser?.name || 'Lapak Warga Desa',
      slug: createSlug(currentUser?.shopName || 'lapak-warga'),
      description: 'Lapak resmi UMKM warga desa',
      dusun: currentUser?.dusun || 'Dusun Krajan',
      address: currentUser?.address || 'Desa Mekar Terus',
      whatsapp: currentUser?.phone || '081234567890',
      logoUrl: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200',
      isVerified: true,
      createdAt: new Date().toISOString(),
    }),
    openTime,
    closeTime,
    openingHours: openingHoursString,
    closedDays: closedDaysString,
    isManuallyClosed,
    manualCloseReason: isManuallyClosed ? manualCloseReason.trim() : undefined,
  };

  const liveStatus = checkStoreOpenStatus(previewStore);

  const toggleDaySelection = (day: string) => {
    setSelectedClosedDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMessage(null);

    try {
      const targetStore: Store = {
        ...(sellerStore || {
          id: currentUser?.storeId || `store-${currentUser?.id || Date.now()}`,
          sellerId: currentUser?.id || 'seller-1',
          name: currentUser?.shopName || currentUser?.name || 'Lapak Warga Desa',
          slug: createSlug(currentUser?.shopName || 'lapak-warga'),
          description: 'Lapak resmi UMKM warga desa',
          dusun: currentUser?.dusun || 'Dusun Krajan',
          address: currentUser?.address || 'Desa Mekar Terus',
          whatsapp: currentUser?.phone || '081234567890',
          logoUrl: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200',
          isVerified: true,
          createdAt: new Date().toISOString(),
        }),
        openTime,
        closeTime,
        openingHours: openingHoursString,
        closedDays: closedDaysString,
        isManuallyClosed,
        manualCloseReason: isManuallyClosed ? manualCloseReason.trim() : undefined,
        updatedAt: new Date().toISOString(),
      };

      updateStore(targetStore);

      addNotification({
        title: 'Jadwal Lapak Disimpan ⏰',
        message: `Jam operasional ${openingHoursString} dan status libur (${closedDaysString}) berhasil diperbarui.`,
        type: 'success',
      });

      setSaveSuccessMessage('Pengaturan waktu buka, tutup, dan hari libur lapak berhasil disimpan!');
      setTimeout(() => setSaveSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Gagal menyimpan jadwal lapak:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Info & Live Status Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
          <Clock className="w-56 h-56 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold tracking-wide backdrop-blur-xs">
                Pengaturan Operasional Lapak
              </span>
              <span className="text-emerald-300 text-xs font-semibold">
                • {sellerStore?.name || currentUser?.shopName || 'Lapak Desa'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Waktu Buka, Tutup & Hari Libur Lapak
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
              Atur jam buka setiap hari dan tentukan hari libur rutin atau tutup sementara. Pembeli di Pasar Desa akan melihat status kesiapan lapak Anda secara otomatis.
            </p>
          </div>

          {/* Current Live Badge Box */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0 text-right md:text-left space-y-1">
            <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
              Status Lapak Anda Sekarang
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-xl text-xs font-black shadow-xs ${liveStatus.badgeBg} ${liveStatus.badgeText} border ${liveStatus.badgeBorder}`}>
                {liveStatus.statusText}
              </span>
              <span className="text-sm font-black text-white">
                {liveStatus.displayText}
              </span>
            </div>
            <div className="text-[11px] text-emerald-100">
              Jam Operasional: <strong>{openingHoursString}</strong>
            </div>
            <div className="text-[11px] text-emerald-200">
              Jadwal Libur: <strong>{closedDaysString}</strong>
            </div>
          </div>
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* Section 1: Jam Buka & Jam Tutup (Jam Operasional) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-neutral-900">
                  1. Jam Buka & Tutup Harian
                </h3>
                <p className="text-xs text-neutral-500">
                  Tentukan jam mulai melayani dan jam selesai transaksi setiap harinya
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-bold rounded-xl">
              Format: {openingHoursString}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Jam Buka */}
            <div className="bg-amber-50/40 rounded-2xl p-4 border border-amber-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-600" />
                  <span>Jam Buka Lapak *</span>
                </label>
                <span className="text-[11px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-lg">
                  {openTime} WIB
                </span>
              </div>

              <input
                id="seller-open-time-input"
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                required
                className="w-full text-base sm:text-lg font-black text-neutral-900 p-2.5 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />

              {/* Preset buttons */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-neutral-500">Pilihan Cepat Waktu Buka:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { time: '05:00', label: '05:00 (Subuh)' },
                    { time: '06:00', label: '06:00 (Pagi)' },
                    { time: '07:00', label: '07:00 (Pagi)' },
                    { time: '08:00', label: '08:00 (Pagi Santai)' },
                  ].map((preset) => (
                    <button
                      key={preset.time}
                      type="button"
                      onClick={() => setOpenTime(preset.time)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                        openTime === preset.time
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white hover:bg-amber-100 text-neutral-700 border border-neutral-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Jam Tutup */}
            <div className="bg-indigo-50/40 rounded-2xl p-4 border border-indigo-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span>Jam Tutup Lapak *</span>
                </label>
                <span className="text-[11px] text-indigo-800 font-bold bg-indigo-100 px-2 py-0.5 rounded-lg">
                  {closeTime} WIB
                </span>
              </div>

              <input
                id="seller-close-time-input"
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                required
                className="w-full text-base sm:text-lg font-black text-neutral-900 p-2.5 bg-white border border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />

              {/* Preset buttons */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-neutral-500">Pilihan Cepat Waktu Tutup:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { time: '17:00', label: '17:00 (Sore)' },
                    { time: '18:00', label: '18:00 (Maghrib)' },
                    { time: '20:00', label: '20:00 (Malam)' },
                    { time: '21:00', label: '21:00 (Malam)' },
                    { time: '22:00', label: '22:00 (Larut)' },
                  ].map((preset) => (
                    <button
                      key={preset.time}
                      type="button"
                      onClick={() => setCloseTime(preset.time)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                        closeTime === preset.time
                          ? 'bg-indigo-700 text-white shadow-xs'
                          : 'bg-white hover:bg-indigo-100 text-neutral-700 border border-neutral-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Pengaturan Hari Libur Mingguan */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-neutral-900">
                  2. Pengaturan Hari Libur Lapak
                </h3>
                <p className="text-xs text-neutral-500">
                  Tentukan apakah lapak Anda buka setiap hari atau memiliki hari libur rutin mingguan
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => {
                setIsEveryday(true);
                setSelectedClosedDays([]);
              }}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
                isEveryday
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                  : 'border-neutral-200 hover:border-neutral-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="schedule_type"
                checked={isEveryday}
                onChange={() => {
                  setIsEveryday(true);
                  setSelectedClosedDays([]);
                }}
                className="mt-1 w-4 h-4 text-emerald-600 cursor-pointer"
              />
              <div>
                <div className="font-extrabold text-sm text-neutral-900">
                  🟢 Buka Setiap Hari
                </div>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                  Lapak siap menerima pesanan warga 7 hari seminggu (Senin s/d Minggu) tanpa libur rutin.
                </p>
              </div>
            </div>

            <div
              onClick={() => {
                setIsEveryday(false);
                if (selectedClosedDays.length === 0) {
                  setSelectedClosedDays(['Minggu']);
                }
              }}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
                !isEveryday
                  ? 'border-red-500 bg-red-50/60 shadow-xs'
                  : 'border-neutral-200 hover:border-neutral-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="schedule_type"
                checked={!isEveryday}
                onChange={() => {
                  setIsEveryday(false);
                  if (selectedClosedDays.length === 0) {
                    setSelectedClosedDays(['Minggu']);
                  }
                }}
                className="mt-1 w-4 h-4 text-red-600 cursor-pointer"
              />
              <div>
                <div className="font-extrabold text-sm text-neutral-900">
                  🔴 Tentukan Hari Libur Mingguan
                </div>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                  Pilih hari tertentu saat lapak tutup rutin (misal: Hari Jumat atau Hari Minggu).
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Day Selector (Only shown if not everyday) */}
          {!isEveryday && (
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-neutral-800">
                  Pilih Hari Libur Rutin Anda:
                </span>
                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-lg">
                  {selectedClosedDays.length > 0
                    ? `Libur: ${selectedClosedDays.join(', ')}`
                    : 'Belum memilih hari libur'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {ALL_DAYS_ORDERED.map((day) => {
                  const isSelected = selectedClosedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDaySelection(day)}
                      className={`p-2.5 rounded-xl text-xs font-black transition flex flex-col items-center justify-center gap-1 cursor-pointer border ${
                        isSelected
                          ? 'bg-red-600 text-white border-red-700 shadow-xs'
                          : 'bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-300'
                      }`}
                    >
                      <span>{day}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          isSelected ? 'bg-red-800 text-white' : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {isSelected ? 'Libur' : 'Buka'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-neutral-500 pt-1">
                <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>
                  Klik nama hari untuk menandai libur. Hari yang berwarna merah menandakan lapak Anda tutup pada hari tersebut.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Tutup Lapak Sementara (Darurat / Istirahat / Acara Khusus) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-neutral-900">
                  3. Mode Tutup Lapak Sementara (Libur Khusus)
                </h3>
                <p className="text-xs text-neutral-500">
                  Gunakan jika hari ini Anda sedang ada hajatan warga, istirahat, atau keperluan mendadak
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="manual-close-toggle"
                type="checkbox"
                checked={isManuallyClosed}
                onChange={(e) => setIsManuallyClosed(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-neutral-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          <div
            className={`p-4 rounded-2xl border transition ${
              isManuallyClosed
                ? 'bg-rose-50/70 border-rose-300'
                : 'bg-neutral-50 border-neutral-200 text-neutral-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="font-bold text-xs sm:text-sm text-neutral-900 flex items-center gap-2">
                <Power className={`w-4 h-4 ${isManuallyClosed ? 'text-rose-600' : 'text-neutral-400'}`} />
                <span>
                  Status Tutup Sementara:{' '}
                  <strong className={isManuallyClosed ? 'text-rose-700' : 'text-emerald-700'}>
                    {isManuallyClosed ? 'AKTIF (Lapak Tutup Sementara)' : 'NONAKTIF (Mengikuti Jadwal Normal)'}
                  </strong>
                </span>
              </div>
            </div>

            {isManuallyClosed && (
              <div className="mt-3 space-y-2 animate-in fade-in duration-150">
                <label className="text-xs font-bold text-neutral-700 block">
                  Alasan Tutup Sementara (Akan ditampilkan kepada pembeli):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Sedang ada hajatan warga / istirahat sebentar, buka lagi sore"
                  value={manualCloseReason}
                  onChange={(e) => setManualCloseReason(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 bg-white border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />

                {/* Quick reason suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    'Sedang ada acara keluarga / hajatan desa',
                    'Istirahat sebentar, buka kembali sore',
                    'Sedang belanja stok barang ke pasar induk',
                    'Stok hari ini habis, buka besok pagi',
                  ].map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setManualCloseReason(reason)}
                      className="px-2 py-0.5 bg-white hover:bg-rose-100 text-neutral-700 text-[10px] font-bold rounded-lg border border-neutral-300 transition"
                    >
                      + {reason}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Live Customer Preview */}
        <div className="bg-neutral-50 rounded-3xl p-5 border border-neutral-200 space-y-2">
          <div className="flex items-center gap-2 text-neutral-700 font-extrabold text-xs">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Simulasi Tampilan di Layar Pembeli Pasar Desa:</span>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                <StoreIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-xs sm:text-sm text-neutral-900">
                  {sellerStore?.name || currentUser?.shopName || 'Lapak Warga Desa'}
                </div>
                <div className="text-[11px] text-neutral-500">
                  Jam Buka: <strong className="text-neutral-800">{openingHoursString}</strong> • Hari Libur:{' '}
                  <strong className="text-neutral-800">{closedDaysString}</strong>
                </div>
              </div>
            </div>

            <div>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black shadow-xs ${liveStatus.badgeBg} ${liveStatus.badgeText} border ${liveStatus.badgeBorder}`}>
                {liveStatus.displayText}
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            id="save-seller-hours-btn"
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan Pengaturan...' : 'Simpan Pengaturan Waktu & Libur Lapak'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
