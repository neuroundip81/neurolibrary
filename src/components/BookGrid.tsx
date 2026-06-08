import { useState, useMemo } from 'react';
import { Brain } from 'lucide-react';
import type { Book } from '@/types';
import BookCard from './BookCard';
import SkeletonCard from './SkeletonCard';
import ScrollReveal from './ScrollReveal';

interface BookGridProps {
  books: Book[];
  bookmarkedIds: string[];
  onToggleBookmark: (bookId: string) => void;
  onOpenDetail: (book: Book) => void;
  loading?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export default function BookGrid({
  books,
  bookmarkedIds,
  onToggleBookmark,
  onOpenDetail,
  loading = false,
  emptyTitle = 'Tidak ada hasil',
  emptySubtitle = 'Coba kata kunci lain atau pilih kategori berbeda',
}: BookGridProps) {
  const [visibleCount, setVisibleCount] = useState(12);

  const visibleBooks = useMemo(() => books.slice(0, visibleCount), [books, visibleCount]);
  const hasMore = visibleCount < books.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <ScrollReveal className="flex flex-col items-center justify-center py-20 text-center">
        <Brain size={64} className="text-[#64748b] opacity-50 mb-4" />
        <h3 className="text-xl font-semibold text-[#164e63] mb-2">{emptyTitle}</h3>
        <p className="text-[#64748b] max-w-md">{emptySubtitle}</p>
      </ScrollReveal>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visibleBooks.map((book, i) => (
          <BookCard
            key={book.id}
            book={book}
            isBookmarked={bookmarkedIds.includes(book.id)}
            onToggleBookmark={onToggleBookmark}
            onOpenDetail={onOpenDetail}
            index={i}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={handleLoadMore}
            className="px-8 py-3 rounded-lg border border-[#cffafe] bg-white text-[#164e63] font-medium text-sm transition-all duration-200 hover:bg-[#f0f9ff] hover:border-[#0e7490] hover:-translate-y-0.5"
          >
            Muat Lebih Banyak
          </button>
        </div>
      )}
    </div>
  );
}
