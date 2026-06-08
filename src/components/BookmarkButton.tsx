import { Heart } from 'lucide-react';
import { useCallback, useState } from 'react';

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onToggle: () => void;
  size?: number;
  className?: string;
}

export default function BookmarkButton({
  isBookmarked,
  onToggle,
  size = 18,
  className = '',
}: BookmarkButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsAnimating(true);
      onToggle();
      setTimeout(() => setIsAnimating(false), 300);
    },
    [onToggle],
  );

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-[#cffafe] transition-all duration-200 hover:scale-110 hover:bg-[#ec4899] hover:border-[#ec4899] hover:text-white group ${className}`}
      style={{
        width: size + 18,
        height: size + 18,
      }}
      aria-label={isBookmarked ? 'Hapus bookmark' : 'Tambah bookmark'}
      aria-pressed={isBookmarked}
    >
      <Heart
        size={size}
        className={`transition-colors duration-200 ${
          isBookmarked
            ? 'text-[#ec4899] fill-[#ec4899] group-hover:text-white group-hover:fill-white'
            : 'text-[#64748b] group-hover:text-white'
        } ${isAnimating ? 'animate-heartBeat' : ''}`}
      />
    </button>
  );
}
