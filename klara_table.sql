-- Create klara analytics table
CREATE TABLE IF NOT EXISTS klara_analytics (
    id SERIAL PRIMARY KEY,
    page VARCHAR(50) NOT NULL DEFAULT 'klara',
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address INET,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    click_type VARCHAR(100) DEFAULT 'page_visit',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_klara_analytics_timestamp ON klara_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_klara_analytics_click_type ON klara_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_klara_analytics_referrer ON klara_analytics(readable_referrer);
CREATE INDEX IF NOT EXISTS idx_klara_analytics_page ON klara_analytics(page);

-- Add RLS (Row Level Security) policies
ALTER TABLE klara_analytics ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read data
CREATE POLICY "Allow authenticated users to read klara analytics" ON klara_analytics
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy to allow service role to insert data
CREATE POLICY "Allow service role to insert klara analytics" ON klara_analytics
    FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON klara_analytics TO authenticated;
GRANT INSERT ON klara_analytics TO service_role;
GRANT USAGE ON SEQUENCE klara_analytics_id_seq TO service_role;

-- Optional: Create a view for easier analytics queries
CREATE OR REPLACE VIEW klara_analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    click_type,
    readable_referrer,
    COUNT(*) as total_events,
    COUNT(DISTINCT ip_address) as unique_visitors
FROM klara_analytics 
GROUP BY DATE(timestamp), click_type, readable_referrer
ORDER BY date DESC, total_events DESC;

-- Grant select on view
GRANT SELECT ON klara_analytics_summary TO authenticated;












