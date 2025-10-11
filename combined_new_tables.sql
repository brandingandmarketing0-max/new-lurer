-- Combined SQL for New Analytics Tables: brooke_xox, lily, and lsy (layla)
-- Run this SQL command in your Supabase SQL editor

-- ==============================================
-- BROOKE_XOX ANALYTICS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS brooke_xox_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    click_type VARCHAR(50) DEFAULT 'page_visit',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for brooke_xox_analytics
CREATE INDEX IF NOT EXISTS idx_brooke_xox_analytics_timestamp ON brooke_xox_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_brooke_xox_analytics_readable_referrer ON brooke_xox_analytics(readable_referrer);
CREATE INDEX IF NOT EXISTS idx_brooke_xox_analytics_click_type ON brooke_xox_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_brooke_xox_analytics_page ON brooke_xox_analytics(page);

-- Create view for brooke_xox_analytics
CREATE OR REPLACE VIEW brooke_xox_analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    click_type,
    readable_referrer,
    COUNT(*) as total_events,
    COUNT(DISTINCT ip_address) as unique_visitors
FROM brooke_xox_analytics 
GROUP BY DATE(timestamp), click_type, readable_referrer
ORDER BY date DESC, total_events DESC;

-- ==============================================
-- LILY ANALYTICS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS lily_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    click_type VARCHAR(50) DEFAULT 'page_visit',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for lily_analytics
CREATE INDEX IF NOT EXISTS idx_lily_analytics_timestamp ON lily_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_lily_analytics_readable_referrer ON lily_analytics(readable_referrer);
CREATE INDEX IF NOT EXISTS idx_lily_analytics_click_type ON lily_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_lily_analytics_page ON lily_analytics(page);

-- Create view for lily_analytics
CREATE OR REPLACE VIEW lily_analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    click_type,
    readable_referrer,
    COUNT(*) as total_events,
    COUNT(DISTINCT ip_address) as unique_visitors
FROM lily_analytics 
GROUP BY DATE(timestamp), click_type, readable_referrer
ORDER BY date DESC, total_events DESC;

-- ==============================================
-- LSY (LAYLA) ANALYTICS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS lsy_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    click_type VARCHAR(50) DEFAULT 'page_visit',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for lsy_analytics
CREATE INDEX IF NOT EXISTS idx_lsy_analytics_timestamp ON lsy_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_lsy_analytics_readable_referrer ON lsy_analytics(readable_referrer);
CREATE INDEX IF NOT EXISTS idx_lsy_analytics_click_type ON lsy_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_lsy_analytics_page ON lsy_analytics(page);

-- Create view for lsy_analytics
CREATE OR REPLACE VIEW lsy_analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    click_type,
    readable_referrer,
    COUNT(*) as total_events,
    COUNT(DISTINCT ip_address) as unique_visitors
FROM lsy_analytics 
GROUP BY DATE(timestamp), click_type, readable_referrer
ORDER BY date DESC, total_events DESC;

-- ==============================================
-- GRANT PERMISSIONS (Uncomment if needed)
-- ==============================================
-- GRANT SELECT, INSERT ON brooke_xox_analytics TO authenticated;
-- GRANT SELECT ON brooke_xox_analytics_summary TO authenticated;
-- GRANT SELECT, INSERT ON lily_analytics TO authenticated;
-- GRANT SELECT ON lily_analytics_summary TO authenticated;
-- GRANT SELECT, INSERT ON lsy_analytics TO authenticated;
-- GRANT SELECT ON lsy_analytics_summary TO authenticated;

-- ==============================================
-- VERIFICATION QUERIES (Optional - for testing)
-- ==============================================
-- Check if tables were created successfully:
-- SELECT table_name FROM information_schema.tables WHERE table_name IN ('brooke_xox_analytics', 'lily_analytics', 'lsy_analytics');

-- Check if views were created successfully:
-- SELECT table_name FROM information_schema.views WHERE table_name IN ('brooke_xox_analytics_summary', 'lily_analytics_summary', 'lsy_analytics_summary');













