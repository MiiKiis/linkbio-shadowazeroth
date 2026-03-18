import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

const sanitizeButton = (body: any) => ({
  title:      String(body.title     || '').slice(0, 200),
  subtitle:   String(body.subtitle  || '').slice(0, 300),
  url:        String(body.url       || '').slice(0, 2000),
  icon_name:  String(body.icon_name || 'link').slice(0, 50),
  image_url:  String(body.image_url || '').slice(0, 2000),
  btn_style:  String(body.btn_style || 'default').slice(0, 50),
  color:      String(body.color     || '#7b2ff7').slice(0, 20),
  position:   parseInt(body.position) || 0,
  is_active:  Boolean(body.is_active),
  is_primary: Boolean(body.is_primary),
});

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: 'Supabase no disponible' }, { status: 503 });
  try {
    const { data, error } = await sb
      .from('buttons')
      .select('*')
      .order('position', { ascending: true });
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: 'Supabase no disponible' }, { status: 503 });
  try {
    const body = await req.json();
    const { data, error } = await sb
      .from('buttons')
      .insert(sanitizeButton(body))
      .select()
      .single();
    if (error) throw error;
    revalidatePath('/');
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
