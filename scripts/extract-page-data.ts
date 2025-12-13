/**
 * Extract page data from existing TSX files
 * Extracts: name, avatar, bio, exclusive preview image, subscribe URL, exclusive content URL
 * 
 * Run: npx tsx scripts/extract-page-data.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface PageData {
  slug: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  exclusive_preview_image: string | null;
  subscribe_url: string | null;
  exclusive_content_url: string | null;
}

// Decode char code arrays to URLs
function decodeCharCodes(chars: number[]): string {
  return chars.map(c => String.fromCharCode(c)).join('');
}

// Extract char code array from code
function extractCharCodeArray(content: string, varName: string): number[] | null {
  // Match: const chars = [104, 116, 116, ...];
  const regex = new RegExp(`${varName}\\s*=\\s*\\[([0-9,\\s]+)\\]`, 's');
  const match = content.match(regex);
  if (match) {
    return match[1].split(',').map(n => parseInt(n.trim(), 10));
  }
  return null;
}

// Extract image ID from getObfuscatedImageUrl calls
function extractImageId(content: string, pattern: string): string | null {
  // Match: getObfuscatedImageUrl("IMAGE_ID")
  const regex = new RegExp(`getObfuscatedImageUrl\\(["']([^"']+)["']\\)`, 'g');
  const matches = [...content.matchAll(regex)];
  
  if (pattern === 'avatar') {
    // Avatar is usually the first or second call
    return matches[0]?.[1] || matches[1]?.[1] || null;
  } else if (pattern === 'exclusive') {
    // Exclusive preview is usually later in the file
    return matches[matches.length - 1]?.[1] || matches[1]?.[1] || null;
  }
  return matches[0]?.[1] || null;
}

// Get base URL from getObfuscatedImageUrl function
function extractImageBaseUrl(content: string): string | null {
  const regex = /String\.fromCharCode\(([0-9,\s]+)\)/;
  const match = content.match(regex);
  if (match) {
    const chars = match[1].split(',').map(n => parseInt(n.trim(), 10));
    return decodeCharCodes(chars);
  }
  return null;
}

function extractPageData(slug: string, content: string): PageData {
  const data: PageData = {
    slug,
    name: null,
    avatar_url: null,
    bio: null,
    exclusive_preview_image: null,
    subscribe_url: null,
    exclusive_content_url: null,
  };

  // 1. Extract NAME (from h1 tag - look for text between > and <, ignoring icons)
  const h1Matches = [...content.matchAll(/<h1[^>]*>([^<]+)<\/h1>/gi)];
  if (h1Matches.length > 0) {
    // Get the main h1 (usually first one)
    let nameText = h1Matches[0][1].trim();
    // Remove any icon/sparkle text that might be inline
    nameText = nameText.replace(/\s*<[^>]+>.*$/, '').trim();
    data.name = nameText || slug.charAt(0).toUpperCase() + slug.slice(1);
  } else {
    // Fallback: capitalize slug
    data.name = slug.charAt(0).toUpperCase() + slug.slice(1);
  }

  // 2. Extract BIO/SUBTITLE (look for <p> tags with text-sm class or subtitle patterns)
  const bioPatterns = [
    /<p[^>]*className[^>]*text-sm[^>]*>([^<]+)<\/p>/i,
    /subtitle[:\s]*["']([^"']+)["']/i,
    /ngl,?\s+([^"']+)/i,
    /<p[^>]*text-\[#8B7355\][^>]*>([^<]+)<\/p>/i
  ];
  
  for (const pattern of bioPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      data.bio = match[1].trim();
      break;
    }
  }

  // 3. Extract AVATAR URL
  const imageBaseUrl = extractImageBaseUrl(content);
  if (imageBaseUrl) {
    // Find all image IDs
    const allImageIds = [...content.matchAll(/getObfuscatedImageUrl\\(["']([^"']+)["']\\)/g)];
    
    if (allImageIds.length > 0) {
      // First one is usually avatar (or verified badge, skip that)
      // Look for avatar-container or the first unique ID
      const avatarMatch = content.match(/avatar-container|avatar.*getObfuscatedImageUrl\\(["']([^"']+)["']\\)/i);
      if (avatarMatch && avatarMatch[1]) {
        data.avatar_url = imageBaseUrl + avatarMatch[1];
      } else if (allImageIds[0]) {
        data.avatar_url = imageBaseUrl + allImageIds[0][1];
      }
    }
  }

  // 4. Extract EXCLUSIVE PREVIEW IMAGE (usually the last or second-to-last image ID)
  if (imageBaseUrl) {
    const allImageIds = [...content.matchAll(/getObfuscatedImageUrl\\(["']([^"']+)["']\\)/g)];
    // Look for "Exclusive Content" near an image
    const exclusiveMatch = content.match(/Exclusive Content[^]*?getObfuscatedImageUrl\\(["']([^"']+)["']\\)/i);
    if (exclusiveMatch && exclusiveMatch[1]) {
      data.exclusive_preview_image = imageBaseUrl + exclusiveMatch[1];
    } else if (allImageIds.length >= 2) {
      // Usually the last one is the exclusive preview
      data.exclusive_preview_image = imageBaseUrl + allImageIds[allImageIds.length - 1][1];
    }
  }

  // 5. Extract SUBSCRIBE URL (from decodeUrl function)
  const decodeUrlChars = extractCharCodeArray(content, 'chars');
  if (decodeUrlChars) {
    const decodedUrl = decodeCharCodes(decodeUrlChars);
    data.subscribe_url = decodedUrl;
    data.exclusive_content_url = decodedUrl; // Usually same URL
  } else {
    // Fallback: try to find OnlyFans URL pattern
    const onlyfansMatch = content.match(/onlyfans\.com\/[^\s"')]+/i);
    if (onlyfansMatch) {
      data.subscribe_url = 'https://' + onlyfansMatch[0];
      data.exclusive_content_url = 'https://' + onlyfansMatch[0];
    }
  }

  return data;
}

// List of all page slugs
const PAGE_SLUGS = [
  'test123', 'jen', 'sel', 'brooke', 'rachel', 'rachsotiny', 'josh', 'm8d1son',
  'abbiehall', 'abby', 'aimee', 'alaska', 'alfrileyyy', 'alicia', 'amyleigh', 'amberr',
  'chloeayling', 'chloetami', 'dominika', 'ellejean', 'em', 'freya',
  'hannah', 'kaceymay', 'kayley', 'kimbo_bimbo', 'kxceyrose', 'laurdunne',
  'laylasoyoung', 'lily', 'lou', 'maddison', 'megann', 'morgan', 'ollie',
  'poppy', 'skye', 'victoria', 'wackojacko69'
];

function main() {
  console.log('🔍 Extracting page data from all pages...\n');

  const results: PageData[] = [];

  for (const slug of PAGE_SLUGS) {
    const pagePath = path.join(process.cwd(), 'app', slug, 'page.tsx');
    
    if (!fs.existsSync(pagePath)) {
      console.log(`⚠️  Skipping ${slug} - file not found`);
      continue;
    }

    try {
      const content = fs.readFileSync(pagePath, 'utf-8');
      const data = extractPageData(slug, content);
      results.push(data);
      
      console.log(`✅ ${slug}:`);
      console.log(`   Name: ${data.name}`);
      console.log(`   Avatar: ${data.avatar_url ? 'Found' : 'Missing'}`);
      console.log(`   Bio: ${data.bio || 'None'}`);
      console.log(`   Exclusive Preview: ${data.exclusive_preview_image ? 'Found' : 'Missing'}`);
      console.log(`   Subscribe URL: ${data.subscribe_url || 'Missing'}`);
      console.log('');
    } catch (error) {
      console.error(`❌ Error processing ${slug}:`, error);
    }
  }

  // Save to JSON file
  const outputPath = path.join(process.cwd(), 'extracted-page-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Saved extracted data to: ${outputPath}`);
  console.log(`\n📊 Total pages extracted: ${results.length}`);
}

main();

