-- Exhibition Management System Database Schema
-- Run this script in your Render PostgreSQL database

-- Create attendee table
CREATE TABLE IF NOT EXISTS attendee (
    attendee_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    profile_photo VARCHAR(500),
    payment_fee DECIMAL(10, 2) DEFAULT 200.00,
    password_changed BOOLEAN DEFAULT true,
    is_temporary_password BOOLEAN DEFAULT false
);

-- Create exhibitor table
CREATE TABLE IF NOT EXISTS exhibitor (
    exhibitor_id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    booth_number VARCHAR(50),
    product_ids TEXT,
    logo_url VARCHAR(500),
    floor_number VARCHAR(10),
    password VARCHAR(255),
    password_changed BOOLEAN DEFAULT false,
    is_temporary_password BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'active'
);

-- Create product table
CREATE TABLE IF NOT EXISTS product (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    exhibitor_id INTEGER REFERENCES exhibitor(exhibitor_id) ON DELETE CASCADE,
    image_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active'
);

-- Create conference table
CREATE TABLE IF NOT EXISTS conference (
    conference_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time VARCHAR(50),
    location VARCHAR(255),
    speaker VARCHAR(255),
    floor_number VARCHAR(10)
);

-- Create speaker table
CREATE TABLE IF NOT EXISTS speaker (
    speaker_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    expertise VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    organization VARCHAR(255)
);

-- Create sponsor table
CREATE TABLE IF NOT EXISTS sponsor (
    sponsor_id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    website VARCHAR(500),
    sponsorship_level VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active'
);

-- Create partner table
CREATE TABLE IF NOT EXISTS partner (
    partner_id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    website VARCHAR(500),
    partnership_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active'
);

-- Create floor table
CREATE TABLE IF NOT EXISTS floor (
    floor_id SERIAL PRIMARY KEY,
    floor_number INTEGER UNIQUE NOT NULL,
    layout_image VARCHAR(500),
    exhibitor_ids TEXT,
    conference_ids TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendee_email ON attendee(email);
CREATE INDEX IF NOT EXISTS idx_exhibitor_email ON exhibitor(email);
CREATE INDEX IF NOT EXISTS idx_product_exhibitor ON product(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_speaker_email ON speaker(email);
CREATE INDEX IF NOT EXISTS idx_conference_date ON conference(date);

-- Display success message
SELECT 'Database schema created successfully!' as message;
