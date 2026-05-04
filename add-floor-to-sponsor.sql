-- Add floor_number column to sponsor table
-- This allows sponsors to be assigned to specific floors

ALTER TABLE sponsor 
ADD COLUMN IF NOT EXISTS floor_number VARCHAR(10);

-- Create index for better performance when querying by floor
CREATE INDEX IF NOT EXISTS idx_sponsor_floor ON sponsor(floor_number);

-- Display success message
SELECT 'Floor number column added to sponsor table successfully!' as message;
