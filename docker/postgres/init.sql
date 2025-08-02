-- PulseCRM Database Initialization Script
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions for enhanced functionality
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create additional databases for different environments
CREATE DATABASE pulsecrm_test;
CREATE DATABASE pulsecrm_staging;

-- Create read-only user for analytics/reporting
CREATE USER pulsecrm_readonly WITH PASSWORD 'readonly123';
GRANT CONNECT ON DATABASE pulsecrm TO pulsecrm_readonly;
GRANT USAGE ON SCHEMA public TO pulsecrm_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO pulsecrm_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO pulsecrm_readonly;

-- Set up connection limits and performance optimizations
ALTER DATABASE pulsecrm SET shared_preload_libraries = 'pg_stat_statements';
ALTER DATABASE pulsecrm SET log_statement = 'all';
ALTER DATABASE pulsecrm SET log_min_duration_statement = 1000;

-- Initialize basic configuration
\c pulsecrm;

-- Create schema for versioning
CREATE SCHEMA IF NOT EXISTS versioning;

-- Add some initial configuration
CREATE TABLE IF NOT EXISTS system_config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial system configuration
INSERT INTO system_config (key, value, description) VALUES
    ('app_version', '1.0.0', 'Current application version'),
    ('db_version', '1.0.0', 'Current database schema version'),
    ('maintenance_mode', 'false', 'Whether the app is in maintenance mode'),
    ('max_file_upload_size', '10485760', 'Maximum file upload size in bytes (10MB)')
ON CONFLICT (key) DO NOTHING;

-- Set up audit logging function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Log database initialization
DO $$
BEGIN
    RAISE NOTICE 'PulseCRM database initialized successfully at %', NOW();
END $$;
