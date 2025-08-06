# PowerShell script to create analytics dashboard pages for all profiles

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
    $analyticsDir = "app/$page/analytics"
    $analyticsPagePath = "$analyticsDir/page.tsx"
    
    # Create analytics directory if it doesn't exist
    if (!(Test-Path $analyticsDir)) {
        New-Item -ItemType Directory -Path $analyticsDir -Force
        Write-Host "Created directory: $analyticsDir"
    }
    
    # Create the analytics page if it doesn't exist
    if (!(Test-Path $analyticsPagePath)) {
        $pageContent = @"
import AnalyticsDashboard from "@/components/analytics-dashboard";

export default function ${page}AnalyticsPage() {
  return <AnalyticsDashboard pageName="$page" />;
}
"@
        
        Set-Content $analyticsPagePath $pageContent -Encoding UTF8
        Write-Host "Created analytics page for $page"
    } else {
        Write-Host "Analytics page already exists for $page"
    }
}

Write-Host "All analytics dashboard pages have been created!" 