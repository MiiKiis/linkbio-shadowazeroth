import { NextRequest, NextResponse } from 'next/server';
import { getAdminToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json({ ok: false, error: 'ADMIN_PASSWORD no configurado en .env.local' }, { status: 500 });
  }
  if (!password || password !== adminPassword) {
    return NextResponse.json({ ok: false, error: 'Contraseña incorrecta' }, { status: 401 });
  }
  return NextResponse.json({ ok: true, token: getAdminToken() });
}
