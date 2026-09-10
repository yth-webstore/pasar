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
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, UserRole } from '../types';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with custom databaseId if configured
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();

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

// Convert Firebase Auth errors to user-friendly Indonesian messages
export function translateFirebaseError(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Email atau Nomor HP ini sudah terdaftar. Silakan pilih tab "Masuk".';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email/Nomor HP atau kata sandi salah. Silakan periksa kembali.';
    case 'auth/weak-password':
      return 'Kata sandi terlalu pendek. Masukkan minimal 6 karakter.';
    case 'auth/invalid-email':
      return 'Format email atau nomor HP tidak valid.';
    case 'auth/user-disabled':
      return 'Akun ini telah dinonaktifkan oleh administrator desa.';
    case 'auth/popup-closed-by-user':
      return 'Login Google dibatalkan.';
    case 'auth/network-request-failed':
      return 'Koneksi internet bermasalah. Periksa jaringan Anda.';
    case 'auth/operation-not-allowed':
      return 'Metode login ini belum diaktifkan di konsol Firebase.';
    default:
      return error?.message || 'Terjadi kendala saat menghubungkan ke Firebase.';
  }
}

// Save or update user profile document in Firestore (/users/{userId})
export async function saveUserProfileToFirestore(userData: User): Promise<void> {
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

// Register new user with Firebase Auth + Firestore
export async function firebaseRegisterUser(params: {
  emailOrPhone: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole;
  dusun: string;
  shopName?: string;
  shopDescription?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
}): Promise<User> {
  const email = formatAuthEmail(params.emailOrPhone);
  const userCredential = await createUserWithEmailAndPassword(auth, email, params.password);
  const firebaseUser = userCredential.user;

  // Update Auth Profile Display Name
  try {
    await updateProfile(firebaseUser, {
      displayName: params.name,
    });
  } catch (e) {
    console.warn('Update profile error:', e);
  }

  const newUser: User = {
    id: firebaseUser.uid,
    name: params.name || firebaseUser.displayName || 'Warga Desa',
    phone: params.phone,
    email: firebaseUser.email || undefined,
    role: params.role,
    dusun: params.dusun || 'Dusun Krajan',
    avatar:
      firebaseUser.photoURL ||
      `https://images.unsplash.com/photo-${
        params.role === 'seller' ? '1544717305-2782549b5136' : '1535713875002-d1d0cf377fde'
      }?auto=format&fit=crop&w=250&q=80`,
    shopName: params.role === 'seller' ? params.shopName : undefined,
    shopDescription: params.role === 'seller' ? params.shopDescription : undefined,
    shopWhatsapp: params.role === 'seller' ? params.phone : undefined,
    bankName: params.role === 'seller' ? params.bankName : undefined,
    bankAccountNumber: params.role === 'seller' ? params.bankAccountNumber : undefined,
    bankAccountHolder: params.role === 'seller' ? params.bankAccountHolder : undefined,
    verifiedSeller: params.role === 'seller',
  };

  // Persist to Cloud Firestore
  await saveUserProfileToFirestore(newUser);

  return newUser;
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

  const newUser: User = {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || 'Warga Sukamaju',
    phone: firebaseUser.phoneNumber || '',
    email: firebaseUser.email || undefined,
    role: 'buyer',
    dusun: 'Dusun Krajan',
    avatar:
      firebaseUser.photoURL ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    verifiedSeller: false,
  };

  await saveUserProfileToFirestore(newUser);
  return newUser;
}

// Sign out from Firebase Auth
export async function firebaseSignOut(): Promise<void> {
  await signOut(auth);
}
