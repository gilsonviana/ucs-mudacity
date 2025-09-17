import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE } from '@/lib/auth/session';
import { getAdminClient } from '@/app/utils/supabase/admin';

export const runtime = 'nodejs';

export async function DELETE(req: NextRequest, { params }: { params: { uf: string } }) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const uf = params.uf?.toUpperCase();
  if (!/^[A-Z]{2}$/.test(uf)) return NextResponse.json({ error: 'UF inválida' }, { status: 400 });
  const client = getAdminClient();
  const { error } = await client
    .from('Favoritos')
    .delete()
    .eq('uf', uf)
    .eq('user_id', session.uid);
  if (error) return NextResponse.json({ error: 'Erro ao remover' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
