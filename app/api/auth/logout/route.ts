import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { clearSessionCookie, SESSION_COOKIE } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  res.headers.append('Set-Cookie', clearSessionCookie());
  return res;
}
