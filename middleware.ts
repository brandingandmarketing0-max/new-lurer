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
    const protectedPaths = ['/josh', '/rachelirl', '/petitelils', '/scarletxroseeevip', '/bellapetitie', '/littlelouxxx', '/abbiehall', '/abby', '/aimee', '/alaska', '/alfrileyyy', '/alicia', '/amyleigh', '/amberr', '/amymaxwell', '/babyscarlet', '/bethjefferson', '/Blondestud69', '/brooke', '/brooke_xox', '/brookex', '/chloeayling', '/chloeelizabeth', '/chloeinskip', '/chloetami', '/chxrli_love', '/cowgurlkacey', '/dominika', '/ellejean', '/em', '/emily9999x', '/erinhannahxx', '/fitnessblonde', '/freya', '/georgiaaa', '/grace', '/hannah', '/jason', '/jen', '/kaceymay', '/kayley', '/keiramaex', '/kimbo_bimbo', '/kxceyrose', '/laurdunne', '/laylaasoyoung', '/laylasoyoung', '/libby', '/lily', '/lou', '/lsy', '/maddison', '/maddysmith111x', '/megann', '/michaelajayneex', '/missbrown', '/misssophiaisabella', '/morgan', '/noreilly75', '/novaskyee90', '/ollie', '/onlyjessxrose', '/paigexb', '/poppy', '/rachel', '/rachsotiny', '/robynnparkerr', '/sel', '/skye', '/steff', '/sxmmermae', '/victoria', '/wackojacko69', '/petiteirishprincessxxx', '/prettygreeneyesxx'];
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
    
    // Social media bot detection - block Instagram, Facebook, WhatsApp, Telegram crawlers
    const isSocialMediaBot = ua.includes('facebookexternalhit') || ua.includes('instagrambot') || ua.includes('whatsapp') || ua.includes('telegrambot') || ua.includes('twitterbot') || ua.includes('linkedinbot') || ua.includes('skypeuripreview') || ua.includes('slackbot');
    
    console.log(`🤖 Enhanced Bot Detection: ${pathname} - isKnownBot: ${isKnownBot} - hasObviousBotUA: ${hasObviousBotUA} - hasSuspiciousUA: ${hasSuspiciousUA} - hasAutomationUA: ${hasAutomationUA} - hasEmptyUA: ${hasEmptyUA} - hasSuspiciousHeaders: ${hasSuspiciousHeaders} - hasBotPatterns: ${hasBotPatterns} - hasCrawlerPatterns: ${hasCrawlerPatterns} - isSocialMediaBot: ${isSocialMediaBot}`);
    
    // If any bot indicators detected → return Google-style error page
    if (isKnownBot || hasObviousBotUA || hasSuspiciousUA || hasAutomationUA || hasEmptyUA || hasSuspiciousHeaders || hasBotPatterns || hasCrawlerPatterns || isSocialMediaBot) {
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
    matcher: [
        '/api/:path*',
        '/josh', '/josh/:path*',
        '/rachelirl', '/rachelirl/:path*',
        '/petitelils', '/petitelils/:path*',
        '/scarletxroseeevip', '/scarletxroseeevip/:path*',
        '/bellapetitie', '/bellapetitie/:path*',
        '/littlelouxxx', '/littlelouxxx/:path*',
        '/abbiehall', '/abbiehall/:path*',
        '/abby', '/abby/:path*',
        '/aimee', '/aimee/:path*',
        '/alaska', '/alaska/:path*',
        '/alfrileyyy', '/alfrileyyy/:path*',
        '/alicia', '/alicia/:path*',
        '/amyleigh', '/amyleigh/:path*',
        '/amberr', '/amberr/:path*',
        '/amymaxwell', '/amymaxwell/:path*',
        '/babyscarlet', '/babyscarlet/:path*',
        '/bethjefferson', '/bethjefferson/:path*',
        '/Blondestud69', '/Blondestud69/:path*',
        '/brooke', '/brooke/:path*',
        '/brooke_xox', '/brooke_xox/:path*',
        '/brookex', '/brookex/:path*',
        '/chloeayling', '/chloeayling/:path*',
        '/chloeelizabeth', '/chloeelizabeth/:path*',
        '/chloeinskip', '/chloeinskip/:path*',
        '/petiteirishprincessxxx', '/petiteirishprincessxxx/:path*',
        '/chloetami', '/chloetami/:path*',
        '/chxrli_love', '/chxrli_love/:path*',
        '/cowgurlkacey', '/cowgurlkacey/:path*',
        '/dominika', '/dominika/:path*',
        '/ellejean', '/ellejean/:path*',
        '/em', '/em/:path*',
        '/emily9999x', '/emily9999x/:path*',
        '/erinhannahxx', '/erinhannahxx/:path*',
        '/fitnessblonde', '/fitnessblonde/:path*',
        '/freya', '/freya/:path*',
        '/georgiaaa', '/georgiaaa/:path*',
        '/grace', '/grace/:path*',
        '/hannah', '/hannah/:path*',
        '/jason', '/jason/:path*',
        '/jen', '/jen/:path*',
        '/kaceymay', '/kaceymay/:path*',
        '/kayley', '/kayley/:path*',
        '/keiramaex', '/keiramaex/:path*',
        '/kimbo_bimbo', '/kimbo_bimbo/:path*',
        '/kxceyrose', '/kxceyrose/:path*',
        '/laurdunne', '/laurdunne/:path*',
        '/laylaasoyoung', '/laylaasoyoung/:path*',
        '/laylasoyoung', '/laylasoyoung/:path*',
        '/libby', '/libby/:path*',
        '/lily', '/lily/:path*',
        '/lou', '/lou/:path*',
        '/lsy', '/lsy/:path*',
        '/maddison', '/maddison/:path*',
        '/maddysmith111x', '/maddysmith111x/:path*',
        '/megann', '/megann/:path*',
        '/michaelajayneex', '/michaelajayneex/:path*',
        '/missbrown', '/missbrown/:path*',
        '/misssophiaisabella', '/misssophiaisabella/:path*',
        '/morgan', '/morgan/:path*',
        '/noreilly75', '/noreilly75/:path*',
        '/novaskyee90', '/novaskyee90/:path*',
        '/ollie', '/ollie/:path*',
        '/onlyjessxrose', '/onlyjessxrose/:path*',
        '/paigexb', '/paigexb/:path*',
        '/poppy', '/poppy/:path*',
        '/rachel', '/rachel/:path*',
        '/rachsotiny', '/rachsotiny/:path*',
        '/robynnparkerr', '/robynnparkerr/:path*',
        '/sel', '/sel/:path*',
        '/skye', '/skye/:path*',
        '/steff', '/steff/:path*',
        '/sxmmermae', '/sxmmermae/:path*',
        '/victoria', '/victoria/:path*',
        '/wackojacko69', '/wackojacko69/:path*'
    ],
};


