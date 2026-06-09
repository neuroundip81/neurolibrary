// @ts-nocheck
import type { Book } from '@/types';
import booksData from './books_data.json';
import { supabase } from '@/lib/supabase';

// Map JSON category slugs to human-readable names
const CATEGORY_NAMES: Record<string, string> = {
  neuroanatomy: 'Neuroanatomi',
  neurophysiology: 'Neurofisiologi',
  neuroimaging: 'Neuroimaging',
  'clinical-neurology': 'Neurologi Klinis',
  neurosurgery: 'Neurochirurgi',
  neuropharmacology: 'Neurofarmakologi',
  'pediatric-neurology': 'Pediatri',
  epilepsy: 'Epilepsi',
  stroke: 'Stroke',
  'movement-disorders': 'Gangguan Gerak',
  'cognitive-neuroscience': 'Neuroscience Kognitif',
  'neurocritical-care': 'Neurocritical Care',
  'neuro-oncology': 'Neuro-onkologi',
  neurorehabilitation: 'Neurorehabilitasi',
  'sleep-medicine': 'Medicine Tidur',
};

// Map JSON data to Book type
export const books: Book[] = (booksData as any[]).map((b) => ({
  id: b.id,
  title: b.title,
  author: b.author,
  category: CATEGORY_NAMES[b.category] || b.category,
  categorySlug: CATEGORY_NAMES[b.category]
    ? b.category
    : (b.category || '').toLowerCase().replace(/\s+/g, '-'),
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
}));

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
