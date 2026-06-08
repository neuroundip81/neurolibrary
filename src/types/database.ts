export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string;
          title: string;
          author: string;
          category_id: string | null;
          category_slug: string | null;
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
        };
        Insert: { [K in keyof Database['public']['Tables']['books']['Row']]?: Database['public']['Tables']['books']['Row'][K] };
        Update: Partial<Database['public']['Tables']['books']['Row']>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          gradient: string | null;
          book_count: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: { [K in keyof Database['public']['Tables']['categories']['Row']]?: Database['public']['Tables']['categories']['Row'][K] };
        Update: Partial<Database['public']['Tables']['categories']['Row']>;
      };
      downloads: {
        Row: {
          id: string;
          book_id: string | null;
          user_id: string | null;
          downloaded_at: string | null;
        };
        Insert: { [K in keyof Database['public']['Tables']['downloads']['Row']]?: Database['public']['Tables']['downloads']['Row'][K] };
        Update: Partial<Database['public']['Tables']['downloads']['Row']>;
      };
      ratings: {
        Row: {
          id: string;
          book_id: string | null;
          user_id: string | null;
          rating: number | null;
          review: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: { [K in keyof Database['public']['Tables']['ratings']['Row']]?: Database['public']['Tables']['ratings']['Row'][K] };
        Update: Partial<Database['public']['Tables']['ratings']['Row']>;
      };
      bookmarks: {
        Row: {
          id: string;
          book_id: string | null;
          user_id: string | null;
          created_at: string | null;
        };
        Insert: { [K in keyof Database['public']['Tables']['bookmarks']['Row']]?: Database['public']['Tables']['bookmarks']['Row'][K] };
        Update: Partial<Database['public']['Tables']['bookmarks']['Row']>;
      };
      reading_history: {
        Row: {
          id: string;
          book_id: string | null;
          user_id: string | null;
          progress: number | null;
          last_read_at: string | null;
        };
        Insert: { [K in keyof Database['public']['Tables']['reading_history']['Row']]?: Database['public']['Tables']['reading_history']['Row'][K] };
        Update: Partial<Database['public']['Tables']['reading_history']['Row']>;
      };
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          specialty: string | null;
          institution: string | null;
          avatar_url: string | null;
          role: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: { [K in keyof Database['public']['Tables']['profiles']['Row']]?: Database['public']['Tables']['profiles']['Row'][K] };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
    };
  };
}
