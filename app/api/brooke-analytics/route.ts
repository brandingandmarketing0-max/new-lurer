import { NextRequest, NextResponse } from "next/server";
import { supabase, BrookeAnalyticsData } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("[BROOKE API] Fetching analytics data from Supabase");
    
    const { data, error } = await supabase
      .from('brooke_analytics')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("[BROOKE API] Supabase fetch error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log("[BROOKE API] Successfully fetched data:", data?.length, "records");

    return NextResponse.json({ 
      success: true, 
      data: data || [] 
    });

  } catch (error) {
    console.error("[BROOKE API] Error fetching analytics:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { referrer, timestamp, page, pathname, searchParams } = body;
    
    console.log(`[BROOKE API] Received analytics request for page: ${page}`);
    console.log(`[BROOKE API] Raw referrer: ${referrer}`);
    
    // Get IP address
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";
    
    // Get user agent
    const userAgent = req.headers.get("user-agent") || "unknown";
    
    // Create readable referrer
    const getReadableReferrer = (ref: string) => {
      if (!ref) return "Direct or unknown";
      if (ref.includes("instagram.com")) return "Instagram";
      if (ref.includes("twitter.com") || ref.includes("x.com")) return "Twitter/X";
      if (ref.includes("facebook.com")) return "Facebook";
      if (ref.includes("tiktok.com")) return "TikTok";
      if (ref.includes("linkedin.com")) return "LinkedIn";
      if (ref.includes("whatsapp.com") || ref.includes("wa.me")) return "WhatsApp";
      return ref;
    };

    const readableReferrer = getReadableReferrer(referrer || "");
    console.log(`[BROOKE API] Processed referrer: ${readableReferrer}`);

    const analyticsData: BrookeAnalyticsData = {
      page: page || "brooke",
      referrer: referrer || "",
      readable_referrer: readableReferrer,
      user_agent: userAgent,
      ip_address: ip,
      timestamp: timestamp || new Date().toISOString(),
      pathname: pathname || "/brooke",
      search_params: searchParams || ""
    };

    // Save to Supabase
    const { data, error } = await supabase
      .from('brooke_analytics')
      .insert([analyticsData])
      .select();

    if (error) {
      console.error("[BROOKE API] Supabase error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log("[BROOKE API] Successfully saved to Supabase:", data);

    return NextResponse.json({ 
      success: true, 
      data: analyticsData,
      supabaseData: data 
    });

  } catch (error) {
    console.error("[BROOKE API] Error storing analytics:", error);
    return NextResponse.json({ success: false, error: "Failed to store analytics" }, { status: 500 });
  }
} 