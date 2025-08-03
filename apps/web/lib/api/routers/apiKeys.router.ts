import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import crypto from 'crypto';

const t = initTRPC.create();

// Temporary in-memory storage (replace with database queries)
const apiKeys = new Map<string, any[]>();

// Generate a secure API key
const generateApiKey = (prefix: string = 'pk'): { key: string; hash: string; prefix: string } => {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const key = `${prefix}_${randomBytes}`;
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  const displayPrefix = `${prefix}_${randomBytes.substring(0, 8)}...`;
  
  return { key, hash, prefix: displayPrefix };
};

export const apiKeysRouter = t.router({
  // Get all API keys for an organization
  getApiKeys: t.procedure
    .input(z.object({
      organizationId: z.string(),
    }))
    .query(async ({ input }) => {
      const orgKeys = apiKeys.get(input.organizationId) || [];
      
      // Return keys without the actual key value (only prefix for display)
      return orgKeys.map(key => ({
        id: key.id,
        name: key.name,
        keyPrefix: key.keyPrefix,
        permissions: key.permissions,
        rateLimit: key.rateLimit,
        expiresAt: key.expiresAt,
        lastUsedAt: key.lastUsedAt,
        lastUsedIp: key.lastUsedIp,
        totalRequests: key.totalRequests,
        isActive: key.isActive,
        createdAt: key.createdAt,
        createdBy: key.createdBy,
      }));
    }),

  // Create a new API key
  createApiKey: t.procedure
    .input(z.object({
      organizationId: z.string(),
      name: z.string().min(1),
      permissions: z.array(z.string()).default(['read']),
      rateLimitPerHour: z.number().default(1000),
      expiresIn: z.number().optional(), // Days until expiration
      userId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { key, hash, prefix } = generateApiKey('pk_live');
      
      const apiKey = {
        id: crypto.randomBytes(16).toString('hex'),
        organizationId: input.organizationId,
        name: input.name,
        keyHash: hash,
        keyPrefix: prefix,
        permissions: input.permissions,
        rateLimitPerHour: input.rateLimitPerHour,
        expiresAt: input.expiresIn 
          ? new Date(Date.now() + input.expiresIn * 24 * 60 * 60 * 1000).toISOString()
          : null,
        lastUsedAt: null,
        lastUsedIp: null,
        totalRequests: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: input.userId,
      };

      // Store the API key
      const orgKeys = apiKeys.get(input.organizationId) || [];
      orgKeys.push(apiKey);
      apiKeys.set(input.organizationId, orgKeys);

      // Return the actual key only during creation
      return {
        success: true,
        message: 'API key created successfully',
        apiKey: {
          ...apiKey,
          key, // Return the actual key only once
        },
      };
    }),

  // Revoke an API key
  revokeApiKey: t.procedure
    .input(z.object({
      organizationId: z.string(),
      keyId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const orgKeys = apiKeys.get(input.organizationId) || [];
      const keyIndex = orgKeys.findIndex(k => k.id === input.keyId);
      
      if (keyIndex === -1) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'API key not found',
        });
      }

      // Mark as revoked instead of deleting
      orgKeys[keyIndex].isActive = false;
      orgKeys[keyIndex].revokedAt = new Date().toISOString();
      orgKeys[keyIndex].revokedBy = input.userId;

      return {
        success: true,
        message: 'API key revoked successfully',
      };
    }),

  // Regenerate an API key
  regenerateApiKey: t.procedure
    .input(z.object({
      organizationId: z.string(),
      keyId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const orgKeys = apiKeys.get(input.organizationId) || [];
      const keyIndex = orgKeys.findIndex(k => k.id === input.keyId);
      
      if (keyIndex === -1) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'API key not found',
        });
      }

      const oldKey = orgKeys[keyIndex];
      
      // Generate new key
      const { key, hash, prefix } = generateApiKey('pk_live');
      
      // Create new key with same settings
      const newApiKey = {
        ...oldKey,
        id: crypto.randomBytes(16).toString('hex'),
        keyHash: hash,
        keyPrefix: prefix,
        totalRequests: 0,
        lastUsedAt: null,
        lastUsedIp: null,
        createdAt: new Date().toISOString(),
        createdBy: input.userId,
      };

      // Mark old key as revoked
      orgKeys[keyIndex].isActive = false;
      orgKeys[keyIndex].revokedAt = new Date().toISOString();
      orgKeys[keyIndex].revokedBy = input.userId;
      orgKeys[keyIndex].replacedBy = newApiKey.id;

      // Add new key
      orgKeys.push(newApiKey);

      return {
        success: true,
        message: 'API key regenerated successfully',
        apiKey: {
          ...newApiKey,
          key, // Return the actual key only once
        },
      };
    }),

  // Update API key settings
  updateApiKey: t.procedure
    .input(z.object({
      organizationId: z.string(),
      keyId: z.string(),
      updates: z.object({
        name: z.string().optional(),
        permissions: z.array(z.string()).optional(),
        rateLimitPerHour: z.number().optional(),
        expiresAt: z.string().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      const orgKeys = apiKeys.get(input.organizationId) || [];
      const key = orgKeys.find(k => k.id === input.keyId);
      
      if (!key) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'API key not found',
        });
      }

      // Update fields
      if (input.updates.name !== undefined) key.name = input.updates.name;
      if (input.updates.permissions !== undefined) key.permissions = input.updates.permissions;
      if (input.updates.rateLimitPerHour !== undefined) key.rateLimitPerHour = input.updates.rateLimitPerHour;
      if (input.updates.expiresAt !== undefined) key.expiresAt = input.updates.expiresAt;
      
      key.updatedAt = new Date().toISOString();

      return {
        success: true,
        message: 'API key updated successfully',
      };
    }),

  // Validate an API key (for internal use)
  validateApiKey: t.procedure
    .input(z.object({
      apiKey: z.string(),
    }))
    .query(async ({ input }) => {
      const keyHash = crypto.createHash('sha256').update(input.apiKey).digest('hex');
      
      // Search through all organizations for the key
      for (const [orgId, orgKeys] of apiKeys.entries()) {
        const key = orgKeys.find(k => k.keyHash === keyHash && k.isActive);
        
        if (key) {
          // Check if expired
          if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
            return {
              valid: false,
              reason: 'API key has expired',
            };
          }

          // Update usage stats
          key.lastUsedAt = new Date().toISOString();
          key.totalRequests = (key.totalRequests || 0) + 1;

          return {
            valid: true,
            organizationId: orgId,
            permissions: key.permissions,
            rateLimitPerHour: key.rateLimitPerHour,
            totalRequests: key.totalRequests,
          };
        }
      }

      return {
        valid: false,
        reason: 'Invalid API key',
      };
    }),

  // Get API key usage statistics
  getApiKeyStats: t.procedure
    .input(z.object({
      organizationId: z.string(),
      keyId: z.string(),
      period: z.enum(['day', 'week', 'month']).default('week'),
    }))
    .query(async ({ input }) => {
      const orgKeys = apiKeys.get(input.organizationId) || [];
      const key = orgKeys.find(k => k.id === input.keyId);
      
      if (!key) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'API key not found',
        });
      }

      // In production, query actual usage data from logs
      // For now, return mock statistics
      return {
        keyId: key.id,
        name: key.name,
        totalRequests: key.totalRequests || 0,
        successRate: 98.5,
        averageResponseTime: 125,
        topEndpoints: [
          { endpoint: '/api/jobs', count: 450 },
          { endpoint: '/api/contractors', count: 320 },
          { endpoint: '/api/documents', count: 180 },
        ],
        requestsByDay: [
          { date: '2024-01-01', count: 120 },
          { date: '2024-01-02', count: 145 },
          { date: '2024-01-03', count: 98 },
          { date: '2024-01-04', count: 167 },
          { date: '2024-01-05', count: 134 },
          { date: '2024-01-06', count: 89 },
          { date: '2024-01-07', count: 156 },
        ],
        errorRate: 1.5,
        rateLimitHits: 0,
      };
    }),
});