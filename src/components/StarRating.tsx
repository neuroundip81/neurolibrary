import { Star } from 'lucide-react';
import { useState, useCallback } from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 16,
  interactive = false,
  onRate,
  className = '',
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = useCallback(
    (index: number) => {
      if (!interactive || !onRate) return;
      onRate(index);
    },
    [interactive, onRate],
  );

  const handleMouseEnter = useCallback(
    (index: number) => {
      if (!interactive) return;
      setHoverRating(index);
    },
    [interactive],
  );

  const handleMouseLeave = useCallback(() => {
    if (!interactive) return;
    setHoverRating(0);
  }, [interactive]);

  const displayRating = hoverRating || rating;

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: maxRating }, (_, i) => {
        const index = i + 1;
        const filled = index <= Math.floor(displayRating);
        const partial = !filled && index <= displayRating;
        const percentage = partial ? (displayRating % 1) * 100 : 0;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            className={`relative ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            aria-label={`${index} star${index > 1 ? 's' : ''}`}
          >
            <Star
              size={size}
              className="text-[#e2e8f0]"
              fill="#e2e8f0"
              strokeWidth={1.5}
            />
            {(filled || partial) && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? '100%' : `${percentage}%` }}
              >
                <Star
                  size={size}
                  className="text-[#f59e0b]"
                  fill="#f59e0b"
                  strokeWidth={1.5}
                />
              </div>
            )}
          </button>
        );
      })}
      <span className="ml-1 text-xs font-medium text-[#64748b]">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}
