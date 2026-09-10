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
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_BANNERS,
  INITIAL_NEWS,
  INITIAL_ADS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
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
} from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface AppContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthLoading: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  users: User[];
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
  activeTab: 'beranda' | 'kategori' | 'keranjang' | 'pesanan' | 'profil' | 'admin' | 'seller' | 'toko';
  selectedCategory: string | null;
  searchQuery: string;
  selectedProduct: Product | null;
  selectedNews: VillageNews | null;
  isAuthModalOpen: boolean;
  isCheckoutModalOpen: boolean;
  isCartOpen: boolean;
  isSeoModalOpen: boolean;
  dataSaverMode: boolean;
  
  // Setters
  setActiveTab: (tab: 'beranda' | 'kategori' | 'keranjang' | 'pesanan' | 'profil' | 'admin' | 'seller' | 'toko') => void;
  setSelectedCategory: (catId: string | null) => void;
  setSearchQuery: (q: string) => void;
  setSelectedProduct: (p: Product | null) => void;
  setSelectedNews: (n: VillageNews | null) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsCheckoutModalOpen: (open: boolean) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsSeoModalOpen: (open: boolean) => void;
  setDataSaverMode: (val: boolean) => void;

  // Actions
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  login: (emailOrPhone: string, password?: string, role?: UserRole) => Promise<boolean>;
  register: (userData: Partial<User> & { password?: string; emailOrPhone?: string }) => Promise<User | null>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;

  // Cart
  addToCart: (product: Product, quantity?: number, notes?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  getCartTotal: () => { subtotal: number; count: number };

  // Wishlist
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;

  // Orders
  createOrder: (orderData: {
    buyerAddress: string;
    buyerDusun: string;
    buyerPhone: string;
    deliveryMethod: 'antar_desa' | 'ambil_toko';
    paymentMethod: 'cod' | 'transfer';
    paymentProofUrl?: string;
    notes?: string;
  }) => Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

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

  const [products, setProducts] = useState<Product[]>(() => getStorage('products', INITIAL_PRODUCTS));
  const [categories, setCategories] = useState<Category[]>(() => getStorage('categories', INITIAL_CATEGORIES));
  const [banners, setBanners] = useState<Banner[]>(() => getStorage('banners', INITIAL_BANNERS));
  const [news, setNews] = useState<VillageNews[]>(() => getStorage('news', INITIAL_NEWS));
  const [ads, setAds] = useState<VillageAd[]>(() => getStorage('ads', INITIAL_ADS));
  const [reviews, setReviews] = useState<Review[]>(() => getStorage('reviews', INITIAL_REVIEWS));
  const [settings, setSettings] = useState<VillageSettings>(() => getStorage('settings', INITIAL_SETTINGS));
  const [orders, setOrders] = useState<Order[]>(() => getStorage('orders', []));
  const [cart, setCart] = useState<CartItem[]>(() => getStorage('cart', []));
  const [favorites, setFavorites] = useState<string[]>(() => getStorage('favorites', []));
  const [dataSaverMode, setDataSaverMode] = useState<boolean>(() => getStorage('dataSaverMode', false));

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<'beranda' | 'kategori' | 'keranjang' | 'pesanan' | 'profil' | 'admin' | 'seller' | 'toko'>('beranda');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedNews, setSelectedNews] = useState<VillageNews | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isSeoModalOpen, setIsSeoModalOpen] = useState<boolean>(false);

  // Sync state to LocalStorage
  useEffect(() => setStorage('users', users), [users]);
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
        setIsAuthModalOpen(false);
        return true;
      } else {
        // Instant role / demo switcher fallback
        const cleanPhone = emailOrPhone.replace(/[^0-9]/g, '');
        const matched = users.find((u) => u.phone.includes(cleanPhone) || u.role === roleHint);
        if (matched) {
          setCurrentUser(matched);
          setIsAuthModalOpen(false);
          return true;
        }
        setAuthError('Masukkan kata sandi minimal 6 karakter untuk masuk dengan Firebase.');
        return false;
      }
    } catch (err: any) {
      console.error('Firebase Login Error:', err);
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

      // Create user in Firebase Auth and record profile in Firestore
      const newUser = await firebaseRegisterUser({
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
      });

      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      setIsAuthModalOpen(false);
      return newUser;
    } catch (err: any) {
      console.error('Firebase Register Error:', err);
      setAuthError(translateFirebaseError(err));
      return null;
    } finally {
      setIsAuthLoading(false);
    }
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

  // Orders creation grouped by seller
  const createOrder = (orderData: {
    buyerAddress: string;
    buyerDusun: string;
    buyerPhone: string;
    deliveryMethod: 'antar_desa' | 'ambil_toko';
    paymentMethod: 'cod' | 'transfer';
    paymentProofUrl?: string;
    notes?: string;
  }): Order[] => {
    if (cart.length === 0) return [];

    // Group cart items by seller
    const groups: { [sellerId: string]: CartItem[] } = {};
    cart.forEach((item) => {
      const sId = item.product.sellerId;
      if (!groups[sId]) groups[sId] = [];
      groups[sId].push(item);
    });

    const newOrders: Order[] = [];
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    Object.keys(groups).forEach((sellerId) => {
      const items = groups[sellerId];
      const seller = items[0].product.sellerName;
      const subtotal = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
      const deliveryFee = orderData.deliveryMethod === 'antar_desa' ? settings.deliveryFeeStandard : 0;
      const total = subtotal + deliveryFee;

      const orderItem = {
        id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        invoiceNumber: `INV/DESA/${now.getFullYear()}/${Math.floor(100000 + Math.random() * 900000)}`,
        buyerId: currentUser?.id || 'guest-warga',
        buyerName: currentUser?.name || 'Warga Desa Sukamaju',
        buyerPhone: orderData.buyerPhone || currentUser?.phone || '',
        buyerAddress: orderData.buyerAddress,
        buyerDusun: orderData.buyerDusun,
        sellerId: sellerId,
        sellerName: seller,
        items: items.map((it) => ({
          productId: it.product.id,
          productName: it.product.name,
          price: it.product.price,
          quantity: it.quantity,
          unit: it.product.unit,
          imageUrl: it.product.imageUrl,
          sellerId: it.product.sellerId,
          sellerName: it.product.sellerName,
        })),
        subtotal,
        deliveryFee,
        total,
        paymentMethod: orderData.paymentMethod,
        paymentProofUrl: orderData.paymentProofUrl,
        status: 'menunggu' as OrderStatus,
        deliveryMethod: orderData.deliveryMethod,
        notes: orderData.notes,
        createdAt: dateStr,
        updatedAt: dateStr,
      };

      newOrders.push(orderItem);

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
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status,
              updatedAt: new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
            }
          : ord
      )
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
        dataSaverMode,

        setActiveTab,
        setSelectedCategory,
        setSearchQuery,
        setSelectedProduct,
        setSelectedNews,
        setIsAuthModalOpen,
        setIsCheckoutModalOpen,
        setIsCartOpen,
        setIsSeoModalOpen,
        setDataSaverMode,

        switchUser,
        switchRole,
        login,
        register,
        loginWithGoogle,
        logout,

        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartTotal,

        toggleFavorite,
        isFavorite,

        createOrder,
        updateOrderStatus,

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
