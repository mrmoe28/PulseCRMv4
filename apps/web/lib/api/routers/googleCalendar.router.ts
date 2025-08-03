import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { getOAuthTokens, deleteOAuthTokens } from '../tokenStorage';
import { googleCalendarService } from '../../services/google-calendar.service';

const t = initTRPC.create();

export const googleCalendarRouter = t.router({
  // Check connection status
  getConnectionStatus: t.procedure
    .input(z.object({
      organizationId: z.string(),
    }))
    .query(async ({ input }) => {
      const tokens = getOAuthTokens(input.organizationId, 'google-calendar');
      
      if (!tokens) {
        return {
          connected: false,
          message: 'Google Calendar not connected',
        };
      }

      return {
        connected: true,
        message: 'Connected',
        connectedAt: tokens.stored_at || new Date().toISOString(),
        email: tokens.email || 'Connected',
      };
    }),

  // List calendar events
  listEvents: t.procedure
    .input(z.object({
      organizationId: z.string(),
      timeMin: z.string().optional(),
      timeMax: z.string().optional(),
      maxResults: z.number().default(10),
    }))
    .query(async ({ input }) => {
      try {
        const events = await googleCalendarService.listEvents(input.organizationId, {
          timeMin: input.timeMin,
          timeMax: input.timeMax,
          maxResults: input.maxResults,
        });
        
        return { events };
      } catch (error: any) {
        console.error('List events error:', error);
        
        if (error.message.includes('No tokens found')) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Google Calendar not connected',
          });
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list calendar events',
        });
      }
    }),

  // Create calendar event
  createEvent: t.procedure
    .input(z.object({
      organizationId: z.string(),
      summary: z.string(),
      description: z.string().optional(),
      startDateTime: z.string(),
      endDateTime: z.string(),
      location: z.string().optional(),
      attendees: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const event = await googleCalendarService.createEvent(
          input.organizationId,
          {
            summary: input.summary,
            description: input.description,
            location: input.location,
            start: {
              dateTime: input.startDateTime,
              timeZone: 'America/Los_Angeles', // TODO: Get from user settings
            },
            end: {
              dateTime: input.endDateTime,
              timeZone: 'America/Los_Angeles',
            },
            attendees: input.attendees?.map(email => ({ email })),
          }
        );
        
        return {
          success: true,
          eventId: event.id,
          message: 'Event created successfully',
        };
      } catch (error: any) {
        console.error('Create event error:', error);
        
        if (error.message.includes('No tokens found')) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Google Calendar not connected',
          });
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create calendar event',
        });
      }
    }),

  // Sync job to calendar
  syncJobToCalendar: t.procedure
    .input(z.object({
      organizationId: z.string(),
      jobId: z.string(),
      jobTitle: z.string(),
      jobDescription: z.string(),
      dueDate: z.string(),
      duration: z.number().default(60), // minutes
    }))
    .mutation(async ({ input }) => {
      try {
        const event = await googleCalendarService.syncJobToCalendar(
          input.organizationId,
          {
            id: input.jobId,
            title: input.jobTitle,
            description: input.jobDescription,
            dueDate: input.dueDate,
            duration: input.duration,
          }
        );
        
        return {
          success: true,
          message: 'Job synced to calendar successfully',
          eventId: event.id,
        };
      } catch (error: any) {
        console.error('Sync job error:', error);
        
        if (error.message.includes('No tokens found')) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Google Calendar not connected',
          });
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to sync job to calendar',
        });
      }
    }),

  // Disconnect Google Calendar
  disconnect: t.procedure
    .input(z.object({
      organizationId: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Delete stored tokens
        deleteOAuthTokens(input.organizationId, 'google-calendar');
        
        return {
          success: true,
          message: 'Google Calendar disconnected successfully',
        };
      } catch (error) {
        console.error('Disconnect error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to disconnect Google Calendar',
        });
      }
    }),

  // Get calendar list
  getCalendarList: t.procedure
    .input(z.object({
      organizationId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const calendars = await googleCalendarService.getCalendarList(input.organizationId);
        return { calendars };
      } catch (error: any) {
        console.error('Get calendar list error:', error);
        
        if (error.message.includes('No tokens found')) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Google Calendar not connected',
          });
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get calendar list',
        });
      }
    }),
});