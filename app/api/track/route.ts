import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Use service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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
    // Check if service role key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
      return NextResponse.json({ 
        success: false, 
        error: "Server configuration error: Missing service role key" 
      }, { status: 500 });
    }

    // Parse the request body
    const body = await req.json();
    const { referrer, timestamp, page, pathname, searchParams, click_type, link_id, page_id } = body;
    
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

    // If link_id is provided, also save to unified link_analytics table
    if (link_id || page_id) {
      const { error: linkAnalyticsError } = await supabase
        .from('link_analytics')
        .insert([{
          page_id: page_id || null,
          link_id: link_id || null,
          page_slug: page,
          referrer: referrer || "",
          readable_referrer: readableReferrer,
          user_agent: userAgent,
          ip_address: ip,
          timestamp: timestamp || new Date().toISOString(),
          pathname: pathname || `/${page}`,
          search_params: searchParams || "",
          click_type: click_type || "page_visit"
        }]);

      if (linkAnalyticsError) {
        console.error('Link analytics insert error:', linkAnalyticsError);
        // Don't fail the whole request, just log it
      }
    }

    // Determine which table to insert into based on the page (backward compatibility)
    const tableName = `${page.toLowerCase()}_analytics`;

    // Save to the appropriate page-specific table (for backward compatibility)
    const { data, error } = await supabase
      .from(tableName)
      .insert([analyticsData])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      console.error('Table name:', tableName);
      console.error('Data being inserted:', analyticsData);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        table: tableName,
        details: error.details,
        hint: error.hint
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
