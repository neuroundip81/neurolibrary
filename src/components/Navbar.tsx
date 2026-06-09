import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bookmark,
  Moon,
  Sun,
  User,
  ChevronDown,
  LogOut,
  Settings,
  Brain,
  Upload,
  Shield,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import AuthModal from './AuthModal';
import UploadModal from './UploadModal';

interface NavbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  bookmarkCount: number;
  onSearchFocus?: () => void;
}

export default function Navbar({
  searchValue,
  onSearchChange,
  bookmarkCount,
  onSearchFocus,
}: NavbarProps) {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        onSearchFocus?.();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSearchFocus]);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAuthOpen = useCallback((tab: 'login' | 'register' = 'login') => {
    setAuthTab(tab);
    setAuthModalOpen(true);
    setUserMenuOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  }, [logout, navigate]);

  const handleUploadOpen = useCallback(() => {
    setUploadModalOpen(true);
    setUserMenuOpen(false);
  }, []);

  // Get user initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header className="sticky top-0 z-[100] backdrop-blur-md bg-white/80 border-b border-[#cffafe]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center gap-4 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0e7490] to-[#14b8a6] flex items-center justify-center">
              <Brain size={20} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold text-[#164e63] hidden sm:block">
              Neuro<span className="text-[#0e7490]">Library</span>
            </span>
          </Link>

          {/* Search box */}
          <div className="flex-1 max-w-[500px] mx-4">
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari judul buku, penulis, topik neurologi..."
                className="w-full pl-10 pr-16 py-2 rounded-full border-2 border-[#cffafe] bg-white text-sm text-[#164e63] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490] focus:shadow-[0_0_0_3px_rgba(8,145,178,0.15)] transition-all"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#f0f9ff] text-[#64748b] text-[10px] font-mono border border-[#cffafe]">
                Ctrl+K
              </kbd>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Upload button - visible when logged in */}
            {isLoggedIn && (
              <button
                onClick={handleUploadOpen}
                className="relative w-10 h-10 rounded-full border border-[#cffafe] flex items-center justify-center text-[#64748b] hover:bg-[#0e7490] hover:text-white hover:border-[#0e7490] hover:-translate-y-0.5 transition-all duration-200"
                aria-label="Upload buku"
                title="Upload buku"
              >
                <Upload size={18} />
              </button>
            )}

            {/* Bookmarks */}
            <Link
              to="/bookmarks"
              className="relative w-10 h-10 rounded-full border border-[#cffafe] flex items-center justify-center text-[#64748b] hover:bg-[#0e7490] hover:text-white hover:border-[#0e7490] hover:-translate-y-0.5 transition-all duration-200"
              aria-label="Bookmark"
            >
              <Bookmark size={18} />
              {bookmarkCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ec4899] text-white text-[10px] font-bold flex items-center justify-center">
                  {bookmarkCount}
                </span>
              )}
            </Link>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full border border-[#cffafe] flex items-center justify-center text-[#64748b] hover:bg-[#0e7490] hover:text-white hover:border-[#0e7490] hover:-translate-y-0.5 transition-all duration-200"
              aria-label={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User avatar dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border-2 border-[#cffafe] hover:border-[#0e7490] transition-all duration-200"
                aria-label="Menu pengguna"
                aria-expanded={userMenuOpen}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0e7490] to-[#14b8a6] flex items-center justify-center text-white text-xs font-semibold">
                  {isLoggedIn && user ? (
                    <span>{getInitials(user.name)}</span>
                  ) : (
                    <User size={16} />
                  )}
                </div>
                {isLoggedIn && user && (
                  <span className="hidden sm:block text-xs text-[#164e63] font-medium max-w-[80px] truncate">
                    {user.name}
                  </span>
                )}
                <ChevronDown
                  size={14}
                  className={`text-[#64748b] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-[230px] bg-white rounded-xl border border-[#cffafe] shadow-lg py-2 animate-fadeIn z-[200]">
                  {isLoggedIn && user ? (
                    <>
                      {/* Logged in user info */}
                      <div className="px-4 py-3 border-b border-[#cffafe]">
                        <p className="text-sm font-semibold text-[#164e63] truncate">{user.name}</p>
                        <p className="text-xs text-[#64748b] truncate">{user.email}</p>
                        {user.specialty && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] bg-[#f0f9ff] text-[#0e7490] font-medium">
                            {user.specialty}
                          </span>
                        )}
                      </div>

                      {/* Menu items */}
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#164e63] hover:bg-[#f0f9ff] transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={16} className="text-[#0e7490]" />
                        Profil
                      </Link>

                      <Link
                        to="/bookmarks"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#164e63] hover:bg-[#f0f9ff] transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Bookmark size={16} className="text-[#0e7490]" />
                        Bookmark
                        {bookmarkCount > 0 && (
                          <span className="ml-auto text-[10px] bg-[#ec4899] text-white px-1.5 py-0.5 rounded-full font-bold">
                            {bookmarkCount}
                          </span>
                        )}
                      </Link>

                      <button
                        onClick={handleUploadOpen}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#164e63] hover:bg-[#f0f9ff] transition-colors text-left"
                      >
                        <Upload size={16} className="text-[#0e7490]" />
                        Upload Buku
                      </button>

                      <Link
                        to="/settings"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#164e63] hover:bg-[#f0f9ff] transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings size={16} className="text-[#0e7490]" />
                        Pengaturan
                      </Link>

                      {/* Admin panel link - only for admin */}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#164e63] hover:bg-[#f0f9ff] transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield size={16} className="text-[#0e7490]" />
                          Admin Panel
                        </Link>
                      )}

                      <div className="border-t border-[#cffafe] mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#ef4444] hover:bg-red-50 transition-colors text-left"
                        >
                          <LogOut size={16} />
                          Keluar
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Guest user info */}
                      <div className="px-4 py-3 border-b border-[#cffafe]">
                        <p className="text-sm font-semibold text-[#164e63]">Pengguna Tamu</p>
                        <p className="text-xs text-[#64748b]">Masuk untuk mengakses fitur lengkap</p>
                      </div>

                      <button
                        onClick={() => handleAuthOpen('login')}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#164e63] hover:bg-[#f0f9ff] transition-colors text-left"
                      >
                        <User size={16} className="text-[#0e7490]" />
                        Masuk
                      </button>

                      <button
                        onClick={() => handleAuthOpen('register')}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#164e63] hover:bg-[#f0f9ff] transition-colors text-left"
                      >
                        <FileText size={16} className="text-[#0e7490]" />
                        Daftar
                      </button>

                      <Link
                        to="/settings"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#164e63] hover:bg-[#f0f9ff] transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings size={16} className="text-[#0e7490]" />
                        Pengaturan
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authTab}
      />

      {/* Upload Modal */}
      <UploadModal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} />
    </>
  );
}
