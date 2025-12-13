# Migration Instructions: Extract & Migrate All Page Data

This will extract **all hidden/obfuscated data** from your existing pages and migrate them to the database.

## What Gets Extracted

For each page, we extract:
1. **Name** - from h1 tag
2. **Avatar picture** - decoded from obfuscated image URLs
3. **Bio** - subtitle/bio text
4. **Exclusive content preview picture** - decoded image URL
5. **Subscribe button URL** - decoded from char code arrays
6. **Exclusive content button URL** - decoded from char code arrays

## Step 1: Run Analytics Update SQL

First, update your database schema:

```sql
-- In Supabase SQL Editor, run:
-- lure/MIGRATION_ANALYTICS_UPDATE.sql
```

This creates the `link_analytics` table for tracking by link ID.

## Step 2: Extract Data from All Pages

Run the extraction script to scan all pages and decode obfuscated data:

```bash
# Set environment (optional, only if script needs it)
export NEXT_PUBLIC_SUPABASE_URL="your-url"
export SUPABASE_SERVICE_ROLE_KEY="your-key"

# Extract data from all pages
npx tsx scripts/extract-page-data.ts
```

This will:
- Scan all page folders
- Decode obfuscated URLs (char code arrays → real URLs)
- Extract image URLs (avatar, exclusive preview)
- Extract names, bios, links
- Save to `extracted-page-data.json`

**Output:** `extracted-page-data.json` with all extracted data

## Step 3: Review Extracted Data

Check the extracted data:

```bash
# View the extracted data
cat extracted-page-data.json
```

Verify:
- ✅ All URLs are decoded correctly
- ✅ Avatar images are found
- ✅ Exclusive preview images are found
- ✅ Subscribe URLs are correct

## Step 4: Migrate to Database

Once data looks good, migrate to database:

```bash
# Migrate extracted data to Supabase
npx tsx scripts/migrate-extracted-data.ts
```

This will:
- Create/update pages in `pages` table
- Add links to `page_links` table
- Set up everything for tracking

## Step 5: Verify Migration

1. **Check in Admin UI:**
   - Go to `/admin/pages`
   - Click "Edit" on migrated pages
   - Verify all data is there
   - Check live preview looks correct

2. **Check Database:**
   ```sql
   -- See all migrated pages
   SELECT slug, title, subtitle, avatar_url, 
          (SELECT COUNT(*) FROM page_links WHERE page_id = pages.id) as link_count
   FROM pages
   ORDER BY slug;
   
   -- See all links
   SELECT p.slug, pl.label, pl.url, pl.sort_order
   FROM page_links pl
   JOIN pages p ON p.id = pl.page_id
   ORDER BY p.slug, pl.sort_order;
   ```

3. **Test Analytics:**
   - Visit a migrated page (e.g., `/jen`)
   - Click a link
   - Check analytics:
   ```sql
   SELECT * FROM link_analytics 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

## What Happens After Migration

✅ **All pages in database** - editable via `/admin/pages`  
✅ **All links tracked by ID** - see which links perform best  
✅ **Analytics start tracking** - new clicks go to `link_analytics` table  
✅ **Old pages still work** - middleware routes to DB version automatically  

## Troubleshooting

**Extraction fails:**
- Check file paths are correct
- Verify page files exist in `app/[slug]/page.tsx`

**URLs not decoded:**
- Some pages might use different obfuscation
- Manually check and update via admin UI

**Missing images:**
- Image IDs might be in different format
- Can manually add via admin UI upload

**Migration fails:**
- Check Supabase credentials
- Ensure tables exist (run COMPLETE_SETUP.sql first)
- Check for duplicate slugs

## Next Steps

After migration:
1. ✅ All data extracted and in database
2. ✅ Analytics tracking by link_id
3. ✅ Can edit everything via admin UI
4. ✅ Live preview works
5. ✅ Ready to track new analytics!

