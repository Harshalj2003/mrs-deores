-- V12: Add branding controls and announcement bar settings defaults

INSERT INTO site_settings (setting_key, setting_value) VALUES
    -- Branding controls
    ('brand_logo_size',        'md'),
    ('brand_show_webname',     'true'),
    ('brand_show_tagline',     'true'),
    ('brand_hero_enabled',     'true'),

    -- Announcement bar defaults (disabled by default)
    ('announce_enabled',       'false'),
    ('announce_text',          'Free Delivery on all orders! 🚚'),
    ('announce_color',         '')

ON CONFLICT (setting_key) DO NOTHING;
