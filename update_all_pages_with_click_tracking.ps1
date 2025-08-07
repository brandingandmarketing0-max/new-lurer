# PowerShell script to update all profile pages with click tracking functionality

$pages = @(
    "amyleigh",
    "amymaxwell", 
    "b4byyeena",
    "babyscarlet",
    "babyyeena",
    "brooke",
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
        Write-Host "Updating $page page..."
        
        # Read the file content
        $content = Get-Content $filePath -Raw
        
        # Add click_type to the initial analytics call
        $content = $content -replace 'searchParams: "",', 'searchParams: "",`n        click_type: "page_visit"'
        
        # Add click tracking functions after the useEffect
        $clickTrackingFunctions = @"

  // Click tracking functions
  const trackClick = async (clickType: string) => {
    try {
      await fetch("/api/$page-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: "$page",
          referrer: rawReferrer,
          timestamp: new Date().toISOString(),
          pathname: "/$page",
          searchParams: "",
          click_type: clickType
        }),
      });
    } catch (error) {
      console.error(`Failed to track ${clickType} click:`, error);
    }
  };

  const handleExclusiveContentClick = () => {
    trackClick("exclusive_content");
  };

  const handleSubscribeClick = () => {
    trackClick("subscribe_now");
  };

  const handleViewAllContentClick = () => {
    trackClick("view_all_content");
  };
"@
        
        # Insert click tracking functions after the useEffect
        $content = $content -replace '  }, \[\];', "  }, []);$clickTrackingFunctions"
        
        # Update content preview card
        $content = $content -replace '(\s*)\{/\* Content Preview Card - Now Clickable \*\}', '$1{/* Content Preview Card - Now Clickable with Tracking */}'
        $content = $content -replace '(\s*)<Link href="([^"]+)" target="_blank" rel="noopener noreferrer">', '$1<div onClick={handleExclusiveContentClick}>$1  <Link href="$2" target="_blank" rel="noopener noreferrer">'
        $content = $content -replace '(\s*)</Link>(\s*)(?=<!-- Action Buttons -->)', '$1  </Link>$1</div>$2'
        
        # Update action buttons
        $content = $content -replace '(\s*)<Link href="([^"]+)" target="_blank" rel="noopener noreferrer">(\s*)<Button className="w-full bg-\[#B6997B\]/60 hover:bg-\[#B6997B\]/70 text-white font-semibold py-3 shadow-lg backdrop-blur-sm">(\s*)<Heart className="h-5 w-5 mr-2" />(\s*)Subscribe Now(\s*)</Button>(\s*)</Link>', '$1<div onClick={handleSubscribeClick}>$1  <Link href="$2" target="_blank" rel="noopener noreferrer">$3    <Button className="w-full bg-[#B6997B]/60 hover:bg-[#B6997B]/70 text-white font-semibold py-3 shadow-lg backdrop-blur-sm">$4      <Heart className="h-5 w-5 mr-2" />$5      Subscribe Now$6    </Button>$7  </Link>$1</div>'
        
        $content = $content -replace '(\s*)<Link href="([^"]+)" target="_blank" rel="noopener noreferrer">(\s*)<Button variant="outline" className="[^"]*">(\s*)View All Content(\s*)</Button>(\s*)</Link>', '$1<div onClick={handleViewAllContentClick}>$1  <Link href="$2" target="_blank" rel="noopener noreferrer">$3    <Button variant="outline" className="$4">$5      View All Content$6    </Button>$7  </Link>$1</div>'
        
        # Write the updated content back to the file
        Set-Content $filePath $content -Encoding UTF8
        
        Write-Host "Updated $page page successfully!"
    } else {
        Write-Host "File $filePath not found, skipping..."
    }
}

Write-Host "All pages updated with click tracking functionality!" 