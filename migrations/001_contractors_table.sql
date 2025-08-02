-- Migration: Add Contractors table and update schema
-- Run this SQL to update your database schema from crew_members to contractors

-- First, drop the old crew_members related tables if they exist
DROP TABLE IF EXISTS job_assignments CASCADE;
DROP TABLE IF EXISTS crew_members CASCADE;

-- Create the new contractors table
CREATE TABLE IF NOT EXISTS contractors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    
    -- Company Information
    company_name VARCHAR(255),
    business_type VARCHAR(100),
    license_number VARCHAR(100),
    insurance_provider VARCHAR(255),
    insurance_policy_number VARCHAR(100),
    insurance_expiration_date DATE,
    bonding_company VARCHAR(255),
    bond_amount DECIMAL(12, 2),
    
    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    fax VARCHAR(50),
    website VARCHAR(255),
    
    -- Address Information
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'US',
    
    -- Business Details
    skills JSONB,
    specialties JSONB,
    hourly_rate DECIMAL(8, 2),
    day_rate DECIMAL(10, 2),
    overtime_rate DECIMAL(8, 2),
    payment_terms VARCHAR(100),
    tax_id VARCHAR(50),
    w9_on_file BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Emergency Contact
    emergency_contact JSONB,
    
    -- Status and Dates
    contract_start_date DATE,
    contract_end_date DATE,
    status VARCHAR(50) DEFAULT 'active' NOT NULL,
    rating DECIMAL(3, 2),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for contractors table
CREATE INDEX contractors_name_idx ON contractors(first_name, last_name);
CREATE INDEX contractors_company_idx ON contractors(company_name);
CREATE INDEX contractors_email_idx ON contractors(email);
CREATE INDEX contractors_status_idx ON contractors(status);
CREATE INDEX contractors_user_idx ON contractors(user_id);
CREATE INDEX contractors_org_idx ON contractors(organization_id);

-- Create the new job_assignments table
CREATE TABLE IF NOT EXISTS job_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    job_id UUID NOT NULL REFERENCES jobs(id),
    contractor_id UUID NOT NULL REFERENCES contractors(id),
    role VARCHAR(100),
    assigned_date DATE NOT NULL,
    unassigned_date DATE,
    hourly_rate DECIMAL(8, 2),
    day_rate DECIMAL(10, 2),
    contract_amount DECIMAL(12, 2),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for job_assignments table
CREATE INDEX job_assignments_job_idx ON job_assignments(job_id);
CREATE INDEX job_assignments_contractor_idx ON job_assignments(contractor_id);
CREATE INDEX job_assignments_role_idx ON job_assignments(role);
CREATE INDEX job_assignments_org_idx ON job_assignments(organization_id);

-- Create unique constraint
CREATE UNIQUE INDEX job_assignments_unique_active ON job_assignments(job_id, contractor_id, is_active) 
WHERE is_active = TRUE;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contractors_updated_at BEFORE UPDATE ON contractors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_assignments_updated_at BEFORE UPDATE ON job_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add some example data (optional)
-- INSERT INTO contractors (organization_id, first_name, last_name, email, phone, company_name, hourly_rate, status)
-- VALUES 
--     ('your-org-id', 'John', 'Smith', 'john.smith@example.com', '555-0123', 'Smith Construction LLC', 85.00, 'active'),
--     ('your-org-id', 'Jane', 'Doe', 'jane@doebuilders.com', '555-0124', 'Doe Builders Inc', 95.00, 'active');
