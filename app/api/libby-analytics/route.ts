import { NextRequest, NextResponse } from "next/server";
import { supabase, BrookeAnalyticsData } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("[LIBBY API] Fetching analytics data from Supabase");
    
    const { data, error } = await supabase
      .from('libby_analytics')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("[LIBBY API] Supabase fetch error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log("[LIBBY API] Successfully fetched data:", data?.length, "records");

    return NextResponse.json({ 
      success: true, 
      data: data || [] 
    });

  } catch (error) {
    console.error("[LIBBY API] Error fetching analytics:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { referrer, timestamp, page, pathname, searchParams } = body;
    
    console.log(`[LIBBY API] Received analytics request for page: ${page}`);
    console.log(`[LIBBY API] Raw referrer: ${referrer}`);
    
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
    console.log(`[LIBBY API] Processed referrer: ${readableReferrer}`);

    const analyticsData: BrookeAnalyticsData = {
      page: page || "libby",
      referrer: referrer || "",
      readable_referrer: readableReferrer,
      user_agent: userAgent,
      ip_address: ip,
      timestamp: timestamp || new Date().toISOString(),
      pathname: pathname || "/libby",
      search_params: searchParams || ""
    };

    // Save to Supabase
    const { data, error } = await supabase
      .from('libby_analytics')
      .insert([analyticsData])
      .select();

    if (error) {
      console.error("[LIBBY API] Supabase error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log("[LIBBY API] Successfully saved to Supabase:", data);

    return NextResponse.json({ 
      success: true, 
      data: analyticsData,
      supabaseData: data 
    });

  } catch (error) {
    console.error("[LIBBY API] Error storing analytics:", error);
    return NextResponse.json({ success: false, error: "Failed to store analytics" }, { status: 500 });
  }
} 