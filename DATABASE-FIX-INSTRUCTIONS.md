# Database Schema Fix Instructions

## Problem
The Partner and Sponsor tables are missing required columns, causing these errors:
- Partner: `ERROR: column "name" does not exist`
- Sponsor: `ERROR: column "contribution_amount" does not exist`

## Solution
Run the SQL commands in `add-missing-columns.sql` in your Render PostgreSQL database.

## How to Apply the Fix

### Option 1: Using Render Dashboard
1. Go to your Render dashboard
2. Navigate to your PostgreSQL database (`exhibition-db`)
3. Click on "Connect" and use the external connection
4. Run the SQL commands from `add-missing-columns.sql`

### Option 2: Using psql command line
```bash
# Use the DATABASE_URL from your Render environment
psql "postgresql://exhibition_system:your_password@dpg-d7n5bbjbc2fs738k523g-a.virginia-postgres.render.com:5432/exhibition_db" -f add-missing-columns.sql
```

### Option 3: Copy and paste these commands directly:

```sql
-- Add missing columns to fix Partner and Sponsor functionality
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
```

## After applying the fix:
1. Partners and Sponsors should work correctly
2. The login page routing issue should be resolved
3. Attendee authentication should work with the password consistency fix

## Test the fixes:
1. Try adding a new Partner - should work without "name" column error
2. Try adding a new Sponsor - should work without "contribution_amount" column error  
3. Try accessing the login page - should redirect properly instead of showing 405 error
4. Try registering and logging in as an attendee - should work with consistent password handling