import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  const sb = getSupabase();
  if (!sb) return NextResponse.json([]);
  try {
    const { data, error } = await sb
      .from('buttons')
      .select('*')
      .eq('is_active', true)
      .order('position', { ascending: true });
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
