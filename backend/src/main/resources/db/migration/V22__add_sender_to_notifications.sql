ALTER TABLE notifications ADD COLUMN sender_id BIGINT REFERENCES users(id);
