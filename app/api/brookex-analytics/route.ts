import { NextRequest, NextResponse } from "next/server";
import { supabase, BrookeAnalyticsData } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("[BROOKEX API] Fetching analytics data from Supabase");
    const { count, error: countError } = await supabase
      .from('brookex_analytics')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error("[BROOKEX API] Count error:", countError);
      return NextResponse.json({ success: false, error: countError.message }, { status: 500 });
    }

    const pageSize = 1000;
    const allRows: any[] = [];
    const total = typeof count === 'number' ? count : pageSize;
    const totalPages = Math.ceil(total / pageSize) || 1;

    for (let page = 0; page < totalPages; page++) {
      const start = page * pageSize;
      const end = start + pageSize - 1;
      const { data: chunk, error: chunkError } = await supabase
        .from('brookex_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .range(start, end);
      if (chunkError) {
        console.error("[BROOKEX API] Supabase fetch error (page", page, "):", chunkError);
        return NextResponse.json({ success: false, error: chunkError.message }, { status: 500 });
      }
      if (chunk && chunk.length > 0) allRows.push(...chunk);
      if (!chunk || chunk.length < pageSize) break;
    }

    return NextResponse.json({
      success: true,
      data: allRows,
      totalRecords: count,
      fetchedRecords: allRows.length
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error("[BROOKEX API] Error fetching analytics:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referrer, timestamp, page, pathname, searchParams, click_type } = body;

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0]?.trim() : "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const ua = userAgent.toLowerCase();
    const isBot = (
      ua.includes("bot") || ua.includes("crawler") || ua.includes("spider") ||
      ua.includes("preview") || ua.includes("monitor") || ua.includes("headless") ||
      ua.includes("uptime") || ua.includes("insights") || ua.includes("curl/") ||
      ua.includes("python-requests")
    );
    if (isBot) {
      return NextResponse.json({ success: true, ignored: true, reason: 'bot' }, { status: 200 });
    }

    const purpose = req.headers.get('purpose') || '';
    const secPurpose = req.headers.get('sec-fetch-purpose') || '';
    if (purpose === 'prefetch' || secPurpose === 'prefetch') {
      return NextResponse.json({ success: true, ignored: true, reason: 'prefetch' }, { status: 200 });
    }

    const getReadableReferrer = (ref: string) => {
      if (!ref) return "Direct or unknown";
      if (ref.includes("instagram.com") || ref.includes("m.instagram.com")) return "Instagram";
      if (ref.includes("twitter.com") || ref.includes("x.com") || ref.includes("mobile.twitter.com")) return "Twitter/X";
      if (ref.includes("facebook.com") || ref.includes("m.facebook.com") || ref.includes("fb.com")) return "Facebook";
      if (ref.includes("tiktok.com") || ref.includes("vm.tiktok.com")) return "TikTok";
      if (ref.includes("linkedin.com") || ref.includes("m.linkedin.com")) return "LinkedIn";
      if (ref.includes("whatsapp.com") || ref.includes("wa.me") || ref.includes("web.whatsapp.com")) return "WhatsApp";
      if (ref.includes("snapchat.com")) return "Snapchat";
      if (ref.includes("youtube.com") || ref.includes("youtu.be") || ref.includes("m.youtube.com")) return "YouTube";
      if (ref.includes("reddit.com") || ref.includes("m.reddit.com")) return "Reddit";
      if (ref.includes("pinterest.com") || ref.includes("m.pinterest.com")) return "Pinterest";
      if (ref.includes("t.me") || ref.includes("telegram.org")) return "Telegram";
      if (ref.includes("discord.com") || ref.includes("discord.gg")) return "Discord";
      return ref;
    };

    const readableReferrer = getReadableReferrer(referrer || "");

    const analyticsData: BrookeAnalyticsData = {
      page: page || "brookex",
      referrer: referrer || "",
      readable_referrer: readableReferrer,
      user_agent: userAgent,
      ip_address: ip,
      timestamp: timestamp || new Date().toISOString(),
      pathname: pathname || "/brookex",
      search_params: searchParams || "",
      click_type: click_type || "page_visit"
    };

    const { data, error } = await supabase
      .from('brookex_analytics')
      .insert([analyticsData])
      .select();

    if (error) {
      console.error("[BROOKEX API] Supabase error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: analyticsData, supabaseData: data });
  } catch (error) {
    console.error("[BROOKEX API] Error storing analytics:", error);
    return NextResponse.json({ success: false, error: "Failed to store analytics" }, { status: 500 });
  }
}


