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
  KeyRound,
  Building2,
  Info,
  Clock,
  ShieldAlert,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, User } from '../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    login,
    register,
    loginWithGoogle,
    isAuthLoading,
    authError,
    setAuthError,
    settings,
    setActiveTab,
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
  
  // Seller specific
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [bankName, setBankName] = useState('BRI Unit Desa');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');

  // Admin manual approval registration fields
  const [adminPosition, setAdminPosition] = useState('');
  const [adminReason, setAdminReason] = useState('');
  const [adminPendingSubmitted, setAdminPendingSubmitted] = useState(false);
  const [submittedAdminUser, setSubmittedAdminUser] = useState<User | null>(null);

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
      setLocalError('Kata sandi minimal 6 karakter.');
      return;
    }

    const success = await login(identifier.trim(), password.trim() || undefined);
    if (!success && !password) {
      setLocalError('Silakan masukkan kata sandi akun Anda (minimal 6 karakter).');
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
      setLocalError('Kata sandi wajib diisi minimal 6 karakter.');
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
      role: 'buyer',
      dusun: dusun.trim() || 'Dusun Krajan',
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
                {adminPendingSubmitted
                  ? 'Status Permohonan Akun Admin'
                  : tab === 'login'
                  ? 'Masuk ke Pasar Desa'
                  : 'Daftar Akun Warga'}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-800">
                  {adminPendingSubmitted ? 'Protokol Persetujuan Manual' : 'Sistem Akun Desa & Data Terenkripsi'}
                </span>
              </div>
            </div>
          </div>
          <button
            id="close-auth-modal-btn"
            onClick={() => {
              setIsAuthModalOpen(false);
              setAdminPendingSubmitted(false);
            }}
            className="w-8 h-8 rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-700 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {adminPendingSubmitted ? (
          <div className="p-6 text-center flex flex-col items-center justify-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-700 shadow-inner">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                Persetujuan Manual (Approval Flow)
              </div>
              <h3 className="text-lg font-black text-neutral-900 pt-1">
                Permohonan Admin Sukses Diajukan!
              </h3>
              <p className="text-xs text-neutral-600 max-w-sm leading-relaxed mx-auto">
                Demi perlindungan kas BUMDes dan integritas data warga, akun admin baru berstatus{' '}
                <strong className="text-amber-800 font-bold">Menunggu Persetujuan Manual</strong> oleh Administrator Utama / Kepala Desa.
              </p>
            </div>

            <div className="w-full bg-neutral-50 rounded-2xl border border-neutral-200 p-4 text-left text-xs space-y-2.5">
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-500 font-medium">Nama Pemohon:</span>
                <span className="font-bold text-neutral-900">{submittedAdminUser?.name}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-500 font-medium">Jabatan / Satgas:</span>
                <span className="font-bold text-neutral-900">{submittedAdminUser?.adminPosition || 'Pengurus Desa'}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-500 font-medium">Domisili / Wilayah:</span>
                <span className="font-bold text-neutral-900">{submittedAdminUser?.dusun}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-500 font-medium">No. WhatsApp:</span>
                <span className="font-bold text-neutral-900">{submittedAdminUser?.phone}</span>
              </div>
              <div className="flex justify-between items-center pt-0.5">
                <span className="text-neutral-500 font-medium">Status Akun:</span>
                <span className="px-2.5 py-1 rounded-full bg-amber-200/80 text-amber-900 font-black text-[11px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                  Menunggu Review Admin Utama
                </span>
              </div>
            </div>

            <div className="w-full space-y-2 pt-2 text-xs">
              <button
                id="view-admin-status-btn"
                type="button"
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setActiveTab('admin');
                  setAdminPendingSubmitted(false);
                }}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <span>Buka Dasbor Status Permohonan Admin</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/${(settings.villageWhatsapp || '6281234567890').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Halo Super Admin ${settings.villageName}, saya ${submittedAdminUser?.name} (${submittedAdminUser?.adminPosition || 'Pengurus Desa'}) baru saja mendaftar permohonan akun Admin Pasar Desa. Mohon verifikasi dan persetujuannya di sistem. Terima kasih.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Konfirmasi Langsung ke Admin Utama via WA</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setActiveTab('beranda');
                  setAdminPendingSubmitted(false);
                }}
                className="w-full py-2 text-neutral-600 hover:text-neutral-900 text-xs font-semibold"
              >
                Kembali ke Beranda Pasar Desa
              </button>
            </div>
          </div>
        ) : (
          <>
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
            <span>{isAuthLoading ? 'Menghubungkan...' : 'Lanjut dengan Akun Google'}</span>
          </button>

          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-[11px] text-neutral-400 font-medium">atau via form pendaftaran</span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
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
                  <label className="font-bold text-neutral-700">Kata Sandi Akun *</label>
                  <span className="text-[10px] text-neutral-400">Minimal 6 karakter</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata sandi akun Anda"
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
                    <span>Sedang Memproses Masuk...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Masuk ke Akun</span>
                  </>
                )}
              </button>

              {/* Quick test accounts for seamless access */}
              <div className="pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold text-neutral-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Masuk Cepat Uji Coba Peran
                  </span>
                  <span className="text-[10px] text-neutral-400">1-Klik Langsung Aktif</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIdentifier('081234567890');
                      login('081234567890', undefined, 'buyer');
                    }}
                    className="p-2 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/70 text-left transition group"
                  >
                    <div className="font-bold text-blue-950 text-[11px] truncate">Siti Rahmawati</div>
                    <div className="text-[10px] text-blue-700">Warga / Pembeli</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIdentifier('085712345678');
                      login('085712345678', undefined, 'seller');
                    }}
                    className="p-2 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/70 text-left transition group"
                  >
                    <div className="font-bold text-emerald-950 text-[11px] truncate">Pak Budi Santoso</div>
                    <div className="text-[10px] text-emerald-700">Pedagang UMKM</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIdentifier('082211445566');
                      login('082211445566', undefined, 'courier');
                    }}
                    className="p-2 rounded-xl bg-orange-50/70 hover:bg-orange-100/70 border border-orange-200/70 text-left transition group"
                  >
                    <div className="font-bold text-orange-950 text-[11px] truncate">Kang Ujang</div>
                    <div className="text-[10px] text-orange-700">Kurir Antar Desa</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIdentifier('yth.abdurrohman@gmail.com');
                      login('yth.abdurrohman@gmail.com', undefined, 'admin');
                    }}
                    className="p-2 rounded-xl bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200/70 text-left transition group"
                  >
                    <div className="font-bold text-purple-950 text-[11px] truncate">Admin BUMDes</div>
                    <div className="text-[10px] text-purple-700">Super Admin Desa</div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Nama Lengkap (Sesuai KTP / Panggilan) *</label>
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
                <label className="font-bold text-neutral-700 block mb-1">Nomor WhatsApp / HP Aktif *</label>
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
                  placeholder="nama@email.com (opsional)"
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
                <label className="font-bold text-neutral-700 block mb-1">Alamat Lengkap *</label>
                <input
                  id="reg-dusun-input"
                  type="text"
                  required
                  placeholder="Contoh: Jl. Poros Desa No. 12, RT 02 / RW 01, Dusun Krajan"
                  value={dusun}
                  onChange={(e) => setDusun(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                <Store className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Ingin jualan hasil bumi atau produk UMKM?</strong> Semua pengguna yang terdaftar dapat langsung membuka lapak dagang gratis kapan saja melalui menu Profil atau tombol Buka Lapak.
                </span>
              </div>

              <button
                id="submit-register-btn"
                type="submit"
                disabled={isAuthLoading}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAuthLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mendaftarkan Akun...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Daftar Akun Warga Baru</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </>
    )}
  </div>
</div>
  );
};
