// app/api/visit-beacon/route.ts
// Minimal App Router API route that accepts POST beacons and stores them in-memory.
// Replace storage with DB/analytics in production.

import { NextResponse } from 'next/server';

type BeaconPayload = {
  ts?: number;
  path?: string;
  ua?: string;
  isInAppBrowser?: boolean;
  isInstagram?: boolean;
  isAndroid?: boolean;
  isiOS?: boolean;
  reasons?: string;
  event?: string;
  page?: string;
};

const store: BeaconPayload[] = []; // demo-only; ephemeral

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const payload: BeaconPayload = {
      ts: body.ts ?? Date.now(),
      path: body.path,
      ua: typeof body.ua === 'string' ? body.ua.slice(0, 500) : undefined,
      isInAppBrowser: body.isInAppBrowser,
      isInstagram: body.isInstagram,
      isAndroid: body.isAndroid,
      isiOS: body.isiOS,
      reasons: body.reasons,
      event: body.event,
      page: body.page,
    };

    // store (demo) — in production push to a DB / S3 / logging system
    store.push(payload);
    // return recent for quick debugging
    const recent = store.slice(-10).reverse();

    return NextResponse.json({ ok: true, stored: payload, recent });
  } catch (err) {
    console.error('beacon error', err);
    return NextResponse.json({ ok: false, error: 'invalid payload' }, { status: 400 });
  }
}

export async function GET() {
  // optional: allow quick debugging to view recent beacons
  return NextResponse.json({ ok: true, recent: store.slice(-50).reverse() });
}


