// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import { ENV } from '@/config/env';

const supabaseUrl = ENV.SUPABASE_URL;
const supabaseKey = ENV.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseKey && supabaseUrl.startsWith('http'));
};
