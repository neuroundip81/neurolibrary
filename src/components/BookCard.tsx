import { useRef, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, FileSpreadsheet, Presentation, Download } from 'lucide-react';
import type { Book } from '@/types';
import StarRating from './StarRating';
import BookmarkButton from './BookmarkButton';

interface BookCardProps {
  book: Book;
  isBookmarked: boolean;
  onToggleBookmark: (bookId: string) => void;
  onOpenDetail?: (book: Book) => void;
  featured?: boolean;
  index?: number;
}

const formatIcons: Record<string, React.ReactNode> = {
  PDF: <FileText size={16} className="text-red-500" />,
  DOC: <FileText size={16} className="text-blue-500" />,
  PPT: <Presentation size={16} className="text-amber-500" />,
  XLS: <FileSpreadsheet size={16} className="text-green-500" />,
};

const formatLabels: Record<string, string> = {
  PDF: 'PDF',
  DOC: 'DOC',
  PPT: 'PPT',
  XLS: 'XLS',
};

export default function BookCard({
  book,
  isBookmarked,
  onToggleBookmark,
  onOpenDetail: _onOpenDetail,
  featured = false,
  index = 0,
}: BookCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [highlight, setHighlight] = useState({ x: 50, y: 50 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 10;
    const rotateX = -((y - centerY) / centerY) * 10;
    setTilt({ rotateX, rotateY });
    setHighlight({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setHighlight({ x: 50, y: 50 });
  }, []);

  return (
    <Link
      to={`/book/${book.id}`}
      ref={cardRef as React.RefObject<HTMLAnchorElement>}
      className="group relative bg-white rounded-2xl border border-[#cffafe] overflow-hidden transition-all duration-300 hover:border-[#0e7490] hover:shadow-lg cursor-pointer block"
      style={{
        perspective: '800px',
        transformStyle: 'preserve-3d',
        transform: `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        transition: 'transform 0.15s ease-out, box-shadow 0.3s ease, border-color 0.3s ease',
        animation: `slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.08}s both`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="article"
      aria-label={`Buku: ${book.title}`}
    >
      {/* Specular highlight overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${highlight.x}% ${highlight.y}%, rgba(255,255,255,0.35) 0%, transparent 60%)`,
        }}
      />

      {/* Cover area */}
      <div className="relative h-[240px] overflow-hidden bg-gradient-to-br from-[#164e63] via-[#0e7490] to-[#14b8a6]">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#164e63] via-[#0e7490] to-[#14b8a6] animate-pulse" />
        )}
        <img
          src={book.coverImage}
          alt={book.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />

        {/* Bookmark button */}
        <div
          className="absolute top-3 left-3 z-20"
          onClick={(e) => e.preventDefault()}
          role="presentation"
        >
          <BookmarkButton
            isBookmarked={isBookmarked}
            onToggle={() => onToggleBookmark(book.id)}
            size={16}
          />
        </div>

        {/* Category badge */}
        <div className="absolute top-3 right-3 z-20">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            featured
              ? 'bg-[#f59e0b] text-white'
              : 'bg-white/90 backdrop-blur-sm text-[#0e7490]'
          }`}>
            {featured ? 'Unggulan' : book.category}
          </span>
        </div>

        {/* Format icon */}
        <div className="absolute bottom-3 right-3 z-20">
          <div className="w-9 h-9 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm" title={`Format: ${formatLabels[book.format]}`}>
            {formatIcons[book.format]}
          </div>
        </div>
      </div>

      {/* Info area */}
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#0e7490] mb-1.5">
          {book.category}
        </p>
        <h3 className="font-body text-[1.125rem] font-semibold text-[#164e63] leading-tight mb-1.5 line-clamp-2 min-h-[2.5rem]">
          {book.title}
        </h3>
        <p className="text-sm text-[#64748b] mb-3 line-clamp-1">{book.author}</p>

        {/* Meta footer */}
        <div className="pt-3 border-t border-[#cffafe] flex items-center justify-between">
          <StarRating rating={book.rating} size={14} />
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-[#64748b]">
              <Download size={12} />
              {(book.downloads / 1000).toFixed(1)}K
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
