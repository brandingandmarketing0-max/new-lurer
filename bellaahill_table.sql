-- Bellaahill Analytics Table with Click Tracking
-- Run this SQL command in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS bellaahill_analytics (
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
CREATE INDEX IF NOT EXISTS idx_bellaahill_analytics_timestamp ON bellaahill_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_bellaahill_analytics_readable_referrer ON bellaahill_analytics(readable_referrer);
CREATE INDEX IF NOT EXISTS idx_bellaahill_analytics_click_type ON bellaahill_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_bellaahill_analytics_page ON bellaahill_analytics(page);

-- Optional: Create a view for easier analytics queries
CREATE OR REPLACE VIEW bellaahill_analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    click_type,
    readable_referrer,
    COUNT(*) as total_events,
    COUNT(DISTINCT ip_address) as unique_visitors
FROM bellaahill_analytics 
GROUP BY DATE(timestamp), click_type, readable_referrer
ORDER BY date DESC, total_events DESC;

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT ON bellaahill_analytics TO authenticated;
-- GRANT SELECT ON bellaahill_analytics_summary TO authenticated;


