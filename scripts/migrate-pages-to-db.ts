/**
 * Migration script to extract data from existing page folders and migrate to database
 * 
 * This script:
 * 1. Scans existing page folders (app/[slug]/page.tsx)
 * 2. Extracts page info (title, subtitle, avatar)
 * 3. Extracts links (buttons, URLs)
 * 4. Inserts into pages and page_links tables
 * 
 * Run: npx tsx scripts/migrate-pages-to-db.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface ExtractedPage {
  slug: string;
  title: string | null;
  subtitle: string | null;
  avatar_url: string | null;
  links: ExtractedLink[];
}

interface ExtractedLink {
  label: string;
  url: string;
  sort_order: number;
  click_type?: string; // exclusive_content, subscribe_now, etc.
}

// List of page slugs to migrate (from middleware.ts)
const PAGE_SLUGS = [
  'jen', 'sel', 'brooke', 'rachel', 'rachsotiny', 'josh', 'm8d1son',
  'abbiehall', 'abby', 'aimee', 'alaska', 'alfrileyyy', 'alicia', 'amyleigh', 'amberr',
  'chloeayling', 'chloetami', 'dominika', 'ellejean', 'em', 'freya',
  'hannah', 'kaceymay', 'kayley', 'kimbo_bimbo', 'kxceyrose', 'laurdunne',
  'laylasoyoung', 'lily', 'lou', 'maddison', 'megann', 'morgan', 'ollie',
  'poppy', 'skye', 'victoria', 'wackojacko69', 'test123'
];

function extractPageData(slug: string, content: string): ExtractedPage | null {
  const page: ExtractedPage = {
    slug,
    title: null,
    subtitle: null,
    avatar_url: null,
    links: []
  };

  // Extract title (look for h1 with text or title variable)
  const titleMatch = content.match(/<h1[^>]*>([^<]+)<\/h1>/i) || 
                     content.match(/title[:\s]*["']([^"']+)["']/i) ||
                     content.match(/const\s+title\s*=\s*["']([^"']+)["']/i);
  if (titleMatch) {
    page.title = titleMatch[1].trim();
  } else {
    // Fallback: capitalize slug
    page.title = slug.charAt(0).toUpperCase() + slug.slice(1);
  }

  // Extract subtitle (look for subtitle or bio text)
  const subtitleMatch = content.match(/subtitle[:\s]*["']([^"']+)["']/i) ||
                        content.match(/<p[^>]*className[^>]*>([^<]+)<\/p>/i);
  if (subtitleMatch) {
    page.subtitle = subtitleMatch[1].trim();
  }

  // Extract avatar URL (look for avatar image src or avatar_url)
  const avatarMatch = content.match(/avatar[_-]?url[:\s]*["']([^"']+)["']/i) ||
                      content.match(/src=["']([^"']*avatar[^"']*)["']/i) ||
                      content.match(/getObfuscatedImageUrl\(["']([^"']+)["']\)/i);
  if (avatarMatch) {
    page.avatar_url = avatarMatch[1].trim();
  }

  // Extract links from buttons and click handlers
  // Look for "Subscribe Now", "Exclusive Content", etc.
  const subscribeMatch = content.match(/Subscribe\s+Now/i);
  const exclusiveMatch = content.match(/Exclusive\s+Content/i);
  
  // Extract URLs from decodeUrl or similar functions
  const urlMatch = content.match(/decodeUrl\(\)|targetUrl|href\s*=\s*["']([^"']+)["']/i);
  
  // Try to find the actual URL (often obfuscated)
  // Look for OnlyFans URLs or similar patterns
  const onlyfansMatch = content.match(/onlyfans\.com\/[^"'\s)]+/i);
  const urlPattern = content.match(/https?:\/\/[^\s"')]+/i);

  // Extract from click handlers
  if (subscribeMatch) {
    page.links.push({
      label: 'Subscribe Now',
      url: onlyfansMatch?.[0] || urlPattern?.[0] || `https://onlyfans.com/${slug}`,
      sort_order: 1,
      click_type: 'subscribe_now'
    });
  }

  if (exclusiveMatch) {
    page.links.push({
      label: 'Exclusive Content',
      url: onlyfansMatch?.[0] || urlPattern?.[0] || `https://onlyfans.com/${slug}`,
      sort_order: 0,
      click_type: 'exclusive_content'
    });
  }

  // If no links found, add a default one
  if (page.links.length === 0) {
    page.links.push({
      label: 'Subscribe',
      url: `https://onlyfans.com/${slug}`,
      sort_order: 0,
      click_type: 'subscribe_now'
    });
  }

  return page;
}

async function migratePage(slug: string): Promise<boolean> {
  const pagePath = path.join(process.cwd(), 'app', slug, 'page.tsx');
  
  if (!fs.existsSync(pagePath)) {
    console.log(`⚠️  Page file not found: ${pagePath}`);
    return false;
  }

  try {
    const content = fs.readFileSync(pagePath, 'utf-8');
    const extracted = extractPageData(slug, content);

    if (!extracted) {
      console.log(`❌ Failed to extract data for ${slug}`);
      return false;
    }

    // Check if page already exists
    const { data: existing } = await supabase
      .from('pages')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    let pageId: number;

    if (existing) {
      // Update existing page
      const { data, error } = await supabase
        .from('pages')
        .update({
          title: extracted.title,
          subtitle: extracted.subtitle,
          avatar_url: extracted.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('slug', slug)
        .select('id')
        .single();

      if (error) throw error;
      pageId = data.id;
      console.log(`✅ Updated page: ${slug}`);
    } else {
      // Create new page
      const { data, error } = await supabase
        .from('pages')
        .insert([{
          slug: extracted.slug,
          title: extracted.title,
          subtitle: extracted.subtitle,
          avatar_url: extracted.avatar_url,
          is_active: true
        }])
        .select('id')
        .single();

      if (error) throw error;
      pageId = data.id;
      console.log(`✅ Created page: ${slug}`);
    }

    // Delete existing links for this page
    await supabase.from('page_links').delete().eq('page_id', pageId);

    // Insert new links
    if (extracted.links.length > 0) {
      const { error: linkError } = await supabase
        .from('page_links')
        .insert(
          extracted.links.map(link => ({
            page_id: pageId,
            label: link.label,
            url: link.url,
            sort_order: link.sort_order,
            is_active: true
          }))
        );

      if (linkError) throw linkError;
      console.log(`  ✅ Added ${extracted.links.length} links`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Error migrating ${slug}:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting page migration...\n');

  let success = 0;
  let failed = 0;

  for (const slug of PAGE_SLUGS) {
    const result = await migratePage(slug);
    if (result) {
      success++;
    } else {
      failed++;
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   Success: ${success}`);
  console.log(`   Failed: ${failed}`);
}

main().catch(console.error);

