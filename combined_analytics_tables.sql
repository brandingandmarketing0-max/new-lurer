-- Combined Analytics Tables for All Profiles
-- Run this SQL command in your Supabase SQL editor to create all analytics tables at once

-- ==============================================
-- COWGURLKACEY ANALYTICS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS cowgurlkacey_analytics (
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

CREATE INDEX IF NOT EXISTS idx_cowgurlkacey_analytics_timestamp ON cowgurlkacey_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_cowgurlkacey_analytics_readable_referrer ON cowgurlkacey_analytics(readable_referrer);
CREATE INDEX IF NOT EXISTS idx_cowgurlkacey_analytics_click_type ON cowgurlkacey_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_cowgurlkacey_analytics_page ON cowgurlkacey_analytics(page);

CREATE OR REPLACE VIEW cowgurlkacey_analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    click_type,
    readable_referrer,
    COUNT(*) as total_events,
    COUNT(DISTINCT ip_address) as unique_visitors
FROM cowgurlkacey_analytics 
GROUP BY DATE(timestamp), click_type, readable_referrer
ORDER BY date DESC, total_events DESC;

-- ==============================================
-- ABBY ANALYTICS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS abby_analytics (
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

CREATE INDEX IF NOT EXISTS idx_abby_analytics_timestamp ON abby_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_abby_analytics_readable_referrer ON abby_analytics(readable_referrer);
CREATE INDEX IF NOT EXISTS idx_abby_analytics_click_type ON abby_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_abby_analytics_page ON abby_analytics(page);

CREATE OR REPLACE VIEW abby_analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    click_type,
    readable_referrer,
    COUNT(*) as total_events,
    COUNT(DISTINCT ip_address) as unique_visitors
FROM abby_analytics 
GROUP BY DATE(timestamp), click_type, readable_referrer
ORDER BY date DESC, total_events DESC;

-- ==============================================
-- ALICIA ANALYTICS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS alicia_analytics (
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

CREATE INDEX IF NOT EXISTS idx_alicia_analytics_timestamp ON alicia_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_alicia_analytics_readable_referrer ON alicia_analytics(readable_referrer);
CREATE INDEX IF NOT EXISTS idx_alicia_analytics_click_type ON alicia_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_alicia_analytics_page ON alicia_analytics(page);

CREATE OR REPLACE VIEW alicia_analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    click_type,
    readable_referrer,
    COUNT(*) as total_events,
    COUNT(DISTINCT ip_address) as unique_visitors
FROM alicia_analytics 
GROUP BY DATE(timestamp), click_type, readable_referrer
ORDER BY date DESC, total_events DESC;

-- ==============================================
-- CHLOEINSKIP ANALYTICS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS chloeinskip_analytics (
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

CREATE INDEX IF NOT EXISTS idx_chloeinskip_analytics_timestamp ON chloeinskip_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_chloeinskip_analytics_readable_referrer ON chloeinskip_analytics(readable_referrer);
CREATE INDEX IF NOT EXISTS idx_chloeinskip_analytics_click_type ON chloeinskip_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_chloeinskip_analytics_page ON chloeinskip_analytics(page);

CREATE OR REPLACE VIEW chloeinskip_analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    click_type,
    readable_referrer,
    COUNT(*) as total_events,
    COUNT(DISTINCT ip_address) as unique_visitors
FROM chloeinskip_analytics 
GROUP BY DATE(timestamp), click_type, readable_referrer
ORDER BY date DESC, total_events DESC;

-- ==============================================
-- DOMINIKA ANALYTICS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS dominika_analytics (
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

CREATE INDEX IF NOT EXISTS idx_dominika_analytics_timestamp ON dominika_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_dominika_analytics_readable_referrer ON dominika_analytics(readable_referrer);
CREATE INDEX IF NOT EXISTS idx_dominika_analytics_click_type ON dominika_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_dominika_analytics_page ON dominika_analytics(page);

CREATE OR REPLACE VIEW dominika_analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    click_type,
    readable_referrer,
    COUNT(*) as total_events,
    COUNT(DISTINCT ip_address) as unique_visitors
FROM dominika_analytics 
GROUP BY DATE(timestamp), click_type, readable_referrer
ORDER BY date DESC, total_events DESC;

-- ==============================================
-- EMILY9999X ANALYTICS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS emily9999x_analytics (
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

CREATE INDEX IF NOT EXISTS idx_emily9999x_analytics_timestamp ON emily9999x_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_emily9999x_analytics_readable_referrer ON emily9999x_analytics(readable_referrer);
CREATE INDEX IF NOT EXISTS idx_emily9999x_analytics_click_type ON emily9999x_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_emily9999x_analytics_page ON emily9999x_analytics(page);

CREATE OR REPLACE VIEW emily9999x_analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    click_type,
    readable_referrer,
    COUNT(*) as total_events,
    COUNT(DISTINCT ip_address) as unique_visitors
FROM emily9999x_analytics 
GROUP BY DATE(timestamp), click_type, readable_referrer
ORDER BY date DESC, total_events DESC;

-- ==============================================
-- GRACE ANALYTICS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS grace_analytics (
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

CREATE INDEX IF NOT EXISTS idx_grace_analytics_timestamp ON grace_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_grace_analytics_readable_referrer ON grace_analytics(readable_referrer);
CREATE INDEX IF NOT EXISTS idx_grace_analytics_click_type ON grace_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_grace_analytics_page ON grace_analytics(page);

CREATE OR REPLACE VIEW grace_analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    click_type,
    readable_referrer,
    COUNT(*) as total_events,
    COUNT(DISTINCT ip_address) as unique_visitors
FROM grace_analytics 
GROUP BY DATE(timestamp), click_type, readable_referrer
ORDER BY date DESC, total_events DESC;

-- ==============================================
-- FITNESSBLONDE ANALYTICS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS fitnessblonde_analytics (
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

CREATE INDEX IF NOT EXISTS idx_fitnessblonde_analytics_timestamp ON fitnessblonde_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_fitnessblonde_analytics_readable_referrer ON fitnessblonde_analytics(readable_referrer);
CREATE INDEX IF NOT EXISTS idx_fitnessblonde_analytics_click_type ON fitnessblonde_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_fitnessblonde_analytics_page ON fitnessblonde_analytics(page);

CREATE OR REPLACE VIEW fitnessblonde_analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    click_type,
    readable_referrer,
    COUNT(*) as total_events,
    COUNT(DISTINCT ip_address) as unique_visitors
FROM fitnessblonde_analytics 
GROUP BY DATE(timestamp), click_type, readable_referrer
ORDER BY date DESC, total_events DESC;

-- ==============================================
-- ONLYJESSXROSE ANALYTICS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS onlyjessxrose_analytics (
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

CREATE INDEX IF NOT EXISTS idx_onlyjessxrose_analytics_timestamp ON onlyjessxrose_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_onlyjessxrose_analytics_readable_referrer ON onlyjessxrose_analytics(readable_referrer);
CREATE INDEX IF NOT EXISTS idx_onlyjessxrose_analytics_click_type ON onlyjessxrose_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_onlyjessxrose_analytics_page ON onlyjessxrose_analytics(page);

CREATE OR REPLACE VIEW onlyjessxrose_analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    click_type,
    readable_referrer,
    COUNT(*) as total_events,
    COUNT(DISTINCT ip_address) as unique_visitors
FROM onlyjessxrose_analytics 
GROUP BY DATE(timestamp), click_type, readable_referrer
ORDER BY date DESC, total_events DESC;

-- ==============================================
-- MADDYSMITH111X ANALYTICS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS maddysmith111x_analytics (
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

CREATE INDEX IF NOT EXISTS idx_maddysmith111x_analytics_timestamp ON maddysmith111x_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_maddysmith111x_analytics_readable_referrer ON maddysmith111x_analytics(readable_referrer);
CREATE INDEX IF NOT EXISTS idx_maddysmith111x_analytics_click_type ON maddysmith111x_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_maddysmith111x_analytics_page ON maddysmith111x_analytics(page);

CREATE OR REPLACE VIEW maddysmith111x_analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    click_type,
    readable_referrer,
    COUNT(*) as total_events,
    COUNT(DISTINCT ip_address) as unique_visitors
FROM maddysmith111x_analytics 
GROUP BY DATE(timestamp), click_type, readable_referrer
ORDER BY date DESC, total_events DESC;

-- ==============================================
-- NOREILLY75 ANALYTICS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS noreilly75_analytics (
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

CREATE INDEX IF NOT EXISTS idx_noreilly75_analytics_timestamp ON noreilly75_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_noreilly75_analytics_readable_referrer ON noreilly75_analytics(readable_referrer);
CREATE INDEX IF NOT EXISTS idx_noreilly75_analytics_click_type ON noreilly75_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_noreilly75_analytics_page ON noreilly75_analytics(page);

CREATE OR REPLACE VIEW noreilly75_analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    click_type,
    readable_referrer,
    COUNT(*) as total_events,
    COUNT(DISTINCT ip_address) as unique_visitors
FROM noreilly75_analytics 
GROUP BY DATE(timestamp), click_type, readable_referrer
ORDER BY date DESC, total_events DESC;

-- ==============================================
-- SCARLETXROSEEEVIP ANALYTICS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS scarletxroseeevip_analytics (
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

CREATE INDEX IF NOT EXISTS idx_scarletxroseeevip_analytics_timestamp ON scarletxroseeevip_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_scarletxroseeevip_analytics_readable_referrer ON scarletxroseeevip_analytics(readable_referrer);
CREATE INDEX IF NOT EXISTS idx_scarletxroseeevip_analytics_click_type ON scarletxroseeevip_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_scarletxroseeevip_analytics_page ON scarletxroseeevip_analytics(page);

CREATE OR REPLACE VIEW scarletxroseeevip_analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    click_type,
    readable_referrer,
    COUNT(*) as total_events,
    COUNT(DISTINCT ip_address) as unique_visitors
FROM scarletxroseeevip_analytics 
GROUP BY DATE(timestamp), click_type, readable_referrer
ORDER BY date DESC, total_events DESC;

-- ==============================================
-- KIMBO_BIMBO ANALYTICS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS kimbo_bimbo_analytics (
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

CREATE INDEX IF NOT EXISTS idx_kimbo_bimbo_analytics_timestamp ON kimbo_bimbo_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_kimbo_bimbo_analytics_readable_referrer ON kimbo_bimbo_analytics(readable_referrer);
CREATE INDEX IF NOT EXISTS idx_kimbo_bimbo_analytics_click_type ON kimbo_bimbo_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_kimbo_bimbo_analytics_page ON kimbo_bimbo_analytics(page);

CREATE OR REPLACE VIEW kimbo_bimbo_analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    click_type,
    readable_referrer,
    COUNT(*) as total_events,
    COUNT(DISTINCT ip_address) as unique_visitors
FROM kimbo_bimbo_analytics 
GROUP BY DATE(timestamp), click_type, readable_referrer
ORDER BY date DESC, total_events DESC;

-- ==============================================
-- PAIGEXB ANALYTICS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS paigexb_analytics (
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

CREATE INDEX IF NOT EXISTS idx_paigexb_analytics_timestamp ON paigexb_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_paigexb_analytics_readable_referrer ON paigexb_analytics(readable_referrer);
CREATE INDEX IF NOT EXISTS idx_paigexb_analytics_click_type ON paigexb_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_paigexb_analytics_page ON paigexb_analytics(page);

CREATE OR REPLACE VIEW paigexb_analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    click_type,
    readable_referrer,
    COUNT(*) as total_events,
    COUNT(DISTINCT ip_address) as unique_visitors
FROM paigexb_analytics 
GROUP BY DATE(timestamp), click_type, readable_referrer
ORDER BY date DESC, total_events DESC;

-- ==============================================
-- GRANT PERMISSIONS (Uncomment and adjust as needed)
-- ==============================================
-- GRANT SELECT, INSERT ON cowgurlkacey_analytics TO authenticated;
-- GRANT SELECT ON cowgurlkacey_analytics_summary TO authenticated;
-- GRANT SELECT, INSERT ON abby_analytics TO authenticated;
-- GRANT SELECT ON abby_analytics_summary TO authenticated;
-- GRANT SELECT, INSERT ON alicia_analytics TO authenticated;
-- GRANT SELECT ON alicia_analytics_summary TO authenticated;
-- GRANT SELECT, INSERT ON chloeinskip_analytics TO authenticated;
-- GRANT SELECT ON chloeinskip_analytics_summary TO authenticated;
-- GRANT SELECT, INSERT ON dominika_analytics TO authenticated;
-- GRANT SELECT ON dominika_analytics_summary TO authenticated;
-- GRANT SELECT, INSERT ON emily9999x_analytics TO authenticated;
-- GRANT SELECT ON emily9999x_analytics_summary TO authenticated;
-- GRANT SELECT, INSERT ON grace_analytics TO authenticated;
-- GRANT SELECT ON grace_analytics_summary TO authenticated;
-- GRANT SELECT, INSERT ON fitnessblonde_analytics TO authenticated;
-- GRANT SELECT ON fitnessblonde_analytics_summary TO authenticated;
-- GRANT SELECT, INSERT ON onlyjessxrose_analytics TO authenticated;
-- GRANT SELECT ON onlyjessxrose_analytics_summary TO authenticated;
-- GRANT SELECT, INSERT ON maddysmith111x_analytics TO authenticated;
-- GRANT SELECT ON maddysmith111x_analytics_summary TO authenticated;
-- GRANT SELECT, INSERT ON noreilly75_analytics TO authenticated;
-- GRANT SELECT ON noreilly75_analytics_summary TO authenticated;
-- GRANT SELECT, INSERT ON scarletxroseeevip_analytics TO authenticated;
-- GRANT SELECT ON scarletxroseeevip_analytics_summary TO authenticated;
-- GRANT SELECT, INSERT ON kimbo_bimbo_analytics TO authenticated;
-- GRANT SELECT ON kimbo_bimbo_analytics_summary TO authenticated;
-- GRANT SELECT, INSERT ON paigexb_analytics TO authenticated;
-- GRANT SELECT ON paigexb_analytics_summary TO authenticated;















