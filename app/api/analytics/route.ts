import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const analyticsDir = path.join(process.cwd(), 'analytics');
    const filePath = path.join(analyticsDir, 'analytics.json');
    
    // Check if analytics file exists
    try {
      await fs.access(filePath);
    } catch {
      // File doesn't exist, return empty array
      return NextResponse.json([]);
    }
    
    // Read and parse the analytics data
    const fileContent = await fs.readFile(filePath, 'utf8');
    const analyticsData = JSON.parse(fileContent);
    
    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Error reading analytics data:", error);
    return NextResponse.json({ error: "Failed to load analytics data" }, { status: 500 });
  }
} 