import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import crypto from 'crypto';

const t = initTRPC.create();

// Temporary in-memory storage (replace with database queries)
const webhooks = new Map<string, any[]>();
const webhookDeliveries = new Map<string, any[]>();

// Available webhook events
const WEBHOOK_EVENTS = [
  // Job events
  'job.created',
  'job.updated',
  'job.completed',
  'job.cancelled',
  'job.assigned',
  
  // Contractor events
  'contractor.created',
  'contractor.updated',
  'contractor.deleted',
  'contractor.assigned',
  
  // Document events
  'document.uploaded',
  'document.signed',
  'document.rejected',
  'document.expired',
  
  // Contact events
  'contact.created',
  'contact.updated',
  'contact.deleted',
  
  // Integration events
  'integration.connected',
  'integration.disconnected',
  'integration.error',
  'integration.synced',
];

// Generate webhook signing secret
const generateWebhookSecret = (): string => {
  return `whsec_${crypto.randomBytes(32).toString('hex')}`;
};

// Calculate webhook signature
const calculateSignature = (payload: string, secret: string): string => {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
};

export const webhooksRouter = t.router({
  // Get all webhooks for an organization
  getWebhooks: t.procedure
    .input(z.object({
      organizationId: z.string(),
    }))
    .query(async ({ input }) => {
      const orgWebhooks = webhooks.get(input.organizationId) || [];
      return orgWebhooks;
    }),

  // Get available webhook events
  getAvailableEvents: t.procedure.query(() => {
    return {
      events: WEBHOOK_EVENTS.map(event => {
        const [resource, action] = event.split('.');
        return {
          id: event,
          resource,
          action,
          description: `Triggered when a ${resource} is ${action}`,
        };
      }),
      categories: [
        { id: 'job', name: 'Jobs', count: 5 },
        { id: 'contractor', name: 'Contractors', count: 4 },
        { id: 'document', name: 'Documents', count: 4 },
        { id: 'contact', name: 'Contacts', count: 3 },
        { id: 'integration', name: 'Integrations', count: 4 },
      ],
    };
  }),

  // Create a new webhook
  createWebhook: t.procedure
    .input(z.object({
      organizationId: z.string(),
      name: z.string().min(1),
      url: z.string().url(),
      events: z.array(z.string()).min(1),
      headers: z.record(z.string()).optional(),
      isActive: z.boolean().default(true),
      retryOnFailure: z.boolean().default(true),
      maxRetries: z.number().default(3),
      timeoutSeconds: z.number().default(30),
      userId: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Validate events
      const invalidEvents = input.events.filter(e => !WEBHOOK_EVENTS.includes(e));
      if (invalidEvents.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Invalid events: ${invalidEvents.join(', ')}`,
        });
      }

      const webhook = {
        id: crypto.randomBytes(16).toString('hex'),
        organizationId: input.organizationId,
        name: input.name,
        url: input.url,
        events: input.events,
        headers: input.headers || {},
        secret: generateWebhookSecret(),
        isActive: input.isActive,
        retryOnFailure: input.retryOnFailure,
        maxRetries: input.maxRetries,
        timeoutSeconds: input.timeoutSeconds,
        totalDeliveries: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
        lastDeliveryAt: null,
        lastDeliveryStatus: null,
        lastError: null,
        createdBy: input.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store the webhook
      const orgWebhooks = webhooks.get(input.organizationId) || [];
      orgWebhooks.push(webhook);
      webhooks.set(input.organizationId, orgWebhooks);

      return {
        success: true,
        message: 'Webhook created successfully',
        webhook: {
          ...webhook,
          secret: webhook.secret, // Return secret only during creation
        },
      };
    }),

  // Update a webhook
  updateWebhook: t.procedure
    .input(z.object({
      organizationId: z.string(),
      webhookId: z.string(),
      updates: z.object({
        name: z.string().optional(),
        url: z.string().url().optional(),
        events: z.array(z.string()).optional(),
        headers: z.record(z.string()).optional(),
        isActive: z.boolean().optional(),
        retryOnFailure: z.boolean().optional(),
        maxRetries: z.number().optional(),
        timeoutSeconds: z.number().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      const orgWebhooks = webhooks.get(input.organizationId) || [];
      const webhook = orgWebhooks.find(w => w.id === input.webhookId);
      
      if (!webhook) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Webhook not found',
        });
      }

      // Validate events if provided
      if (input.updates.events) {
        const invalidEvents = input.updates.events.filter(e => !WEBHOOK_EVENTS.includes(e));
        if (invalidEvents.length > 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Invalid events: ${invalidEvents.join(', ')}`,
          });
        }
      }

      // Update fields
      Object.assign(webhook, input.updates);
      webhook.updatedAt = new Date().toISOString();

      return {
        success: true,
        message: 'Webhook updated successfully',
      };
    }),

  // Delete a webhook
  deleteWebhook: t.procedure
    .input(z.object({
      organizationId: z.string(),
      webhookId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const orgWebhooks = webhooks.get(input.organizationId) || [];
      const index = orgWebhooks.findIndex(w => w.id === input.webhookId);
      
      if (index === -1) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Webhook not found',
        });
      }

      // Remove the webhook
      orgWebhooks.splice(index, 1);
      webhooks.set(input.organizationId, orgWebhooks);

      return {
        success: true,
        message: 'Webhook deleted successfully',
      };
    }),

  // Test a webhook
  testWebhook: t.procedure
    .input(z.object({
      organizationId: z.string(),
      webhookId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const orgWebhooks = webhooks.get(input.organizationId) || [];
      const webhook = orgWebhooks.find(w => w.id === input.webhookId);
      
      if (!webhook) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Webhook not found',
        });
      }

      // Create test payload
      const testPayload = {
        event: 'webhook.test',
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook delivery',
          webhookId: webhook.id,
          webhookName: webhook.name,
        },
      };

      const payloadString = JSON.stringify(testPayload);
      const signature = calculateSignature(payloadString, webhook.secret);

      // Simulate webhook delivery
      // In production, make actual HTTP request to webhook URL
      const delivery = {
        id: crypto.randomBytes(16).toString('hex'),
        webhookId: webhook.id,
        eventType: 'webhook.test',
        payload: testPayload,
        responseStatus: Math.random() > 0.2 ? 200 : 500, // 80% success for demo
        responseBody: Math.random() > 0.2 ? 'OK' : 'Internal Server Error',
        responseHeaders: {
          'content-type': 'text/plain',
          'x-webhook-signature': signature,
        },
        deliveryTimeMs: Math.floor(Math.random() * 1000) + 100,
        attemptNumber: 1,
        deliveredAt: new Date().toISOString(),
      };

      // Store delivery record
      const deliveries = webhookDeliveries.get(input.organizationId) || [];
      deliveries.push(delivery);
      webhookDeliveries.set(input.organizationId, deliveries);

      // Update webhook stats
      webhook.totalDeliveries = (webhook.totalDeliveries || 0) + 1;
      webhook.lastDeliveryAt = delivery.deliveredAt;
      webhook.lastDeliveryStatus = delivery.responseStatus;
      
      if (delivery.responseStatus === 200) {
        webhook.successfulDeliveries = (webhook.successfulDeliveries || 0) + 1;
      } else {
        webhook.failedDeliveries = (webhook.failedDeliveries || 0) + 1;
        webhook.lastError = delivery.responseBody;
      }

      return {
        success: delivery.responseStatus === 200,
        message: delivery.responseStatus === 200 ? 'Webhook test successful' : 'Webhook test failed',
        delivery,
      };
    }),

  // Get webhook deliveries
  getWebhookDeliveries: t.procedure
    .input(z.object({
      organizationId: z.string(),
      webhookId: z.string(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const deliveries = webhookDeliveries.get(input.organizationId) || [];
      const filtered = deliveries.filter(d => d.webhookId === input.webhookId);
      
      // Sort by delivery time descending
      filtered.sort((a, b) => new Date(b.deliveredAt).getTime() - new Date(a.deliveredAt).getTime());
      
      return filtered.slice(0, input.limit);
    }),

  // Regenerate webhook secret
  regenerateWebhookSecret: t.procedure
    .input(z.object({
      organizationId: z.string(),
      webhookId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const orgWebhooks = webhooks.get(input.organizationId) || [];
      const webhook = orgWebhooks.find(w => w.id === input.webhookId);
      
      if (!webhook) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Webhook not found',
        });
      }

      const newSecret = generateWebhookSecret();
      webhook.secret = newSecret;
      webhook.updatedAt = new Date().toISOString();

      return {
        success: true,
        message: 'Webhook secret regenerated successfully',
        secret: newSecret,
      };
    }),

  // Trigger a webhook event (internal use)
  triggerWebhookEvent: t.procedure
    .input(z.object({
      organizationId: z.string(),
      event: z.string(),
      data: z.record(z.any()),
    }))
    .mutation(async ({ input }) => {
      const orgWebhooks = webhooks.get(input.organizationId) || [];
      const activeWebhooks = orgWebhooks.filter(w => 
        w.isActive && w.events.includes(input.event)
      );

      const results = [];
      
      for (const webhook of activeWebhooks) {
        const payload = {
          event: input.event,
          timestamp: new Date().toISOString(),
          data: input.data,
        };

        const payloadString = JSON.stringify(payload);
        const signature = calculateSignature(payloadString, webhook.secret);

        // Simulate delivery (in production, make actual HTTP request)
        const delivery = {
          id: crypto.randomBytes(16).toString('hex'),
          webhookId: webhook.id,
          eventType: input.event,
          payload,
          responseStatus: Math.random() > 0.1 ? 200 : 500,
          responseBody: 'OK',
          responseHeaders: {
            'x-webhook-signature': signature,
          },
          deliveryTimeMs: Math.floor(Math.random() * 1000) + 100,
          attemptNumber: 1,
          deliveredAt: new Date().toISOString(),
        };

        // Store delivery
        const deliveries = webhookDeliveries.get(input.organizationId) || [];
        deliveries.push(delivery);
        webhookDeliveries.set(input.organizationId, deliveries);

        // Update webhook stats
        webhook.totalDeliveries++;
        webhook.lastDeliveryAt = delivery.deliveredAt;
        webhook.lastDeliveryStatus = delivery.responseStatus;
        
        if (delivery.responseStatus === 200) {
          webhook.successfulDeliveries++;
        } else {
          webhook.failedDeliveries++;
        }

        results.push({
          webhookId: webhook.id,
          success: delivery.responseStatus === 200,
        });
      }

      return {
        success: true,
        webhooksTriggered: results.length,
        results,
      };
    }),
});