-- Database Tables for Analytics - First 5 Pages
-- Run these SQL commands in your Supabase SQL editor

-- 1. Abbiehall Analytics Table
CREATE TABLE IF NOT EXISTS abbiehall_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Aimee Analytics Table
CREATE TABLE IF NOT EXISTS aimee_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Amberr Analytics Table
CREATE TABLE IF NOT EXISTS amberr_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Amyleigh Analytics Table
CREATE TABLE IF NOT EXISTS amyleigh_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Amymaxwell Analytics Table
CREATE TABLE IF NOT EXISTS amymaxwell_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_abbiehall_analytics_timestamp ON abbiehall_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_abbiehall_analytics_readable_referrer ON abbiehall_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_aimee_analytics_timestamp ON aimee_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_aimee_analytics_readable_referrer ON aimee_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_amberr_analytics_timestamp ON amberr_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_amberr_analytics_readable_referrer ON amberr_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_amyleigh_analytics_timestamp ON amyleigh_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_amyleigh_analytics_readable_referrer ON amyleigh_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_amymaxwell_analytics_timestamp ON amymaxwell_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_amymaxwell_analytics_readable_referrer ON amymaxwell_analytics(readable_referrer);

-- 6. B4byyeena Analytics Table
CREATE TABLE IF NOT EXISTS b4byyeena_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Babyscarlet Analytics Table
CREATE TABLE IF NOT EXISTS babyscarlet_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Babyyeena Analytics Table
CREATE TABLE IF NOT EXISTS babyyeena_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Chloeayling Analytics Table
CREATE TABLE IF NOT EXISTS chloeayling_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Chloeelizabeth Analytics Table
CREATE TABLE IF NOT EXISTS chloeelizabeth_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Additional indexes for the new tables
CREATE INDEX IF NOT EXISTS idx_b4byyeena_analytics_timestamp ON b4byyeena_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_b4byyeena_analytics_readable_referrer ON b4byyeena_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_babyscarlet_analytics_timestamp ON babyscarlet_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_babyscarlet_analytics_readable_referrer ON babyscarlet_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_babyyeena_analytics_timestamp ON babyyeena_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_babyyeena_analytics_readable_referrer ON babyyeena_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_chloeayling_analytics_timestamp ON chloeayling_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_chloeayling_analytics_readable_referrer ON chloeayling_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_chloeelizabeth_analytics_timestamp ON chloeelizabeth_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_chloeelizabeth_analytics_readable_referrer ON chloeelizabeth_analytics(readable_referrer);

-- 11. Chloetami Analytics Table
CREATE TABLE IF NOT EXISTS chloetami_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Ellejean Analytics Table
CREATE TABLE IF NOT EXISTS ellejean_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Em Analytics Table
CREATE TABLE IF NOT EXISTS em_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Freya Analytics Table
CREATE TABLE IF NOT EXISTS freya_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Georgiaaa Analytics Table
CREATE TABLE IF NOT EXISTS georgiaaa_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Additional indexes for the new tables
CREATE INDEX IF NOT EXISTS idx_chloetami_analytics_timestamp ON chloetami_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_chloetami_analytics_readable_referrer ON chloetami_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_ellejean_analytics_timestamp ON ellejean_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_ellejean_analytics_readable_referrer ON ellejean_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_em_analytics_timestamp ON em_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_em_analytics_readable_referrer ON em_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_freya_analytics_timestamp ON freya_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_freya_analytics_readable_referrer ON freya_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_georgiaaa_analytics_timestamp ON georgiaaa_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_georgiaaa_analytics_readable_referrer ON georgiaaa_analytics(readable_referrer);

-- 16. Josh Analytics Table
CREATE TABLE IF NOT EXISTS josh_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. Kaceymay Analytics Table
CREATE TABLE IF NOT EXISTS kaceymay_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. Kaci Analytics Table
CREATE TABLE IF NOT EXISTS kaci_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. Kayley Analytics Table
CREATE TABLE IF NOT EXISTS kayley_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. Keanna Analytics Table
CREATE TABLE IF NOT EXISTS keanna_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Additional indexes for the new tables
CREATE INDEX IF NOT EXISTS idx_josh_analytics_timestamp ON josh_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_josh_analytics_readable_referrer ON josh_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_kaceymay_analytics_timestamp ON kaceymay_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_kaceymay_analytics_readable_referrer ON kaceymay_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_kaci_analytics_timestamp ON kaci_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_kaci_analytics_readable_referrer ON kaci_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_kayley_analytics_timestamp ON kayley_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_kayley_analytics_readable_referrer ON kayley_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_keanna_analytics_timestamp ON keanna_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_keanna_analytics_readable_referrer ON keanna_analytics(readable_referrer);

-- 21. Kxceyrose Analytics Table
CREATE TABLE IF NOT EXISTS kxceyrose_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 22. Laurdunne Analytics Table
CREATE TABLE IF NOT EXISTS laurdunne_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 23. Laylasoyoung Analytics Table
CREATE TABLE IF NOT EXISTS laylasoyoung_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 24. Liamm Analytics Table
CREATE TABLE IF NOT EXISTS liamm_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 25. Libby Analytics Table
CREATE TABLE IF NOT EXISTS libby_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Additional indexes for the new tables
CREATE INDEX IF NOT EXISTS idx_kxceyrose_analytics_timestamp ON kxceyrose_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_kxceyrose_analytics_readable_referrer ON kxceyrose_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_laurdunne_analytics_timestamp ON laurdunne_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_laurdunne_analytics_readable_referrer ON laurdunne_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_laylasoyoung_analytics_timestamp ON laylasoyoung_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_laylasoyoung_analytics_readable_referrer ON laylasoyoung_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_liamm_analytics_timestamp ON liamm_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_liamm_analytics_readable_referrer ON liamm_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_libby_analytics_timestamp ON libby_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_libby_analytics_readable_referrer ON libby_analytics(readable_referrer);

-- 26. Lou Analytics Table
CREATE TABLE IF NOT EXISTS lou_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 27. Megann Analytics Table
CREATE TABLE IF NOT EXISTS megann_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 28. Missbrown Analytics Table
CREATE TABLE IF NOT EXISTS missbrown_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 29. Morgan Analytics Table
CREATE TABLE IF NOT EXISTS morgan_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 30. Ollie Analytics Table
CREATE TABLE IF NOT EXISTS ollie_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Additional indexes for the new tables
CREATE INDEX IF NOT EXISTS idx_lou_analytics_timestamp ON lou_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_lou_analytics_readable_referrer ON lou_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_megann_analytics_timestamp ON megann_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_megann_analytics_readable_referrer ON megann_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_missbrown_analytics_timestamp ON missbrown_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_missbrown_analytics_readable_referrer ON missbrown_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_morgan_analytics_timestamp ON morgan_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_morgan_analytics_readable_referrer ON morgan_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_ollie_analytics_timestamp ON ollie_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_ollie_analytics_readable_referrer ON ollie_analytics(readable_referrer);

-- 31. Poppy Analytics Table
CREATE TABLE IF NOT EXISTS poppy_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 32. Sel Analytics Table
CREATE TABLE IF NOT EXISTS sel_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 33. Skye Analytics Table
CREATE TABLE IF NOT EXISTS skye_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 34. Sxmmermae Analytics Table
CREATE TABLE IF NOT EXISTS sxmmermae_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    readable_referrer VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pathname VARCHAR(255),
    search_params TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Additional indexes for the final tables
CREATE INDEX IF NOT EXISTS idx_poppy_analytics_timestamp ON poppy_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_poppy_analytics_readable_referrer ON poppy_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_sel_analytics_timestamp ON sel_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_sel_analytics_readable_referrer ON sel_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_skye_analytics_timestamp ON skye_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_skye_analytics_readable_referrer ON skye_analytics(readable_referrer);

CREATE INDEX IF NOT EXISTS idx_sxmmermae_analytics_timestamp ON sxmmermae_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_sxmmermae_analytics_readable_referrer ON sxmmermae_analytics(readable_referrer); 

-- Brooke Analytics Table with Click Tracking
CREATE TABLE IF NOT EXISTS brooke_analytics (
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
CREATE INDEX IF NOT EXISTS idx_brooke_analytics_timestamp ON brooke_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_brooke_analytics_readable_referrer ON brooke_analytics(readable_referrer);
CREATE INDEX IF NOT EXISTS idx_brooke_analytics_click_type ON brooke_analytics(click_type); -- Added index for click tracking 

-- Add click_type column to all existing analytics tables
ALTER TABLE IF EXISTS abbiehall_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS aimee_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS amberr_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS amyleigh_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS amymaxwell_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS b4byyeena_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS babyscarlet_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS babyyeena_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS chloeayling_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS chloeelizabeth_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS chloetami_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS ellejean_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS em_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS freya_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS georgiaaa_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS josh_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS kaceymay_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS kaci_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS kayley_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS keanna_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS kxceyrose_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS laurdunne_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS laylasoyoung_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS liamm_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS libby_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS lou_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS megann_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS missbrown_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS morgan_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS ollie_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS poppy_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS sel_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS skye_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';
ALTER TABLE IF EXISTS sxmmermae_analytics ADD COLUMN IF NOT EXISTS click_type VARCHAR(50) DEFAULT 'page_visit';

-- Create indexes for click_type on all tables
CREATE INDEX IF NOT EXISTS idx_abbiehall_analytics_click_type ON abbiehall_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_aimee_analytics_click_type ON aimee_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_amberr_analytics_click_type ON amberr_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_amyleigh_analytics_click_type ON amyleigh_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_amymaxwell_analytics_click_type ON amymaxwell_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_b4byyeena_analytics_click_type ON b4byyeena_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_babyscarlet_analytics_click_type ON babyscarlet_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_babyyeena_analytics_click_type ON babyyeena_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_chloeayling_analytics_click_type ON chloeayling_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_chloeelizabeth_analytics_click_type ON chloeelizabeth_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_chloetami_analytics_click_type ON chloetami_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_ellejean_analytics_click_type ON ellejean_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_em_analytics_click_type ON em_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_freya_analytics_click_type ON freya_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_georgiaaa_analytics_click_type ON georgiaaa_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_josh_analytics_click_type ON josh_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_kaceymay_analytics_click_type ON kaceymay_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_kaci_analytics_click_type ON kaci_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_kayley_analytics_click_type ON kayley_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_keanna_analytics_click_type ON keanna_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_kxceyrose_analytics_click_type ON kxceyrose_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_laurdunne_analytics_click_type ON laurdunne_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_laylasoyoung_analytics_click_type ON laylasoyoung_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_liamm_analytics_click_type ON liamm_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_libby_analytics_click_type ON libby_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_lou_analytics_click_type ON lou_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_megann_analytics_click_type ON megann_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_missbrown_analytics_click_type ON missbrown_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_morgan_analytics_click_type ON morgan_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_ollie_analytics_click_type ON ollie_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_poppy_analytics_click_type ON poppy_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_sel_analytics_click_type ON sel_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_skye_analytics_click_type ON skye_analytics(click_type);
CREATE INDEX IF NOT EXISTS idx_sxmmermae_analytics_click_type ON sxmmermae_analytics(click_type); 