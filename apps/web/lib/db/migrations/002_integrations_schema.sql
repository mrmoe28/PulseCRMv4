-- Integrations Schema for PulseCRM
-- This migration adds tables for managing third-party integrations, API keys, and webhooks

-- 1. Available integrations catalog (system-wide)
CREATE TABLE IF NOT EXISTS integrations (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- 'communication', 'storage', 'project-management', 'accounting', 'calendar', 'payment', 'marketing'
    icon_url TEXT,
    icon_emoji VARCHAR(10),
    color VARCHAR(50), -- Tailwind color class
    auth_type VARCHAR(50) NOT NULL, -- 'oauth2', 'api_key', 'basic', 'custom'
    oauth_authorize_url TEXT,
    oauth_token_url TEXT,
    oauth_scopes TEXT[], -- Array of required scopes
    api_base_url TEXT,
    webhook_support BOOLEAN DEFAULT false,
    documentation_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_beta BOOLEAN DEFAULT false,
    features TEXT[], -- Array of feature descriptions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Organization-specific integration configurations
CREATE TABLE IF NOT EXISTS organization_integrations (
    id VARCHAR(255) PRIMARY KEY,
    organization_id VARCHAR(255) NOT NULL,
    integration_id VARCHAR(255) NOT NULL,
    is_connected BOOLEAN DEFAULT false,
    -- OAuth fields
    access_token TEXT, -- Encrypted
    refresh_token TEXT, -- Encrypted
    token_expires_at TIMESTAMP WITH TIME ZONE,
    -- API key fields
    api_key TEXT, -- Encrypted
    api_secret TEXT, -- Encrypted
    -- Configuration
    config JSONB, -- Flexible config storage
    webhook_secret VARCHAR(255),
    -- Metadata
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_interval_minutes INTEGER DEFAULT 15,
    total_api_calls INTEGER DEFAULT 0,
    total_data_synced INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    last_error_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, integration_id)
);

-- 3. API Keys for external access to PulseCRM
CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(255) PRIMARY KEY,
    organization_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE, -- SHA256 hash of the key
    key_prefix VARCHAR(20) NOT NULL, -- First few chars for identification (pk_live_xxx...)
    permissions TEXT[], -- Array of allowed endpoints/actions
    rate_limit_per_hour INTEGER DEFAULT 1000,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    last_used_ip VARCHAR(45),
    total_requests INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by VARCHAR(255),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (revoked_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Webhooks for receiving events
CREATE TABLE IF NOT EXISTS webhooks (
    id VARCHAR(255) PRIMARY KEY,
    organization_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL, -- Array of event types to subscribe to
    headers JSONB, -- Custom headers to include
    secret VARCHAR(255), -- For payload signature verification
    is_active BOOLEAN DEFAULT true,
    retry_on_failure BOOLEAN DEFAULT true,
    max_retries INTEGER DEFAULT 3,
    timeout_seconds INTEGER DEFAULT 30,
    -- Stats
    total_deliveries INTEGER DEFAULT 0,
    successful_deliveries INTEGER DEFAULT 0,
    failed_deliveries INTEGER DEFAULT 0,
    last_delivery_at TIMESTAMP WITH TIME ZONE,
    last_delivery_status INTEGER,
    last_error TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Webhook delivery logs
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id VARCHAR(255) PRIMARY KEY,
    webhook_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    response_headers JSONB,
    delivery_time_ms INTEGER,
    attempt_number INTEGER DEFAULT 1,
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
);

-- 6. Integration activity logs
CREATE TABLE IF NOT EXISTS integration_logs (
    id VARCHAR(255) PRIMARY KEY,
    organization_id VARCHAR(255) NOT NULL,
    integration_id VARCHAR(255),
    user_id VARCHAR(255),
    action VARCHAR(100) NOT NULL, -- 'connected', 'disconnected', 'synced', 'error', 'config_updated'
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_org_integrations_org_id ON organization_integrations(organization_id);
CREATE INDEX idx_org_integrations_connected ON organization_integrations(is_connected);
CREATE INDEX idx_api_keys_org_id ON api_keys(organization_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);
CREATE INDEX idx_webhooks_org_id ON webhooks(organization_id);
CREATE INDEX idx_webhooks_active ON webhooks(is_active);
CREATE INDEX idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_delivered_at ON webhook_deliveries(delivered_at);
CREATE INDEX idx_integration_logs_org_id ON integration_logs(organization_id);
CREATE INDEX idx_integration_logs_created_at ON integration_logs(created_at);

-- Insert default integrations catalog
INSERT INTO integrations (id, name, display_name, description, category, icon_emoji, color, auth_type, features, is_active) VALUES
-- Communication
('gmail', 'gmail', 'Gmail', 'Send and receive emails directly from PulseCRM', 'communication', '📧', 'bg-red-500', 'oauth2', ARRAY['Email sync', 'Auto-reply', 'Templates', 'Attachments'], true),
('sendgrid', 'sendgrid', 'SendGrid', 'Professional email delivery service', 'communication', '📮', 'bg-blue-500', 'api_key', ARRAY['Bulk emails', 'Analytics', 'Templates', 'API access'], true),
('slack', 'slack', 'Slack', 'Team communication and notifications', 'communication', '💬', 'bg-purple-600', 'oauth2', ARRAY['Notifications', 'Channels', 'Direct messages', 'File sharing'], true),
('twilio', 'twilio', 'Twilio', 'SMS notifications and messaging', 'communication', '📱', 'bg-red-600', 'api_key', ARRAY['SMS', 'Voice calls', 'WhatsApp', 'Verification'], true),

-- Storage
('google-drive', 'google_drive', 'Google Drive', 'Store and sync documents', 'storage', '☁️', 'bg-blue-600', 'oauth2', ARRAY['File sync', 'Folders', 'Sharing', 'Version control'], true),
('dropbox', 'dropbox', 'Dropbox', 'Sync files and documents', 'storage', '📦', 'bg-blue-700', 'oauth2', ARRAY['File sync', 'Paper docs', 'Comments', 'Smart sync'], true),
('aws-s3', 'aws_s3', 'AWS S3', 'Enterprise cloud storage', 'storage', '🗄️', 'bg-orange-600', 'api_key', ARRAY['Unlimited storage', 'CDN', 'Encryption', 'Lifecycle'], true),

-- Project Management
('trello', 'trello', 'Trello', 'Sync jobs with Trello boards', 'project-management', '📋', 'bg-blue-500', 'oauth2', ARRAY['Boards', 'Cards', 'Checklists', 'Power-ups'], true),
('asana', 'asana', 'Asana', 'Project tracking and collaboration', 'project-management', '🎯', 'bg-pink-500', 'oauth2', ARRAY['Tasks', 'Projects', 'Timeline', 'Portfolios'], true),

-- Accounting
('quickbooks', 'quickbooks', 'QuickBooks', 'Sync invoices and financial data', 'accounting', '💰', 'bg-green-600', 'oauth2', ARRAY['Invoices', 'Expenses', 'Reports', 'Payroll'], true),
('xero', 'xero', 'Xero', 'Cloud-based accounting', 'accounting', '📈', 'bg-blue-400', 'oauth2', ARRAY['Bank feeds', 'Invoicing', 'Inventory', 'Projects'], true),

-- Calendar
('google-calendar', 'google_calendar', 'Google Calendar', 'Sync schedules and appointments', 'calendar', '📅', 'bg-blue-500', 'oauth2', ARRAY['Events', 'Reminders', 'Availability', 'Rooms'], true),
('calendly', 'calendly', 'Calendly', 'Automated scheduling', 'calendar', '🗓️', 'bg-indigo-500', 'oauth2', ARRAY['Booking pages', 'Round robin', 'Payments', 'Workflows'], true),

-- Payment
('stripe', 'stripe', 'Stripe', 'Accept payments and subscriptions', 'payment', '💳', 'bg-purple-600', 'api_key', ARRAY['Payments', 'Subscriptions', 'Invoices', 'Fraud protection'], true),
('paypal', 'paypal', 'PayPal', 'Process PayPal payments', 'payment', '💸', 'bg-blue-700', 'oauth2', ARRAY['Checkout', 'Subscriptions', 'Payouts', 'Disputes'], true),

-- Marketing
('mailchimp', 'mailchimp', 'Mailchimp', 'Email marketing automation', 'marketing', '🐵', 'bg-yellow-500', 'api_key', ARRAY['Campaigns', 'Automations', 'Analytics', 'A/B testing'], true),
('hubspot', 'hubspot', 'HubSpot', 'CRM and marketing platform', 'marketing', '🎯', 'bg-orange-600', 'oauth2', ARRAY['CRM', 'Marketing', 'Sales', 'Service'], true);