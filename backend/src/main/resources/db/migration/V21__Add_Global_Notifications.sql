CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'INFO',
    target_user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE notification_reads (
    user_id BIGINT NOT NULL,
    notification_id BIGINT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, notification_id),
    CONSTRAINT fk_read_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_read_notification FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
);

ALTER TABLE users ADD COLUMN phone VARCHAR(20);
