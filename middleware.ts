import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware: route legacy slugs to the DB-backed renderer without changing the visible URL.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow Next internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // Always allow API
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // "Protected paths" becomes "managed slugs" (DB-backed).
  const managedSlugPaths = ['/test123', '/josh', '/m8d1son', '/rachelirl', '/petitelils', '/scarletxroseeevip', '/bellapetitie', '/littlelouxxx', '/abbiehall', '/abby', '/aimee', '/alaska', '/alfrileyyy', '/alicia', '/amyleigh', '/amberr', '/amymaxwell', '/babyscarlet', '/bethjefferson', '/Blondestud69', '/brooke', '/brooke_xox', '/brookex', '/caitlinteex', '/chloeayling', '/chloeelizabeth', '/chloeinskip', '/chloetami', '/chxrli_love', '/cowgurlkacey', '/dominika', '/ellejean', '/em', '/emily9999x', '/erinhannahxx', '/fitnessblonde', '/freya', '/georgiaaa', '/grace', '/hannah', '/jason', '/jen', '/kaceymay', '/katerina', '/kayley', '/keiramaex', '/kimbo_bimbo', '/kxceyrose', '/laurdunne', '/laylaasoyoung', '/laylasoyoung', '/libby', '/lily', '/lou', '/lsy', '/maddison', '/maddysmith111x', '/megann', '/michaelajayneex', '/missbrown', '/misssophiaisabella', '/morgan', '/noreilly75', '/novaskyee90', '/ollie', '/onlyjessxrose', '/paigexb', '/poppy', '/rachel', '/rachsotiny', '/robynnparkerr', '/sel', '/simplesimon8', '/skye', '/steff', '/sxmmermae', '/victoria', '/wackojacko69', '/petiteirishprincessxxx', '/prettygreeneyesxx', '/daddybearvlc', '/shellyhunterxo', '/tashacatton17'];

  const isManagedSlug = managedSlugPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (!isManagedSlug) return NextResponse.next();

  // Rewrite /slug -> /p/slug (URL stays /slug)
  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = `/p${pathname}`;
  return NextResponse.rewrite(rewriteUrl);
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


