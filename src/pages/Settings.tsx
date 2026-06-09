// @ts-nocheck
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Palette,
  Bell,
  UserCircle,
  Database,
  Sun,
  Moon,
  Monitor,
  Globe,
  Trash2,
  AlertTriangle,
  Download,
  FileJson,
  FileSpreadsheet,
  BookOpen,
  History,
  ChevronLeft,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  Type,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/useToast';
import { books } from '@/data/books';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface NotificationSettings {
  bookRecommendations: boolean;
  commentNotifications: boolean;
  newsletterSubscription: boolean;
}

type ThemePreference = 'light' | 'dark' | 'system';
type LanguagePreference = 'id' | 'en';
type FontSizePreference = 'small' | 'medium' | 'large';

interface BookmarkedBook {
  bookId: string;
  savedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Demo data                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_BOOKMARKS: BookmarkedBook[] = [
  { bookId: '2', savedAt: '2024-06-07T08:00:00Z' },
  { bookId: '6', savedAt: '2024-06-04T12:30:00Z' },
  { bookId: '9', savedAt: '2024-06-02T15:00:00Z' },
  { bookId: '13', savedAt: '2024-05-30T09:15:00Z' },
  { bookId: '15', savedAt: '2024-05-28T11:00:00Z' },
];

/* ------------------------------------------------------------------ */
/*  Sub-component: AnimatedCounter                                    */
/* ------------------------------------------------------------------ */

function AnimatedCounter({ target, duration = 800 }: { target: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let startTime: number | null = null;
    let rafId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplay(Math.floor(eased * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, target, duration]);

  return <span ref={ref}>{display}</span>;
}

/* ------------------------------------------------------------------ */
/*  Sub-component: ToggleSwitch                                       */
/* ------------------------------------------------------------------ */

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-[48px] h-[26px] rounded-full transition-colors duration-300 flex-shrink-0 ${
        checked ? 'bg-[#0e7490]' : 'bg-[#cffafe]'
      }`}
    >
      <span
        className="absolute top-[3px] left-[3px] w-5 h-5 bg-white rounded-full shadow transition-transform duration-300"
        style={{ transform: checked ? 'translateX(22px)' : 'translateX(0)' }}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-component: SettingsSection                                    */
/* ------------------------------------------------------------------ */

function SettingsSection({
  icon,
  title,
  description,
  children,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      className="bg-white rounded-2xl border border-[#cffafe] overflow-hidden"
    >
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#cffafe]">
        {icon}
        <div>
          <h3 className="text-[1.125rem] font-semibold text-[#164e63]">{title}</h3>
          <p className="text-xs text-[#94a3b8]">{description}</p>
        </div>
      </div>
      <div className="divide-y divide-[#f0f9ff]">{children}</div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-component: SettingsRow                                        */
/* ------------------------------------------------------------------ */

function SettingsRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-6 py-4 flex items-center justify-between gap-4">
      <span className="text-sm text-[#64748b]">{label}</span>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

/* ================================================================== */
/*  MAIN COMPONENT                                                    */
/* ================================================================== */

export default function Settings() {
  const { success } = useToast();

  /* -- LocalStorage state -- */
  const [notifications, setNotifications] = useLocalStorage<NotificationSettings>(
    'neurolibrary-notifications',
    {
      bookRecommendations: true,
      commentNotifications: true,
      newsletterSubscription: false,
    },
  );

  const [themePreference, setThemePreference] = useLocalStorage<ThemePreference>(
    'neurolibrary-theme-pref',
    'system',
  );

  const [languagePreference, setLanguagePreference] = useLocalStorage<LanguagePreference>(
    'neurolibrary-language-pref',
    'id',
  );

  const [fontSizePreference, setFontSizePreference] = useLocalStorage<FontSizePreference>(
    'neurolibrary-fontsize-pref',
    'medium',
  );

  /* -- Password form state -- */
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  /* -- UI state -- */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearReadingModal, setShowClearReadingModal] = useState(false);
  const [showClearDownloadModal, setShowClearDownloadModal] = useState(false);

  /* -- Handlers: Appearance -- */
  const handleThemeChange = useCallback(
    (theme: ThemePreference) => {
      setThemePreference(theme);
      success(`Tema diubah ke ${theme === 'light' ? 'Terang' : theme === 'dark' ? 'Gelap' : 'Sistem'}`);

      // Apply theme immediately
      const root = window.document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefersDark);
        localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
      }
    },
    [setThemePreference, success],
  );

  const handleLanguageChange = useCallback(
    (lang: LanguagePreference) => {
      setLanguagePreference(lang);
      success(`Bahasa diubah ke ${lang === 'id' ? 'Indonesia' : 'English'}`);
    },
    [setLanguagePreference, success],
  );

  const handleFontSizeChange = useCallback(
    (size: FontSizePreference) => {
      setFontSizePreference(size);
      success(`Ukuran font diubah ke ${size === 'small' ? 'Kecil' : size === 'medium' ? 'Sedang' : 'Besar'}`);

      // Apply font size
      const root = window.document.documentElement;
      root.style.fontSize = size === 'small' ? '14px' : size === 'large' ? '18px' : '16px';
    },
    [setFontSizePreference, success],
  );

  /* -- Handlers: Notifications -- */
  const handleToggleNotification = useCallback(
    (key: keyof NotificationSettings) => {
      setNotifications((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        return next;
      });
      success('Preferensi notifikasi diperbarui');
    },
    [setNotifications, success],
  );

  /* -- Handlers: Password -- */
  const handleChangePassword = useCallback(() => {
    setPasswordError('');

    if (!oldPassword) {
      setPasswordError('Password lama wajib diisi');
      return;
    }
    if (!newPassword) {
      setPasswordError('Password baru wajib diisi');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok');
      return;
    }

    // Simulate success - in real app, this would call an API
    success('Password berhasil diubah');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }, [oldPassword, newPassword, confirmPassword, success]);

  /* -- Handlers: Delete Account -- */
  const handleDeleteAccount = useCallback(() => {
    localStorage.removeItem('neurolibrary-profile');
    localStorage.removeItem('neurolibrary-reading-history');
    localStorage.removeItem('neurolibrary-download-history');
    localStorage.removeItem('neurolibrary-bookmarks-list');
    localStorage.removeItem('neurolibrary-notifications');
    success('Akun berhasil dihapus');
    setShowDeleteModal(false);
    window.location.href = '/';
  }, [success]);

  /* -- Handlers: Data -- */
  const handleClearReadingHistory = useCallback(() => {
    localStorage.removeItem('neurolibrary-reading-history');
    success('Riwayat bacaan dihapus');
    setShowClearReadingModal(false);
  }, [success]);

  const handleClearDownloadHistory = useCallback(() => {
    localStorage.removeItem('neurolibrary-download-history');
    success('Riwayat unduhan dihapus');
    setShowClearDownloadModal(false);
  }, [success]);

  const handleExportBookmarks = useCallback(
    (format: 'json' | 'csv') => {
      const stored = localStorage.getItem('neurolibrary-bookmarks-list');
      const bookmarkList: BookmarkedBook[] = stored ? JSON.parse(stored) : DEFAULT_BOOKMARKS;

      const enrichedBookmarks = bookmarkList
        .map((b) => {
          const book = books.find((bk) => bk.id === b.bookId);
          return book
            ? { ...b, title: book.title, author: book.author, category: book.category }
            : b;
        });

      if (format === 'json') {
        const dataStr = JSON.stringify(enrichedBookmarks, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'neurolibrary-bookmarks.json';
        a.click();
        URL.revokeObjectURL(url);
        success('Bookmark diexport sebagai JSON');
      } else {
        const headers = ['bookId', 'title', 'author', 'category', 'savedAt'];
        const rows = enrichedBookmarks.map((b: Record<string, string>) =>
          headers.map((h) => `"${(b[h] || '').replace(/"/g, '""')}"`).join(','),
        );
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'neurolibrary-bookmarks.csv';
        a.click();
        URL.revokeObjectURL(url);
        success('Bookmark diexport sebagai CSV');
      }
    },
    [success],
  );

  const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

  return (
    <div className="min-h-[100dvh] pb-12">
      {/* ============================================================ */}
      {/*  Page Header                                                  */}
      {/* ============================================================ */}
      <section
        className="relative -mt-6 pt-10 pb-8 px-4 sm:px-6"
        style={{
          background: 'linear-gradient(135deg, #164e63 0%, #0e7490 50%, #14b8a6 100%)',
        }}
      >
        <div className="max-w-[900px] mx-auto">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            <ChevronLeft size={16} />
            Kembali ke Profil
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            className="font-display text-2xl sm:text-3xl font-bold text-white"
          >
            Pengaturan
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeOutExpo }}
            className="text-white/70 text-sm mt-1"
          >
            Kelola preferensi aplikasi, notifikasi, dan akun Anda
          </motion.p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Settings Sections                                            */}
      {/* ============================================================ */}
      <section className="max-w-[900px] mx-auto px-4 sm:px-6 mt-8 space-y-6">
        {/* --- Section 1: Appearance --- */}
        <SettingsSection
          icon={<Palette size={20} className="text-[#0e7490]" />}
          title="Tampilan"
          description="Sesuaikan tema, ukuran font, dan bahasa"
          index={0}
        >
          {/* Theme */}
          <div className="px-6 py-4">
            <label className="block text-sm font-medium text-[#164e63] mb-3">Tema</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'light' as const, label: 'Terang', icon: Sun },
                { value: 'dark' as const, label: 'Gelap', icon: Moon },
                { value: 'system' as const, label: 'Sistem', icon: Monitor },
              ]).map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleThemeChange(t.value)}
                  className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all ${
                    themePreference === t.value
                      ? 'border-[#0e7490] bg-[#f0f9ff] text-[#0e7490]'
                      : 'border-[#cffafe] text-[#64748b] hover:bg-[#f0f9ff]/50'
                  }`}
                >
                  <t.icon size={20} />
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </div>
            {/* Theme preview */}
            <div
              className={`mt-3 rounded-xl border p-4 transition-colors ${
                themePreference === 'dark'
                  ? 'bg-[#1e293b] border-[#334155]'
                  : 'bg-[#f8fafc] border-[#cffafe]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    themePreference === 'dark' ? 'bg-[#334155]' : 'bg-white border border-[#cffafe]'
                  }`}
                >
                  <BookOpen size={18} className={themePreference === 'dark' ? 'text-[#94a3b8]' : 'text-[#0e7490]'} />
                </div>
                <div>
                  <div
                    className={`text-sm font-medium ${
                      themePreference === 'dark' ? 'text-white' : 'text-[#164e63]'
                    }`}
                  >
                    Pratinjau Tema
                  </div>
                  <div
                    className={`text-xs ${
                      themePreference === 'dark' ? 'text-[#94a3b8]' : 'text-[#64748b]'
                    }`}
                  >
                    Tampilan ini menunjukkan bagaimana tema akan terlihat
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Font Size */}
          <div className="px-6 py-4">
            <label className="block text-sm font-medium text-[#164e63] mb-3">
              <Type size={14} className="inline mr-1" />
              Ukuran Font
            </label>
            <div className="inline-flex rounded-lg border border-[#cffafe] overflow-hidden">
              {([
                { value: 'small' as const, label: 'Kecil' },
                { value: 'medium' as const, label: 'Sedang' },
                { value: 'large' as const, label: 'Besar' },
              ]).map((f) => (
                <button
                  key={f.value}
                  onClick={() => handleFontSizeChange(f.value)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    fontSizePreference === f.value
                      ? 'bg-[#0e7490] text-white'
                      : 'text-[#64748b] hover:bg-[#f0f9ff]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="px-6 py-4">
            <label className="block text-sm font-medium text-[#164e63] mb-3">
              <Globe size={14} className="inline mr-1" />
              Bahasa
            </label>
            <div className="inline-flex rounded-lg border border-[#cffafe] overflow-hidden">
              {([
                { value: 'id' as const, label: 'Indonesia' },
                { value: 'en' as const, label: 'English' },
              ]).map((l) => (
                <button
                  key={l.value}
                  onClick={() => handleLanguageChange(l.value)}
                  className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    languagePreference === l.value
                      ? 'bg-[#0e7490] text-white'
                      : 'text-[#64748b] hover:bg-[#f0f9ff]'
                  }`}
                >
                  <Globe size={14} />
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </SettingsSection>

        {/* --- Section 2: Notifications --- */}
        <SettingsSection
          icon={<Bell size={20} className="text-[#f59e0b]" />}
          title="Notifikasi"
          description="Atur notifikasi email yang ingin Anda terima"
          index={1}
        >
          <SettingsRow label="Notifikasi buku baru">
            <ToggleSwitch
              checked={notifications.bookRecommendations}
              onChange={() => handleToggleNotification('bookRecommendations')}
            />
          </SettingsRow>
          <SettingsRow label="Notifikasi komentar">
            <ToggleSwitch
              checked={notifications.commentNotifications}
              onChange={() => handleToggleNotification('commentNotifications')}
            />
          </SettingsRow>
          <SettingsRow label="Langganan newsletter">
            <ToggleSwitch
              checked={notifications.newsletterSubscription}
              onChange={() => handleToggleNotification('newsletterSubscription')}
            />
          </SettingsRow>
        </SettingsSection>

        {/* --- Section 3: Account --- */}
        <SettingsSection
          icon={<UserCircle size={20} className="text-[#0e7490]" />}
          title="Akun"
          description="Ubah password atau hapus akun"
          index={2}
        >
          {/* Change Password Form */}
          <div className="px-6 py-4">
            <label className="block text-sm font-medium text-[#164e63] mb-3">
              <Lock size={14} className="inline mr-1" />
              Ubah Password
            </label>
            <div className="space-y-3 max-w-md">
              {/* Old password */}
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Password lama"
                  className="w-full px-3 py-2 pr-10 rounded-lg border border-[#cffafe] bg-white text-sm text-[#164e63] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490] focus:shadow-[0_0_0_3px_rgba(8,145,178,0.15)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]"
                >
                  {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* New password */}
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Password baru"
                  className="w-full px-3 py-2 pr-10 rounded-lg border border-[#cffafe] bg-white text-sm text-[#164e63] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490] focus:shadow-[0_0_0_3px_rgba(8,145,178,0.15)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Confirm password */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi password baru"
                  className="w-full px-3 py-2 pr-10 rounded-lg border border-[#cffafe] bg-white text-sm text-[#164e63] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490] focus:shadow-[0_0_0_3px_rgba(8,145,178,0.15)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {passwordError && (
                <p className="text-xs text-[#ef4444]">{passwordError}</p>
              )}

              <button
                onClick={handleChangePassword}
                className="px-4 py-2 rounded-lg bg-[#0e7490] text-white text-sm font-medium hover:bg-[#155e75] transition-colors"
              >
                Ubah Password
              </button>
            </div>
          </div>

          {/* Delete Account */}
          <div className="px-6 py-4">
            <label className="block text-sm font-medium text-[#ef4444] mb-3">Zona Berbahaya</label>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 text-sm text-[#ef4444] hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-red-100"
            >
              <Trash2 size={16} />
              Hapus Akun
            </button>
          </div>
        </SettingsSection>

        {/* --- Section 4: Data --- */}
        <SettingsSection
          icon={<Database size={20} className="text-[#14b8a6]" />}
          title="Data"
          description="Kelola data dan riwayat Anda"
          index={3}
        >
          {/* Export Bookmarks */}
          <div className="px-6 py-4">
            <label className="block text-sm font-medium text-[#164e63] mb-3">Export Bookmark</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportBookmarks('json')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#cffafe] text-sm text-[#64748b] hover:bg-[#f0f9ff] hover:text-[#0e7490] transition-colors"
              >
                <FileJson size={16} />
                JSON
              </button>
              <button
                onClick={() => handleExportBookmarks('csv')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#cffafe] text-sm text-[#64748b] hover:bg-[#f0f9ff] hover:text-[#0e7490] transition-colors"
              >
                <FileSpreadsheet size={16} />
                CSV
              </button>
            </div>
          </div>

          {/* Clear Reading History */}
          <SettingsRow label="Hapus riwayat bacaan">
            <button
              onClick={() => setShowClearReadingModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-100 text-sm text-[#ef4444] hover:bg-red-50 transition-colors"
            >
              <History size={14} />
              Hapus
            </button>
          </SettingsRow>

          {/* Clear Download History */}
          <SettingsRow label="Hapus riwayat unduhan">
            <button
              onClick={() => setShowClearDownloadModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-100 text-sm text-[#ef4444] hover:bg-red-50 transition-colors"
            >
              <Download size={14} />
              Hapus
            </button>
          </SettingsRow>
        </SettingsSection>
      </section>

      {/* ============================================================ */}
      {/*  Delete Account Confirmation Modal                             */}
      {/* ============================================================ */}
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={20} className="text-[#ef4444]" />
              </div>
              <h3 className="text-lg font-semibold text-[#164e63]">Hapus Akun</h3>
            </div>
            <p className="text-sm text-[#64748b] mb-6">
              Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus secara permanen.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border border-[#cffafe] text-sm text-[#64748b] hover:bg-[#f0f9ff] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-lg bg-[#ef4444] text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Hapus Permanen
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ============================================================ */}
      {/*  Clear Reading History Confirmation Modal                      */}
      {/* ============================================================ */}
      {showClearReadingModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setShowClearReadingModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <History size={20} className="text-[#f59e0b]" />
              </div>
              <h3 className="text-lg font-semibold text-[#164e63]">Hapus Riwayat Bacaan</h3>
            </div>
            <p className="text-sm text-[#64748b] mb-6">
              Semua riwayat bacaan Anda akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearReadingModal(false)}
                className="px-4 py-2 rounded-lg border border-[#cffafe] text-sm text-[#64748b] hover:bg-[#f0f9ff] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleClearReadingHistory}
                className="px-4 py-2 rounded-lg bg-[#ef4444] text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Hapus
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ============================================================ */}
      {/*  Clear Download History Confirmation Modal                     */}
      {/* ============================================================ */}
      {showClearDownloadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setShowClearDownloadModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Download size={20} className="text-[#f59e0b]" />
              </div>
              <h3 className="text-lg font-semibold text-[#164e63]">Hapus Riwayat Unduhan</h3>
            </div>
            <p className="text-sm text-[#64748b] mb-6">
              Semua riwayat unduhan Anda akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearDownloadModal(false)}
                className="px-4 py-2 rounded-lg border border-[#cffafe] text-sm text-[#64748b] hover:bg-[#f0f9ff] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleClearDownloadHistory}
                className="px-4 py-2 rounded-lg bg-[#ef4444] text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Hapus
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
