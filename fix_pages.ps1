# PowerShell script to fix all profile pages with proper Brooke page styling

$pages = @(
    "amberr", 
    "amyleigh",
    "amymaxwell",
    "b4byyeena",
    "babyscarlet",
    "babyyeena",
    "broke",
    "chloeayling",
    "chloeelizabeth",
    "chloetami",
    "ellejean",
    "em",
    "freya",
    "georgiaaa",
    "josh",
    "kaceymay",
    "kaci",
    "kayley",
    "keanna",
    "kxceyrose",
    "laurdunne",
    "laylasoyoung",
    "liamm",
    "libby",
    "lou",
    "megann",
    "missbrown",
    "morgan",
    "ollie",
    "poppy",
    "sel",
    "skye",
    "sxmmermae"
)

foreach ($page in $pages) {
    $filePath = "app/$page/page.tsx"
    
    if (Test-Path $filePath) {
        Write-Host "Fixing $filePath..."
        
        # Read the file content
        $content = Get-Content $filePath -Raw
        
        # Fix function name if it got corrupted
        $content = $content -replace 'function PrExclusive ContentilePage\(\)', 'function ProfilePage()'
        $content = $content -replace 'function Pr.*Page\(\)', 'function ProfilePage()'
        
        # Fix card styling - more specific replacements
        $content = $content -replace 'border border-gray-200 bg-black shadow-lg', 'border border-[#B6997B]/50 bg-[#B6997B]/10 shadow-lg backdrop-blur-sm'
        $content = $content -replace 'border border-gray-200 bg-white shadow-lg', 'border border-[#B6997B]/50 bg-[#B6997B]/10 shadow-lg backdrop-blur-sm'
        
        # Fix content card styling
        $content = $content -replace 'border border-gray-200 bg-black shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300', 'border border-[#B6997B]/50 bg-[#B6997B]/10 shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm'
        
        # Fix platform badge background
        $content = $content -replace 'bg-\[#B6997B\]/60 p-1', 'bg-[#B6997B]/20 p-1'
        
        # Fix logo path
        $content = $content -replace 'Exclusive Content-logo\.png', 'of-logo.png'
        
        # Fix sparkles color
        $content = $content -replace 'text-\[#8B7355\]', 'text-[#B6997B]'
        
        # Fix button styling
        $content = $content -replace 'border-gray-300 text-\[#8B7355\] hover:bg-gray-50', 'border-[#B6997B]/50 text-[#8B7355] hover:bg-[#B6997B]/20 backdrop-blur-sm'
        
        # Remove any corrupted footer text
        $content = $content -replace '<p className="text-gray-500 text-sm">\s*.*?</p>', ''
        $content = $content -replace '<p className="text-gray-500 text-sm">\s*</p>', ''
        
        # Write the updated content back to the file
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        
        Write-Host "Fixed $filePath successfully!"
    } else {
        Write-Host "File $filePath not found!"
    }
}

Write-Host "All pages fixed successfully!" 