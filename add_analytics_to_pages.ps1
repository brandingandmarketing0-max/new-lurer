# PowerShell script to add analytics tracking to all profile pages
# This script will add the useAnalytics hook to all profile pages

$pages = @(
    "abbiehall", "aimee", "amberr", "amyleigh", "amymaxwell", 
    "b4byyeena", "babyscarlet", "babyyeena", "brooke", "chloeayling", 
    "chloeelizabeth", "chloetami", "ellejean", "em", "freya", 
    "georgiaaa", "josh", "kaceymay", "kaci", "kayley", 
    "keanna", "kxceyrose", "laurdunne", "laylasoyoung", "liamm", 
    "libby", "lou", "megann", "missbrown", "morgan", 
    "ollie", "poppy", "sel", "skye", "sxmmermae"
)

foreach ($page in $pages) {
    $filePath = "app/$page/page.tsx"
    
    if (Test-Path $filePath) {
        Write-Host "Processing $page..."
        
        # Read the file content
        $content = Get-Content $filePath -Raw
        
        # Check if it's already a client component
        if ($content -notmatch '"use client"') {
            # Add "use client" at the beginning
            $content = '"use client";' + "`n`n" + $content
        }
        
        # Add the import for useAnalytics if not already present
        if ($content -notmatch "useAnalytics") {
            # Find the import section and add the useAnalytics import
            $content = $content -replace "import \{ Lock, Heart, Eye, Share2, Star, Crown, Sparkles \}", "import { Lock, Heart, Eye, Share2, Star, Crown, Sparkles, BarChart3 }"
            $content = $content -replace "import \{ Lock, Heart, Eye, Share2, Star, Crown, Sparkles, BarChart3 \}", "import { Lock, Heart, Eye, Share2, Star, Crown, Sparkles, BarChart3 }`nimport { useAnalytics } from '@/hooks/use-analytics'"
        }
        
        # Add the useAnalytics hook call if not already present
        if ($content -notmatch "useAnalytics\('$page'\)") {
            # Find the function declaration and add the hook call
            $content = $content -replace "export default function ProfilePage\(\) \{", "export default function ProfilePage() {`n  // Track analytics for this page`n  useAnalytics('$page');`n"
        }
        
        # Add analytics dashboard link if not already present
        if ($content -notmatch "View Analytics") {
            # Find the footer section and add the analytics link
            $content = $content -replace "          <div className=`"mt-6 text-center`">`n           `n          </div>", "          <div className=`"mt-6 text-center`">`n            <Link href=`"/$page/analytics`">`n              <Button variant=`"ghost`" className=`"text-[#8B7355] hover:text-[#B6997B] hover:bg-[#B6997B]/10`">`n                <BarChart3 className=`"h-4 w-4 mr-2`" />`n                View Analytics`n              </Button>`n            </Link>`n          </div>"
        }
        
        # Write the updated content back to the file
        Set-Content $filePath $content -Encoding UTF8
        
        Write-Host "Updated $page successfully!"
    } else {
        Write-Host "File not found: $filePath"
    }
}

Write-Host "Analytics tracking has been added to all pages!" 