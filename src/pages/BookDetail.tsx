import { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight, Share2, Bookmark, FileText, Calendar,
  Globe, Hash, BookOpen, ChevronLeft, ChevronRight as ChevronRightIcon,
  Star, Download, Library,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { books } from '@/data/books';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useToast } from '@/hooks/useToast';
import SEO from '@/components/SEO';
import StarRating from '@/components/StarRating';
import DownloadButton from '@/components/DownloadButton';
import ReviewSection from '@/components/ReviewSection';
import ScrollReveal from '@/components/ScrollReveal';
import type { Book } from '@/types';

/* ------------------------------------------------------------------ */
/*  Mock table of contents generator                                   */
/* ------------------------------------------------------------------ */
const generateTOC = (book: Book): string[] => {
  const titleMap: Record<string, string[]> = {
    'neurologi-klinis': [
      'Bagian I: Dasar-dasar Neurologi',
      'Bagian II: Pendekatan Pasien Neurologi',
      'Bagian III: Gangguan Sistem Sensorik',
      'Bagian IV: Gangguan Sistem Motorik',
      'Bagian V: Gangguan Koordinasi dan Gerakan',
      'Bagian VI: Epilepsi dan Gangguan Kesadaran',
      'Bagian VII: Gangguan Kognitif dan Demensia',
      'Bagian VIII: Gangguan Neuromuskular',
      'Bagian IX: Neuro-onkologi',
      'Bagian X: Neurologi Darurat',
    ],
    'neurofisiologi': [
      'Bagian I: Neuron dan Sinyal Elektrik',
      'Bagian II: Sinapsis dan Neurotransmiter',
      'Bagian III: Sistem Sensorik',
      'Bagian IV: Sistem Motorik',
      'Bagian V: Plasticitas Saraf dan Pembelajaran',
      'Bagian VI: Memori dan Kognisi',
      'Bagian VII: Perilaku dan Emosi',
      'Bagian VIII: Perkembangan Sistem Saraf',
    ],
    'neuroanatomi': [
      'Bab 1: Pengantar Neuroanatomi',
      'Bab 2: Medula Spinalis',
      'Bab 3: Batang Otak',
      'Bab 4: Serebelum',
      'Bab 5: Talamus dan Hipotalamus',
      'Bab 6: Sistem Limbik',
      'Bab 7: Korteks Serebral',
      'Bab 8: Saraf Kranial',
      'Bab 9: Sirkulasi Serebrovaskular',
      'Bab 10: Sistem Ventrikular dan Likor',
    ],
  };

  return titleMap[book.categorySlug] || [
    'Bab 1: Pengantar',
    'Bab 2: Landasan Teori',
    'Bab 3: Metodologi',
    'Bab 4: Hasil dan Pembahasan',
    'Bab 5: Aplikasi Klinis',
    'Bab 6: Kasus Studi',
    'Bab 7: Tinjauan Pustaka',
    'Bab 8: Lampiran',
  ];
};

/* ------------------------------------------------------------------ */
/*  Format helpers                                                     */
/* ------------------------------------------------------------------ */
const formatIcons: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  PDF: { icon: <FileText size={18} />, color: 'bg-red-50 text-red-600 border-red-200', label: 'PDF' },
  DOC: { icon: <FileText size={18} />, color: 'bg-blue-50 text-blue-600 border-blue-200', label: 'DOC' },
  DOCX: { icon: <FileText size={18} />, color: 'bg-blue-50 text-blue-600 border-blue-200', label: 'DOCX' },
  PPT: { icon: <FileText size={18} />, color: 'bg-amber-50 text-amber-600 border-amber-200', label: 'PPT' },
  PPTX: { icon: <FileText size={18} />, color: 'bg-amber-50 text-amber-600 border-amber-200', label: 'PPTX' },
  XLS: { icon: <FileText size={18} />, color: 'bg-green-50 text-green-600 border-green-200', label: 'XLS' },
  XLSX: { icon: <FileText size={18} />, color: 'bg-green-50 text-green-600 border-green-200', label: 'XLSX' },
};

type TabKey = 'sinopsis' | 'daftar-isi' | 'reviews' | 'info';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'sinopsis', label: 'Sinopsis' },
  { key: 'daftar-isi', label: 'Daftar Isi' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'info', label: 'Info Detail' },
];

/* ------------------------------------------------------------------ */
/*  Related Book Card (mini)                                           */
/* ------------------------------------------------------------------ */
function RelatedBookCard({ book }: { book: Book }) {
  return (
    <Link
      to={`/book/${book.id}`}
      className="group flex-shrink-0 w-[200px] bg-white rounded-xl border border-[#cffafe] overflow-hidden hover:border-[#0e7490] hover:shadow-md transition-all duration-300"
    >
      <div className="relative h-[260px] overflow-hidden bg-gradient-to-br from-[#164e63] via-[#0e7490] to-[#14b8a6]">
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#0e7490] mb-1">
          {book.category}
        </p>
        <h4 className="font-body text-sm font-semibold text-[#164e63] leading-tight line-clamp-2 mb-1">
          {book.title}
        </h4>
        <div className="flex items-center gap-1">
          <Star size={10} className="text-[#f59e0b] fill-[#f59e0b]" />
          <span className="text-xs text-[#64748b]">{book.rating}</span>
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const { bookmarks, toggleBookmark } = useBookmarks();
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>('sinopsis');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const book = useMemo(() => books.find((b) => b.id === id), [id]);

  const relatedBooks = useMemo(() => {
    if (!book) return [];
    return books
      .filter((b) => b.categorySlug === book.categorySlug && b.id !== book.id)
      .slice(0, 6);
  }, [book]);

  const isBookmarked = book ? bookmarks.includes(book.id) : false;

  const handleToggleBookmark = useCallback(() => {
    if (!book) return;
    const wasAdded = !bookmarks.includes(book.id);
    toggleBookmark(book.id);
    success(wasAdded ? 'Ditambahkan ke bookmark' : 'Dihapus dari bookmark');
  }, [book, bookmarks, toggleBookmark, success]);

  const handleShare = useCallback(async () => {
    if (!book) return;
    const shareData = {
      title: book.title,
      text: `Baca ${book.title} oleh ${book.author} di NeuroLibrary`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        success('Link disalin ke clipboard');
      }
    } catch {
      // User cancelled share
    }
  }, [book, success]);

  /* Loading state */
  if (!book) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-[#cffafe] border-t-[#0e7490] rounded-full mb-4"
        />
        <p className="text-[#64748b]">Memuat buku...</p>
      </div>
    );
  }

  const toc = generateTOC(book);
  const formatInfo = formatIcons[book.format] || formatIcons.PDF;

  /* JSON-LD Book schema */
  const bookJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: { '@type': 'Person', name: book.author },
    description: book.description,
    image: book.coverImage,
    isbn: book.isbn,
    numberOfPages: book.pages,
    inLanguage: book.language,
    publisher: { '@type': 'Organization', name: book.publisher },
    datePublished: book.year,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: book.rating,
      reviewCount: book.ratingCount,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock',
    },
  };

  const carouselVisible = 4;
  const canScrollLeft = carouselIndex > 0;
  const canScrollRight = carouselIndex + carouselVisible < relatedBooks.length;

  return (
    <div>
      <SEO
        title={book.title}
        description={book.description}
        image={book.coverImage}
        url={typeof window !== 'undefined' ? window.location.href : `https://neurolibrary.id/book/${book.id}`}
        type="book"
        jsonLd={bookJsonLd}
      />

      {/* ========== Hero Section ========== */}
      <section className="relative bg-gradient-to-br from-[#164e63] via-[#0e7490] to-[#14b8a6] pt-8 pb-16 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#ec4899] blur-3xl" />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm">
              <li>
                <Link to="/" className="text-white/80 hover:text-white transition-colors flex items-center gap-1">
                  <Library size={14} />
                  Home
                </Link>
              </li>
              <li className="text-white/50">
                <ChevronRight size={14} />
              </li>
              <li>
                <Link
                  to={`/?category=${book.categorySlug}`}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {book.category}
                </Link>
              </li>
              <li className="text-white/50">
                <ChevronRight size={14} />
              </li>
              <li>
                <span className="text-white font-medium line-clamp-1 max-w-[300px] sm:max-w-[500px]">
                  {book.title}
                </span>
              </li>
            </ol>
          </nav>

          {/* Hero Content */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Book Cover */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-shrink-0 mx-auto lg:mx-0"
            >
              <div className="relative w-[260px] sm:w-[300px]">
                <div className="absolute inset-0 bg-black/20 rounded-2xl transform translate-y-3 translate-x-3 blur-sm" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[3/4] bg-gradient-to-br from-[#164e63] via-[#0e7490] to-[#14b8a6]">
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#164e63] via-[#0e7490] to-[#14b8a6] animate-pulse" />
                  )}
                  <img
                    src={book.coverImage}
                    alt={`Cover buku ${book.title}`}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                  />
                </div>

                {/* Format badge */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                  <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border shadow-sm ${formatInfo.color}`}>
                    {formatInfo.icon}
                    {formatInfo.label}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Book Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex-1 text-white min-w-0"
            >
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-3">
                {book.title}
              </h1>

              <p className="text-lg text-white/90 mb-4">
                oleh{' '}
                <span className="font-medium underline underline-offset-4 decoration-white/30 hover:decoration-white transition-colors cursor-pointer">
                  {book.author}
                </span>
              </p>

              {/* Rating */}
              <div className="flex flex-wrap items-center gap-4 mb-5">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <StarRating rating={book.rating} size={18} />
                  <span className="text-sm font-medium">
                    {book.rating.toFixed(1)} ({book.ratingCount} ulasan)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Download size={16} />
                  <span className="text-sm font-medium">
                    {(book.downloads / 1000).toFixed(1)}K downloads
                  </span>
                </div>
              </div>

              {/* Meta tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-sm">
                  <BookOpen size={14} />
                  {book.pages} halaman
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-sm">
                  <Calendar size={14} />
                  {book.year}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-sm">
                  <Globe size={14} />
                  {book.language}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <DownloadButton
                  bookId={book.id}
                  initialCount={book.downloads}
                  size="lg"
                  onDownloadComplete={() => success('Download berhasil dimulai')}
                />

                <button
                  onClick={handleToggleBookmark}
                  className={`inline-flex items-center gap-2 px-6 py-4 rounded-xl font-semibold text-base transition-all duration-200 border ${
                    isBookmarked
                      ? 'bg-[#ec4899] border-[#ec4899] text-white'
                      : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                  }`}
                >
                  <Bookmark size={18} className={isBookmarked ? 'fill-white' : ''} />
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-xl font-semibold text-base bg-white/10 border border-white/30 text-white hover:bg-white/20 transition-all duration-200"
                >
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== Content Tabs ========== */}
      <section className="bg-[#f0f9ff] py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          {/* Tab buttons */}
          <div className="flex overflow-x-auto gap-1 mb-8 p-1 bg-white rounded-xl border border-[#cffafe] shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-[#0e7490] text-white shadow-md'
                    : 'text-[#64748b] hover:text-[#0e7490] hover:bg-[#f0f9ff]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl border border-[#cffafe] p-6 sm:p-8"
            >
              {/* Sinopsis */}
              {activeTab === 'sinopsis' && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-[#164e63] mb-4">
                    Sinopsis
                  </h2>
                  <p className="text-[#475569] leading-relaxed text-base whitespace-pre-line">
                    {book.description}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {book.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-[#f0f9ff] text-[#0e7490] text-xs font-medium border border-[#cffafe]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Daftar Isi */}
              {activeTab === 'daftar-isi' && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-[#164e63] mb-4">
                    Daftar Isi
                  </h2>
                  <ul className="space-y-2">
                    {toc.map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#f0f9ff] hover:bg-[#cffafe]/50 transition-colors group cursor-pointer"
                      >
                        <span className="w-8 h-8 rounded-lg bg-[#0e7490] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-[#164e63] font-medium group-hover:text-[#0e7490] transition-colors">
                          {item}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reviews */}
              {activeTab === 'reviews' && (
                <ReviewSection
                  bookId={book.id}
                  averageRating={book.rating}
                  ratingCount={book.ratingCount}
                />
              )}

              {/* Info Detail */}
              {activeTab === 'info' && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-[#164e63] mb-6">
                    Informasi Detail
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Penerbit', value: book.publisher, icon: <BookOpen size={18} /> },
                      { label: 'Tahun Terbit', value: String(book.year), icon: <Calendar size={18} /> },
                      { label: 'Jumlah Halaman', value: `${book.pages} halaman`, icon: <FileText size={18} /> },
                      { label: 'ISBN', value: book.isbn, icon: <Hash size={18} /> },
                      { label: 'Bahasa', value: book.language, icon: <Globe size={18} /> },
                      { label: 'Format', value: book.format, icon: <FileText size={18} /> },
                      { label: 'Kategori', value: book.category, icon: <Library size={18} /> },
                      {
                        label: 'Rating',
                        value: `${book.rating.toFixed(1)}/5.0 (${book.ratingCount} ulasan)`,
                        icon: <Star size={18} />,
                      },
                      {
                        label: 'Downloads',
                        value: `${(book.downloads / 1000).toFixed(1)}K kali`,
                        icon: <Download size={18} />,
                      },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-[#f0f9ff] border border-[#cffafe]"
                      >
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#0e7490]">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-xs text-[#64748b] uppercase tracking-wider font-medium">
                            {item.label}
                          </p>
                          <p className="text-sm font-semibold text-[#164e63]">
                            {item.value}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ========== Related Books ========== */}
      {relatedBooks.length > 0 && (
        <section className="bg-white py-12 border-t border-[#cffafe]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <ScrollReveal>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display text-2xl font-bold text-[#164e63] mb-1">
                    Buku Terkait
                  </h2>
                  <p className="text-sm text-[#64748b]">
                    Buku lain dalam kategori {book.category}
                  </p>
                </div>
                <Link
                  to={`/?category=${book.categorySlug}`}
                  className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[#0e7490] hover:text-[#164e63] transition-colors"
                >
                  Lihat Semua
                  <ChevronRightIcon size={16} />
                </Link>
              </div>
            </ScrollReveal>

            {/* Carousel */}
            <div className="relative">
              <div className="overflow-x-auto pb-4 scrollbar-hide">
                <motion.div
                  className="flex gap-4"
                  animate={{ x: -carouselIndex * 216 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  {relatedBooks.map((rb) => (
                    <RelatedBookCard key={rb.id} book={rb} />
                  ))}
                </motion.div>
              </div>

              {/* Carousel controls */}
              {relatedBooks.length > carouselVisible && (
                <>
                  <button
                    onClick={() => setCarouselIndex((i) => Math.max(0, i - 1))}
                    disabled={!canScrollLeft}
                    className="absolute left-0 top-1/3 -translate-y-1/2 -translate-x-3 w-10 h-10 rounded-full bg-white shadow-lg border border-[#cffafe] flex items-center justify-center text-[#0e7490] hover:bg-[#f0f9ff] disabled:opacity-30 disabled:cursor-not-allowed transition-all z-10"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCarouselIndex((i) => i + 1)}
                    disabled={!canScrollRight}
                    className="absolute right-0 top-1/3 -translate-y-1/2 translate-x-3 w-10 h-10 rounded-full bg-white shadow-lg border border-[#cffafe] flex items-center justify-center text-[#0e7490] hover:bg-[#f0f9ff] disabled:opacity-30 disabled:cursor-not-allowed transition-all z-10"
                  >
                    <ChevronRightIcon size={20} />
                  </button>
                </>
              )}
            </div>

            <div className="mt-4 text-center sm:hidden">
              <Link
                to={`/?category=${book.categorySlug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#0e7490] hover:text-[#164e63] transition-colors"
              >
                Lihat Semua di {book.category}
                <ChevronRightIcon size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
