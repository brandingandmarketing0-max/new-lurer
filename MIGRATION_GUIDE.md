# Migration Guide: Folder-based Pages → Database

This guide helps you migrate all existing page folders to the new database system while keeping all information intact.

## Step 1: Update Analytics Schema

Run the SQL to add link-level tracking:

```bash
# In Supabase SQL Editor, run:
lure/MIGRATION_ANALYTICS_UPDATE.sql
```

This creates:
- `link_analytics` table (unified tracking by link_id)
- Keeps existing `${page}_analytics` tables for backward compatibility

## Step 2: Run Migration Script

The migration script extracts data from existing page folders and inserts into the database.

### Option A: Automated Migration (Recommended)

```bash
# Install tsx if needed
npm install -g tsx

# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="your-url"
export SUPABASE_SERVICE_ROLE_KEY="your-key"

# Run migration
npx tsx scripts/migrate-pages-to-db.ts
```

### Option B: Manual Migration via Admin UI

1. Go to `/admin/pages`
2. For each existing page (jen, sel, etc.):
   - Click the quick-migrate button
   - Click "Create"
   - Click "Edit"
   - Manually add links with correct URLs
   - Save

## Step 3: Verify Migration

1. Check pages in database:
   ```sql
   SELECT slug, title, (SELECT COUNT(*) FROM page_links WHERE page_id = pages.id) as link_count
   FROM pages
   ORDER BY slug;
   ```

2. Test a migrated page:
   - Visit `/admin/pages`
   - Click "Edit" on a migrated page
   - Verify all links are there
   - Check live preview looks correct

3. Test analytics:
   - Visit a migrated page (e.g., `/jen`)
   - Click a link
   - Check `link_analytics` table:
   ```sql
   SELECT * FROM link_analytics ORDER BY created_at DESC LIMIT 10;
   ```

## Step 4: Update Existing Pages (Optional)

After migration, you can:
- Keep old TSX files (they won't be used if DB entry exists)
- Or delete them to clean up

The middleware routes `/slug` → DB version automatically.

## What Gets Migrated

✅ **Page Info:**
- Slug (from folder name)
- Title (extracted from h1 or defaults to capitalized slug)
- Subtitle (if found)
- Avatar URL (if found)

✅ **Links:**
- "Subscribe Now" button → link with `subscribe_now` click_type
- "Exclusive Content" button → link with `exclusive_content` click_type
- URLs extracted from decodeUrl or OnlyFans patterns

⚠️ **Note:** The automated script does basic extraction. For complex pages, you may need to:
- Manually verify extracted URLs
- Add missing links via admin UI
- Update avatar URLs if they're obfuscated

## Analytics Tracking

**Before:** Analytics saved to `${page}_analytics` table with `click_type`

**After:** 
- Still saves to `${page}_analytics` (backward compatible)
- **Also saves to `link_analytics` with `link_id`** (new unified tracking)

**Benefits:**
- Track clicks per individual link
- See which links perform best
- Unified analytics across all pages
- Can still query old `${page}_analytics` tables

## Troubleshooting

**Migration script fails:**
- Check Supabase credentials
- Ensure tables exist (run COMPLETE_SETUP.sql first)
- Check file paths are correct

**Links missing after migration:**
- Use admin UI to add them manually
- Check extracted URLs are correct

**Analytics not tracking:**
- Verify `link_analytics` table exists
- Check API route has link_id support
- Ensure page_id and link_id are being sent

## Next Steps

After migration:
1. ✅ All pages in database
2. ✅ Analytics tracking by link_id
3. ✅ Can edit everything via `/admin/pages`
4. ✅ Live preview works
5. ✅ Old analytics still accessible

