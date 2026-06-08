import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { categories as localCategories } from '@/data/categories';
import type { Database } from '@/types/database';

export type CategoryRow = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

function toLocalCategories(): CategoryRow[] {
  return localCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    icon: c.icon,
    gradient: c.gradient,
    book_count: c.bookCount,
    created_at: null,
    updated_at: null,
  }));
}

export async function getCategories(): Promise<CategoryRow[]> {
  if (!isSupabaseConfigured()) {
    return toLocalCategories();
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return (data as CategoryRow[]) || [];
  } catch (err) {
    console.error('getCategories error:', err);
    return toLocalCategories();
  }
}

export async function getCategoryBySlug(slug: string): Promise<CategoryRow | null> {
  if (!isSupabaseConfigured()) {
    return toLocalCategories().find((c) => c.slug === slug) || null;
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data as CategoryRow | null;
  } catch (err) {
    console.error('getCategoryBySlug error:', err);
    return null;
  }
}

export async function createCategory(
  category: CategoryInsert
): Promise<CategoryRow | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured: cannot create category');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data as CategoryRow | null;
  } catch (err) {
    console.error('createCategory error:', err);
    return null;
  }
}

export async function updateCategory(
  id: string,
  category: CategoryUpdate
): Promise<CategoryRow | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured: cannot update category');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .update({ ...category, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CategoryRow | null;
  } catch (err) {
    console.error('updateCategory error:', err);
    return null;
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured: cannot delete category');
    return false;
  }

  try {
    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deleteCategory error:', err);
    return false;
  }
}
