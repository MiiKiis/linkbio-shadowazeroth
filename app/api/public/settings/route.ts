import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  const sb = getSupabase();
  if (!sb) return NextResponse.json({});
  try {
    const { data, error } = await sb
      .from('admin_settings')
      .select('site_name, site_tagline, avatar_url, server_status, footer_text, particle_color_1, particle_color_2, background_url')
      .eq('id', 1)
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
