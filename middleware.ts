import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE } from '@/lib/auth/session';

const PROTECTED_PREFIXES = ['/pesquisa', '/favoritos'];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  const isProtected = PROTECTED_PREFIXES.some(p => url.pathname === p || url.pathname.startsWith(p + '/'));
  const isAuthPage = url.pathname === '/';

  if (isProtected && !session) {
    url.pathname = '/';
    url.searchParams.set('unauth', '1');
    return NextResponse.redirect(url);
  }

  if (isAuthPage && session) {
    url.pathname = '/pesquisa';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)'],
};
