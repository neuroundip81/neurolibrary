import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Brain, Sparkles, Library, Search, ChevronRight, Mail,
  BookOpen, Users, Layers, Download, ArrowUp, X, SlidersHorizontal,
  Star, Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllBooks, featuredBooks as staticFeaturedBooks, sortBooks } from '@/data/books';
import { categories, filterPills } from '@/data/categories';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useToast } from '@/hooks/useToast';
import SEO from '@/components/SEO';
import NeuralNetworkBackground from '@/components/NeuralNetworkBackground';
import BookCard from '@/components/BookCard';
import ScrollReveal from '@/components/ScrollReveal';
import type { Book } from '@/types';
import BookDetailModal from '@/components/BookDetailModal';

const BOOKS_PER_PAGE = 20;

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const [minRating, setMinRating] = useState(0);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { bookmarks, toggleBookmark } = useBookmarks();
  const { success } = useToast();

  // Scroll listener for scroll-to-top button
  useEffect(() => {
    const handler = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Sync URL params
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, minRating, yearFrom, yearTo, sortBy]);

  const handleCategoryChange = useCallback((slug: string) => {
    setActiveCategory(slug);
    if (slug === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: slug });
    }
  }, [setSearchParams]);

  const handleToggleBookmark = useCallback((bookId: string) => {
    const wasAdded = !bookmarks.includes(bookId);
    toggleBookmark(bookId);
    if (wasAdded) {
      success('Ditambahkan ke bookmark');
    } else {
      success('Dihapus dari bookmark');
    }
  }, [bookmarks, toggleBookmark, success]);

  const handleOpenDetail = useCallback((book: Book) => {
    setSelectedBook(book);
    setDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
    setTimeout(() => setSelectedBook(null), 300);
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubmitted(true);
      success('Berhasil berlangganan newsletter!');
      setNewsletterEmail('');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get all books including uploaded ones from localStorage
  const allBooks = useMemo(() => getAllBooks(), []);
  const mergedFeaturedBooks = useMemo(() => {
    const featured = allBooks.filter((b) => b.featured);
    return featured.length > 0 ? featured : staticFeaturedBooks;
  }, [allBooks]);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
    setActiveCategory('all');
    setMinRating(0);
    setYearFrom('');
    setYearTo('');
    setSortBy('newest');
    setCurrentPage(1);
    setSearchParams({});
  }, [setSearchParams]);

  // Filtered and sorted books
  const filteredBooks = useMemo(() => {
    let result = [...allBooks];

    if (activeCategory !== 'all') {
      result = result.filter((b) => b.categorySlug === activeCategory);
    }

    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (minRating > 0) {
      result = result.filter((b) => b.rating >= minRating);
    }

    if (yearFrom) {
      result = result.filter((b) => b.year >= Number(yearFrom));
    }

    if (yearTo) {
      result = result.filter((b) => b.year <= Number(yearTo));
    }

    return sortBooks(result, sortBy);
  }, [activeCategory, debouncedQuery, sortBy, minRating, yearFrom, yearTo, allBooks]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / BOOKS_PER_PAGE));
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * BOOKS_PER_PAGE;
    return filteredBooks.slice(start, start + BOOKS_PER_PAGE);
  }, [filteredBooks, currentPage]);

  const startIndex = filteredBooks.length > 0 ? (currentPage - 1) * BOOKS_PER_PAGE + 1 : 0;
  const endIndex = Math.min(currentPage * BOOKS_PER_PAGE, filteredBooks.length);

  // Active filter chips
  const activeFilters = useMemo(() => {
    const filters: { label: string; onRemove: () => void }[] = [];
    if (debouncedQuery) {
      filters.push({
        label: `Cari: "${debouncedQuery}"`,
        onRemove: () => { setSearchQuery(''); setDebouncedQuery(''); },
      });
    }
    if (activeCategory !== 'all') {
      const cat = categories.find((c) => c.slug === activeCategory);
      filters.push({
        label: cat?.name || activeCategory,
        onRemove: () => handleCategoryChange('all'),
      });
    }
    if (minRating > 0) {
      filters.push({
        label: `Rating ≥ ${minRating}`,
        onRemove: () => setMinRating(0),
      });
    }
    if (yearFrom) {
      filters.push({
        label: `Dari ${yearFrom}`,
        onRemove: () => setYearFrom(''),
      });
    }
    if (yearTo) {
      filters.push({
        label: `Sampai ${yearTo}`,
        onRemove: () => setYearTo(''),
      });
    }
    return filters;
  }, [debouncedQuery, activeCategory, minRating, yearFrom, yearTo, handleCategoryChange]);

  const stats = [
    { icon: BookOpen, label: 'Buku', value: '150+' },
    { icon: Layers, label: 'Kategori', value: '12' },
    { icon: Users, label: 'Pengguna', value: '2.4K' },
    { icon: Download, label: 'Downloads', value: '8.9K' },
  ];

  const categoryIcons: Record<string, React.ReactNode> = {
    Brain: <Brain size={48} />,
    Activity: <Layers size={48} />,
    Scan: <Search size={48} />,
    Stethoscope: <BookOpen size={48} />,
    Scissors: <ChevronRight size={48} />,
    Pill: <Mail size={48} />,
  };

  return (
    <div>
      <SEO />

      {/* ========== Section 1: Hero ========== */}
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#164e63] via-[#0e7490] to-[#14b8a6]">
        <NeuralNetworkBackground />

        {/* Decorative circles */}
        <div
          className="absolute -top-[50%] -right-[10%] w-[600px] h-[600px] rounded-full bg-white/[0.08] animate-pulse pointer-events-none"
        />
        <div
          className="absolute -bottom-[30%] -left-[5%] w-[400px] h-[400px] rounded-full bg-[#ec4899]/10 animate-pulse-slow pointer-events-none"
        />

        {/* Hero content */}
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-3xl mx-auto">
          {/* Brain icon */}
          <ScrollReveal delay={500} duration={600}>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Brain size={32} className="text-white" />
              </div>
            </div>
          </ScrollReveal>

          {/* H1 */}
          <ScrollReveal delay={700} duration={800}>
            <h1
              className="font-display font-bold text-white leading-tight mb-4"
              style={{
                fontSize: 'clamp(2.75rem, 6vw, 4.5rem)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              Perpustakaan Digital Neurologi
            </h1>
          </ScrollReveal>

          {/* Subtitle */}
          <ScrollReveal delay={900} duration={600}>
            <p
              className="text-white/95 text-base sm:text-lg mx-auto mb-6 max-w-[600px]"
              style={{ lineHeight: 1.6 }}
            >
              Koleksi literatur neurologi, neurosains, dan kedokteran saraf untuk praktisi dan mahasiswa kedokteran
            </p>
          </ScrollReveal>

          {/* Badge */}
          <ScrollReveal delay={1100} duration={400}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm mb-10">
              <Sparkles size={16} />
              Dikurasi oleh Dokter Spesialis Neurologi
            </div>
          </ScrollReveal>

          {/* Stats row */}
          <ScrollReveal delay={1300} duration={500}>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 text-center"
                  style={{
                    animation: `slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${1300 + i * 100}ms both`,
                  }}
                >
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-white/90">{stat.label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ========== Section 2: Search & Filter Bar ========== */}
      <section id="search-section" ref={searchRef} className="bg-[#f0f9ff] border-b border-[#cffafe] py-6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <ScrollReveal>
            {/* Search input */}
            <div className="relative mb-4">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul buku, penulis, topik neurologi..."
                className="w-full pl-12 pr-16 py-3.5 rounded-full border-2 border-[#cffafe] bg-white text-[#164e63] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490] focus:shadow-[0_0_0_3px_rgba(8,145,178,0.15)] transition-all"
              />
              <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-2 py-1 rounded bg-[#f0f9ff] text-[#64748b] text-xs font-mono border border-[#cffafe]">
                Ctrl+K
              </kbd>
            </div>
          </ScrollReveal>

          {/* Filter pills row + Sort + Filter toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <ScrollReveal>
              <div className="flex flex-wrap gap-2">
                {filterPills.map((pill) => (
                  <button
                    key={pill.slug}
                    onClick={() => handleCategoryChange(pill.slug)}
                    className={`px-5 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                      activeCategory === pill.slug
                        ? 'bg-[#0e7490] text-white border-[#0e7490] -translate-y-0.5 shadow-md'
                        : 'bg-white text-[#64748b] border-[#cffafe] hover:bg-[#f0f9ff] hover:text-[#0e7490]'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters((v) => !v)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                    showFilters
                      ? 'bg-[#0e7490] text-white border-[#0e7490]'
                      : 'bg-white text-[#64748b] border-[#cffafe] hover:bg-[#f0f9ff] hover:text-[#0e7490]'
                  }`}
                >
                  <SlidersHorizontal size={16} />
                  Filter
                </button>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-full border border-[#cffafe] bg-white text-sm text-[#164e63] focus:outline-none focus:border-[#0e7490] cursor-pointer"
                >
                  <option value="newest">Terbaru</option>
                  <option value="popular">Populer</option>
                  <option value="rating">Rating Tertinggi</option>
                  <option value="az">A-Z</option>
                </select>
              </div>
            </ScrollReveal>
          </div>

          {/* Expanded filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-xl border border-[#cffafe] p-5 mb-4 flex flex-wrap gap-6 items-end">
                  {/* Rating filter */}
                  <div className="flex-1 min-w-[200px]">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-[#164e63] mb-2">
                      <Star size={14} className="text-[#f59e0b]" />
                      Rating Minimum
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={minRating}
                        onChange={(e) => setMinRating(Number(e.target.value))}
                        className="flex-1 accent-[#0e7490]"
                      />
                      <span className="text-sm font-semibold text-[#164e63] w-10 text-right">
                        {minRating > 0 ? `${minRating}+` : 'All'}
                      </span>
                    </div>
                  </div>

                  {/* Year from */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-[#164e63] mb-2">
                      <Calendar size={14} className="text-[#0e7490]" />
                      Tahun Dari
                    </label>
                    <input
                      type="number"
                      value={yearFrom}
                      onChange={(e) => setYearFrom(e.target.value)}
                      placeholder="2010"
                      min="1900"
                      max="2100"
                      className="w-28 px-3 py-2 rounded-lg border-2 border-[#cffafe] bg-[#f0f9ff] text-sm text-[#164e63] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490]"
                    />
                  </div>

                  {/* Year to */}
                  <div>
                    <label className="block text-sm font-medium text-[#164e63] mb-2">
                      Sampai
                    </label>
                    <input
                      type="number"
                      value={yearTo}
                      onChange={(e) => setYearTo(e.target.value)}
                      placeholder="2025"
                      min="1900"
                      max="2100"
                      className="w-28 px-3 py-2 rounded-lg border-2 border-[#cffafe] bg-[#f0f9ff] text-sm text-[#164e63] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490]"
                    />
                  </div>

                  {/* Quick year presets */}
                  <div className="flex gap-2">
                    {[2024, 2023, 2022, 2021].map((year) => (
                      <button
                        key={year}
                        onClick={() => { setYearFrom(String(year)); setYearTo(String(year)); }}
                        className="px-3 py-2 rounded-lg bg-[#f0f9ff] text-xs font-medium text-[#0e7490] border border-[#cffafe] hover:bg-[#cffafe] transition-colors"
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active filters + count */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-sm text-[#64748b]">
              Menampilkan <span className="font-semibold text-[#164e63]">{startIndex}-{endIndex}</span> dari <span className="font-semibold text-[#164e63]">{filteredBooks.length}</span> buku
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {activeFilters.map((filter, i) => (
                  <motion.span
                    key={`${filter.label}-${i}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#0e7490]/10 text-[#0e7490] text-xs font-medium border border-[#0e7490]/20"
                  >
                    {filter.label}
                    <button
                      onClick={filter.onRemove}
                      className="ml-1 hover:bg-[#0e7490]/20 rounded-full p-0.5 transition-colors"
                      aria-label={`Hapus filter ${filter.label}`}
                    >
                      <X size={12} />
                    </button>
                  </motion.span>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-medium text-[#64748b] hover:text-[#0e7490] underline underline-offset-2 transition-colors ml-1"
                >
                  Hapus Semua
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========== Section 3: Featured Books Carousel ========== */}
      <section className="py-12 bg-[#f0f9ff]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#164e63] flex items-center gap-2">
                <Sparkles size={28} className="text-[#0e7490]" />
                Buku Unggulan
              </h2>
              <a href="#katalog" className="text-sm text-[#0e7490] hover:text-[#164e63] font-medium flex items-center gap-1 transition-colors">
                Lihat Semua <ChevronRight size={16} />
              </a>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mergedFeaturedBooks.map((book) => (
              <div key={book.id} className="lg:col-span-1">
                <BookCard
                  book={book}
                  isBookmarked={bookmarks.includes(book.id)}
                  onToggleBookmark={handleToggleBookmark}
                  onOpenDetail={handleOpenDetail}
                  featured
                  index={0}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== Section 4: Full Catalog Grid ========== */}
      <section id="katalog" className="py-12 bg-[#f0f9ff]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#164e63] flex items-center gap-2 mb-8">
              <Library size={28} className="text-[#0e7490]" />
              Katalog Lengkap
            </h2>
          </ScrollReveal>

          {/* Book grid */}
          {filteredBooks.length === 0 ? (
            <ScrollReveal className="flex flex-col items-center justify-center py-20 text-center">
              <Brain size={64} className="text-[#64748b] opacity-50 mb-4" />
              <h3 className="text-xl font-semibold text-[#164e63] mb-2">Tidak ada hasil</h3>
              <p className="text-[#64748b] max-w-md mb-6">
                Coba sesuaikan filter atau kata kunci pencarian Anda
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 rounded-full bg-[#0e7490] text-white text-sm font-medium hover:bg-[#155e75] transition-colors"
              >
                Reset Filter
              </button>
            </ScrollReveal>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedBooks.map((book, i) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    isBookmarked={bookmarks.includes(book.id)}
                    onToggleBookmark={handleToggleBookmark}
                    onOpenDetail={handleOpenDetail}
                    index={i}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center mt-10 gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-lg border border-[#cffafe] bg-white flex items-center justify-center text-[#164e63] hover:bg-[#f0f9ff] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    aria-label="Halaman sebelumnya"
                  >
                    <ChevronRight size={16} className="rotate-180" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                        currentPage === page
                          ? 'bg-[#0e7490] text-white shadow-md'
                          : 'border border-[#cffafe] bg-white text-[#164e63] hover:bg-[#f0f9ff]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-lg border border-[#cffafe] bg-white flex items-center justify-center text-[#164e63] hover:bg-[#f0f9ff] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    aria-label="Halaman berikutnya"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ========== Section 5: Category Highlights ========== */}
      <section className="py-12 bg-[#f0f9ff]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#164e63] mb-8 text-center">
              Jelajahi Kategori
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.slice(0, 6).map((cat, i) => (
              <ScrollReveal key={cat.id} delay={i * 100}>
                <button
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`w-full text-left p-8 rounded-2xl bg-gradient-to-r ${cat.gradient} text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:scale-[1.02] group`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="mb-4 opacity-90">{categoryIcons[cat.icon] || <Brain size={48} />}</div>
                      <h3 className="text-xl font-semibold mb-1">{cat.name}</h3>
                      <p className="text-white/80 text-sm">{cat.bookCount} buku</p>
                    </div>
                    <ChevronRight
                      size={24}
                      className="opacity-60 group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </button>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========== Section 6: Newsletter CTA ========== */}
      <section className="py-12 bg-[#f0f9ff]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#164e63] via-[#0e7490] to-[#14b8a6] p-8 sm:p-12 text-center">
              <div className="relative z-10">
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mb-6"
                  style={{ animation: 'heartBeat 0.4s ease 200ms both' }}
                >
                  <Mail size={24} className="text-white" />
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white mb-3">
                  Tetap Terupdate
                </h2>
                <p className="text-white/90 max-w-[500px] mx-auto mb-6">
                  Dapatkan rekomendasi buku neurologi terbaru dan ringkasan penelitian langsung ke inbox Anda.
                </p>

                {newsletterSubmitted ? (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 inline-flex items-center gap-2 text-white">
                    <Sparkles size={18} />
                    <span>Terima kasih telah berlangganan!</span>
                  </div>
                ) : (
                  <form
                    onSubmit={handleNewsletterSubmit}
                    className="flex flex-col sm:flex-row gap-3 max-w-[500px] mx-auto"
                    style={{ animation: 'slideIn 0.5s ease 400ms both' }}
                  >
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="email@rumahsakit.co.id"
                      required
                      className="flex-1 px-4 py-3 rounded-lg border-none bg-white text-[#164e63] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-lg bg-[#ec4899] text-white font-medium transition-all hover:bg-[#db2777] hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                    >
                      Berlangganan
                    </button>
                  </form>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ========== Section 7: Footer handled by Layout ========== */}

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          isOpen={detailOpen}
          onClose={handleCloseDetail}
          isBookmarked={bookmarks.includes(selectedBook.id)}
          onToggleBookmark={handleToggleBookmark}
        />
      )}

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#0e7490] text-white shadow-lg flex items-center justify-center hover:bg-[#155e75] hover:scale-110 transition-all z-[500]"
          style={{ animation: 'heartBeat 0.3s ease both' }}
          aria-label="Kembali ke atas"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}
