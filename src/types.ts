export type UserRole = 'buyer' | 'seller' | 'courier' | 'admin';

export type AdminApprovalStatus = 'none' | 'pending' | 'approved' | 'rejected';

export type CourierApprovalStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface User {
  id: string; // uid
  name: string; // nama
  phone: string; // nomorHp
  email?: string;
  role: UserRole;
  avatar?: string; // fotoProfil
  dusun: string; // Dusun / RT / RW in village
  address?: string; // alamat lengkap
  isActive?: boolean;
  
  // Pedagang (Seller / Lapak) attributes
  storeId?: string;
  shopName?: string;
  shopDescription?: string;
  shopWhatsapp?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  verifiedSeller?: boolean;

  // Kurir (Courier) attributes
  vehicleInfo?: string; // Contoh: "Honda Beat Merah (B 4567 DES)"
  vehicleType?: string; // Sepeda Motor / Sepeda Listrik / Bentor
  courierStatus?: 'ready' | 'delivering' | 'off';
  courierRatingAverage?: number;
  courierRatingCount?: number;
  courierApprovalStatus?: CourierApprovalStatus;
  courierAppliedAt?: string;
  courierApprovedAt?: string;
  courierRejectionReason?: string;

  // Admin manual approval flow attributes
  adminStatus?: AdminApprovalStatus;
  adminPosition?: string; // Jabatan / unit tugas di desa/BUMDes
  adminReason?: string; // Alasan pengajuan akses admin
  adminRequestedAt?: string;
  adminApprovedAt?: string;
  adminApprovedBy?: string;
  adminRejectionReason?: string;
  isSuperAdmin?: boolean; // Super admin utama desa
  // Patokan Rumah / Delivery Landmarks (Pilihan beberapa rumah ketika tidak di rumah)
  savedLandmarks?: HouseLandmark[];
  createdAt?: string;
  updatedAt?: string;
}

export interface HouseLandmark {
  id: string;
  label: string; // Contoh: "Rumah Utama", "Titip Rumah Nenek", "Kantor Desa / Balai", "Titip Tetangga"
  recipientNote?: string; // Contoh: "Titip teras / titip Bu Siti tetangga sebelah"
  dusun: string; // Dusun domisili
  detail: string; // Patokan lengkap, warna pagar, dekat fasilitas umum
  isDefault?: boolean;
}

export interface Store {
  id: string; // storeId
  sellerId: string;
  name: string; // nama lapak
  slug: string;
  description: string;
  dusun: string;
  address: string;
  whatsapp: string;
  logoUrl: string;
  bannerUrl?: string;
  isVerified: boolean;
  rating?: number;
  totalSales?: number;
  openingHours?: string; // e.g. "06:00 - 21:00 WIB"
  closedDays?: string; // e.g. "Minggu" / "Buka Setiap Hari" / "Jumat"
  openTime?: string;
  closeTime?: string;
  isManuallyClosed?: boolean;
  manualCloseReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminApprovalRequest {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  dusun: string;
  position: string;
  reason: string;
  status: AdminApprovalStatus;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface CourierApplication {
  id: string; // application ID
  userId: string;
  name: string;
  phone: string;
  email?: string;
  dusun: string;
  vehicleType: string; // Contoh: "Sepeda Motor", "Sepeda Listrik", "Bentor"
  vehicleInfo: string; // Contoh: "Honda Beat Merah (B 4567 DES)"
  driverLicenseNumber?: string; // SIM / Identitas
  notes?: string;
  status: CourierApprovalStatus;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
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
  id: string; // productId
  storeId: string; // ID lapak / toko
  sellerId: string;
  sellerName: string;
  sellerDusun: string;
  sellerWhatsapp: string;
  categoryId: string;
  categoryName: string;
  name: string;
  slug: string;
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
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  storeId?: string;
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
  catatanProduk?: string; // Khusus spesifikasi produk (misal: "Pedas sedang, tanpa timun")
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'delivering'
  | 'completed'
  | 'cancelled'
  | 'menunggu'
  | 'diproses'
  | 'dikirim'
  | 'selesai'
  | 'dibatalkan';

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed';

export type DeliveryStatus = 'waiting' | 'assigned' | 'picked_up' | 'delivering' | 'delivered';

export type PaymentMethod = 'cod' | 'transfer' | 'qris';

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl: string;
  sellerId: string;
  sellerName: string;
  catatanProduk?: string;
}

export interface Order {
  id: string; // orderId
  orderNumber: string; // e.g. "ORD-001"
  invoiceNumber?: string; // alias for orderNumber
  buyerId: string;
  storeId: string; // Single store per order
  storeName?: string;
  sellerId: string;
  sellerName: string;
  sellerWhatsapp?: string;
  courierId?: string;
  courierName?: string;
  courierPhone?: string;
  courierVehicle?: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerDusun: string;
  patokanRumah?: string; // Patokan / penanda rumah pengantaran
  landmarkLabel?: string; // Label rumah (misal: "Rumah Utama", "Titip Rumah Nenek")
  items: OrderItem[];
  subtotal: number;
  ongkir: number; // deliveryFee
  deliveryFee?: number; // alias
  total: number;
  buyerNote?: string; // Catatan untuk Penjual (e.g., “Contoh: sambelnya yang banyak ya 🤣🌶️”)
  notes?: string; // general notes
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  paymentMethod: PaymentMethod;
  paymentProofUrl?: string;
  deliveryMethod: 'antar_desa' | 'ambil_toko';
  orderAcceptedAt?: string; // Penjual menerima pesanan
  orderProcessedAt?: string; // Penjual memproses pesanan
  orderShippedAt?: string; // Penjual mengirim & memilih kurir
  courierPickedUpAt?: string; // Kurir menerima paket dari penjual
  courierDeliveredAt?: string; // Kurir menyerahkan paket ke pembeli
  autoCompleteAt?: string; // Batas waktu 5 jam otomatis selesai
  completedAt?: string; // Waktu pesanan selesai
  completedBy?: 'buyer' | 'system_auto_5h' | 'admin' | 'seller';
  courierRating?: number; // 1 to 5 stars
  courierReview?: string;
  courierRatingCreatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  orderNumber: string;
  courierId: string;
  courierName: string;
  storeId: string;
  storeName: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerDusun: string;
  status: DeliveryStatus;
  pickupTime?: string;
  deliveredTime?: string;
  createdAt: string;
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
  author: string; // Admin Desa Mekar Terus
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
  adminAuthCode?: string;
}
