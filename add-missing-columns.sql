-- Add missing columns to fix Partner and Sponsor functionality
-- Run this script in your Render PostgreSQL database

-- Fix Partner table
ALTER TABLE partner 
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS benefits TEXT;

-- Update existing data if any (copy company_name to name)
UPDATE partner SET name = company_name WHERE name IS NULL;

-- Fix Sponsor table  
ALTER TABLE sponsor
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS contribution_amount DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS benefits TEXT;

-- Update existing data if any (copy company_name to name)
UPDATE sponsor SET name = company_name WHERE name IS NULL;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_partner_email ON partner(email);
CREATE INDEX IF NOT EXISTS idx_sponsor_email ON sponsor(email);

SELECT 'Missing columns added successfully!' as message;