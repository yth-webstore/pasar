import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  UserRole,
  Product,
  Category,
  CartItem,
  Order,
  OrderStatus,
  Banner,
  VillageNews,
  VillageAd,
  VillageSettings,
  Review,
  AdminApprovalRequest,
  AdminApprovalStatus,
  Store,
  DeliveryStatus,
  HouseLandmark,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_STORES,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_BANNERS,
  INITIAL_NEWS,
  INITIAL_ADS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
  INITIAL_ADMIN_APPROVALS,
} from '../data/initialData';
import { updatePageSEO } from '../utils/seo';
import {
  auth,
  firebaseLoginUser,
  firebaseRegisterUser,
  firebaseGoogleSignIn,
  firebaseSignOut,
  fetchUserProfileFromFirestore,
  translateFirebaseError,
  saveUserProfileToFirestore,
  saveAdminApprovalToFirestore,
  fetchAdminApprovalsFromFirestore,
  updateAdminApprovalInFirestore,
  saveOrderToFirestore,
  fetchOrdersFromFirestore,
  saveStoreToFirestore,
  fetchStoresFromFirestore,
  createStoreInFirestore,
  rateCourierInFirestore,
  saveCourierApplicationToFirestore,
  fetchCourierApplicationsFromFirestore,
  updateCourierApplicationInFirestore,
} from '../lib/firebase';
import {
  CourierApplication,
  CourierApprovalStatus,
} from '../types';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  playCheckoutChime,
  playOrderCompleteChime,
  playNotificationChime,
  isAudioSoundEnabled,
  setAudioSoundEnabled,
} from '../utils/audioNotification';

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'checkout' | 'order_completed' | 'order_update' | 'info';
  timestamp: string;
  read: boolean;
}

interface AppContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthLoading: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  users: User[];
  stores: Store[];
  selectedStore: Store | null;
  selectedStoreId: string | null;
  activeCouriers: User[];
  courierApplications: CourierApplication[];
  pendingCourierCount: number;
  products: Product[];
  categories: Category[];
  banners: Banner[];
  news: VillageNews[];
  ads: VillageAd[];
  orders: Order[];
  cart: CartItem[];
  reviews: Review[];
  settings: VillageSettings;
  favorites: string[];
  activeTab: 'beranda' | 'kategori' | 'lapak' | 'keranjang' | 'pesanan' | 'profil' | 'admin' | 'seller' | 'courier' | 'toko';
  selectedCategory: string | null;
  searchQuery: string;
  searchHistory: string[];
  addSearchHistory: (query: string) => void;
  removeSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  selectedProduct: Product | null;
  selectedNews: VillageNews | null;
  isAuthModalOpen: boolean;
  isCheckoutModalOpen: boolean;
  isCartOpen: boolean;
  isSeoModalOpen: boolean;
  isCreateStoreModalOpen: boolean;
  isCourierModalOpen: boolean;
  sharingProduct: Product | null;
  isShareModalOpen: boolean;
  dataSaverMode: boolean;
  
  // Setters
  setActiveTab: (tab: 'beranda' | 'kategori' | 'lapak' | 'keranjang' | 'pesanan' | 'profil' | 'admin' | 'seller' | 'courier' | 'toko') => void;
  setSelectedStore: (store: Store | null) => void;
  setSelectedStoreId: (id: string | null) => void;
  setSelectedCategory: (catId: string | null) => void;
  setSearchQuery: (q: string) => void;
  setSelectedProduct: (p: Product | null) => void;
  setSelectedNews: (n: VillageNews | null) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsCheckoutModalOpen: (open: boolean) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsSeoModalOpen: (open: boolean) => void;
  setIsCreateStoreModalOpen: (open: boolean) => void;
  setIsCourierModalOpen: (open: boolean) => void;
  setSharingProduct: (p: Product | null) => void;
  setIsShareModalOpen: (open: boolean) => void;
  openShareProduct: (p: Product) => void;
  setDataSaverMode: (val: boolean) => void;

  // Order Tracking Modal State
  selectedOrderIdForTracking: string | null;
  setSelectedOrderIdForTracking: (id: string | null) => void;

  // Saved Landmarks / Patokan Rumah (Opsi pengantaran jika tidak di rumah)
  savedLandmarks: HouseLandmark[];
  addSavedLandmark: (landmark: Omit<HouseLandmark, 'id'>) => void;
  removeSavedLandmark: (id: string) => void;

  // Actions
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  login: (emailOrPhone: string, password?: string, role?: UserRole) => Promise<boolean>;
  register: (userData: Partial<User> & { password?: string; emailOrPhone?: string }) => Promise<User | null>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;

  // Courier Application & Admin Flow
  applyCourier: (data: {
    vehicleType: string;
    vehicleInfo: string;
    driverLicenseNumber?: string;
    notes?: string;
  }) => Promise<void>;
  approveCourierApplication: (applicationId: string) => Promise<void>;
  rejectCourierApplication: (applicationId: string, reason: string) => Promise<void>;

  // Admin Manual Approval Flow
  adminApprovals: AdminApprovalRequest[];
  pendingAdminCount: number;
  approveAdminRequest: (requestId: string) => Promise<void>;
  rejectAdminRequest: (requestId: string, reason: string) => Promise<void>;
  revokeAdminAccess: (userId: string, reason?: string) => Promise<void>;
  refreshAdminStatus: () => Promise<void>;

  // Cart
  addToCart: (product: Product, quantity?: number, notes?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  updateCartItemNote: (productId: string, note: string) => void;
  clearCart: () => void;
  getCartTotal: () => { subtotal: number; count: number };

  // Wishlist
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;

  // Stores
  updateStore: (store: Store) => void;
  verifyStore: (storeId: string, isVerified: boolean) => void;
  createStore: (storeData: {
    name: string;
    description: string;
    dusun: string;
    address: string;
    whatsapp: string;
    logoUrl?: string;
    bannerUrl?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountHolder?: string;
    openingHours?: string;
    closedDays?: string;
  }) => Promise<Store>;
  rateCourier: (orderId: string, courierId: string, rating: number, review: string) => Promise<void>;

  // Notifications & Sound
  notifications: InAppNotification[];
  unreadNotificationCount: number;
  addNotification: (notif: Omit<InAppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  isSoundEnabled: boolean;
  setIsSoundEnabled: (enabled: boolean) => void;
  playTestChime: (type: 'checkout' | 'completed' | 'general') => void;

  // Orders
  createOrder: (orderData: {
    buyerAddress: string;
    buyerDusun: string;
    buyerPhone: string;
    buyerName?: string;
    patokanRumah?: string;
    landmarkLabel?: string;
    deliveryMethod: 'antar_desa' | 'ambil_toko';
    paymentMethod: 'cod' | 'transfer' | 'qris';
    paymentProofUrl?: string;
    buyerNote?: string;
    notes?: string;
  }) => Order[];
  sendOrderWhatsAppToSeller: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignCourierToOrder: (orderId: string, courierId: string, courierName: string) => void;
  updateDeliveryStatus: (orderId: string, deliveryStatus: DeliveryStatus, orderStatus?: OrderStatus) => void;
  
  // Alur Pengiriman Lengkap (Penjual, Kurir, Pembeli)
  acceptOrder: (orderId: string) => void;
  processOrder: (orderId: string) => void;
  shipOrderWithCourier: (
    orderId: string,
    courier: { id: string; name: string; phone?: string; vehicle?: string }
  ) => void;
  courierPickupPackage: (orderId: string) => void;
  courierDeliverPackage: (orderId: string) => void;
  confirmOrderReceivedByBuyer: (orderId: string) => void;
  forceAutoCompleteOrder: (orderId: string) => void;

  // Products & Categories
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;

  // News & Ads (Admin only)
  addNews: (news: Omit<VillageNews, 'id'>) => void;
  updateNews: (news: VillageNews) => void;
  deleteNews: (newsId: string) => void;
  addAd: (ad: Omit<VillageAd, 'id' | 'createdAt'>) => void;
  updateAd: (ad: VillageAd) => void;
  deleteAd: (adId: string) => void;

  // Banners & Reviews
  addBanner: (banner: Banner) => void;
  updateBanner: (banner: Banner) => void;
  deleteBanner: (bannerId: string) => void;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;

  // Settings & Storage
  updateSettings: (settings: VillageSettings) => void;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(`pasardesa_${key}`);
    if (!item) return defaultValue;
    const parsed = JSON.parse(item);
    if (parsed === null || parsed === undefined) return defaultValue;
    return parsed;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(`pasardesa_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

function getLocalCredentials(): Record<string, string> {
  return getStorage<Record<string, string>>('user_credentials', {});
}

function saveLocalCredential(key: string, secret: string) {
  try {
    const current = getLocalCredentials();
    current[key.toLowerCase()] = secret;
    setStorage('user_credentials', current);
  } catch (e) {
    console.warn('Error saving local credential:', e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => getStorage('users', INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = getStorage<User | null>('currentUser', null);
    if (saved) return saved;
    return (INITIAL_USERS && INITIAL_USERS.length > 0) ? INITIAL_USERS[0] : null; // Default to Siti Rahmawati (Buyer)
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [stores, setStores] = useState<Store[]>(() => {
    const loaded = getStorage('stores', INITIAL_STORES);
    return loaded.map((s) => ({
      ...s,
      name: s.name.replace(/Sukamaju|Lain Mekar/g, 'Mekar Terus'),
      description: s.description.replace(/Sukamaju|Lain Mekar/g, 'Mekar Terus'),
      address: s.address.replace(/Sukamaju|Lain Mekar/g, 'Mekar Terus'),
    }));
  });
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(() => {
    const loaded = getStorage('products', INITIAL_PRODUCTS);
    return loaded.map((p) => ({
      ...p,
      sellerName: p.sellerName.replace(/Sukamaju|Lain Mekar/g, 'Mekar Terus'),
      description: p.description.replace(/Sukamaju|Lain Mekar/g, 'Mekar Terus'),
    }));
  });
  const [categories, setCategories] = useState<Category[]>(() => getStorage('categories', INITIAL_CATEGORIES));
  const [banners, setBanners] = useState<Banner[]>(() => {
    const loaded = getStorage('banners', INITIAL_BANNERS);
    return loaded.map((b) => ({
      ...b,
      title: b.title.replace(/Sukamaju|Lain Mekar/g, 'Mekar Terus'),
      subtitle: b.subtitle.replace(/Sukamaju|Lain Mekar/g, 'Mekar Terus'),
    }));
  });
  const [news, setNews] = useState<VillageNews[]>(() => {
    const loaded = getStorage('news', INITIAL_NEWS);
    return loaded.map((n) => ({
      ...n,
      title: n.title.replace(/Sukamaju|Lain Mekar/g, 'Mekar Terus'),
      summary: n.summary.replace(/Sukamaju|Lain Mekar/g, 'Mekar Terus'),
      content: n.content.replace(/Sukamaju|Lain Mekar/g, 'Mekar Terus'),
      author: n.author.replace(/Sukamaju|Lain Mekar/g, 'Mekar Terus'),
    }));
  });
  const [ads, setAds] = useState<VillageAd[]>(() => getStorage('ads', INITIAL_ADS));
  const [reviews, setReviews] = useState<Review[]>(() => getStorage('reviews', INITIAL_REVIEWS));
  const [settings, setSettings] = useState<VillageSettings>(() => {
    const loaded = getStorage('settings', INITIAL_SETTINGS);
    if (
      !loaded.villageName ||
      loaded.villageName === 'Desa Sukamaju' ||
      loaded.villageName === 'Desa Lain Mekar' ||
      loaded.villageName.includes('Sukamaju') ||
      loaded.villageName.includes('Lain Mekar')
    ) {
      const updated: VillageSettings = {
        ...loaded,
        villageName: 'Desa Mekar Terus',
        bumdesName: 'BUMDes Mekar Terus Mandiri Sejahtera',
        district: 'Kecamatan Karanganyar',
        regency: 'Kabupaten Mekar Terus Raya',
        tagline: 'Pusat Jual Beli Produk Petani & UMKM Desa Mekar Terus',
        bumdesKasRekening: {
          ...loaded.bumdesKasRekening,
          holder: 'BUMDES MEKAR TERUS MANDIRI',
        },
      };
      try {
        localStorage.setItem('settings', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    }
    return loaded;
  });
  const [orders, setOrders] = useState<Order[]>(() => getStorage('orders', INITIAL_ORDERS));

  // Per-account isolated shopping cart storage (mapped by userId, with 'guest' fallback)
  const [userCarts, setUserCarts] = useState<Record<string, CartItem[]>>(() => {
    const loaded = getStorage('userCarts', null);
    if (loaded && typeof loaded === 'object' && !Array.isArray(loaded)) {
      return loaded;
    }
    // Backward compatibility: migrate legacy global 'cart' if exists
    const legacyCart = getStorage('cart', []);
    const initialUser = getStorage('currentUser', INITIAL_USERS && INITIAL_USERS.length > 0 ? INITIAL_USERS[0] : null);
    const initialId = initialUser?.id || 'user-buyer-1';
    if (Array.isArray(legacyCart) && legacyCart.length > 0) {
      return { [initialId]: legacyCart };
    }
    return {};
  });

  // Current active user's cart (per-user isolated cart)
  const currentCartOwnerId = currentUser?.id || 'guest';
  const cart: CartItem[] = useMemo(() => {
    return userCarts[currentCartOwnerId] || [];
  }, [userCarts, currentCartOwnerId]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const loadedFavs = getStorage('favorites', []);
    return Array.isArray(loadedFavs) ? loadedFavs : [];
  });
  const [dataSaverMode, setDataSaverMode] = useState<boolean>(() => getStorage('dataSaverMode', false));
  const [adminApprovals, setAdminApprovals] = useState<AdminApprovalRequest[]>(() =>
    getStorage('adminApprovals', INITIAL_ADMIN_APPROVALS)
  );
  const [courierApplications, setCourierApplications] = useState<CourierApplication[]>(() =>
    getStorage('courierApplications', [
      {
        id: 'courier-app-1',
        userId: 'user-courier-1',
        name: 'Kang Ujang Pengantar Desa',
        phone: '081234567893',
        dusun: 'Dusun Mekarwangi RW 03',
        vehicleType: 'Sepeda Motor',
        vehicleInfo: 'Honda Beat Merah (B 4567 DES)',
        driverLicenseNumber: 'SIM C Aktif',
        notes: 'Berpengalaman mengantar belanja hasil tani dan kebutuhan warga antar dusun.',
        status: 'approved',
        appliedAt: '2026-03-01T08:00:00.000Z',
        reviewedAt: '2026-03-01T09:00:00.000Z',
        reviewedBy: 'Admin BUMDes Mekar Terus',
      },
    ])
  );

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<'beranda' | 'kategori' | 'lapak' | 'keranjang' | 'pesanan' | 'profil' | 'admin' | 'seller' | 'courier' | 'toko'>('beranda');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<string[]>(() =>
    getStorage('searchHistory', ['Beras', 'Minyak Goreng', 'Pisang Raja', 'Ikan Gurame', 'Cabai Rawit'])
  );

  const addSearchHistory = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 10);
      setStorage('searchHistory', updated);
      return updated;
    });
  };

  const removeSearchHistory = (query: string) => {
    setSearchHistory((prev) => {
      const updated = prev.filter((item) => item.toLowerCase() !== query.toLowerCase());
      setStorage('searchHistory', updated);
      return updated;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    setStorage('searchHistory', []);
  };

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedNews, setSelectedNews] = useState<VillageNews | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isSeoModalOpen, setIsSeoModalOpen] = useState<boolean>(false);
  const [isCreateStoreModalOpen, setIsCreateStoreModalOpen] = useState<boolean>(false);
  const [isCourierModalOpen, setIsCourierModalOpen] = useState<boolean>(false);
  const [sharingProduct, setSharingProduct] = useState<Product | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Order Tracking Modal State
  const [selectedOrderIdForTracking, setSelectedOrderIdForTracking] = useState<string | null>(null);

  // Saved Landmarks / Patokan Rumah Se-Desa (Ketika tidak di rumah)
  const DEFAULT_LANDMARKS: HouseLandmark[] = [
    {
      id: 'lm-1',
      label: '🏠 Rumah Utama / Tinggal',
      recipientNote: 'Penerima langsung di rumah',
      dusun: 'Dusun Krajan, RT 02 / RW 01',
      detail: 'Jl. Poros Desa No. 12, Depan Mushola Al-Ikhlas, Pagar Hijau',
      isDefault: true,
    },
    {
      id: 'lm-2',
      label: '👵 Titip Rumah Nenek / Orang Tua',
      recipientNote: 'Titip di teras rumah Nenek (Mbah Sarmi)',
      dusun: 'Dusun Krajan, RT 01 / RW 01',
      detail: 'Sebelah barat Pos Kamling RT 01, pagar bambu kuning',
    },
    {
      id: 'lm-3',
      label: '🏢 Titip Kantor Balai Desa / BUMDes',
      recipientNote: 'Titip ke meja piket pelayanan umum / satpam',
      dusun: 'Dusun Krajan, RT 02 / RW 01',
      detail: 'Gedung Balai Desa Sukamaju / Mekar Terus, ruang depan pelayanan',
    },
    {
      id: 'lm-4',
      label: '👥 Titip Rumah Tetangga Terdekat',
      recipientNote: 'Titip ke Bu RT / Warung tetangga sebelah',
      dusun: 'Dusun Sukarame, RT 02 / RW 02',
      detail: 'Rumah cat biru samping warung kelontong Bu RT',
    },
  ];

  const [savedLandmarks, setSavedLandmarks] = useState<HouseLandmark[]>(() =>
    getStorage('savedLandmarks', DEFAULT_LANDMARKS)
  );

  useEffect(() => {
    setStorage('savedLandmarks', savedLandmarks);
  }, [savedLandmarks]);

  const addSavedLandmark = (landmark: Omit<HouseLandmark, 'id'>) => {
    const newLm: HouseLandmark = {
      ...landmark,
      id: `lm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    setSavedLandmarks((prev) => [newLm, ...prev]);
  };

  const removeSavedLandmark = (id: string) => {
    setSavedLandmarks((prev) => prev.filter((lm) => lm.id !== id));
  };

  // Helper untuk memfilter notifikasi agar HANYA untuk pesanan masuk dari pembeli atau pesanan selesai konfirmasi
  const isAllowedNotification = (notif: { title?: string; type?: string; message?: string }): boolean => {
    if (!notif) return false;
    const titleLower = (notif.title || '').toLowerCase();
    const messageLower = (notif.message || '').toLowerCase();
    const type = notif.type;

    // Larang notifikasi login, masuk akun, keluar akun, selamat datang, hak admin, patokan, atau jadwal
    if (
      titleLower.includes('masuk akun') ||
      titleLower.includes('keluar') ||
      titleLower.includes('selamat datang') ||
      titleLower.includes('akses admin') ||
      titleLower.includes('patokan') ||
      titleLower.includes('jadwal') ||
      messageLower.includes('masuk akun') ||
      messageLower.includes('telah keluar') ||
      type === 'info'
    ) {
      return false;
    }

    // 1. Pesanan masuk dari pembeli
    const isIncomingOrder =
      type === 'checkout' ||
      titleLower.includes('pesanan masuk') ||
      titleLower.includes('orderan baru') ||
      titleLower.includes('pesanan berhasil dibuat');

    // 2. Pesanan selesai konfirmasi (dikonfirmasi pembeli / otomatis 5 jam)
    const isCompletedOrder =
      type === 'order_completed' ||
      titleLower.includes('pesanan selesai') ||
      titleLower.includes('selesai dikonfirmasi') ||
      titleLower.includes('selesai otomatis');

    return isIncomingOrder || isCompletedOrder;
  };

  // In-app notifications & Sound preference (HANYA pesanan masuk dari pembeli & pesanan selesai konfirmasi)
  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    const loaded = getStorage<InAppNotification[]>('notifications', []);
    if (Array.isArray(loaded)) {
      return loaded.filter((n) => isAllowedNotification(n));
    }
    return [];
  });
  const [isSoundEnabled, setIsSoundEnabledState] = useState<boolean>(() => isAudioSoundEnabled());

  const setIsSoundEnabled = (enabled: boolean) => {
    setIsSoundEnabledState(enabled);
    setAudioSoundEnabled(enabled);
  };

  const addNotification = (notif: Omit<InAppNotification, 'id' | 'timestamp' | 'read'>) => {
    if (!isAllowedNotification(notif)) {
      return;
    }
    const newNotif: InAppNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      ...notif,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 30)]);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const playTestChime = (type: 'checkout' | 'completed' | 'general') => {
    if (type === 'checkout') playCheckoutChime();
    else if (type === 'completed') playOrderCompleteChime();
    else playNotificationChime();
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const openShareProduct = (p: Product) => {
    setSharingProduct(p);
    setIsShareModalOpen(true);
  };

  const activeCouriers = users.filter((u) => u.role === 'courier');

  // Sync state to LocalStorage
  useEffect(() => setStorage('users', users), [users]);
  useEffect(() => setStorage('stores', stores), [stores]);
  useEffect(() => setStorage('currentUser', currentUser), [currentUser]);
  useEffect(() => setStorage('products', products), [products]);
  useEffect(() => setStorage('categories', categories), [categories]);
  useEffect(() => setStorage('banners', banners), [banners]);
  useEffect(() => setStorage('news', news), [news]);
  useEffect(() => setStorage('ads', ads), [ads]);
  useEffect(() => setStorage('reviews', reviews), [reviews]);
  useEffect(() => setStorage('orders', orders), [orders]);
  useEffect(() => {
    setStorage('userCarts', userCarts);
    setStorage('cart', cart);
  }, [userCarts, cart]);
  useEffect(() => setStorage('favorites', favorites), [favorites]);
  useEffect(() => setStorage('settings', settings), [settings]);
  useEffect(() => setStorage('dataSaverMode', dataSaverMode), [dataSaverMode]);
  useEffect(() => setStorage('adminApprovals', adminApprovals), [adminApprovals]);
  useEffect(() => setStorage('courierApplications', courierApplications), [courierApplications]);

  // Load latest admin approvals, courier applications, stores, and orders from Firestore
  useEffect(() => {
    const syncData = async () => {
      try {
        const list = await fetchAdminApprovalsFromFirestore();
        if (list && list.length > 0) {
          setAdminApprovals(list);
        }
      } catch (err) {
        console.warn('Gagal sinkronisasi permohonan admin Firestore:', err);
      }
      try {
        const courierList = await fetchCourierApplicationsFromFirestore();
        if (courierList && courierList.length > 0) {
          setCourierApplications(courierList);
        }
      } catch (err) {
        console.warn('Gagal sinkronisasi pendaftaran kurir Firestore:', err);
      }
      try {
        const firestoreStores = await fetchStoresFromFirestore();
        if (firestoreStores && firestoreStores.length > 0) {
          setStores(firestoreStores);
        }
      } catch (err) {
        console.warn('Gagal sinkronisasi data lapak Firestore:', err);
      }
      try {
        const firestoreOrders = await fetchOrdersFromFirestore();
        if (firestoreOrders && firestoreOrders.length > 0) {
          setOrders(firestoreOrders);
        }
      } catch (err) {
        console.warn('Gagal sinkronisasi data pesanan Firestore:', err);
      }
    };
    syncData();
  }, []);

  const pendingAdminCount = adminApprovals.filter((a) => a.status === 'pending').length;
  const pendingCourierCount = courierApplications.filter((c) => c.status === 'pending').length;

  // Sync Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const profile = await fetchUserProfileFromFirestore(fbUser.uid);
          if (profile) {
            setCurrentUser(profile);
            setUsers((prev) => {
              const idx = prev.findIndex((u) => u.id === profile.id);
              if (idx >= 0) {
                const copy = [...prev];
                copy[idx] = profile;
                return copy;
              }
              return [...prev, profile];
            });
          }
        } catch (e) {
          console.warn('Gagal memuat profil Firestore:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle SEO title update on view switch
  useEffect(() => {
    if (selectedProduct) {
      updatePageSEO(
        `${selectedProduct.name} - ${selectedProduct.sellerName}`,
        `Beli ${selectedProduct.name} murah berkualitas dari ${selectedProduct.sellerName} di ${settings.villageName}. Stok ready, bayar COD atau transfer.`,
        undefined,
        selectedProduct.imageUrl
      );
    } else if (selectedNews) {
      updatePageSEO(
        selectedNews.title,
        selectedNews.summary,
        undefined,
        selectedNews.imageUrl
      );
    } else if (activeTab === 'beranda') {
      updatePageSEO(
        `Pasar Desa Mandiri ${settings.villageName} - Jual Beli Produk Warga & UMKM Desa`,
        'Belanja sembako murah, panen sayur padi organik, camilan khas, dan kerajinan desa. Dukung UMKM tetangga sendiri.'
      );
    } else if (activeTab === 'kategori') {
      updatePageSEO(
        'Katalog Kategori Produk Desa',
        'Temukan aneka sembako, hasil bumi tani desa, makanan minuman tradisional, dan kerajinan tangan.'
      );
    } else if (activeTab === 'admin') {
      updatePageSEO(
        `Dashboard Admin ${settings.villageName} & BUMDes`,
        'Panel kendali pengelolaan pasar desa, UMKM, berita desa, dan laporan keuangan.'
      );
    } else if (activeTab === 'seller' || activeTab === 'toko') {
      updatePageSEO(
        'Kelola Toko UMKM Desa',
        'Manajemen produk, stok barang, promo diskon, dan pesanan pelanggan desa.'
      );
    }
  }, [activeTab, selectedProduct, selectedNews]);

  // Merge anonymous/guest cart into user cart when user signs in or registers
  const mergeGuestCartToUser = (targetUserId: string) => {
    if (!targetUserId || targetUserId === 'guest') return;
    setUserCarts((prev) => {
      const guestCart = prev['guest'] || [];
      if (!guestCart || guestCart.length === 0) return prev;

      const userCart = prev[targetUserId] || [];
      const merged = [...userCart];

      guestCart.forEach((guestItem) => {
        const existingIdx = merged.findIndex((it) => it.product.id === guestItem.product.id);
        if (existingIdx >= 0) {
          merged[existingIdx] = {
            ...merged[existingIdx],
            quantity: Math.min(guestItem.product.stock, merged[existingIdx].quantity + guestItem.quantity),
            notes: guestItem.notes || merged[existingIdx].notes,
            catatanProduk: guestItem.catatanProduk || merged[existingIdx].catatanProduk,
          };
        } else {
          merged.push(guestItem);
        }
      });

      return {
        ...prev,
        [targetUserId]: merged,
        guest: [],
      };
    });
  };

  // Auth / Role switcher
  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  const switchRole = (role: UserRole) => {
    const existingRoleUser = users.find((u) => u.role === role);
    if (existingRoleUser) {
      setCurrentUser(existingRoleUser);
      if (role === 'admin') setActiveTab('admin');
      else if (role === 'seller') setActiveTab('seller');
      else setActiveTab('beranda');
    }
  };

  const login = async (
    emailOrPhone: string,
    password?: string,
    roleHint: UserRole = 'buyer'
  ): Promise<boolean> => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const cleanQuery = emailOrPhone.trim().toLowerCase();
      const cleanPhone = cleanQuery.replace(/[^0-9]/g, '');

      // Check against existing registered users in memory or storage
      const matchedUser = users.find((u) => {
        const uPhone = (u.phone || '').replace(/[^0-9]/g, '');
        const uEmail = (u.email || '').trim().toLowerCase();
        if (cleanQuery && uEmail === cleanQuery) return true;
        if (cleanPhone.length >= 7 && uPhone.length >= 7) {
          return uPhone.endsWith(cleanPhone.slice(-8)) || cleanPhone.endsWith(uPhone.slice(-8));
        }
        return false;
      });

      if (password && password.trim().length >= 6) {
        // Authenticate with live Firebase Auth and fetch Firestore doc
        try {
          const user = await firebaseLoginUser({ emailOrPhone, password });
          mergeGuestCartToUser(user.id);
          setCurrentUser(user);
          setUsers((prev) => {
            const idx = prev.findIndex((u) => u.id === user.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = user;
              return copy;
            }
            return [...prev, user];
          });
          if (user.role === 'admin') setActiveTab('admin');
          else if (user.role === 'seller') setActiveTab('seller');
          setIsAuthModalOpen(false);
          return true;
        } catch (fbErr: any) {
          console.warn('Firebase Auth Login note:', fbErr?.code || fbErr?.message);
          
          // If Firebase Auth provider is disabled in console or restricted,
          // verify against local stored user credentials or user list:
          const localCreds = getLocalCredentials();
          const storedPass = localCreds[cleanQuery] || (cleanPhone ? localCreds[cleanPhone] : undefined);

          if (matchedUser) {
            // Check stored password if recorded
            if (storedPass && storedPass !== password) {
              setAuthError('Kata sandi salah. Silakan periksa kembali kata sandi Anda.');
              return false;
            }
            mergeGuestCartToUser(matchedUser.id);
            setCurrentUser(matchedUser);
            if (matchedUser.role === 'admin') setActiveTab('admin');
            else if (matchedUser.role === 'seller') setActiveTab('seller');
            setIsAuthModalOpen(false);
            return true;
          }

          if (fbErr?.code === 'auth/wrong-password' || fbErr?.code === 'auth/invalid-credential') {
            setAuthError('Nomor HP/Email atau kata sandi tidak cocok. Silakan periksa kembali.');
            return false;
          }
          if (fbErr?.code === 'auth/user-not-found') {
            setAuthError('Akun belum terdaftar. Silakan buat akun baru di tab "Daftar Akun Baru".');
            return false;
          }
          if (fbErr?.code === 'auth/operation-not-allowed' || fbErr?.code === 'auth/admin-restricted-operation') {
            setAuthError('Akun belum terdaftar di aplikasi. Silakan buka tab "Daftar Akun Baru" atau gunakan Akun Cepat di bawah.');
            return false;
          }
          throw fbErr;
        }
      } else {
        // Instant role / demo switcher fallback
        if (matchedUser) {
          mergeGuestCartToUser(matchedUser.id);
          setCurrentUser(matchedUser);
          if (matchedUser.role === 'admin') setActiveTab('admin');
          else if (matchedUser.role === 'seller') setActiveTab('seller');
          setIsAuthModalOpen(false);
          return true;
        }

        const roleMatched = users.find((u) => u.role === roleHint);
        if (roleMatched) {
          mergeGuestCartToUser(roleMatched.id);
          setCurrentUser(roleMatched);
          if (roleMatched.role === 'admin') setActiveTab('admin');
          else if (roleMatched.role === 'seller') setActiveTab('seller');
          setIsAuthModalOpen(false);
          return true;
        }

        setAuthError('Masukkan kata sandi minimal 6 karakter untuk masuk akun.');
        return false;
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      setAuthError(translateFirebaseError(err));
      return false;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const register = async (
    userData: Partial<User> & { password?: string; emailOrPhone?: string }
  ): Promise<User | null> => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const passwordToUse = userData.password || 'pasardesa123';
      const emailOrPhone = userData.email || userData.emailOrPhone || userData.phone || '08123456789';

      // Save local credentials for immediate and subsequent logins
      if (userData.phone) {
        const p = userData.phone.replace(/[^0-9]/g, '');
        if (p) saveLocalCredential(p, passwordToUse);
      }
      if (userData.email) {
        saveLocalCredential(userData.email, passwordToUse);
      }
      if (emailOrPhone) {
        saveLocalCredential(emailOrPhone, passwordToUse);
      }

      try {
        // Create user in Firebase Auth and record profile in Firestore
        const { user: newUser, approvalRequest } = await firebaseRegisterUser({
          emailOrPhone,
          password: passwordToUse,
          name: userData.name || 'Warga Desa',
          phone: userData.phone || '08123456789',
          role: userData.role || 'buyer',
          dusun: userData.dusun || 'Dusun Krajan',
          shopName: userData.shopName,
          shopDescription: userData.shopDescription,
          bankName: userData.bankName,
          bankAccountNumber: userData.bankAccountNumber,
          bankAccountHolder: userData.bankAccountHolder,
          adminPosition: userData.adminPosition,
          adminReason: userData.adminReason,
        });

        setUsers((prev) => {
          const filtered = prev.filter((u) => u.id !== newUser.id);
          return [...filtered, newUser];
        });

        if (approvalRequest) {
          setAdminApprovals((prev) => [approvalRequest, ...prev.filter((a) => a.id !== approvalRequest.id)]);
        }
        mergeGuestCartToUser(newUser.id);
        setCurrentUser(newUser);
        if (newUser.role === 'admin') setActiveTab('admin');
        else if (newUser.role === 'seller') setActiveTab('seller');
        setIsAuthModalOpen(false);
        return newUser;
      } catch (fbErr: any) {
        console.warn('Firebase registration fallback triggered:', fbErr?.code || fbErr?.message);
        
        // Graceful fallback: If Firebase Auth Email/Password throws any error,
        // save the account directly to Cloud Firestore and local state so user registration succeeds!
        const generatedId = `user-${Date.now()}`;
        const isDefaultSuperAdmin =
          userData.email?.toLowerCase() === 'yth.abdurrohman@gmail.com' ||
          userData.email?.toLowerCase() === 'bumdes@mekarterus.desa.id' ||
          userData.email?.toLowerCase() === 'bumdes@sukamaju.desa.id';

        const adminStatus: AdminApprovalStatus =
          userData.role === 'admin'
            ? isDefaultSuperAdmin
              ? 'approved'
              : 'pending'
            : 'none';

        const fallbackUser: User = {
          id: generatedId,
          name: userData.name || 'Warga Desa',
          phone: userData.phone || '08123456789',
          email: userData.email,
          role: userData.role || 'buyer',
          dusun: userData.dusun || 'Dusun Krajan',
          avatar:
            userData.role === 'admin'
              ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'
              : userData.role === 'seller'
              ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=250&q=80'
              : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
          shopName: userData.shopName,
          shopDescription: userData.shopDescription,
          shopWhatsapp: userData.phone,
          bankName: userData.bankName,
          bankAccountNumber: userData.bankAccountNumber,
          bankAccountHolder: userData.bankAccountHolder,
          verifiedSeller: userData.role === 'seller',
          adminStatus,
          adminPosition: userData.adminPosition,
          adminReason: userData.adminReason,
          adminRequestedAt: userData.role === 'admin' ? new Date().toISOString() : undefined,
          isSuperAdmin: isDefaultSuperAdmin,
          createdAt: new Date().toISOString(),
        };

        try {
          await saveUserProfileToFirestore(fallbackUser);
        } catch (storeErr) {
          console.warn('Silent Firestore fallback error:', storeErr);
        }

        if (userData.role === 'admin' && adminStatus === 'pending') {
          const req: AdminApprovalRequest = {
            id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            userId: fallbackUser.id,
            name: fallbackUser.name,
            phone: fallbackUser.phone,
            email: fallbackUser.email,
            dusun: fallbackUser.dusun,
            position: userData.adminPosition || 'Pengurus Desa / BUMDes',
            reason: userData.adminReason || 'Mengelola operasional pasar desa dan katalog UMKM warga.',
            status: 'pending',
            requestedAt: new Date().toISOString(),
          };
          try {
            await saveAdminApprovalToFirestore(req);
          } catch (apprErr) {
            console.warn('Silent admin approval Firestore error:', apprErr);
          }
          setAdminApprovals((prev) => [req, ...prev.filter((a) => a.id !== req.id)]);
        }

        setUsers((prev) => [...prev, fallbackUser]);
        mergeGuestCartToUser(fallbackUser.id);
        setCurrentUser(fallbackUser);
        if (fallbackUser.role === 'admin') setActiveTab('admin');
        else if (fallbackUser.role === 'seller') setActiveTab('seller');
        setIsAuthModalOpen(false);
        return fallbackUser;
      }
    } catch (err: any) {
      console.error('Register Error:', err);
      setAuthError(translateFirebaseError(err));
      return null;
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Admin Manual Approval Actions
  const approveAdminRequest = async (requestId: string) => {
    const req = adminApprovals.find((a) => a.id === requestId);
    if (!req) return;
    const reviewer = currentUser?.name || 'Administrator Utama Desa';
    await updateAdminApprovalInFirestore(requestId, req.userId, 'approved', reviewer);

    setAdminApprovals((prev) =>
      prev.map((a) =>
        a.id === requestId
          ? {
              ...a,
              status: 'approved',
              reviewedAt: new Date().toISOString(),
              reviewedBy: reviewer,
            }
          : a
      )
    );

    setUsers((prev) =>
      prev.map((u) =>
        u.id === req.userId
          ? {
              ...u,
              adminStatus: 'approved',
              adminApprovedAt: new Date().toISOString(),
              adminApprovedBy: reviewer,
            }
          : u
      )
    );

    if (currentUser?.id === req.userId) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              adminStatus: 'approved',
              adminApprovedAt: new Date().toISOString(),
              adminApprovedBy: reviewer,
            }
          : null
      );
    }
  };

  const rejectAdminRequest = async (requestId: string, reason: string) => {
    const req = adminApprovals.find((a) => a.id === requestId);
    if (!req) return;
    const reviewer = currentUser?.name || 'Administrator Utama Desa';
    await updateAdminApprovalInFirestore(requestId, req.userId, 'rejected', reviewer, reason);

    setAdminApprovals((prev) =>
      prev.map((a) =>
        a.id === requestId
          ? {
              ...a,
              status: 'rejected',
              reviewedAt: new Date().toISOString(),
              reviewedBy: reviewer,
              rejectionReason: reason,
            }
          : a
      )
    );

    setUsers((prev) =>
      prev.map((u) =>
        u.id === req.userId
          ? {
              ...u,
              adminStatus: 'rejected',
              adminRejectionReason: reason,
            }
          : u
      )
    );

    if (currentUser?.id === req.userId) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              adminStatus: 'rejected',
              adminRejectionReason: reason,
            }
          : null
      );
    }
  };

  const revokeAdminAccess = async (userId: string, reason?: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const revocationReason = reason || 'Hak akses admin dicabut oleh Administrator Utama Desa.';
    const reviewer = currentUser?.name || 'Administrator Utama Desa';

    // 1. Update matching approval requests in state & Firestore
    const matchingReq = adminApprovals.find((a) => a.userId === userId);
    if (matchingReq) {
      await updateAdminApprovalInFirestore(matchingReq.id, userId, 'rejected', reviewer, revocationReason);
      setAdminApprovals((prev) =>
        prev.map((a) =>
          a.userId === userId
            ? {
                ...a,
                status: 'rejected',
                reviewedAt: new Date().toISOString(),
                reviewedBy: reviewer,
                rejectionReason: revocationReason,
              }
            : a
        )
      );
    }

    // 2. Revert role to buyer/seller and remove superAdmin/admin status
    const updatedUser: User = {
      ...user,
      role: user.storeId ? 'seller' : 'buyer',
      adminStatus: 'rejected',
      adminRejectionReason: revocationReason,
      isSuperAdmin: false,
      updatedAt: new Date().toISOString(),
    };

    await saveUserProfileToFirestore(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
    if (currentUser?.id === userId) {
      setCurrentUser(updatedUser);
      if (activeTab === 'admin') {
        setActiveTab('beranda');
      }
    }
  };

  const refreshAdminStatus = async () => {
    if (!currentUser) return;
    const latest = await fetchUserProfileFromFirestore(currentUser.id);
    if (latest) {
      setCurrentUser(latest);
      setUsers((prev) => prev.map((u) => (u.id === latest.id ? latest : u)));
    }
    const approvals = await fetchAdminApprovalsFromFirestore();
    if (approvals.length > 0) {
      setAdminApprovals(approvals);
    }
    const couriers = await fetchCourierApplicationsFromFirestore();
    if (couriers.length > 0) {
      setCourierApplications(couriers);
    }
  };

  // Courier Application Actions (Pengguna mendaftar kurir, disetujui/ditentukan admin)
  const applyCourier = async (data: {
    vehicleType: string;
    vehicleInfo: string;
    driverLicenseNumber?: string;
    notes?: string;
  }) => {
    if (!currentUser) throw new Error('Silakan masuk terlebih dahulu untuk mendaftar sebagai kurir.');
    const now = new Date().toISOString();
    const newApp: CourierApplication = {
      id: `courier-app-${Date.now()}`,
      userId: currentUser.id,
      name: currentUser.name,
      phone: currentUser.phone,
      email: currentUser.email,
      dusun: currentUser.dusun,
      vehicleType: data.vehicleType,
      vehicleInfo: data.vehicleInfo,
      driverLicenseNumber: data.driverLicenseNumber,
      notes: data.notes,
      status: 'pending',
      appliedAt: now,
    };

    setCourierApplications((prev) => [newApp, ...prev.filter((c) => c.id !== newApp.id)]);

    const updatedUser: User = {
      ...currentUser,
      courierApprovalStatus: 'pending',
      courierAppliedAt: now,
      vehicleInfo: data.vehicleInfo,
      vehicleType: data.vehicleType,
    };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    await saveCourierApplicationToFirestore(newApp);
  };

  const approveCourierApplication = async (applicationId: string) => {
    const targetApp = courierApplications.find((a) => a.id === applicationId);
    if (!targetApp) return;

    const reviewer = currentUser?.name || `Admin BUMDes ${settings.villageName}`;
    const now = new Date().toISOString();

    setCourierApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? { ...a, status: 'approved', reviewedAt: now, reviewedBy: reviewer }
          : a
      )
    );

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === targetApp.userId) {
          return {
            ...u,
            role: 'courier',
            courierStatus: 'ready',
            courierApprovalStatus: 'approved',
            courierApprovedAt: now,
            vehicleInfo: targetApp.vehicleInfo,
            vehicleType: targetApp.vehicleType,
          };
        }
        return u;
      })
    );

    if (currentUser?.id === targetApp.userId) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              role: 'courier',
              courierStatus: 'ready',
              courierApprovalStatus: 'approved',
              courierApprovedAt: now,
              vehicleInfo: targetApp.vehicleInfo,
              vehicleType: targetApp.vehicleType,
            }
          : null
      );
    }

    await updateCourierApplicationInFirestore(
      applicationId,
      targetApp.userId,
      'approved',
      reviewer,
      targetApp.vehicleInfo
    );
  };

  const rejectCourierApplication = async (applicationId: string, reason: string) => {
    const targetApp = courierApplications.find((a) => a.id === applicationId);
    if (!targetApp) return;

    const reviewer = currentUser?.name || `Admin BUMDes ${settings.villageName}`;
    const now = new Date().toISOString();

    setCourierApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? { ...a, status: 'rejected', reviewedAt: now, reviewedBy: reviewer, rejectionReason: reason }
          : a
      )
    );

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === targetApp.userId) {
          return {
            ...u,
            courierApprovalStatus: 'rejected',
            courierRejectionReason: reason,
          };
        }
        return u;
      })
    );

    if (currentUser?.id === targetApp.userId) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              courierApprovalStatus: 'rejected',
              courierRejectionReason: reason,
            }
          : null
      );
    }

    await updateCourierApplicationInFirestore(
      applicationId,
      targetApp.userId,
      'rejected',
      reviewer,
      undefined,
      reason
    );
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const user = await firebaseGoogleSignIn();
      mergeGuestCartToUser(user.id);
      setCurrentUser(user);
      setUsers((prev) => {
        const idx = prev.findIndex((u) => u.id === user.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = user;
          return copy;
        }
        return [...prev, user];
      });
      setIsAuthModalOpen(false);
      return true;
    } catch (err: any) {
      console.error('Firebase Google Sign-In Error:', err);
      setAuthError(translateFirebaseError(err));
      return false;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut();
    } catch (err) {
      console.warn('Firebase signout error:', err);
    }
    setCurrentUser(null);
    setStorage('currentUser', null);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (typeof document !== 'undefined') {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    setActiveTab('beranda');
  };

  // Per-account isolated shopping cart operations
  const addToCart = (product: Product, quantity = 1, notes?: string) => {
    const ownerId = currentUser?.id || 'guest';
    setUserCarts((prev) => {
      const currentList = prev[ownerId] || [];
      const existing = currentList.find((item) => item.product.id === product.id);
      let updatedList: CartItem[];
      if (existing) {
        updatedList = currentList.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: Math.min(product.stock, item.quantity + quantity),
                notes: notes || item.notes,
                catatanProduk: notes || item.catatanProduk,
              }
            : item
        );
      } else {
        updatedList = [
          ...currentList,
          { product, quantity: Math.min(product.stock, quantity), notes, catatanProduk: notes },
        ];
      }
      return {
        ...prev,
        [ownerId]: updatedList,
      };
    });
  };

  const removeFromCart = (productId: string) => {
    const ownerId = currentUser?.id || 'guest';
    setUserCarts((prev) => ({
      ...prev,
      [ownerId]: (prev[ownerId] || []).filter((item) => item.product.id !== productId),
    }));
  };

  const updateCartQuantity = (productId: string, qty: number) => {
    const ownerId = currentUser?.id || 'guest';
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setUserCarts((prev) => ({
      ...prev,
      [ownerId]: (prev[ownerId] || []).map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: Math.min(item.product.stock, qty) };
        }
        return item;
      }),
    }));
  };

  const updateCartItemNote = (productId: string, note: string) => {
    const ownerId = currentUser?.id || 'guest';
    setUserCarts((prev) => ({
      ...prev,
      [ownerId]: (prev[ownerId] || []).map((item) =>
        item.product.id === productId
          ? { ...item, notes: note, catatanProduk: note }
          : item
      ),
    }));
  };

  const clearCart = () => {
    const ownerId = currentUser?.id || 'guest';
    setUserCarts((prev) => ({
      ...prev,
      [ownerId]: [],
    }));
  };

  const getCartTotal = () => {
    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    return { subtotal, count };
  };

  // Wishlist
  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      return list.includes(productId) ? list.filter((id) => id !== productId) : [...list, productId];
    });
  };

  const isFavorite = (productId: string) => Array.isArray(favorites) && favorites.includes(productId);

  // Store Management
  const updateStore = (updatedStore: Store) => {
    setStores((prev) =>
      prev.map((s) => (s.id === updatedStore.id ? updatedStore : s))
    );
    if (selectedStore?.id === updatedStore.id) {
      setSelectedStore(updatedStore);
    }
    saveStoreToFirestore(updatedStore);
  };

  const verifyStore = (storeId: string, isVerified: boolean) => {
    setStores((prev) =>
      prev.map((s) => {
        if (s.id === storeId) {
          const updated = { ...s, isVerified };
          saveStoreToFirestore(updated);
          return updated;
        }
        return s;
      })
    );
  };

  // Orders creation grouped strictly by Lapak (Store)
  const createOrder = (orderData: {
    buyerAddress: string;
    buyerDusun: string;
    buyerPhone: string;
    buyerName?: string;
    patokanRumah?: string;
    landmarkLabel?: string;
    deliveryMethod: 'antar_desa' | 'ambil_toko';
    paymentMethod: 'cod' | 'transfer' | 'qris';
    paymentProofUrl?: string;
    buyerNote?: string;
    notes?: string;
  }): Order[] => {
    if (cart.length === 0) return [];

    // Group cart items by storeId (fallback to sellerId)
    const groups: { [storeKey: string]: CartItem[] } = {};
    cart.forEach((item) => {
      const storeKey = item.product.storeId || item.product.sellerId;
      if (!groups[storeKey]) groups[storeKey] = [];
      groups[storeKey].push(item);
    });

    const newOrders: Order[] = [];
    const now = new Date();
    const dateStr = now.toISOString();

    const groupKeys = Object.keys(groups);
    groupKeys.forEach((storeKey, index) => {
      const items = groups[storeKey];
      if (!items || items.length === 0 || !items[0]?.product) return;
      const firstProd = items[0].product;
      const matchedStore = stores.find(
        (s) => s.id === firstProd.storeId || s.id === storeKey || s.sellerId === firstProd.sellerId
      );

      const storeId = matchedStore?.id || firstProd.storeId || `store-${storeKey}`;
      const storeName = matchedStore?.name || firstProd.sellerName;
      const sellerId = matchedStore?.sellerId || firstProd.sellerId;
      const sellerName = matchedStore?.name || firstProd.sellerName;

      const subtotal = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
      const deliveryFee = orderData.deliveryMethod === 'antar_desa' ? settings.deliveryFeeStandard : 0;
      const total = subtotal + deliveryFee;

      const orderNumber = `ORD-${Date.now().toString().slice(-4)}${index + 1}`;
      const invoiceNumber = `INV/DESA/${now.getFullYear()}/${Math.floor(100000 + Math.random() * 900000)}`;

      const sellerWhatsapp = matchedStore?.whatsapp || items[0]?.product?.sellerWhatsapp || '6285712345678';

      const orderItem: Order = {
        id: `ord-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
        orderNumber,
        invoiceNumber,
        buyerId: currentUser?.id || 'guest-warga',
        buyerName: orderData.buyerName || currentUser?.name || `Warga ${settings.villageName}`,
        buyerPhone: orderData.buyerPhone || currentUser?.phone || '',
        buyerAddress: orderData.buyerAddress,
        buyerDusun: orderData.buyerDusun,
        patokanRumah: orderData.patokanRumah,
        landmarkLabel: orderData.landmarkLabel,
        storeId,
        storeName,
        sellerId,
        sellerName,
        sellerWhatsapp,
        items: items.map((it) => ({
          productId: it.product.id,
          productName: it.product.name,
          price: it.product.price,
          quantity: it.quantity,
          unit: it.product.unit,
          imageUrl: it.product.imageUrl,
          sellerId: it.product.sellerId,
          sellerName: it.product.sellerName,
          catatanProduk: it.catatanProduk || it.notes || '',
        })),
        subtotal,
        ongkir: deliveryFee,
        deliveryFee,
        total,
        buyerNote: orderData.buyerNote || orderData.notes || '',
        notes: orderData.buyerNote || orderData.notes || '',
        paymentMethod: orderData.paymentMethod,
        paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : 'paid',
        paymentProofUrl: orderData.paymentProofUrl,
        status: 'menunggu',
        deliveryStatus: 'waiting',
        deliveryMethod: orderData.deliveryMethod,
        createdAt: dateStr,
        updatedAt: dateStr,
      };

      newOrders.push(orderItem);

      // Save order to Firestore
      saveOrderToFirestore(orderItem);

      // Decrement product stock and increment sold count
      items.forEach((ci) => {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === ci.product.id
              ? {
                  ...p,
                  stock: Math.max(0, p.stock - ci.quantity),
                  soldCount: p.soldCount + ci.quantity,
                }
              : p
          )
        );
      });
    });

    setOrders((prev) => [...newOrders, ...prev]);
    clearCart();

    // 1. Mobile Vibration (Notifikasi Getar di HP Penjual/Perangkat)
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate([300, 150, 300, 150, 450]);
      } catch (err) {
        console.warn('Vibration API not allowed:', err);
      }
    }

    // 2. Mainkan nada dering pesanan baru
    playCheckoutChime();

    // 3. Notifikasi Sistem / Web Push di Layar HP & Browser Penjual
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        newOrders.forEach((ord) => {
          try {
            new Notification(`🔔 Orderan Baru Masuk: Lapak ${ord.sellerName || ord.storeName}!`, {
              body: `Invoice #${ord.invoiceNumber}: Pembeli ${ord.buyerName} memesan ${ord.items.length} jenis produk (${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(ord.total)}). Segera siapkan!`,
              icon: '/favicon.ico',
            });
          } catch {
            // ignore notification restriction
          }
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            newOrders.forEach((ord) => {
              try {
                new Notification(`🔔 Orderan Baru Masuk: Lapak ${ord.sellerName || ord.storeName}!`, {
                  body: `Invoice #${ord.invoiceNumber}: Pembeli ${ord.buyerName} (${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(ord.total)}). Segera siapkan!`,
                });
              } catch {
                // ignore
              }
            });
          }
        });
      }
    }

    // 4. In-App Notifications untuk Penjual & Pembeli
    newOrders.forEach((ord) => {
      addNotification({
        title: `Pesanan Masuk Lapak ${ord.sellerName || ord.storeName}! 📦`,
        message: `Order #${ord.orderNumber} dari ${ord.buyerName} (${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(ord.total)}) telah masuk ke sistem. Rincian otomatis disiapkan ke nomor WhatsApp penjual (${ord.sellerWhatsapp || 'WA Penjual'}).`,
        type: 'order_update',
      });
    });

    const storeNames = Array.from(new Set(newOrders.map((o) => o.storeName))).join(', ');
    const totalSemua = newOrders.reduce((sum, o) => sum + o.total, 0);
    addNotification({
      title: 'Pesanan Berhasil Dibuat! 🔔',
      message: `${newOrders.length} pesanan (${storeNames}) senilai ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalSemua)} berhasil dibuat. Penjual telah menerima notifikasi di HP & WhatsApp!`,
      type: 'checkout',
    });

    return newOrders;
  };

  const sendOrderWhatsAppToSeller = (order: Order) => {
    const matchedStore = stores.find((s) => s.id === order.storeId || s.name === order.sellerName);
    const rawNumber = order.sellerWhatsapp || matchedStore?.whatsapp || matchedStore?.phone || '6285712345678';
    let cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('0')) cleanNumber = '62' + cleanNumber.slice(1);

    const itemsSummary = order.items
      .map(
        (i) =>
          `• ${i.quantity}x ${i.productName}${
            i.catatanProduk ? ` (Catatan: ${i.catatanProduk})` : ''
          } - ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(i.price * i.quantity)}`
      )
      .join('\n');

    const message =
      `*🔔 ORDERAN BARU MASUK - PASAR DESA ${settings.villageName.toUpperCase()}*\n\n` +
      `Halo Lapak *${order.sellerName || order.storeName}*,\n` +
      `Pesanan baru telah masuk di aplikasi Pasar Desa:\n\n` +
      `📋 *No. Invoice:* ${order.invoiceNumber || order.orderNumber}\n` +
      `👤 *Nama Pembeli:* ${order.buyerName}\n` +
      `📞 *No. HP Pembeli:* ${order.buyerPhone}\n` +
      `📍 *Alamat Pengantaran:* ${order.buyerAddress}\n` +
      (order.patokanRumah ? `🏠 *Patokan / Titip Rumah:* ${order.patokanRumah}\n` : '') +
      `🚚 *Metode Pengiriman:* ${
        order.deliveryMethod === 'antar_desa' ? 'Diantar Kurir Desa' : 'Ambil di Lapak'
      }\n` +
      `💳 *Metode Pembayaran:* ${order.paymentMethod.toUpperCase()} (${
        order.paymentStatus === 'paid' ? 'Sudah Lunas' : 'Menunggu Pembayaran / COD'
      })\n\n` +
      `📦 *Rincian Produk:*\n${itemsSummary}\n\n` +
      `💵 *Ongkos Kirim:* ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(order.ongkir || 0)}\n` +
      `💰 *Total Pembayaran:* ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(order.total)}\n` +
      (order.buyerNote ? `📝 *Catatan Tambahan Pembeli:* ${order.buyerNote}\n\n` : '\n') +
      `Mohon segera dicek dan dipersiapkan ya kak. Terima kasih! 🙏`;

    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updated: Order = {
            ...ord,
            status,
            updatedAt: new Date().toISOString(),
          };
          saveOrderToFirestore(updated);

          // Audio chime & notification on status update
          if (status === 'selesai') {
            playOrderCompleteChime();
            addNotification({
              title: `Pesanan #${ord.orderNumber} Selesai Dikonfirmasi! 🎉`,
              message: `Pesanan #${ord.orderNumber} telah selesai diantar dan diterima warga. Terima kasih!`,
              type: 'order_completed',
            });
          }

          return updated;
        }
        return ord;
      })
    );
  };

  const assignCourierToOrder = (orderId: string, courierId: string, courierName: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updated: Order = {
            ...ord,
            courierId,
            courierName,
            deliveryStatus: 'assigned',
            status: ord.status === 'menunggu' ? 'diproses' : ord.status,
            orderShippedAt: ord.orderShippedAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          saveOrderToFirestore(updated);
          return updated;
        }
        return ord;
      })
    );
  };

  // --- Alur Lengkap Pengiriman: Penjual -> Kurir -> Pembeli ---

  // 1. Penjual: Menerima Pesanan
  const acceptOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const now = new Date().toISOString();
          const updated: Order = {
            ...ord,
            orderAcceptedAt: now,
            updatedAt: now,
          };
          saveOrderToFirestore(updated);
          return updated;
        }
        return ord;
      })
    );
  };

  // 2. Penjual: Memproses Pesanan
  const processOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const now = new Date().toISOString();
          const updated: Order = {
            ...ord,
            status: 'diproses',
            orderProcessedAt: now,
            updatedAt: now,
          };
          saveOrderToFirestore(updated);
          return updated;
        }
        return ord;
      })
    );
  };

  // 3. Penjual: Mengirim Pesanan & Memilih Kurir Pengirim
  const shipOrderWithCourier = (
    orderId: string,
    courier: { id: string; name: string; phone?: string; vehicle?: string }
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const now = new Date().toISOString();
          const updated: Order = {
            ...ord,
            status: 'dikirim',
            deliveryStatus: 'assigned',
            courierId: courier.id,
            courierName: courier.name,
            courierPhone: courier.phone,
            courierVehicle: courier.vehicle,
            orderShippedAt: now,
            updatedAt: now,
          };
          saveOrderToFirestore(updated);
          return updated;
        }
        return ord;
      })
    );
  };

  // 4. Kurir: Menerima Paket dari Penjual
  const courierPickupPackage = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const now = new Date().toISOString();
          const updated: Order = {
            ...ord,
            status: 'dikirim',
            deliveryStatus: 'picked_up',
            courierPickedUpAt: now,
            updatedAt: now,
          };
          saveOrderToFirestore(updated);
          return updated;
        }
        return ord;
      })
    );
  };

  // 5. Kurir: Paket Terkirim / Diserahkan ke Pembeli
  const courierDeliverPackage = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const now = new Date().toISOString();
          const autoCompleteTime = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(); // 5 jam dari sekarang
          const updated: Order = {
            ...ord,
            status: 'dikirim', // menunggu konfirmasi pembeli atau 5 jam
            deliveryStatus: 'delivered',
            courierDeliveredAt: now,
            autoCompleteAt: autoCompleteTime,
            updatedAt: now,
          };
          saveOrderToFirestore(updated);
          return updated;
        }
        return ord;
      })
    );
  };

  // 6. Pembeli: Mengonfirmasi Pengiriman Selesai
  const confirmOrderReceivedByBuyer = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const now = new Date().toISOString();
          const updated: Order = {
            ...ord,
            status: 'selesai',
            deliveryStatus: 'delivered',
            paymentStatus: 'paid',
            completedAt: now,
            completedBy: 'buyer',
            updatedAt: now,
          };
          saveOrderToFirestore(updated);
          playOrderCompleteChime();
          addNotification({
            title: `Pesanan #${ord.orderNumber} Selesai Dikonfirmasi! 🎉`,
            message: `Pembeli telah mengonfirmasi penerimaan barang belanjaan. Transaksi selesai. Terima kasih!`,
            type: 'order_completed',
          });
          return updated;
        }
        return ord;
      })
    );
  };

  // 7. Otomatisasi 5 Jam Selesai / Uji Coba Cepat
  const forceAutoCompleteOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const now = new Date().toISOString();
          const updated: Order = {
            ...ord,
            status: 'selesai',
            deliveryStatus: 'delivered',
            paymentStatus: 'paid',
            completedAt: now,
            completedBy: 'system_auto_5h',
            updatedAt: now,
          };
          saveOrderToFirestore(updated);
          playOrderCompleteChime();
          addNotification({
            title: `Pesanan #${ord.orderNumber} Selesai Otomatis (5 Jam) ⏱️`,
            message: `Pesanan telah otomatis diselesaikan oleh sistem sesuai batas waktu 5 jam penyerahan kurir.`,
            type: 'order_completed',
          });
          return updated;
        }
        return ord;
      })
    );
  };

  // Cek berkala batas waktu 5 jam otomatis selesai
  useEffect(() => {
    const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;
    const checkTimeout = () => {
      const now = Date.now();
      let hasUpdate = false;

      setOrders((prev) => {
        const updatedList = prev.map((ord) => {
          if (
            ord.deliveryStatus === 'delivered' &&
            ord.status !== 'selesai' &&
            ord.status !== 'dibatalkan'
          ) {
            const deliveredMs = ord.courierDeliveredAt
              ? new Date(ord.courierDeliveredAt).getTime()
              : ord.autoCompleteAt
              ? new Date(ord.autoCompleteAt).getTime() - FIVE_HOURS_MS
              : 0;

            if (deliveredMs > 0 && now - deliveredMs >= FIVE_HOURS_MS) {
              hasUpdate = true;
              const completedTime = new Date(deliveredMs + FIVE_HOURS_MS).toISOString();
              const autoFinished: Order = {
                ...ord,
                status: 'selesai',
                paymentStatus: 'paid',
                completedAt: completedTime,
                completedBy: 'system_auto_5h',
                updatedAt: new Date().toISOString(),
              };
              saveOrderToFirestore(autoFinished);
              addNotification({
                title: `Pesanan #${ord.orderNumber} Selesai Otomatis (5 Jam) ⏱️`,
                message: `Pesanan #${ord.orderNumber} telah otomatis diselesaikan karena telah melewati batas waktu 5 jam setelah diserahkan kurir.`,
                type: 'order_completed',
              });
              return autoFinished;
            }
          }
          return ord;
        });

        return hasUpdate ? updatedList : prev;
      });
    };

    checkTimeout();
    const timer = setInterval(checkTimeout, 20000); // periksa setiap 20 detik
    return () => clearInterval(timer);
  }, []);

  const updateDeliveryStatus = (orderId: string, deliveryStatus: DeliveryStatus, orderStatus?: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          let nextOrderStatus = orderStatus || ord.status;
          if (!orderStatus) {
            if (deliveryStatus === 'picked_up' || deliveryStatus === 'delivering') {
              nextOrderStatus = 'dikirim';
            } else if (deliveryStatus === 'delivered') {
              nextOrderStatus = 'dikirim'; // menunggu konfirmasi pembeli atau 5 jam
            }
          }
          const updated: Order = {
            ...ord,
            deliveryStatus,
            status: nextOrderStatus,
            updatedAt: new Date().toISOString(),
          };
          saveOrderToFirestore(updated);
          return updated;
        }
        return ord;
      })
    );
  };

  // Product management
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>): Product => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [newProd, ...prev]);
    return newProd;
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (selectedProduct?.id === updated.id) {
      setSelectedProduct(updated);
    }
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (selectedProduct?.id === productId) {
      setSelectedProduct(null);
    }
  };

  // Categories
  const addCategory = (category: Category) => setCategories((prev) => [...prev, category]);
  const updateCategory = (cat: Category) => setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
  const deleteCategory = (catId: string) => setCategories((prev) => prev.filter((c) => c.id !== catId));

  // News (Admin only)
  const addNews = (newsData: Omit<VillageNews, 'id'>) => {
    const newN: VillageNews = {
      ...newsData,
      id: `news-${Date.now()}`,
    };
    setNews((prev) => [newN, ...prev]);
  };

  const updateNews = (updated: VillageNews) => {
    setNews((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    if (selectedNews?.id === updated.id) setSelectedNews(updated);
  };

  const deleteNews = (newsId: string) => {
    setNews((prev) => prev.filter((n) => n.id !== newsId));
    if (selectedNews?.id === newsId) setSelectedNews(null);
  };

  // Ads (Admin only)
  const addAd = (adData: Omit<VillageAd, 'id' | 'createdAt'>) => {
    const newAd: VillageAd = {
      ...adData,
      id: `ad-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAds((prev) => [newAd, ...prev]);
  };

  const updateAd = (updated: VillageAd) => {
    setAds((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const deleteAd = (adId: string) => {
    setAds((prev) => prev.filter((a) => a.id !== adId));
  };

  // Banners
  const addBanner = (banner: Banner) => setBanners((prev) => [...prev, banner]);
  const updateBanner = (banner: Banner) => setBanners((prev) => prev.map((b) => (b.id === banner.id ? banner : b)));
  const deleteBanner = (bannerId: string) => setBanners((prev) => prev.filter((b) => b.id !== bannerId));

  // Reviews
  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setReviews((prev) => [newRev, ...prev]);

    // Recalculate product rating
    const prodReviews = [...reviews.filter((r) => r.productId === reviewData.productId), newRev];
    const avgRating = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;

    setProducts((prev) =>
      prev.map((p) => (p.id === reviewData.productId ? { ...p, rating: parseFloat(avgRating.toFixed(1)) } : p))
    );
  };

  const updateSettings = (newSettings: VillageSettings) => setSettings(newSettings);

  // Universal Store Creation: Any user can open their own lapak ("setiap pengguna dapat membuat lapak")
  const createStore = async (storeData: {
    name: string;
    description: string;
    dusun: string;
    address: string;
    whatsapp: string;
    logoUrl?: string;
    bannerUrl?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountHolder?: string;
    openingHours?: string;
    closedDays?: string;
  }): Promise<Store> => {
    if (!currentUser) throw new Error('Silakan masuk terlebih dahulu untuk membuka lapak.');

    const newStore = await createStoreInFirestore({
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      ...storeData,
    });

    // Update stores list
    setStores((prev) => [newStore, ...prev.filter((s) => s.id !== newStore.id)]);

    // Upgrade current user to seller role and attach store
    const updatedUser: User = {
      ...currentUser,
      storeId: newStore.id,
      shopName: newStore.name,
      shopDescription: newStore.description,
      shopWhatsapp: newStore.whatsapp,
      bankName: storeData.bankName,
      bankAccountNumber: storeData.bankAccountNumber,
      bankAccountHolder: storeData.bankAccountHolder,
      verifiedSeller: true,
      role: 'seller',
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    setActiveTab('seller');
    setIsCreateStoreModalOpen(false);

    return newStore;
  };

  // Courier Rating System ("tambahkan rating untuk kurir")
  const rateCourier = async (orderId: string, courierId: string, rating: number, review: string) => {
    const now = new Date().toISOString();
    // 1. Update order locally
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, courierRating: rating, courierReview: review, courierRatingCreatedAt: now }
          : o
      )
    );

    // 2. Update courier user stats locally
    if (courierId) {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === courierId) {
            const count = (u.courierRatingCount || 0) + 1;
            const currentAvg = u.courierRatingAverage || 5.0;
            const newAvg = Number(((currentAvg * (count - 1) + rating) / count).toFixed(1));
            return {
              ...u,
              courierRatingAverage: newAvg,
              courierRatingCount: count,
            };
          }
          return u;
        })
      );
    }

    // 3. Sync to Cloud Firestore
    try {
      await rateCourierInFirestore(orderId, courierId, rating, review);
    } catch (e) {
      console.warn('Gagal sinkronisasi rating kurir ke Firestore:', e);
    }
  };

  const resetToDefaults = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUser((INITIAL_USERS && INITIAL_USERS.length > 0) ? INITIAL_USERS[0] : null);
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setBanners(INITIAL_BANNERS);
    setNews(INITIAL_NEWS);
    setAds(INITIAL_ADS);
    setReviews(INITIAL_REVIEWS);
    setOrders([]);
    setUserCarts({});
    setFavorites([]);
    setSettings(INITIAL_SETTINGS);
    setDataSaverMode(false);
    setActiveTab('beranda');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isAuthLoading,
        authError,
        setAuthError,
        users,
        stores,
        selectedStore,
        selectedStoreId,
        activeCouriers,
        products,
        categories,
        banners,
        news,
        ads,
        orders,
        cart,
        reviews,
        settings,
        favorites,
        activeTab,
        selectedCategory,
        searchQuery,
        searchHistory,
        addSearchHistory,
        removeSearchHistory,
        clearSearchHistory,
        selectedProduct,
        selectedNews,
        isAuthModalOpen,
        isCheckoutModalOpen,
        isCartOpen,
        isSeoModalOpen,
        isCreateStoreModalOpen,
        sharingProduct,
        isShareModalOpen,
        dataSaverMode,

        setActiveTab,
        setSelectedStore,
        setSelectedStoreId,
        setSelectedCategory,
        setSearchQuery,
        setSelectedProduct,
        setSelectedNews,
        setIsAuthModalOpen,
        setIsCheckoutModalOpen,
        setIsCartOpen,
        setIsSeoModalOpen,
        setIsCreateStoreModalOpen,
        isCourierModalOpen,
        setIsCourierModalOpen,
        setSharingProduct,
        setIsShareModalOpen,
        openShareProduct,
        setDataSaverMode,

        // Order Tracking & Landmarks
        selectedOrderIdForTracking,
        setSelectedOrderIdForTracking,
        savedLandmarks,
        addSavedLandmark,
        removeSavedLandmark,

        switchUser,
        switchRole,
        login,
        register,
        loginWithGoogle,
        logout,

        // Courier Application Flow
        courierApplications,
        pendingCourierCount,
        applyCourier,
        approveCourierApplication,
        rejectCourierApplication,

        // Admin Manual Approval Flow
        adminApprovals,
        pendingAdminCount,
        approveAdminRequest,
        rejectAdminRequest,
        revokeAdminAccess,
        refreshAdminStatus,

        // Cart
        addToCart,
        removeFromCart,
        updateCartQuantity,
        updateCartItemNote,
        clearCart,
        getCartTotal,

        // Wishlist
        toggleFavorite,
        isFavorite,

        // Notifications & Sound
        notifications,
        unreadNotificationCount,
        addNotification,
        markAllNotificationsRead,
        clearNotifications,
        isSoundEnabled,
        setIsSoundEnabled,
        playTestChime,

        // Stores
        updateStore,
        verifyStore,
        createStore,
        rateCourier,

        // Orders & Deliveries
        createOrder,
        sendOrderWhatsAppToSeller,
        updateOrderStatus,
        assignCourierToOrder,
        updateDeliveryStatus,
        acceptOrder,
        processOrder,
        shipOrderWithCourier,
        courierPickupPackage,
        courierDeliverPackage,
        confirmOrderReceivedByBuyer,
        forceAutoCompleteOrder,

        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,

        addNews,
        updateNews,
        deleteNews,
        addAd,
        updateAd,
        deleteAd,

        addBanner,
        updateBanner,
        deleteBanner,
        addReview,

        updateSettings,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
