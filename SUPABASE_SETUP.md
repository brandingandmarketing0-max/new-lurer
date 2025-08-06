# Supabase Setup for Brooke Analytics

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

## 2. Environment Variables

Create a `.env.local` file in your project root with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 3. Create Database Table

Run this SQL in your Supabase SQL editor:

```sql
-- Create brooke_analytics table
CREATE TABLE brooke_analytics (
  id BIGSERIAL PRIMARY KEY,
  page VARCHAR(255) NOT NULL,
  referrer TEXT,
  readable_referrer VARCHAR(255),
  user_agent TEXT,
  ip_address VARCHAR(45),
  timestamp TIMESTAMPTZ NOT NULL,
  pathname VARCHAR(255),
  search_params TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_brooke_analytics_created_at ON brooke_analytics(created_at DESC);
CREATE INDEX idx_brooke_analytics_page ON brooke_analytics(page);
```

## 4. Row Level Security (Optional)

If you want to secure the data, add RLS policies:

```sql
-- Enable RLS
ALTER TABLE brooke_analytics ENABLE ROW LEVEL SECURITY;

-- Allow inserts from authenticated users (if you have auth)
CREATE POLICY "Allow inserts for authenticated users" ON brooke_analytics
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow reads for authenticated users
CREATE POLICY "Allow reads for authenticated users" ON brooke_analytics
  FOR SELECT USING (auth.role() = 'authenticated');
```

## 5. Test the Integration

1. Start your development server: `yarn dev`
2. Visit `/brooke` page
3. Check the browser console for analytics logs
4. Visit `/brooke/analytics` to see the dashboard
5. Check your Supabase dashboard to see the data being saved

## 6. Features

- ✅ Tracks page visits with referrer information
- ✅ Stores IP addresses and user agents
- ✅ Processes referrers into readable formats (Instagram, Twitter, etc.)
- ✅ Real-time analytics dashboard
- ✅ Unique visitor tracking
- ✅ Traffic source analysis

## 7. Next Steps

You can now create similar analytics tables for other pages:
- `aimee_analytics`
- `amberr_analytics`
- `amyleigh_analytics`
- etc.

Just duplicate the table structure and update the API routes accordingly. 