import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE } from '@/lib/auth/session';
import { getAdminClient } from '@/app/utils/supabase/admin';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const client = getAdminClient();
  const { data, error } = await client
    .from('Favoritos')
    .select('uf,nome,created_at')
    .eq('user_id', session.uid)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'Erro ao buscar favoritos' }, { status: 500 });
  const res = NextResponse.json({ items: data });
  // User-specific data: mark private; allow revalidation after 24h but encourage client re-fetch after mutations
  res.headers.set('Cache-Control', 'private, max-age=60, s-maxage=0');
  return res;
}

export async function POST(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON inválido' }, { status: 400 }); }
  const { uf, nome } = body || {};
  if (typeof uf !== 'string' || typeof nome !== 'string') return NextResponse.json({ error: 'Campos inválidos' }, { status: 400 });
  const cleanedUf = uf.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(cleanedUf)) return NextResponse.json({ error: 'UF inválida' }, { status: 400 });
  const client = getAdminClient();
  // Check existing
  const { data: existing } = await client
    .from('Favoritos')
    .select('uf')
    .eq('user_id', session.uid)
    .eq('uf', cleanedUf)
    .maybeSingle();
  if (existing) return NextResponse.json({ error: 'Já existente' }, { status: 409 });
  const { error: insertError, data } = await client
    .from('Favoritos')
    .insert({ uf: cleanedUf, nome, user_id: session.uid })
    .select('uf,nome,created_at')
    .single();
  if (insertError) return NextResponse.json({ error: 'Erro ao inserir' }, { status: 500 });
  // Do not cache mutations
  const res = NextResponse.json({ item: data }, { status: 201 });
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

export async function DELETE(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const client = getAdminClient();
  const { error } = await client.from('Favoritos').delete().eq('user_id', session.uid);
  if (error) return NextResponse.json({ error: 'Erro ao remover' }, { status: 500 });
  const res = NextResponse.json({ ok: true });
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
