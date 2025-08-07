-- Add click_type column to abbiehall_analytics table
ALTER TABLE IF EXISTS abbiehall_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_abbiehall_analytics_click_type ON abbiehall_analytics(click_type); 