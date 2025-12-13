import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

// Decode char code arrays to URLs
function decodeCharCodes(chars: number[]): string {
  return chars.map(c => String.fromCharCode(c)).join('');
}

// Extract char code array from code (multiple patterns)
function extractCharCodeArray(content: string): number[] | null {
  // Pattern 1: const chars = [104, 116, 116, ...];
  let regex = /const\s+chars\s*=\s*\[([0-9,\s]+)\]/s;
  let match = content.match(regex);
  if (match) {
    const chars = match[1].split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
    if (chars.length > 0) return chars;
  }
  
  // Pattern 2: chars = [104, 116, 116, ...] (without const)
  regex = /chars\s*=\s*\[([0-9,\s]+)\]/s;
  match = content.match(regex);
  if (match) {
    const chars = match[1].split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
    if (chars.length > 0) return chars;
  }
  
  return null;
}

// Get base URL from getObfuscatedImageUrl function
function extractImageBaseUrl(content: string): string | null {
  const regex = /String\.fromCharCode\(([0-9,\s]+)\)/;
  const match = content.match(regex);
  if (match) {
    const chars = match[1].split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
    if (chars.length > 0) {
      return decodeCharCodes(chars);
    }
  }
  return null;
}

// Extract image IDs from getObfuscatedImageUrl calls
function extractImageIds(content: string): string[] {
  const matches = [...content.matchAll(/getObfuscatedImageUrl\(["']([^"']+)["']\)/g)];
  return matches.map(m => m[1]).filter((v, i, a) => a.indexOf(v) === i); // unique
}

// Extract hardcoded image URLs (full URLs in img.src assignments and JSX src attributes)
function extractHardcodedImageUrls(content: string): string[] {
  const patterns = [
    // JavaScript: img.src = "https://..."
    /img\.src\s*=\s*["'](https?:\/\/[^"']+)["']/gi,
    // JSX: src="https://..." or src={"https://..."}
    /src\s*=\s*\{?["'](https?:\/\/[^"']+)["']\}?/gi,
    // JSX with conditional: src={imagesLoaded ? "https://..." : ""}
    /src\s*=\s*\{[^}]*\?["'](https?:\/\/[^"']+)["']/gi,
  ];
  
  const urls: string[] = [];
  for (const pattern of patterns) {
    const matches = [...content.matchAll(pattern)];
    for (const match of matches) {
      if (match[1] && match[1].startsWith('http')) {
        // Filter out verified badge URLs (they contain specific IDs)
        if (!match[1].includes('XQC8QM7wDFrt98ZBhgCmgTM2aZbQ3nqXNLtGe4hVci06FUJk')) {
          urls.push(match[1]);
        }
      }
    }
  }
  return urls.filter((v, i, a) => a.indexOf(v) === i); // unique
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ 
        success: false, 
        error: "Slug parameter is required" 
      }, { status: 400 });
    }

    const pagePath = path.join(process.cwd(), 'app', slug, 'page.tsx');
    
    if (!fs.existsSync(pagePath)) {
      return NextResponse.json({ 
        success: false, 
        error: "Page file not found",
        exists: false
      }, { status: 404 });
    }

    const content = fs.readFileSync(pagePath, 'utf-8');
    
    // Extract data
    const extracted: any = {
      slug,
      title: null,
      subtitle: null,
      avatar_url: null,
      exclusive_preview_image: null,
      links: []
    };

    // 1. Extract NAME/TITLE (from h1 tag)
    const h1Matches = [...content.matchAll(/<h1[^>]*>([^<]+)<\/h1>/gi)];
    if (h1Matches.length > 0) {
      let nameText = h1Matches[0][1].trim();
      nameText = nameText.replace(/\s*<[^>]+>.*$/, '').trim();
      extracted.title = nameText || slug.charAt(0).toUpperCase() + slug.slice(1);
    } else {
      extracted.title = slug.charAt(0).toUpperCase() + slug.slice(1);
    }

    // 2. Extract BIO/SUBTITLE
    const bioPatterns = [
      /<p[^>]*className[^>]*text-sm[^>]*>([^<]+)<\/p>/i,
      /subtitle[:\s]*["']([^"']+)["']/i,
      /ngl,?\s+([^"']+)/i,
      /<p[^>]*text-\[#8B7355\][^>]*>([^<]+)<\/p>/i
    ];
    
    for (const pattern of bioPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        extracted.subtitle = match[1].trim();
        break;
      }
    }

    // 3. Extract AVATAR URL (the image in the circle before the name)
    const imageBaseUrl = extractImageBaseUrl(content);
    let avatarUrl: string | null = null;
    
    // Priority 1: Find avatar in JavaScript assignment near avatarContainer
    // Pattern: avatarContainer ... img.src = "https://..."
    const avatarJSAssignment = content.match(/avatarContainer[^]{0,1500}?img\.src\s*=\s*["'](https?:\/\/[^"']+)["']/is);
    if (avatarJSAssignment && avatarJSAssignment[1] && !avatarJSAssignment[1].includes('XQC8QM7wDFrt98ZBhgCmgTM2aZbQ3nqXNLtGe4hVci06FUJk')) {
      avatarUrl = avatarJSAssignment[1];
    }
    
    // Priority 2: Find avatar using getObfuscatedImageUrl near avatarContainer
    if (!avatarUrl) {
      const avatarObfuscatedMatch = content.match(/avatarContainer[^]{0,1500}?getObfuscatedImageUrl\(["']([^"']+)["']\)/is);
      if (avatarObfuscatedMatch && avatarObfuscatedMatch[1] && imageBaseUrl) {
        avatarUrl = imageBaseUrl + avatarObfuscatedMatch[1];
      }
    }
    
    // Priority 3: Find avatar in JSX Image component near avatar-container id
    if (!avatarUrl) {
      const avatarJSXMatch = content.match(/id=["']avatar-container["'][^]{0,1500}?(?:src|getObfuscatedImageUrl)\(?["']?([^"')]+)["']?\)?/is);
      if (avatarJSXMatch && avatarJSXMatch[1]) {
        if (avatarJSXMatch[1].startsWith('http')) {
          avatarUrl = avatarJSXMatch[1];
        } else if (imageBaseUrl) {
          avatarUrl = imageBaseUrl + avatarJSXMatch[1];
        }
      }
    }
    
    // Priority 4: Fallback - use first non-verified image from all found images
    if (!avatarUrl) {
      const hardcodedUrls = extractHardcodedImageUrls(content);
      const imageIds = imageBaseUrl ? extractImageIds(content) : [];
      
      // Filter out verified badge
      const verifiedBadgeMatch = content.match(/Verified Badge[^]{0,500}?(?:getObfuscatedImageUrl\(["']([^"']+)["']\)|["'](https?:\/\/[^"']+)["'])/is);
      const verifiedBadgeId = verifiedBadgeMatch ? (verifiedBadgeMatch[1] || verifiedBadgeMatch[2]) : null;
      
      // Try hardcoded URLs first
      if (hardcodedUrls.length > 0) {
        const nonBadgeUrl = hardcodedUrls.find(url => 
          !url.includes('XQC8QM7wDFrt98ZBhgCmgTM2aZbQ3nqXNLtGe4hVci06FUJk') &&
          url !== verifiedBadgeId
        );
        if (nonBadgeUrl) {
          avatarUrl = nonBadgeUrl;
        }
      }
      
      // Then try obfuscated
      if (!avatarUrl && imageBaseUrl && imageIds.length > 0) {
        const avatarId = imageIds.find(id => id !== verifiedBadgeId) || imageIds[0];
        if (avatarId) {
          avatarUrl = imageBaseUrl + avatarId;
        }
      }
    }
    
    if (avatarUrl) {
      extracted.avatar_url = avatarUrl;
    }

    // 4. Extract EXCLUSIVE PREVIEW IMAGE (the banner image in the exclusive content card)
    let previewUrl: string | null = null;
    
    // Priority 1: Find preview in JSX Image component near "Exclusive Content" text
    // Pattern: Exclusive Content ... src={imagesLoaded ? "https://..." : ""}
    const exclusiveJSXMatch = content.match(/Exclusive Content[^]{0,2000}?src\s*=\s*\{[^}]*\?["'](https?:\/\/[^"']+)["']/is);
    if (exclusiveJSXMatch && exclusiveJSXMatch[1] && exclusiveJSXMatch[1] !== extracted.avatar_url) {
      previewUrl = exclusiveJSXMatch[1];
    }
    
    // Priority 2: Find preview using getObfuscatedImageUrl near "Exclusive Content"
    if (!previewUrl) {
      const exclusiveObfuscatedMatch = content.match(/Exclusive Content[^]{0,2000}?getObfuscatedImageUrl\(["']([^"']+)["']\)/is);
      if (exclusiveObfuscatedMatch && exclusiveObfuscatedMatch[1] && imageBaseUrl) {
        const candidateUrl = imageBaseUrl + exclusiveObfuscatedMatch[1];
        if (candidateUrl !== extracted.avatar_url) {
          previewUrl = candidateUrl;
        }
      }
    }
    
    // Priority 3: Find preview in Image component with alt="Exclusive Content Preview"
    if (!previewUrl) {
      const previewAltMatch = content.match(/alt=["']Exclusive Content Preview["'][^]{0,500}?src\s*=\s*\{[^}]*\?["'](https?:\/\/[^"']+)["']/is);
      if (previewAltMatch && previewAltMatch[1] && previewAltMatch[1] !== extracted.avatar_url) {
        previewUrl = previewAltMatch[1];
      }
    }
    
    // Priority 4: Fallback - use the image that's NOT the avatar
    if (!previewUrl) {
      const hardcodedUrls = extractHardcodedImageUrls(content);
      const imageIds = imageBaseUrl ? extractImageIds(content) : [];
      
      // Filter out verified badge
      const verifiedBadgeMatch = content.match(/Verified Badge[^]{0,500}?(?:getObfuscatedImageUrl\(["']([^"']+)["']\)|["'](https?:\/\/[^"']+)["'])/is);
      const verifiedBadgeId = verifiedBadgeMatch ? (verifiedBadgeMatch[1] || verifiedBadgeMatch[2]) : null;
      
      // Try hardcoded URLs - find one that's not avatar and not verified badge
      if (hardcodedUrls.length > 0) {
        const previewCandidate = hardcodedUrls.find(url => 
          url !== extracted.avatar_url && 
          url !== verifiedBadgeId &&
          !url.includes('XQC8QM7wDFrt98ZBhgCmgTM2aZbQ3nqXNLtGe4hVci06FUJk')
        );
        if (previewCandidate) {
          previewUrl = previewCandidate;
        } else if (hardcodedUrls.length > 1) {
          // If multiple URLs, use the last one (preview usually comes after avatar)
          previewUrl = hardcodedUrls[hardcodedUrls.length - 1];
        }
      }
      
      // Try obfuscated - find one that's not avatar and not verified badge
      if (!previewUrl && imageBaseUrl && imageIds.length > 0) {
        // Extract avatar ID if we found avatar URL
        let knownAvatarId: string | null = null;
        if (extracted.avatar_url && imageBaseUrl) {
          const avatarIdFromUrl = extracted.avatar_url.replace(imageBaseUrl, '');
          if (avatarIdFromUrl && imageIds.includes(avatarIdFromUrl)) {
            knownAvatarId = avatarIdFromUrl;
          }
        }
        
        const previewId = imageIds.find(id => 
          id !== verifiedBadgeId && 
          id !== knownAvatarId
        ) || (imageIds.length > 1 ? imageIds[imageIds.length - 1] : imageIds[0]);
        
        if (previewId && imageBaseUrl) {
          previewUrl = imageBaseUrl + previewId;
        }
      }
    }
    
    if (previewUrl && previewUrl !== extracted.avatar_url) {
      extracted.exclusive_preview_image = previewUrl;
    }

    // 5. Extract SUBSCRIBE URL (from decodeUrl function)
    let subscribeUrl: string | null = null;
    
    // Try to find decodeUrl function with char codes
    const decodeUrlChars = extractCharCodeArray(content);
    if (decodeUrlChars && decodeUrlChars.length > 10) { // Make sure it's a real URL, not just a few chars
      const decodedUrl = decodeCharCodes(decodeUrlChars);
      // Verify it looks like a URL
      if (decodedUrl.startsWith('http')) {
        subscribeUrl = decodedUrl;
      }
    }
    
    // If decodeUrl just returns window.location.href, look for URL in comments or other places
    if (!subscribeUrl) {
      // Look for OnlyFans URL in comments: // https://onlyfans.com/...
      const commentMatch = content.match(/\/\/\s*https?:\/\/onlyfans\.com\/[^\s\n]+/i);
      if (commentMatch) {
        subscribeUrl = commentMatch[0].replace(/^\/\/\s*/, '');
      }
      
      // Look for OnlyFans URL in string literals
      if (!subscribeUrl) {
        const urlMatch = content.match(/https?:\/\/onlyfans\.com\/[^\s"')]+/i);
        if (urlMatch) {
          subscribeUrl = urlMatch[0];
        }
      }
      
      // Look for OnlyFans domain pattern
      if (!subscribeUrl) {
        const domainMatch = content.match(/onlyfans\.com\/[a-zA-Z0-9_\/]+/i);
        if (domainMatch) {
          subscribeUrl = 'https://' + domainMatch[0];
        }
      }
    }
    
    // Add links if we found a URL
    if (subscribeUrl) {
      extracted.links.push({
        label: 'Exclusive Content',
        url: subscribeUrl,
        sort_order: 0
      });
      extracted.links.push({
        label: 'Subscribe Now',
        url: subscribeUrl,
        sort_order: 1
      });
    }

    // Debug info
    const hardcodedUrls = extractHardcodedImageUrls(content);
    const imageIds = extractImageIds(content);
    const debug = {
      foundTitle: !!extracted.title,
      foundSubtitle: !!extracted.subtitle,
      foundAvatar: !!extracted.avatar_url,
      foundPreview: !!extracted.exclusive_preview_image,
      foundLinks: extracted.links.length,
      imageBaseUrl: imageBaseUrl || null,
      imageIdsCount: imageIds.length,
      hardcodedUrlsCount: hardcodedUrls.length,
      avatarUrl: extracted.avatar_url || null,
      previewUrl: extracted.exclusive_preview_image || null
    };

    return NextResponse.json({ 
      success: true,
      exists: true,
      data: extracted,
      debug: debug // Include debug info to help troubleshoot
    });

  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to extract data" 
    }, { status: 500 });
  }
}

