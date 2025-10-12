-- Create littlelouxxx analytics table
CREATE TABLE IF NOT EXISTS littlelouxxx_analytics (
    id SERIAL PRIMARY KEY,
    page VARCHAR(50) NOT NULL DEFAULT 'littlelouxxx',
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

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_littlelouxxx_analytics_timestamp ON littlelouxxx_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_littlelouxxx_analytics_click_type ON littlelouxxx_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_littlelouxxx_analytics_referrer ON littlelouxxx_analytics(readable_referrer);

-- Add RLS (Row Level Security) policies
ALTER TABLE littlelouxxx_analytics ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read data
CREATE POLICY "Allow authenticated users to read littlelouxxx analytics" ON littlelouxxx_analytics
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy to allow service role to insert data
CREATE POLICY "Allow service role to insert littlelouxxx analytics" ON littlelouxxx_analytics
    FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON littlelouxxx_analytics TO authenticated;
GRANT INSERT ON littlelouxxx_analytics TO service_role;
GRANT USAGE ON SEQUENCE littlelouxxx_analytics_id_seq TO service_role;
