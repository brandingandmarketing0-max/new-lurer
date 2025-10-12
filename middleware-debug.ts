import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isbot } from 'isbot';

// Debug middleware to see what's happening
export function middleware(request: NextRequest) {
    const { pathname, href } = request.nextUrl;
    const ua = (request.headers.get('user-agent') || '').toLowerCase();
    
    // Only debug /josh requests
    if (pathname === '/josh') {
        console.log('🔍 DEBUG - /josh request detected');
        console.log('User-Agent:', ua);
        console.log('Accept-Language:', request.headers.get('accept-language'));
        console.log('Accept-Encoding:', request.headers.get('accept-encoding'));
        console.log('Sec-Fetch-Site:', request.headers.get('sec-fetch-site'));
        console.log('isbot result:', isbot(ua));
        
        // Check for suspicious patterns
        const suspiciousPatterns = [
            'headless', 'phantom', 'selenium', 'puppeteer', 'playwright',
            'python-requests', 'curl', 'wget', 'node-fetch', 'urllib',
            'automation', 'bot', 'crawler', 'spider', 'scraper', 'scanner',
            'checker', 'monitor', 'test', 'headlesschrome', 'chromedriver',
            'webdriver', 'chrome-lighthouse', 'lighthouse', 'gtmetrix',
            'pagespeed', 'pingdom', 'uptimerobot', 'statuscake'
        ];
        
        const foundPatterns = suspiciousPatterns.filter(pattern => ua.includes(pattern));
        console.log('Found suspicious patterns:', foundPatterns);
        
        // Check for missing headers
        const missingHeaders = [];
        if (!request.headers.get('accept-language')) missingHeaders.push('accept-language');
        if (!request.headers.get('accept-encoding')) missingHeaders.push('accept-encoding');
        if (!request.headers.get('sec-fetch-site')) missingHeaders.push('sec-fetch-site');
        console.log('Missing headers:', missingHeaders);
        
        // If any suspicious patterns found, block
        if (foundPatterns.length > 0 || isbot(ua) || missingHeaders.length > 0) {
            console.log('🚫 BLOCKING: Suspicious activity detected');
            return new NextResponse('This site can\'t be reached', { status: 404 });
        } else {
            console.log('✅ ALLOWING: No suspicious activity detected');
        }
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: ['/josh'],
};

