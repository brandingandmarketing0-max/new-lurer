import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lightweight middleware to block obvious bots and prefetchers from hitting API routes
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/api/')) return NextResponse.next();

  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  const purpose = (request.headers.get('purpose') || '').toLowerCase();
  const secPurpose = (request.headers.get('sec-fetch-purpose') || '').toLowerCase();

  const isBot = ua.includes('bot') || ua.includes('crawler') || ua.includes('spider') || ua.includes('headless') || ua.includes('uptime') || ua.includes('insights');
  const isPrefetch = purpose === 'prefetch' || secPurpose === 'prefetch';

  if (isBot || isPrefetch) {
    return NextResponse.json({ success: true, ignored: true }, { status: 200 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};


