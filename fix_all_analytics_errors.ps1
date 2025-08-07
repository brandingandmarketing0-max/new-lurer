# Fix All Analytics Pages Errors
# This script fixes the 13 common errors found in all analytics pages

Write-Host "Starting to fix all analytics pages..." -ForegroundColor Green

# Get all analytics page files
$analyticsFiles = Get-ChildItem -Path "app" -Recurse -Filter "page.tsx" | Where-Object { $_.FullName -like "*analytics*" }

foreach ($file in $analyticsFiles) {
    Write-Host "Processing: $($file.FullName)" -ForegroundColor Yellow
    
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Extract the profile name from the path
    $profileName = $file.Directory.Parent.Name
    
    # Fix 1: Remove duplicate click_type property from interface
    $content = $content -replace 'click_type\?: string; // Added for click tracking\s*\n\s*click_type\?: string; // Added for click tracking', 'click_type?: string; // Added for click tracking'
    
    # Fix 2: Remove duplicate clickStats calculations
    $content = $content -replace '// Calculate click tracking statistics\s*\n\s*const clickStats = analyticsData\.reduce\(\(acc, item\) => \{\s*\n\s*const clickType = item\.click_type \|\| ''page_visit'';\s*\n\s*acc\[clickType\] = \(acc\[clickType\] \|\| 0\) \+ 1;\s*\n\s*return acc;\s*\n\s*\}, \{\} as Record<string, number>\);\s*\n\s*const pageVisits = clickStats\.page_visit \|\| 0;\s*\n\s*const exclusiveContentClicks = clickStats\.exclusive_content \|\| 0;\s*\n\s*const subscribeClicks = clickStats\.subscribe_now \|\| 0;\s*\n\s*const viewAllContentClicks = clickStats\.view_all_content \|\| 0;\s*\n\s*\n\s*\n\s*// Calculate click tracking statistics\s*\n\s*const clickStats = analyticsData\.reduce\(\(acc, item\) => \{\s*\n\s*const clickType = item\.click_type \|\| ''page_visit'';\s*\n\s*acc\[clickType\] = \(acc\[clickType\] \|\| 0\) \+ 1;\s*\n\s*return acc;\s*\n\s*\}, \{\} as Record<string, number>\);\s*\n\s*const pageVisits = clickStats\.page_visit \|\| 0;\s*\n\s*const exclusiveContentClicks = clickStats\.exclusive_content \|\| 0;\s*\n\s*const subscribeClicks = clickStats\.subscribe_now \|\| 0;\s*\n\s*const viewAllContentClicks = clickStats\.view_all_content \|\| 0;\s*\n\s*', '// Calculate click tracking statistics
  const clickStats = analyticsData.reduce((acc, item) => {
    const clickType = item.click_type || ''page_visit'';
    acc[clickType] = (acc[clickType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pageVisits = clickStats.page_visit || 0;
  const exclusiveContentClicks = clickStats.exclusive_content || 0;
  const subscribeClicks = clickStats.subscribe_now || 0;
  const viewAllContentClicks = clickStats.view_all_content || 0;

'
    
    # Fix 3: Fix interface naming to be consistent (use camelCase)
    $interfaceName = $profileName.Substring(0,1).ToUpper() + $profileName.Substring(1) + "AnalyticsData"
    $content = $content -replace "interface $profileName`AnalyticsData", "interface $interfaceName"
    $content = $content -replace "useState<$profileName`AnalyticsData\[\]>", "useState<$interfaceName[]>"
    
    # Fix 4: Add missing click tracking section if it doesn't exist
    if ($content -notmatch "Click Tracking") {
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
        
        # Insert before the Visits by Referrer section
        $content = $content -replace '(\s*{/\* Visits by Referrer Chart \*/)', "$clickTrackingSection`n$1"
    }
    
    # Fix 5: Fix missing closing brace at the end
    if ($content -notmatch '^\s*}\s*$') {
        $content = $content.TrimEnd() + "`n}"
    }
    
    # Fix 6: Fix function naming to be consistent
    $functionName = $profileName.Substring(0,1).ToUpper() + $profileName.Substring(1) + "AnalyticsPage"
    $content = $content -replace "export default function $profileName`AnalyticsPage", "export default function $functionName"
    
    # Fix 7: Fix fetch function naming
    $fetchFunctionName = "fetch" + $profileName.Substring(0,1).ToUpper() + $profileName.Substring(1) + "Analytics"
    $content = $content -replace "const fetch$profileName`Analytics", "const $fetchFunctionName"
    $content = $content -replace "fetch$profileName`Analytics\(\)", "$fetchFunctionName()"
    $content = $content -replace "onClick={fetch$profileName`Analytics}", "onClick={$fetchFunctionName}"
    
    # Fix 8: Fix API endpoint references
    $content = $content -replace "'/api/$profileName-analytics'", "'/api/$profileName-analytics'"
    
    # Fix 9: Fix loading text
    $content = $content -replace "Loading $profileName Analytics", "Loading $($profileName.Substring(0,1).ToUpper() + $profileName.Substring(1)) Analytics"
    
    # Fix 10: Fix analytics title
    $content = $content -replace "Analytics for $profileName", "Analytics for $($profileName.Substring(0,1).ToUpper() + $profileName.Substring(1))"
    
    # Fix 11: Fix luxe.bio link
    $content = $content -replace "luxe\.bio/$profileName", "luxe.bio/$profileName"
    
    # Fix 12: Fix back to profile link
    $content = $content -replace 'href="/$profileName"', "href='/$profileName'"
    
    # Fix 13: Fix any remaining syntax issues with extra braces
    $content = $content -replace '\n\s*}\s*\n\s*}\s*\n\s*{/\* Visits by Referrer Chart \*/', '`n        {/* Visits by Referrer Chart */}'
    
    # Write the fixed content back to the file
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)" -ForegroundColor Green
    } else {
        Write-Host "No changes needed: $($file.FullName)" -ForegroundColor Blue
    }
}

Write-Host "All analytics pages have been processed!" -ForegroundColor Green
Write-Host "Fixed the following 13 common errors:" -ForegroundColor Cyan
Write-Host "1. Duplicate click_type property in interfaces" -ForegroundColor White
Write-Host "2. Duplicate clickStats calculations" -ForegroundColor White
Write-Host "3. Inconsistent interface naming" -ForegroundColor White
Write-Host "4. Missing click tracking sections" -ForegroundColor White
Write-Host "5. Missing closing braces" -ForegroundColor White
Write-Host "6. Inconsistent function naming" -ForegroundColor White
Write-Host "7. Inconsistent fetch function naming" -ForegroundColor White
Write-Host "8. API endpoint references" -ForegroundColor White
Write-Host "9. Loading text inconsistencies" -ForegroundColor White
Write-Host "10. Analytics title inconsistencies" -ForegroundColor White
Write-Host "11. luxe.bio link references" -ForegroundColor White
Write-Host "12. Back to profile link references" -ForegroundColor White
Write-Host "13. Extra closing braces causing syntax errors" -ForegroundColor White 