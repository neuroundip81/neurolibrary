import { useState, useCallback } from 'react';
import { Star, ThumbsUp, MessageSquare, Send, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Comment } from '@/types';
import StarRating from './StarRating';

interface ReviewSectionProps {
  bookId: string;
  initialReviews?: Comment[];
  averageRating?: number;
  ratingCount?: number;
}

const demoReviews: Comment[] = [
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
    content: 'Edisi terbaru mencakup update terkini dalam diagnosis dan tata laksana gangguan neurologi. Penjelasan sangat jelas dan ilustrasi sangat membantu.',
    rating: 4,
    createdAt: '2024-11-20T14:15:00Z',
  },
  {
    id: 'c3',
    bookId: '1',
    userName: 'Dr. Maria Lopez',
    userAvatar: '/avatar-default.jpg',
    content: 'Referensi wajib untuk setiap praktisi neurologi. Pembahasan kasus klinis sangat berguna dalam praktik sehari-hari.',
    rating: 5,
    createdAt: '2024-10-05T09:00:00Z',
  },
];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export default function ReviewSection({
  bookId,
  initialReviews = demoReviews,
  averageRating = 4.7,
  ratingCount = 342,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Comment[]>(initialReviews);
  const [sortBy, setSortBy] = useState<'newest' | 'helpful'>('newest');
  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [helpfulMap, setHelpfulMap] = useState<Record<string, boolean>>({});

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // helpful sort - just a mock implementation
    return b.rating - a.rating;
  });

  const handleSubmitReview = useCallback(() => {
    if (!newReviewText.trim() || newRating === 0) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const newComment: Comment = {
        id: `user-${Date.now()}`,
        bookId,
        userName: 'Anda',
        userAvatar: '/avatar-default.jpg',
        content: newReviewText.trim(),
        rating: newRating,
        createdAt: new Date().toISOString(),
      };

      setReviews((prev) => [newComment, ...prev]);
      setNewReviewText('');
      setNewRating(0);
      setIsSubmitting(false);
    }, 600);
  }, [newReviewText, newRating, bookId]);

  const toggleHelpful = useCallback((reviewId: string) => {
    setHelpfulMap((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  }, []);

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
    percentage: reviews.length > 0
      ? (reviews.filter((r) => Math.round(r.rating) === star).length / reviews.length) * 100
      : 0,
  }));

  return (
    <div className="space-y-8">
      {/* Average Rating Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-[#f0f9ff] rounded-2xl border border-[#cffafe]">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-5xl font-bold text-[#164e63] font-display">
              {averageRating.toFixed(1)}
            </p>
            <div className="flex justify-center mt-1">
              <StarRating rating={averageRating} size={16} />
            </div>
            <p className="text-sm text-[#64748b] mt-1">
              {ratingCount} ulasan
            </p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 w-full sm:w-auto space-y-1.5">
          {ratingDistribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-[#64748b] w-3">{star}</span>
              <Star size={12} className="text-[#f59e0b] fill-[#f59e0b]" />
              <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-[#f59e0b] rounded-full"
                />
              </div>
              <span className="text-xs text-[#64748b] w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Review Form */}
      <div className="p-6 bg-white rounded-2xl border border-[#cffafe]">
        <h4 className="text-lg font-semibold text-[#164e63] mb-4 flex items-center gap-2">
          <MessageSquare size={20} className="text-[#0e7490]" />
          Tulis Ulasan
        </h4>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#64748b]">Rating:</span>
            <StarRating
              rating={newRating}
              size={24}
              interactive
              onRate={setNewRating}
            />
          </div>

          <textarea
            value={newReviewText}
            onChange={(e) => setNewReviewText(e.target.value)}
            placeholder="Bagikan pengalaman Anda dengan buku ini..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#cffafe] bg-[#f0f9ff] text-[#164e63] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490] focus:shadow-[0_0_0_3px_rgba(8,145,178,0.15)] transition-all resize-none"
          />

          <button
            onClick={handleSubmitReview}
            disabled={!newReviewText.trim() || newRating === 0 || isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0e7490] text-white font-medium text-sm transition-all duration-200 hover:bg-[#155e75] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#0e7490]"
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <Send size={14} />
            )}
            Kirim Ulasan
          </button>
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-[#164e63]">
          {reviews.length} Ulasan
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#64748b]">Urutkan:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'helpful')}
            className="px-3 py-1.5 rounded-lg border border-[#cffafe] bg-white text-sm text-[#164e63] focus:outline-none focus:border-[#0e7490]"
          >
            <option value="newest">Terbaru</option>
            <option value="helpful">Paling Membantu</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
          {sortedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              layout
              className="p-5 bg-white rounded-2xl border border-[#cffafe] hover:border-[#0e7490]/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f0f9ff] flex items-center justify-center flex-shrink-0">
                  {review.userAvatar && review.userAvatar !== '/avatar-default.jpg' ? (
                    <img
                      src={review.userAvatar}
                      alt={review.userName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User size={20} className="text-[#0e7490]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-[#164e63] text-sm">
                      {review.userName}
                    </span>
                    <span className="text-xs text-[#94a3b8]">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>

                  <div className="mb-2">
                    <StarRating rating={review.rating} size={14} />
                  </div>

                  <p className="text-sm text-[#475569] leading-relaxed">
                    {review.content}
                  </p>

                  <button
                    onClick={() => toggleHelpful(review.id)}
                    className={`mt-3 inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
                      helpfulMap[review.id]
                        ? 'text-[#0e7490]'
                        : 'text-[#94a3b8] hover:text-[#0e7490]'
                    }`}
                  >
                    <ThumbsUp
                      size={14}
                      className={helpfulMap[review.id] ? 'fill-[#0e7490]' : ''}
                    />
                    Membantu ({helpfulMap[review.id] ? 1 : 0})
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
