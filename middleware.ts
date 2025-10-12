import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isbot } from 'isbot';

// Middleware: API bot/prefetch mitigation + page-level bot/crawler hard block with JS cookie gate
export function middleware(request: NextRequest) {
    const { pathname, href } = request.nextUrl;
    const ua = (request.headers.get('user-agent') || '').toLowerCase();
    const purpose = (request.headers.get('purpose') || '').toLowerCase();
    const secPurpose = (request.headers.get('sec-fetch-purpose') || '').toLowerCase();

    // Always allow Next internals and static assets
    if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.startsWith('/assets') || pathname.startsWith('/public')) {
        return NextResponse.next();
    }

    // Existing API route protection: ignore obvious bots and prefetchers
    if (pathname.startsWith('/api/')) {
        const isObviousBot = ua.includes('bot') || ua.includes('crawler') || ua.includes('spider') || ua.includes('headless') || ua.includes('uptime') || ua.includes('insights');
        const isPrefetch = purpose === 'prefetch' || secPurpose === 'prefetch';
        if (isObviousBot || isPrefetch) {
            return NextResponse.json({ success: true, ignored: true }, { status: 200 });
        }
        return NextResponse.next();
    }

    // Protected paths (Phase 1)
    const protectedPaths = ['/josh', '/rachelirl', '/petitelils', '/scarletxroseeevip', '/bellapetitie', '/littlelouxxx'];
    const isProtected = protectedPaths.some(p => pathname === p || pathname.startsWith(p + '/'));

    // Debug logging
    console.log(`🔍 Middleware: ${pathname} - Protected: ${isProtected} - UA: ${ua.substring(0, 50)}...`);

    if (!isProtected) {
        return NextResponse.next();
    }

    // Enhanced bot detection - block obvious bots and suspicious patterns
    const isKnownBot = isbot(ua);
    const hasObviousBotUA = ua.includes('bot') || ua.includes('crawler') || ua.includes('spider') || ua.includes('scraper');
    const hasSuspiciousUA = ua.includes('headless') || ua.includes('phantom') || ua.includes('selenium') || ua.includes('webdriver') || ua.includes('puppeteer') || ua.includes('playwright') || ua.includes('chrome-lighthouse') || ua.includes('lighthouse');
    const hasAutomationUA = ua.includes('automation') || ua.includes('test') || ua.includes('scraper') || ua.includes('extractor') || ua.includes('parser') || ua.includes('monitor') || ua.includes('checker') || ua.includes('scanner');
    const hasEmptyUA = !ua || ua.length < 10;
    const hasSuspiciousHeaders = purpose === 'prefetch' || secPurpose === 'prefetch' || purpose === 'preconnect';
    const hasBotPatterns = ua.includes('python') || ua.includes('requests') || ua.includes('urllib') || ua.includes('curl') || ua.includes('wget') || ua.includes('httpie');
    const hasCrawlerPatterns = ua.includes('crawl') || ua.includes('spider') || ua.includes('bot') || ua.includes('crawler') || ua.includes('scraper') || ua.includes('harvester');
    
    console.log(`🤖 Enhanced Bot Detection: ${pathname} - isKnownBot: ${isKnownBot} - hasObviousBotUA: ${hasObviousBotUA} - hasSuspiciousUA: ${hasSuspiciousUA} - hasAutomationUA: ${hasAutomationUA} - hasEmptyUA: ${hasEmptyUA} - hasSuspiciousHeaders: ${hasSuspiciousHeaders} - hasBotPatterns: ${hasBotPatterns} - hasCrawlerPatterns: ${hasCrawlerPatterns}`);
    
    // If any bot indicators detected → return Google-style error page
    if (isKnownBot || hasObviousBotUA || hasSuspiciousUA || hasAutomationUA || hasEmptyUA || hasSuspiciousHeaders || hasBotPatterns || hasCrawlerPatterns) {
        console.log(`🚫 BLOCKING BOT: ${pathname} - ${ua.substring(0, 50)}...`);
        const errorHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>This site can't be reached</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #fff; }
        .error-container { max-width: 600px; margin: 0 auto; }
        .error-title { color: #5f6368; font-size: 20px; margin-bottom: 16px; }
        .error-message { color: #5f6368; font-size: 14px; line-height: 1.5; }
        .error-code { color: #5f6368; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-title">This site can't be reached</div>
        <div class="error-message">
            The webpage at <strong>${href}</strong> might be temporarily down or it may have moved permanently to a new web address.
        </div>
        <div class="error-code">ERR_QUIC_PROTOCOL_ERROR</div>
    </div>
</body>
</html>`;
        return new NextResponse(errorHtml, { 
            status: 404,
            headers: { 
                'Content-Type': 'text/html',
                'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
    }
    
    // No more human-check redirect; allow request to proceed.
    // Client-side BotD on protected pages will decide to block/allow.

    return NextResponse.next();
}

export const config = {
    // Intercept API routes and the protected pages
    matcher: ['/api/:path*', '/josh', '/josh/:path*', '/rachelirl', '/rachelirl/:path*', '/petitelils', '/petitelils/:path*', '/scarletxroseeevip', '/scarletxroseeevip/:path*', '/bellapetitie', '/bellapetitie/:path*', '/littlelouxxx', '/littlelouxxx/:path*'],
};


