# PowerShell script to update all profile pages with Brooke page styling

$pages = @(
    "aimee",
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
        Write-Host "Updating $filePath..."
        
        # Read the file content
        $content = Get-Content $filePath -Raw
        
        # Replace background from white to black
        $content = $content -replace 'bg-white', 'bg-black'
        
        # Replace card styling
        $content = $content -replace 'border-gray-200 bg-white shadow-lg', 'border-[#B6997B]/50 bg-[#B6997B]/10 shadow-lg backdrop-blur-sm'
        
        # Replace premium badge styling
        $content = $content -replace 'text-yellow-500', 'text-[#8B7355]'
        $content = $content -replace 'bg-yellow-100 text-yellow-700 border-yellow-200', 'bg-[#B6997B]/30 text-[#8B7355] border-[#B6997B]/50'
        
        # Replace avatar styling
        $content = $content -replace 'bg-gray-200', 'bg-[#B6997B]/60'
        $content = $content -replace 'border-white', 'border-[#B6997B]/20'
        $content = $content -replace 'bg-gray-100 text-gray-600', 'bg-[#B6997B]/20 text-[#8B7355]'
        
        # Replace verified badge styling
        $content = $content -replace 'bg-blue-500', 'bg-[#B6997B]/80'
        $content = $content -replace 'ring-white', 'ring-[#B6997B]/20'
        
        # Replace name styling
        $content = $content -replace 'text-gray-900', 'text-[#8B7355]'
        $content = $content -replace 'text-yellow-500', 'text-[#B6997B]'
        
        # Replace platform badge styling
        $content = $content -replace 'bg-gray-100', 'bg-[#B6997B]/10'
        $content = $content -replace 'bg-gray-200', 'bg-[#B6997B]/20'
        $content = $content -replace 'text-gray-700', 'text-[#8B7355]'
        
        # Add border to platform badge
        $content = $content -replace 'rounded-full px-4 py-2', 'rounded-full px-4 py-2 border border-[#B6997B]/30'
        
        # Replace content card styling
        $content = $content -replace 'border-gray-200 bg-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300', 'border-[#B6997B]/50 bg-[#B6997B]/10 shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm'
        
        # Replace overlay
        $content = $content -replace 'bg-black/20', 'bg-black/30'
        
        # Replace content badge
        $content = $content -replace 'bg-gray-900 text-white border-0', 'bg-[#B6997B]/80 text-white border-0'
        $content = $content -replace 'OF', 'Exclusive Content'
        
        # Replace lock icon styling
        $content = $content -replace 'bg-black/50 backdrop-blur-sm text-white', 'bg-[#B6997B]/40 backdrop-blur-sm text-[#8B7355] border border-[#B6997B]/50'
        
        # Replace button styling
        $content = $content -replace 'bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 shadow-lg', 'bg-[#B6997B]/60 hover:bg-[#B6997B]/70 text-white font-semibold py-3 shadow-lg backdrop-blur-sm'
        $content = $content -replace 'border-gray-300 text-gray-700 hover:bg-gray-50', 'border-[#B6997B]/50 text-[#8B7355] hover:bg-[#B6997B]/20 backdrop-blur-sm'
        
        # Remove footer text
        $content = $content -replace '<p className="text-gray-500 text-sm">\s*Join thousands of fans enjoying exclusive content\s*</p>', ''
        
        # Write the updated content back to the file
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        
        Write-Host "Updated $filePath successfully!"
    } else {
        Write-Host "File $filePath not found!"
    }
}

Write-Host "All pages updated successfully!" 