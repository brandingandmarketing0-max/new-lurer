# PowerShell script to add authentication to all analytics pages

$analyticsPages = @(
    "abbiehall/analytics/page.tsx",
    "aimee/analytics/page.tsx", 
    "amberr/analytics/page.tsx",
    "amyleigh/analytics/page.tsx",
    "amymaxwell/analytics/page.tsx",
    "b4byyeena/analytics/page.tsx",
    "babyscarlet/analytics/page.tsx",
    "babyyeena/analytics/page.tsx",
    "brooke/analytics/page.tsx",
    "chloeayling/analytics/page.tsx",
    "chloeelizabeth/analytics/page.tsx",
    "chloetami/analytics/page.tsx",
    "ellejean/analytics/page.tsx",
    "em/analytics/page.tsx",
    "freya/analytics/page.tsx",
    "georgiaaa/analytics/page.tsx",
    "josh/analytics/page.tsx",
    "kaceymay/analytics/page.tsx",
    "kaci/analytics/page.tsx",
    "kayley/analytics/page.tsx",
    "keanna/analytics/page.tsx",
    "kxceyrose/analytics/page.tsx",
    "laurdunne/analytics/page.tsx",
    "laylasoyoung/analytics/page.tsx",
    "liamm/analytics/page.tsx",
    "libby/analytics/page.tsx",
    "lou/analytics/page.tsx",
    "megann/analytics/page.tsx",
    "missbrown/analytics/page.tsx",
    "morgan/analytics/page.tsx",
    "ollie/analytics/page.tsx",
    "poppy/analytics/page.tsx",
    "sel/analytics/page.tsx",
    "skye/analytics/page.tsx",
    "sxmmermae/analytics/page.tsx"
)

foreach ($page in $analyticsPages) {
    $filePath = "app/$page"
    
    if (Test-Path $filePath) {
        Write-Host "Processing $filePath"
        
        # Read the file content
        $content = Get-Content $filePath -Raw
        
        # Add import for ProtectedRoute
        if ($content -notmatch "import.*ProtectedRoute") {
            $content = $content -replace "import Link from ""next/link"";", "import Link from ""next/link"";`nimport { ProtectedRoute } from ""@/components/auth/protected-route"";"
        }
        
        # Wrap the main return with ProtectedRoute
        if ($content -notmatch "<ProtectedRoute>") {
            # Find the main return statement and wrap it
            $content = $content -replace "(\s+)return \(", "`$1return (`n`$1  <ProtectedRoute>`n`$1    "
            
            # Find the closing of the main div and add closing ProtectedRoute tag
            $content = $content -replace "(\s+)(</div>\s*</div>\s*\);\s*})", "`$1`$1</ProtectedRoute>`n`$1`$2"
        }
        
        # Write the updated content back
        Set-Content $filePath $content -Encoding UTF8
        Write-Host "Updated $filePath"
    } else {
        Write-Host "File not found: $filePath"
    }
}

Write-Host "Authentication protection added to all analytics pages!"


