import { useState, useCallback, useRef } from 'react';
import { Download, Check, Loader2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DownloadButtonProps {
  bookId?: string;
  initialCount: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onDownloadComplete?: () => void;
  externalUrl?: string;
}

export default function DownloadButton({
  bookId: _bookId,
  initialCount,
  size = 'md',
  className = '',
  onDownloadComplete,
  externalUrl,
}: DownloadButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleId = useRef(0);

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-3 text-sm gap-2',
    lg: 'px-8 py-4 text-base gap-2.5',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  const addRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++rippleId.current;
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  }, []);

  const handleDownload = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDownloading || isComplete) return;
      addRipple(e);
      setIsDownloading(true);
      setProgress(0);

      // Simulate download progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsDownloading(false);
            setIsComplete(true);
            setCount((c) => c + 1);
            onDownloadComplete?.();
            // Reset complete state after 2 seconds
            setTimeout(() => setIsComplete(false), 2000);
            return 100;
          }
          return prev + Math.random() * 15 + 5;
        });
      }, 200);
    },
    [isDownloading, isComplete, addRipple, onDownloadComplete],
  );

  const formatCount = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  // External link mode: render as link button
  if (externalUrl) {
    return (
      <a
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`relative overflow-hidden inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 ${sizeClasses[size]} ${className} bg-[#0e7490] text-white hover:bg-[#155e75] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0`}
        aria-label="Baca Online"
      >
        <span className="relative z-10 flex items-center gap-2">
          <ExternalLink size={iconSizes[size]} />
          <span className="flex items-center gap-1.5">
            Baca Online
            <span className="opacity-80">({formatCount(initialCount)})</span>
          </span>
        </span>
      </a>
    );
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleDownload}
      disabled={isDownloading}
      className={`relative overflow-hidden inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 ${sizeClasses[size]} ${className} ${
        isComplete
          ? 'bg-[#10b981] text-white'
          : isDownloading
            ? 'bg-[#0e7490]/80 text-white cursor-wait'
            : 'bg-[#0e7490] text-white hover:bg-[#155e75] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
      }`}
      aria-label="Download book"
    >
      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Progress bar background */}
      <AnimatePresence>
        {isDownloading && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.2, ease: 'linear' }}
            className="absolute inset-0 bg-[#14b8a6] origin-left"
          />
        )}
      </AnimatePresence>

      {/* Button content */}
      <span className="relative z-10 flex items-center gap-2">
        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.span
              key="complete"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              <Check size={iconSizes[size]} />
            </motion.span>
          ) : isDownloading ? (
            <motion.span
              key="downloading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 size={iconSizes[size]} className="animate-spin" />
            </motion.span>
          ) : (
            <motion.span
              key="download"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Download size={iconSizes[size]} />
            </motion.span>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.span
              key="complete-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              Selesai
            </motion.span>
          ) : isDownloading ? (
            <motion.span
              key="downloading-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {Math.min(Math.round(progress), 100)}%
            </motion.span>
          ) : (
            <motion.span
              key="download-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5"
            >
              Download
              <span className="opacity-80">({formatCount(count)})</span>
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </button>
  );
}
