# Sponsor Floor Field Feature

## What Was Added

Added a **Floor Number** field to the sponsor registration form, allowing sponsors to be assigned to specific floors in the exhibition.

---

## Changes Made

### 1. Database Schema ✅
**File**: `add-floor-to-sponsor.sql`
- Added `floor_number VARCHAR(10)` column to `sponsor` table
- Created index `idx_sponsor_floor` for better query performance

### 2. Backend Model ✅
**File**: `exhibition-backend/src/main/java/com/exhibition/model/Sponsor.java`
- Added `floorNumber` field
- Added getter and setter methods

### 3. Backend Repository ✅
**File**: `exhibition-backend/src/main/java/com/exhibition/repository/SponsorRepositoryImpl.java`
- Updated `addSponsor()` - includes floor_number in INSERT
- Updated `getSponsorById()` - retrieves floor_number
- Updated `getAllSponsors()` - retrieves floor_number
- Updated `updateSponsor()` - updates floor_number

### 4. Frontend Service ✅
**File**: `exhibition-frontend/src/app/services/sponsor.service.ts`
- Added `floorNumber?: string` to Sponsor interface

### 5. Frontend Component ✅
**File**: `exhibition-frontend/src/app/components/add-sponsor/add-sponsor.component.ts`
- Added `floorNumber` to form group with validation (max 10 characters)
- Added `floorNumber` to form patch (edit mode)
- Added `floorNumber` to payload (save)

### 6. Frontend Template ✅
**File**: `exhibition-frontend/src/app/components/add-sponsor/add-sponsor.component.html`
- Added floor number input field
- Added placeholder and hint text
- Positioned between Benefits and Logo Upload fields

---

## Deployment Steps

### Step 1: Update Database
Run the SQL migration script in your Render PostgreSQL database:

```bash
psql -h dpg-d7n5bbjbc2fs738k523g-a.virginia-postgres.render.com -U exhibition_system -d exhibition_db < add-floor-to-sponsor.sql
```

Or copy-paste this SQL:

```sql
ALTER TABLE sponsor 
ADD COLUMN IF NOT EXISTS floor_number VARCHAR(10);

CREATE INDEX IF NOT EXISTS idx_sponsor_floor ON sponsor(floor_number);
```

### Step 2: Deploy Backend
```bash
cd exhibition-backend
# Backend will auto-deploy on Render when you push to git
git add .
git commit -m "Add floor number field to sponsor"
git push origin main
```

### Step 3: Deploy Frontend
```bash
cd exhibition-frontend
# Frontend will auto-deploy on Render when you push to git
git add .
git commit -m "Add floor number field to sponsor form"
git push origin main
```

Or use Render manual deploy:
1. Go to https://dashboard.render.com
2. Select your services
3. Click "Manual Deploy" → "Deploy latest commit"

---

## How to Use

### Adding a New Sponsor with Floor Assignment:

1. Go to **Admin Dashboard** → **Sponsors** tab
2. Click **"+ Add Sponsor"** button
3. Fill in the form:
   - Name: TechGlobal Solutions
   - Contact Person: Sarah Mitchell
   - Email: sarah.mitchell@techglobal.com
   - Contribution Amount: 25000
   - Benefits: Platinum tier benefits...
   - **Floor Number**: 2 ← NEW FIELD!
   - Logo: Upload logo
4. Click **Save**

### Editing Existing Sponsor to Add Floor:

1. Go to **Admin Dashboard** → **Sponsors** tab
2. Click the **Edit** button (pencil icon) next to a sponsor
3. Enter the floor number (e.g., "1", "2", "3", "Ground", "Mezzanine")
4. Click **Update Sponsor**

---

## Floor Number Format

The floor number field accepts:
- **Numbers**: 1, 2, 3, 4, etc.
- **Text**: Ground, Mezzanine, Basement, etc.
- **Alphanumeric**: 1A, 2B, G1, etc.
- **Maximum length**: 10 characters

### Examples:
- ✅ "1"
- ✅ "2"
- ✅ "Ground"
- ✅ "Mezzanine"
- ✅ "1A"
- ✅ "B1"
- ❌ "Very Long Floor Name" (too long)

---

## Updated Sponsor Data with Floors

Here's sample data with floor assignments:

### Sponsor 1: INSA (Existing)
- Floor Number: **1**

### Sponsor 2: Africom (Existing)
- Floor Number: **1**

### Sponsor 3: TechGlobal Solutions
- Floor Number: **2**

### Sponsor 4: Innovation Bank
- Floor Number: **2**

### Sponsor 5: CloudNet Systems
- Floor Number: **3**

### Sponsor 6: GreenEnergy Corp
- Floor Number: **3**

### Sponsor 7: DataSecure Inc
- Floor Number: **1**

### Sponsor 8: SmartCity Technologies
- Floor Number: **Ground** (Main entrance)

### Sponsor 9: FinTech Innovations
- Floor Number: **2**

### Sponsor 10: AI Research Labs
- Floor Number: **3**

---

## SQL to Update Existing Sponsors with Floors

```sql
-- Update existing sponsors with floor assignments
UPDATE sponsor SET floor_number = '1' WHERE name = 'INSA';
UPDATE sponsor SET floor_number = '1' WHERE name = 'Africom';

-- Add floor numbers when adding new sponsors
INSERT INTO sponsor (name, contact_person, email, contribution_amount, benefits, floor_number, status)
VALUES ('TechGlobal Solutions', 'Sarah Mitchell', 'sarah.mitchell@techglobal.com', 25000, 
'Platinum tier benefits', '2', 'active');
```

---

## Benefits of Floor Assignment

1. **Better Organization**: Group sponsors by floor for easier navigation
2. **Floor Maps**: Display sponsors on interactive floor maps
3. **Attendee Guidance**: Help attendees find sponsors on specific floors
4. **Reporting**: Generate floor-wise sponsor reports
5. **Logistics**: Plan floor layouts and booth assignments

---

## Future Enhancements

Possible improvements:
- Floor dropdown with predefined floor list
- Floor map visualization showing sponsor locations
- Filter sponsors by floor in admin panel
- Display floor number on sponsor cards in landing page
- Floor-wise sponsor directory for attendees

---

## Verification

After deployment, verify the feature works:

1. ✅ Database has `floor_number` column in `sponsor` table
2. ✅ Add Sponsor form shows "Floor Number" field
3. ✅ Can save sponsor with floor number
4. ✅ Edit Sponsor form shows existing floor number
5. ✅ Can update sponsor's floor number
6. ✅ Floor number appears in sponsor list (if displayed)

---

## Troubleshooting

### Floor field not showing in form?
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)
- Check if frontend deployed successfully

### Error saving sponsor with floor?
- Verify database migration ran successfully
- Check backend logs for SQL errors
- Ensure backend redeployed after code changes

### Floor number not saving?
- Check browser console for errors
- Verify API request includes floorNumber field
- Check backend logs for any validation errors

---

## Rollback Plan

If you need to remove this feature:

### Database:
```sql
ALTER TABLE sponsor DROP COLUMN IF EXISTS floor_number;
DROP INDEX IF EXISTS idx_sponsor_floor;
```

### Code:
```bash
git revert HEAD
git push origin main
```

---

## Summary

✅ **Database**: Added floor_number column
✅ **Backend**: Updated model and repository
✅ **Frontend**: Added floor field to form
✅ **Ready to deploy**: All changes complete!

**Next**: Run the SQL migration, then deploy backend and frontend! 🚀
