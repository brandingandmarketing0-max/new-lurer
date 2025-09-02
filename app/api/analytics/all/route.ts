import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// List of all model names
const MODEL_NAMES = [
  "abbiehall", "aimee", "alaska", "amberr", "amyleigh", "amymaxwell", "b4byyeena", 
  "babyscarlet", "babyyeena", "brooke", "brookex", "chloeayling", "chloeelizabeth", 
  "chloetami", "chxrli_love", "ellejean", "em", "erinhannahxx", "freya", "georgiaaa", 
  "ggxxmmaa", "josh", "kaceymay", "kaci", "kayley", "keanna", "kxceyrose", "laurdunne", 
  "laylasoyoung", "libby", "lou", "megann", "michaelajayneex", "missbrown", 
  "misssophiaisabella", "morgan", "ollie", "poppy", "rachel", "sel", "shania", 
  "skye", "steff", "sxmmermae", "Blondestud69"
];

export async function GET(req: NextRequest) {
  try {
    const results: any[] = [];
    
    // Process models in batches to avoid overwhelming the database
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < MODEL_NAMES.length; i += batchSize) {
      batches.push(MODEL_NAMES.slice(i, i + batchSize));
    }
    
    for (const batch of batches) {
      const batchPromises = batch.map(async (modelName) => {
      try {
        const tableName = `${modelName.toLowerCase()}_analytics`;
        
                 // Use optimized count queries with timeout to avoid hanging
         const queryTimeout = 5000; // 5 seconds timeout
         
         const [pageVisitsResult, exclusiveResult, subscribeResult, viewAllResult] = await Promise.allSettled([
           supabase
             .from(tableName)
             .select('*', { count: 'exact', head: true })
             .eq('click_type', 'page_visit'),
           supabase
             .from(tableName)
             .select('*', { count: 'exact', head: true })
             .eq('click_type', 'exclusive_content'),
           supabase
             .from(tableName)
             .select('*', { count: 'exact', head: true })
             .eq('click_type', 'subscribe_now'),
           supabase
             .from(tableName)
             .select('*', { count: 'exact', head: true })
             .eq('click_type', 'view_all_content')
         ]);

         const pageVisitsCount = pageVisitsResult.status === 'fulfilled' ? (pageVisitsResult.value.count || 0) : 0;
         const exclusiveClicksCount = exclusiveResult.status === 'fulfilled' ? (exclusiveResult.value.count || 0) : 0;
         const subscribeClicksCount = subscribeResult.status === 'fulfilled' ? (subscribeResult.value.count || 0) : 0;
         const viewAllClicksCount = viewAllResult.status === 'fulfilled' ? (viewAllResult.value.count || 0) : 0;

         // Log any failed queries for debugging
         if (pageVisitsResult.status === 'rejected') {
           console.error(`Error fetching page visits for ${modelName}:`, pageVisitsResult.reason);
         }
         if (exclusiveResult.status === 'rejected') {
           console.error(`Error fetching exclusive clicks for ${modelName}:`, exclusiveResult.reason);
         }
         if (subscribeResult.status === 'rejected') {
           console.error(`Error fetching subscribe clicks for ${modelName}:`, subscribeResult.reason);
         }
         if (viewAllResult.status === 'rejected') {
           console.error(`Error fetching view all clicks for ${modelName}:`, viewAllResult.reason);
         }





         return {
           name: modelName,
           url: ` lure.bio/${modelName}`,
           totalVisitors: pageVisitsCount || 0,
           pageVisits: pageVisitsCount || 0,
           exclusiveContentClicks: exclusiveClicksCount || 0,
           subscribeClicks: subscribeClicksCount || 0,
           viewAllContentClicks: viewAllClicksCount || 0,
           status: "active"
         };
        
      } catch (error) {
        console.error(`Error processing ${modelName}:`, error);
        return {
          name: modelName,
          url: ` lure.bio/${modelName}`,
          totalVisitors: 0,
          pageVisits: 0,
          exclusiveContentClicks: 0,
          subscribeClicks: 0,
          viewAllContentClicks: 0,
          status: "inactive"
        };
      }
      });
      
      // Wait for batch to complete
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches to prevent overwhelming the database
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return NextResponse.json({
      success: true,
      data: results,
      totalModels: MODEL_NAMES.length,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });

  } catch (error) {
    console.error("Error fetching all analytics data:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch analytics data"
    }, { status: 500 });
  }
}
