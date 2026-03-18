import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

let _client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (_client) return _client;
  if (!supabaseUrl || !supabaseKey) return null;
  _client = createClient(supabaseUrl, supabaseKey);
  return _client;
}
