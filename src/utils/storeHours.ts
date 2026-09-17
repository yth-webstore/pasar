import { Store } from '../types';

export interface StoreOpeningStatus {
  isOpen: boolean;
  statusText: 'Buka' | 'Tutup' | 'Libur' | 'Tutup Sementara';
  colorClass: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  displayText: string;
  hoursDetail: string;
  holidayDetail: string;
  reasonDetail?: string;
}

export const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const;

export const ALL_DAYS_ORDERED = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] as const;

/**
 * Checks whether the given store is currently open, closed for the night,
 * on scheduled weekly holiday, or manually temporarily closed.
 */
export function checkStoreOpenStatus(store?: Store | null): StoreOpeningStatus {
  if (!store) {
    return {
      isOpen: true,
      statusText: 'Buka',
      colorClass: 'text-emerald-700',
      badgeBg: 'bg-emerald-50',
      badgeBorder: 'border-emerald-200',
      badgeText: 'text-emerald-700',
      displayText: '🟢 Buka',
      hoursDetail: '06:00 - 21:00 WIB',
      holidayDetail: 'Buka Setiap Hari',
    };
  }

  const openTime = store.openTime || '06:00';
  const closeTime = store.closeTime || '21:00';
  const openingHours = store.openingHours || `${openTime} - ${closeTime} WIB`;
  const closedDays = (store.closedDays || 'Buka Setiap Hari').trim();

  // 1. Check if store is manually toggled closed by the seller
  if (store.isManuallyClosed) {
    const reason = store.manualCloseReason?.trim() || 'Tutup sementara oleh pelapak';
    return {
      isOpen: false,
      statusText: 'Tutup Sementara',
      colorClass: 'text-rose-700',
      badgeBg: 'bg-rose-50',
      badgeBorder: 'border-rose-200',
      badgeText: 'text-rose-700',
      displayText: `🛑 Tutup Sementara (${reason})`,
      hoursDetail: openingHours,
      holidayDetail: closedDays,
      reasonDetail: reason,
    };
  }

  const now = new Date();
  const currentDayName = INDONESIAN_DAYS[now.getDay()];
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeVal = currentHour * 60 + currentMinute;

  // 2. Check weekly holiday/closed day
  const isEveryday =
    closedDays.toLowerCase() === 'buka setiap hari' ||
    closedDays.toLowerCase() === 'tidak ada' ||
    closedDays.toLowerCase() === '-' ||
    closedDays.trim() === '';

  const closedDaysArray = isEveryday
    ? []
    : closedDays
        .split(/[,;/+&]|dan/i)
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean);

  const isTodayHoliday =
    !isEveryday &&
    (closedDaysArray.includes(currentDayName.toLowerCase()) ||
      closedDays.toLowerCase().includes(currentDayName.toLowerCase()));

  if (isTodayHoliday) {
    return {
      isOpen: false,
      statusText: 'Libur',
      colorClass: 'text-red-700',
      badgeBg: 'bg-red-50',
      badgeBorder: 'border-red-200',
      badgeText: 'text-red-700',
      displayText: `🔴 Sedang Libur (Hari ${currentDayName})`,
      hoursDetail: openingHours,
      holidayDetail: closedDays,
    };
  }

  // 3. Parse open & close time in minutes from midnight
  let startMinutes = 6 * 60; // 06:00
  let endMinutes = 21 * 60; // 21:00

  // Check store.openTime & store.closeTime first
  if (store.openTime && store.closeTime) {
    const [startH, startM] = store.openTime.split(':').map((n) => parseInt(n, 10) || 0);
    const [endH, endM] = store.closeTime.split(':').map((n) => parseInt(n, 10) || 0);
    startMinutes = startH * 60 + startM;
    endMinutes = endH * 60 + endM;
  } else {
    // Fallback parsing from openingHours string
    const match = openingHours.match(/(\d{1,2})[:.](\d{2})\s*[-–]\s*(\d{1,2})[:.](\d{2})/);
    if (match) {
      startMinutes = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
      endMinutes = parseInt(match[3], 10) * 60 + parseInt(match[4], 10);
    }
  }

  // Handle daytime hours (start < end) vs cross-midnight hours (start > end)
  let isOpenNow = false;
  if (startMinutes <= endMinutes) {
    isOpenNow = currentTimeVal >= startMinutes && currentTimeVal <= endMinutes;
  } else {
    // Crosses midnight, e.g. 18:00 to 02:00
    isOpenNow = currentTimeVal >= startMinutes || currentTimeVal <= endMinutes;
  }

  if (isOpenNow) {
    return {
      isOpen: true,
      statusText: 'Buka',
      colorClass: 'text-emerald-700',
      badgeBg: 'bg-emerald-50',
      badgeBorder: 'border-emerald-200',
      badgeText: 'text-emerald-700',
      displayText: `🟢 Sedang Buka (${openingHours})`,
      hoursDetail: openingHours,
      holidayDetail: closedDays,
    };
  } else {
    const nextOpenStr = store.openTime || '06:00';
    return {
      isOpen: false,
      statusText: 'Tutup',
      colorClass: 'text-amber-800',
      badgeBg: 'bg-amber-50',
      badgeBorder: 'border-amber-200',
      badgeText: 'text-amber-800',
      displayText: `⏰ Sedang Tutup (Buka: ${nextOpenStr} WIB)`,
      hoursDetail: openingHours,
      holidayDetail: closedDays,
    };
  }
}
