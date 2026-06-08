export type BookFormat = 'PDF' | 'DOC' | 'DOCX' | 'PPT' | 'PPTX' | 'XLS' | 'XLSX';

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  categorySlug: string;
  description: string;
  coverImage: string;
  format: BookFormat;
  rating: number;
  ratingCount: number;
  downloads: number;
  year: number;
  pages: number;
  isbn: string;
  publisher: string;
  language: string;
  featured: boolean;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  bookCount: number;
  gradient: string;
}

export interface Comment {
  id: string;
  bookId: string;
  userName: string;
  userAvatar: string;
  content: string;
  rating: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  joinDate: string;
  bookmarks: string[];
  readingHistory: ReadingHistoryItem[];
}

export interface ReadingHistoryItem {
  bookId: string;
  readAt: string;
  progress: number;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

export interface FilterState {
  search: string;
  category: string;
  sortBy: 'newest' | 'popular' | 'rating' | 'az';
}

// ===== Supabase-related types =====

export interface BookWithCategory {
  id: string;
  title: string;
  author: string;
  category_id: string | null;
  category_slug: string | null;
  category_name?: string | null;
  publisher: string | null;
  year: number | null;
  pages: number | null;
  isbn: string | null;
  language: string | null;
  synopsis: string | null;
  table_of_contents: string[] | null;
  tags: string[] | null;
  cover_image: string | null;
  file_url: string | null;
  file_format: string | null;
  featured: boolean | null;
  rating: number | null;
  rating_count: number | null;
  download_count: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface BookRating {
  id: string;
  book_id: string | null;
  user_id: string | null;
  user_name?: string | null;
  user_avatar?: string | null;
  rating: number | null;
  review: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DownloadRecord {
  id: string;
  book_id: string | null;
  book_title?: string | null;
  user_id: string | null;
  downloaded_at: string | null;
}

export interface BookmarkRecord {
  id: string;
  book_id: string | null;
  user_id: string | null;
  created_at: string | null;
}

export interface ReadingHistoryRecord {
  id: string;
  book_id: string | null;
  user_id: string | null;
  progress: number | null;
  last_read_at: string | null;
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  specialty: string | null;
  institution: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface BookQueryParams {
  search?: string;
  category?: string;
  sortBy?: 'newest' | 'popular' | 'rating' | 'az';
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
