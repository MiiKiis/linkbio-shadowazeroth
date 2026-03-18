import { NextRequest } from 'next/server';
import { createHmac } from 'crypto';

export function getAdminToken(): string {
  const pwd = process.env.ADMIN_PASSWORD || 'default_fallback';
  // Genera un token consistente usando HMAC que no cambiará entre reinicios/workers de Next.js
  return createHmac('sha256', 'shadow-azeroth-secret').update(pwd).digest('hex');
}

export function requireAdmin(req: NextRequest): boolean {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '').trim();
  return token === getAdminToken();
}
