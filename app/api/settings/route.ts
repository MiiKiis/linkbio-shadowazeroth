import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: 'Supabase no disponible' }, { status: 503 });
  try {
    const { data, error } = await sb.from('admin_settings').select('*').eq('id', 1).single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: 'Supabase no disponible' }, { status: 503 });
  try {
    const {
      site_name, site_tagline, admin_password,
      avatar_url, server_status, footer_text,
      particle_color_1, particle_color_2, background_url
    } = await req.json();

    const updateData: any = {};
    if (site_name !== undefined) updateData.site_name = site_name;
    if (site_tagline !== undefined) updateData.site_tagline = site_tagline;
    if (admin_password !== undefined) updateData.admin_password = admin_password;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (server_status !== undefined) updateData.server_status = server_status;
    if (footer_text !== undefined) updateData.footer_text = footer_text;
    if (particle_color_1 !== undefined) updateData.particle_color_1 = particle_color_1;
    if (particle_color_2 !== undefined) updateData.particle_color_2 = particle_color_2;
    if (background_url !== undefined) updateData.background_url = background_url;

    const { data, error } = await sb
      .from('admin_settings')
      .update(updateData)
      .eq('id', 1)
      .select()
      .single();

    if (error) {
      if (error.code === '42703') {
        return NextResponse.json({ 
          error: 'Faltan columnas en la base de datos. Por favor, ejecuta el script db_update_v2.sql en el panel SQL de Supabase.' 
        }, { status: 400 });
      }
      throw error;
    }

    revalidatePath('/');
    return NextResponse.json(data);
  } catch (e: any) {
    console.error('API Settings Error:', e);
    return NextResponse.json({ error: e.message || 'Error interno del servidor' }, { status: 500 });
  }
}

