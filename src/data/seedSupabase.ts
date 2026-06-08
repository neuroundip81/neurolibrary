/**
 * Seed Supabase Database with 164 books and 15 categories
 * from /mnt/agents/output/books_data.json
 *
 * Usage:
 *   import { seedCategories, seedBooks } from './seedSupabase';
 *   await seedCategories();
 *   await seedBooks();
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Map JSON category slugs to human-readable names and metadata
const CATEGORY_META: Record<
  string,
  { name: string; slug: string; description: string; icon: string; gradient: string }
> = {
  neuroanatomy: {
    name: 'Neuroanatomi',
    slug: 'neuroanatomi',
    description: 'Struktur dan organisasi sistem saraf',
    icon: 'Brain',
    gradient: 'from-[#164e63] to-[#0e7490]',
  },
  neurophysiology: {
    name: 'Neurofisiologi',
    slug: 'neurofisiologi',
    description: 'Fungsi dan mekanisme sistem saraf',
    icon: 'Activity',
    gradient: 'from-[#0e7490] to-[#14b8a6]',
  },
  neuroimaging: {
    name: 'Neuroimaging',
    slug: 'neuroimaging',
    description: 'Teknik pencitraan sistem saraf',
    icon: 'Scan',
    gradient: 'from-[#14b8a6] to-[#2dd4bf]',
  },
  'clinical-neurology': {
    name: 'Neurologi Klinis',
    slug: 'neurologi-klinis',
    description: 'Diagnosis dan pengobatan gangguan neurologi',
    icon: 'Stethoscope',
    gradient: 'from-[#164e63] to-[#155e75]',
  },
  neurosurgery: {
    name: 'Neurochirurgi',
    slug: 'neurochirurgi',
    description: 'Bedah saraf dan prosedur operatif',
    icon: 'Scissors',
    gradient: 'from-[#155e75] to-[#0e7490]',
  },
  neuropharmacology: {
    name: 'Neurofarmakologi',
    slug: 'neurofarmakologi',
    description: 'Obat-obatan yang memengaruhi sistem saraf',
    icon: 'Pill',
    gradient: 'from-[#0e7490] to-[#14b8a6]',
  },
  'pediatric-neurology': {
    name: 'Pediatri',
    slug: 'pediatri',
    description: 'Neurologi anak dan perkembangan',
    icon: 'Baby',
    gradient: 'from-[#14b8a6] to-[#2dd4bf]',
  },
  epilepsy: {
    name: 'Epilepsi',
    slug: 'epilepsi',
    description: 'Gangguan kejang dan manajemennya',
    icon: 'Zap',
    gradient: 'from-[#164e63] to-[#155e75]',
  },
  stroke: {
    name: 'Stroke',
    slug: 'stroke',
    description: 'Penyakit vaskular serebrovaskular',
    icon: 'HeartPulse',
    gradient: 'from-[#155e75] to-[#0e7490]',
  },
  'movement-disorders': {
    name: 'Gangguan Gerak',
    slug: 'gangguan-gerak',
    description: 'Parkinson, distonia, dan tremor',
    icon: 'PersonStanding',
    gradient: 'from-[#0e7490] to-[#14b8a6]',
  },
  'cognitive-neuroscience': {
    name: 'Neuroscience Kognitif',
    slug: 'cognitive-neuroscience',
    description: 'Basis neural kognisi dan perilaku',
    icon: 'Lightbulb',
    gradient: 'from-[#14b8a6] to-[#2dd4bf]',
  },
  'neurocritical-care': {
    name: 'Neurocritical Care',
    slug: 'neurocritical-care',
    description: 'Perawatan intensif neurologi',
    icon: 'HeartPulse',
    gradient: 'from-[#164e63] to-[#0e7490]',
  },
  'neuro-oncology': {
    name: 'Neuro-onkologi',
    slug: 'neuro-oncology',
    description: 'Tumor dan kanker sistem saraf',
    icon: 'Microscope',
    gradient: 'from-[#155e75] to-[#14b8a6]',
  },
  neurorehabilitation: {
    name: 'Neurorehabilitasi',
    slug: 'neurorehabilitation',
    description: 'Rehabilitasi pasien gangguan saraf',
    icon: 'RefreshCw',
    gradient: 'from-[#0e7490] to-[#2dd4bf]',
  },
  'sleep-medicine': {
    name: 'Medicine Tidur',
    slug: 'sleep-medicine',
    description: 'Gangguan tidur dan manajemennya',
    icon: 'Moon',
    gradient: 'from-[#164e63] to-[#14b8a6]',
  },
};

// Map JSON category values to database slugs
function mapCategorySlug(jsonCategory: string): string {
  const meta = CATEGORY_META[jsonCategory];
  return meta ? meta.slug : jsonCategory;
}

// Generate deterministic UUID from seed string
function generateUUID(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(1, 4)}-a${hex.slice(0, 3)}-${hex.slice(0, 12)}`.padEnd(36, '0');
}

export interface SeedBook {
  id: string;
  title: string;
  author: string;
  category: string;
  publisher: string;
  year: number;
  pages: number;
  isbn: string;
  language: string;
  rating: number;
  rating_count: number;
  downloads: number;
  synopsis: string;
  table_of_contents: string[];
  tags: string[];
  cover_image: string;
  featured: boolean;
}

export interface SeedCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  gradient: string;
  book_count: number;
}

/**
 * Parse books_data.json and return categories with book counts
 */
export function parseCategories(): SeedCategory[] {
  // In a real build, we'd read the JSON file. For browser usage,
  // the JSON needs to be imported or fetched.
  // This returns the static category definitions.
  return Object.values(CATEGORY_META).map((meta, i) => ({
    id: String(i + 1),
    ...meta,
    description: meta.description,
    book_count: 0, // Will be calculated from data
  }));
}

/**
 * Seed categories into Supabase
 */
export async function seedCategories(
  supabaseUrl?: string,
  supabaseKey?: string
): Promise<{ success: boolean; count: number; error?: string }> {
  const url = supabaseUrl || import.meta.env.VITE_SUPABASE_URL || '';
  const key = supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    return { success: false, count: 0, error: 'Supabase credentials not configured' };
  }

  const client = createClient<Database>(url, key);

  try {
    const response = await fetch('/books_data.json');
    const books: SeedBook[] = await response.json();

    // Count books per category
    const counts: Record<string, number> = {};
    for (const book of books) {
      counts[book.category] = (counts[book.category] || 0) + 1;
    }

    const categories = Object.entries(CATEGORY_META).map(([key, meta], i) => ({
      id: String(i + 1),
      name: meta.name,
      slug: meta.slug,
      description: meta.description,
      icon: meta.icon,
      gradient: meta.gradient,
      book_count: counts[key] || 0,
    }));

    const { error } = await client.from('categories').upsert(categories, {
      onConflict: 'id',
    });

    if (error) throw error;

    return { success: true, count: categories.length };
  } catch (err) {
    console.error('seedCategories error:', err);
    return {
      success: false,
      count: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Seed books into Supabase
 */
export async function seedBooks(
  supabaseUrl?: string,
  supabaseKey?: string
): Promise<{ success: boolean; count: number; error?: string }> {
  const url = supabaseUrl || import.meta.env.VITE_SUPABASE_URL || '';
  const key = supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    return { success: false, count: 0, error: 'Supabase credentials not configured' };
  }

  const client = createClient<Database>(url, key);

  try {
    const response = await fetch('/books_data.json');
    const books: SeedBook[] = await response.json();

    // Build category slug to id mapping
    const { data: categories } = await client.from('categories').select('id, slug');
    const slugToId: Record<string, string> = {};
    if (categories) {
      for (const cat of categories) {
        if (cat.slug) slugToId[cat.slug] = cat.id;
      }
    }

    const bookRows = books.map((book) => {
      const categorySlug = mapCategorySlug(book.category);
      return {
        id: book.id,
        title: book.title,
        author: book.author,
        category_id: slugToId[categorySlug] || null,
        category_slug: categorySlug,
        publisher: book.publisher,
        year: book.year,
        pages: book.pages,
        isbn: book.isbn,
        language: book.language,
        synopsis: book.synopsis,
        table_of_contents: book.table_of_contents,
        tags: book.tags,
        cover_image: book.cover_image,
        file_url: null,
        file_format: 'PDF',
        featured: book.featured,
        rating: book.rating,
        rating_count: book.rating_count,
        download_count: book.downloads,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

    // Upsert in batches of 50
    const BATCH_SIZE = 50;
    for (let i = 0; i < bookRows.length; i += BATCH_SIZE) {
      const batch = bookRows.slice(i, i + BATCH_SIZE);
      const { error } = await client.from('books').upsert(batch, {
        onConflict: 'id',
      });
      if (error) {
        console.error(`Batch ${i / BATCH_SIZE + 1} error:`, error);
        throw error;
      }
    }

    return { success: true, count: bookRows.length };
  } catch (err) {
    console.error('seedBooks error:', err);
    return {
      success: false,
      count: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Run full seed: categories first, then books
 */
export async function runFullSeed(
  supabaseUrl?: string,
  supabaseKey?: string
): Promise<{
  categories: { success: boolean; count: number; error?: string };
  books: { success: boolean; count: number; error?: string };
}> {
  const catResult = await seedCategories(supabaseUrl, supabaseKey);
  const bookResult = await seedBooks(supabaseUrl, supabaseKey);
  return { categories: catResult, books: bookResult };
}
