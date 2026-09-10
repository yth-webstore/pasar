export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  dusun: string; // Dusun / RT / RW in village
  shopName?: string;
  shopDescription?: string;
  shopWhatsapp?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  verifiedSeller?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sellerId: string;
  sellerName: string;
  sellerDusun: string;
  sellerWhatsapp: string;
  categoryId: string;
  categoryName: string;
  price: number;
  originalPrice?: number; // for discount display
  unit: string; // e.g. "kg", "ikat", "botol", "porsi", "buah", "paket", "hari"
  stock: number;
  description: string;
  imageUrl: string;
  rating: number;
  soldCount: number;
  isPromo: boolean;
  promoBadge?: string;
  isPopular?: boolean;
  featured?: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userDusun: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'menunggu' | 'diproses' | 'dikirim' | 'selesai' | 'dibatalkan';

export type PaymentMethod = 'cod' | 'transfer';

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl: string;
  sellerId: string;
  sellerName: string;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerDusun: string;
  sellerId: string;
  sellerName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentProofUrl?: string;
  status: OrderStatus;
  deliveryMethod: 'antar_desa' | 'ambil_toko';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  imageUrl: string;
  targetCategory?: string;
  active: boolean;
  linkText?: string;
}

export interface VillageNews {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  author: string; // Admin Desa Sukamaju
  date: string;
  category: 'pengumuman' | 'kegiatan' | 'bumdes' | 'pertanian';
  imageUrl?: string;
  isImportant?: boolean;
}

export interface VillageAd {
  id: string;
  title: string;
  businessName: string;
  ownerName: string;
  dusun: string;
  whatsapp: string;
  description: string;
  badge: string;
  imageUrl: string;
  active: boolean;
  createdAt: string;
}

export interface VillageSettings {
  villageName: string;
  district: string;
  regency: string;
  postalCode: string;
  bumdesName: string;
  tagline: string;
  emergencyContact: string;
  deliveryFeeStandard: number;
  bumdesKasRekening: {
    bank: string;
    number: string;
    holder: string;
  };
  dataSaverDefault: boolean;
}
