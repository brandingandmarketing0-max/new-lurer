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

    // Check for iOS Instagram - getallmylinks.com style redirect
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isInstagram = /instagram/.test(ua);
    const isTest123 = pathname === '/test123' || pathname.startsWith('/test123/');
    
    if (isTest123 && isIOS && isInstagram) {
      // Check if this is the redirect attempt (has _r parameter)
      const hasRedirectParam = request.nextUrl.searchParams.has('_r');
      
      if (!hasRedirectParam) {
        // First visit - return minimal HTML that redirects after 2 seconds
        // getallmylinks.com style: simple page with immediate redirect
        const redirectUrl = `${request.nextUrl.origin}${pathname}?_r=${Date.now()}`;
        
        // Use HTTP 302 redirect with delay via meta refresh
        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content="2;url=${redirectUrl}">
    <title>Redirecting...</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #000;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            text-align: center;
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255,255,255,0.3);
            border-top-color: #fff;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div>
        <div class="spinner"></div>
        <p style="font-size: 14px; opacity: 0.8;">Opening...</p>
    </div>
    <script>
        (function() {
            var target = '${redirectUrl}';
            var urlWithoutProtocol = target.replace(/^https?:\/\//, '');
            
            // PRIMARY: Use Safari URL schemes (works on iOS 15/17/18, macOS)
            var xSafariScheme = 'x-safari-https://' + urlWithoutProtocol;
            var legacyScheme = 'com-apple-mobilesafari-tab:' + target;
            
            // Try newer scheme first (iOS 15/17/18, macOS)
            setTimeout(function() {
                try { window.location.href = xSafariScheme; } catch(e) {}
            }, 2000);
            
            // Try legacy scheme (older iOS, iOS 16)
            setTimeout(function() {
                try { window.location.href = legacyScheme; } catch(e) {}
            }, 2500);
            
            // Fallback: Normal redirect if Safari schemes don't work
            setTimeout(function() {
                try { window.location.href = target; } catch(e) {}
            }, 3000);
            
            // Backup methods
            setTimeout(function() {
                try { window.location.replace(target); } catch(e) {}
            }, 3100);
            
            setTimeout(function() {
                try { 
                    var w = window.open(target, '_blank', 'noopener,noreferrer');
                    if (w) w.focus();
                } catch(e) {}
            }, 3200);
        })();
    </script>
</body>
</html>`;
        
        return new NextResponse(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
            'X-Frame-Options': 'SAMEORIGIN',
          },
        });
      } else {
        // Second visit with _r parameter - let it through to the page
        // The HTTP redirect from first visit should have triggered Safari
        // If we're still in webview, the page will handle final redirect
        return NextResponse.next();
      }
    }

    // Protected paths (Phase 1)
    const protectedPaths = ['/josh', '/m8d1son', '/rachelirl', '/petitelils', '/scarletxroseeevip', '/bellapetitie', '/littlelouxxx', '/abbiehall', '/abby', '/aimee', '/alaska', '/alfrileyyy', '/alicia', '/amyleigh', '/amberr', '/amymaxwell', '/babyscarlet', '/bethjefferson', '/Blondestud69', '/brooke', '/brooke_xox', '/brookex', '/caitlinteex', '/chloeayling', '/chloeelizabeth', '/chloeinskip', '/chloetami', '/chxrli_love', '/cowgurlkacey', '/dominika', '/ellejean', '/em', '/emily9999x', '/erinhannahxx', '/fitnessblonde', '/freya', '/georgiaaa', '/grace', '/hannah', '/jason', '/jen', '/kaceymay', '/katerina', '/kayley', '/keiramaex', '/kimbo_bimbo', '/kxceyrose', '/laurdunne', '/laylaasoyoung', '/laylasoyoung', '/libby', '/lily', '/lou', '/lsy', '/maddison', '/maddysmith111x', '/megann', '/michaelajayneex', '/missbrown', '/misssophiaisabella', '/morgan', '/noreilly75', '/novaskyee90', '/ollie', '/onlyjessxrose', '/paigexb', '/poppy', '/rachel', '/rachsotiny', '/robynnparkerr', '/sel', '/simplesimon8', '/skye', '/steff', '/sxmmermae', '/victoria', '/wackojacko69', '/petiteirishprincessxxx', '/prettygreeneyesxx', '/daddybearvlc', '/shellyhunterxo', '/tashacatton17'];
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
        '/test123', '/test123/:path*',
        '/josh', '/josh/:path*',
        '/m8d1son', '/m8d1son/:path*',
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
        '/caitlinteex', '/caitlinteex/:path*',
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
        '/katerina', '/katerina/:path*',
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
        '/simplesimon8', '/simplesimon8/:path*',
        '/sel', '/sel/:path*',
        '/skye', '/skye/:path*',
        '/steff', '/steff/:path*',
        '/sxmmermae', '/sxmmermae/:path*',
        '/victoria', '/victoria/:path*',
        '/wackojacko69', '/wackojacko69/:path*',
        '/daddybearvlc', '/daddybearvlc/:path*',
        '/shellyhunterxo', '/shellyhunterxo/:path*',
        '/tashacatton17', '/tashacatton17/:path*'
    ],
};


