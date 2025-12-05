-- Tashacatton17 Analytics Table with Click Tracking
-- Run this SQL command in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS tashacatton17_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL DEFAULT 'tashacatton17',
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    click_type VARCHAR(50) DEFAULT 'page_visit', -- page_visit, exclusive_content, subscribe_now
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tashacatton17_analytics_timestamp ON tashacatton17_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_tashacatton17_analytics_readable_referrer ON tashacatton17_analytics(readable_referrer);
CREATE INDEX IF NOT EXISTS idx_tashacatton17_analytics_click_type ON tashacatton17_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_tashacatton17_analytics_page ON tashacatton17_analytics(page);

-- Optional: Create a view for easier analytics queries
CREATE OR REPLACE VIEW tashacatton17_analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    click_type,
    readable_referrer,
    COUNT(*) as total_events,
    COUNT(DISTINCT ip_address) as unique_visitors
FROM tashacatton17_analytics 
GROUP BY DATE(timestamp), click_type, readable_referrer
ORDER BY date DESC, total_events DESC;

-- Add RLS (Row Level Security) policies
ALTER TABLE tashacatton17_analytics ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read data
CREATE POLICY "Allow authenticated users to read tashacatton17 analytics" ON tashacatton17_analytics
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy to allow service role to insert data (for API tracking)
CREATE POLICY "Allow service role to insert tashacatton17 analytics" ON tashacatton17_analytics
    FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT ON tashacatton17_analytics TO authenticated;
GRANT INSERT ON tashacatton17_analytics TO service_role;
GRANT SELECT ON tashacatton17_analytics_summary TO authenticated;





