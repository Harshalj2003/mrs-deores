-- V11: Add grid layout settings for categories and products

INSERT INTO site_settings (setting_key, setting_value) VALUES
    -- Category grid settings
    ('grid_categories_mobile', '2'),
    ('grid_categories_desktop', '4'),
    -- Product grid settings
    ('grid_products_mobile', '2'),
    ('grid_products_desktop', '3')
ON CONFLICT (setting_key) DO NOTHING;
