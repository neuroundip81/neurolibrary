import { useRef, useEffect, useCallback, useState } from 'react';
import { X, Download, Calendar, FileText, Globe, Hash, Share2, MessageSquare, Send } from 'lucide-react';
import type { Book, Comment } from '@/types';
import StarRating from './StarRating';
import BookmarkButton from './BookmarkButton';

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (bookId: string) => void;
}

const demoComments: Comment[] = [
  {
    id: 'c1',
    bookId: '1',
    userName: 'Dr. Sarah Chen',
    userAvatar: '/avatar-default.jpg',
    content: 'Buku yang sangat komprehensif untuk referensi neurologi klinis. Sangat direkomendasikan untuk residen neurologi.',
    rating: 5,
    createdAt: '2024-12-15T10:30:00Z',
  },
  {
    id: 'c2',
    bookId: '1',
    userName: 'Dr. Ahmad Wijaya',
    userAvatar: '/avatar-default.jpg',
    content: 'Edisi terbaru mencakup update terkini dalam diagnosis dan tata laksana gangguan neurologi.',
    rating: 4,
    createdAt: '2024-11-20T14:15:00Z',
  },
];

export default function BookDetailModal({
  book,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
}: BookDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(demoComments);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab') return;
      const modal = modalRef.current;
      if (!modal) return;
      const focusable = modal.querySelectorAll<HTMLElement>(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  const handleSubmitComment = () => {
    if (!newComment.trim() || !book) return;
    const comment: Comment = {
      id: `c-${Date.now()}`,
      bookId: book.id,
      userName: 'Anda',
      userAvatar: '/avatar-default.jpg',
      content: newComment.trim(),
      rating: 5,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [comment, ...prev]);
    setNewComment('');
  };

  if (!isOpen || !book) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-detail-title"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        ref={modalRef}
        onKeyDown={handleKeyDown}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col animate-modalIn"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#cffafe] flex-shrink-0">
          <h2 id="book-detail-title" className="text-lg font-semibold text-[#164e63] font-display">
            Detail Buku
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#64748b] hover:bg-[#f0f9ff] transition-colors"
            aria-label="Tutup modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-6 p-6">
            {/* Cover image */}
            <div className="w-full md:w-[240px] flex-shrink-0">
              <div className="rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-[#164e63] via-[#0e7490] to-[#14b8a6]">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0e7490] text-white text-sm font-medium transition-all hover:bg-[#155e75]">
                  <Download size={16} />
                  Download
                </button>
                <BookmarkButton
                  isBookmarked={isBookmarked}
                  onToggle={() => onToggleBookmark(book.id)}
                  size={18}
                  className="!w-11 !h-11"
                />
                <button className="w-11 h-11 flex items-center justify-center rounded-full border border-[#cffafe] text-[#64748b] hover:bg-[#f0f9ff] hover:text-[#0e7490] transition-all">
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#f0f9ff] text-[#0e7490] mb-3">
                {book.category}
              </span>
              <h3 className="text-2xl font-bold text-[#164e63] font-display mb-2 leading-tight">
                {book.title}
              </h3>
              <p className="text-[#64748b] mb-4">{book.author}</p>

              <div className="flex items-center gap-4 mb-4">
                <StarRating rating={book.rating} interactive size={20} onRate={(r) => console.log(r)} />
                <span className="text-sm text-[#64748b]">({book.ratingCount} ulasan)</span>
              </div>

              <p className="text-[#334155] leading-relaxed mb-6">{book.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-[#64748b]">
                  <Calendar size={16} className="text-[#0e7490]" />
                  <span>Tahun: {book.year}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#64748b]">
                  <FileText size={16} className="text-[#0e7490]" />
                  <span>{book.pages} halaman</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#64748b]">
                  <Globe size={16} className="text-[#0e7490]" />
                  <span>{book.language}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#64748b]">
                  <Hash size={16} className="text-[#0e7490]" />
                  <span className="truncate">{book.isbn}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {book.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs bg-[#f0f9ff] text-[#0e7490] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="text-sm text-[#64748b]">
                Penerbit: <span className="text-[#164e63] font-medium">{book.publisher}</span>
              </div>
            </div>
          </div>

          {/* Comments section */}
          <div className="border-t border-[#cffafe] p-6">
            <h4 className="flex items-center gap-2 text-lg font-semibold text-[#164e63] font-display mb-4">
              <MessageSquare size={20} className="text-[#0e7490]" />
              Komentar ({comments.length})
            </h4>

            {/* Add comment */}
            <div className="flex gap-3 mb-6">
              <img
                src="/avatar-default.jpg"
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Tulis komentar Anda..."
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-[#cffafe] bg-white text-[#164e63] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15 transition-all resize-none h-24 text-sm"
                  />
                  <button
                    onClick={handleSubmitComment}
                    className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg bg-[#0e7490] text-white hover:bg-[#155e75] transition-colors"
                    aria-label="Kirim komentar"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Comments list */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <img
                    src={comment.userAvatar}
                    alt={comment.userName}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-[#164e63]">{comment.userName}</span>
                      <span className="text-xs text-[#94a3b8]">{formatDate(comment.createdAt)}</span>
                    </div>
                    <StarRating rating={comment.rating} size={12} />
                    <p className="text-sm text-[#334155] mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
