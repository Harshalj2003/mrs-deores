CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    discount_type VARCHAR(50) NOT NULL,
    discount_value DOUBLE PRECISION NOT NULL,
    expiry_date TIMESTAMP,
    min_order_value DOUBLE PRECISION DEFAULT 0.0,
    max_discount DOUBLE PRECISION,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
