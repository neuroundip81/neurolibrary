// @ts-nocheck
import type { Book } from '@/types';
import booksData from './books_data.json';
import { supabase } from '@/lib/supabase';

// ============================================================
// MAP: 15 old JSON categories → 21 new Indonesian categories
// ============================================================

// Category name mapping (old slug → new display name)
const CATEGORY_NAME_MAP: Record<string, string> = {
  stroke: 'Stroke dan Pembuluh Darah (Serebrovaskular)',
  neuroimaging: 'Neuroimaging',
  epilepsy: 'Epilepsi dan EEG',
  'clinical-neurology': 'Neurofisiologi Klinis (EEG, EMG, dll.)',
  neurophysiology: 'Neurofisiologi Klinis (EEG, EMG, dll.)',
  'sleep-medicine': 'Sleep Disorders (Gangguan Tidur)',
  'movement-disorders': 'Movement Disorder (Gangguan Gerak / Parkinson)',
  'cognitive-neuroscience': 'Neurobehavior dan Fungsi Luhur (Perilaku & Kognitif)',
  'neuro-oncology': 'Neuroonkologi (Tumor Sistem Saraf)',
  'pediatric-neurology': 'Neuropediatri (Saraf Anak)',
  neuropharmacology: 'Kedokteran Dasar',
  'neurocritical-care': 'Neurointensif (Kritis Neurologi)',
  neuroanatomy: 'Neurologi Dasar',
  neurosurgery: 'Neurotrauma (Cedera Saraf & Otak)',
  neurorehabilitation: 'Neurorestorasi dan Neuroengineering',
};

// Category slug mapping (old slug → new slug matching categories.ts)
const CATEGORY_SLUG_MAP: Record<string, string> = {
  stroke: 'stroke-dan-pembuluh-darah',
  neuroimaging: 'neuroimaging',
  epilepsy: 'epilepsi-dan-eeg',
  'clinical-neurology': 'neurofisiologi-klinis',
  neurophysiology: 'neurofisiologi-klinis',
  'sleep-medicine': 'sleep-disorders',
  'movement-disorders': 'movement-disorder',
  'cognitive-neuroscience': 'neurobehavior-dan-fungsi-luhur',
  'neuro-oncology': 'neuroonkologi',
  'pediatric-neurology': 'neuropediatri',
  neuropharmacology: 'kedokteran-dasar',
  'neurocritical-care': 'neurointensif',
  neuroanatomy: 'neurologi-dasar',
  neurosurgery: 'neurotrauma',
  neurorehabilitation: 'neurorestorasi-dan-neuroengineering',
};

// Map JSON data to Book type with new 21 categories
export const books: Book[] = (booksData as any[]).map((b) => {
  const oldSlug = b.category || '';
  const newCategoryName = CATEGORY_NAME_MAP[oldSlug] || b.category;
  const newCategorySlug = CATEGORY_SLUG_MAP[oldSlug] || oldSlug;

  return {
    id: b.id,
    title: b.title,
    author: b.author,
    category: newCategoryName,
    categorySlug: newCategorySlug,
    description: b.synopsis || 'Tidak ada deskripsi.',
    coverImage: b.cover_image || '/book-default.jpg',
    format: (b.file_format || 'PDF').toUpperCase() as Book['format'],
    rating: b.rating || 0,
    ratingCount: b.rating_count || 0,
    downloads: b.downloads || 0,
    year: b.year || new Date().getFullYear(),
    pages: b.pages || 0,
    isbn: b.isbn || '-',
    publisher: b.publisher || 'Unknown',
    language: b.language || 'English',
    featured: b.featured || false,
    tags: b.tags || [],
    sourceType: b.sourceType || 'upload',
    externalUrl: b.externalUrl,
  };
});

// Featured books (top 20 by rating and downloads)
export const featuredBooks = books
  .filter((b) => b.featured)
  .sort((a, b) => (b.rating * b.downloads) - (a.rating * a.downloads))
  .slice(0, 20);

// Get all books including user-uploaded ones from localStorage
export function getAllBooks(): Book[] {
  try {
    const stored = localStorage.getItem('neuro_books');
    if (stored) {
      const parsed = JSON.parse(stored) as Book[];
      // Merge with default books, deduplicate by id
      const map = new Map(books.map((b) => [b.id, b]));
      parsed.forEach((b) => map.set(b.id, b));
      return Array.from(map.values());
    }
  } catch {
    // ignore parse errors
  }
  return books;
}

// Get books by category slug
export const getBooksByCategory = (categorySlug: string): Book[] => {
  const all = getAllBooks();
  if (categorySlug === 'all' || categorySlug === '') return all;
  return all.filter((b) => b.categorySlug === categorySlug);
};

// Search books by query
export const searchBooks = (query: string): Book[] => {
  const all = getAllBooks();
  const q = query.toLowerCase().trim();
  if (!q) return all;
  return all.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      b.isbn.includes(q) ||
      (b.tags && b.tags.some((t) => t.toLowerCase().includes(q))),
  );
};

// Sort books
export const sortBooks = (bookList: Book[], sortBy: string): Book[] => {
  const sorted = [...bookList];
  switch (sortBy) {
    case 'popular':
      return sorted.sort((a, b) => b.downloads - a.downloads);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'az':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'newest':
    default:
      return sorted.sort((a, b) => b.year - a.year);
  }
};

// Sync with Supabase
export async function syncBooksWithSupabase(): Promise<Book[]> {
  try {
    const { data, error } = await supabase.from('books').select('*');
    if (error) throw error;
    if (data && data.length > 0) {
      localStorage.setItem('neuro_books_cache', JSON.stringify(data));
      return data as Book[];
    }
  } catch (err) {
    console.log('Supabase sync failed, using local data:', err);
  }
  return getAllBooks();
}

// Save a new book (for upload/import)
export function saveBook(book: Book): void {
  const stored = localStorage.getItem('neuro_books');
  const existing = stored ? JSON.parse(stored) as Book[] : [];
  const updated = [book, ...existing];
  localStorage.setItem('neuro_books', JSON.stringify(updated));
  // Dispatch event for UI refresh
  window.dispatchEvent(new Event('booksUpdated'));
}

// Delete a book by ID
export function deleteBook(bookId: string): void {
  const stored = localStorage.getItem('neuro_books');
  if (stored) {
    const existing = JSON.parse(stored) as Book[];
    const updated = existing.filter((b) => b.id !== bookId);
    localStorage.setItem('neuro_books', JSON.stringify(updated));
    window.dispatchEvent(new Event('booksUpdated'));
  }
}

// Get book count per category
export function getBookCountsByCategory(): Record<string, number> {
  const all = getAllBooks();
  const counts: Record<string, number> = {};
  all.forEach((b) => {
    counts[b.categorySlug] = (counts[b.categorySlug] || 0) + 1;
  });
  return counts;
}

// Bulk import books from JSON
export function bulkImportBooks(newBooks: Book[]): { imported: number; errors: string[] } {
  const errors: string[] = [];
  let imported = 0;

  const stored = localStorage.getItem('neuro_books');
  const existing = stored ? JSON.parse(stored) as Book[] : [];

  for (const book of newBooks) {
    if (!book.title || !book.author) {
      errors.push(`Skipping book without title/author`);
      continue;
    }
    // Auto-generate ID if missing
    if (!book.id) {
      book.id = `imported-${Date.now()}-${imported}`;
    }
    existing.push(book);
    imported++;
  }

  localStorage.setItem('neuro_books', JSON.stringify(existing));
  window.dispatchEvent(new Event('booksUpdated'));
  return { imported, errors };
}

// Parse CSV to Book objects
export function parseCSVToBooks(csvText: string): Book[] {
  const lines = csvText.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const books: Book[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const get = (name: string) => {
      const idx = headers.indexOf(name.toLowerCase());
      return idx >= 0 ? values[idx]?.trim() || '' : '';
    };

    const book: Book = {
      id: `csv-${Date.now()}-${i}`,
      title: get('title') || get('judul'),
      author: get('author') || get('penulis'),
      category: get('category') || get('kategori') || 'Neurologi Dasar',
      categorySlug: (get('category') || get('kategori') || 'neurologi-dasar')
        .toLowerCase()
        .replace(/\s+/g, '-'),
      description: get('description') || get('synopsis') || get('deskripsi') || '',
      coverImage: get('cover') || get('cover_image') || '/book-default.jpg',
      format: (get('format') || 'PDF').toUpperCase() as Book['format'],
      rating: parseFloat(get('rating')) || 0,
      ratingCount: parseInt(get('rating_count')) || 0,
      downloads: parseInt(get('downloads')) || 0,
      year: parseInt(get('year') || get('tahun')) || new Date().getFullYear(),
      pages: parseInt(get('pages') || get('halaman')) || 0,
      isbn: get('isbn') || '-',
      publisher: get('publisher') || get('penerbit') || 'Unknown',
      language: get('language') || get('bahasa') || 'English',
      featured: false,
      tags: (get('tags') || '').split(';').filter(Boolean),
      sourceType: (get('source_type') || 'upload') as 'upload' | 'external',
      externalUrl: get('external_url') || undefined,
    };

    if (book.title && book.author) {
      books.push(book);
    }
  }

  return books;
}

// Clear all user-uploaded books (keep default)
export function clearUploadedBooks(): void {
  localStorage.removeItem('neuro_books');
  window.dispatchEvent(new Event('booksUpdated'));
}

// Get total book count
export function getTotalBookCount(): number {
  return getAllBooks().length;
}

// Get total download count
export function getTotalDownloadCount(): number {
  return getAllBooks().reduce((sum, b) => sum + (b.downloads || 0), 0);
}

// Get average rating
export function getAverageRating(): number {
  const all = getAllBooks();
  if (all.length === 0) return 0;
  const sum = all.reduce((s, b) => s + (b.rating || 0), 0);
  return Math.round((sum / all.length) * 10) / 10;
}
