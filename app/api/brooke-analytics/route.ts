import { NextRequest, NextResponse } from "next/server";
import { supabase, BrookeAnalyticsData } from "@/lib/supabase";

export async function GET() {
  try {
    //console.log("[BROOKE API] Fetching analytics data from Supabase");
    
    // First, get the total count
    const { count, error: countError } = await supabase
      .from('brooke_analytics')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      //console.error("[BROOKE API] Count error:", countError);
      return NextResponse.json({ success: false, error: countError.message }, { status: 500 });
    }

    //console.log("[BROOKE API] Total records in database:", count);

    // Fetch all records in pages of 1000
    const pageSize = 1000;
    const allRows: any[] = [];
    const total = typeof count === 'number' ? count : pageSize; 
    const totalPages = Math.ceil(total / pageSize) || 1;

    for (let page = 0; page < totalPages; page++) {
      const start = page * pageSize;
      const end = start + pageSize - 1;
      const { data: chunk, error: chunkError } = await supabase
        .from('brooke_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .range(start, end);
      if (chunkError) {
        //console.error("[BROOKE API] Supabase fetch error (page", page, "):", chunkError);
        return NextResponse.json({ success: false, error: chunkError.message }, { status: 500 });
      }
      if (chunk && chunk.length > 0) {
        allRows.push(...chunk);
      }
      if (!chunk || chunk.length < pageSize) {
        break;
      }
    }

    //console.log("[BROOKE API] Successfully fetched data:", allRows.length, "records");

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
    //console.error("[BROOKE API] Error fetching analytics:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { referrer, timestamp, page, pathname, searchParams, click_type } = body;
    
    //console.log(`[BROOKE API] Received analytics request for page: ${page}`);
    //console.log(`[BROOKE API] Raw referrer: ${referrer}`);
    //console.log(`[BROOKE API] Click type: ${click_type || 'page_visit'}`);
    
    // Get IP address
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0]?.trim() : "unknown";
    
    // Get user agent
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Basic bot filtering
    const ua = userAgent.toLowerCase();
    const isBot = (
      ua.includes("bot") ||
      ua.includes("crawler") ||
      ua.includes("spider") ||
      ua.includes("preview") ||
      ua.includes("monitor") ||
      ua.includes("headless") ||
      ua.includes("uptime") ||
      ua.includes("insights") ||
      ua.includes("curl/") ||
      ua.includes("python-requests")
    );
    if (isBot) {
      return NextResponse.json({ success: true, ignored: true, reason: 'bot' }, { status: 200 });
    }

    // Drop prefetch
    const purpose = req.headers.get('purpose') || '';
    const secPurpose = req.headers.get('sec-fetch-purpose') || '';
    if (purpose === 'prefetch' || secPurpose === 'prefetch') {
      return NextResponse.json({ success: true, ignored: true, reason: 'prefetch' }, { status: 200 });
    }
    
    // Create readable referrer with enhanced mobile/desktop detection
    const getReadableReferrer = (ref: string) => {
      if (!ref) return "Direct or unknown";
      
      // Instagram - catches both mobile and desktop
      if (ref.includes("instagram.com") || ref.includes("m.instagram.com")) return "Instagram";
      
      // Twitter/X - catches both mobile and desktop
      if (ref.includes("twitter.com") || ref.includes("x.com") || ref.includes("mobile.twitter.com")) return "Twitter/X";
      
      // Facebook - catches both mobile and desktop
      if (ref.includes("facebook.com") || ref.includes("m.facebook.com") || ref.includes("fb.com")) return "Facebook";
      
      // TikTok - catches both mobile and desktop
      if (ref.includes("tiktok.com") || ref.includes("vm.tiktok.com")) return "TikTok";
      
      // LinkedIn - catches both mobile and desktop
      if (ref.includes("linkedin.com") || ref.includes("m.linkedin.com")) return "LinkedIn";
      
      // WhatsApp - catches both mobile and desktop
      if (ref.includes("whatsapp.com") || ref.includes("wa.me") || ref.includes("web.whatsapp.com")) return "WhatsApp";
      
      // Snapchat
      if (ref.includes("snapchat.com")) return "Snapchat";
      
      // YouTube
      if (ref.includes("youtube.com") || ref.includes("youtu.be") || ref.includes("m.youtube.com")) return "YouTube";
      
      // Reddit
      if (ref.includes("reddit.com") || ref.includes("m.reddit.com")) return "Reddit";
      
      // Pinterest
      if (ref.includes("pinterest.com") || ref.includes("m.pinterest.com")) return "Pinterest";
      
      // Telegram
      if (ref.includes("t.me") || ref.includes("telegram.org")) return "Telegram";
      
      // Discord
      if (ref.includes("discord.com") || ref.includes("discord.gg")) return "Discord";
      
      return ref;
    };

    const readableReferrer = getReadableReferrer(referrer || "");
    //console.log(`[BROOKE API] Processed referrer: ${readableReferrer}`);

    const analyticsData: BrookeAnalyticsData = {
      page: page || "brooke",
      referrer: referrer || "",
      readable_referrer: readableReferrer,
      user_agent: userAgent,
      ip_address: ip,
      timestamp: timestamp || new Date().toISOString(),
      pathname: pathname || "/brooke",
      search_params: searchParams || "",
      click_type: click_type || "page_visit" // Add click type tracking
    };

    // Save to Supabase
    const { data, error } = await supabase
      .from('brooke_analytics')
      .insert([analyticsData])
      .select();

    if (error) {
      //console.error("[BROOKE API] Supabase error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    //console.log("[BROOKE API] Successfully saved to Supabase:", data);

    return NextResponse.json({ 
      success: true, 
      data: analyticsData,
      supabaseData: data 
    });

  } catch (error) {
    //console.error("[BROOKE API] Error storing analytics:", error);
    return NextResponse.json({ success: false, error: "Failed to store analytics" }, { status: 500 });
  }
} 