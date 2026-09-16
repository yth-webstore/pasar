import { Store } from '../types';

export interface StoreOpeningStatus {
  isOpen: boolean;
  statusText: 'Buka' | 'Tutup' | 'Libur';
  colorClass: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  displayText: string;
  hoursDetail: string;
  holidayDetail: string;
}

const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function checkStoreOpenStatus(store: Store): StoreOpeningStatus {
  const openingHours = store.openingHours || '06:00 - 21:00 WIB';
  const closedDays = store.closedDays || 'Buka Setiap Hari';

  const now = new Date();
  const currentDayName = INDONESIAN_DAYS[now.getDay()];
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeVal = currentHour * 60 + currentMinute;

  // Check holiday/closed day
  const isHoliday =
    closedDays.toLowerCase() !== 'buka setiap hari' &&
    closedDays.toLowerCase() !== 'tidak ada' &&
    closedDays.toLowerCase().includes(currentDayName.toLowerCase());

  if (isHoliday) {
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

  // Parse open & close time from string like "06:00 - 21:00" or "06.00 - 21.00"
  let startMinutes = 6 * 60; // 06:00 default
  let endMinutes = 21 * 60; // 21:00 default

  const match = openingHours.match(/(\d{1,2})[:.](\d{2})\s*[-–]\s*(\d{1,2})[:.](\d{2})/);
  if (match) {
    startMinutes = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
    endMinutes = parseInt(match[3], 10) * 60 + parseInt(match[4], 10);
  }

  const isOpenNow = currentTimeVal >= startMinutes && currentTimeVal <= endMinutes;

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
    return {
      isOpen: false,
      statusText: 'Tutup',
      colorClass: 'text-amber-800',
      badgeBg: 'bg-amber-50',
      badgeBorder: 'border-amber-200',
      badgeText: 'text-amber-800',
      displayText: `⏰ Sedang Tutup (Buka: ${openingHours})`,
      hoursDetail: openingHours,
      holidayDetail: closedDays,
    };
  }
}
