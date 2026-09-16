import React, { createContext, useContext, useState, useEffect } from 'react';
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
  revokeAdminAccess: (userId: string) => Promise<void>;
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
  }) => Promise<Store>;
  rateCourier: (orderId: string, courierId: string, rating: number, review: string) => Promise<void>;

  // Orders
  createOrder: (orderData: {
    buyerAddress: string;
    buyerDusun: string;
    buyerPhone: string;
    buyerName?: string;
    deliveryMethod: 'antar_desa' | 'ambil_toko';
    paymentMethod: 'cod' | 'transfer' | 'qris';
    paymentProofUrl?: string;
    buyerNote?: string;
    notes?: string;
  }) => Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignCourierToOrder: (orderId: string, courierId: string, courierName: string) => void;
  updateDeliveryStatus: (orderId: string, deliveryStatus: DeliveryStatus, orderStatus?: OrderStatus) => void;

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
    return item ? JSON.parse(item) : defaultValue;
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => getStorage('users', INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = getStorage<User | null>('currentUser', null);
    if (saved) return saved;
    return INITIAL_USERS[0]; // Default to Siti Rahmawati (Buyer)
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [stores, setStores] = useState<Store[]>(() => getStorage('stores', INITIAL_STORES));
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(() => getStorage('products', INITIAL_PRODUCTS));
  const [categories, setCategories] = useState<Category[]>(() => getStorage('categories', INITIAL_CATEGORIES));
  const [banners, setBanners] = useState<Banner[]>(() => getStorage('banners', INITIAL_BANNERS));
  const [news, setNews] = useState<VillageNews[]>(() => getStorage('news', INITIAL_NEWS));
  const [ads, setAds] = useState<VillageAd[]>(() => getStorage('ads', INITIAL_ADS));
  const [reviews, setReviews] = useState<Review[]>(() => getStorage('reviews', INITIAL_REVIEWS));
  const [settings, setSettings] = useState<VillageSettings>(() => getStorage('settings', INITIAL_SETTINGS));
  const [orders, setOrders] = useState<Order[]>(() => getStorage('orders', INITIAL_ORDERS));
  const [cart, setCart] = useState<CartItem[]>(() => getStorage('cart', []));
  const [favorites, setFavorites] = useState<string[]>(() => getStorage('favorites', []));
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
        dusun: 'Dusun Sukamaju RW 03',
        vehicleType: 'Sepeda Motor',
        vehicleInfo: 'Honda Beat Merah (B 4567 DES)',
        driverLicenseNumber: 'SIM C Aktif',
        notes: 'Berpengalaman mengantar belanja hasil tani dan kebutuhan warga antar dusun.',
        status: 'approved',
        appliedAt: '2026-03-01T08:00:00.000Z',
        reviewedAt: '2026-03-01T09:00:00.000Z',
        reviewedBy: 'Admin BUMDes Sukamaju',
      },
    ])
  );

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<'beranda' | 'kategori' | 'lapak' | 'keranjang' | 'pesanan' | 'profil' | 'admin' | 'seller' | 'courier' | 'toko'>('beranda');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
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
  useEffect(() => setStorage('cart', cart), [cart]);
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
        `Beli ${selectedProduct.name} murah berkualitas dari ${selectedProduct.sellerName} di Desa Sukamaju. Stok ready, bayar COD atau transfer.`,
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
        'Pasar Desa Mandiri Sukamaju - Jual Beli Produk Warga & UMKM Desa',
        'Belanja sembako murah, panen sayur padi organik, camilan khas, dan kerajinan desa. Dukung UMKM tetangga sendiri.'
      );
    } else if (activeTab === 'kategori') {
      updatePageSEO(
        'Katalog Kategori Produk Desa',
        'Temukan aneka sembako, hasil bumi tani desa, makanan minuman tradisional, dan kerajinan tangan.'
      );
    } else if (activeTab === 'admin') {
      updatePageSEO(
        'Dashboard Admin Desa Sukamaju & BUMDes',
        'Panel kendali pengelolaan pasar desa, UMKM, berita desa, dan laporan keuangan.'
      );
    } else if (activeTab === 'seller' || activeTab === 'toko') {
      updatePageSEO(
        'Kelola Toko UMKM Desa',
        'Manajemen produk, stok barang, promo diskon, dan pesanan pelanggan desa.'
      );
    }
  }, [activeTab, selectedProduct, selectedNews]);

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
      if (password && password.trim().length >= 6) {
        // Authenticate with live Firebase Auth and fetch Firestore doc
        try {
          const user = await firebaseLoginUser({ emailOrPhone, password });
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
          if (fbErr?.code === 'auth/operation-not-allowed') {
            // If Email/Password is not enabled in Firebase Console yet,
            // fall back to authenticating with local registered user list or Firestore
            const cleanPhone = emailOrPhone.replace(/[^0-9]/g, '');
            const matched = users.find(
              (u) =>
                (u.phone && u.phone.includes(cleanPhone)) ||
                (u.email && u.email.toLowerCase() === emailOrPhone.toLowerCase()) ||
                u.role === roleHint
            );
            if (matched) {
              setCurrentUser(matched);
              if (matched.role === 'admin') setActiveTab('admin');
              else if (matched.role === 'seller') setActiveTab('seller');
              setIsAuthModalOpen(false);
              return true;
            }
          }
          throw fbErr;
        }
      } else {
        // Instant role / demo switcher fallback
        const cleanPhone = emailOrPhone.replace(/[^0-9]/g, '');
        const matched = users.find((u) => u.phone.includes(cleanPhone) || u.role === roleHint);
        if (matched) {
          setCurrentUser(matched);
          if (matched.role === 'admin') setActiveTab('admin');
          else if (matched.role === 'seller') setActiveTab('seller');
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

        setUsers((prev) => [...prev, newUser]);
        if (approvalRequest) {
          setAdminApprovals((prev) => [approvalRequest, ...prev.filter((a) => a.id !== approvalRequest.id)]);
        }
        setCurrentUser(newUser);
        if (newUser.role === 'admin') setActiveTab('admin');
        else if (newUser.role === 'seller') setActiveTab('seller');
        setIsAuthModalOpen(false);
        return newUser;
      } catch (fbErr: any) {
        if (fbErr?.code === 'auth/operation-not-allowed') {
          // Graceful fallback: If Firebase Auth Email/Password isn't enabled yet in console,
          // save the account directly to Cloud Firestore and local storage so the user is not blocked!
          const generatedId = `user-${Date.now()}`;
          const isDefaultSuperAdmin =
            userData.email?.toLowerCase() === 'yth.abdurrohman@gmail.com' ||
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

          await saveUserProfileToFirestore(fallbackUser);

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
            await saveAdminApprovalToFirestore(req);
            setAdminApprovals((prev) => [req, ...prev.filter((a) => a.id !== req.id)]);
          }

          setUsers((prev) => [...prev, fallbackUser]);
          setCurrentUser(fallbackUser);
          if (fallbackUser.role === 'admin') setActiveTab('admin');
          else if (fallbackUser.role === 'seller') setActiveTab('seller');
          setIsAuthModalOpen(false);
          return fallbackUser;
        }
        throw fbErr;
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

  const revokeAdminAccess = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const reason = 'Hak akses admin dicabut oleh Administrator Utama Desa.';
    const updatedUser: User = {
      ...user,
      adminStatus: 'rejected',
      adminRejectionReason: reason,
    };
    await saveUserProfileToFirestore(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
    if (currentUser?.id === userId) {
      setCurrentUser(updatedUser);
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

    const reviewer = currentUser?.name || 'Admin BUMDes Sukamaju';
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

    const reviewer = currentUser?.name || 'Admin BUMDes Sukamaju';
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
    setActiveTab('beranda');
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, notes?: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity), notes: notes || item.notes }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity), notes }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: Math.min(item.product.stock, qty) };
        }
        return item;
      })
    );
  };

  const updateCartItemNote = (productId: string, note: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, notes: note, catatanProduk: note }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => {
    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    return { subtotal, count };
  };

  // Wishlist
  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

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

      const orderItem: Order = {
        id: `ord-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
        orderNumber,
        invoiceNumber,
        buyerId: currentUser?.id || 'guest-warga',
        buyerName: orderData.buyerName || currentUser?.name || 'Warga Desa Sukamaju',
        buyerPhone: orderData.buyerPhone || currentUser?.phone || '',
        buyerAddress: orderData.buyerAddress,
        buyerDusun: orderData.buyerDusun,
        storeId,
        storeName,
        sellerId,
        sellerName,
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
    return newOrders;
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
            updatedAt: new Date().toISOString(),
          };
          saveOrderToFirestore(updated);
          return updated;
        }
        return ord;
      })
    );
  };

  const updateDeliveryStatus = (orderId: string, deliveryStatus: DeliveryStatus, orderStatus?: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          let nextOrderStatus = orderStatus || ord.status;
          if (!orderStatus) {
            if (deliveryStatus === 'picked_up' || deliveryStatus === 'delivering') {
              nextOrderStatus = 'dikirim';
            } else if (deliveryStatus === 'delivered') {
              nextOrderStatus = 'selesai';
            }
          }
          const updated: Order = {
            ...ord,
            deliveryStatus,
            status: nextOrderStatus,
            paymentStatus: deliveryStatus === 'delivered' ? 'paid' : ord.paymentStatus,
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
    setCurrentUser(INITIAL_USERS[0]);
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setBanners(INITIAL_BANNERS);
    setNews(INITIAL_NEWS);
    setAds(INITIAL_ADS);
    setReviews(INITIAL_REVIEWS);
    setOrders([]);
    setCart([]);
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

        // Stores
        updateStore,
        verifyStore,
        createStore,
        rateCourier,

        // Orders & Deliveries
        createOrder,
        updateOrderStatus,
        assignCourierToOrder,
        updateDeliveryStatus,

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
