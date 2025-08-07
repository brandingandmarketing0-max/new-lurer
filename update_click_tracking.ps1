# PowerShell script to add click tracking to all models
# This script will update API routes, profile pages, and analytics pages

$models = @(
    "abbiehall", "aimee", "amberr", "amyleigh", "amymaxwell", "b4byyeena", 
    "babyscarlet", "babyyeena", "chloeayling", "chloeelizabeth", "chloetami", 
    "ellejean", "em", "freya", "georgiaaa", "josh", "kaceymay", "kaci", 
    "kayley", "keanna", "kxceyrose", "laurdunne", "laylasoyoung", "liamm", 
    "libby", "lou", "megann", "missbrown", "morgan", "ollie", "poppy", 
    "sel", "skye", "sxmmermae"
)

Write-Host "🚀 Starting click tracking implementation for all models..." -ForegroundColor Green

foreach ($model in $models) {
    Write-Host "📝 Processing $model..." -ForegroundColor Yellow
    
    # 1. Update API route
    $apiPath = "app/api/$model-analytics/route.ts"
    if (Test-Path $apiPath) {
        $apiContent = Get-Content $apiPath -Raw
        
        # Add click_type to destructuring
        $apiContent = $apiContent -replace 'const \{ referrer, timestamp, page, pathname, searchParams \} = body;', 'const { referrer, timestamp, page, pathname, searchParams, click_type } = body;'
        
        # Add click_type logging
        $apiContent = $apiContent -replace 'console\.log\(`\[.*? API\] Raw referrer: \$\{referrer\}`\);', "console.log(`[${model.ToUpper()} API] Raw referrer: ` + referrer);`n    console.log(`[${model.ToUpper()} API] Click type: ` + (click_type || 'page_visit'));"
        
        # Add click_type to analyticsData
        $apiContent = $apiContent -replace 'search_params: searchParams \|\| ""', 'search_params: searchParams || "",`n      click_type: click_type || "page_visit"'
        
        Set-Content -Path $apiPath -Value $apiContent -Encoding UTF8
        Write-Host "  ✅ Updated API route for $model"
    }
    
    # 2. Update profile page
    $profilePath = "app/$model/page.tsx"
    if (Test-Path $profilePath) {
        $profileContent = Get-Content $profilePath -Raw
        
        # Add click_type to initial analytics call
        $profileContent = $profileContent -replace 'searchParams: "",', 'searchParams: "",`n        click_type: "page_visit"'
        
        # Add click tracking functions
        $clickTrackingFunctions = @"
  // Click tracking functions
  const trackClick = async (clickType) => {
    try {
      await fetch("/api/$model-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: "$model",
          referrer: rawReferrer,
          timestamp: new Date().toISOString(),
          pathname: "/$model",
          searchParams: "",
          click_type: clickType
        }),
      });
    } catch (error) {
      console.error("Failed to track " + clickType + " click:", error);
    }
  };

  const handleExclusiveContentClick = () => {
    trackClick("exclusive_content");
  };

  const handleSubscribeClick = () => {
    trackClick("subscribe_now");
  };

  const handleViewAllContentClick = () => {
    trackClick("view_all_content");
  };
"@
        
        # Insert click tracking functions after useEffect
        $profileContent = $profileContent -replace '}, \[\]\);', "}, []);`n`n$clickTrackingFunctions"
        
        # Wrap exclusive content card with click tracking
        $profileContent = $profileContent -replace '(\s*)(<Link href="https://onlyfans\.com/[^"]*" target="_blank" rel="noopener noreferrer">)', '$1<div onClick={handleExclusiveContentClick}>$2'
        $profileContent = $profileContent -replace '(\s*)(</Link>)', '$1$2</div>'
        
        # Wrap subscribe button with click tracking
        $profileContent = $profileContent -replace '(\s*)(<Link href="https://onlyfans\.com/[^"]*" target="_blank" rel="noopener noreferrer">\s*<Button[^>]*Subscribe Now[^>]*>)', '$1<div onClick={handleSubscribeClick}>$2'
        $profileContent = $profileContent -replace '(\s*)(</Button>\s*</Link>)', '$1$2</div>'
        
        # Wrap view all content button with click tracking
        $profileContent = $profileContent -replace '(\s*)(<Link href="https://onlyfans\.com/[^"]*" target="_blank" rel="noopener noreferrer">\s*<Button[^>]*View All Content[^>]*>)', '$1<div onClick={handleViewAllContentClick}>$2'
        $profileContent = $profileContent -replace '(\s*)(</Button>\s*</Link>)', '$1$2</div>'
        
        Set-Content -Path $profilePath -Value $profileContent -Encoding UTF8
        Write-Host "  ✅ Updated profile page for $model"
    }
    
    # 3. Update analytics page
    $analyticsPath = "app/$model/analytics/page.tsx"
    if (Test-Path $analyticsPath) {
        $analyticsContent = Get-Content $analyticsPath -Raw
        
        # Add click_type to interface
        $analyticsContent = $analyticsContent -replace 'created_at: string;', 'created_at: string;`n  click_type?: string; // Added for click tracking'
        
        # Add click tracking statistics calculation
        $clickStatsCode = @"
  // Calculate click tracking statistics
  const clickStats = analyticsData.reduce((acc, item) => {
    const clickType = item.click_type || 'page_visit';
    acc[clickType] = (acc[clickType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pageVisits = clickStats.page_visit || 0;
  const exclusiveContentClicks = clickStats.exclusive_content || 0;
  const subscribeClicks = clickStats.subscribe_now || 0;
  const viewAllContentClicks = clickStats.view_all_content || 0;
"@
        
        # Insert click stats after deviceStats calculation
        $analyticsContent = $analyticsContent -replace '}, {} as Record<string, number>);', '}, {} as Record<string, number>);`n`n$clickStatsCode'
        
        # Add click tracking section before Visits by Referrer Chart
        $clickTrackingSection = @"
        {/* Click Tracking */}
        <Card className="mb-8 border-[#B19272]">
          <CardHeader>
            <CardTitle className="text-gray-900">Click Tracking</CardTitle>
            <p className="text-gray-600">Track interactions with your content and buttons</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-[#B19272]">{pageVisits}</div>
                <div className="text-sm text-gray-600">Page Visits</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-[#B19272]">{exclusiveContentClicks}</div>
                <div className="text-sm text-gray-600">Exclusive Content Clicks</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-[#B19272]">{subscribeClicks}</div>
                <div className="text-sm text-gray-600">Subscribe Clicks</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-[#B19272]">{viewAllContentClicks}</div>
                <div className="text-sm text-gray-600">View All Content Clicks</div>
              </div>
            </div>
            
            {/* Conversion Rates */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rates</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-[#B19272]">
                    {pageVisits > 0 ? ((exclusiveContentClicks / pageVisits) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Exclusive Content CTR</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-[#B19272]">
                    {pageVisits > 0 ? ((subscribeClicks / pageVisits) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Subscribe CTR</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-[#B19272]">
                    {pageVisits > 0 ? ((viewAllContentClicks / pageVisits) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">View All CTR</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
"@
        
        # Insert click tracking section before Visits by Referrer Chart
        $analyticsContent = $analyticsContent -replace '(\s*)({/\* Visits by Referrer Chart \*/})', '$1$clickTrackingSection`n`n$1$2'
        
        Set-Content -Path $analyticsPath -Value $analyticsContent -Encoding UTF8
        Write-Host "  ✅ Updated analytics page for $model"
    }
}

Write-Host "🎉 Click tracking implementation completed for all models!" -ForegroundColor Green
Write-Host "📊 You can now track:" -ForegroundColor Cyan
Write-Host "   • Page visits" -ForegroundColor White
Write-Host "   • Exclusive content card clicks" -ForegroundColor White
Write-Host "   • Subscribe button clicks" -ForegroundColor White
Write-Host "   • View All Content button clicks" -ForegroundColor White
Write-Host "   • Conversion rates for each button type" -ForegroundColor White 