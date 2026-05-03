# 🗄️ Exhibition Management System - Database Entity Relationship Diagram

## Entity Relationship Diagram (ERD)

### Visual Representation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EXHIBITION MANAGEMENT SYSTEM DATABASE                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│      ATTENDEE        │
├──────────────────────┤
│ PK attendee_id       │◄─────────────────────────────────────┐
│    name              │                                       │
│ UK email             │                                       │
│    phone             │                                       │
│    password          │                                       │
│    registration_date │                                       │
│    status            │                                       │
│    profile_photo     │                                       │
│    payment_fee       │                                       │
│    password_changed  │                                       │
│    is_temporary_pwd  │                                       │
└──────────────────────┘                                       │
                                                               │
                                                               │
┌──────────────────────┐         ┌──────────────────────┐    │
│     EXHIBITOR        │         │      PRODUCT         │    │
├──────────────────────┤         ├──────────────────────┤    │
│ PK exhibitor_id      │◄────────│ PK product_id        │    │
│    company_name      │ 1     * │    name              │    │
│    contact_person    │         │    description       │    │
│ UK email             │         │    category          │    │
│    booth_number      │         │ FK exhibitor_id      │    │
│    product_ids       │         │    image_url         │    │
│    logo_url          │         │    status            │    │
│    floor_number      │         └──────────────────────┘    │
│    password          │                                      │
│    password_changed  │                                      │
│    is_temporary_pwd  │                                      │
│    status            │                                      │
└──────────┬───────────┘                                      │
           │                                                  │
           │                                                  │
           │ *                                                │
           │                                                  │
           │                                                  │
┌──────────▼───────────┐         ┌──────────────────────┐    │
│       FLOOR          │         │    CONFERENCE        │    │
├──────────────────────┤         ├──────────────────────┤    │
│ PK floor_id          │         │ PK conference_id     │◄───┼──┐
│ UK floor_number      │◄────────│    title             │    │  │
│    layout_image      │ 1     * │    description       │    │  │
│    exhibitor_ids     │         │    date              │    │  │
│    conference_ids    │◄────────│    time              │    │  │
└──────────────────────┘ 1     * │    location          │    │  │
                                 │    speaker           │    │  │
                                 │    floor_number      │    │  │
                                 └──────────┬───────────┘    │  │
                                            │                │  │
                                            │ 1              │  │
                                            │                │  │
                                            │ *              │  │
                                 ┌──────────▼───────────┐    │  │
                                 │      SPEAKER         │    │  │
                                 ├──────────────────────┤    │  │
                                 │ PK speaker_id        │    │  │
                                 │    name              │    │  │
                                 │    bio               │    │  │
                                 │    photo_url         │    │  │
                                 │    expertise         │    │  │
                                 │ FK conference_id     │────┘  │
                                 └──────────────────────┘       │
                                                                │
                                                                │
┌──────────────────────┐                                       │
│      SPONSOR         │                                       │
├──────────────────────┤                                       │
│ PK sponsor_id        │                                       │
│    company_name      │                                       │
│    logo_url          │         (No direct relationships)    │
│    website           │                                       │
│    sponsorship_level │                                       │
│    status            │                                       │
└──────────────────────┘                                       │
                                                               │
                                                               │
┌──────────────────────┐                                       │
│      PARTNER         │                                       │
├──────────────────────┤                                       │
│ PK partner_id        │                                       │
│    company_name      │                                       │
│    logo_url          │         (No direct relationships)    │
│    website           │                                       │
│    partnership_type  │                                       │
│    status            │                                       │
└──────────────────────┘                                       │
                                                               │
                                                               │
LEGEND:                                                        │
PK = Primary Key                                               │
FK = Foreign Key                                               │
UK = Unique Key                                                │
1  = One                                                       │
*  = Many                                                      │
◄──= Relationship                                              │
```

---

## Detailed Entity Relationships

### 1. **EXHIBITOR ↔ PRODUCT** (One-to-Many)
**Relationship Type**: One exhibitor can have many products

**Foreign Key**: `product.exhibitor_id` → `exhibitor.exhibitor_id`

**Cascade Rule**: `ON DELETE CASCADE`
- When an exhibitor is deleted, all their products are automatically deleted

**Business Logic**:
- Each product belongs to exactly one exhibitor
- An exhibitor can showcase multiple products
- Products cannot exist without an exhibitor

**SQL Constraint**:
```sql
FOREIGN KEY (exhibitor_id) 
REFERENCES exhibitor(exhibitor_id) 
ON DELETE CASCADE
```

---

### 2. **CONFERENCE ↔ SPEAKER** (One-to-Many)
**Relationship Type**: One conference can have many speakers (though typically one)

**Foreign Key**: `speaker.conference_id` → `conference.conference_id`

**Cascade Rule**: `ON DELETE SET NULL`
- When a conference is deleted, speakers are not deleted but their conference_id is set to NULL

**Business Logic**:
- Each speaker can be assigned to one conference
- A conference can have multiple speakers (or none)
- Speakers can exist independently of conferences

**SQL Constraint**:
```sql
FOREIGN KEY (conference_id) 
REFERENCES conference(conference_id) 
ON DELETE SET NULL
```

---

### 3. **FLOOR ↔ EXHIBITOR** (Many-to-Many via Text Field)
**Relationship Type**: Many exhibitors can be on one floor

**Implementation**: Text field `floor.exhibitor_ids` stores comma-separated IDs

**Business Logic**:
- Each floor can host multiple exhibitors
- Each exhibitor is assigned to one floor (via `exhibitor.floor_number`)
- Floor tracks all exhibitors via `exhibitor_ids` field

**Example**:
```
floor.exhibitor_ids = "1,2,3,4,5"
exhibitor.floor_number = "1"
```

**Note**: This is a denormalized design for simplicity. A normalized design would use a junction table.

---

### 4. **FLOOR ↔ CONFERENCE** (Many-to-Many via Text Field)
**Relationship Type**: Many conferences can be on one floor

**Implementation**: Text field `floor.conference_ids` stores comma-separated IDs

**Business Logic**:
- Each floor can host multiple conferences
- Each conference is assigned to one floor (via `conference.floor_number`)
- Floor tracks all conferences via `conference_ids` field

**Example**:
```
floor.conference_ids = "1,2,3"
conference.floor_number = "2"
```

---

### 5. **ATTENDEE** (Independent Entity)
**Relationship Type**: No direct foreign key relationships

**Business Logic**:
- Attendees register independently
- No direct database relationship with other entities
- Relationships managed at application level

**Potential Future Relationships**:
- Attendee ↔ Conference (registration/attendance tracking)
- Attendee ↔ Exhibitor (booth visits, favorites)
- Attendee ↔ Product (interests, inquiries)

---

### 6. **SPONSOR** (Independent Entity)
**Relationship Type**: No direct foreign key relationships

**Business Logic**:
- Sponsors are standalone entities
- Displayed on exhibition pages
- No database-level relationships

**Potential Future Relationships**:
- Sponsor ↔ Conference (sponsorship tracking)
- Sponsor ↔ Floor (sponsored areas)

---

### 7. **PARTNER** (Independent Entity)
**Relationship Type**: No direct foreign key relationships

**Business Logic**:
- Partners are standalone entities
- Displayed on exhibition pages
- No database-level relationships

**Potential Future Relationships**:
- Partner ↔ Conference (partnership tracking)
- Partner ↔ Exhibitor (partner companies)

---

## Cardinality Summary

| Relationship | Cardinality | Description |
|--------------|-------------|-------------|
| Exhibitor → Product | 1:N | One exhibitor has many products |
| Conference → Speaker | 1:N | One conference has many speakers |
| Floor → Exhibitor | 1:N | One floor has many exhibitors |
| Floor → Conference | 1:N | One floor has many conferences |
| Attendee | Independent | No direct relationships |
| Sponsor | Independent | No direct relationships |
| Partner | Independent | No direct relationships |

---

## Database Constraints

### Primary Keys
All tables have auto-incrementing primary keys:
```sql
attendee_id SERIAL PRIMARY KEY
exhibitor_id SERIAL PRIMARY KEY
product_id SERIAL PRIMARY KEY
conference_id SERIAL PRIMARY KEY
speaker_id SERIAL PRIMARY KEY
sponsor_id SERIAL PRIMARY KEY
partner_id SERIAL PRIMARY KEY
floor_id SERIAL PRIMARY KEY
```

### Unique Constraints
Prevent duplicate entries:
```sql
-- Attendee
UNIQUE (email)

-- Exhibitor
UNIQUE (email)

-- Floor
UNIQUE (floor_number)
```

### Foreign Key Constraints
Maintain referential integrity:
```sql
-- Product references Exhibitor
FOREIGN KEY (exhibitor_id) 
REFERENCES exhibitor(exhibitor_id) 
ON DELETE CASCADE

-- Speaker references Conference
FOREIGN KEY (conference_id) 
REFERENCES conference(conference_id) 
ON DELETE SET NULL
```

### Indexes
Improve query performance:
```sql
CREATE INDEX idx_attendee_email ON attendee(email);
CREATE INDEX idx_exhibitor_email ON exhibitor(email);
CREATE INDEX idx_product_exhibitor ON product(exhibitor_id);
CREATE INDEX idx_speaker_conference ON speaker(conference_id);
CREATE INDEX idx_conference_date ON conference(date);
```

---

## Entity Attributes Detail

### ATTENDEE
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| attendee_id | SERIAL | PRIMARY KEY | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| phone | VARCHAR(50) | | Phone number |
| password | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| registration_date | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Registration date |
| status | VARCHAR(50) | DEFAULT 'active' | Account status |
| profile_photo | VARCHAR(500) | | Cloudinary URL |
| payment_fee | DECIMAL(10,2) | DEFAULT 200.00 | Registration fee |
| password_changed | BOOLEAN | DEFAULT true | Password change flag |
| is_temporary_password | BOOLEAN | DEFAULT false | Temporary password flag |

### EXHIBITOR
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| exhibitor_id | SERIAL | PRIMARY KEY | Unique identifier |
| company_name | VARCHAR(255) | NOT NULL | Company name |
| contact_person | VARCHAR(255) | | Contact person name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| booth_number | VARCHAR(50) | | Assigned booth |
| product_ids | TEXT | | Comma-separated product IDs |
| logo_url | VARCHAR(500) | | Cloudinary URL |
| floor_number | VARCHAR(10) | | Floor location |
| password | VARCHAR(255) | | BCrypt hashed password |
| password_changed | BOOLEAN | DEFAULT false | Password change flag |
| is_temporary_password | BOOLEAN | DEFAULT true | Temporary password flag |
| status | VARCHAR(50) | DEFAULT 'active' | Account status |

### PRODUCT
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| product_id | SERIAL | PRIMARY KEY | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Product name |
| description | TEXT | | Product description |
| category | VARCHAR(100) | | Product category |
| exhibitor_id | INTEGER | FOREIGN KEY | Owner exhibitor |
| image_url | VARCHAR(500) | | Cloudinary URL |
| status | VARCHAR(50) | DEFAULT 'active' | Product status |

### CONFERENCE
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| conference_id | SERIAL | PRIMARY KEY | Unique identifier |
| title | VARCHAR(255) | NOT NULL | Conference title |
| description | TEXT | | Conference description |
| date | DATE | NOT NULL | Conference date |
| time | VARCHAR(50) | | Conference time |
| location | VARCHAR(255) | | Conference location |
| speaker | VARCHAR(255) | | Speaker name |
| floor_number | VARCHAR(10) | | Floor location |

### SPEAKER
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| speaker_id | SERIAL | PRIMARY KEY | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Speaker name |
| bio | TEXT | | Speaker biography |
| photo_url | VARCHAR(500) | | Cloudinary URL |
| expertise | VARCHAR(255) | | Area of expertise |
| conference_id | INTEGER | FOREIGN KEY (nullable) | Assigned conference |

### SPONSOR
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| sponsor_id | SERIAL | PRIMARY KEY | Unique identifier |
| company_name | VARCHAR(255) | NOT NULL | Company name |
| logo_url | VARCHAR(500) | | Cloudinary URL |
| website | VARCHAR(500) | | Company website |
| sponsorship_level | VARCHAR(100) | | Gold/Silver/Bronze |
| status | VARCHAR(50) | DEFAULT 'active' | Sponsor status |

### PARTNER
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| partner_id | SERIAL | PRIMARY KEY | Unique identifier |
| company_name | VARCHAR(255) | NOT NULL | Company name |
| logo_url | VARCHAR(500) | | Cloudinary URL |
| website | VARCHAR(500) | | Company website |
| partnership_type | VARCHAR(100) | | Partnership type |
| status | VARCHAR(50) | DEFAULT 'active' | Partner status |

### FLOOR
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| floor_id | SERIAL | PRIMARY KEY | Unique identifier |
| floor_number | INTEGER | UNIQUE, NOT NULL | Floor number |
| layout_image | VARCHAR(500) | | Cloudinary URL |
| exhibitor_ids | TEXT | | Comma-separated IDs |
| conference_ids | TEXT | | Comma-separated IDs |

---

## Data Flow Examples

### Example 1: Adding an Exhibitor with Products

```sql
-- Step 1: Insert Exhibitor
INSERT INTO exhibitor (company_name, email, booth_number, floor_number)
VALUES ('Tech Corp', 'info@techcorp.com', 'A-101', '1');
-- Returns: exhibitor_id = 1

-- Step 2: Insert Products
INSERT INTO product (name, exhibitor_id, category)
VALUES 
  ('Smart Device', 1, 'Electronics'),
  ('IoT Sensor', 1, 'Electronics');
-- Returns: product_id = 1, 2

-- Step 3: Update Exhibitor with Product IDs
UPDATE exhibitor 
SET product_ids = '1,2' 
WHERE exhibitor_id = 1;

-- Step 4: Update Floor with Exhibitor
UPDATE floor 
SET exhibitor_ids = CONCAT(exhibitor_ids, ',1')
WHERE floor_number = 1;
```

### Example 2: Creating a Conference with Speaker

```sql
-- Step 1: Insert Conference
INSERT INTO conference (title, date, time, floor_number)
VALUES ('AI in Manufacturing', '2026-06-15', '10:00 AM', '2');
-- Returns: conference_id = 1

-- Step 2: Insert Speaker
INSERT INTO speaker (name, bio, expertise, conference_id)
VALUES ('Dr. John Smith', 'AI Expert', 'Artificial Intelligence', 1);
-- Returns: speaker_id = 1

-- Step 3: Update Floor with Conference
UPDATE floor 
SET conference_ids = CONCAT(conference_ids, ',1')
WHERE floor_number = 2;
```

### Example 3: Deleting an Exhibitor (Cascade Effect)

```sql
-- Delete Exhibitor
DELETE FROM exhibitor WHERE exhibitor_id = 1;

-- Automatic Cascade:
-- 1. All products with exhibitor_id = 1 are deleted
-- 2. Floor.exhibitor_ids needs manual cleanup (application level)
```

---

## Normalization Level

### Current Normalization: **2NF (Second Normal Form)**

**Characteristics**:
- ✅ All tables have primary keys
- ✅ No partial dependencies
- ✅ Most attributes depend on the primary key
- ⚠️ Some denormalization for performance (product_ids, exhibitor_ids, conference_ids)

**Denormalized Fields**:
- `exhibitor.product_ids` (TEXT) - Should be junction table
- `floor.exhibitor_ids` (TEXT) - Should be junction table
- `floor.conference_ids` (TEXT) - Should be junction table

**Reason for Denormalization**:
- Simpler queries for common operations
- Reduced join complexity
- Better read performance
- Acceptable for small to medium datasets

---

## Potential Improvements (3NF)

### Normalized Design with Junction Tables

```sql
-- Junction table for Floor-Exhibitor relationship
CREATE TABLE floor_exhibitor (
    floor_id INTEGER REFERENCES floor(floor_id),
    exhibitor_id INTEGER REFERENCES exhibitor(exhibitor_id),
    PRIMARY KEY (floor_id, exhibitor_id)
);

-- Junction table for Floor-Conference relationship
CREATE TABLE floor_conference (
    floor_id INTEGER REFERENCES floor(floor_id),
    conference_id INTEGER REFERENCES conference(conference_id),
    PRIMARY KEY (floor_id, conference_id)
);

-- Junction table for Exhibitor-Product relationship (already normalized)
-- product.exhibitor_id already implements this correctly
```

**Benefits of Normalization**:
- ✅ Better data integrity
- ✅ Easier to query complex relationships
- ✅ No need to parse comma-separated values
- ✅ Standard SQL operations

**Trade-offs**:
- ❌ More complex queries (more JOINs)
- ❌ Slightly slower read performance
- ❌ More tables to manage

---

## Query Examples

### Get all products for an exhibitor
```sql
SELECT p.* 
FROM product p
WHERE p.exhibitor_id = 1;
```

### Get all exhibitors on a floor
```sql
SELECT e.* 
FROM exhibitor e
WHERE e.floor_number = '1';
```

### Get speaker for a conference
```sql
SELECT s.* 
FROM speaker s
WHERE s.conference_id = 1;
```

### Get all conferences on a floor
```sql
SELECT c.* 
FROM conference c
WHERE c.floor_number = '2';
```

### Get exhibitor with all products
```sql
SELECT 
    e.exhibitor_id,
    e.company_name,
    e.booth_number,
    json_agg(
        json_build_object(
            'product_id', p.product_id,
            'name', p.name,
            'category', p.category
        )
    ) as products
FROM exhibitor e
LEFT JOIN product p ON e.exhibitor_id = p.exhibitor_id
WHERE e.exhibitor_id = 1
GROUP BY e.exhibitor_id;
```

---

## Database Statistics

- **Total Tables**: 8
- **Total Relationships**: 2 (with foreign keys) + 2 (text-based)
- **Primary Keys**: 8
- **Foreign Keys**: 2
- **Unique Constraints**: 3
- **Indexes**: 5
- **Cascade Deletes**: 1 (Exhibitor → Product)
- **Set Null on Delete**: 1 (Conference → Speaker)

---

**Document Version**: 1.0  
**Last Updated**: May 3, 2026  
**Database Version**: PostgreSQL 14+
