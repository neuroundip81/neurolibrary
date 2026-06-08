// @ts-nocheck
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { books as localBooks } from '@/data/books';
import type { Database } from '@/types/database';

export type BookRow = Database['public']['Tables']['books']['Row'];
export type BookInsert = Database['public']['Tables']['books']['Insert'];
export type BookUpdate = Database['public']['Tables']['books']['Update'];

export interface GetBooksParams {
  search?: string;
  category?: string;
  sortBy?: 'newest' | 'popular' | 'rating' | 'az';
  page?: number;
  limit?: number;
}

export interface GetBooksResult {
  books: BookRow[];
  total: number;
  page: number;
  totalPages: number;
}

const PAGE_SIZE = 12;

function toLocalBooks(): BookRow[] {
  return localBooks.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    category_id: null,
    category_slug: b.categorySlug,
    publisher: b.publisher,
    year: b.year,
    pages: b.pages,
    isbn: b.isbn,
    language: b.language,
    synopsis: b.description,
    table_of_contents: null,
    tags: b.tags,
    cover_image: b.coverImage,
    file_url: null,
    file_format: b.format,
    featured: b.featured,
    rating: b.rating,
    rating_count: b.ratingCount,
    download_count: b.downloads,
    created_at: null,
    updated_at: null,
  }));
}

export async function getBooks(params: GetBooksParams = {}): Promise<GetBooksResult> {
  const { search, category, sortBy = 'newest', page = 1, limit = PAGE_SIZE } = params;

  if (!isSupabaseConfigured()) {
    let books = toLocalBooks();
    if (search) {
      const q = search.toLowerCase();
      books = books.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.author?.toLowerCase().includes(q) ||
          b.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (category && category !== 'all') {
      books = books.filter((b) => b.category_slug === category);
    }
    switch (sortBy) {
      case 'popular':
        books.sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
        break;
      case 'rating':
        books.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'az':
        books.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'newest':
      default:
        books.sort((a, b) => (b.year || 0) - (a.year || 0));
        break;
    }
    const total = books.length;
    const start = (page - 1) * limit;
    const paginated = books.slice(start, start + limit);
    return { books: paginated, total, page, totalPages: Math.ceil(total / limit) };
  }

  try {
    let query = supabase.from('books').select('*', { count: 'exact' });

    if (search) {
      query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
    }
    if (category && category !== 'all') {
      query = query.eq('category_slug', category);
    }

    switch (sortBy) {
      case 'popular':
        query = query.order('download_count', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'az':
        query = query.order('title', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('year', { ascending: false });
        break;
    }

    const start = (page - 1) * limit;
    query = query.range(start, start + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      books: (data as BookRow[]) || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (err) {
    console.error('getBooks error:', err);
    return { books: [], total: 0, page, totalPages: 0 };
  }
}

export async function getBookById(id: string): Promise<BookRow | null> {
  if (!isSupabaseConfigured()) {
    const local = toLocalBooks().find((b) => b.id === id);
    return local || null;
  }

  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as BookRow | null;
  } catch (err) {
    console.error('getBookById error:', err);
    return null;
  }
}

export async function getFeaturedBooks(): Promise<BookRow[]> {
  if (!isSupabaseConfigured()) {
    return toLocalBooks().filter((b) => b.featured);
  }

  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('featured', true)
      .order('rating', { ascending: false })
      .limit(8);

    if (error) throw error;
    return (data as BookRow[]) || [];
  } catch (err) {
    console.error('getFeaturedBooks error:', err);
    return [];
  }
}

export async function getRelatedBooks(
  bookId: string,
  categorySlug: string | null,
  limit = 6
): Promise<BookRow[]> {
  if (!isSupabaseConfigured()) {
    const books = toLocalBooks().filter(
      (b) => b.id !== bookId && b.category_slug === categorySlug
    );
    return books.slice(0, limit);
  }

  try {
    let query = supabase
      .from('books')
      .select('*')
      .neq('id', bookId);

    if (categorySlug) {
      query = query.eq('category_slug', categorySlug);
    }

    const { data, error } = await query
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as BookRow[]) || [];
  } catch (err) {
    console.error('getRelatedBooks error:', err);
    return [];
  }
}

export async function incrementDownload(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    const { error } = await supabase.rpc('increment_download', { book_id: id });
    if (error) {
      // Fallback: direct update if RPC not available
      const { data: book } = await supabase
        .from('books')
        .select('download_count')
        .eq('id', id)
        .single();
      if (book) {
        await supabase
          .from('books')
          .update({ download_count: (book.download_count || 0) + 1 })
          .eq('id', id);
      }
    }
  } catch (err) {
    console.error('incrementDownload error:', err);
  }
}

export async function addRating(
  bookId: string,
  userId: string,
  rating: number,
  review?: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const { error } = await supabase.from('ratings').insert({
      book_id: bookId,
      user_id: userId,
      rating,
      review: review || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    // Recalculate book rating
    const { data: ratings } = await supabase
      .from('ratings')
      .select('rating')
      .eq('book_id', bookId);

    if (ratings && ratings.length > 0) {
      const avg = ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length;
      await supabase
        .from('books')
        .update({ rating: avg, rating_count: ratings.length })
        .eq('id', bookId);
    }

    return true;
  } catch (err) {
    console.error('addRating error:', err);
    return false;
  }
}

export async function getBookRatings(bookId: string) {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getBookRatings error:', err);
    return [];
  }
}

export async function createBook(book: BookInsert): Promise<BookRow | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('books')
      .insert(book)
      .select()
      .single();

    if (error) throw error;
    return data as BookRow | null;
  } catch (err) {
    console.error('createBook error:', err);
    return null;
  }
}

export async function updateBook(
  id: string,
  book: BookUpdate
): Promise<BookRow | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('books')
      .update({ ...book, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as BookRow | null;
  } catch (err) {
    console.error('updateBook error:', err);
    return null;
  }
}

export async function deleteBook(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const { error } = await supabase.from('books').delete().eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deleteBook error:', err);
    return false;
  }
}
