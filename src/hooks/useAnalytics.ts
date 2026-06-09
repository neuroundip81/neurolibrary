import { useState, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AnalyticsEvent {
  type: 'page_view' | 'book_view' | 'download' | 'search' | 'bookmark' | 'share';
  bookId?: string;
  category?: string;
  query?: string;
  results?: number;
  timestamp: number;
}

interface AnalyticsData {
  events: AnalyticsEvent[];
}

const STORAGE_KEY = 'neuro_analytics';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function loadAnalytics(): AnalyticsData {
  if (typeof window === 'undefined') return { events: [] };
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as AnalyticsData;
  } catch {
    /* ignore corrupt data */
  }
  return { events: [] };
}

function saveAnalytics(data: AnalyticsData): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore storage errors */
  }
}

function addEvent(event: AnalyticsEvent): void {
  const data = loadAnalytics();
  data.events.push(event);

  // Keep only last 5000 events to prevent storage bloat
  if (data.events.length > 5000) {
    data.events = data.events.slice(-5000);
  }

  saveAnalytics(data);
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData>(() => loadAnalytics());

  const refresh = useCallback(() => {
    setData(loadAnalytics());
  }, []);

  /** Track a page view */
  const trackPageView = useCallback((page: string) => {
    addEvent({
      type: 'page_view',
      query: page,
      timestamp: Date.now(),
    });
    refresh();
  }, [refresh]);

  /** Track when a book is viewed */
  const trackBookView = useCallback((bookId: string, category: string) => {
    addEvent({
      type: 'book_view',
      bookId,
      category,
      timestamp: Date.now(),
    });
    refresh();
  }, [refresh]);

  /** Track a book download */
  const trackDownload = useCallback((bookId: string) => {
    addEvent({
      type: 'download',
      bookId,
      timestamp: Date.now(),
    });
    refresh();
  }, [refresh]);

  /** Track a search query */
  const trackSearch = useCallback((query: string, results: number) => {
    addEvent({
      type: 'search',
      query,
      results,
      timestamp: Date.now(),
    });
    refresh();
  }, [refresh]);

  /** Track a bookmark action */
  const trackBookmark = useCallback((bookId: string, category?: string) => {
    addEvent({
      type: 'bookmark',
      bookId,
      category,
      timestamp: Date.now(),
    });
    refresh();
  }, [refresh]);

  /** Track a share action */
  const trackShare = useCallback((bookId: string) => {
    addEvent({
      type: 'share',
      bookId,
      timestamp: Date.now(),
    });
    refresh();
  }, [refresh]);

  /** Get most viewed books (optionally filtered by last N days) */
  const getPopularBooks = useCallback((days?: number): { bookId: string; views: number }[] => {
    const analytics = loadAnalytics();
    const cutoff = days ? Date.now() - days * 24 * 60 * 60 * 1000 : 0;

    const views: Record<string, number> = {};
    for (const event of analytics.events) {
      if (event.type === 'book_view' && event.bookId) {
        if (!cutoff || event.timestamp >= cutoff) {
          views[event.bookId] = (views[event.bookId] || 0) + 1;
        }
      }
    }

    return Object.entries(views)
      .map(([bookId, views]) => ({ bookId, views }))
      .sort((a, b) => b.views - a.views);
  }, []);

  /** Get most viewed categories */
  const getPopularCategories = useCallback((): { category: string; views: number }[] => {
    const analytics = loadAnalytics();

    const views: Record<string, number> = {};
    for (const event of analytics.events) {
      if (event.type === 'book_view' && event.category) {
        views[event.category] = (views[event.category] || 0) + 1;
      }
    }

    return Object.entries(views)
      .map(([category, views]) => ({ category, views }))
      .sort((a, b) => b.views - a.views);
  }, []);

  /** Get recent user activity */
  const getRecentActivity = useCallback((limit = 20): AnalyticsEvent[] => {
    const analytics = loadAnalytics();
    return [...analytics.events]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }, []);

  /** Clear all analytics data */
  const clearAnalytics = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setData({ events: [] });
  }, []);

  return {
    data,
    trackPageView,
    trackBookView,
    trackDownload,
    trackSearch,
    trackBookmark,
    trackShare,
    getPopularBooks,
    getPopularCategories,
    getRecentActivity,
    clearAnalytics,
  };
}

/* ------------------------------------------------------------------ */
/*  Standalone functions (for use outside React components)           */
/* ------------------------------------------------------------------ */

export function trackPageViewStandalone(page: string): void {
  addEvent({
    type: 'page_view',
    query: page,
    timestamp: Date.now(),
  });
}

export function trackBookViewStandalone(bookId: string, category: string): void {
  addEvent({
    type: 'book_view',
    bookId,
    category,
    timestamp: Date.now(),
  });
}

export function trackDownloadStandalone(bookId: string): void {
  addEvent({
    type: 'download',
    bookId,
    timestamp: Date.now(),
  });
}

export function trackSearchStandalone(query: string, results: number): void {
  addEvent({
    type: 'search',
    query,
    results,
    timestamp: Date.now(),
  });
}
