// @ts-nocheck
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  MessageSquare,
  Tags,
  Palette,
  PlusCircle,
  ArrowLeft,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Brain,
  Star,
  Download,
  Eye,
  Menu,
  Save,
  RotateCcw,
  Sparkles,
  Library,
  BarChart3,
  TrendingUp,
  Award,
  FileText,
  Settings,
  AlertCircle,
  Monitor,
  Minimize,
  Maximize,
  X,
  Layers,
  Activity,
  Scan,
  Stethoscope,
  Scissors,
  Pill,
  Baby,
  Zap,
  HeartPulse,
  PersonStanding,
  FileUp,
  Clock,
  Upload,
  UserCheck,
  Filter,
  ArrowUpDown,
  ImageIcon,
  Check,
  GripVertical,
  Grid3X3,
  Type,
  Undo2,
  MoveUp,
  MoveDown,
  Smartphone,
  Globe,
  Mail,
  Phone,
  MapPin,
  Github,
  Twitter,
  Linkedin,
  Info,
  Wallpaper,
  SlidersHorizontal,
  FileDown,
  SquareCheck,
  Newspaper,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { books as defaultBooks } from '@/data/books';
import { categories as defaultCategories } from '@/data/categories';
import { allUsers } from '@/data/usersData';
import {
  getDashboardStats,
  getDownloadsOverTime,
  getTopBooks,
  getRecentActivity,
  getBooksByCategory,
  getUserActivityStats,
  type RecentActivity,
} from '@/services/analyticsService';
import type { Book, Category, BookFormat } from '@/types';

/* ─── Types ─── */
interface ActivityItem {
  id: string;
  type: 'book' | 'user' | 'comment' | 'category' | 'theme' | 'background' | 'about';
  message: string;
  timestamp: string;
}

interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  neural: string;
  background: string;
  text: string;
  border?: string;
  font?: string;
  fontSize?: number;
  borderRadius?: number;
}

interface BackgroundConfig {
  type: 'gradient' | 'custom';
  customImage: string;
  presetImage: string;
  opacity: number;
  enabled: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  title: string;
  specialty: string;
  institution: string;
  avatar: string;
}

interface AboutConfig {
  mission: string;
  team: TeamMember[];
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  social: {
    github: string;
    twitter: string;
    linkedin: string;
  };
}

type AdminTab =
  | 'dashboard'
  | 'books'
  | 'users'
  | 'comments'
  | 'categories'
  | 'theme'
  | 'add-book'
  | 'upload-file'
  | 'background'
  | 'about-editor';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'user';
  joinDate: string;
  specialization: string;
  institution?: string;
}

interface AdminComment {
  id: string;
  bookId: string;
  bookTitle: string;
  userName: string;
  userAvatar: string;
  content: string;
  rating: number;
  createdAt: string;
}

/* ─── Helpers ─── */
const generateId = () => Math.random().toString(36).substring(2, 10);

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 60);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatDateOnly = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const getRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu yang lalu`;
  return `${Math.floor(diffDays / 30)} bulan yang lalu`;
};

const initialAdminUser: AdminUser = {
  id: 'admin-1',
  name: 'Dr. Admin',
  email: 'admin@neurolibrary.id',
  avatar: '',
  role: 'admin',
  joinDate: '2024-01-15T08:00:00Z',
  specialization: 'Neurologi Umum',
  institution: 'RSUD Dr. Soetomo',
};

const defaultTheme: ThemeConfig = {
  primary: '#0e7490',
  secondary: '#14b8a6',
  accent: '#f59e0b',
  neural: '#ec4899',
  background: '#f0f9ff',
  text: '#164e63',
  border: '#cffafe',
  font: 'Inter',
  fontSize: 14,
  borderRadius: 8,
};

const themePresets: { name: string; colors: ThemeConfig }[] = [
  {
    name: 'Default',
    colors: { primary: '#0e7490', secondary: '#14b8a6', accent: '#f59e0b', neural: '#ec4899', background: '#f0f9ff', text: '#164e63', border: '#cffafe', font: 'Inter', fontSize: 14, borderRadius: 8 },
  },
  {
    name: 'Ocean',
    colors: { primary: '#0e7490', secondary: '#14b8a6', accent: '#f59e0b', neural: '#ec4899', background: '#f0f9ff', text: '#164e63', border: '#cffafe', font: 'Inter', fontSize: 14, borderRadius: 8 },
  },
  {
    name: 'Forest',
    colors: { primary: '#166534', secondary: '#16a34a', accent: '#d97706', neural: '#dc2626', background: '#f0fdf4', text: '#14532d', border: '#bbf7d0', font: 'Inter', fontSize: 14, borderRadius: 8 },
  },
  {
    name: 'Sunset',
    colors: { primary: '#c2410c', secondary: '#ea580c', accent: '#ca8a04', neural: '#db2777', background: '#fff7ed', text: '#7c2d12', border: '#fed7aa', font: 'Inter', fontSize: 14, borderRadius: 8 },
  },
  {
    name: 'Minimal',
    colors: { primary: '#374151', secondary: '#6b7280', accent: '#2563eb', neural: '#9333ea', background: '#f9fafb', text: '#111827', border: '#e5e7eb', font: 'Inter', fontSize: 14, borderRadius: 8 },
  },
  {
    name: 'Dark Pro',
    colors: { primary: '#38bdf8', secondary: '#818cf8', accent: '#f472b6', neural: '#a78bfa', background: '#0f172a', text: '#e2e8f0', border: '#1e293b', font: 'Inter', fontSize: 14, borderRadius: 8 },
  },
];

const navItems: { key: AdminTab | 'back'; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'books', label: 'Kelola Buku', icon: BookOpen },
  { key: 'categories', label: 'Kelola Kategori', icon: Tags },
  { key: 'users', label: 'Kelola Pengguna', icon: Users },
  { key: 'comments', label: 'Kelola Komentar', icon: MessageSquare },
  { key: 'background', label: 'Edit Wallpaper', icon: Wallpaper },
  { key: 'about-editor', label: 'Edit Tentang', icon: Info },
  { key: 'theme', label: 'Edit Tema', icon: Palette },
  { key: 'add-book', label: 'Tambah Buku', icon: PlusCircle },
  { key: 'upload-file', label: 'Upload File', icon: FileUp },
  { key: 'back', label: 'Kembali ke Site', icon: ArrowLeft },
];

/* ─── Icon map for categories ─── */
const iconMap: Record<string, React.ElementType> = {
  Brain, Activity, Scan, Stethoscope, Scissors, Pill, Baby, Zap, HeartPulse, PersonStanding,
  Layers, Sparkles, BookOpen, FileText, Library, Star, TrendingUp, Award, Monitor, Settings,
  Newspaper, ImageIcon, Smartphone, Globe, Mail,
};

function getIconComponent(iconName: string): React.ElementType {
  return iconMap[iconName] || BookOpen;
}

/* ─── Activity type colors ─── */
const activityTypeConfig: Record<RecentActivity['type'], { color: string; bg: string; label: string }> = {
  upload: { color: '#0e7490', bg: '#f0f9ff', label: 'Upload' },
  rating: { color: '#f59e0b', bg: '#fffbeb', label: 'Rating' },
  register: { color: '#14b8a6', bg: '#f0fdf4', label: 'Register' },
  download: { color: '#ec4899', bg: '#fdf2f8', label: 'Download' },
  bookmark: { color: '#8b5cf6', bg: '#f5f3ff', label: 'Bookmark' },
  comment: { color: '#f59e0b', bg: '#fffbeb', label: 'Komentar' },
};

/* ─── Preset backgrounds ─── */
const presetBackgrounds = [
  { name: 'Neural Network', value: '/neural-bg-1.jpg' },
  { name: 'Abstract Brain', value: '/neural-bg-2.jpg' },
  { name: 'Medical Gradient', value: '/medical-gradient.jpg' },
  { name: 'Neuron Pattern', value: '/neuron-pattern.jpg' },
  { name: 'Clean Lines', value: '/clean-lines.jpg' },
];

const defaultBackground: BackgroundConfig = {
  type: 'gradient',
  customImage: '',
  presetImage: presetBackgrounds[0].value,
  opacity: 15,
  enabled: false,
};

const defaultAbout: AboutConfig = {
  mission: 'NeuroLibrary adalah platform perpustakaan digital yang didedikasikan untuk dunia neurologi. Misi kami adalah menyediakan akses mudah ke sumber daya neurologi berkualitas tinggi bagi mahasiswa, dokter, dan profesional kesehatan di seluruh Indonesia.',
  team: [
    { id: '1', name: 'Dr. Andika Pratama', title: 'Founder & Lead Developer', specialty: 'Neurologi Klinis', institution: 'RSUD Dr. Soetomo', avatar: '' },
    { id: '2', name: 'Dr. Sarah Wijaya', title: 'Content Curator', specialty: 'Neurofisiologi', institution: 'Universitas Indonesia', avatar: '' },
    { id: '3', name: 'Dr. Budi Santoso', title: 'Medical Advisor', specialty: 'Neuroanatomi', institution: 'UGM', avatar: '' },
  ],
  contact: {
    email: 'contact@neurolibrary.id',
    phone: '+62 812-3456-7890',
    address: 'Jl. Universitas No. 1, Surabaya, Jawa Timur 60231',
  },
  social: {
    github: 'https://github.com/neurolibrary',
    twitter: 'https://twitter.com/neurolibrary',
    linkedin: 'https://linkedin.com/company/neurolibrary',
  },
};

/* ─── Auth Guard Hook ─── */
function useAdminGuard() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Check both neuro_current_user (from AuthContext) and neuro_user
    const raw = localStorage.getItem('neuro_current_user') || localStorage.getItem('neuro_user');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        // Admin by role or email
        if (user.role === 'admin' || user.email === 'admin@neurolibrary.id') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
    setChecked(true);
  }, [navigate]);

  return { isAdmin, checked };
}

/* ═══════════════════════════════════════════
   MAIN ADMIN COMPONENT
   ═══════════════════════════════════════════ */
export default function Admin() {
  const { isAdmin, checked } = useAdminGuard();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  /* ── localStorage data ── */
  const [books, setBooks] = useLocalStorage<Book[]>('neuro_books', defaultBooks);
  const [users, setUsers] = useLocalStorage<AdminUser[]>('neuro_users', [
    initialAdminUser,
    ...allUsers
      .filter((u) => u.id !== 'admin-1')
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        role: u.role as 'admin' | 'user',
        joinDate: u.joinDate,
        specialization: u.specialty,
        institution: u.institution,
      })),
  ]);
  const [comments, setComments] = useLocalStorage<AdminComment[]>('neuro_comments', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('neuro_categories', defaultCategories);
  const [activities, setActivities] = useLocalStorage<ActivityItem[]>('neuro_activities', []);
  const [theme, setTheme] = useLocalStorage<ThemeConfig>('neuro_admin_theme', defaultTheme);
  const [background, setBackground] = useLocalStorage<BackgroundConfig>('neuro_admin_background', defaultBackground);
  const [about, setAbout] = useLocalStorage<AboutConfig>('neuro_admin_about', defaultAbout);

  /* ── Presentation Mode State ── */
  const [showPresentation, setShowPresentation] = useState(false);
  const [selectedBookForPresentation, setSelectedBookForPresentation] = useState<Book | null>(null);

  /* ── Helpers ── */
  const addActivity = useCallback(
    (type: ActivityItem['type'], message: string) => {
      const newActivity: ActivityItem = {
        id: generateId(),
        type,
        message,
        timestamp: new Date().toISOString(),
      };
      setActivities((prev) => [newActivity, ...prev].slice(0, 50));
    },
    [setActivities],
  );

  const handleNavClick = useCallback(
    (key: AdminTab | 'back') => {
      if (key === 'back') {
        navigate('/');
        return;
      }
      setActiveTab(key);
      setSidebarOpen(false);
    },
    [navigate],
  );

  if (!checked) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f0f9ff]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0e7490] border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f0f9ff]">
        <div className="text-center max-w-md px-6">
          <AlertCircle size={64} className="mx-auto text-red-400 mb-4" />
          <h1 className="text-2xl font-bold text-[#164e63] mb-2">Akses Ditolak</h1>
          <p className="text-[#64748b] mb-6">Anda tidak memiliki izin untuk mengakses halaman admin. Silakan login sebagai admin.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-lg bg-[#0e7490] text-white font-medium hover:bg-[#155e75] transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f0f9ff] overflow-hidden">
      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ═══ SIDEBAR ═══ */}
      <motion.aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-[#cffafe] flex flex-col shadow-lg lg:shadow-none transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-[#cffafe]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0e7490] to-[#14b8a6] flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <span className="font-display text-lg font-bold text-[#164e63]">
            Neuro<span className="text-[#0e7490]">Admin</span>
          </span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            const isBack = item.key === 'back';

            return (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key as AdminTab | 'back')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isBack
                    ? 'text-[#64748b] hover:bg-[#f0f9ff] mt-4'
                    : isActive
                    ? 'bg-[#0e7490] text-white'
                    : 'text-[#164e63] hover:bg-[#f0f9ff]'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#cffafe]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0e7490] to-[#14b8a6] flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#164e63] truncate">Admin</p>
              <p className="text-xs text-[#64748b] truncate">admin@neurolibrary.id</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 sm:px-6 h-16 bg-white/80 backdrop-blur-md border-b border-[#cffafe] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 rounded-lg border border-[#cffafe] flex items-center justify-center text-[#64748b] hover:bg-[#f0f9ff]"
          >
            <Menu size={18} />
          </button>
          <h1 className="text-lg font-semibold text-[#164e63] capitalize">
            {navItems.find((n) => n.key === activeTab)?.label || 'Dashboard'}
          </h1>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'dashboard' && (
                <DashboardTab
                  books={books}
                  users={users}
                  comments={comments}
                  activities={activities}
                  categories={categories}
                  onOpenPresentation={(book) => {
                    setSelectedBookForPresentation(book);
                    setShowPresentation(true);
                  }}
                />
              )}
              {activeTab === 'books' && (
                <BooksTab
                  books={books}
                  setBooks={setBooks}
                  categories={categories}
                  addActivity={addActivity}
                  onOpenPresentation={(book) => {
                    setSelectedBookForPresentation(book);
                    setShowPresentation(true);
                  }}
                />
              )}
              {activeTab === 'users' && (
                <UsersTab
                  users={users}
                  setUsers={setUsers}
                  addActivity={addActivity}
                />
              )}
              {activeTab === 'comments' && (
                <CommentsTab
                  comments={comments}
                  setComments={setComments}
                  books={books}
                  addActivity={addActivity}
                />
              )}
              {activeTab === 'categories' && (
                <CategoriesTab
                  categories={categories}
                  setCategories={setCategories}
                  books={books}
                  setBooks={setBooks}
                  addActivity={addActivity}
                />
              )}
              {activeTab === 'theme' && (
                <ThemeTab theme={theme} setTheme={setTheme} addActivity={addActivity} />
              )}
              {activeTab === 'background' && (
                <BackgroundTab background={background} setBackground={setBackground} addActivity={addActivity} />
              )}
              {activeTab === 'about-editor' && (
                <AboutEditorTab about={about} setAbout={setAbout} addActivity={addActivity} />
              )}
              {activeTab === 'add-book' && (
                <AddBookTab
                  setBooks={setBooks}
                  categories={categories}
                  addActivity={addActivity}
                />
              )}
              {activeTab === 'upload-file' && (
                <UploadFileTab addActivity={addActivity} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Presentation Mode Modal */}
          <PresentationMode
            isOpen={showPresentation}
            onClose={() => setShowPresentation(false)}
            book={selectedBookForPresentation}
          />
        </div>
      </main>
    </div>
  );
}


/* ═══════════════════════════════════════════
   DASHBOARD TAB (Enhanced)
   ═══════════════════════════════════════════ */
function DashboardTab({
  books,
  onOpenPresentation,
}: {
  books: Book[];
  users: AdminUser[];
  comments: AdminComment[];
  activities: ActivityItem[];
  categories: Category[];
  onOpenPresentation: (book: Book) => void;
}) {
  const stats = useMemo(() => getDashboardStats(), []);
  const downloadChart = useMemo(() => getDownloadsOverTime(7), []);
  const topBooksList = useMemo(() => getTopBooks(10), []);
  const booksByCat = useMemo(() => getBooksByCategory(), []);
  const recentActivity = useMemo(() => getRecentActivity(15), []);
  const userStats = useMemo(() => getUserActivityStats(), []);

  const maxDownloads = Math.max(...downloadChart.map((d) => d.downloads), 1);
  const maxCatCount = Math.max(...booksByCat.map((c) => c.count), 1);

  return (
    <div className="space-y-6">
      {/* ── Quick Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        <EnhancedStatCard
          icon={Library}
          label="Total Buku"
          value={stats.totalBooks}
          sub={`+${stats.booksAddedThisMonth} bulan ini`}
          color="#0e7490"
        />
        <EnhancedStatCard
          icon={Tags}
          label="Total Kategori"
          value={booksByCat.length}
          sub="aktif"
          color="#14b8a6"
        />
        <EnhancedStatCard
          icon={Users}
          label="Total Pengguna"
          value={stats.totalUsers}
          sub={`${stats.activeUsers} aktif`}
          color="#8b5cf6"
        />
        <EnhancedStatCard
          icon={Download}
          label="Total Downloads"
          value={stats.totalDownloads}
          sub={`${stats.downloadsThisWeek} minggu ini`}
          color="#ec4899"
        />
        <EnhancedStatCard
          icon={Star}
          label="Avg Rating"
          value={stats.averageRating}
          sub="dari semua buku"
          color="#f59e0b"
          isDecimal
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Downloads per Day (Bar Chart) ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#164e63] flex items-center gap-2 text-base">
              <BarChart3 size={18} className="text-[#0e7490]" />
              Download per Hari (7 Hari Terakhir)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-[180px]">
              {downloadChart.map((day, i) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="text-xs text-[#64748b] font-medium">{day.downloads}</div>
                  <div className="w-full bg-[#f0f9ff] rounded-t-md overflow-hidden relative" style={{ height: '120px' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.downloads / maxDownloads) * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                      className="absolute bottom-0 left-0 right-0 rounded-t-md bg-gradient-to-t from-[#0e7490] to-[#14b8a6]"
                    />
                  </div>
                  <div className="text-[10px] text-[#64748b]">{day.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Books by Category (Horizontal Bar) ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#164e63] flex items-center gap-2 text-base">
              <Layers size={18} className="text-[#14b8a6]" />
              Buku per Kategori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {booksByCat.map((cat, i) => (
                <div key={cat.slug}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#164e63] font-medium">{cat.name}</span>
                    <span className="text-[#64748b]">{cat.count}</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#f0f9ff] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(cat.count / maxCatCount) * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-[#0e7490] to-[#14b8a6]"
                    />
                  </div>
                </div>
              ))}
              {booksByCat.length === 0 && (
                <p className="text-sm text-[#64748b] text-center py-4">Belum ada data kategori</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Top 10 Most Downloaded Books ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#164e63] flex items-center gap-2 text-base">
                <TrendingUp size={18} className="text-[#14b8a6]" />
                Top 10 Buku Terbanyak Diunduh
              </CardTitle>
              {topBooksList[0] && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const book = books.find((b) => b.id === topBooksList[0].id);
                    if (book) onOpenPresentation(book);
                  }}
                  className="text-xs border-[#cffafe] text-[#0e7490] hover:bg-[#f0f9ff]"
                >
                  <Monitor size={14} className="mr-1" />
                  Presentasi
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
              {topBooksList.map((book, i) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-[#f0f9ff]/50 hover:bg-[#f0f9ff] transition-colors"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0
                        ? 'bg-[#f59e0b] text-white'
                        : i === 1
                        ? 'bg-[#94a3b8] text-white'
                        : i === 2
                        ? 'bg-[#cd7f32] text-white'
                        : 'bg-white border border-[#cffafe] text-[#64748b]'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-8 h-10 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-book.png';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#164e63] truncate">{book.title}</p>
                    <p className="text-xs text-[#64748b]">{book.author}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="flex items-center gap-1 text-xs text-amber-500">
                      <Star size={10} className="fill-current" />
                      {book.rating}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#0e7490] font-semibold">
                      <Download size={10} />
                      {book.downloads.toLocaleString('id-ID')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Recent Activity Feed ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#164e63] flex items-center gap-2 text-base">
              <Sparkles size={18} className="text-[#ec4899]" />
              Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-[#64748b] text-center py-6">Belum ada aktivitas</p>
              ) : (
                recentActivity.map((act, i) => {
                  const config = activityTypeConfig[act.type];
                  return (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-[#f0f9ff]/50 hover:bg-[#f0f9ff] transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{ backgroundColor: config.bg, color: config.color }}
                      >
                        {config.label.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#164e63] truncate">{act.action}</p>
                        <p className="text-xs text-[#64748b]">{act.user}</p>
                      </div>
                      <span className="text-[10px] text-[#94a3b8] flex-shrink-0">
                        {getRelativeTime(act.timestamp)}
                      </span>
                    </motion.div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Top Performing Books Table ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#164e63] flex items-center gap-2 text-base">
            <Award size={18} className="text-[#f59e0b]" />
            Buku Performa Terbaik
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#cffafe]">
                <tr className="text-left text-[#64748b]">
                  <th className="pb-2 font-medium w-[50px]">Rank</th>
                  <th className="pb-2 font-medium">Judul</th>
                  <th className="pb-2 font-medium text-right">Downloads</th>
                  <th className="pb-2 font-medium text-right">Rating</th>
                  <th className="pb-2 font-medium text-right">Dilihat</th>
                </tr>
              </thead>
              <tbody>
                {topBooksList.slice(0, 10).map((book, i) => (
                  <tr key={book.id} className="border-b border-[#cffafe]/50">
                    <td className="py-2.5">
                      <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold ${
                        i === 0 ? 'bg-[#f59e0b] text-white' : i === 1 ? 'bg-[#94a3b8] text-white' : i === 2 ? 'bg-[#cd7f32] text-white' : 'bg-[#f0f9ff] text-[#64748b]'
                      }`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-2.5 text-[#164e63] font-medium max-w-[250px] truncate">{book.title}</td>
                    <td className="py-2.5 text-right text-[#0e7490] font-semibold">{book.downloads.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 text-right">
                      <span className="flex items-center justify-end gap-1 text-amber-500">
                        <Star size={10} className="fill-current" />
                        {book.rating}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-[#64748b]">{(book.downloads * 3 + book.ratingCount * 10).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Enhanced Stat Card ─── */
function EnhancedStatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  isDecimal,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  sub: string;
  color: string;
  isDecimal?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current * 10) / 10);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#64748b] mb-1">{label}</p>
            <p className="text-2xl font-bold text-[#164e63]">
              {isDecimal ? displayValue.toFixed(1) : Math.floor(displayValue).toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-[#94a3b8] mt-1">{sub}</p>
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon size={24} style={{ color }} />
          </div>
        </div>
      </CardContent>
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: color }} />
    </Card>
  );
}

/* ═══════════════════════════════════════════
   BOOKS TAB (Kelola Buku - Enhanced)
   ═══════════════════════════════════════════ */
function BooksTab({
  books,
  setBooks,
  categories,
  addActivity,
  onOpenPresentation,
}: {
  books: Book[];
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
  categories: Category[];
  addActivity: (type: ActivityItem['type'], message: string) => void;
  onOpenPresentation: (book: Book) => void;
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [deleteBook, setDeleteBook] = useState<Book | null>(null);
  const [sortField, setSortField] = useState<string>('title');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const perPage = 10;

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let result = [...books];

    if (q) {
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn?.toLowerCase().includes(q),
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'title') comparison = a.title.localeCompare(b.title);
      else if (sortField === 'author') comparison = a.author.localeCompare(b.author);
      else if (sortField === 'category') comparison = a.category.localeCompare(b.category);
      else if (sortField === 'year') comparison = a.year - b.year;
      else if (sortField === 'rating') comparison = a.rating - b.rating;
      else if (sortField === 'downloads') comparison = (a.downloads || 0) - (b.downloads || 0);
      else if (sortField === 'pages') comparison = (a.pages || 0) - (b.pages || 0);
      return sortAsc ? comparison : -comparison;
    });

    return result;
  }, [books, search, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = () => {
    if (!deleteBook) return;
    setBooks((prev) => prev.filter((b) => b.id !== deleteBook.id));
    addActivity('book', `Menghapus buku "${deleteBook.title}"`);
    toast.success('Buku berhasil dihapus');
    setDeleteBook(null);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setBooks((prev) => prev.filter((b) => !selectedIds.has(b.id)));
    addActivity('book', `Menghapus ${selectedIds.size} buku sekaligus`);
    toast.success(`${selectedIds.size} buku berhasil dihapus`);
    setSelectedIds(new Set());
    setShowBulkDelete(false);
  };

  const handleSaveEdit = (updated: Book) => {
    setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    addActivity('book', `Mengedit buku "${updated.title}"`);
    toast.success('Buku berhasil diperbarui');
    setEditBook(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const pageIds = paginated.map((b) => b.id);
    const allSelected = pageIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Title', 'Author', 'Category', 'ISBN', 'Year', 'Pages', 'Publisher', 'Language', 'Format', 'Rating', 'Downloads', 'Tags'];
    const rows = filtered.map((b) => [
      b.id, `"${b.title}"`, `"${b.author}"`, b.category, b.isbn || '', b.year, b.pages || '', b.publisher || '', b.language || '', b.format, b.rating, b.downloads || 0, (b.tags || []).join('; '),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map(String).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `neuro_books_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Daftar buku diekspor ke CSV');
  };

  const SortHeader = ({ field, label, className = '' }: { field: string; label: string; className?: string }) => (
    <button
      className={`flex items-center gap-1 hover:text-[#0e7490] transition-colors ${className}`}
      onClick={() => toggleSort(field)}
    >
      {label}
      <ArrowUpDown size={12} className={sortField === field ? 'text-[#0e7490]' : 'text-[#94a3b8]'} />
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Search + Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-[400px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <Input
            placeholder="Cari judul, penulis, ISBN..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exportToCSV}
          className="border-[#cffafe] text-[#0e7490] hover:bg-[#f0f9ff]"
        >
          <FileDown size={15} className="mr-1" />
          Export CSV
        </Button>
        <span className="text-sm text-[#64748b]">{filtered.length} buku</span>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 bg-[#f0f9ff] border border-[#cffafe] rounded-lg"
        >
          <SquareCheck size={16} className="text-[#0e7490]" />
          <span className="text-sm text-[#164e63] font-medium">{selectedIds.size} buku dipilih</span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowBulkDelete(true)}
            className="ml-auto"
          >
            <Trash2 size={14} className="mr-1" />
            Hapus
          </Button>
        </motion.div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f0f9ff]">
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={paginated.length > 0 && paginated.every((b) => selectedIds.has(b.id))}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-[60px]">Cover</TableHead>
                  <TableHead><SortHeader field="title" label="Judul" /></TableHead>
                  <TableHead><SortHeader field="author" label="Penulis" /></TableHead>
                  <TableHead><SortHeader field="category" label="Kategori" /></TableHead>
                  <TableHead className="text-center"><SortHeader field="year" label="Tahun" className="justify-center" /></TableHead>
                  <TableHead className="text-center"><SortHeader field="rating" label="Rating" className="justify-center" /></TableHead>
                  <TableHead className="text-center"><SortHeader field="downloads" label="Downloads" className="justify-center" /></TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-[#64748b]">
                      Tidak ada buku ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(book.id)}
                          onCheckedChange={() => toggleSelect(book.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-10 h-14 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-book.png';
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-[#164e63] max-w-[200px] truncate">
                        {book.title}
                      </TableCell>
                      <TableCell className="text-[#64748b]">{book.author}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs border-[#cffafe] text-[#0e7490]">
                          {book.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-[#64748b]">{book.year}</TableCell>
                      <TableCell className="text-center">
                        <span className="flex items-center justify-center gap-1 text-amber-500 text-sm">
                          <Star size={12} className="fill-current" />
                          {book.rating}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-[#0e7490] font-medium">
                        {book.downloads?.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onOpenPresentation(book)}
                            className="h-8 w-8 text-[#14b8a6] hover:bg-[#f0f9ff]"
                            title="Mode Presentasi"
                          >
                            <Monitor size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setEditBook(book)}
                            className="h-8 w-8 text-[#0e7490] hover:bg-[#f0f9ff]"
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteBook(book)}
                            className="h-8 w-8 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#64748b]">
            Halaman {page} dari {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft size={16} />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPage(p)}
                className={`h-8 w-8 p-0 text-xs ${
                  p === page ? 'bg-[#0e7490] text-white' : ''
                }`}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={!!editBook} onOpenChange={() => setEditBook(null)}>
        <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#164e63]">Edit Buku</DialogTitle>
            <DialogDescription>Edit detail buku di bawah ini.</DialogDescription>
          </DialogHeader>
          {editBook && (
            <BookForm
              book={editBook}
              categories={categories}
              onSubmit={handleSaveEdit}
              onCancel={() => setEditBook(null)}
              submitLabel="Simpan Perubahan"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteBook} onOpenChange={() => setDeleteBook(null)}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[#164e63] flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" />
              Konfirmasi Hapus
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus buku &quot;{deleteBook?.title}&quot;? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteBook(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 size={15} className="mr-1" />
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation */}
      <Dialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[#164e63] flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" />
              Konfirmasi Hapus Massal
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus {selectedIds.size} buku yang dipilih? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDelete(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash2 size={15} className="mr-1" />
              Hapus {selectedIds.size} Buku
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


/* ═══════════════════════════════════════════
   USERS TAB (Kelola Pengguna)
   ═══════════════════════════════════════════ */
function UsersTab({
  users,
  setUsers,
  addActivity,
}: {
  users: AdminUser[];
  setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>;
  addActivity: (type: ActivityItem['type'], message: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [viewUser, setViewUser] = useState<AdminUser | null>(null);
  const [editRoleUser, setEditRoleUser] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const [resetPasswordUser, setResetPasswordUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const perPage = 7;

  const handleSort = (field: 'name' | 'role' | 'date') => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let result = [...users];

    if (filterRole !== 'all') {
      result = result.filter((u) => u.role === filterRole);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.specialization || '').toLowerCase().includes(q) ||
          (u.institution || '').toLowerCase().includes(q),
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'role') {
        comparison = a.role.localeCompare(b.role);
      } else if (sortBy === 'date') {
        comparison = new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [users, filterRole, search, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleRoleChange = (userId: string, role: 'admin' | 'user') => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    const user = users.find((u) => u.id === userId);
    if (user) {
      addActivity('user', `Mengubah role ${user.name} menjadi ${role}`);
      toast.success(`Role ${user.name} diubah menjadi ${role}`);
    }
    setEditRoleUser(null);
  };

  const handleDelete = () => {
    if (!deleteUser) return;
    if (deleteUser.id === 'admin-1') {
      toast.error('Tidak dapat menghapus admin utama');
      setDeleteUser(null);
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
    addActivity('user', `Menghapus pengguna "${deleteUser.name}"`);
    toast.success('Pengguna berhasil dihapus');
    setDeleteUser(null);
  };

  const handleResetPassword = () => {
    if (!resetPasswordUser || !newPassword.trim()) return;
    if (newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    // Update password in localStorage (neuro_users)
    try {
      const stored = localStorage.getItem('neuro_users');
      if (stored) {
        const allUsers = JSON.parse(stored);
        const updated = allUsers.map((u: any) =>
          u.id === resetPasswordUser.id ? { ...u, password: btoa(newPassword.trim() + '_neuro_salt') } : u,
        );
        localStorage.setItem('neuro_users', JSON.stringify(updated));
      }
      // Also update neuro_current_user if it's the current user
      const currentRaw = localStorage.getItem('neuro_current_user');
      if (currentRaw) {
        const current = JSON.parse(currentRaw);
        if (current.id === resetPasswordUser.id) {
          current.password = btoa(newPassword.trim() + '_neuro_salt');
          localStorage.setItem('neuro_current_user', JSON.stringify(current));
        }
      }
      addActivity('user', `Reset password untuk "${resetPasswordUser.name}"`);
      toast.success('Password berhasil direset!');
      setResetPasswordUser(null);
      setNewPassword('');
    } catch {
      toast.error('Gagal mereset password');
    }
  };

  const SortIcon = ({ field }: { field: 'name' | 'role' | 'date' }) => (
    <ArrowUpDown
      size={12}
      className={`ml-1 inline transition-colors ${
        sortBy === field ? 'text-[#0e7490]' : 'text-[#94a3b8]'
      }`}
    />
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-[300px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <Input
            placeholder="Cari nama, email, spesialisasi..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select value={filterRole} onValueChange={(v) => { setFilterRole(v as typeof filterRole); setPage(1); }}>
          <SelectTrigger className="w-[130px]">
            <Filter size={14} className="mr-1 text-[#94a3b8]" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Role</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-[#64748b]">{filtered.length} pengguna</span>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f0f9ff]">
                  <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                    Pengguna <SortIcon field="name" />
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('role')}>
                    Role <SortIcon field="role" />
                  </TableHead>
                  <TableHead>Spesialisasi</TableHead>
                  <TableHead>Institusi</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                    Bergabung <SortIcon field="date" />
                  </TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-[#64748b]">
                      Tidak ada pengguna ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0e7490] to-[#14b8a6] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium text-[#164e63] block">{user.name}</span>
                            {user.id === 'admin-1' && (
                              <span className="text-[10px] text-[#0e7490] font-medium">Super Admin</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#64748b]">{user.email}</TableCell>
                      <TableCell>
                        {user.role === 'admin' ? (
                          <Badge className="bg-[#0e7490] text-white border-0">Admin</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[#64748b] border-[#cffafe]">
                            User
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-[#64748b]">{user.specialization || '-'}</TableCell>
                      <TableCell className="text-[#64748b] text-sm">{user.institution || '-'}</TableCell>
                      <TableCell className="text-[#64748b] text-sm whitespace-nowrap">
                        {formatDateOnly(user.joinDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setViewUser(user)}
                            className="h-8 w-8 text-[#0e7490] hover:bg-[#f0f9ff]"
                            title="Lihat profil"
                          >
                            <Eye size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setEditRoleUser(user);
                              setNewRole(user.role);
                            }}
                            className="h-8 w-8 text-[#14b8a6] hover:bg-[#f0f9ff]"
                            title="Edit role"
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setResetPasswordUser(user);
                              setNewPassword('');
                            }}
                            className="h-8 w-8 text-amber-500 hover:bg-amber-50"
                            title="Reset password"
                          >
                            <Lock size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteUser(user)}
                            className="h-8 w-8 text-red-500 hover:bg-red-50"
                            title="Hapus pengguna"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#64748b]">Halaman {page} dari {totalPages}</p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline" size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft size={16} />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPage(p)}
                className={`h-8 w-8 p-0 text-xs ${p === page ? 'bg-[#0e7490] text-white' : ''}`}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline" size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-[#164e63] flex items-center gap-2">
              <Users size={20} className="text-[#0e7490]" />
              Profil Pengguna
            </DialogTitle>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0e7490] to-[#14b8a6] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {viewUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#164e63]">{viewUser.name}</h3>
                  <p className="text-sm text-[#64748b]">{viewUser.email}</p>
                  <div className="mt-1">
                    {viewUser.role === 'admin' ? (
                      <Badge className="bg-[#0e7490] text-white border-0">Administrator</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[#64748b] border-[#cffafe]">User</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-[#f0f9ff] rounded-lg p-3">
                  <p className="text-[#94a3b8] text-xs mb-1">Spesialisasi</p>
                  <p className="text-[#164e63] font-medium">{viewUser.specialization || '-'}</p>
                </div>
                <div className="bg-[#f0f9ff] rounded-lg p-3">
                  <p className="text-[#94a3b8] text-xs mb-1">Institusi</p>
                  <p className="text-[#164e63] font-medium">{viewUser.institution || '-'}</p>
                </div>
                <div className="bg-[#f0f9ff] rounded-lg p-3">
                  <p className="text-[#94a3b8] text-xs mb-1">Bergabung</p>
                  <p className="text-[#164e63] font-medium">{formatDateOnly(viewUser.joinDate)}</p>
                </div>
                <div className="bg-[#f0f9ff] rounded-lg p-3">
                  <p className="text-[#94a3b8] text-xs mb-1">ID Pengguna</p>
                  <p className="text-[#164e63] font-medium text-xs">{viewUser.id}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editRoleUser} onOpenChange={() => setEditRoleUser(null)}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[#164e63]">Ubah Role</DialogTitle>
            <DialogDescription>Ubah role untuk pengguna &quot;{editRoleUser?.name}&quot;</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Select value={newRole} onValueChange={(v) => setNewRole(v as 'admin' | 'user')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoleUser(null)}>Batal</Button>
            <Button
              onClick={() => editRoleUser && handleRoleChange(editRoleUser.id, newRole)}
              className="bg-[#0e7490] hover:bg-[#155e75]"
            >
              <Check size={15} className="mr-1" />
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[#164e63] flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" />
              Konfirmasi Hapus
            </DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menghapus pengguna &quot;{deleteUser?.name}&quot;?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUser(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 size={15} className="mr-1" />
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetPasswordUser} onOpenChange={() => { setResetPasswordUser(null); setNewPassword(''); }}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[#164e63] flex items-center gap-2">
              <Lock size={20} className="text-amber-500" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Atur ulang password untuk pengguna &quot;{resetPasswordUser?.name}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="block text-sm font-medium text-[#164e63] mb-1.5">Password Baru</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setResetPasswordUser(null); setNewPassword(''); }}>
              Batal
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={!newPassword.trim() || newPassword.length < 6}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Lock size={15} className="mr-1" />
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ═══════════════════════════════════════════
   COMMENTS TAB (Kelola Komentar)
   ═══════════════════════════════════════════ */
function CommentsTab({
  comments,
  setComments,
  books,
  addActivity,
}: {
  comments: AdminComment[];
  setComments: React.Dispatch<React.SetStateAction<AdminComment[]>>;
  books: Book[];
  addActivity: (type: ActivityItem['type'], message: string) => void;
}) {
  const [filterBook, setFilterBook] = useState('all');
  const [filterUser, setFilterUser] = useState('');
  const [deleteComment, setDeleteComment] = useState<AdminComment | null>(null);

  const filtered = useMemo(() => {
    return comments.filter((c) => {
      const matchBook = filterBook === 'all' || c.bookId === filterBook;
      const matchUser = !filterUser || c.userName.toLowerCase().includes(filterUser.toLowerCase());
      return matchBook && matchUser;
    });
  }, [comments, filterBook, filterUser]);

  const handleDelete = () => {
    if (!deleteComment) return;
    setComments((prev) => prev.filter((c) => c.id !== deleteComment.id));
    addActivity('comment', `Menghapus komentar dari ${deleteComment.userName}`);
    toast.success('Komentar berhasil dihapus');
    setDeleteComment(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterBook} onValueChange={setFilterBook}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter buku" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Buku</SelectItem>
            {books.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <Input
            placeholder="Filter pengguna..."
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="pl-8 w-[200px]"
          />
        </div>
        <span className="text-sm text-[#64748b]">{filtered.length} komentar</span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f0f9ff]">
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Buku</TableHead>
                  <TableHead>Komentar</TableHead>
                  <TableHead className="text-center">Rating</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-[#64748b]">
                      Tidak ada komentar
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0e7490] to-[#14b8a6] flex items-center justify-center text-white text-xs font-bold">
                            {comment.userName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[#164e63] font-medium">{comment.userName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#64748b] max-w-[150px] truncate">{comment.bookTitle}</TableCell>
                      <TableCell className="text-[#164e63] max-w-[250px] truncate">{comment.content}</TableCell>
                      <TableCell className="text-center">
                        <span className="flex items-center justify-center gap-1 text-amber-500 text-sm">
                          <Star size={12} className="fill-current" />
                          {comment.rating}
                        </span>
                      </TableCell>
                      <TableCell className="text-[#64748b] text-sm">{formatDate(comment.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost" size="icon-sm"
                          onClick={() => setDeleteComment(comment)}
                          className="h-8 w-8 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!deleteComment} onOpenChange={() => setDeleteComment(null)}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[#164e63] flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" />
              Konfirmasi Hapus
            </DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menghapus komentar ini?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteComment(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 size={15} className="mr-1" />
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


/* ═══════════════════════════════════════════
   CATEGORIES TAB (Kelola Kategori - Enhanced)
   ═══════════════════════════════════════════ */
const gradientPresets = [
  { name: 'Ocean', value: 'from-[#0e7490] to-[#14b8a6]' },
  { name: 'Sunset', value: 'from-[#f59e0b] to-[#ef4444]' },
  { name: 'Forest', value: 'from-[#16a34a] to-[#15803d]' },
  { name: 'Purple', value: 'from-[#8b5cf6] to-[#ec4899]' },
  { name: 'Dark', value: 'from-[#334155] to-[#1e293b]' },
  { name: 'Rose', value: 'from-[#f43f5e] to-[#e11d48]' },
];

function CategoriesTab({
  categories,
  setCategories,
  books,
  setBooks,
  addActivity,
}: {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  books: Book[];
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
  addActivity: (type: ActivityItem['type'], message: string) => void;
}) {
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('BookOpen');
  const [newDescription, setNewDescription] = useState('');
  const [newGradient, setNewGradient] = useState('from-[#0e7490] to-[#14b8a6]');
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [hasBooksWarning, setHasBooksWarning] = useState(false);

  const availableIcons = Object.keys(iconMap);

  const getBookCount = (slug: string) => books.filter((b) => b.categorySlug === slug).length;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error('Nama kategori wajib diisi');
      return;
    }
    const slug = newName.toLowerCase().replace(/\s+/g, '-');
    const newCat: Category = {
      id: generateId(),
      name: newName.trim(),
      slug,
      description: newDescription.trim(),
      icon: newIcon,
      bookCount: 0,
      gradient: newGradient,
    };
    setCategories((prev) => [...prev, newCat]);
    addActivity('category', `Menambahkan kategori "${newCat.name}"`);
    toast.success('Kategori berhasil ditambahkan');
    setNewName('');
    setNewDescription('');
    setNewIcon('BookOpen');
    setNewGradient('from-[#0e7490] to-[#14b8a6]');
  };

  const handleEditSave = () => {
    if (!editCategory || !editCategory.name.trim()) {
      toast.error('Nama kategori wajib diisi');
      return;
    }
    const oldSlug = categories.find((c) => c.id === editCategory.id)?.slug;
    const newSlug = editCategory.name.toLowerCase().replace(/\s+/g, '-');

    setCategories((prev) =>
      prev.map((c) =>
        c.id === editCategory.id
          ? { ...editCategory, slug: newSlug }
          : c,
      ),
    );

    if (oldSlug && oldSlug !== newSlug) {
      setBooks((prev) =>
        prev.map((b) =>
          b.categorySlug === oldSlug
            ? { ...b, categorySlug: newSlug, category: editCategory.name }
            : b,
        ),
      );
    }

    addActivity('category', `Mengedit kategori "${editCategory.name}"`);
    toast.success('Kategori berhasil diperbarui');
    setEditCategory(null);
  };

  const handleDelete = () => {
    if (!deleteCategory) return;
    const hasBooks = books.some((b) => b.categorySlug === deleteCategory.slug);
    if (hasBooks) {
      setHasBooksWarning(true);
      setDeleteCategory(null);
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== deleteCategory.id));
    addActivity('category', `Menghapus kategori "${deleteCategory.name}"`);
    toast.success('Kategori berhasil dihapus');
    setDeleteCategory(null);
  };

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categories.length - 1) return;
    const newCategories = [...categories];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newCategories[index], newCategories[swapIndex]] = [newCategories[swapIndex], newCategories[index]];
    setCategories(newCategories);
  };

  return (
    <div className="space-y-6">
      {/* Add Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#164e63] text-base flex items-center gap-2">
            <PlusCircle size={18} className="text-[#0e7490]" />
            Tambah Kategori
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium text-[#164e63] mb-1 block">Nama Kategori</label>
                <Input
                  placeholder="Nama kategori baru..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#164e63] mb-1 block">Ikon</label>
                <Select value={newIcon} onValueChange={setNewIcon}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableIcons.map((iconName) => {
                      const IconComp = iconMap[iconName];
                      return (
                        <SelectItem key={iconName} value={iconName}>
                          <span className="flex items-center gap-2">
                            <IconComp size={14} />
                            {iconName}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="bg-[#0e7490] hover:bg-[#155e75]">
                <PlusCircle size={15} className="mr-1" />
                Tambah
              </Button>
            </div>
            <div>
              <label className="text-sm font-medium text-[#164e63] mb-1 block">Deskripsi</label>
              <Textarea
                placeholder="Deskripsi kategori (opsional)..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#164e63] mb-1 block">Gradient</label>
              <div className="flex flex-wrap gap-2">
                {gradientPresets.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setNewGradient(g.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      newGradient === g.value
                        ? 'border-[#0e7490] bg-[#f0f9ff] text-[#0e7490]'
                        : 'border-[#cffafe] text-[#64748b] hover:border-[#0e7490]'
                    }`}
                  >
                    <span className={`inline-block w-3 h-3 rounded-full bg-gradient-to-r ${g.value} mr-1 align-middle`} />
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Category List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, index) => {
          const IconComp = getIconComponent(cat.icon);
          const count = getBookCount(cat.slug);
          return (
            <motion.div
              key={cat.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl border border-[#cffafe] p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.gradient || 'from-[#0e7490] to-[#14b8a6]'} flex items-center justify-center text-white`}>
                    <IconComp size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#164e63]">{cat.name}</h3>
                    <button
                      onClick={() => {
                        if (count > 0) {
                          const params = new URLSearchParams({ category: cat.slug });
                          window.location.href = `/?${params.toString()}`;
                        }
                      }}
                      className={`text-xs ${count > 0 ? 'text-[#0e7490] hover:underline cursor-pointer' : 'text-[#64748b] cursor-default'}`}
                      title={count > 0 ? 'Lihat buku dalam kategori ini' : ''}
                    >
                      {count} buku &middot; {cat.slug}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost" size="icon-sm"
                    onClick={() => moveCategory(index, 'up')}
                    disabled={index === 0}
                    className="h-7 w-7 text-[#64748b] hover:bg-[#f0f9ff] disabled:opacity-30"
                    title="Naik"
                  >
                    <MoveUp size={13} />
                  </Button>
                  <Button
                    variant="ghost" size="icon-sm"
                    onClick={() => moveCategory(index, 'down')}
                    disabled={index === categories.length - 1}
                    className="h-7 w-7 text-[#64748b] hover:bg-[#f0f9ff] disabled:opacity-30"
                    title="Turun"
                  >
                    <MoveDown size={13} />
                  </Button>
                  <Button
                    variant="ghost" size="icon-sm"
                    onClick={() => setEditCategory(cat)}
                    className="h-7 w-7 text-[#0e7490] hover:bg-[#f0f9ff]"
                  >
                    <Pencil size={13} />
                  </Button>
                  <Button
                    variant="ghost" size="icon-sm"
                    onClick={() => setDeleteCategory(cat)}
                    className="h-7 w-7 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
              {cat.description && (
                <p className="mt-2 text-xs text-[#64748b] line-clamp-2">{cat.description}</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editCategory} onOpenChange={() => setEditCategory(null)}>
        <DialogContent className="max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-[#164e63]">Edit Kategori</DialogTitle>
          </DialogHeader>
          {editCategory && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#164e63] mb-1 block">Nama Kategori</label>
                <Input
                  value={editCategory.name}
                  onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#164e63] mb-1 block">Deskripsi</label>
                <Textarea
                  value={editCategory.description || ''}
                  onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
                  rows={2} className="text-sm" placeholder="Deskripsi kategori..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#164e63] mb-1 block">Ikon</label>
                <Select value={editCategory.icon} onValueChange={(v) => setEditCategory({ ...editCategory, icon: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {availableIcons.map((iconName) => {
                      const IconComp = iconMap[iconName];
                      return (
                        <SelectItem key={iconName} value={iconName}>
                          <span className="flex items-center gap-2">
                            <IconComp size={14} />
                            {iconName}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-[#164e63] mb-1 block">Gradient</label>
                <div className="flex flex-wrap gap-2">
                  {gradientPresets.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setEditCategory({ ...editCategory, gradient: g.value })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        editCategory.gradient === g.value
                          ? 'border-[#0e7490] bg-[#f0f9ff] text-[#0e7490]'
                          : 'border-[#cffafe] text-[#64748b] hover:border-[#0e7490]'
                      }`}
                    >
                      <span className={`inline-block w-3 h-3 rounded-full bg-gradient-to-r ${g.value} mr-1 align-middle`} />
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditCategory(null)}>Batal</Button>
                <Button onClick={handleEditSave} className="bg-[#0e7490] hover:bg-[#155e75]">
                  <Save size={15} className="mr-1" />
                  Simpan
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteCategory} onOpenChange={() => { setDeleteCategory(null); setHasBooksWarning(false); }}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[#164e63] flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" />
              Konfirmasi Hapus
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kategori &quot;{deleteCategory?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          {hasBooksWarning && (
            <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
              Kategori ini masih memiliki buku. Pindahkan atau hapus buku terlebih dahulu.
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteCategory(null); setHasBooksWarning(false); }}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 size={15} className="mr-1" />
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


/* ═══════════════════════════════════════════
   BACKGROUND EDITOR TAB (NEW)
   ═══════════════════════════════════════════ */
function BackgroundTab({
  background,
  setBackground,
  addActivity,
}: {
  background: BackgroundConfig;
  setBackground: React.Dispatch<React.SetStateAction<BackgroundConfig>>;
  addActivity: (type: ActivityItem['type'], message: string) => void;
}) {
  const [localBg, setLocalBg] = useState<BackgroundConfig>({ ...background });
  const [isDragOver, setIsDragOver] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalBg({ ...background });
  }, [background]);

  const handleSave = () => {
    setBackground(localBg);
    addActivity('background', 'Mengubah pengaturan wallpaper');
    toast.success('Pengaturan wallpaper disimpan');
  };

  const handleReset = () => {
    setLocalBg({ ...defaultBackground });
    setBackground({ ...defaultBackground });
    addActivity('background', 'Mereset wallpaper ke default');
    toast.success('Wallpaper direset ke default');
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (JPG, PNG, GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setLocalBg((prev) => ({ ...prev, customImage: result, type: 'custom' }));
      toast.success('Gambar berhasil diupload');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran gambar maksimal 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setLocalBg((prev) => ({ ...prev, customImage: result, type: 'custom' }));
        toast.success('Gambar berhasil diupload');
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('File harus berupa gambar');
    }
  };

  const previewImage = localBg.type === 'custom' ? localBg.customImage : localBg.presetImage;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Enable Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#164e63] text-base flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[#0e7490]" />
                Pengaturan Wallpaper
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#164e63]">Aktifkan Wallpaper Kustom</p>
                  <p className="text-xs text-[#64748b]">Tampilkan gambar background di halaman utama</p>
                </div>
                <Switch
                  checked={localBg.enabled}
                  onCheckedChange={(v) => setLocalBg((prev) => ({ ...prev, enabled: v }))}
                />
              </div>

              <div className="border-t border-[#cffafe] pt-4">
                <p className="text-sm font-medium text-[#164e63] mb-3">Tipe Background</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setLocalBg((prev) => ({ ...prev, type: 'gradient' }))}
                    className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-all ${
                      localBg.type === 'gradient'
                        ? 'border-[#0e7490] bg-[#f0f9ff] text-[#0e7490]'
                        : 'border-[#cffafe] text-[#64748b] hover:border-[#0e7490]'
                    }`}
                  >
                    <Grid3X3 size={18} className="mx-auto mb-1" />
                    Gradient (Default)
                  </button>
                  <button
                    onClick={() => setLocalBg((prev) => ({ ...prev, type: 'custom' }))}
                    className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-all ${
                      localBg.type === 'custom'
                        ? 'border-[#0e7490] bg-[#f0f9ff] text-[#0e7490]'
                        : 'border-[#cffafe] text-[#64748b] hover:border-[#0e7490]'
                    }`}
                  >
                    <ImageIcon size={18} className="mx-auto mb-1" />
                    Gambar Kustom
                  </button>
                </div>
              </div>

              {/* Opacity Slider */}
              <div className="border-t border-[#cffafe] pt-4">
                <label className="text-sm font-medium text-[#164e63] mb-2 block">
                  Opacity: {localBg.opacity}%
                </label>
                <Slider
                  value={[localBg.opacity]}
                  onValueChange={(v) => setLocalBg((prev) => ({ ...prev, opacity: v[0] }))}
                  min={0} max={100} step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-[#94a3b8] mt-1">
                  <span>Transparan</span>
                  <span>Opaque</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preset Selection */}
          {localBg.type === 'gradient' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-[#164e63] text-base flex items-center gap-2">
                  <Sparkles size={18} className="text-[#f59e0b]" />
                  Preset Background
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {presetBackgrounds.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setLocalBg((prev) => ({ ...prev, presetImage: preset.value }))}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                        localBg.presetImage === preset.value
                          ? 'border-[#0e7490] bg-[#f0f9ff]'
                          : 'border-[#cffafe] hover:border-[#0e7490]'
                      }`}
                    >
                      <div className="w-16 h-10 rounded bg-gradient-to-br from-[#0e7490] to-[#14b8a6] flex items-center justify-center text-white text-xs">
                        <ImageIcon size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#164e63]">{preset.name}</p>
                        <p className="text-xs text-[#64748b]">{preset.value}</p>
                      </div>
                      {localBg.presetImage === preset.value && (
                        <Check size={16} className="text-[#0e7490] ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Custom Upload */}
          {localBg.type === 'custom' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-[#164e63] text-base flex items-center gap-2">
                  <Upload size={18} className="text-[#14b8a6]" />
                  Upload Gambar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => coverInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-[#0e7490] bg-[#f0f9ff] scale-[1.01]'
                      : 'border-[#0e7490]/30 hover:border-[#0e7490] hover:bg-[#f0f9ff]/30'
                  }`}
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                    isDragOver ? 'bg-[#0e7490] text-white' : 'bg-[#f0f9ff] text-[#0e7490]'
                  }`}>
                    <Upload size={22} />
                  </div>
                  <p className="text-sm font-medium text-[#164e63]">Drag & drop gambar di sini</p>
                  <p className="text-xs text-[#64748b] mt-1">JPG, PNG, GIF (max 5MB)</p>
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSave} className="bg-[#0e7490] hover:bg-[#155e75]">
              <Save size={15} className="mr-1" />
              Simpan Pengaturan
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw size={15} className="mr-1" />
              Reset Default
            </Button>
          </div>
        </div>

        {/* Preview Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#164e63] text-base flex items-center gap-2">
              <Eye size={18} className="text-[#14b8a6]" />
              Pratinjau
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="relative rounded-xl overflow-hidden"
              style={{ height: '320px' }}
            >
              {/* Background Layer */}
              {localBg.enabled && (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${previewImage})`,
                    opacity: localBg.opacity / 100,
                  }}
                />
              )}
              {/* Gradient fallback */}
              {(!localBg.enabled || localBg.type === 'gradient') && (
                <div
                  className="absolute inset-0 bg-gradient-to-br from-[#f0f9ff] via-[#ecfeff] to-[#ccfbf1]"
                  style={{ opacity: localBg.enabled ? 1 - localBg.opacity / 100 : 1 }}
                />
              )}
              {/* Sample Content */}
              <div className="relative z-10 p-6 h-full flex flex-col justify-center items-center text-center">
                <Brain size={36} className="text-[#0e7490] mb-3" />
                <h3 className="text-lg font-bold text-[#164e63]">NeuroLibrary</h3>
                <p className="text-sm text-[#64748b] mt-1">Perpustakaan Digital Neurologi</p>
                <div className="mt-4 flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#0e7490]/10 text-[#0e7490] text-xs font-medium">
                    150+ Buku
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#14b8a6]/10 text-[#14b8a6] text-xs font-medium">
                    12 Kategori
                  </span>
                </div>
                <p className="text-[10px] text-[#94a3b8] mt-3">
                  {localBg.enabled
                    ? `Wallpaper aktif (${localBg.type}, opacity ${localBg.opacity}%)`
                    : 'Wallpaper tidak aktif (gradient default)'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ABOUT EDITOR TAB (NEW)
   ═══════════════════════════════════════════ */
function AboutEditorTab({
  about,
  setAbout,
  addActivity,
}: {
  about: AboutConfig;
  setAbout: React.Dispatch<React.SetStateAction<AboutConfig>>;
  addActivity: (type: ActivityItem['type'], message: string) => void;
}) {
  const [localAbout, setLocalAbout] = useState<AboutConfig>({ ...about });
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    setLocalAbout({ ...about });
  }, [about]);

  const handleSave = () => {
    setAbout(localAbout);
    addActivity('about', 'Mengubah halaman tentang');
    toast.success('Perubahan halaman tentang disimpan');
  };

  const handleReset = () => {
    setLocalAbout({ ...defaultAbout });
    setAbout({ ...defaultAbout });
    addActivity('about', 'Mereset halaman tentang ke default');
    toast.success('Halaman tentang direset');
  };

  const addMember = () => {
    const newMember: TeamMember = {
      id: generateId(),
      name: '',
      title: '',
      specialty: '',
      institution: '',
      avatar: '',
    };
    setLocalAbout((prev) => ({ ...prev, team: [...prev.team, newMember] }));
    setEditingMember(newMember);
  };

  const updateMember = (updated: TeamMember) => {
    setLocalAbout((prev) => ({
      ...prev,
      team: prev.team.map((m) => (m.id === updated.id ? updated : m)),
    }));
    setEditingMember(null);
  };

  const removeMember = (id: string) => {
    setLocalAbout((prev) => ({
      ...prev,
      team: prev.team.filter((m) => m.id !== id),
    }));
    setEditingMember(null);
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSave} className="bg-[#0e7490] hover:bg-[#155e75]">
          <Save size={15} className="mr-1" />
          Simpan Perubahan
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw size={15} className="mr-1" />
          Reset Default
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Forms */}
        <div className="space-y-6">
          {/* Mission Statement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#164e63] text-base flex items-center gap-2">
                <Sparkles size={18} className="text-[#f59e0b]" />
                Misi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={5}
                placeholder="Tulis pernyataan misi..."
                value={localAbout.mission}
                onChange={(e) => setLocalAbout((prev) => ({ ...prev, mission: e.target.value }))}
              />
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#164e63] text-base flex items-center gap-2">
                <Mail size={18} className="text-[#14b8a6]" />
                Kontak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-[#64748b] mb-1 block">Email</label>
                <Input
                  value={localAbout.contact.email}
                  onChange={(e) =>
                    setLocalAbout((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-[#64748b] mb-1 block">Telepon</label>
                <Input
                  value={localAbout.contact.phone}
                  onChange={(e) =>
                    setLocalAbout((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, phone: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-[#64748b] mb-1 block">Alamat</label>
                <Textarea
                  rows={2}
                  value={localAbout.contact.address}
                  onChange={(e) =>
                    setLocalAbout((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, address: e.target.value },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#164e63] text-base flex items-center gap-2">
                <Globe size={18} className="text-[#0e7490]" />
                Social Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-[#64748b] mb-1 flex items-center gap-1">
                  <Github size={12} /> GitHub
                </label>
                <Input
                  placeholder="https://github.com/..."
                  value={localAbout.social.github}
                  onChange={(e) =>
                    setLocalAbout((prev) => ({
                      ...prev,
                      social: { ...prev.social, github: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-[#64748b] mb-1 flex items-center gap-1">
                  <Twitter size={12} /> Twitter
                </label>
                <Input
                  placeholder="https://twitter.com/..."
                  value={localAbout.social.twitter}
                  onChange={(e) =>
                    setLocalAbout((prev) => ({
                      ...prev,
                      social: { ...prev.social, twitter: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-[#64748b] mb-1 flex items-center gap-1">
                  <Linkedin size={12} /> LinkedIn
                </label>
                <Input
                  placeholder="https://linkedin.com/..."
                  value={localAbout.social.linkedin}
                  onChange={(e) =>
                    setLocalAbout((prev) => ({
                      ...prev,
                      social: { ...prev.social, linkedin: e.target.value },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#164e63] text-base flex items-center gap-2">
                  <Users size={18} className="text-[#8b5cf6]" />
                  Tim ({localAbout.team.length})
                </CardTitle>
                <Button size="sm" onClick={addMember} className="bg-[#0e7490] hover:bg-[#155e75]">
                  <PlusCircle size={14} className="mr-1" />
                  Tambah
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {localAbout.team.map((member) => (
                <motion.div
                  key={member.id}
                  layout
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#f0f9ff] border border-[#cffafe]"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0e7490] to-[#14b8a6] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {member.name.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#164e63] truncate">
                      {member.name || '(Belum diisi)'}
                    </p>
                    <p className="text-xs text-[#64748b]">{member.title || '-'}</p>
                  </div>
                  <Button
                    variant="ghost" size="icon-sm"
                    onClick={() => setEditingMember(member)}
                    className="h-7 w-7 text-[#0e7490] hover:bg-white"
                  >
                    <Pencil size={13} />
                  </Button>
                  <Button
                    variant="ghost" size="icon-sm"
                    onClick={() => removeMember(member.id)}
                    className="h-7 w-7 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={13} />
                  </Button>
                </motion.div>
              ))}
              {localAbout.team.length === 0 && (
                <p className="text-sm text-[#64748b] text-center py-4">Belum ada anggota tim</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview */}
        <Card className="h-fit sticky top-0">
          <CardHeader>
            <CardTitle className="text-[#164e63] text-base flex items-center gap-2">
              <Eye size={18} className="text-[#14b8a6]" />
              Pratinjau Halaman Tentang
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mission Preview */}
            <div>
              <h4 className="text-sm font-semibold text-[#0e7490] mb-2 flex items-center gap-2">
                <Sparkles size={14} /> Misi Kami
              </h4>
              <div className="bg-[#f0f9ff] rounded-lg p-4">
                <p className="text-sm text-[#164e63] leading-relaxed">
                  {localAbout.mission || '(Belum diisi)'}
                </p>
              </div>
            </div>

            {/* Team Preview */}
            <div>
              <h4 className="text-sm font-semibold text-[#0e7490] mb-2 flex items-center gap-2">
                <Users size={14} /> Tim Kami
              </h4>
              <div className="space-y-2">
                {localAbout.team.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-[#f0f9ff] rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0e7490] to-[#14b8a6] flex items-center justify-center text-white text-sm font-bold">
                      {member.name.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#164e63]">{member.name || '-'}</p>
                      <p className="text-xs text-[#64748b]">{member.title || '-'} &middot; {member.specialty || '-'}</p>
                      <p className="text-xs text-[#94a3b8]">{member.institution || '-'}</p>
                    </div>
                  </div>
                ))}
                {localAbout.team.length === 0 && (
                  <p className="text-xs text-[#64748b] text-center py-2">Belum ada anggota tim</p>
                )}
              </div>
            </div>

            {/* Contact Preview */}
            <div>
              <h4 className="text-sm font-semibold text-[#0e7490] mb-2 flex items-center gap-2">
                <Mail size={14} /> Hubungi Kami
              </h4>
              <div className="bg-[#f0f9ff] rounded-lg p-4 space-y-2">
                {localAbout.contact.email && (
                  <p className="text-xs text-[#64748b] flex items-center gap-2">
                    <Mail size={12} className="text-[#0e7490]" /> {localAbout.contact.email}
                  </p>
                )}
                {localAbout.contact.phone && (
                  <p className="text-xs text-[#64748b] flex items-center gap-2">
                    <Phone size={12} className="text-[#14b8a6]" /> {localAbout.contact.phone}
                  </p>
                )}
                {localAbout.contact.address && (
                  <p className="text-xs text-[#64748b] flex items-center gap-2">
                    <MapPin size={12} className="text-[#ec4899]" /> {localAbout.contact.address}
                  </p>
                )}
                <div className="flex items-center gap-3 pt-1">
                  {localAbout.social.github && (
                    <a href={localAbout.social.github} target="_blank" rel="noopener noreferrer" className="text-[#64748b] hover:text-[#0e7490]">
                      <Github size={16} />
                    </a>
                  )}
                  {localAbout.social.twitter && (
                    <a href={localAbout.social.twitter} target="_blank" rel="noopener noreferrer" className="text-[#64748b] hover:text-[#0e7490]">
                      <Twitter size={16} />
                    </a>
                  )}
                  {localAbout.social.linkedin && (
                    <a href={localAbout.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#64748b] hover:text-[#0e7490]">
                      <Linkedin size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Member Dialog */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent className="max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-[#164e63]">
              {editingMember?.name ? 'Edit Anggota' : 'Anggota Baru'}
            </DialogTitle>
          </DialogHeader>
          {editingMember && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-[#164e63] mb-1 block">Nama</label>
                <Input
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  placeholder="Nama lengkap..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#164e63] mb-1 block">Jabatan</label>
                <Input
                  value={editingMember.title}
                  onChange={(e) => setEditingMember({ ...editingMember, title: e.target.value })}
                  placeholder="Jabatan..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#164e63] mb-1 block">Spesialisasi</label>
                <Input
                  value={editingMember.specialty}
                  onChange={(e) => setEditingMember({ ...editingMember, specialty: e.target.value })}
                  placeholder="Spesialisasi..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#164e63] mb-1 block">Institusi</label>
                <Input
                  value={editingMember.institution}
                  onChange={(e) => setEditingMember({ ...editingMember, institution: e.target.value })}
                  placeholder="Institusi..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#164e63] mb-1 block">URL Avatar (opsional)</label>
                <Input
                  value={editingMember.avatar}
                  onChange={(e) => setEditingMember({ ...editingMember, avatar: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingMember(null)}>Batal</Button>
                <Button onClick={() => editingMember && updateMember(editingMember)} className="bg-[#0e7490] hover:bg-[#155e75]">
                  <Save size={15} className="mr-1" />
                  Simpan
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


/* ═══════════════════════════════════════════
   THEME TAB (Edit Tema - Enhanced)
   ═══════════════════════════════════════════ */
const fontOptions = ['Inter', 'Poppins', 'Roboto', 'Open Sans'];

function ThemeTab({
  theme,
  setTheme,
  addActivity,
}: {
  theme: ThemeConfig;
  setTheme: React.Dispatch<React.SetStateAction<ThemeConfig>>;
  addActivity: (type: ActivityItem['type'], message: string) => void;
}) {
  const [localTheme, setLocalTheme] = useState<ThemeConfig>({ ...theme });
  const [importJson, setImportJson] = useState('');
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    setLocalTheme({ ...theme });
  }, [theme]);

  const update = (key: keyof ThemeConfig, value: string | number) => {
    setLocalTheme((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setTheme(localTheme);
    addActivity('theme', 'Mengubah tema website');
    toast.success('Tema berhasil disimpan');
  };

  const handleReset = () => {
    setLocalTheme({ ...defaultTheme });
    setTheme({ ...defaultTheme });
    addActivity('theme', 'Mereset tema ke default');
    toast.success('Tema direset ke default');
  };

  const applyPreset = (preset: ThemeConfig) => {
    setLocalTheme({ ...preset });
    setTheme({ ...preset });
    addActivity('theme', `Menerapkan preset tema`);
    toast.success('Preset tema diterapkan');
  };

  const handleExportCSS = () => {
    const css = `:root {
  --primary: ${localTheme.primary};
  --secondary: ${localTheme.secondary};
  --accent: ${localTheme.accent};
  --neural: ${localTheme.neural};
  --background: ${localTheme.background};
  --text: ${localTheme.text};
  --border: ${localTheme.border || '#cffafe'};
  --font: ${localTheme.font || 'Inter'};
  --font-size: ${localTheme.fontSize || 14}px;
  --border-radius: ${localTheme.borderRadius || 8}px;
}`;
    navigator.clipboard.writeText(css).then(() => toast.success('CSS tema disalin ke clipboard'));
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(localTheme, null, 2);
    navigator.clipboard.writeText(json).then(() => toast.success('JSON tema disalin ke clipboard'));
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importJson);
      const newTheme = { ...defaultTheme, ...parsed };
      setLocalTheme(newTheme);
      setTheme(newTheme);
      addActivity('theme', 'Mengimpor tema dari JSON');
      toast.success('Tema berhasil diimpor');
      setShowImport(false);
      setImportJson('');
    } catch {
      toast.error('JSON tidak valid');
    }
  };

  const colorFields: { key: keyof ThemeConfig; label: string }[] = [
    { key: 'primary', label: 'Primary' },
    { key: 'secondary', label: 'Secondary' },
    { key: 'accent', label: 'Accent' },
    { key: 'neural', label: 'Neural' },
    { key: 'background', label: 'Background' },
    { key: 'text', label: 'Text' },
    { key: 'border', label: 'Border' },
  ];

  const fontSize = localTheme.fontSize || 14;
  const borderRadius = localTheme.borderRadius || 8;
  const font = localTheme.font || 'Inter';

  return (
    <div className="space-y-6">
      {/* Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#164e63] text-base flex items-center gap-2">
            <Sparkles size={18} className="text-[#f59e0b]" />
            Preset Tema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {themePresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset.colors)}
                className="p-3 rounded-xl border border-[#cffafe] hover:shadow-md transition-all text-left group"
              >
                <div className="flex gap-1.5 mb-2">
                  {Object.values(preset.colors).slice(0, 4).map((color, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: color as string }}
                    />
                  ))}
                </div>
                <p className="text-sm font-medium text-[#164e63] group-hover:text-[#0e7490]">
                  {preset.name}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Pickers & Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#164e63] text-base flex items-center gap-2">
              <Palette size={18} className="text-[#ec4899]" />
              Warna & Tampilan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Color Fields */}
            {colorFields.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-white shadow-sm"
                  style={{ backgroundColor: localTheme[key] as string }}
                />
                <div className="flex-1">
                  <label className="text-sm font-medium text-[#164e63] block">{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={localTheme[key] as string}
                      onChange={(e) => update(key, e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                    />
                    <Input
                      value={localTheme[key] as string}
                      onChange={(e) => update(key, e.target.value)}
                      className="w-[100px] text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Font Selector */}
            <div className="border-t border-[#cffafe] pt-4">
              <label className="text-sm font-medium text-[#164e63] mb-2 block">Font</label>
              <Select value={font} onValueChange={(v) => update('font', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font Size Slider */}
            <div className="pt-2">
              <label className="text-sm font-medium text-[#164e63] block mb-2">
                Ukuran Font: {fontSize}px
              </label>
              <input
                type="range"
                min={10}
                max={20}
                value={fontSize}
                onChange={(e) => update('fontSize', parseInt(e.target.value))}
                className="w-full accent-[#0e7490]"
              />
              <div className="flex justify-between text-[10px] text-[#94a3b8]">
                <span>10px</span>
                <span>20px</span>
              </div>
            </div>

            {/* Border Radius Slider */}
            <div className="pt-2">
              <label className="text-sm font-medium text-[#164e63] block mb-2">
                Border Radius: {borderRadius}px
              </label>
              <input
                type="range"
                min={0}
                max={24}
                value={borderRadius}
                onChange={(e) => update('borderRadius', parseInt(e.target.value))}
                className="w-full accent-[#0e7490]"
              />
              <div className="flex justify-between text-[10px] text-[#94a3b8]">
                <span>0px</span>
                <span>24px</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button onClick={handleSave} className="bg-[#0e7490] hover:bg-[#155e75]">
                <Save size={15} className="mr-1" />
                Simpan Tema
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw size={15} className="mr-1" />
                Reset
              </Button>
              <Button variant="outline" onClick={handleExportCSS}>
                <FileText size={15} className="mr-1" />
                Export CSS
              </Button>
              <Button variant="outline" onClick={handleExportJSON}>
                <FileDown size={15} className="mr-1" />
                Export JSON
              </Button>
              <Button variant="outline" onClick={() => setShowImport(!showImport)}>
                <Upload size={15} className="mr-1" />
                Import JSON
              </Button>
            </div>

            {showImport && (
              <div className="space-y-2 pt-2">
                <Textarea
                  placeholder='Tempel JSON tema di sini...\nContoh: { "primary": "#0e7490", "secondary": "#14b8a6" }'
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  rows={4}
                  className="text-xs font-mono"
                />
                <Button onClick={handleImport} className="bg-[#0e7490] hover:bg-[#155e75] text-xs">
                  Terapkan Tema JSON
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#164e63] text-base flex items-center gap-2">
              <Eye size={18} className="text-[#14b8a6]" />
              Pratinjau Langsung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="rounded-xl space-y-3 overflow-hidden"
              style={{ backgroundColor: localTheme.background, fontSize: `${fontSize}px`, fontFamily: font, borderRadius: `${borderRadius}px` }}
            >
              {/* Sample Navbar */}
              <div
                className="px-4 py-2.5 flex items-center gap-3"
                style={{ backgroundColor: localTheme.primary, borderRadius: 0 }}
              >
                <Brain size={20} className="text-white" />
                <div className="flex-1 h-3 rounded bg-white/20 w-24" />
                <div className="h-3 rounded bg-white/20 w-16" />
              </div>

              <div className="p-4 space-y-3">
                {/* Sample Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    className="px-4 py-2 text-white text-sm font-medium"
                    style={{ backgroundColor: localTheme.primary, borderRadius: `${borderRadius}px` }}
                  >
                    Primary
                  </button>
                  <button
                    className="px-4 py-2 text-white text-sm font-medium"
                    style={{ backgroundColor: localTheme.secondary, borderRadius: `${borderRadius}px` }}
                  >
                    Secondary
                  </button>
                  <button
                    className="px-4 py-2 text-sm font-medium border"
                    style={{ borderColor: localTheme.primary, color: localTheme.primary, borderRadius: `${borderRadius}px`, backgroundColor: 'white' }}
                  >
                    Outline
                  </button>
                </div>

                {/* Sample Card */}
                <div
                  className="p-3 bg-white shadow-sm border"
                  style={{ borderColor: (localTheme.primary) + '30', borderRadius: `${borderRadius}px` }}
                >
                  <h4 className="font-semibold mb-1" style={{ color: localTheme.text, fontSize: `${fontSize + 2}px` }}>
                    Judul Kartu
                  </h4>
                  <p style={{ color: localTheme.text + 'aa', fontSize: `${fontSize}px` }}>
                    Ini adalah contoh teks dalam kartu untuk melihat bagaimana warna teks dan
                    latar belakang bekerja bersama.
                  </p>
                </div>

                {/* Sample Badges */}
                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-1 font-medium text-white"
                    style={{ backgroundColor: localTheme.accent, borderRadius: `${borderRadius * 2}px`, fontSize: `${fontSize - 2}px` }}
                  >
                    Accent
                  </span>
                  <span
                    className="px-2.5 py-1 font-medium text-white"
                    style={{ backgroundColor: localTheme.neural, borderRadius: `${borderRadius * 2}px`, fontSize: `${fontSize - 2}px` }}
                  >
                    Neural
                  </span>
                  <span
                    className="px-2.5 py-1 font-medium"
                    style={{ backgroundColor: localTheme.background, color: localTheme.text, border: `1px solid ${localTheme.primary}30`, borderRadius: `${borderRadius * 2}px`, fontSize: `${fontSize - 2}px` }}
                  >
                    Badge
                  </span>
                </div>

                {/* Sample Progress */}
                <div>
                  <div className="flex justify-between mb-1" style={{ color: localTheme.text, fontSize: `${fontSize - 2}px` }}>
                    <span>Progress</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/50">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: '75%',
                        background: `linear-gradient(to right, ${localTheme.primary}, ${localTheme.secondary})`,
                      }}
                    />
                  </div>
                </div>

                {/* Sample Input */}
                <div
                  className="p-2 bg-white border flex items-center gap-2"
                  style={{ borderColor: (localTheme.primary) + '30', borderRadius: `${borderRadius}px` }}
                >
                  <Search size={14} style={{ color: localTheme.text + '80' }} />
                  <span style={{ color: localTheme.text + '80', fontSize: `${fontSize - 1}px` }}>Cari buku...</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════
   ADD BOOK TAB (Tambah Buku - Enhanced)
   ═══════════════════════════════════════════ */
function AddBookTab({
  setBooks,
  categories,
  addActivity,
}: {
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
  categories: Category[];
  addActivity: (type: ActivityItem['type'], message: string) => void;
}) {
  const emptyBook: Book = {
    id: '',
    title: '',
    author: '',
    category: categories[0]?.name || '',
    categorySlug: categories[0]?.slug || '',
    description: '',
    coverImage: '/placeholder-book.png',
    format: 'PDF',
    rating: 0,
    ratingCount: 0,
    downloads: 0,
    year: new Date().getFullYear(),
    pages: 0,
    isbn: '',
    publisher: '',
    language: 'English',
    featured: false,
    tags: [],
  };

  const [form, setForm] = useState<Book & { externalUrl?: string; sourceType?: 'upload' | 'external'; toc?: string; synopsis?: string; tagsInput?: string }>({
    ...emptyBook,
    externalUrl: '',
    sourceType: 'upload',
    toc: '',
    synopsis: '',
    tagsInput: '',
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [coverPreview, setCoverPreview] = useState<string>('/placeholder-book.png');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = <K extends string>(field: K, value: unknown) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'title' && typeof value === 'string') {
        // keep existing behavior
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (JPG, PNG, GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setCoverPreview(result);
      update('coverImage', result);
      toast.success('Cover berhasil diupload');
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validExts = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validExts.includes(ext)) {
      toast.error('Format tidak didukung. Gunakan PDF, Word, Excel, atau PowerPoint.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File terlalu besar. Maksimal 10MB.');
      return;
    }
    setUploadedFile(file);
    const formatMap: Record<string, BookFormat> = {
      '.pdf': 'PDF', '.doc': 'DOC', '.docx': 'DOCX',
      '.ppt': 'PPT', '.pptx': 'PPTX', '.xls': 'XLS', '.xlsx': 'XLSX',
    };
    if (formatMap[ext]) {
      update('format', formatMap[ext]);
    }
    toast.success(`File "${file.name}" siap diupload`);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      const validExts = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'];
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      if (!validExts.includes(ext)) {
        toast.error('Format tidak didukung');
        return;
      }
      setUploadedFile(f);
      toast.success(`File "${f.name}" siap diupload`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, boolean> = {};
    if (!form.title.trim()) newErrors.title = true;
    if (!form.author.trim()) newErrors.author = true;
    if (!form.category) newErrors.category = true;
    if (!form.year || form.year < 1800) newErrors.year = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Mohon lengkapi field yang wajib diisi');
      return;
    }

    const selectedCat = categories.find((c) => c.name === form.category);
    const tagList = form.tagsInput?.split(',').map((t) => t.trim()).filter(Boolean) || [];
    const newBook: Book = {
      ...form,
      id: generateId(),
      categorySlug: selectedCat?.slug || form.categorySlug || slugify(form.title),
      tags: tagList,
      description: form.synopsis || form.description || '',
    };

    setBooks((prev) => [newBook, ...prev]);
    addActivity('book', `Menambahkan buku "${newBook.title}"`);
    toast.success('Buku berhasil ditambahkan!');
    setForm({ ...emptyBook, externalUrl: '', sourceType: 'upload', toc: '', synopsis: '', tagsInput: '' });
    setCoverPreview('/placeholder-book.png');
    setUploadedFile(null);
  };

  return (
    <Card className="max-w-[900px]">
      <CardHeader>
        <CardTitle className="text-[#164e63] text-base flex items-center gap-2">
          <PlusCircle size={18} className="text-[#0e7490]" />
          Form Tambah Buku
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Upload Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-1">
              <label className="text-sm font-medium text-[#164e63] mb-2 block">Cover Buku</label>
              <div
                onClick={() => coverInputRef.current?.click()}
                className="relative aspect-[3/4] rounded-xl border-2 border-dashed border-[#cffafe] hover:border-[#0e7490] cursor-pointer transition-all overflow-hidden bg-[#f0f9ff] group"
              >
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                  onError={() => setCoverPreview('/placeholder-book.png')}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-center text-white">
                    <ImageIcon size={32} className="mx-auto mb-1" />
                    <p className="text-xs">Klik untuk ganti cover</p>
                  </div>
                </div>
              </div>
              <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
              <p className="text-[10px] text-[#94a3b8] mt-1.5 text-center">Klik gambar untuk upload cover (max 5MB)</p>
            </div>

            {/* Form Fields */}
            <div className="sm:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-[#164e63] mb-1 block">Judul Buku *</label>
                  <Input
                    placeholder="Masukkan judul buku..."
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                    className={errors.title ? 'border-red-400' : ''}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#164e63] mb-1 block">Penulis *</label>
                  <Input
                    placeholder="Nama penulis..."
                    value={form.author}
                    onChange={(e) => update('author', e.target.value)}
                    className={errors.author ? 'border-red-400' : ''}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#164e63] mb-1 block">Kategori *</label>
                  <Select value={form.category} onValueChange={(v) => update('category', v)}>
                    <SelectTrigger className={errors.category ? 'border-red-400' : ''}>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#164e63] mb-1 block">Format</label>
                  <Select value={form.format} onValueChange={(v) => update('format', v as BookFormat)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'XLS', 'XLSX'] as BookFormat[]).map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#164e63] mb-1 block">Tahun Terbit *</label>
                  <Input
                    type="number"
                    placeholder="2024"
                    value={form.year}
                    onChange={(e) => update('year', parseInt(e.target.value) || 0)}
                    className={errors.year ? 'border-red-400' : ''}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#164e63] mb-1 block">Jumlah Halaman</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.pages}
                    onChange={(e) => update('pages', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#164e63] mb-1 block">Bahasa</label>
                  <Input
                    placeholder="English"
                    value={form.language}
                    onChange={(e) => update('language', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#164e63] mb-1 block">Rating (0-5)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    placeholder="0"
                    value={form.rating}
                    onChange={(e) => update('rating', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#164e63] mb-1 block">ISBN</label>
                  <Input
                    placeholder="978-..."
                    value={form.isbn}
                    onChange={(e) => update('isbn', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#164e63] mb-1 block">Penerbit</label>
                  <Input
                    placeholder="Nama penerbit..."
                    value={form.publisher}
                    onChange={(e) => update('publisher', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-[#164e63] mb-1 block">Tags (pisahkan dengan koma)</label>
            <Input
              placeholder="neurology, clinical, textbook, ..."
              value={form.tagsInput}
              onChange={(e) => update('tagsInput', e.target.value)}
            />
          </div>

          {/* Synopsis */}
          <div>
            <label className="text-sm font-medium text-[#164e63] mb-1 block">Sinopsis</label>
            <Textarea
              rows={4}
              placeholder="Sinopsis buku..."
              value={form.synopsis}
              onChange={(e) => update('synopsis', e.target.value)}
            />
          </div>

          {/* TOC */}
          <div>
            <label className="text-sm font-medium text-[#164e63] mb-1 block">Daftar Isi (satu baris per item)</label>
            <Textarea
              rows={4}
              placeholder="1. Introduction&#10;2. Chapter One&#10;3. Chapter Two..."
              value={form.toc}
              onChange={(e) => update('toc', e.target.value)}
            />
          </div>

          {/* Source Type Toggle */}
          <div className="border-t border-[#cffafe] pt-4">
            <label className="text-sm font-medium text-[#164e63] mb-2 block">Sumber File</label>
            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => update('sourceType', 'upload')}
                className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-all ${
                  form.sourceType === 'upload'
                    ? 'border-[#0e7490] bg-[#f0f9ff] text-[#0e7490]'
                    : 'border-[#cffafe] text-[#64748b] hover:border-[#0e7490]'
                }`}
              >
                <Upload size={18} className="mx-auto mb-1" />
                Upload File
              </button>
              <button
                type="button"
                onClick={() => update('sourceType', 'external')}
                className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-all ${
                  form.sourceType === 'external'
                    ? 'border-[#0e7490] bg-[#f0f9ff] text-[#0e7490]'
                    : 'border-[#cffafe] text-[#64748b] hover:border-[#0e7490]'
                }`}
              >
                <Globe size={18} className="mx-auto mb-1" />
                Link Eksternal
              </button>
            </div>

            {form.sourceType === 'external' ? (
              <div>
                <label className="text-sm font-medium text-[#164e63] mb-1 block">URL Eksternal (Google Drive, dll)</label>
                <Input
                  placeholder="https://drive.google.com/..."
                  value={form.externalUrl}
                  onChange={(e) => update('externalUrl', e.target.value)}
                />
                <p className="text-[10px] text-[#94a3b8] mt-1">Link ke Google Drive, Dropbox, atau sumber lain</p>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-[#0e7490] bg-[#f0f9ff] scale-[1.01]'
                    : 'border-[#0e7490]/30 hover:border-[#0e7490] hover:bg-[#f0f9ff]/30'
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  isDragOver ? 'bg-[#0e7490] text-white' : 'bg-[#f0f9ff] text-[#0e7490]'
                }`}>
                  <Upload size={22} />
                </div>
                <p className="text-sm font-medium text-[#164e63]">Drag & drop file di sini</p>
                <p className="text-xs text-[#64748b] mt-1">PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX</p>
                <p className="text-[10px] text-[#94a3b8] mt-1">Maksimal 10MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {uploadedFile && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-[#f0f9ff] border border-[#cffafe]">
              <div className="w-10 h-10 rounded-lg bg-[#0e7490]/10 flex items-center justify-center flex-shrink-0">
                <FileText size={20} className="text-[#0e7490]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#164e63] truncate">{uploadedFile.name}</p>
                <p className="text-xs text-[#64748b]">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              <Button
                variant="ghost" size="icon-sm"
                onClick={() => setUploadedFile(null)}
                className="h-8 w-8 text-red-500 hover:bg-red-50 flex-shrink-0"
              >
                <X size={14} />
              </Button>
            </div>
          )}

          {/* Featured Toggle */}
          <div className="flex items-center gap-3">
            <Switch
              checked={form.featured}
              onCheckedChange={(v) => update('featured', v)}
            />
            <label className="text-sm text-[#164e63]">Tampilkan sebagai buku unggulan</label>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-[#cffafe] flex items-center gap-3">
            <Button type="submit" size="lg" className="bg-[#0e7490] hover:bg-[#155e75]">
              <PlusCircle size={18} className="mr-2" />
              Tambah Buku
            </Button>
            {uploadedFile && (
              <span className="text-xs text-[#14b8a6] flex items-center gap-1">
                <Check size={14} />
                File "{uploadedFile.name}" akan diupload
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


/* ═══════════════════════════════════════════
   BOOK FORM (Shared for Add/Edit - Enhanced)
   ═══════════════════════════════════════════ */
function BookForm({
  book,
  categories,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  book: Book;
  categories: Category[];
  onSubmit: (book: Book) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState<Book & { externalUrl?: string; sourceType?: 'upload' | 'external'; toc?: string; synopsis?: string }>({
    ...book,
    externalUrl: (book as Record<string, unknown>).externalUrl as string || '',
    sourceType: ((book as Record<string, unknown>).sourceType as 'upload' | 'external') || 'upload',
    toc: (book as Record<string, unknown>).toc as string || '',
    synopsis: book.description || '',
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [tagsInput, setTagsInput] = useState((book.tags || []).join(', '));

  const update = <K extends string>(field: K, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, boolean> = {};
    if (!form.title.trim()) newErrors.title = true;
    if (!form.author.trim()) newErrors.author = true;
    if (!form.category) newErrors.category = true;
    if (!form.year || form.year < 1800) newErrors.year = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Mohon lengkapi field yang wajib diisi');
      return;
    }

    const selectedCat = categories.find((c) => c.name === form.category);
    const tagList = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    onSubmit({
      ...form,
      categorySlug: selectedCat?.slug || form.categorySlug,
      tags: tagList,
      description: form.synopsis || form.description || '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-[#164e63] mb-1 block">URL Cover</label>
          <Input
            value={form.coverImage}
            onChange={(e) => update('coverImage', e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-[#164e63] mb-1 block">Judul *</label>
          <Input
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            className={errors.title ? 'border-red-400' : ''}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#164e63] mb-1 block">Penulis *</label>
          <Input
            value={form.author}
            onChange={(e) => update('author', e.target.value)}
            className={errors.author ? 'border-red-400' : ''}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#164e63] mb-1 block">Kategori *</label>
          <Select value={form.category} onValueChange={(v) => update('category', v)}>
            <SelectTrigger className={errors.category ? 'border-red-400' : ''}>
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-[#164e63] mb-1 block">Format</label>
          <Select value={form.format} onValueChange={(v) => update('format', v as BookFormat)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'XLS', 'XLSX'] as BookFormat[]).map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-[#164e63] mb-1 block">Tahun *</label>
          <Input
            type="number"
            value={form.year}
            onChange={(e) => update('year', parseInt(e.target.value) || 0)}
            className={errors.year ? 'border-red-400' : ''}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#164e63] mb-1 block">Halaman</label>
          <Input
            type="number"
            value={form.pages}
            onChange={(e) => update('pages', parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#164e63] mb-1 block">Bahasa</label>
          <Input value={form.language} onChange={(e) => update('language', e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-[#164e63] mb-1 block">Rating (0-5)</label>
          <Input
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={form.rating}
            onChange={(e) => update('rating', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#164e63] mb-1 block">ISBN</label>
          <Input value={form.isbn} onChange={(e) => update('isbn', e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-[#164e63] mb-1 block">Penerbit</label>
          <Input value={form.publisher} onChange={(e) => update('publisher', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-[#164e63] mb-1 block">Tags (pisahkan dengan koma)</label>
          <Input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="neurology, clinical, ..."
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-[#164e63] mb-1 block">Sinopsis</label>
          <Textarea
            rows={4}
            value={form.synopsis}
            onChange={(e) => update('synopsis', e.target.value)}
            placeholder="Deskripsi/sinopsis buku..."
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-[#164e63] mb-1 block">Daftar Isi</label>
          <Textarea
            rows={4}
            value={form.toc}
            onChange={(e) => update('toc', e.target.value)}
            placeholder="1. Introduction\n2. Chapter One..."
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-[#164e63] mb-1 block">URL Eksternal (Google Drive, dll)</label>
          <Input
            value={form.externalUrl}
            onChange={(e) => update('externalUrl', e.target.value)}
            placeholder="https://drive.google.com/..."
          />
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={form.featured}
            onCheckedChange={(v) => update('featured', v)}
          />
          <label className="text-sm text-[#164e63]">Tampilkan sebagai buku unggulan</label>
        </div>
      </div>
      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit" className="bg-[#0e7490] hover:bg-[#155e75]">
          <Save size={15} className="mr-1" />
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

/* ═══════════════════════════════════════════
   UPLOAD FILE TAB
   ═══════════════════════════════════════════ */
function UploadFileTab({ addActivity }: { addActivity: (type: ActivityItem['type'], message: string) => void }) {
  useLocalStorage<Book[]>('neuro_books', []);
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  function processFile(f: File) {
    const validExts = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'];
    const ext = '.' + f.name.split('.').pop()?.toLowerCase();
    if (!validExts.includes(ext)) {
      toast.error('Format tidak didukung. Gunakan PDF, Word, Excel, atau PowerPoint.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File terlalu besar. Maksimal 10MB.');
      return;
    }
    setFile(f);
  }

  const simulateUpload = async () => {
    setStatus('uploading');
    for (let i = 0; i <= 100; i += 5) {
      setProgress(i);
      await new Promise(r => setTimeout(r, 100));
    }
    setStatus('complete');
  };

  const handlePublish = async () => {
    if (!file) return;
    await simulateUpload();
    const uploads = JSON.parse(localStorage.getItem('neuro_admin_uploads') || '[]');
    uploads.push({ name: file.name, size: file.size, date: new Date().toISOString() });
    localStorage.setItem('neuro_admin_uploads', JSON.stringify(uploads));
    addActivity('book', `Upload file "${file.name}"`);
    toast.success('File berhasil diupload!');
  };

  const reset = () => { setFile(null); setStatus('idle'); setProgress(0); };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-[#164e63] text-base flex items-center gap-2">
            <FileUp size={18} className="text-[#0e7490]" />
            Upload File ke Perpustakaan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                isDragOver ? 'border-[#0e7490] bg-[#f0f9ff] scale-[1.01]' : 'border-[#0e7490]/30 hover:border-[#0e7490] hover:bg-[#f0f9ff]/30'
              }`}
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                isDragOver ? 'bg-[#0e7490] text-white' : 'bg-[#f0f9ff] text-[#0e7490]'
              }`}>
                <Upload size={28} />
              </div>
              <p className="text-sm font-medium text-[#164e63]">Drag & drop file di sini</p>
              <p className="text-xs text-[#64748b] mt-1">PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX</p>
              <p className="text-[10px] text-[#94a3b8] mt-2">Maksimal 10MB</p>
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" onChange={handleFileChange} className="hidden" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-[#f0f9ff] border border-[#cffafe]">
                <div className="w-12 h-12 rounded-lg bg-[#0e7490]/10 flex items-center justify-center">
                  <FileText size={24} className="text-[#0e7490]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#164e63]">{file.name}</p>
                  <p className="text-xs text-[#64748b]">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <Button variant="ghost" size="icon" onClick={reset} className="text-red-500 hover:bg-red-50">
                  <X size={16} />
                </Button>
              </div>
              {status !== 'idle' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748b]">{status === 'complete' ? 'Selesai!' : status === 'uploading' ? 'Mengupload...' : 'Memproses...'}</span>
                    <span className="font-medium text-[#0e7490]">{progress}%</span>
                  </div>
                  <div className="h-2.5 bg-[#cffafe] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-200 ${status === 'complete' ? 'bg-green-500' : 'bg-[#0e7490]'}`} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                {status === 'idle' && (
                  <>
                    <Button variant="outline" onClick={reset} className="flex-1">Batal</Button>
                    <Button onClick={handlePublish} className="flex-1 bg-[#0e7490] hover:bg-[#155e75]">
                      <Upload size={16} className="mr-2" /> Upload File
                    </Button>
                  </>
                )}
                {status === 'complete' && (
                  <Button onClick={reset} className="w-full bg-[#0e7490] hover:bg-[#155e75]">
                    Upload File Lain
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <RecentUploadsTable />
    </div>
  );
}

/* Recent Uploads Table */
function RecentUploadsTable() {
  const [uploads] = useState<Array<{ name: string; size: number; date: string }>>(() => {
    try { return JSON.parse(localStorage.getItem('neuro_admin_uploads') || '[]'); }
    catch { return []; }
  });

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#164e63] text-base flex items-center gap-2">
          <Clock size={18} className="text-[#0e7490]" />
          File Terbaru Diupload
        </CardTitle>
      </CardHeader>
      <CardContent>
        {uploads.length === 0 ? (
          <p className="text-sm text-[#64748b] text-center py-6">Belum ada file yang diupload</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#cffafe]">
                <tr className="text-left text-[#64748b]">
                  <th className="pb-2 font-medium">Nama File</th>
                  <th className="pb-2 font-medium">Ukuran</th>
                  <th className="pb-2 font-medium">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {uploads.slice().reverse().slice(0, 20).map((u, i) => (
                  <tr key={i} className="border-b border-[#cffafe]/50">
                    <td className="py-2.5 text-[#164e63] flex items-center gap-2">
                      <FileText size={14} className="text-[#0e7490]" /> {u.name}
                    </td>
                    <td className="py-2.5 text-[#64748b]">{(u.size / (1024 * 1024)).toFixed(2)} MB</td>
                    <td className="py-2.5 text-[#64748b]">{fmtDate(u.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════
   PRESENTATION MODE - Fullscreen Case Reader
   ═══════════════════════════════════════════ */
interface PresentationModeProps {
  isOpen: boolean;
  onClose: () => void;
  book?: Book | null;
}

function PresentationMode({ isOpen, onClose, book }: PresentationModeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const slides = useMemo(() => {
    if (!book) return [];
    return [
      { type: 'title' as const, title: book.title, subtitle: book.author, category: book.category },
      { type: 'overview' as const, title: 'Ringkasan', content: book.description },
      { type: 'details' as const, title: 'Detail Publikasi', items: [
        { label: 'Kategori', value: book.category },
        { label: 'Format', value: book.format },
        { label: 'Tahun', value: book.year.toString() },
        { label: 'Halaman', value: book.pages?.toString() || '-' },
        { label: 'Bahasa', value: book.language || '-' },
        { label: 'ISBN', value: book.isbn || '-' },
        { label: 'Penerbit', value: book.publisher || '-' },
      ]},
      { type: 'stats' as const, title: 'Statistik', items: [
        { label: 'Rating', value: `${book.rating}/5.0` },
        { label: 'Downloads', value: (book.downloads || 0).toLocaleString('id-ID') },
      ]},
      { type: 'end' as const, title: 'Terima Kasih', subtitle: 'NeuroLibrary - Perpustakaan Digital Neurologi' },
    ];
  }, [book]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); setIsFullscreen(false); }
      if (e.key === 'ArrowRight' || e.key === ' ') { setCurrentSlide(p => Math.min(p + 1, slides.length - 1)); }
      if (e.key === 'ArrowLeft') { setCurrentSlide(p => Math.max(p - 1, 0)); }
      if (e.key === 'f') { toggleFullscreen(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, slides.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => { if (isOpen) setCurrentSlide(0); }, [isOpen]);

  if (!isOpen || !book) return null;

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0f172a] flex flex-col" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0f172a]/95 border-b border-white/10 text-white">
        <div className="flex items-center gap-3">
          <Monitor size={18} className="text-[#0e7490]" />
          <span className="text-sm font-medium">{book.title}</span>
          <span className="text-xs text-white/50">({currentSlide + 1} / {slides.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggleFullscreen} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition" title="Fullscreen (F)">
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition" title="Tutup (Esc)">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full max-w-4xl"
          >
            {slide.type === 'title' && (
              <div className="text-center text-white">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0e7490]/20 text-[#0e7490] text-sm mb-6">
                  <Brain size={16} /> {slide.category}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{slide.title}</h1>
                <p className="text-lg text-white/60">{slide.subtitle}</p>
              </div>
            )}
            {slide.type === 'overview' && (
              <div className="text-white">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
                  <FileText size={24} className="text-[#0e7490]" /> {slide.title}
                </h2>
                <p className="text-lg leading-relaxed text-white/80 whitespace-pre-line">{slide.content}</p>
              </div>
            )}
            {slide.type === 'details' && (
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-6">{slide.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {slide.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-white/50 text-sm">{item.label}</span>
                      <span className="text-white font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {slide.type === 'stats' && (
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-6">{slide.title}</h2>
                <div className="grid grid-cols-2 gap-4">
                  {slide.items?.map((item, i) => (
                    <div key={i} className="p-6 rounded-xl bg-gradient-to-br from-[#0e7490]/20 to-[#14b8a6]/10 border border-[#0e7490]/30 text-center">
                      <p className="text-3xl font-bold text-[#0e7490]">{item.value}</p>
                      <p className="text-sm text-white/50 mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {slide.type === 'end' && (
              <div className="text-center text-white">
                <Brain size={48} className="mx-auto mb-4 text-[#0e7490]" />
                <h2 className="text-3xl md:text-4xl font-bold mb-2">{slide.title}</h2>
                <p className="text-white/50">{slide.subtitle}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation bar */}
      <div className="flex items-center justify-center gap-3 px-4 py-3 bg-[#0f172a]/95 border-t border-white/10">
        <button onClick={() => setCurrentSlide(p => Math.max(p - 1, 0))} disabled={currentSlide === 0} className="w-9 h-9 rounded-full border border-white/20 text-white hover:bg-white/10 disabled:opacity-30 flex items-center justify-center transition">
          <ChevronLeft size={16} />
        </button>
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-[#0e7490] w-6' : 'bg-white/30 hover:bg-white/50'}`} />
          ))}
        </div>
        <button onClick={() => setCurrentSlide(p => Math.min(p + 1, slides.length - 1))} disabled={currentSlide === slides.length - 1} className="w-9 h-9 rounded-full border border-white/20 text-white hover:bg-white/10 disabled:opacity-30 flex items-center justify-center transition">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Keyboard hint */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 text-[10px] text-white/30">
        &larr; &rarr; navigasi &middot; Spasi next &middot; F fullscreen &middot; Esc tutup
      </div>
    </div>
  );
}
