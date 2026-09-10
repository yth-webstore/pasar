import React, { useState } from 'react';
import {
  X,
  UserCheck,
  Store,
  ShieldCheck,
  User as UserIcon,
  Phone,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    login,
    register,
    loginWithGoogle,
    switchRole,
    isAuthLoading,
    authError,
    setAuthError,
    currentUser,
  } = useApp();

  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form states
  const [role, setRole] = useState<UserRole>('buyer');
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState(''); // phone or email
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dusun, setDusun] = useState('Dusun Krajan RT 02');
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [bankName, setBankName] = useState('BRI Unit Desa');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const displayError = localError || authError;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setAuthError(null);

    if (!identifier.trim()) {
      setLocalError('Masukkan nomor WhatsApp atau email Anda.');
      return;
    }

    if (password && password.length < 6) {
      setLocalError('Kata sandi minimal 6 karakter untuk akun Firebase.');
      return;
    }

    const success = await login(identifier.trim(), password.trim() || undefined, role);
    if (!success && !password) {
      // If user didn't provide a password and no matching phone found, ask for password
      setLocalError('Silakan masukkan kata sandi akun Firebase Anda (minimal 6 karakter).');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setAuthError(null);

    if (!name.trim()) {
      setLocalError('Nama lengkap wajib diisi.');
      return;
    }
    if (!identifier.trim()) {
      setLocalError('Nomor WhatsApp / HP wajib diisi.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setLocalError('Kata sandi Firebase wajib diisi minimal 6 karakter.');
      return;
    }
    if (confirmPassword && password !== confirmPassword) {
      setLocalError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    const user = await register({
      name: name.trim(),
      phone: identifier.trim(),
      email: email.trim() || undefined,
      password: password.trim(),
      role,
      dusun,
      shopName: role === 'seller' ? shopName.trim() : undefined,
      shopDescription: role === 'seller' ? shopDescription.trim() : undefined,
      bankName: role === 'seller' ? bankName.trim() : undefined,
      bankAccountNumber: role === 'seller' ? bankAccountNumber.trim() : undefined,
      bankAccountHolder: role === 'seller' ? bankAccountHolder.trim() : undefined,
    });

    if (user) {
      setIsAuthModalOpen(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError(null);
    setAuthError(null);
    await loginWithGoogle();
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={() => setIsAuthModalOpen(false)}
    >
      <div
        id="auth-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in duration-200"
      >
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-700" />
            <div>
              <h2 className="text-base font-extrabold text-neutral-900 leading-tight">
                {tab === 'login' ? 'Masuk ke Pasar Desa' : 'Daftar Akun Warga'}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-bold text-emerald-800">
                  Terhubung ke Firebase Auth & Cloud Firestore
                </span>
              </div>
            </div>
          </div>
          <button
            id="close-auth-modal-btn"
            onClick={() => setIsAuthModalOpen(false)}
            className="w-8 h-8 rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-700 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Demo Logins Bar (1-Click) */}
        <div className="p-3.5 bg-emerald-50/80 border-b border-emerald-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Pilih Cepat Profil Demo (1-Klik):
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">Uji coba instan</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              id="demo-buyer-btn"
              type="button"
              onClick={() => {
                switchRole('buyer');
                setIsAuthModalOpen(false);
              }}
              className="p-2 rounded-xl bg-white border border-emerald-200 hover:border-emerald-500 text-center font-bold text-emerald-900 shadow-xs transition"
            >
              <UserIcon className="w-3.5 h-3.5 mx-auto text-emerald-700 mb-0.5" />
              <span>Pembeli</span>
            </button>
            <button
              id="demo-seller-btn"
              type="button"
              onClick={() => {
                switchRole('seller');
                setIsAuthModalOpen(false);
              }}
              className="p-2 rounded-xl bg-white border border-emerald-200 hover:border-emerald-500 text-center font-bold text-emerald-900 shadow-xs transition"
            >
              <Store className="w-3.5 h-3.5 mx-auto text-emerald-700 mb-0.5" />
              <span>Penjual</span>
            </button>
            <button
              id="demo-admin-btn"
              type="button"
              onClick={() => {
                switchRole('admin');
                setIsAuthModalOpen(false);
              }}
              className="p-2 rounded-xl bg-white border border-emerald-200 hover:border-emerald-500 text-center font-bold text-emerald-900 shadow-xs transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 mx-auto text-emerald-700 mb-0.5" />
              <span>Admin Desa</span>
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-neutral-200 bg-white">
          <button
            id="tab-login-btn"
            onClick={() => {
              setTab('login');
              setLocalError(null);
              setAuthError(null);
            }}
            className={`flex-1 py-3 text-xs font-extrabold text-center transition border-b-2 ${
              tab === 'login'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Masuk Akun
          </button>
          <button
            id="tab-register-btn"
            onClick={() => {
              setTab('register');
              setLocalError(null);
              setAuthError(null);
            }}
            className={`flex-1 py-3 text-xs font-extrabold text-center transition border-b-2 ${
              tab === 'register'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Daftar Akun Baru
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {displayError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium flex items-start gap-2 animate-shake">
              <span className="text-red-500 font-bold shrink-0">⚠️</span>
              <span className="leading-relaxed">{displayError}</span>
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            id="google-signin-btn"
            type="button"
            disabled={isAuthLoading}
            onClick={handleGoogleLogin}
            className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isAuthLoading ? 'Menghubungkan...' : 'Lanjut dengan Google (Firebase)'}</span>
          </button>

          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-[11px] text-neutral-400 font-medium">atau via form desa</span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Masuk Sebagai:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['buyer', 'seller', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2 rounded-xl font-bold transition text-xs capitalize ${
                        role === r
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {r === 'buyer' ? 'Pembeli' : r === 'seller' ? 'Penjual' : 'Admin'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Nomor WhatsApp atau Email *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-identifier-input"
                    type="text"
                    required
                    placeholder="08xxxxxxxxxx atau nama@email.com"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setLocalError(null);
                    }}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-neutral-700">Kata Sandi Firebase *</label>
                  <span className="text-[10px] text-neutral-400">Minimal 6 karakter</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Kata sandi akun Anda"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setLocalError(null);
                    }}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-neutral-300 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="submit-login-btn"
                type="submit"
                disabled={isAuthLoading}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAuthLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menghubungkan ke Firebase...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Masuk dengan Firebase</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Daftar Sebagai:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('buyer')}
                    className={`py-2 rounded-xl font-bold transition ${
                      role === 'buyer' ? 'bg-emerald-700 text-white' : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    Warga Pembeli
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('seller')}
                    className={`py-2 rounded-xl font-bold transition ${
                      role === 'seller' ? 'bg-emerald-700 text-white' : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    Penjual UMKM
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Nama Lengkap (KTP) *</label>
                <input
                  id="reg-name-input"
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setLocalError(null);
                  }}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Nomor WhatsApp / HP *</label>
                <input
                  id="reg-phone-input"
                  type="tel"
                  required
                  placeholder="08xxxxxxxxxx"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setLocalError(null);
                  }}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Email <span className="text-neutral-400 font-normal">(opsional)</span>
                </label>
                <input
                  id="reg-email-input"
                  type="email"
                  placeholder="nama@email.com (otomatis dibuat jika kosong)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Kata Sandi *</label>
                  <input
                    id="reg-password-input"
                    type="password"
                    required
                    placeholder="Min 6 karakter"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setLocalError(null);
                    }}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Ulangi Sandi *</label>
                  <input
                    id="reg-confirm-password-input"
                    type="password"
                    required
                    placeholder="Ulangi sandi"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setLocalError(null);
                    }}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Dusun / RT / RW *</label>
                <input
                  id="reg-dusun-input"
                  type="text"
                  required
                  placeholder="Contoh: Dusun Krajan RT 02 / RW 01"
                  value={dusun}
                  onChange={(e) => setDusun(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
                />
              </div>

              {role === 'seller' && (
                <div className="pt-2 border-t border-neutral-200 space-y-2.5 bg-neutral-50 p-3 rounded-2xl">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-emerald-700" />
                    <span>Data Usaha & Rekening Toko Desa</span>
                  </div>
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Nama Toko / Usaha *</label>
                    <input
                      id="reg-shopname-input"
                      type="text"
                      required
                      placeholder="Contoh: Beras Berkah Sukamaju"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="w-full p-2 rounded-xl border border-neutral-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Keterangan Produk Toko</label>
                    <input
                      id="reg-shopdesc-input"
                      type="text"
                      placeholder="Contoh: Jual beras hasil sawah sendiri & bibit sayur"
                      value={shopDescription}
                      onChange={(e) => setShopDescription(e.target.value)}
                      className="w-full p-2 rounded-xl border border-neutral-300 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Bank / E-Wallet</label>
                      <input
                        type="text"
                        placeholder="BRI / Mandiri / DANA"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full p-2 rounded-xl border border-neutral-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">No. Rekening</label>
                      <input
                        type="text"
                        placeholder="1234-xxxx-xxxx"
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        className="w-full p-2 rounded-xl border border-neutral-300 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                id="submit-register-btn"
                type="submit"
                disabled={isAuthLoading}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAuthLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mendaftarkan ke Firebase...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Daftar Akun Baru ke Firebase</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
