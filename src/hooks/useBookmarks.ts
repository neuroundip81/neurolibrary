import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useLocalStorage<string[]>('neurolibrary-bookmarks', []);

  const isBookmarked = useCallback(
    (bookId: string) => bookmarks.includes(bookId),
    [bookmarks],
  );

  const toggleBookmark = useCallback(
    (bookId: string) => {
      setBookmarks((prev) => {
        if (prev.includes(bookId)) {
          return prev.filter((id) => id !== bookId);
        }
        return [...prev, bookId];
      });
      return !bookmarks.includes(bookId);
    },
    [bookmarks, setBookmarks],
  );

  const addBookmark = useCallback(
    (bookId: string) => {
      setBookmarks((prev) => {
        if (prev.includes(bookId)) return prev;
        return [...prev, bookId];
      });
    },
    [setBookmarks],
  );

  const removeBookmark = useCallback(
    (bookId: string) => {
      setBookmarks((prev) => prev.filter((id) => id !== bookId));
    },
    [setBookmarks],
  );

  const bookmarkCount = bookmarks.length;

  return {
    bookmarks,
    bookmarkCount,
    isBookmarked,
    toggleBookmark,
    addBookmark,
    removeBookmark,
  };
}
