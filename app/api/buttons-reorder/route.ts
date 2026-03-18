import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: 'Supabase no disponible' }, { status: 503 });
  try {
    const updates: { id: string; position: number }[] = await req.json();
    await Promise.all(
      updates.map(({ id, position }) =>
        sb.from('buttons').update({ position }).eq('id', id)
      )
    );
    revalidatePath('/');
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
