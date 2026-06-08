import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Building2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

const SPECIALTIES = [
  'Neurologi Umum',
  'Neurochirurgi',
  'Neurofisiologi',
  'Neuroimaging',
  'Pediatri Neurologi',
  'Lainnya',
];

type PasswordStrength = 'weak' | 'medium' | 'strong' | '';

function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return '';
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const length = password.length;

  const score = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  if (length < 6 || score <= 1) return 'weak';
  if (length >= 8 && score >= 3) return 'strong';
  return 'medium';
}

function strengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'Lemah';
    case 'medium':
      return 'Sedang';
    case 'strong':
      return 'Kuat';
    default:
      return '';
  }
}

function strengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'strong':
      return 'bg-green-500';
    default:
      return 'bg-gray-200';
  }
}

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }: AuthModalProps) {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSpecialty, setRegSpecialty] = useState('');
  const [regInstitution, setRegInstitution] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const passwordStrength = getPasswordStrength(regPassword);

  useEffect(() => {
    if (isOpen) {
      lastFocusedRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      setError(null);
      setTimeout(() => firstInputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
      lastFocusedRef.current?.focus();
    }
  }, [isOpen]);

  // Reset forms when switching tabs
  useEffect(() => {
    setError(null);
  }, [activeTab]);

  const resetForms = useCallback(() => {
    setLoginEmail('');
    setLoginPassword('');
    setRegName('');
    setRegEmail('');
    setRegSpecialty('');
    setRegInstitution('');
    setRegPassword('');
    setRegConfirmPassword('');
    setRememberMe(false);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForms();
    onClose();
  }, [onClose, resetForms]);

  // Focus trap
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    },
    [handleClose],
  );

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(loginEmail, loginPassword);

    setLoading(false);
    if (result.success) {
      handleClose();
    } else {
      setError(result.message);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!regName.trim()) {
      setError('Nama lengkap wajib diisi.');
      return;
    }
    if (!regEmail.trim()) {
      setError('Email wajib diisi.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      setError('Format email tidak valid.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    const result = await register(regName, regEmail, regPassword, regSpecialty || undefined);
    setLoading(false);

    if (result.success) {
      handleClose();
    } else {
      setError(result.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal panel */}
      <div
        ref={modalRef}
        onKeyDown={handleKeyDown}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[440px] overflow-hidden animate-modalIn"
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-[#64748b] hover:bg-[#f0f9ff] transition-colors z-10"
          aria-label="Tutup modal"
        >
          <X size={20} />
        </button>

        {/* Tabs */}
        <div className="flex border-b border-[#cffafe]">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
              activeTab === 'login' ? 'text-[#0e7490]' : 'text-[#64748b] hover:text-[#164e63]'
            }`}
            aria-selected={activeTab === 'login'}
            role="tab"
          >
            Masuk
            {activeTab === 'login' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-[#0e7490] rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
              activeTab === 'register' ? 'text-[#0e7490]' : 'text-[#64748b] hover:text-[#164e63]'
            }`}
            aria-selected={activeTab === 'register'}
            role="tab"
          >
            Daftar
            {activeTab === 'register' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-[#0e7490] rounded-full" />
            )}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-600">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <div className="p-6">
          <h2 id="auth-modal-title" className="sr-only">
            {activeTab === 'login' ? 'Masuk ke akun' : 'Buat akun baru'}
          </h2>

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-[#164e63] mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                  <input
                    ref={firstInputRef}
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#cffafe] bg-white text-[#164e63] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15 transition-all"
                    placeholder="email@rumahsakit.co.id"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-[#164e63] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#cffafe] bg-white text-[#164e63] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15 transition-all"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#0e7490] transition-colors"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#cffafe] text-[#0e7490] focus:ring-[#0e7490] accent-[#0e7490]"
                  />
                  <span className="text-sm text-[#64748b]">Ingat saya</span>
                </label>
                <button type="button" className="text-sm text-[#0e7490] hover:underline">
                  Lupa password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#0e7490] text-white font-medium text-sm transition-all duration-200 hover:bg-[#155e75] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                Masuk
              </button>

              <p className="text-center text-xs text-[#64748b]">
                Akun demo:{' '}
                <span className="text-[#0e7490] font-medium">admin@neurolibrary.id / admin123</span> atau{' '}
                <span className="text-[#0e7490] font-medium">user@neurolibrary.id / user123</span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium text-[#164e63] mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                  <input
                    ref={firstInputRef}
                    id="reg-name"
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#cffafe] bg-white text-[#164e63] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15 transition-all"
                    placeholder="Dr. Nama Anda"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-[#164e63] mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                  <input
                    id="reg-email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#cffafe] bg-white text-[#164e63] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15 transition-all"
                    placeholder="email@rumahsakit.co.id"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-specialty" className="block text-sm font-medium text-[#164e63] mb-1.5">
                  Spesialisasi
                </label>
                <div className="relative">
                  <GraduationCap size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] z-10" />
                  <select
                    id="reg-specialty"
                    value={regSpecialty}
                    onChange={(e) => setRegSpecialty(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#cffafe] bg-white text-[#164e63] focus:outline-none focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15 transition-all appearance-none text-sm"
                  >
                    <option value="">Pilih spesialisasi...</option>
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="reg-institution" className="block text-sm font-medium text-[#164e63] mb-1.5">
                  Institusi
                </label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                  <input
                    id="reg-institution"
                    type="text"
                    value={regInstitution}
                    onChange={(e) => setRegInstitution(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#cffafe] bg-white text-[#164e63] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15 transition-all"
                    placeholder="Rumah Sakit / Universitas"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-[#164e63] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#cffafe] bg-white text-[#164e63] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15 transition-all"
                    placeholder="Minimal 6 karakter"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#0e7490] transition-colors"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Password strength indicator */}
                {regPassword && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      <div className={`h-1 flex-1 rounded-full ${strengthColor(passwordStrength)}`} />
                      <div
                        className={`h-1 flex-1 rounded-full ${passwordStrength === 'medium' || passwordStrength === 'strong' ? strengthColor(passwordStrength) : 'bg-gray-200'}`}
                      />
                      <div
                        className={`h-1 flex-1 rounded-full ${passwordStrength === 'strong' ? strengthColor(passwordStrength) : 'bg-gray-200'}`}
                      />
                    </div>
                    <span className="text-xs text-[#64748b]">
                      {strengthLabel(passwordStrength)}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="reg-confirm" className="block text-sm font-medium text-[#164e63] mb-1.5">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                  <input
                    id="reg-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#cffafe] bg-white text-[#164e63] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15 transition-all"
                    placeholder="Ulangi password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#0e7490] transition-colors"
                    aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {regConfirmPassword && regConfirmPassword === regPassword && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                    <Check size={12} />
                    Password cocok
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#0e7490] text-white font-medium text-sm transition-all duration-200 hover:bg-[#155e75] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                Daftar
              </button>
            </form>
          )}

          <p className="mt-4 text-center text-xs text-[#64748b]">
            {activeTab === 'login' ? (
              <>
                Belum punya akun?{' '}
                <button
                  onClick={() => setActiveTab('register')}
                  className="text-[#0e7490] font-medium hover:underline"
                >
                  Daftar
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{' '}
                <button
                  onClick={() => setActiveTab('login')}
                  className="text-[#0e7490] font-medium hover:underline"
                >
                  Masuk
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
