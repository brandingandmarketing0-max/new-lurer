# Protection Guide

This document explains the protection mechanisms recently added to this app and provides step-by-step instructions to reuse them in other projects.

## Overview

- Bot and crawler protection in `middleware.ts` using multi‑signal detection (User‑Agent heuristics, headers, `isbot`) and a hard 404 HTML response for suspected bots.
- API route prefetch/bot mitigation that returns a benign JSON for obvious bots/prefetchers, avoiding expensive backend work.
- Optional debug middlewares to inspect headers and detection results.
- Client-side route protection for analytics pages via `ProtectedRoute` and Supabase auth in `use-auth`.

## Components

### 1) Next.js Middleware: Bot and Crawler Protection

Key file: `lure/middleware.ts`

Highlights:
- Skips internal/static assets (`/_next`, `/favicon`, `/assets`, `/public`).
- For `/api/*`, short-circuits obvious bots and prefetch requests.
- Defines a list of protected paths and applies enhanced detection only to those paths to limit false positives site‑wide.
- Uses `isbot` plus numerous UA/header heuristics (headless/automation tools, social bots, Python/curl/urllib/wget, Lighthouse/GTMetrix, etc.).
- If flagged, returns a Google‑style 404 HTML with `X-Robots-Tag: noindex` and no-cache headers.

Add/extend protected paths by updating `protectedPaths` and `config.matcher` in `middleware.ts`.

### 2) Debug Middlewares (Optional)

Files:
- `lure/middleware-debug.ts` – Logs UA and common headers, basic pattern checks; blocks when suspicious.
- `lure/middleware-debug-headers.ts` – Logs a wide set of request headers; blocks if critical headers are missing.

These are useful for verifying how requests look from different clients and tuning heuristics. Use only in dev environments or on specific routes.

### 3) Client-side Auth Guard for Analytics Pages

Files:
- `lure/components/auth/protected-route.tsx` – Simple guard component that renders a login form or redirects to `/login` when unauthenticated.
- `lure/hooks/use-auth.ts` and `lure/lib/supabase.ts` – Supabase client and auth state management (persisted session, auto-refresh), exposing `isAuthenticated`.

Usage pattern for protected pages (example analytics pages across `lure/app/**/analytics/page.tsx`):

```tsx
export default function ExampleAnalyticsPage() {
  return (
    <ProtectedRoute>
      <ExampleAnalyticsContent />
    </ProtectedRoute>
  );
}
```

### 4) Client-side Bot Detection (FingerprintJS BotD)

We also run a client-side bot check at first render using FingerprintJS BotD. If a request passes middleware but BotD determines it is a bot, we redirect to `/blocked` before rendering sensitive content.

Where used: multiple pages such as `lure/app/brookex/page.tsx`, `lure/app/fitnessblonde/page.tsx`, `lure/app/testing/page.tsx`, etc.

Install:
```bash
pnpm add @fingerprintjs/botd
# or: npm i @fingerprintjs/botd / yarn add @fingerprintjs/botd
```

Basic usage pattern:
```tsx
import { useEffect, useState } from 'react'
import { load } from '@fingerprintjs/botd'

export default function ProtectedContent() {
  const [botDetectionComplete, setBotDetectionComplete] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const botd = await load({ monitoring: false })
        const result = await botd.detect()
        if (result.bot === true) {
          window.location.replace('/blocked')
          return
        }
        setBotDetectionComplete(true)
      } catch (e) {
        console.error('BotD failed, allowing user:', e)
        setBotDetectionComplete(true)
      }
    })()
  }, [])

  if (!botDetectionComplete) return null // or show lightweight skeleton
  return <ActualSensitiveUI />
}
```

Notes:
- Run BotD as early as possible (in a top-level `useEffect`) and gate content until it completes.
- Keep a simple fallback (do not permanently block on detection failure).
- Middleware handles many bots; BotD adds a second line of defense in the browser for anything that slips past.

## How Detection Works (Middleware)

Signals used:
- `isbot(ua)` for known bot signatures
- UA substrings: `bot`, `crawler`, `spider`, `scraper`, headless automation stacks (`selenium`, `webdriver`, `puppeteer`, `playwright`, `phantom`), synthetic tools (`curl`, `wget`, `python`, `requests`, `urllib`, `httpie`)
- Performance tools: `chrome-lighthouse`, `lighthouse`, `gtmetrix`, common status/uptime/monitor signatures
- Social media crawlers: `facebookexternalhit`, `instagrambot`, `whatsapp`, `telegrambot`, `twitterbot`, `linkedinbot`, `slackbot`, `skyeuripreview`
- Suspicious/missing headers: `purpose` or `sec-fetch-purpose` set to `prefetch`/`preconnect`; very short/empty UA

Action:
- Any positive signal on a protected path → return a 404 HTML response with search-engine blocking headers.
- Otherwise allow and let the page render.

## Porting to Another Next.js App

Follow these steps in your target project (Next.js 13+ with middleware support):

1. Install dependencies
```bash
pnpm add isbot
# or: npm i isbot / yarn add isbot
```

2. Create `middleware.ts` at project root and copy the core logic
- Bring over the `isbot` import and detection heuristics.
- Add your list of `protectedPaths`.
- Include a `config.matcher` that targets `/api/:path*` and your protected paths (e.g., `/yourPage`, `/yourPage/:path*`).
- Ensure you continue to bypass `/_next`, `/favicon`, `/assets`, `/public`.

3. Verify runtime
- This middleware runs at the edge in Next.js by default; no special config is required.
- If you use custom server runtimes, ensure middleware is enabled.

4. Auth guard (optional but recommended for dashboards)
- Add `ProtectedRoute` and an auth state hook (`useAuth`) similar to `lure/components/auth/protected-route.tsx` and `lure/hooks/use-auth.ts`.
- If you use Supabase:
  - Create `lib/supabase.ts` akin to `lure/lib/supabase.ts`.
  - Add `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - Wrap your analytics pages/components with `<ProtectedRoute>`.
- If you use another auth provider, adapt `useAuth` to expose `isAuthenticated` and loading state.

5. Testing and Tuning
- Use the debug middlewares to log headers and UA patterns during testing.
- Test from:
  - Real browsers on desktop and mobile
  - Social share link previews (to confirm they are blocked where intended)
  - Headless/automation clients (curl, Python requests) to confirm they are blocked
- Adjust `protectedPaths` to minimize false positives (apply narrowly where you need strongest protection).

## Minimal Middleware Template

Copy and adapt this minimal example in your target project:

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isbot } from 'isbot'

export function middleware(request: NextRequest) {
  const { pathname, href } = request.nextUrl
  const ua = (request.headers.get('user-agent') || '').toLowerCase()
  const purpose = (request.headers.get('purpose') || '').toLowerCase()
  const secPurpose = (request.headers.get('sec-fetch-purpose') || '').toLowerCase()

  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.startsWith('/assets') || pathname.startsWith('/public')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/')) {
    const isObviousBot = ua.includes('bot') || ua.includes('crawler') || ua.includes('spider') || ua.includes('headless') || ua.includes('uptime') || ua.includes('insights')
    const isPrefetch = purpose === 'prefetch' || secPurpose === 'prefetch'
    if (isObviousBot || isPrefetch) {
      return NextResponse.json({ success: true, ignored: true }, { status: 200 })
    }
    return NextResponse.next()
  }

  const protectedPaths = ['/yourProtectedPage']
  const isProtected = protectedPaths.some(p => pathname === p || pathname.startsWith(p + '/'))
  if (!isProtected) return NextResponse.next()

  const isKnownBot = isbot(ua)
  const hasObviousBotUA = ua.includes('bot') || ua.includes('crawler') || ua.includes('spider') || ua.includes('scraper')
  const hasSuspiciousUA = ua.includes('headless') || ua.includes('phantom') || ua.includes('selenium') || ua.includes('webdriver') || ua.includes('puppeteer') || ua.includes('playwright') || ua.includes('chrome-lighthouse') || ua.includes('lighthouse')
  const hasAutomationUA = ua.includes('automation') || ua.includes('test') || ua.includes('scraper') || ua.includes('extractor') || ua.includes('parser') || ua.includes('monitor') || ua.includes('checker') || ua.includes('scanner')
  const hasEmptyUA = !ua || ua.length < 10
  const hasSuspiciousHeaders = purpose === 'prefetch' || secPurpose === 'prefetch' || purpose === 'preconnect'
  const hasBotPatterns = ua.includes('python') || ua.includes('requests') || ua.includes('urllib') || ua.includes('curl') || ua.includes('wget') || ua.includes('httpie')
  const hasCrawlerPatterns = ua.includes('crawl') || ua.includes('spider') || ua.includes('bot') || ua.includes('crawler') || ua.includes('scraper') || ua.includes('harvester')
  const isSocialMediaBot = ua.includes('facebookexternalhit') || ua.includes('instagrambot') || ua.includes('whatsapp') || ua.includes('telegrambot') || ua.includes('twitterbot') || ua.includes('linkedinbot') || ua.includes('skypeuripreview') || ua.includes('slackbot')

  if (isKnownBot || hasObviousBotUA || hasSuspiciousUA || hasAutomationUA || hasEmptyUA || hasSuspiciousHeaders || hasBotPatterns || hasCrawlerPatterns || isSocialMediaBot) {
    const errorHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>This site can't be reached</title></head><body><div>This site can't be reached</div></body></html>`
    return new NextResponse(errorHtml, {
      status: 404,
      headers: {
        'Content-Type': 'text/html',
        'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/yourProtectedPage', '/yourProtectedPage/:path*',
  ],
}
```

## Common Pitfalls

- Over‑matching: applying bot detection to the entire site can block legitimate crawlers and previews. Limit to sensitive routes.
- Social previews: if you need Open Graph/Twitter previews, you may need to allow specific bots or serve a static unfurled preview path separately.
- API monitoring/uptime tools: if your infra depends on them, allowlist their UA or source IPs for `/api`.

## Maintenance Tips

- Review logs from the debug middlewares during rollout.
- Periodically update heuristics and the `isbot` package.
- Keep `protectedPaths` scoped and explicit to reduce unintended blocks.


