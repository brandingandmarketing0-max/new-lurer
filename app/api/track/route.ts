import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Define the analytics data interface
interface AnalyticsData {
  id?: number
  page: string
  referrer: string
  readable_referrer: string
  user_agent: string
  ip_address: string
  timestamp: string
  pathname: string
  search_params: string
  click_type?: string
  created_at?: string
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { referrer, timestamp, page, pathname, searchParams, click_type } = body;
    
    // Validate required fields
    if (!page) {
      return NextResponse.json({ 
        success: false, 
        error: "Page parameter is required" 
      }, { status: 400 });
    }
    

    
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
      
      // Google search
      if (ref.includes("google.com") || ref.includes("google.co.uk") || ref.includes("google.ca")) return "Google Search";
      
      // Bing search
      if (ref.includes("bing.com")) return "Bing Search";
      
      // DuckDuckGo
      if (ref.includes("duckduckgo.com")) return "DuckDuckGo";
      
      return ref;
    };

    const readableReferrer = getReadableReferrer(referrer || "");

    // Create the analytics data object
    const analyticsData: AnalyticsData = {
      page: page,
      referrer: referrer || "",
      readable_referrer: readableReferrer,
      user_agent: userAgent,
      ip_address: ip,
      timestamp: timestamp || new Date().toISOString(),
      pathname: pathname || `/${page}`,
      search_params: searchParams || "",
      click_type: click_type || "page_visit"
    };

    // Determine which table to insert into based on the page
    const tableName = `${page.toLowerCase()}_analytics`;

    // Save to the appropriate page-specific table
    const { data, error } = await supabase
      .from(tableName)
      .insert([analyticsData])
      .select();

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        table: tableName
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: analyticsData,
      supabaseData: data,
      table: tableName
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: "Failed to store analytics" 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page');
    

    
    if (!page) {
      return NextResponse.json({ 
        success: false, 
        error: "Page parameter is required in query string" 
      }, { status: 400 });
    }
    
    const tableName = `${page.toLowerCase()}_analytics`;
    
    // First, get the total count
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return NextResponse.json({ 
        success: false, 
        error: countError.message,
        table: tableName
      }, { status: 500 });
    }

    // Fetch all records in pages of 1000 to bypass PostgREST max-rows limit
    const pageSize = 1000;
    const allRows: any[] = [];
    const total = typeof count === 'number' ? count : pageSize; 
    const totalPages = Math.ceil(total / pageSize) || 1;

    for (let page = 0; page < totalPages; page++) {
      const start = page * pageSize;
      const end = start + pageSize - 1;
      const { data: chunk, error: chunkError } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .range(start, end);
      if (chunkError) {
        return NextResponse.json({ 
          success: false, 
          error: chunkError.message,
          table: tableName
        }, { status: 500 });
      }
      if (chunk && chunk.length > 0) allRows.push(...chunk);
      if (!chunk || chunk.length < pageSize) break;
    }

    return NextResponse.json({ 
      success: true, 
      data: allRows,
      totalRecords: count,
      fetchedRecords: allRows.length,
      table: tableName
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch analytics" 
    }, { status: 500 });
  }
}
