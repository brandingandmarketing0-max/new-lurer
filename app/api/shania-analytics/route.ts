import { NextRequest, NextResponse } from "next/server";
import { supabase, BrookeAnalyticsData } from "@/lib/supabase";

export async function GET() {
  try {
    //console.log("[SHANIA API] Fetching analytics data from Supabase");
    
    // First, get the total count
    const { count, error: countError } = await supabase
      .from('shania_analytics')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      //console.error("[SHANIA API] Count error:", countError);
      return NextResponse.json({ success: false, error: countError.message }, { status: 500 });
    }

    //console.log("[SHANIA API] Total records in database:", count);

    // Get all records with increased limit
    const { data, error } = await supabase
      .from('shania_analytics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10000); // Increased limit to 10,000 records

    if (error) {
      //console.error("[SHANIA API] Supabase fetch error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    //console.log("[SHANIA API] Successfully fetched data:", data?.length, "records");

    return NextResponse.json({ 
      success: true, 
      data: data || [],
      totalRecords: count,
      fetchedRecords: data?.length || 0
    });

  } catch (error) {
    //console.error("[SHANIA API] Error fetching analytics:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { referrer, timestamp, page, pathname, searchParams, click_type } = body;
    
    //console.log(`[SHANIA API] Received analytics request for page: ${page}`);
    //console.log(`[SHANIA API] Raw referrer: ${referrer}`);
    //console.log(`[SHANIA API] Click type: ${click_type || 'page_visit'}`);
    
    // Get IP address
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";
    
    // Get user agent
    const userAgent = req.headers.get("user-agent") || "unknown";
    
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
    //console.log(`[SHANIA API] Processed referrer: ${readableReferrer}`);

    const analyticsData: BrookeAnalyticsData = {
      page: page || "shania",
      referrer: referrer || "",
      readable_referrer: readableReferrer,
      user_agent: userAgent,
      ip_address: ip,
      timestamp: timestamp || new Date().toISOString(),
      pathname: pathname || "/shania",
      search_params: searchParams || "",
      click_type: click_type || "page_visit"
    };

    // Save to Supabase
    const { data, error } = await supabase
      .from('shania_analytics')
      .insert([analyticsData])
      .select();

    if (error) {
      //console.error("[SHANIA API] Supabase error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    //console.log("[SHANIA API] Successfully saved to Supabase:", data);

    return NextResponse.json({ 
      success: true, 
      data: analyticsData,
      supabaseData: data 
    });

  } catch (error) {
    //console.error("[SHANIA API] Error storing analytics:", error);
    return NextResponse.json({ success: false, error: "Failed to store analytics" }, { status: 500 });
  }
}

