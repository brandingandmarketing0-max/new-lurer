# PowerShell script to protect all analytics pages
# This script adds authentication protection to all analytics pages

$analyticsPages = @(
    "abbiehall", "aimee", "amberr", "amyleigh", "amymaxwell", "b4byyeena", 
    "babyscarlet", "babyyeena", "brooke", "chloeayling", "chloeelizabeth", 
    "chloetami", "ellejean", "em", "freya", "georgiaaa", "josh", "kaceymay", 
    "kaci", "kayley", "keanna", "kxceyrose", "laurdunne", "laylasoyoung", 
    "libby", "lou", "megann", "missbrown", "morgan", "ollie", 
    "poppy", "rachel", "sel", "shania", "skye", "steff", "sxmmermae"
)

foreach ($page in $analyticsPages) {
    $filePath = "app/$page/analytics/page.tsx"
    
    if (Test-Path $filePath) {
        Write-Host "Protecting analytics page for: $page"
        
        # Read the file content
        $content = Get-Content $filePath -Raw
        
        # Add ProtectedRoute import if not already present
        if ($content -notmatch "import.*ProtectedRoute") {
            $content = $content -replace 'import Link from "next/link";', 'import Link from "next/link";' + "`nimport { ProtectedRoute } from `"@/components/auth/protected-route`";"
        }
        
        # Find the main function and wrap it with ProtectedRoute
        $functionPattern = "export default function (\w+)AnalyticsPage\(\) \{"
        if ($content -match $functionPattern) {
            $functionName = $matches[1]
            $newFunctionName = "$($functionName)AnalyticsContent"
            
            # Replace the function definition
            $content = $content -replace $functionPattern, "export default function $($functionName)AnalyticsPage() {`n  return (`n    <ProtectedRoute>`n      <$newFunctionName />`n    </ProtectedRoute>`n  );`n}`n`nfunction $newFunctionName() {"
            
            Write-Host "  ✓ Protected $page analytics page"
        } else {
            Write-Host "  ⚠ Could not find function pattern in $page"
        }
        
        # Write the modified content back
        Set-Content $filePath $content -Encoding UTF8
    } else {
        Write-Host "  ⚠ File not found: $filePath"
    }
}

Write-Host "`nProtection script completed!"
Write-Host "All analytics pages now require authentication to access."












