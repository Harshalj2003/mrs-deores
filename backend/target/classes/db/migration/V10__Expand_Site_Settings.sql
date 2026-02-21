-- V10: Expand site_settings with store config, announcement bar, delivery, visibility, and theme settings

INSERT INTO site_settings (setting_key, setting_value) VALUES
    -- Store General
    ('store_name', 'Mrs. Deore''s Premix'),
    ('store_tagline', 'Authentic Homemade Tradition in every bite'),
    ('store_currency', '₹'),
    ('store_logo_url', ''),

    -- Announcement Bar
    ('announcement_enabled', 'true'),
    ('announcement_text', 'FREE DELIVERY FOR ALL PRODUCTS 🎉'),
    ('announcement_link', ''),
    ('announcement_bg_color', '#C2410C'),

    -- Delivery Settings
    ('delivery_free_above', '499'),
    ('delivery_charge', '50'),
    ('delivery_enabled', 'true'),

    -- Feature Visibility
    ('feature_custom_order', 'true'),
    ('feature_wishlist', 'true'),
    ('feature_reviews', 'false'),
    ('feature_bulk_pricing', 'true'),

    -- Theme / Appearance
    ('theme_primary_color', '#C2410C'),
    ('theme_secondary_color', '#EAB308'),
    ('theme_hero_image_url', ''),
    ('theme_hero_title', 'Authentic Homemade'),
    ('theme_hero_subtitle', 'Tradition in every bite')
ON CONFLICT (setting_key) DO NOTHING;
