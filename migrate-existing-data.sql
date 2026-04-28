-- Migrate existing Partner and Sponsor data from old columns to new columns
-- Run this in your PostgreSQL database

-- Update Partner table - copy company_name to name if name is null
UPDATE partner 
SET name = company_name 
WHERE name IS NULL AND company_name IS NOT NULL;

-- Update Sponsor table - copy company_name to name if name is null  
UPDATE sponsor 
SET name = company_name 
WHERE name IS NULL AND company_name IS NOT NULL;

-- Check the results
SELECT 'Partners updated:' as message, COUNT(*) as count FROM partner WHERE name IS NOT NULL;
SELECT 'Sponsors updated:' as message, COUNT(*) as count FROM sponsor WHERE name IS NOT NULL;

-- Show current data
SELECT partner_id, name, company_name, contact_person, email FROM partner;
SELECT sponsor_id, name, company_name, contact_person, email, contribution_amount FROM sponsor;