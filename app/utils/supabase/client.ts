import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Example usage: const { data: todos } = await supabase.from('todos').select()
 */

export const createClient = () => createSupabaseClient(supabaseUrl!, supabaseKey!);
