-- Add display_name column to users table
-- Allows users to set a nickname/display name shown in the header and to teammates
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);
