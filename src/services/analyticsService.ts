// @ts-nocheck
import type { Book } from '@/types';
import { allUsers } from '@/data/usersData';
import { getAllBooks, getTotalBookCount, getTotalDownloadCount, getAverageRating } from '@/data/books';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  totalDownloads: number;
  averageRating: number;
  booksAddedThisMonth: number;
  activeUsers: number;
  totalComments: number;
  downloadsThisWeek: number;
  downloadsThisMonth: number;
}

export interface DownloadOverTime {
  date: string;
  label: string;
  downloads: number;
}

export interface TopBook {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  downloads: number;
  rating: number;
  category: string;
}

export interface RecentActivity {
  id: string;
  action: string;
  user: string;
  userAvatar: string;
  type: 'upload' | 'rating' | 'register' | 'download' | 'bookmark' | 'comment';
  timestamp: string;
}

export interface BooksByCategory {
  name: string;
  slug: string;
  count: number;
}

/* ------------------------------------------------------------------ */
/*  Keys                                                               */
/* ------------------------------------------------------------------ */

const COMMENTS_KEY = 'neuro_comments';
const ACTIVITIES_KEY = 'neuro_activities';
const DOWNLOADS_KEY = 'neuro_download_log';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getLocalComments(): Array<{
  id: string;
  bookId: string;
  bookTitle: string;
  userName: string;
  userAvatar: string;
  content: string;
  rating: number;
  createdAt: string;
}> {
  try {
    const raw = localStorage.getItem(COMMENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function getDownloadLog(): Array<{ bookId: string; date: string; count: number }> {
  try {
    const raw = localStorage.getItem(DOWNLOADS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function getStoredActivities(): Array<{
  id: string;
  type: 'book' | 'user' | 'comment' | 'category' | 'theme';
  message: string;
  timestamp: string;
}> {
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isThisWeek(date: Date): boolean {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return date >= startOfWeek;
}

function isThisMonth(date: Date): boolean {
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

function formatDayLabel(date: Date): string {
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  return days[date.getDay()];
}

/* ------------------------------------------------------------------ */
/*  Service Functions                                                  */
/* ------------------------------------------------------------------ */

export function getDashboardStats(): DashboardStats {
  const books = getAllBooks();
  const comments = getLocalComments();
  const downloadLog = getDownloadLog();

  const totalBooks = getTotalBookCount();
  const totalUsers = allUsers.length;
  const totalDownloads = getTotalDownloadCount();
  const avgRating = getAverageRating();

  // Books added this month (from localStorage uploads)
  const localBooks = (() => {
    try {
      const raw = localStorage.getItem('neuro_books');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  })();
  
  const booksAddedThisMonth = localBooks.filter((b: Book) => {
    if (b.createdAt) {
      return isThisMonth(new Date(b.createdAt));
    }
    return false;
  }).length;

  // Downloads this week / month
  const downloadsThisWeek = downloadLog
    .filter((d) => isThisWeek(new Date(d.date)))
    .reduce((sum, d) => sum + d.count, 0);
  
  const downloadsThisMonth = downloadLog
    .filter((d) => isThisMonth(new Date(d.date)))
    .reduce((sum, d) => sum + d.count, 0);

  return {
    totalBooks,
    totalUsers,
    totalDownloads,
    averageRating: avgRating,
    booksAddedThisMonth,
    activeUsers: totalUsers, // Simplified
    totalComments: comments.length,
    downloadsThisWeek,
    downloadsThisMonth,
  };
}

export function getDownloadsOverTime(days: number): DownloadOverTime[] {
  const log = getDownloadLog();
  const result: DownloadOverTime[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const downloads = log
      .filter((d) => d.date === dateStr)
      .reduce((sum, d) => sum + d.count, 0);
    
    result.push({
      date: dateStr,
      label: formatDayLabel(date),
      downloads,
    });
  }
  
  return result;
}

export function getTopBooks(limit: number): TopBook[] {
  const books = getAllBooks();
  return books
    .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
    .slice(0, limit)
    .map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      coverImage: b.coverImage || '/book-default.jpg',
      downloads: b.downloads || 0,
      rating: b.rating || 0,
      category: b.category,
    }));
}

export function getBooksByCategory(): BooksByCategory[] {
  const books = getAllBooks();
  const counts: Record<string, { name: string; count: number }> = {};
  
  books.forEach((b) => {
    if (!counts[b.categorySlug]) {
      counts[b.categorySlug] = { name: b.category, count: 0 };
    }
    counts[b.categorySlug].count++;
  });
  
  return Object.entries(counts)
    .map(([slug, { name, count }]) => ({ name, slug, count }))
    .sort((a, b) => b.count - a.count);
}

export function getRecentActivity(limit: number): RecentActivity[] {
  const activities = getStoredActivities();
  return activities
    .slice(-limit)
    .reverse()
    .map((a) => ({
      id: a.id || String(Date.now()),
      action: a.message,
      user: 'System',
      userAvatar: '/avatar-default.jpg',
      type: (a.type === 'book' ? 'upload' : a.type === 'user' ? 'register' : 'comment') as RecentActivity['type'],
      timestamp: a.timestamp,
    }));
}

export function getUserActivityStats() {
  return {
    totalUsers: allUsers.length,
    adminCount: allUsers.filter((u) => u.role === 'admin').length,
    userCount: allUsers.filter((u) => u.role === 'user').length,
    newThisMonth: 0,
  };
}

export function logActivity(message: string, type: 'book' | 'user' | 'comment' | 'category' | 'theme' = 'book') {
  const activities = getStoredActivities();
  activities.push({
    id: String(Date.now()),
    type,
    message,
    timestamp: new Date().toISOString(),
  });
  // Keep last 100
  if (activities.length > 100) {
    activities.shift();
  }
  localStorage.setItem('neuro_activities', JSON.stringify(activities));
}
