import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark,
  BookmarkX,
  BookOpen,
  ChevronDown,
  ArrowUpDown,
  ArrowDownAZ,
  Star,
} from 'lucide-react';
import type { Book } from '@/types';
import { useBookmarks } from '@/hooks/useBookmarks';
import { books } from '@/data/books';
import BookCard from '@/components/BookCard';
import ScrollReveal from '@/components/ScrollReveal';
import DraggableBookmarksBar from '@/components/DraggableBookmarksBar';

type SortOption = 'newest' | 'az' | 'rating';

interface UndoToast {
  id: string;
  bookId: string;
  bookTitle: string;
}

const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: 'newest', label: 'Terbaru Disimpan', icon: <ArrowUpDown size={14} /> },
  { value: 'az', label: 'A-Z', icon: <ArrowDownAZ size={14} /> },
  { value: 'rating', label: 'Rating Tertinggi', icon: <Star size={14} /> },
];

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];
const easeBounce = [0.34, 1.56, 0.64, 1] as [number, number, number, number];
const easeSmooth = [0.4, 0, 0.2, 1] as [number, number, number, number];

/* ------------------------------------------------------------------ */
/*  Bookmarks Page                                                    */
/* ------------------------------------------------------------------ */
export default function Bookmarks() {
  const {
    bookmarks,
    bookmarkCount,
    addBookmark,
    removeBookmark,
  } = useBookmarks();

  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [undoToast, setUndoToast] = useState<UndoToast | null>(null);
  const [detailBook, setDetailBook] = useState<Book | null>(null);
  const [toastTimer, setToastTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  /* ---- derived: bookmarked book objects ---- */
  const bookmarkedBooks = useMemo(() => {
    const list = books.filter((b) => bookmarks.includes(b.id));
    if (sortBy === 'az') {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortBy === 'rating') {
      return list.sort((a, b) => b.rating - a.rating);
    }
    // newest: preserve bookmarks array order (most recently added last)
    const orderMap = new Map(bookmarks.map((id, idx) => [id, idx]));
    return list.sort((a, b) => (orderMap.get(b.id) ?? 0) - (orderMap.get(a.id) ?? 0));
  }, [bookmarks, sortBy]);

  /* ---- handle remove with undo toast ---- */
  const handleRemoveBookmark = useCallback(
    (bookId: string) => {
      const book = books.find((b) => b.id === bookId);
      if (!book) return;

      // Clear any existing timer
      if (toastTimer) clearTimeout(toastTimer);

      // Remove immediately
      removeBookmark(bookId);

      // Show undo toast
      const toastId = `undo-${Date.now()}`;
      setUndoToast({ id: toastId, bookId, bookTitle: book.title });

      // Auto-dismiss after 4s
      const timer = setTimeout(() => {
        setUndoToast((prev) => (prev?.id === toastId ? null : prev));
      }, 4000);
      setToastTimer(timer);
    },
    [removeBookmark, toastTimer],
  );

  /* ---- undo action ---- */
  const handleUndo = useCallback(() => {
    if (undoToast) {
      addBookmark(undoToast.bookId);
      setUndoToast(null);
      if (toastTimer) clearTimeout(toastTimer);
    }
  }, [undoToast, addBookmark, toastTimer]);

  /* ---- dismiss toast ---- */
  const dismissToast = useCallback(() => {
    setUndoToast(null);
    if (toastTimer) clearTimeout(toastTimer);
  }, [toastTimer]);

  /* ---- open book detail ---- */
  const handleOpenDetail = useCallback((book: Book) => {
    setDetailBook(book);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailBook(null);
  }, []);

  /* ---- toggle bookmark on card ---- */
  const handleToggleBookmark = useCallback(
    (bookId: string) => {
      const currentlyBookmarked = bookmarks.includes(bookId);
      if (currentlyBookmarked) {
        handleRemoveBookmark(bookId);
      } else {
        addBookmark(bookId);
      }
    },
    [bookmarks, handleRemoveBookmark, addBookmark],
  );

  /* ---- current sort label ---- */
  const currentSortLabel = sortOptions.find((o) => o.value === sortBy)?.label ?? 'Terbaru';

  return (
    <div className="min-h-[100dvh] bg-[#f0f9ff]">
      {/* ========== SECTION 1: Page Header ========== */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-8 pb-6">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-4"
        >
          <nav className="flex items-center gap-2 text-sm text-[#64748b]">
            <Link to="/" className="hover:text-[#0e7490] transition-colors">
              Beranda
            </Link>
            <span>/</span>
            <span className="text-[#164e63] font-medium">Bookmark</span>
          </nav>
        </motion.div>

        {/* H1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOutExpo }}
          className="flex items-center gap-3 mb-2"
        >
          <Bookmark size={32} className="text-[#0e7490]" />
          <h1 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-semibold text-[#164e63] leading-tight">
            Bookmark Saya
          </h1>
        </motion.div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.1 }}
          className="text-base text-[#64748b] mb-4"
        >
          Koleksi buku yang Anda simpan untuk dibaca nanti.
        </motion.p>

        {/* Stats badge */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: easeBounce, delay: 0.2 }}
          className="inline-flex"
        >
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-[#f0f9ff] border border-[#cffafe] text-[#0e7490]">
            {bookmarkCount} buku tersimpan
          </span>
        </motion.div>
      </section>

      {/* ========== SECTION 2: Bookmarked Books Grid ========== */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-16">
        {bookmarkedBooks.length > 0 && (
          /* Sort controls */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeSmooth, delay: 0.3 }}
            className="flex justify-end mb-6"
          >
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#cffafe] bg-white text-sm font-medium text-[#164e63] hover:bg-[#f0f9ff] transition-colors"
              >
                {sortOptions.find((o) => o.value === sortBy)?.icon}
                {currentSortLabel}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${showSortMenu ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {showSortMenu && (
                  <>
                    {/* Backdrop to close menu */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowSortMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: easeSmooth }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-[#cffafe] shadow-lg py-1.5 z-50"
                    >
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setShowSortMenu(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors text-left ${
                            sortBy === option.value
                              ? 'text-[#0e7490] bg-[#f0f9ff] font-medium'
                              : 'text-[#64748b] hover:bg-[#f0f9ff] hover:text-[#164e63]'
                          }`}
                        >
                          {option.icon}
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Book grid or empty state */}
        <AnimatePresence mode="wait">
          {bookmarkedBooks.length === 0 ? (
            /* ---- Empty State ---- */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: easeOutExpo }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <BookmarkX size={64} className="text-[#64748b] opacity-50 mb-4" />
              <h2 className="font-display text-xl font-semibold text-[#164e63] mb-2">
                Belum Ada Bookmark
              </h2>
              <p className="text-[#64748b] max-w-md mb-6">
                Jelajahi katalog dan simpan buku menarik dengan menekan ikon bookmark.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#0e7490] text-white text-sm font-medium hover:bg-[#155e75] hover:scale-105 transition-all duration-200"
              >
                <BookOpen size={16} />
                Jelajahi Katalog
              </Link>
            </motion.div>
          ) : (
            /* ---- Book Grid ---- */
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {bookmarkedBooks.map((book, i) => (
                    <motion.div
                      key={book.id}
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{
                        duration: 0.4,
                        ease: easeSmooth,
                        delay: i * 0.08,
                        layout: { duration: 0.3, ease: easeSmooth },
                      }}
                    >
                      <BookCard
                        book={book}
                        isBookmarked={true}
                        onToggleBookmark={handleToggleBookmark}
                        onOpenDetail={handleOpenDetail}
                        index={i}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ========== SECTION 3: Reading List CTA ========== */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-24">
        <ScrollReveal delay={0} duration={500}>
          <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-[#cffafe] bg-[#f0f9ff] p-8">
            <div className="flex-shrink-0">
              <BookOpen size={48} className="text-[#0e7490]" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-body text-[1.25rem] font-semibold text-[#164e63] mb-1">
                Buat Daftar Bacaan
              </h3>
              <p className="text-sm text-[#64748b]">
                Organisasi bookmark Anda ke dalam daftar bacaan bertema untuk studi yang lebih terstruktur.
              </p>
            </div>
            <button
              disabled
              className="flex-shrink-0 px-5 py-2.5 rounded-lg bg-[#e2e8f0] text-[#94a3b8] text-sm font-medium cursor-not-allowed"
            >
              Segera Hadir
            </button>
          </div>
        </ScrollReveal>
      </section>

      {/* ========== Undo Toast ========== */}
      <AnimatePresence>
        {undoToast && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
            className="fixed bottom-4 right-4 z-[3000] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-white border-l-4 border-l-[#0e7490] min-w-[300px] max-w-[420px]"
            role="alert"
          >
            <div className="flex-1">
              <p className="text-sm text-[#164e63] font-medium">
                Buku dihapus dari bookmark
              </p>
              <p className="text-xs text-[#64748b] truncate">{undoToast.bookTitle}</p>
            </div>
            <button
              onClick={handleUndo}
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-[#0e7490] bg-[#f0f9ff] hover:bg-[#cffafe] transition-colors"
            >
              Batalkan
            </button>
            <button
              onClick={dismissToast}
              className="p-1 rounded-full hover:bg-[#f0f9ff] transition-colors"
              aria-label="Tutup"
            >
              <BookmarkX size={14} className="text-[#64748b]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== Draggable Bookmarks Bar ========== */}
      <DraggableBookmarksBar
        books={bookmarkedBooks}
        onRemove={handleRemoveBookmark}
        onNavigate={handleOpenDetail}
      />

      {/* ========== Book Detail Modal ========== */}
      <BookDetailModalWrapper
        book={detailBook}
        isOpen={!!detailBook}
        onClose={handleCloseDetail}
        isBookmarked={detailBook ? bookmarks.includes(detailBook.id) : false}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Lazy Book Detail Modal Wrapper                                    */
/* ------------------------------------------------------------------ */
function BookDetailModalWrapper({
  book,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
}: {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (bookId: string) => void;
}) {
  const [Component, setComponent] = useState<React.ComponentType<{
    book: Book | null;
    isOpen: boolean;
    onClose: () => void;
    isBookmarked: boolean;
    onToggleBookmark: (bookId: string) => void;
  }> | null>(null);

  useEffect(() => {
    if (isOpen && !Component) {
      import('@/components/BookDetailModal').then((mod) => {
        setComponent(() => mod.default);
      });
    }
  }, [isOpen, Component]);

  if (!isOpen || !book) return null;

  if (!Component) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-32 h-44 bg-[#f0f9ff] rounded-lg" />
            <div className="w-48 h-4 bg-[#f0f9ff] rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Component
      book={book}
      isOpen={isOpen}
      onClose={onClose}
      isBookmarked={isBookmarked}
      onToggleBookmark={onToggleBookmark}
    />
  );
}
