CREATE TABLE custom_orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    budget DECIMAL(19, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED',
    admin_note TEXT,
    agreed_price DECIMAL(19, 2),
    order_id BIGINT,
    reference_product_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (reference_product_id) REFERENCES products(id)
);
