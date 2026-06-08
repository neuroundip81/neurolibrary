import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type DownloadRow = Database['public']['Tables']['downloads']['Row'];

const DOWNLOAD_COUNT_KEY = 'medibook_download_counts';

function getLocalDownloadCounts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(DOWNLOAD_COUNT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setLocalDownloadCounts(counts: Record<string, number>) {
  localStorage.setItem(DOWNLOAD_COUNT_KEY, JSON.stringify(counts));
}

export async function trackDownload(
  bookId: string,
  userId?: string
): Promise<void> {
  if (!isSupabaseConfigured()) {
    const counts = getLocalDownloadCounts();
    counts[bookId] = (counts[bookId] || 0) + 1;
    setLocalDownloadCounts(counts);
    return;
  }

  try {
    const { error } = await supabase.from('downloads').insert({
      book_id: bookId,
      user_id: userId || null,
      downloaded_at: new Date().toISOString(),
    });

    if (error) throw error;

    // Also increment book download count
    const { data: book } = await supabase
      .from('books')
      .select('download_count')
      .eq('id', bookId)
      .single();

    if (book) {
      await supabase
        .from('books')
        .update({
          download_count: (book.download_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookId);
    }
  } catch (err) {
    console.error('trackDownload error:', err);
  }
}

export async function getDownloadCount(bookId: string): Promise<number> {
  if (!isSupabaseConfigured()) {
    return getLocalDownloadCounts()[bookId] || 0;
  }

  try {
    const { data, error, count } = await supabase
      .from('downloads')
      .select('*', { count: 'exact' })
      .eq('book_id', bookId);

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('getDownloadCount error:', err);
    return 0;
  }
}

export async function getDownloadHistory(
  userId?: string
): Promise<DownloadRow[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    let query = supabase
      .from('downloads')
      .select('*')
      .order('downloaded_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.limit(100);

    if (error) throw error;
    return (data as DownloadRow[]) || [];
  } catch (err) {
    console.error('getDownloadHistory error:', err);
    return [];
  }
}
