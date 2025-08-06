// /app/api/store-referrer/route.ts
import { NextRequest, NextResponse } from "next/server";

interface AnalyticsData {
  page: string;
  referrer: string;
  readableReferrer: string;
  userAgent: string;
  ip: string;
  timestamp: string;
  pathname: string;
  searchParams: string;
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body - handle both old and new formats
    const body = await req.json();
    const { referrer, timestamp, page, pathname, searchParams } = body;
    
    console.log(`[API] Received analytics request for page: ${page}`);
    console.log(`[API] Raw referrer: ${referrer}`);
    
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
    console.log(`[API] Processed referrer: ${readableReferrer}`);

    const analyticsData: AnalyticsData = {
      page: page || "unknown",
      referrer: referrer || "",
      readableReferrer: readableReferrer,
      userAgent,
      ip,
      timestamp: timestamp || new Date().toISOString(),
      pathname: pathname || "",
      searchParams: searchParams || ""
    };

    // Here you would save to a database (e.g., PostgreSQL, MongoDB, etc.)
    // For now, we'll log it and you can implement database storage later
    console.log("Analytics Data:", JSON.stringify(analyticsData, null, 2));
    console.log("Raw referrer:", referrer);
    console.log("Readable referrer:", getReadableReferrer(referrer));

    // You can also save to a JSON file for demo purposes
    // This is just for demonstration - in production, use a proper database
    const fs = require('fs');
    const path = require('path');
    
    const analyticsDir = path.join(process.cwd(), 'analytics');
    if (!fs.existsSync(analyticsDir)) {
      fs.mkdirSync(analyticsDir, { recursive: true });
    }
    
    const filePath = path.join(analyticsDir, 'analytics.json');
    let existingData = [];
    
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      existingData = JSON.parse(fileContent);
    }
    
    existingData.push(analyticsData);
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

    return NextResponse.json({ success: true, data: analyticsData });
  } catch (error) {
    console.error("Error storing analytics:", error);
    return NextResponse.json({ success: false, error: "Failed to store analytics" }, { status: 500 });
  }
}
