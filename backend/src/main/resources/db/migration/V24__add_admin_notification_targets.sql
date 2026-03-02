-- Add column for direct targeting of an Admin by username
ALTER TABLE notifications ADD COLUMN target_admin_username VARCHAR(50);

-- Table to track which Admins have read which notifications
CREATE TABLE admin_notification_reads (
    admin_username VARCHAR(50) NOT NULL,
    notification_id BIGINT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_admin_notification_reads PRIMARY KEY (admin_username, notification_id),
    CONSTRAINT fk_admin_read_notification FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
);
