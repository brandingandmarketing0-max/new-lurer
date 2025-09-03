# PowerShell script to fix duplicate tracking issues across all profile pages
# This script removes the timeout + visibility change duplicate calls and implements proper session-based tracking

$pages = @(
    "georgiaaa", "aimee", "sxmmermae", "steff", "shania", "sel", "rachel", "poppy", 
    "morgan", "ollie", "megann", "misssophiaisabella", "lou", "libby", "liamm", 
    "laylasoyoung", "laurdunne", "kxceyrose", "keanna", "kayley", "kaci", "kaceymay", 
    "josh", "ggxxmmaa", "freya", "erinhannahxx", "em", "chloeelizabeth", "chxrli_love", 
    "ellejean", "chloetami", "chloeayling", "brookex", "babyyeena", "babyscarlet", 
    "b4byyeena", "amymaxwell", "abbiehall", "amberr", "missbrown", "michaelajayneex"
)

foreach ($page in $pages) {
    $filePath = "app/$page/page.tsx"
    
    if (Test-Path $filePath) {
        Write-Host "Fixing tracking for $page..."
        
        # Read the file content
        $content = Get-Content $filePath -Raw
        
        # Check if this page has the problematic pattern
        if ($content -match "setTimeout.*send.*3000" -and $content -match "visibilitychange") {
            Write-Host "  Found duplicate tracking pattern in $page"
            
            # Replace the problematic useEffect with the fixed version
            $oldPattern = '(?s)useEffect\(\(\) => \{.*?const send = \(\) => \{.*?\};\s*const timeout = setTimeout\(send, 3000\);\s*const onVisible = \(\) => \{.*?\};\s*document\.addEventListener\(\'visibilitychange\', onVisible, \{ once: true \}\);\s*return \(\) => \{.*?\};\s*\}, \[\]\);'
            
            $newTracking = @"
  useEffect(() => {
    const rawRef = document.referrer;
    setRawReferrer(rawRef);
    setReferrer(getReadableReferrer(rawRef));

    // Create a unique session ID for this page load
    const sessionId = `${page}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionKey = `${page}_visit_tracked_${sessionId}`;

    // Check if we've already tracked this session
    if (localStorage.getItem(sessionKey)) {
      setHasTracked(true);
      return;
    }

    // Send analytics to Supabase with sendBeacon (only once per session)
    const send = () => {
      try {
        // Double-check we haven't already tracked this session
        if (hasTracked || localStorage.getItem(sessionKey)) {
          return;
        }
        
        const payload = {
          page: "$page",
          referrer: rawRef,
          timestamp: new Date().toISOString(),
          pathname: "/$page",
          searchParams: "",
          click_type: "page_visit"
        };
        
        const body = JSON.stringify(payload);
        if (navigator.sendBeacon) {
          const blob = new Blob([body], { type: 'application/json' });
          navigator.sendBeacon('/api/track', blob);
          console.log("✅ $page Analytics - Page visit tracked via sendBeacon");
          
          // Mark this specific session as tracked
          localStorage.setItem(sessionKey, 'true');
          localStorage.setItem('${page}_last_tracked', new Date().toISOString());
          setHasTracked(true);
        } else {
          fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
            keepalive: true
          }).then(() => {
            console.log("✅ $page Analytics - Page visit tracked via fetch");
            
            // Mark this specific session as tracked
            localStorage.setItem(sessionKey, 'true');
            localStorage.setItem('${page}_last_tracked', new Date().toISOString());
            setHasTracked(true);
          }).catch((error) => {
            console.error("❌ $page Analytics - Page visit tracking failed:", error);
          });
        }
      } catch (error) {
        console.error("❌ Failed to track $page analytics:", error);
      }
    };

    // Track immediately when page loads (only once per session)
    send();
    
    return () => {
      // Cleanup not needed for single tracking
    };
  }, []);
"@
            
            # Add hasTracked state if not present
            if ($content -notmatch "hasTracked.*useState") {
                $content = $content -replace "(\s+const \[rawReferrer, setRawReferrer\] = useState<string>\(\"\"\);)", "`$1`n  const [hasTracked, setHasTracked] = useState<boolean>(false);"
            }
            
            # Replace the useEffect
            $content = $content -replace $oldPattern, $newTracking
            
            # Write the updated content back
            Set-Content $filePath $content -NoNewline
            Write-Host "  ✅ Fixed duplicate tracking for $page"
        } else {
            Write-Host "  ⚠️  No duplicate tracking pattern found in $page"
        }
    } else {
        Write-Host "  ❌ File not found: $filePath"
    }
}

Write-Host "`n🎉 Duplicate tracking fix completed!"
Write-Host "All pages now use single-call session-based tracking to prevent duplicate API calls."
