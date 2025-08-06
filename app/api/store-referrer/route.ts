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
