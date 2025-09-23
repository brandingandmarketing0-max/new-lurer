-- WackoJacko69 Analytics Table with Click Tracking
-- Run this SQL command in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS wackojacko69_analytics (
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
CREATE INDEX IF NOT EXISTS idx_wackojacko69_analytics_timestamp ON wackojacko69_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_wackojacko69_analytics_readable_referrer ON wackojacko69_analytics(readable_referrer);
CREATE INDEX IF NOT EXISTS idx_wackojacko69_analytics_click_type ON wackojacko69_analytics(click_type);

