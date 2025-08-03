import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import crypto from 'crypto';

const t = initTRPC.create();

// Temporary in-memory storage (replace with database queries)
const organizationIntegrations = new Map<string, any[]>();
const integrationLogs = new Map<string, any[]>();

// Helper to encrypt sensitive data (implement proper encryption in production)
const encrypt = (text: string): string => {
  // In production, use proper encryption with environment-based keys
  return Buffer.from(text).toString('base64');
};

const decrypt = (encryptedText: string): string => {
  // In production, use proper decryption
  return Buffer.from(encryptedText, 'base64').toString('utf-8');
};

export const integrationsRouter = t.router({
  // Get all available integrations
  getAvailableIntegrations: t.procedure
    .input(z.object({
      category: z.string().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      // In production, query from database
      // Currently returning empty array as integrations are coming soon
      const integrations: any[] = [];

      let filtered = integrations;

      if (input.category) {
        filtered = filtered.filter(i => i.category === input.category);
      }

      if (input.search) {
        const searchLower = input.search.toLowerCase();
        filtered = filtered.filter(i => 
          i.displayName.toLowerCase().includes(searchLower) ||
          i.description.toLowerCase().includes(searchLower)
        );
      }

      return filtered;
    }),

  // Get organization's connected integrations
  getOrganizationIntegrations: t.procedure
    .input(z.object({
      organizationId: z.string(),
    }))
    .query(async ({ input }) => {
      // In production, query from database
      const orgIntegrations = organizationIntegrations.get(input.organizationId) || [];
      return orgIntegrations;
    }),

  // Connect an integration
  connectIntegration: t.procedure
    .input(z.object({
      organizationId: z.string(),
      integrationId: z.string(),
      authType: z.enum(['oauth2', 'api_key', 'basic']),
      credentials: z.object({
        apiKey: z.string().optional(),
        apiSecret: z.string().optional(),
        accessToken: z.string().optional(),
        refreshToken: z.string().optional(),
      }).optional(),
      config: z.record(z.any()).optional(),
    }))
    .mutation(async ({ input }) => {
      const integrationConfig = {
        id: crypto.randomBytes(16).toString('hex'),
        organizationId: input.organizationId,
        integrationId: input.integrationId,
        isConnected: true,
        connectedAt: new Date().toISOString(),
        config: input.config || {},
        lastSyncAt: null,
        totalApiCalls: 0,
        errorCount: 0,
      };

      // Store encrypted credentials based on auth type
      if (input.authType === 'api_key' && input.credentials?.apiKey) {
        integrationConfig.apiKey = encrypt(input.credentials.apiKey);
        if (input.credentials.apiSecret) {
          integrationConfig.apiSecret = encrypt(input.credentials.apiSecret);
        }
      } else if (input.authType === 'oauth2' && input.credentials?.accessToken) {
        integrationConfig.accessToken = encrypt(input.credentials.accessToken);
        if (input.credentials.refreshToken) {
          integrationConfig.refreshToken = encrypt(input.credentials.refreshToken);
        }
      }

      // Store in memory (replace with database insert)
      const orgIntegrations = organizationIntegrations.get(input.organizationId) || [];
      orgIntegrations.push(integrationConfig);
      organizationIntegrations.set(input.organizationId, orgIntegrations);

      // Log the action
      const log = {
        id: crypto.randomBytes(16).toString('hex'),
        organizationId: input.organizationId,
        integrationId: input.integrationId,
        action: 'connected',
        timestamp: new Date().toISOString(),
        details: { authType: input.authType },
      };
      const logs = integrationLogs.get(input.organizationId) || [];
      logs.push(log);
      integrationLogs.set(input.organizationId, logs);

      return {
        success: true,
        message: 'Integration connected successfully',
        integrationId: integrationConfig.id,
      };
    }),

  // Disconnect an integration
  disconnectIntegration: t.procedure
    .input(z.object({
      organizationId: z.string(),
      integrationId: z.string(),
    }))
    .mutation(async ({ input }) => {
      // In production, update database
      const orgIntegrations = organizationIntegrations.get(input.organizationId) || [];
      const index = orgIntegrations.findIndex(i => i.integrationId === input.integrationId);
      
      if (index === -1) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Integration not found',
        });
      }

      // Remove the integration
      orgIntegrations.splice(index, 1);
      organizationIntegrations.set(input.organizationId, orgIntegrations);

      // Log the action
      const log = {
        id: crypto.randomBytes(16).toString('hex'),
        organizationId: input.organizationId,
        integrationId: input.integrationId,
        action: 'disconnected',
        timestamp: new Date().toISOString(),
      };
      const logs = integrationLogs.get(input.organizationId) || [];
      logs.push(log);
      integrationLogs.set(input.organizationId, logs);

      return {
        success: true,
        message: 'Integration disconnected successfully',
      };
    }),

  // Update integration configuration
  updateIntegrationConfig: t.procedure
    .input(z.object({
      organizationId: z.string(),
      integrationId: z.string(),
      config: z.record(z.any()),
    }))
    .mutation(async ({ input }) => {
      const orgIntegrations = organizationIntegrations.get(input.organizationId) || [];
      const integration = orgIntegrations.find(i => i.integrationId === input.integrationId);
      
      if (!integration) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Integration not found',
        });
      }

      // Update config
      integration.config = { ...integration.config, ...input.config };
      integration.updatedAt = new Date().toISOString();

      return {
        success: true,
        message: 'Integration configuration updated',
      };
    }),

  // Test integration connection
  testIntegration: t.procedure
    .input(z.object({
      organizationId: z.string(),
      integrationId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const orgIntegrations = organizationIntegrations.get(input.organizationId) || [];
      const integration = orgIntegrations.find(i => i.integrationId === input.integrationId);
      
      if (!integration) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Integration not found',
        });
      }

      // Simulate API test based on integration type
      // In production, make actual API calls to test connectivity
      const testResult = {
        success: Math.random() > 0.1, // 90% success rate for demo
        message: 'Connection test completed',
        details: {
          responseTime: Math.floor(Math.random() * 500) + 100,
          apiVersion: '2.0',
          rateLimit: {
            remaining: 4950,
            total: 5000,
          },
        },
      };

      // Update last test timestamp
      integration.lastTestedAt = new Date().toISOString();
      if (!testResult.success) {
        integration.errorCount = (integration.errorCount || 0) + 1;
        integration.lastError = 'Connection test failed';
        integration.lastErrorAt = new Date().toISOString();
      }

      return testResult;
    }),

  // Get integration activity logs
  getIntegrationLogs: t.procedure
    .input(z.object({
      organizationId: z.string(),
      integrationId: z.string().optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const logs = integrationLogs.get(input.organizationId) || [];
      
      let filtered = logs;
      if (input.integrationId) {
        filtered = logs.filter(l => l.integrationId === input.integrationId);
      }

      // Sort by timestamp descending and limit
      filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return filtered.slice(0, input.limit);
    }),

  // Sync data from integration
  syncIntegration: t.procedure
    .input(z.object({
      organizationId: z.string(),
      integrationId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const orgIntegrations = organizationIntegrations.get(input.organizationId) || [];
      const integration = orgIntegrations.find(i => i.integrationId === input.integrationId);
      
      if (!integration) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Integration not found',
        });
      }

      // Simulate data sync
      // In production, perform actual API calls and data synchronization
      const syncResult = {
        success: true,
        recordsSynced: Math.floor(Math.random() * 100) + 1,
        duration: Math.floor(Math.random() * 5000) + 1000,
        timestamp: new Date().toISOString(),
      };

      // Update integration stats
      integration.lastSyncAt = syncResult.timestamp;
      integration.totalApiCalls = (integration.totalApiCalls || 0) + 5;
      integration.totalDataSynced = (integration.totalDataSynced || 0) + syncResult.recordsSynced;

      // Log the sync
      const log = {
        id: crypto.randomBytes(16).toString('hex'),
        organizationId: input.organizationId,
        integrationId: input.integrationId,
        action: 'synced',
        timestamp: new Date().toISOString(),
        details: syncResult,
      };
      const logs = integrationLogs.get(input.organizationId) || [];
      logs.push(log);
      integrationLogs.set(input.organizationId, logs);

      return syncResult;
    }),
});