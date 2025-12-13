/**
 * Migrate extracted page data to database
 * Reads extracted-page-data.json and inserts into Supabase
 * 
 * Run: npx tsx scripts/migrate-extracted-data.ts
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

interface PageData {
  slug: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  exclusive_preview_image: string | null;
  subscribe_url: string | null;
  exclusive_content_url: string | null;
}

async function migrateData() {
  const dataPath = path.join(process.cwd(), 'extracted-page-data.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error('❌ extracted-page-data.json not found. Run extract-page-data.ts first!');
    process.exit(1);
  }

  const data: PageData[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  console.log(`🚀 Migrating ${data.length} pages to database...\n`);

  let success = 0;
  let failed = 0;

  for (const pageData of data) {
    try {
      // Check if page exists
      const { data: existing } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', pageData.slug)
        .maybeSingle();

      let pageId: number;

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('pages')
          .update({
            title: pageData.name,
            subtitle: pageData.bio,
            avatar_url: pageData.avatar_url,
            updated_at: new Date().toISOString()
          })
          .eq('slug', pageData.slug)
          .select('id')
          .single();

        if (error) throw error;
        pageId = data.id;
        console.log(`✅ Updated: ${pageData.slug}`);
      } else {
        // Create new
        const { data, error } = await supabase
          .from('pages')
          .insert([{
            slug: pageData.slug,
            title: pageData.name,
            subtitle: pageData.bio,
            avatar_url: pageData.avatar_url,
            is_active: true
          }])
          .select('id')
          .single();

        if (error) throw error;
        pageId = data.id;
        console.log(`✅ Created: ${pageData.slug}`);
      }

      // Delete existing links
      await supabase.from('page_links').delete().eq('page_id', pageId);

      // Insert links
      const linksToInsert = [];

      // Exclusive Content link (if URL exists)
      if (pageData.exclusive_content_url) {
        linksToInsert.push({
          page_id: pageId,
          label: 'Exclusive Content',
          url: pageData.exclusive_content_url,
          sort_order: 0,
          is_active: true
        });
      }

      // Subscribe Now link
      if (pageData.subscribe_url) {
        linksToInsert.push({
          page_id: pageId,
          label: 'Subscribe Now',
          url: pageData.subscribe_url,
          sort_order: 1,
          is_active: true
        });
      }

      if (linksToInsert.length > 0) {
        const { error: linkError } = await supabase
          .from('page_links')
          .insert(linksToInsert);

        if (linkError) throw linkError;
        console.log(`   Added ${linksToInsert.length} links`);
      }

      success++;
    } catch (error) {
      console.error(`❌ Error migrating ${pageData.slug}:`, error);
      failed++;
    }

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   Success: ${success}`);
  console.log(`   Failed: ${failed}`);
}

migrateData().catch(console.error);

