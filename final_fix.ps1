# Final script to fix remaining color inconsistencies

$pages = @(
    "abbiehall",
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
        Write-Host "Final fix for $filePath..."
        
        # Read the file content
        $content = Get-Content $filePath -Raw
        
        # Fix color inconsistencies - Crown icon should be #8B7355
        $content = $content -replace 'text-\[#B6997B\]', 'text-[#8B7355]'
        
        # Fix badge text color
        $content = $content -replace 'text-\[#B6997B\] border-\[#B6997B\]/50', 'text-[#8B7355] border-[#B6997B]/50'
        
        # Fix avatar fallback text color
        $content = $content -replace 'text-\[#B6997B\] text-2xl', 'text-[#8B7355] text-2xl'
        
        # Fix name text color
        $content = $content -replace 'text-\[#B6997B\] flex items-center', 'text-[#8B7355] flex items-center'
        
        # Fix platform badge text color
        $content = $content -replace 'text-\[#B6997B\] font-medium', 'text-[#8B7355] font-medium'
        
        # Fix lock icon text color
        $content = $content -replace 'text-\[#B6997B\] border border-\[#B6997B\]/50', 'text-[#8B7355] border border-[#B6997B]/50'
        
        # Fix button text color
        $content = $content -replace 'text-\[#B6997B\] hover:bg-\[#B6997B\]/20', 'text-[#8B7355] hover:bg-[#B6997B]/20'
        
        # Fix comments that got corrupted
        $content = $content -replace 'PrExclusive Contentile Card', 'Profile Card'
        $content = $content -replace 'PrExclusive Contentile Header', 'Profile Header'
        
        # Write the updated content back to the file
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        
        Write-Host "Final fix completed for $filePath!"
    } else {
        Write-Host "File $filePath not found!"
    }
}

Write-Host "All final fixes completed successfully!" 