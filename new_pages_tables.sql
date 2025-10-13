-- Combined SQL script to create analytics tables for the 3 new protected pages
-- rachelirl, littlelouxxx, and bellapetitie

-- ==============================================
-- RACHELIRL ANALYTICS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS rachelirl_analytics (
    id SERIAL PRIMARY KEY,
    page VARCHAR(50) NOT NULL DEFAULT 'rachelirl',
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

-- Create indexes for rachelirl
CREATE INDEX IF NOT EXISTS idx_rachelirl_analytics_timestamp ON rachelirl_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_rachelirl_analytics_click_type ON rachelirl_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_rachelirl_analytics_referrer ON rachelirl_analytics(readable_referrer);

-- Enable RLS for rachelirl
ALTER TABLE rachelirl_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rachelirl
CREATE POLICY "Allow authenticated users to read rachelirl analytics" ON rachelirl_analytics
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to insert rachelirl analytics" ON rachelirl_analytics
    FOR INSERT WITH CHECK (true);

-- Grant permissions for rachelirl
GRANT SELECT ON rachelirl_analytics TO authenticated;
GRANT INSERT ON rachelirl_analytics TO service_role;
GRANT USAGE ON SEQUENCE rachelirl_analytics_id_seq TO service_role;

-- ==============================================
-- LITTLELOUXXX ANALYTICS TABLE
-- ==============================================
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

-- Create indexes for littlelouxxx
CREATE INDEX IF NOT EXISTS idx_littlelouxxx_analytics_timestamp ON littlelouxxx_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_littlelouxxx_analytics_click_type ON littlelouxxx_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_littlelouxxx_analytics_referrer ON littlelouxxx_analytics(readable_referrer);

-- Enable RLS for littlelouxxx
ALTER TABLE littlelouxxx_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for littlelouxxx
CREATE POLICY "Allow authenticated users to read littlelouxxx analytics" ON littlelouxxx_analytics
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to insert littlelouxxx analytics" ON littlelouxxx_analytics
    FOR INSERT WITH CHECK (true);

-- Grant permissions for littlelouxxx
GRANT SELECT ON littlelouxxx_analytics TO authenticated;
GRANT INSERT ON littlelouxxx_analytics TO service_role;
GRANT USAGE ON SEQUENCE littlelouxxx_analytics_id_seq TO service_role;

-- ==============================================
-- BELLAPETITIE ANALYTICS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS bellapetitie_analytics (
    id SERIAL PRIMARY KEY,
    page VARCHAR(50) NOT NULL DEFAULT 'bellapetitie',
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

-- Create indexes for bellapetitie
CREATE INDEX IF NOT EXISTS idx_bellapetitie_analytics_timestamp ON bellapetitie_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_bellapetitie_analytics_click_type ON bellapetitie_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_bellapetitie_analytics_referrer ON bellapetitie_analytics(readable_referrer);

-- Enable RLS for bellapetitie
ALTER TABLE bellapetitie_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bellapetitie
CREATE POLICY "Allow authenticated users to read bellapetitie analytics" ON bellapetitie_analytics
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to insert bellapetitie analytics" ON bellapetitie_analytics
    FOR INSERT WITH CHECK (true);

-- Grant permissions for bellapetitie
GRANT SELECT ON bellapetitie_analytics TO authenticated;
GRANT INSERT ON bellapetitie_analytics TO service_role;
GRANT USAGE ON SEQUENCE bellapetitie_analytics_id_seq TO service_role;

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================
-- Uncomment these to verify tables were created successfully:

-- SELECT table_name FROM information_schema.tables 
-- WHERE table_name IN ('rachelirl_analytics', 'littlelouxxx_analytics', 'bellapetitie_analytics');

-- SELECT COUNT(*) as rachelirl_count FROM rachelirl_analytics;
-- SELECT COUNT(*) as littlelouxxx_count FROM littlelouxxx_analytics;
-- SELECT COUNT(*) as bellapetitie_count FROM bellapetitie_analytics;


