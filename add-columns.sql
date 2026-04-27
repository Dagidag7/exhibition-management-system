ALTER TABLE attendee ADD COLUMN IF NOT EXISTS password_changed BOOLEAN DEFAULT true;
ALTER TABLE attendee ADD COLUMN IF NOT EXISTS is_temporary_password BOOLEAN DEFAULT false;
