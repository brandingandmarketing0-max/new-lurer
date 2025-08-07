# Fix duplicate click_type property in interfaces
Write-Host "Fixing duplicate click_type properties..." -ForegroundColor Green

$analyticsFiles = Get-ChildItem -Path "app" -Recurse -Filter "page.tsx" | Where-Object { $_.FullName -like "*analytics*" }

foreach ($file in $analyticsFiles) {
    Write-Host "Processing: $($file.FullName)" -ForegroundColor Yellow
    
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Remove duplicate click_type property
    $content = $content -replace 'click_type\?: string; // Added for click tracking\s*\n\s*click_type\?: string; // Added for click tracking', 'click_type?: string; // Added for click tracking'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed duplicate click_type: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "Duplicate click_type properties fixed!" -ForegroundColor Green 