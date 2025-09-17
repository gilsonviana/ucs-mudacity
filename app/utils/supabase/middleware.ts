// Deprecated helper (previous SSR cookie sync). Kept for compatibility if imported elsewhere.
import { type NextRequest, NextResponse } from 'next/server';

export const createClient = (request: NextRequest) => {
  return NextResponse.next({ request: { headers: request.headers } });
};
