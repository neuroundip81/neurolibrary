import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, XIcon } from 'lucide-react';
import type { Book } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface DraggableBookmarksBarProps {
  books: Book[];
  onRemove: (bookId: string) => void;
  onNavigate?: (book: Book) => void;
}

const containerVariants = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      staggerChildren: 0.05,
    },
  },
  exit: {
    y: 100,
    opacity: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
};

const pillVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    x: 50,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
};

export default function DraggableBookmarksBar({
  books,
  onRemove,
  onNavigate,
}: DraggableBookmarksBarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const isMobile = useIsMobile();

  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Don't render if no bookmarks, not visible, or on mobile
  if (books.length === 0 || !isVisible || isMobile) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-8 left-1/2 z-[2000] max-w-[90vw]"
          style={{ x: '-50%' }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div
            className="rounded-2xl border border-[#cffafe] bg-white/90 px-5 py-3 shadow-lg"
            style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          >
            {/* Header row */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748b]">
                Bookmark Cepat
              </span>
              <button
                onClick={handleClose}
                className="flex h-6 w-6 items-center justify-center rounded-full text-[#64748b] transition-colors hover:bg-[#f0f9ff]"
                aria-label="Tutup bookmark bar"
              >
                <XIcon size={14} />
              </button>
            </div>

            {/* Pills container */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <AnimatePresence mode="popLayout">
                {books.map((book) => (
                  <DraggableBookmarkPill
                    key={book.id}
                    book={book}
                    onRemove={onRemove}
                    onNavigate={onNavigate}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface DraggableBookmarkPillProps {
  book: Book;
  onRemove: (bookId: string) => void;
  onNavigate?: (book: Book) => void;
}

function DraggableBookmarkPill({ book, onRemove, onNavigate }: DraggableBookmarkPillProps) {
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
      if (Math.abs(info.offset.x) > 50) {
        onRemove(book.id);
      }
    },
    [book.id, onRemove],
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove(book.id);
    },
    [book.id, onRemove],
  );

  return (
    <motion.div
      layout
      variants={pillVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95, cursor: 'grabbing' }}
      onDragEnd={handleDragEnd}
      onClick={() => onNavigate?.(book)}
      className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-[#cffafe] bg-[#f0f9ff] px-3 py-1.5 select-none"
      role="button"
      tabIndex={0}
      aria-label={`Bookmark: ${book.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onNavigate?.(book);
        }
      }}
    >
      <img
        src={book.coverImage}
        alt={book.title}
        className="h-10 w-8 rounded object-cover"
        loading="lazy"
      />
      <span className="max-w-[120px] truncate text-sm font-medium text-[#164e63]">
        {book.title.length > 20 ? book.title.slice(0, 20) + '...' : book.title}
      </span>
      <button
        onClick={handleRemove}
        className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-[#64748b] transition-colors hover:text-[#ef4444]"
        aria-label={`Hapus ${book.title} dari bookmark`}
      >
        <X size={12} />
      </button>
    </motion.div>
  );
}
