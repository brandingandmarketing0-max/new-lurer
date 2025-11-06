-- Bexmonroe Analytics Table with Click Tracking
-- Run this SQL command in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS bexmonroe_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    click_type VARCHAR(50) DEFAULT 'page_visit', -- Added for click tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bexmonroe_analytics_timestamp ON bexmonroe_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_bexmonroe_analytics_readable_referrer ON bexmonroe_analytics(readable_referrer);
CREATE INDEX IF NOT EXISTS idx_bexmonroe_analytics_click_type ON bexmonroe_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_bexmonroe_analytics_page ON bexmonroe_analytics(page);

-- Optional: Create a view for easier analytics queries
CREATE OR REPLACE VIEW bexmonroe_analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    click_type,
    readable_referrer,
    COUNT(*) as total_events,
    COUNT(DISTINCT ip_address) as unique_visitors
FROM bexmonroe_analytics 
GROUP BY DATE(timestamp), click_type, readable_referrer
ORDER BY date DESC, total_events DESC;

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT ON bexmonroe_analytics TO authenticated;
-- GRANT SELECT ON bexmonroe_analytics_summary TO authenticated;




