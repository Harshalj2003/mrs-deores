-- 1. Fix PaymentDetails missing Razorpay columns
ALTER TABLE payment_details ADD COLUMN razorpay_order_id VARCHAR(255);
ALTER TABLE payment_details ADD COLUMN razorpay_payment_id VARCHAR(255);
ALTER TABLE payment_details ADD COLUMN razorpay_signature VARCHAR(255);

-- 2. Fix Products missing Review aggregate columns
ALTER TABLE products ADD COLUMN average_rating DOUBLE PRECISION DEFAULT 5.0;
ALTER TABLE products ADD COLUMN total_reviews INTEGER DEFAULT 0;

-- 3. Create the missing Reviews table
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
