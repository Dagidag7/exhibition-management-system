# 🗄️ Database Setup Guide - Quick Reference

## Option 1: Using Render Dashboard (Easiest)

1. Go to: https://dashboard.render.com/
2. Navigate to **Databases** → Click on `exhibition-db`
3. Click the **Connect** tab
4. Copy the **PSQL Command** (looks like this):
   ```
   psql postgresql://exhibition_system:PASSWORD@dpg-xxxxx-oregon-postgres.render.com/exhibition_db
   ```
5. Open your terminal and paste the command
6. Once connected, copy the entire content of `database-schema.sql` and paste it
7. Press Enter to execute
8. Type `\dt` to verify tables were created
9. Type `\q` to exit

---

## Option 2: Using Render SQL Editor (Web-based)

1. Go to: https://dashboard.render.com/
2. Navigate to **Databases** → Click on `exhibition-db`
3. Click the **SQL Editor** tab (if available)
4. Copy the entire content of `database-schema.sql`
5. Paste it into the SQL editor
6. Click **Run Query**
7. Verify success message

---

## Option 3: Using pgAdmin or DBeaver (GUI Tools)

### Connection Details (from Render Dashboard):
- **Host**: Get from Render → Databases → exhibition-db → Connect → External Database URL
- **Port**: 5432
- **Database**: exhibition_db
- **Username**: exhibition_system
- **Password**: Get from Render dashboard

### Steps:
1. Open pgAdmin or DBeaver
2. Create new connection with above details
3. Open SQL query window
4. Copy content from `database-schema.sql`
5. Execute the query
6. Refresh to see new tables

---

## Verify Tables Were Created

Run this query to list all tables:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Expected tables (8 total):
1. ✅ attendee
2. ✅ exhibitor
3. ✅ product
4. ✅ conference
5. ✅ speaker
6. ✅ sponsor
7. ✅ partner
8. ✅ floor

---

## Check Table Structure

To see columns in a specific table:
```sql
\d attendee
```

Or:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'attendee';
```

---

## Test Database Connection from Backend

After creating tables, test the backend connection:

```bash
curl https://exhibition-backend-9jxh.onrender.com/database/tables
```

Expected response:
```json
{
  "tables": [
    "attendee",
    "exhibitor",
    "product",
    "conference",
    "speaker",
    "sponsor",
    "partner",
    "floor"
  ]
}
```

---

## Common Issues

### "psql: command not found"
- Install PostgreSQL client tools:
  - **Windows**: Download from https://www.postgresql.org/download/windows/
  - **Mac**: `brew install postgresql`
  - **Linux**: `sudo apt-get install postgresql-client`

### "Connection refused"
- Check if you're using the correct connection string from Render
- Ensure your IP is not blocked (Render allows all IPs by default)
- Verify database is running on Render dashboard

### "Permission denied"
- Make sure you're using the correct username and password from Render
- Check if database user has proper permissions

### Tables already exist
- If you see "already exists" errors, it's safe to ignore them
- The script uses `CREATE TABLE IF NOT EXISTS`

---

## Database Maintenance

### View all data in a table:
```sql
SELECT * FROM attendee;
```

### Count records:
```sql
SELECT COUNT(*) FROM attendee;
```

### Delete all data (careful!):
```sql
TRUNCATE TABLE attendee CASCADE;
```

### Drop and recreate tables:
```sql
DROP TABLE IF EXISTS floor, partner, sponsor, speaker, conference, product, exhibitor, attendee CASCADE;
-- Then run database-schema.sql again
```

---

## Quick Test Data (Optional)

After creating tables, you can add test data:

```sql
-- Add test exhibitor
INSERT INTO exhibitor (company_name, contact_person, email, booth_number, password, status)
VALUES ('Test Company', 'John Doe', 'test@example.com', 'A-101', 'password123', 'active');

-- Add test product
INSERT INTO product (name, description, category, exhibitor_id, status)
VALUES ('Test Product', 'A sample product', 'Electronics', 1, 'active');

-- Add test conference
INSERT INTO conference (title, description, date, time, location)
VALUES ('Tech Summit 2026', 'Annual technology conference', '2026-05-15', '10:00 AM', 'Main Hall');
```

---

## Backup Database (Important!)

To backup your database:

```bash
pg_dump postgresql://exhibition_system:PASSWORD@dpg-xxxxx-oregon-postgres.render.com/exhibition_db > backup.sql
```

To restore from backup:

```bash
psql postgresql://exhibition_system:PASSWORD@dpg-xxxxx-oregon-postgres.render.com/exhibition_db < backup.sql
```

---

## Database Status Check

Run this to check database health:

```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

**Status**: Database schema ready to deploy ✅
**Next Step**: Run `database-schema.sql` in your Render PostgreSQL database
