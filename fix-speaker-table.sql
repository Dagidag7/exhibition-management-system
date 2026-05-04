-- Fix speaker table schema to match backend expectations
-- This adds the missing columns that the backend code requires

-- Add missing columns to speaker table
ALTER TABLE speaker 
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS organization VARCHAR(255);

-- Remove the conference_id foreign key constraint if it exists
-- (The backend doesn't use this relationship)
ALTER TABLE speaker 
DROP CONSTRAINT IF EXISTS speaker_conference_id_fkey;

-- Drop the conference_id column since it's not used
ALTER TABLE speaker 
DROP COLUMN IF EXISTS conference_id;

-- Create index on email for better performance
CREATE INDEX IF NOT EXISTS idx_speaker_email ON speaker(email);

-- Display success message
SELECT 'Speaker table schema fixed successfully!' as message;
SELECT 'Please run this SQL script in your Render PostgreSQL database.' as instruction;
