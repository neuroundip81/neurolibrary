// @ts-nocheck
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type BookmarkRow = Database['public']['Tables']['bookmarks']['Row'];
export type ReadingHistoryRow = Database['public']['Tables']['reading_history']['Row'];

const BOOKMARKS_KEY = 'medibook_bookmarks';
const READING_HISTORY_KEY = 'medibook_reading_history';

function getLocalBookmarks(userId: string): string[] {
  try {
    const raw = localStorage.getItem(`${BOOKMARKS_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalBookmarks(userId: string, bookmarks: string[]) {
  localStorage.setItem(`${BOOKMARKS_KEY}_${userId}`, JSON.stringify(bookmarks));
}

function getLocalReadingHistory(userId: string): Array<{
  book_id: string;
  progress: number;
  last_read_at: string;
}> {
  try {
    const raw = localStorage.getItem(`${READING_HISTORY_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalReadingHistory(
  userId: string,
  history: Array<{ book_id: string; progress: number; last_read_at: string }>
) {
  localStorage.setItem(`${READING_HISTORY_KEY}_${userId}`, JSON.stringify(history));
}

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as ProfileRow | null;
  } catch (err) {
    console.error('getProfile error:', err);
    return null;
  }
}

export async function updateProfile(
  userId: string,
  data: ProfileUpdate
): Promise<ProfileRow | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured: cannot update profile');
    return null;
  }

  try {
    const { data: result, error } = await supabase
      .from('profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return result as ProfileRow | null;
  } catch (err) {
    console.error('updateProfile error:', err);
    return null;
  }
}

export async function toggleBookmark(
  userId: string,
  bookId: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    const bookmarks = getLocalBookmarks(userId);
    const index = bookmarks.indexOf(bookId);
    if (index >= 0) {
      bookmarks.splice(index, 1);
    } else {
      bookmarks.push(bookId);
    }
    setLocalBookmarks(userId, bookmarks);
    return index < 0; // true if added
  }

  try {
    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', existing.id);

      if (error) throw error;
      return false; // removed
    } else {
      const { error } = await supabase.from('bookmarks').insert({
        user_id: userId,
        book_id: bookId,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
      return true; // added
    }
  } catch (err) {
    console.error('toggleBookmark error:', err);
    return false;
  }
}

export async function getBookmarks(userId: string): Promise<BookmarkRow[]> {
  if (!isSupabaseConfigured()) {
    const bookmarkIds = getLocalBookmarks(userId);
    return bookmarkIds.map((bookId) => ({
      id: `local_${bookId}`,
      book_id: bookId,
      user_id: userId,
      created_at: new Date().toISOString(),
    }));
  }

  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as BookmarkRow[]) || [];
  } catch (err) {
    console.error('getBookmarks error:', err);
    return [];
  }
}

export async function addReadingHistory(
  userId: string,
  bookId: string,
  progress: number
): Promise<void> {
  if (!isSupabaseConfigured()) {
    const history = getLocalReadingHistory(userId);
    const existing = history.findIndex((h) => h.book_id === bookId);
    const entry = {
      book_id: bookId,
      progress,
      last_read_at: new Date().toISOString(),
    };
    if (existing >= 0) {
      history[existing] = entry;
    } else {
      history.unshift(entry);
    }
    setLocalReadingHistory(userId, history.slice(0, 50));
    return;
  }

  try {
    const { data: existing } = await supabase
      .from('reading_history')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single();

    if (existing) {
      await supabase
        .from('reading_history')
        .update({
          progress,
          last_read_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('reading_history').insert({
        user_id: userId,
        book_id: bookId,
        progress,
        last_read_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('addReadingHistory error:', err);
  }
}

export async function getReadingHistory(
  userId: string
): Promise<ReadingHistoryRow[]> {
  if (!isSupabaseConfigured()) {
    const history = getLocalReadingHistory(userId);
    return history.map((h, i) => ({
      id: `local_${i}`,
      book_id: h.book_id,
      user_id: userId,
      progress: h.progress,
      last_read_at: h.last_read_at,
    }));
  }

  try {
    const { data, error } = await supabase
      .from('reading_history')
      .select('*')
      .eq('user_id', userId)
      .order('last_read_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data as ReadingHistoryRow[]) || [];
  } catch (err) {
    console.error('getReadingHistory error:', err);
    return [];
  }
}

export async function getDownloadHistory(
  userId?: string
): Promise<Array<Database['public']['Tables']['downloads']['Row']>> {
  if (!isSupabaseConfigured() || !userId) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('downloads')
      .select('*')
      .eq('user_id', userId)
      .order('downloaded_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getDownloadHistory error:', err);
    return [];
  }
}
