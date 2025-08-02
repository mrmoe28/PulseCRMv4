-- Multi-tenancy migration for ConstructFlow
-- This adds organization-level data isolation

-- 1. Create Organizations table (each signup gets their own organization)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  plan VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
  status VARCHAR(50) DEFAULT 'active',
  max_users INTEGER DEFAULT 5,
  max_jobs INTEGER DEFAULT 50,
  max_storage_gb INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Add organization_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS invitation_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS invited_by_user_id UUID REFERENCES users(id);

-- 3. Add organization_id to all data tables for isolation
ALTER TABLE companies ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_companies_org_id ON companies(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_org_id ON jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON tasks(organization_id);

-- 5. Row-Level Security (RLS) for data isolation
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 6. Security policies (users can only see their org's data)
CREATE POLICY org_users_policy ON users
FOR ALL TO authenticated
USING (organization_id = current_setting('app.current_org_id')::UUID);

CREATE POLICY org_companies_policy ON companies
FOR ALL TO authenticated  
USING (organization_id = current_setting('app.current_org_id')::UUID);

CREATE POLICY org_contacts_policy ON contacts
FOR ALL TO authenticated
USING (organization_id = current_setting('app.current_org_id')::UUID);

CREATE POLICY org_jobs_policy ON jobs
FOR ALL TO authenticated
USING (organization_id = current_setting('app.current_org_id')::UUID);

CREATE POLICY org_tasks_policy ON tasks
FOR ALL TO authenticated
USING (organization_id = current_setting('app.current_org_id')::UUID);