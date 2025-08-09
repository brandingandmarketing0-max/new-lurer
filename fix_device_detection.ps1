# Fix Device Detection in Analytics Pages
# This script updates the getDeviceType function in all analytics pages

$analyticsPages = @(
    "abbiehall", "aimee", "alaska", "amberr", "amyleigh", "amymaxwell",
    "b4byyeena", "babyscarlet", "babyyeena", "brooke", "chloeayling", 
    "chloeelizabeth", "chloetami", "ellejean", "em", "freya", "georgiaaa",
    "josh", "kaceymay", "kaci", "kayley", "keanna", "kxceyrose", "laurdunne",
    "laylasoyoung", "liamm", "libby", "lou", "megann", "missbrown", "morgan",
    "ollie", "poppy", "rachel", "sel", "shania", "skye", "steff", "sxmmermae"
)

foreach ($page in $analyticsPages) {
    $filePath = "app/$page/analytics/page.tsx"
    
    if (Test-Path $filePath) {
        Write-Host "Updating device detection for $page..."
        
        # Read the file content
        $content = Get-Content $filePath -Raw
        
        # Replace the getDeviceType function with improved logic
        $oldFunction = 'const getDeviceType = \(userAgent: string\) => \{
    if \(userAgent\.includes\("Mobile"\)\) return "Mobile";
    if \(userAgent\.includes\("Tablet"\)\) return "Tablet";
    return "Desktop";
  \};'
        
        $newFunction = 'const getDeviceType = (userAgent: string) => {
    if (!userAgent) return "Unknown";
    
    const ua = userAgent.toLowerCase();
    
    // Mobile detection - more comprehensive
    if (ua.includes("mobile") || 
        ua.includes("android") || 
        ua.includes("iphone") || 
        ua.includes("ipad") || 
        ua.includes("ipod") || 
        ua.includes("blackberry") || 
        ua.includes("windows phone") ||
        ua.includes("opera mini") ||
        ua.includes("mobile safari") ||
        ua.includes("mobile chrome") ||
        ua.includes("mobile firefox")) {
      return "Mobile";
    }
    
    // Tablet detection
    if (ua.includes("tablet") || 
        ua.includes("ipad") || 
        (ua.includes("android") && !ua.includes("mobile")) ||
        ua.includes("kindle")) {
      return "Tablet";
    }
    
    return "Desktop";
  };'
        
        # Replace the function
        $content = $content -replace $oldFunction, $newFunction
        
        # Write the updated content back
        Set-Content $filePath $content -Encoding UTF8
        
        Write-Host "✓ Updated $page analytics page"
    } else {
        Write-Host "⚠ File not found: $filePath"
    }
}

Write-Host "`nDevice detection update completed!"
