// @ts-nocheck
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Bookmark,
  Star,
  History,
  Pencil,
  Check,
  X,
  Trash2,
  LogOut,
  AlertTriangle,
  Download,
  FileText,
  ChevronRight,
  Percent,
  TrendingUp,
  MessageSquare,
  Settings,
  ThumbsUp,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/useToast';
import { books } from '@/data/books';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ReadingHistoryItem {
  bookId: string;
  progress: number;
  lastRead: string;
  completed: boolean;
}

interface DownloadHistoryItem {
  bookId: string;
  title: string;
  format: string;
  downloadedAt: string;
  size: string;
}

interface BookmarkedBook {
  bookId: string;
  savedAt: string;
}

interface UserProfile {
  name: string;
  email: string;
  institution: string;
  specialization: string;
  joinDate: string;
}

interface UserReview {
  bookId: string;
  rating: number;
  comment: string;
  createdAt: string;
  likes: number;
}

/* ------------------------------------------------------------------ */
/*  Demo data                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_HISTORY: ReadingHistoryItem[] = [
  { bookId: '1', progress: 100, lastRead: '2024-06-05T10:30:00Z', completed: true },
  { bookId: '2', progress: 75, lastRead: '2024-06-07T14:20:00Z', completed: false },
  { bookId: '4', progress: 100, lastRead: '2024-06-01T09:15:00Z', completed: true },
  { bookId: '7', progress: 45, lastRead: '2024-06-08T16:45:00Z', completed: false },
  { bookId: '11', progress: 30, lastRead: '2024-06-06T11:00:00Z', completed: false },
  { bookId: '14', progress: 100, lastRead: '2024-05-28T08:30:00Z', completed: true },
];

const DEFAULT_DOWNLOADS: DownloadHistoryItem[] = [
  { bookId: '1', title: 'Neuroanatomy: Text and Atlas', format: 'PDF', downloadedAt: '2024-06-05T11:00:00Z', size: '12.5 MB' },
  { bookId: '3', title: 'Clinical Neurology', format: 'PDF', downloadedAt: '2024-06-03T09:30:00Z', size: '8.2 MB' },
  { bookId: '5', title: 'Pediatric Neurology', format: 'DOC', downloadedAt: '2024-06-01T14:15:00Z', size: '5.1 MB' },
  { bookId: '8', title: 'Neuroimaging: The Essentials', format: 'PDF', downloadedAt: '2024-05-28T16:00:00Z', size: '15.8 MB' },
  { bookId: '12', title: 'Stroke: Pathophysiology and Management', format: 'PPT', downloadedAt: '2024-05-25T10:30:00Z', size: '22.3 MB' },
];

const DEFAULT_BOOKMARKS: BookmarkedBook[] = [
  { bookId: '2', savedAt: '2024-06-07T08:00:00Z' },
  { bookId: '6', savedAt: '2024-06-04T12:30:00Z' },
  { bookId: '9', savedAt: '2024-06-02T15:00:00Z' },
  { bookId: '13', savedAt: '2024-05-30T09:15:00Z' },
  { bookId: '15', savedAt: '2024-05-28T11:00:00Z' },
];

const DEFAULT_REVIEWS: UserReview[] = [
  {
    bookId: '1',
    rating: 5,
    comment: 'Buku yang sangat komprehensif untuk memahami anatomi saraf. Ilustrasinya sangat detail dan membantu dalam diagnosis klinis.',
    createdAt: '2024-06-05T12:00:00Z',
    likes: 12,
  },
  {
    bookId: '4',
    rating: 4,
    comment: 'Panduan praktis untuk manajemen stroke akut. Sangat direkomendasikan untuk residen neurologi.',
    createdAt: '2024-06-01T10:30:00Z',
    likes: 8,
  },
  {
    bookId: '14',
    rating: 5,
    comment: 'Referensi terbaik untuk neuropati. Penjelasan yang jelas dan contoh kasus yang relevan.',
    createdAt: '2024-05-28T14:00:00Z',
    likes: 15,
  },
];

const SPECIALIZATION_OPTIONS = [
  'Neurologi Umum',
  'Neurochirurgi',
  'Neurofisiologi',
  'Neuroimaging',
  'Pediatri Neurologi',
  'Lainnya',
];

/* ------------------------------------------------------------------ */
/*  Helper: relative time in Indonesian                               */
/* ------------------------------------------------------------------ */

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  return `${Math.floor(diffDays / 30)} bulan lalu`;
}

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
/*  Sub-component: StatCard                                           */
/* ------------------------------------------------------------------ */

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  colorClass: string;
  index: number;
  suffix?: string;
}

function StatCard({ icon, label, value, colorClass, index, suffix }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      className="bg-white rounded-2xl border border-[#cffafe] p-6 flex items-center gap-4"
    >
      <div className="w-10 h-10 rounded-full bg-[#f0f9ff] flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className={`text-2xl font-bold ${colorClass}`}>
          <AnimatedCounter target={value} />
          {suffix && <span className="text-sm ml-0.5">{suffix}</span>}
        </div>
        <div className="text-sm text-[#64748b]">{label}</div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-component: ProgressBar                                        */
/* ------------------------------------------------------------------ */

function ProgressBar({ progress, index }: { progress: number; index: number }) {
  return (
    <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
      <div className="w-[120px] h-1.5 bg-[#f0f9ff] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{
            duration: 0.6,
            delay: 0.2 + index * 0.05,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          }}
          className="h-full bg-[#0e7490] rounded-full"
        />
      </div>
      <span className="text-[0.8rem] text-[#64748b] min-w-[40px] text-right">{progress}%</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-component: StarRating                                         */
/* ------------------------------------------------------------------ */

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-[#cffafe]'}
        />
      ))}
    </div>
  );
}

/* ================================================================== */
/*  MAIN COMPONENT                                                    */
/* ================================================================== */

export default function Profile() {
  const { success } = useToast();

  /* -- LocalStorage state -- */
  const [profile, setProfile] = useLocalStorage<UserProfile>('neurolibrary-profile', {
    name: 'Ahmad Fauzi',
    email: 'dr.fauzi@neurolibrary.id',
    institution: 'RSUD Dr. Soetomo',
    specialization: 'Neurologi Umum',
    joinDate: '2024-01-15T00:00:00Z',
  });

  const [readingHistory, setReadingHistory] = useLocalStorage<ReadingHistoryItem[]>(
    'neurolibrary-reading-history',
    DEFAULT_HISTORY,
  );

  const [downloadHistory, setDownloadHistory] = useLocalStorage<DownloadHistoryItem[]>(
    'neurolibrary-download-history',
    DEFAULT_DOWNLOADS,
  );

  const [bookmarks, setBookmarks] = useLocalStorage<BookmarkedBook[]>(
    'neurolibrary-bookmarks-list',
    DEFAULT_BOOKMARKS,
  );

  const [reviews] = useLocalStorage<UserReview[]>(
    'neurolibrary-user-reviews',
    DEFAULT_REVIEWS,
  );

  /* -- UI state -- */
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editInstitution, setEditInstitution] = useState(profile.institution);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* -- Derived stats -- */
  const stats = useMemo(() => {
    const booksRead = readingHistory.filter((h) => h.completed).length;
    const readingNow = readingHistory.filter((h) => !h.completed && h.progress > 0).length;
    const totalBookmarks = bookmarks.length;
    const totalHours = readingHistory.reduce((acc, h) => acc + (h.progress * 0.5), 0);
    const avgProgress = readingHistory.length > 0
      ? Math.round(readingHistory.reduce((s, h) => s + h.progress, 0) / readingHistory.length)
      : 0;
    return { booksRead, readingNow, totalBookmarks, totalHours: Math.round(totalHours), avgProgress };
  }, [readingHistory, bookmarks]);

  /* -- Handlers -- */
  const handleSaveProfile = useCallback(() => {
    setProfile((prev) => ({ ...prev, name: editName, institution: editInstitution }));
    setIsEditingProfile(false);
    success('Profil diperbarui');
  }, [editName, editInstitution, setProfile, success]);

  const handleCancelEdit = useCallback(() => {
    setEditName(profile.name);
    setEditInstitution(profile.institution);
    setIsEditingProfile(false);
  }, [profile.name, profile.institution]);

  const handleClearHistory = useCallback(() => {
    setReadingHistory([]);
    success('Riwayat bacaan dihapus');
  }, [setReadingHistory, success]);

  const handleClearDownloads = useCallback(() => {
    setDownloadHistory([]);
    success('Riwayat unduhan dihapus');
  }, [setDownloadHistory, success]);

  const handleRemoveBookmark = useCallback((bookId: string) => {
    setBookmarks((prev) => prev.filter((b) => b.bookId !== bookId));
    success('Bookmark dihapus');
  }, [setBookmarks, success]);

  const handleDeleteAccount = useCallback(() => {
    localStorage.removeItem('neurolibrary-profile');
    localStorage.removeItem('neurolibrary-reading-history');
    localStorage.removeItem('neurolibrary-download-history');
    localStorage.removeItem('neurolibrary-bookmarks-list');
    localStorage.removeItem('neurolibrary-notifications');
    localStorage.removeItem('neurolibrary-user-reviews');
    success('Akun berhasil dihapus');
    setShowDeleteModal(false);
    window.location.href = '/';
  }, [success]);

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  /* -- Animations -- */
  const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

  return (
    <div className="min-h-[100dvh] pb-12">
      {/* ============================================================ */}
      {/*  SECTION 1: Profile Header                                   */}
      {/* ============================================================ */}
      <section
        className="relative -mt-6 pt-12 pb-10 px-4 sm:px-6"
        style={{
          background: 'linear-gradient(135deg, #164e63 0%, #0e7490 50%, #14b8a6 100%)',
        }}
      >
        <div className="max-w-[1400px] mx-auto relative">
          {/* Settings button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="absolute top-0 right-0 flex items-center gap-2"
          >
            <Link
              to="/settings"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/30 text-white text-sm hover:bg-white/10 transition-colors"
            >
              <Settings size={14} />
              Pengaturan
            </Link>
            <button
              onClick={() => {
                if (isEditingProfile) {
                  handleCancelEdit();
                } else {
                  setEditName(profile.name);
                  setEditInstitution(profile.institution);
                  setIsEditingProfile(true);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/30 text-white text-sm hover:bg-white/10 transition-colors"
            >
              {isEditingProfile ? <X size={14} /> : <Pencil size={14} />}
              {isEditingProfile ? 'Batal' : 'Edit Profil'}
            </button>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-[#0e7490] to-[#14b8a6] flex items-center justify-center flex-shrink-0"
            >
              <img
                src="/avatar-default.jpg"
                alt="Avatar"
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-2xl font-bold text-white">${profile.name.charAt(0)}</span>`;
                  }
                }}
              />
            </motion.div>

            {/* Info */}
            <div className="text-center sm:text-left flex-1">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: easeOutExpo }}
                className="font-display text-[1.75rem] font-bold text-white leading-tight"
              >
                Dr. {profile.name}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25, ease: easeOutExpo }}
                className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-white text-[0.8rem]"
              >
                {profile.specialization}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-x-2 text-sm text-white/80"
              >
                <span>{profile.email}</span>
                <span>&bull;</span>
                <span>Bergabung {formatJoinDate(profile.joinDate)}</span>
                <span>&bull;</span>
                <span>{profile.institution}</span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 2: Reading Statistics                               */}
      {/* ============================================================ */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<BookOpen size={24} className="text-[#0e7490]" />}
            label="selesai"
            value={stats.booksRead}
            colorClass="text-[#0e7490]"
            index={0}
          />
          <StatCard
            icon={<Clock size={24} className="text-[#f59e0b]" />}
            label="aktif dibaca"
            value={stats.readingNow}
            colorClass="text-[#f59e0b]"
            index={1}
          />
          <StatCard
            icon={<Bookmark size={24} className="text-[#ec4899]" />}
            label="bookmark"
            value={stats.totalBookmarks}
            colorClass="text-[#ec4899]"
            index={2}
          />
          <StatCard
            icon={<Star size={24} className="text-[#f59e0b]" />}
            label="total jam"
            value={stats.totalHours}
            colorClass="text-[#f59e0b]"
            index={3}
            suffix="jam"
          />
        </div>

        {/* Extra stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: easeOutExpo }}
            className="bg-white rounded-2xl border border-[#cffafe] p-5 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-[#f0f9ff] flex items-center justify-center flex-shrink-0">
              <Percent size={24} className="text-[#8b5cf6]" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#8b5cf6]">{stats.avgProgress}%</div>
              <div className="text-sm text-[#64748b]">rata-rata progres</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5, ease: easeOutExpo }}
            className="bg-white rounded-2xl border border-[#cffafe] p-5 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-[#f0f9ff] flex items-center justify-center flex-shrink-0">
              <Download size={24} className="text-[#14b8a6]" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#14b8a6]">{downloadHistory.length}</div>
              <div className="text-sm text-[#64748b]">total unduhan</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6, ease: easeOutExpo }}
            className="bg-white rounded-2xl border border-[#cffafe] p-5 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-[#f0f9ff] flex items-center justify-center flex-shrink-0">
              <TrendingUp size={24} className="text-[#0e7490]" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#0e7490]">{readingHistory.length}</div>
              <div className="text-sm text-[#64748b]">total dibaca</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 3: Reading History                                  */}
      {/* ============================================================ */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: easeOutExpo }}
          className="bg-white rounded-2xl border border-[#cffafe] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#cffafe]">
            <div className="flex items-center gap-2.5">
              <History size={20} className="text-[#0e7490]" />
              <h3 className="text-[1.125rem] font-semibold text-[#164e63]">Riwayat Bacaan</h3>
            </div>
            {readingHistory.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-sm text-[#ef4444] hover:underline transition-all"
              >
                Hapus Riwayat
              </button>
            )}
          </div>

          {/* List */}
          {readingHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen size={48} className="text-[#64748b] opacity-30 mb-4" />
              <p className="text-[#64748b] font-medium">Belum ada riwayat bacaan</p>
              <p className="text-sm text-[#94a3b8] mt-1 max-w-xs">
                Mulai membaca buku untuk melacak progres Anda.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#f0f9ff]">
              <AnimatePresence>
                {readingHistory.map((item, index) => {
                  const book = books.find((b) => b.id === item.bookId);
                  if (!book) return null;

                  return (
                    <motion.div
                      key={item.bookId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.05,
                        ease: easeOutExpo,
                      }}
                      className="flex items-center gap-4 px-4 sm:px-6 py-4 hover:bg-[#f0f9ff]/50 transition-colors"
                    >
                      {/* Thumbnail */}
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-12 h-16 rounded object-cover flex-shrink-0 bg-gradient-to-br from-[#164e63] to-[#14b8a6]"
                      />

                      {/* Book info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.95rem] font-semibold text-[#164e63] truncate">
                          {book.title}
                        </p>
                        <p className="text-[0.8rem] text-[#64748b] truncate">{book.author}</p>
                      </div>

                      {/* Progress bar */}
                      <ProgressBar progress={item.progress} index={index} />

                      {/* Date */}
                      <span className="hidden md:block text-[0.8rem] text-[#64748b] flex-shrink-0 min-w-[80px] text-right">
                        {getRelativeTime(item.lastRead)}
                      </span>

                      {/* Status */}
                      <div className="flex-shrink-0">
                        {item.completed ? (
                          <span className="inline-flex items-center gap-1 text-xs text-[#10b981] font-medium">
                            <Check size={14} />
                            Selesai
                          </span>
                        ) : (
                          <button className="px-3 py-1.5 rounded-lg bg-[#0e7490] text-white text-xs font-medium hover:bg-[#155e75] transition-colors">
                            Lanjutkan
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 4: Download History                                 */}
      {/* ============================================================ */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: easeOutExpo }}
          className="bg-white rounded-2xl border border-[#cffafe] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#cffafe]">
            <div className="flex items-center gap-2.5">
              <Download size={20} className="text-[#14b8a6]" />
              <h3 className="text-[1.125rem] font-semibold text-[#164e63]">Riwayat Unduhan</h3>
            </div>
            {downloadHistory.length > 0 && (
              <button
                onClick={handleClearDownloads}
                className="text-sm text-[#ef4444] hover:underline transition-all"
              >
                Hapus Riwayat
              </button>
            )}
          </div>

          {/* Table */}
          {downloadHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Download size={48} className="text-[#64748b] opacity-30 mb-4" />
              <p className="text-[#64748b] font-medium">Belum ada riwayat unduhan</p>
              <p className="text-sm text-[#94a3b8] mt-1 max-w-xs">
                Buku yang Anda unduh akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-[#cffafe]">
                  <tr className="text-left text-[#64748b]">
                    <th className="pb-3 pt-4 px-6 font-medium">Buku</th>
                    <th className="pb-3 pt-4 font-medium">Format</th>
                    <th className="pb-3 pt-4 font-medium">Ukuran</th>
                    <th className="pb-3 pt-4 font-medium">Tanggal</th>
                    <th className="pb-3 pt-4 pr-6 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f9ff]">
                  <AnimatePresence>
                    {downloadHistory.map((item, index) => (
                      <motion.tr
                        key={item.bookId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.3, delay: index * 0.04 }}
                        className="hover:bg-[#f0f9ff]/50 transition-colors"
                      >
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-10 rounded bg-[#f0f9ff] flex items-center justify-center flex-shrink-0">
                              <FileText size={14} className="text-[#0e7490]" />
                            </div>
                            <span className="text-[#164e63] font-medium max-w-[250px] truncate">
                              {item.title}
                            </span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                            item.format === 'PDF'
                              ? 'bg-red-50 text-red-600'
                              : item.format === 'DOC'
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-green-50 text-green-600'
                          }`}>
                            {item.format}
                          </span>
                        </td>
                        <td className="py-3 text-[#64748b]">{item.size}</td>
                        <td className="py-3 text-[#94a3b8] text-xs">{formatDate(item.downloadedAt)}</td>
                        <td className="py-3 pr-6 text-right">
                          <button className="text-[#0e7490] hover:text-[#155e75] transition-colors">
                            <ChevronRight size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 5: Bookmark Management                              */}
      {/* ============================================================ */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: easeOutExpo }}
          className="bg-white rounded-2xl border border-[#cffafe] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#cffafe]">
            <div className="flex items-center gap-2.5">
              <Bookmark size={20} className="text-[#ec4899]" />
              <h3 className="text-[1.125rem] font-semibold text-[#164e63]">Bookmark Saya</h3>
            </div>
            <span className="text-sm text-[#64748b]">{bookmarks.length} buku</span>
          </div>

          {/* Grid */}
          {bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bookmark size={48} className="text-[#64748b] opacity-30 mb-4" />
              <p className="text-[#64748b] font-medium">Belum ada bookmark</p>
              <p className="text-sm text-[#94a3b8] mt-1 max-w-xs">
                Tandai buku favorit Anda untuk akses cepat.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6">
              <AnimatePresence>
                {bookmarks.map((bookmark, index) => {
                  const book = books.find((b) => b.id === bookmark.bookId);
                  if (!book) return null;

                  return (
                    <motion.div
                      key={bookmark.bookId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group relative bg-[#f0f9ff] rounded-xl border border-[#cffafe] overflow-hidden hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3 p-3">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-14 h-[4.5rem] rounded object-cover flex-shrink-0 bg-gradient-to-br from-[#164e63] to-[#14b8a6]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#164e63] truncate leading-tight">
                            {book.title}
                          </p>
                          <p className="text-xs text-[#64748b] mt-0.5 truncate">{book.author}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="flex items-center gap-0.5 text-[10px] text-amber-500">
                              <Star size={10} className="fill-current" />
                              {book.rating}
                            </span>
                            <span className="text-[10px] text-[#94a3b8]">
                              {formatDate(bookmark.savedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveBookmark(bookmark.bookId)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#94a3b8] hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        title="Hapus bookmark"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 6: My Reviews (NEW)                                 */}
      {/* ============================================================ */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease: easeOutExpo }}
          className="bg-white rounded-2xl border border-[#cffafe] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#cffafe]">
            <div className="flex items-center gap-2.5">
              <MessageSquare size={20} className="text-[#8b5cf6]" />
              <h3 className="text-[1.125rem] font-semibold text-[#164e63]">Ulasan Saya</h3>
            </div>
            <span className="text-sm text-[#64748b]">{reviews.length} ulasan</span>
          </div>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare size={48} className="text-[#64748b] opacity-30 mb-4" />
              <p className="text-[#64748b] font-medium">Belum ada ulasan</p>
              <p className="text-sm text-[#94a3b8] mt-1 max-w-xs">
                Berikan ulasan pada buku yang Anda baca untuk membantu dokter lain.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#f0f9ff]">
              <AnimatePresence>
                {reviews.map((review, index) => {
                  const book = books.find((b) => b.id === review.bookId);
                  if (!book) return null;

                  return (
                    <motion.div
                      key={review.bookId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.05,
                        ease: easeOutExpo,
                      }}
                      className="flex items-start gap-4 px-4 sm:px-6 py-4 hover:bg-[#f0f9ff]/50 transition-colors"
                    >
                      {/* Book thumbnail */}
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-12 h-16 rounded object-cover flex-shrink-0 bg-gradient-to-br from-[#164e63] to-[#14b8a6] mt-0.5"
                      />

                      {/* Review content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[0.95rem] font-semibold text-[#164e63] truncate">
                            {book.title}
                          </p>
                          <span className="text-xs text-[#94a3b8]">• {formatDate(review.createdAt)}</span>
                        </div>
                        <div className="mt-1">
                          <StarRating rating={review.rating} />
                        </div>
                        <p className="text-sm text-[#64748b] mt-2 leading-relaxed">
                          {review.comment}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-[#94a3b8]">
                          <ThumbsUp size={12} />
                          <span>{review.likes} orang merasa ulasan ini membantu</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/*  Delete Account Confirmation Modal                             */}
      {/* ============================================================ */}
      <AnimatePresence>
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
      </AnimatePresence>
    </div>
  );
}
