# Fix Analytics Pages Errors
# This script fixes common errors in all analytics pages

$analyticsPages = @(
    "app/abbiehall/analytics/page.tsx",
    "app/aimee/analytics/page.tsx", 
    "app/amberr/analytics/page.tsx",
    "app/amyleigh/analytics/page.tsx",
    "app/amymaxwell/analytics/page.tsx",
    "app/b4byyeena/analytics/page.tsx",
    "app/babyscarlet/analytics/page.tsx",
    "app/babyyeena/analytics/page.tsx",
    "app/brooke/analytics/page.tsx",
    "app/chloeayling/analytics/page.tsx",
    "app/chloeelizabeth/analytics/page.tsx",
    "app/chloetami/analytics/page.tsx",
    "app/ellejean/analytics/page.tsx",
    "app/em/analytics/page.tsx",
    "app/freya/analytics/page.tsx",
    "app/georgiaaa/analytics/page.tsx",
    "app/josh/analytics/page.tsx",
    "app/kaceymay/analytics/page.tsx",
    "app/kaci/analytics/page.tsx",
    "app/kayley/analytics/page.tsx",
    "app/keanna/analytics/page.tsx",
    "app/kxceyrose/analytics/page.tsx",
    "app/laurdunne/analytics/page.tsx",
    "app/laylasoyoung/analytics/page.tsx",
    "app/liamm/analytics/page.tsx",
    "app/libby/analytics/page.tsx",
    "app/lou/analytics/page.tsx",
    "app/megann/analytics/page.tsx",
    "app/missbrown/analytics/page.tsx",
    "app/morgan/analytics/page.tsx",
    "app/ollie/analytics/page.tsx",
    "app/poppy/analytics/page.tsx",
    "app/sel/analytics/page.tsx",
    "app/skye/analytics/page.tsx",
    "app/sxmmermae/analytics/page.tsx"
)

foreach ($page in $analyticsPages) {
    if (Test-Path $page) {
        Write-Host "Fixing $page..."
        
        # Read the file content
        $content = Get-Content $page -Raw
        
        # Fix 1: Remove duplicate click_type in interface
        $content = $content -replace 'click_type\?\s*:\s*string;\s*//\s*Added for click tracking\s*\n\s*click_type\?\s*:\s*string;\s*//\s*Added for click tracking', 'click_type?: string; // Added for click tracking'
        
        # Fix 2: Add click_type to interface if missing
        if ($content -notmatch 'click_type\?\s*:\s*string') {
            $content = $content -replace '(\s*created_at:\s*string;\s*)', '$1`n  click_type?: string; // Added for click tracking'
        }
        
        # Fix 3: Remove duplicate variable declarations
        $content = $content -replace '(// Calculate click tracking statistics\s+const clickStats = analyticsData\.reduce\([^}]+\);\s+\n\s+const pageVisits = clickStats\.page_visit \|\| 0;\s+const exclusiveContentClicks = clickStats\.exclusive_content \|\| 0;\s+const subscribeClicks = clickStats\.subscribe_now \|\| 0;\s+const viewAllContentClicks = clickStats\.view_all_content \|\| 0;\s+\n\s+){2,}', '$1'
        
        # Fix 4: Remove duplicate JSX sections (Click Tracking cards)
        $clickTrackingPattern = '(\s*\{/\* Click Tracking \*/\s*<Card className="mb-8 border-\[#B19272\]">\s*<CardHeader>\s*<CardTitle className="text-gray-900">Click Tracking</CardTitle>\s*<p className="text-gray-600">Track interactions with your content and buttons</p>\s*</CardHeader>\s*<CardContent>\s*<div className="grid grid-cols-1 md:grid-cols-4 gap-4">\s*<div className="text-center p-4 bg-gray-50 rounded-lg">\s*<div className="text-2xl font-bold text-\[#B19272\]">\{pageVisits\}</div>\s*<div className="text-sm text-gray-600">Page Visits</div>\s*</div>\s*<div className="text-center p-4 bg-gray-50 rounded-lg">\s*<div className="text-2xl font-bold text-\[#B19272\]">\{exclusiveContentClicks\}</div>\s*<div className="text-sm text-gray-600">Exclusive Content Clicks</div>\s*</div>\s*<div className="text-center p-4 bg-gray-50 rounded-lg">\s*<div className="text-2xl font-bold text-\[#B19272\]">\{subscribeClicks\}</div>\s*<div className="text-sm text-gray-600">Subscribe Clicks</div>\s*</div>\s*<div className="text-center p-4 bg-gray-50 rounded-lg">\s*<div className="text-2xl font-bold text-\[#B19272\]">\{viewAllContentClicks\}</div>\s*<div className="text-sm text-gray-600">View All Content Clicks</div>\s*</div>\s*</div>\s*\{/\* Conversion Rates \*/\s*<div className="mt-6 pt-6 border-t border-gray-200">\s*<h4 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rates</h4>\s*<div className="grid grid-cols-1 md:grid-cols-3 gap-4">\s*<div className="text-center">\s*<div className="text-xl font-bold text-\[#B19272\]">\s*\{pageVisits > 0 \? \(\(exclusiveContentClicks / pageVisits\) \* 100\)\.toFixed\(1\) : 0\}%\s*</div>\s*<div className="text-sm text-gray-600">Exclusive Content CTR</div>\s*</div>\s*<div className="text-center">\s*<div className="text-xl font-bold text-\[#B19272\]">\s*\{pageVisits > 0 \? \(\(subscribeClicks / pageVisits\) \* 100\)\.toFixed\(1\) : 0\}%\s*</div>\s*<div className="text-sm text-gray-600">Subscribe CTR</div>\s*</div>\s*<div className="text-center">\s*<div className="text-xl font-bold text-\[#B19272\]">\s*\{pageVisits > 0 \? \(\(viewAllContentClicks / pageVisits\) \* 100\)\.toFixed\(1\) : 0\}%\s*</div>\s*<div className="text-sm text-gray-600">View All CTR</div>\s*</div>\s*</div>\s*</div>\s*</CardContent>\s*</Card>\s*\n\s*){2,}', '$1'
        
        # Write the fixed content back
        Set-Content $page $content -Encoding UTF8
        
        Write-Host "Fixed $page"
    } else {
        Write-Host "File not found: $page"
    }
}

Write-Host "All analytics pages have been fixed!" 