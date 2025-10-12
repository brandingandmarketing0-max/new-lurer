import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Debug middleware to log all headers
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    if (pathname === '/josh') {
        console.log('=== REQUEST DEBUG ===');
        console.log('User-Agent:', request.headers.get('user-agent'));
        console.log('Accept-Language:', request.headers.get('accept-language'));
        console.log('Accept-Encoding:', request.headers.get('accept-encoding'));
        console.log('Sec-Fetch-Site:', request.headers.get('sec-fetch-site'));
        console.log('Sec-Fetch-Mode:', request.headers.get('sec-fetch-mode'));
        console.log('Sec-Fetch-Dest:', request.headers.get('sec-fetch-dest'));
        console.log('Sec-CH-UA:', request.headers.get('sec-ch-ua'));
        console.log('Sec-CH-UA-Mobile:', request.headers.get('sec-ch-ua-mobile'));
        console.log('Sec-CH-UA-Platform:', request.headers.get('sec-ch-ua-platform'));
        console.log('DNT:', request.headers.get('dnt'));
        console.log('Upgrade-Insecure-Requests:', request.headers.get('upgrade-insecure-requests'));
        console.log('Cache-Control:', request.headers.get('cache-control'));
        console.log('Referer:', request.headers.get('referer'));
        console.log('========================');
        
        // Block if missing critical headers
        const missingHeaders = [];
        if (!request.headers.get('sec-fetch-site')) missingHeaders.push('sec-fetch-site');
        if (!request.headers.get('sec-fetch-mode')) missingHeaders.push('sec-fetch-mode');
        if (!request.headers.get('sec-fetch-dest')) missingHeaders.push('sec-fetch-dest');
        if (!request.headers.get('sec-ch-ua')) missingHeaders.push('sec-ch-ua');
        
        if (missingHeaders.length > 0) {
            console.log('BLOCKING - Missing headers:', missingHeaders);
            return new NextResponse('This site can\'t be reached', { status: 404 });
        } else {
            console.log('ALLOWING - All headers present');
        }
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: ['/josh'],
};
