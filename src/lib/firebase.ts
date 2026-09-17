import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  getDocFromServer,
  query,
  orderBy,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  User,
  UserRole,
  AdminApprovalRequest,
  AdminApprovalStatus,
  CourierApplication,
  CourierApprovalStatus,
  Store,
  Order,
  Product,
} from '../types';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with custom databaseId if configured
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();

// Error handler types per Firebase Skill specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot per Firebase Skill specification
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Format phone/email to valid Firebase Auth email
export function formatAuthEmail(input: string): string {
  const trimmed = input.trim().toLowerCase();
  if (trimmed.includes('@')) {
    return trimmed;
  }
  // If it's a phone number, clean it and convert to phone@pasardesa.id
  const cleanPhone = trimmed.replace(/[^0-9]/g, '');
  return `${cleanPhone}@pasardesa.id`;
}

// Convert authentication errors to user-friendly Indonesian messages
export function translateFirebaseError(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Email atau Nomor HP ini sudah terdaftar. Silakan pilih tab "Masuk Akun".';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Nomor HP/Email atau kata sandi tidak cocok. Silakan periksa kembali.';
    case 'auth/user-not-found':
      return 'Akun belum ditemukan. Silakan periksa kembali nomor/email Anda atau daftar di tab "Daftar Akun Baru".';
    case 'auth/weak-password':
      return 'Kata sandi terlalu pendek. Masukkan minimal 6 karakter.';
    case 'auth/invalid-email':
      return 'Format email atau nomor HP tidak valid.';
    case 'auth/user-disabled':
      return 'Akun ini telah dinonaktifkan oleh administrator desa.';
    case 'auth/popup-closed-by-user':
      return 'Jendela login Google ditutup sebelum selesai.';
    case 'auth/popup-blocked':
      return 'Jendela pop-up Google diblokir oleh peramban. Silakan izinkan pop-up atau buka aplikasi di tab baru.';
    case 'auth/unauthorized-domain':
      return 'Domain web belum diotorisasi di Firebase Authentication. Buka aplikasi di tab baru atau gunakan Pilihan Cepat Masuk.';
    case 'auth/cancelled-popup-request':
      return 'Proses login pop-up dibatalkan.';
    case 'auth/network-request-failed':
      return 'Koneksi internet bermasalah. Periksa jaringan Anda.';
    case 'auth/operation-not-allowed':
    case 'auth/admin-restricted-operation':
      return 'Metode autentikasi ini memerlukan aktivasi di Firebase Console. Sistem otomatis mengalihkan akun ke penyimpanan desa.';
    default:
      return error?.message || 'Terjadi kendala saat memproses akun. Silakan coba lagi.';
  }
}

// Save or update user profile document in Firestore (/users/{userId})
export async function saveUserProfileToFirestore(userData: User): Promise<void> {
  const path = `users/${userData.id}`;
  try {
    const userRef = doc(db, 'users', userData.id);
    await setDoc(
      userRef,
      {
        ...userData,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Gagal menyimpan profil ke Firestore (offline fallback):', err);
  }
}

// Fetch user profile from Firestore by UID
export async function fetchUserProfileFromFirestore(uid: string): Promise<User | null> {
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as User;
    }
    return null;
  } catch (err) {
    console.warn('Gagal mengambil profil dari Firestore:', err);
    return null;
  }
}

// Save Admin Approval Request to Firestore (/admin_approvals/{requestId})
export async function saveAdminApprovalToFirestore(approval: AdminApprovalRequest): Promise<void> {
  const path = `admin_approvals/${approval.id}`;
  try {
    const approvalRef = doc(db, 'admin_approvals', approval.id);
    await setDoc(approvalRef, approval, { merge: true });
  } catch (err) {
    console.warn('Gagal menyimpan permohonan admin ke Firestore (fallback local):', err);
  }
}

// Fetch all Admin Approval Requests from Firestore
export async function fetchAdminApprovalsFromFirestore(): Promise<AdminApprovalRequest[]> {
  const path = 'admin_approvals';
  try {
    const colRef = collection(db, path);
    const snap = await getDocs(colRef);
    const results: AdminApprovalRequest[] = [];
    snap.forEach((docSnap) => {
      results.push(docSnap.data() as AdminApprovalRequest);
    });
    // Sort by requestedAt descending (newest first)
    return results.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  } catch (err) {
    console.warn('Gagal mengambil daftar permohonan admin dari Firestore:', err);
    return [];
  }
}

// Update Admin Approval Status in Firestore
export async function updateAdminApprovalInFirestore(
  requestId: string,
  userId: string,
  status: AdminApprovalStatus,
  reviewerName: string,
  rejectionReason?: string
): Promise<void> {
  const now = new Date().toISOString();
  try {
    // 1. Update approval request document
    const approvalRef = doc(db, 'admin_approvals', requestId);
    await setDoc(
      approvalRef,
      {
        status,
        reviewedAt: now,
        reviewedBy: reviewerName,
        rejectionReason: rejectionReason || '',
      },
      { merge: true }
    );

    // 2. Sync to user profile document in /users/{userId}
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        adminStatus: status,
        adminApprovedAt: status === 'approved' ? now : undefined,
        adminApprovedBy: status === 'approved' ? reviewerName : undefined,
        adminRejectionReason: status === 'rejected' ? rejectionReason : undefined,
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Gagal memperbarui status permohonan admin di Firestore:', err);
  }
}

// ==========================================
// Courier Application Flow (Pendaftaran Kurir Desa)
// ==========================================

// Save Courier Application to Firestore (/courier_applications/{applicationId})
export async function saveCourierApplicationToFirestore(appData: CourierApplication): Promise<void> {
  try {
    const appRef = doc(db, 'courier_applications', appData.id);
    await setDoc(appRef, appData, { merge: true });

    // Also update user's profile with courier approval status
    const userRef = doc(db, 'users', appData.userId);
    await setDoc(
      userRef,
      {
        courierApprovalStatus: appData.status,
        courierAppliedAt: appData.appliedAt,
        vehicleInfo: appData.vehicleInfo,
        vehicleType: appData.vehicleType,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Gagal menyimpan pendaftaran kurir ke Firestore:', err);
  }
}

// Fetch all Courier Applications from Firestore
export async function fetchCourierApplicationsFromFirestore(): Promise<CourierApplication[]> {
  try {
    const colRef = collection(db, 'courier_applications');
    const snap = await getDocs(colRef);
    const results: CourierApplication[] = [];
    snap.forEach((docSnap) => {
      results.push(docSnap.data() as CourierApplication);
    });
    // Sort by appliedAt descending (newest first)
    return results.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  } catch (err) {
    console.warn('Gagal mengambil daftar pendaftaran kurir dari Firestore:', err);
    return [];
  }
}

// Update Courier Application Status in Firestore (Admin sets status)
export async function updateCourierApplicationInFirestore(
  applicationId: string,
  userId: string,
  status: CourierApprovalStatus,
  reviewerName: string,
  vehicleInfo?: string,
  rejectionReason?: string
): Promise<void> {
  const now = new Date().toISOString();
  try {
    // 1. Update application document
    const appRef = doc(db, 'courier_applications', applicationId);
    await setDoc(
      appRef,
      {
        status,
        reviewedAt: now,
        reviewedBy: reviewerName,
        rejectionReason: rejectionReason || '',
      },
      { merge: true }
    );

    // 2. Sync to user document in /users/{userId}
    const userRef = doc(db, 'users', userId);
    const userUpdate: any = {
      courierApprovalStatus: status,
      courierApprovedAt: status === 'approved' ? now : undefined,
      courierRejectionReason: status === 'rejected' ? rejectionReason : undefined,
      updatedAt: now,
    };

    if (status === 'approved') {
      userUpdate.role = 'courier';
      userUpdate.courierStatus = 'ready';
      if (vehicleInfo) {
        userUpdate.vehicleInfo = vehicleInfo;
      }
    }

    await setDoc(userRef, userUpdate, { merge: true });
  } catch (err) {
    console.warn('Gagal memperbarui status pendaftaran kurir di Firestore:', err);
  }
}

// Save or update store in Firestore (/stores/{storeId})
export async function saveStoreToFirestore(store: Store): Promise<void> {
  try {
    const storeRef = doc(db, 'stores', store.id);
    await setDoc(storeRef, { ...store, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Gagal menyimpan profil lapak ke Firestore:', err);
  }
}

// Fetch all stores from Firestore
export async function fetchStoresFromFirestore(): Promise<Store[]> {
  try {
    const colRef = collection(db, 'stores');
    const snap = await getDocs(colRef);
    const results: Store[] = [];
    snap.forEach((docSnap) => results.push(docSnap.data() as Store));
    return results;
  } catch (err) {
    console.warn('Gagal mengambil data lapak dari Firestore:', err);
    return [];
  }
}

// Save or update order in Firestore (/orders/{orderId})
export async function saveOrderToFirestore(order: Order): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', order.id);
    await setDoc(orderRef, { ...order, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Gagal menyimpan pesanan ke Firestore:', err);
  }
}

// Fetch all orders from Firestore
export async function fetchOrdersFromFirestore(): Promise<Order[]> {
  try {
    const colRef = collection(db, 'orders');
    const snap = await getDocs(colRef);
    const results: Order[] = [];
    snap.forEach((docSnap) => results.push(docSnap.data() as Order));
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('Gagal mengambil data pesanan dari Firestore:', err);
    return [];
  }
}

// Register new user with Firebase Auth + Firestore
export async function firebaseRegisterUser(params: {
  emailOrPhone: string;
  password: string;
  name: string;
  phone: string;
  role?: UserRole;
  dusun: string;
  address?: string;
  shopName?: string;
  shopDescription?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  vehicleInfo?: string;
  adminPosition?: string;
  adminReason?: string;
}): Promise<{ user: User; approvalRequest?: AdminApprovalRequest; newStore?: Store }> {
  const userRole: UserRole = params.role || 'buyer';
  const email = formatAuthEmail(params.emailOrPhone);
  
  let firebaseUid = `user-${Date.now()}-${params.phone.replace(/[^0-9]/g, '').slice(-4)}`;
  let photoUrl: string | undefined = undefined;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, params.password);
    const firebaseUser = userCredential.user;
    firebaseUid = firebaseUser.uid;
    photoUrl = firebaseUser.photoURL || undefined;

    // Update Auth Profile Display Name
    try {
      await updateProfile(firebaseUser, {
        displayName: params.name,
      });
    } catch (e) {
      console.warn('Update profile error:', e);
    }
  } catch (fbAuthErr: any) {
    console.warn('Firebase Auth create user fallback (console email provider disabled):', fbAuthErr?.code || fbAuthErr?.message);
    // Proceed with fallback user ID so registration succeeds without interruption
  }

  const isDefaultSuperAdmin =
    email.toLowerCase() === 'yth.abdurrohman@gmail.com' ||
    params.emailOrPhone.toLowerCase() === 'yth.abdurrohman@gmail.com' ||
    params.emailOrPhone.toLowerCase() === 'bumdes@mekarterus.desa.id' ||
    params.emailOrPhone.toLowerCase() === 'bumdes@sukamaju.desa.id';

  // For Admin role: MUST start with 'pending' approval unless pre-approved super admin
  const adminStatus: AdminApprovalStatus =
    userRole === 'admin'
      ? isDefaultSuperAdmin
        ? 'approved'
        : 'pending'
      : 'none';

  const storeId = userRole === 'seller' ? `store-${Date.now()}` : undefined;

  const newUser: User = {
    id: firebaseUid,
    name: params.name || 'Warga Desa Mekar Terus',
    phone: params.phone,
    email: params.emailOrPhone.includes('@') ? params.emailOrPhone : undefined,
    role: userRole,
    dusun: params.dusun || 'Dusun Krajan',
    address: params.address || '',
    isActive: true,
    avatar:
      photoUrl ||
      `https://images.unsplash.com/photo-${
        userRole === 'admin'
          ? '1507003211169-0a1dd7228f2d'
          : userRole === 'seller'
          ? '1544717305-2782549b5136'
          : userRole === 'courier'
          ? '1534528741775-53994a69daeb'
          : '1535713875002-d1d0cf377fde'
      }?auto=format&fit=crop&w=250&q=80`,
    storeId,
    shopName: userRole === 'seller' ? params.shopName : undefined,
    shopDescription: userRole === 'seller' ? params.shopDescription : undefined,
    shopWhatsapp: userRole === 'seller' ? params.phone : undefined,
    bankName: userRole === 'seller' ? params.bankName : undefined,
    bankAccountNumber: userRole === 'seller' ? params.bankAccountNumber : undefined,
    bankAccountHolder: userRole === 'seller' ? params.bankAccountHolder : undefined,
    verifiedSeller: userRole === 'seller',
    vehicleInfo: userRole === 'courier' ? params.vehicleInfo || 'Motor Beat Desa' : undefined,
    courierStatus: userRole === 'courier' ? 'ready' : undefined,
    adminStatus,
    adminPosition: userRole === 'admin' ? params.adminPosition : undefined,
    adminReason: userRole === 'admin' ? params.adminReason : undefined,
    adminRequestedAt: userRole === 'admin' ? new Date().toISOString() : undefined,
    isSuperAdmin: isDefaultSuperAdmin,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Persist user to Cloud Firestore
  await saveUserProfileToFirestore(newUser);

  // If seller registered: Auto-create Store entity
  let newStore: Store | undefined;
  if (userRole === 'seller' && storeId) {
    newStore = {
      id: storeId,
      sellerId: newUser.id,
      name: params.shopName || `Lapak ${newUser.name}`,
      slug: (params.shopName || `lapak-${newUser.name}`).toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: params.shopDescription || 'Menjual aneka produk olahan dan hasil panen lokal warga desa.',
      dusun: newUser.dusun,
      address: params.address || `Dusun ${newUser.dusun}`,
      whatsapp: newUser.phone,
      logoUrl: newUser.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=250&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
      isVerified: false,
      rating: 5.0,
      totalSales: 0,
      createdAt: new Date().toISOString(),
    };
    await saveStoreToFirestore(newStore);
  }

  // If Admin role registered: Create dedicated AdminApprovalRequest
  let approvalRequest: AdminApprovalRequest | undefined;
  if (userRole === 'admin' && adminStatus === 'pending') {
    approvalRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      email: newUser.email,
      dusun: newUser.dusun,
      position: params.adminPosition || 'Pengurus Desa / BUMDes',
      reason: params.adminReason || 'Mengelola operasional pasar desa dan katalog UMKM warga.',
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };
    await saveAdminApprovalToFirestore(approvalRequest);
  }

  return { user: newUser, approvalRequest, newStore };
}

// Universal Store Creation for any registered user ("setiap pengguna dapat membuat lapak")
export async function createStoreInFirestore(params: {
  sellerId: string;
  sellerName: string;
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
}): Promise<Store> {
  const storeId = `store-${Date.now()}`;
  const slug = params.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const newStore: Store = {
    id: storeId,
    sellerId: params.sellerId,
    name: params.name,
    slug,
    description: params.description || 'Menjual aneka komoditas panen, makanan, dan produk UMKM warga desa.',
    dusun: params.dusun,
    address: params.address,
    whatsapp: params.whatsapp,
    logoUrl: params.logoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=250&q=80',
    bannerUrl: params.bannerUrl || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
    isVerified: true,
    rating: 5.0,
    totalSales: 0,
    openingHours: params.openingHours || '06:00 - 21:00 WIB',
    closedDays: params.closedDays || 'Buka Setiap Hari',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveStoreToFirestore(newStore);

  // Update user profile in Firestore
  try {
    const userRef = doc(db, 'users', params.sellerId);
    await setDoc(
      userRef,
      {
        storeId,
        shopName: params.name,
        shopDescription: params.description,
        shopWhatsapp: params.whatsapp,
        bankName: params.bankName || '',
        bankAccountNumber: params.bankAccountNumber || '',
        bankAccountHolder: params.bankAccountHolder || '',
        verifiedSeller: true,
        role: 'seller',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Gagal sinkronisasi peran toko user di Firestore:', err);
  }

  return newStore;
}

// Rate Courier in Firestore
export async function rateCourierInFirestore(
  orderId: string,
  courierId: string,
  rating: number,
  review: string
): Promise<void> {
  const now = new Date().toISOString();
  try {
    // 1. Update order
    const orderRef = doc(db, 'orders', orderId);
    await setDoc(
      orderRef,
      {
        courierRating: rating,
        courierReview: review,
        courierRatingCreatedAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    // 2. Update courier profile stats if courierId exists
    if (courierId) {
      const courierRef = doc(db, 'users', courierId);
      const snap = await getDoc(courierRef);
      if (snap.exists()) {
        const cData = snap.data() as User;
        const currentCount = cData.courierRatingCount || 0;
        const currentAvg = cData.courierRatingAverage || 5.0;
        const newCount = currentCount + 1;
        const newAvg = Number(((currentAvg * currentCount + rating) / newCount).toFixed(1));
        await setDoc(
          courierRef,
          {
            courierRatingAverage: newAvg,
            courierRatingCount: newCount,
            updatedAt: now,
          },
          { merge: true }
        );
      }
    }
  } catch (err) {
    console.warn('Gagal menyimpan rating kurir di Firestore:', err);
  }
}

// Login with Firebase Auth + Firestore
export async function firebaseLoginUser(params: {
  emailOrPhone: string;
  password: string;
}): Promise<User> {
  const email = formatAuthEmail(params.emailOrPhone);
  const userCredential = await signInWithEmailAndPassword(auth, email, params.password);
  const firebaseUser = userCredential.user;

  // Fetch from Firestore
  const profile = await fetchUserProfileFromFirestore(firebaseUser.uid);
  if (profile) {
    return profile;
  }

  // Fallback if document not yet created in Firestore
  const fallbackUser: User = {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || 'Warga Desa',
    phone: params.emailOrPhone.includes('@') ? '' : params.emailOrPhone,
    email: firebaseUser.email || undefined,
    role: 'buyer',
    dusun: 'Dusun Krajan',
    avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    verifiedSeller: false,
    adminStatus: 'none',
  };

  await saveUserProfileToFirestore(fallbackUser);
  return fallbackUser;
}

// Google Sign-In with Firebase Auth + Firestore
export async function firebaseGoogleSignIn(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  const firebaseUser = result.user;

  const existing = await fetchUserProfileFromFirestore(firebaseUser.uid);
  if (existing) {
    return existing;
  }

  const isDefaultSuperAdmin =
    firebaseUser.email?.toLowerCase() === 'yth.abdurrohman@gmail.com' ||
    firebaseUser.email?.toLowerCase() === 'bumdes@mekarterus.desa.id' ||
    firebaseUser.email?.toLowerCase() === 'bumdes@sukamaju.desa.id';

  const newUser: User = {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || 'Warga Desa Mekar Terus',
    phone: firebaseUser.phoneNumber || '',
    email: firebaseUser.email || undefined,
    role: isDefaultSuperAdmin ? 'admin' : 'buyer',
    adminStatus: isDefaultSuperAdmin ? 'approved' : 'none',
    isSuperAdmin: isDefaultSuperAdmin,
    dusun: 'Dusun Krajan',
    avatar:
      firebaseUser.photoURL ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    verifiedSeller: false,
    createdAt: new Date().toISOString(),
  };

  await saveUserProfileToFirestore(newUser);
  return newUser;
}

// Sign out from Firebase Auth
export async function firebaseSignOut(): Promise<void> {
  await signOut(auth);
}
