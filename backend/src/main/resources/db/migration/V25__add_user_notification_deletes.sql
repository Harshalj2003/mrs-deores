-- V25__add_user_notification_deletes.sql
-- Add is_deleted flag to read tracking tables to allow users to dismiss/hide notifications

ALTER TABLE notification_reads ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE admin_notification_reads ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
