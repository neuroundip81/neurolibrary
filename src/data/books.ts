// @ts-nocheck
import type { Book } from '@/types';
import booksData from './books_data.json';
import { supabase } from '@/lib/supabase';

// Map old JSON category slugs to new 21 Indonesian Neurology category slugs
const CATEGORY_SLUG_MAP: Record<string, string> = {
  'stroke': 'stroke-dan-pembuluh-darah',
  'neurointervensi': 'neurointervensi', // NEW - no old data
  'neuroimaging': 'neuroimaging',
  'neurootologi-dan-neurooftalmologi': 'neurootologi-dan-neurooftalmologi', // NEW - no old data
  'nyeri': 'nyeri', // NEW - no old data
  'nyeri-kepala': 'nyeri-kepala', // NEW - no old data
  'neurofisiologi': 'neurofisiologi-klinis',
  'clinical-neurology': 'neurofisiologi-klinis',
  'epilepsi': 'epilepsi-dan-eeg',
  'sleep-medicine': 'sleep-disorders',
  'neurobehavior-dan-fungsi-luhur': 'neurobehavior-dan-fungsi-luhur', // NEW - no old data
  'movement-disorders': 'movement-disorder',
  'neuroinfeksi': 'neuroinfeksi', // NEW - no old data
  'neurogeriatri': 'neurogeriatri', // NEW - no old data
  'pediatric-neurology': 'neuropediatri',
  'neuro-oncology': 'neuroonkologi',
  'neurorestorasi-dan-neuroengineering': 'neurorestorasi-dan-neuroengineering', // NEW
  'neurosurgery': 'neurotrauma',
  'neurocritical-care': 'neurointensif',
  'neuroepidemiologi': 'neuroepidemiologi', // NEW - no old data
  'neuroanatomy': 'neurologi-dasar',
  'neuropharmacology': 'kedokteran-dasar',
  'neurorehabilitation': 'neurorestorasi-dan-neuroengineering',
};

// Map new category slugs to human-readable names (matching categories.ts)
const CATEGORY_NAMES: Record<string, string> = {
  'stroke-dan-pembuluh-darah': 'Stroke dan Pembuluh Darah (Serebrovaskular)',
  'neurointervensi': 'Neurointervensi',
  'neuroimaging': 'Neuroimaging',
  'neurootologi-dan-neurooftalmologi': 'Neurootologi dan Neurooftalmologi',
  'nyeri': 'Nyeri (Ina Pain)',
  'nyeri-kepala': 'Nyeri Kepala (Headache)',
  'neurofisiologi-klinis': 'Neurofisiologi Klinis (EEG, EMG, dll.)',
  'epilepsi-dan-eeg': 'Epilepsi dan EEG',
  'sleep-disorders': 'Sleep Disorders (Gangguan Tidur)',
  'neurobehavior-dan-fungsi-luhur': 'Neurobehavior dan Fungsi Luhur',
  'movement-disorder': 'Movement Disorder (Gangguan Gerak / Parkinson)',
  'neuroinfeksi': 'Neuroinfeksi (Infeksi Sistem Saraf)',
  'neurogeriatri': 'Neurogeriatri (Saraf Lansia)',
  'neuropediatri': 'Neuropediatri (Saraf Anak)',
  'neuroonkologi': 'Neuroonkologi (Tumor Sistem Saraf)',
  'neurorestorasi-dan-neuroengineering': 'Neurorestorasi dan Neuroengineering',
  'neurotrauma': 'Neurotrauma (Cedera Saraf & Otak)',
  'neurointensif': 'Neurointensif (Kritis Neurologi)',
  'neuroepidemiologi': 'Neuroepidemiologi',
  'neurologi-dasar': 'Neurologi Dasar',
  'kedokteran-dasar': 'Kedokteran Dasar',
};

// Map JSON data to Book type
export const books: Book[] = (booksData as any[]).map((b) => {
  const newSlug = CATEGORY_SLUG_MAP[b.category] || b.category;
  const newName = CATEGORY_NAMES[newSlug] || CATEGORY_NAMES[b.category] || b.category || 'Neurologi Dasar';
  return {
    id: b.id,
    title: b.title,
    author: b.author,
    category: newName,
    categorySlug: newSlug,
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

export const featuredBooks = books.filter((b) => b.featured);

export function getAllBooks(): Book[] {
  const stored = localStorage.getItem('neuro_books');
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Book[];
      // Merge with default books, deduplicate by id
      const map = new Map(books.map((b) => [b.id, b]));
      parsed.forEach((b) => map.set(b.id, b));
      return Array.from(map.values());
    } catch {
      // ignore parse errors
    }
  }
  return books;
}

export const getBooksByCategory = (categorySlug: string): Book[] => {
  const all = getAllBooks();
  if (categorySlug === 'all' || categorySlug === '') return all;
  return all.filter((b) => b.categorySlug === categorySlug);
};

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
      b.tags.some((t) => t.toLowerCase().includes(q)),
  );
};

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

export async function syncBooksWithSupabase(): Promise<Book[]> {
  try {
    const { data, error } = await supabase.from('books').select('*');
    if (error) throw error;
    if (data && data.length > 0) {
      // Save to localStorage for offline use
      localStorage.setItem('neuro_books_cache', JSON.stringify(data));
      return data as Book[];
    }
  } catch (err) {
    console.log('Supabase sync failed, using local data:', err);
  }
  // Fallback to local data
  return getAllBooks();
}

// Parse CSV text into Book[] for bulk import
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
      categorySlug: (get('category_slug') || get('category') || get('kategori') || 'neurologi-dasar').toLowerCase().replace(/\s+/g, '-'),
      description: get('description') || get('deskripsi') || '',
      coverImage: get('cover') || '/book-default.jpg',
      format: (get('format') || 'PDF').toUpperCase() as Book['format'],
      rating: parseFloat(get('rating')) || 0,
      ratingCount: parseInt(get('rating_count')) || 0,
      downloads: parseInt(get('downloads')) || 0,
      year: parseInt(get('year') || get('tahun')) || new Date().getFullYear(),
      pages: parseInt(get('pages') || get('halaman')) || 0,
      isbn: get('isbn') || '-',
      publisher: get('publisher') || get('penerbit') || 'Unknown',
      language: get('language') || get('bahasa') || 'Indonesia',
      featured: false,
      tags: (get('tags') || '').split(';').filter(Boolean),
      sourceType: 'external',
      externalUrl: get('external_url') || get('link') || undefined,
    };
    if (book.title && book.author) books.push(book);
  }
  return books;
}
