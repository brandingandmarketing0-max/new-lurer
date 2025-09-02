# PowerShell script to update all pages to use unified /api/track API

Write-Host "🚀 Starting migration to unified /api/track API..." -ForegroundColor Green

# Get all page.tsx files that might need updating
$pageFiles = Get-ChildItem -Path "app" -Recurse -Name "page.tsx" | Where-Object { $_ -notlike "*analytics*" }

$updatedCount = 0
$totalCount = $pageFiles.Count

Write-Host "📊 Found $totalCount page files to check..." -ForegroundColor Yellow

foreach ($file in $pageFiles) {
    $fullPath = "app\$file"
    $content = Get-Content $fullPath -Raw
    
    # Check if this file uses dedicated analytics API
    if ($content -match "/api/[^/]+-analytics") {
        Write-Host "🔄 Updating: $fullPath" -ForegroundColor Cyan
        
        # Extract the page name from the file path
        $pageName = ($file -split "/")[1]
        
        # Replace all instances of dedicated analytics API with unified API
        $content = $content -replace "/api/[^/]+-analytics", "/api/track"
        
        # Update the page name in the payload (if it exists)
        if ($content -match 'page:\s*"[^"]*"') {
            $content = $content -replace 'page:\s*"[^"]*"', "page: `"$pageName`""
        }
        
        # Write the updated content back
        Set-Content -Path $fullPath -Value $content -NoNewline
        
        $updatedCount++
        Write-Host "✅ Updated: $fullPath (page: $pageName)" -ForegroundColor Green
    } else {
        Write-Host "⏭️ Skipped: $fullPath (already using unified API)" -ForegroundColor Gray
    }
}

Write-Host "`n🎉 Migration completed!" -ForegroundColor Green
Write-Host "📈 Updated $updatedCount out of $totalCount files" -ForegroundColor Yellow

# Now let's delete the old dedicated API files
Write-Host "`n🗑️ Deleting old dedicated analytics API files..." -ForegroundColor Red

$apiFiles = Get-ChildItem -Path "app/api" -Recurse -Name "route.ts" | Where-Object { $_ -like "*-analytics*" }

$deletedCount = 0
foreach ($apiFile in $apiFiles) {
    $fullPath = "app/api\$apiFile"
    if (Test-Path $fullPath) {
        Remove-Item $fullPath -Force
        $deletedCount++
        Write-Host "🗑️ Deleted: $fullPath" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Cleanup completed!" -ForegroundColor Green
Write-Host "📉 Deleted $deletedCount old API files" -ForegroundColor Yellow

Write-Host "`n✨ All pages now use the unified /api/track API!" -ForegroundColor Green