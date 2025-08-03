import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { tokenStorage } from '../tokenStorage';

const t = initTRPC.create();

// Helper to get access token
async function getAccessToken(organizationId: string): Promise<string | null> {
  const tokens = tokenStorage.get(`${organizationId}_google_calendar`);
  if (!tokens) return null;

  // Check if token is expired
  if (tokens.expires_at && tokens.expires_at < Date.now()) {
    // In production, refresh the token here
    return null;
  }

  return tokens.access_token ? Buffer.from(tokens.access_token, 'base64').toString('utf-8') : null;
}

export const googleCalendarRouter = t.router({
  // Check connection status
  getConnectionStatus: t.procedure
    .input(z.object({
      organizationId: z.string(),
    }))
    .query(async ({ input }) => {
      const tokens = tokenStorage.get(`${input.organizationId}_google_calendar`);
      
      if (!tokens) {
        return {
          connected: false,
          message: 'Google Calendar not connected',
        };
      }

      // For demo mode
      if (!process.env.GOOGLE_CALENDAR_CLIENT_ID) {
        return {
          connected: true,
          message: 'Connected (Demo Mode)',
          connectedAt: tokens.connectedAt || new Date().toISOString(),
          email: 'demo@example.com',
        };
      }

      try {
        const accessToken = await getAccessToken(input.organizationId);
        if (!accessToken) {
          return {
            connected: false,
            message: 'Token expired or invalid',
          };
        }

        // Test the connection
        const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/settings', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          return {
            connected: false,
            message: 'Connection test failed',
          };
        }

        return {
          connected: true,
          message: 'Connected',
          connectedAt: tokens.connectedAt,
          email: tokens.email || 'Connected',
        };
      } catch (error) {
        console.error('Connection status check failed:', error);
        return {
          connected: false,
          message: 'Connection check failed',
        };
      }
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
      // For demo mode
      if (!process.env.GOOGLE_CALENDAR_CLIENT_ID) {
        return {
          events: [
            {
              id: 'demo1',
              summary: 'Job Site Visit - Downtown Project',
              start: { dateTime: new Date(Date.now() + 86400000).toISOString() },
              end: { dateTime: new Date(Date.now() + 90000000).toISOString() },
              description: 'Meet with client to review progress',
            },
            {
              id: 'demo2',
              summary: 'Contractor Meeting',
              start: { dateTime: new Date(Date.now() + 172800000).toISOString() },
              end: { dateTime: new Date(Date.now() + 176400000).toISOString() },
              description: 'Weekly team sync',
            },
          ],
        };
      }

      const accessToken = await getAccessToken(input.organizationId);
      if (!accessToken) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Google Calendar not connected or token expired',
        });
      }

      try {
        const params = new URLSearchParams({
          maxResults: input.maxResults.toString(),
          orderBy: 'startTime',
          singleEvents: 'true',
        });

        if (input.timeMin) params.append('timeMin', input.timeMin);
        if (input.timeMax) params.append('timeMax', input.timeMax);

        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch calendar events',
          });
        }

        const data = await response.json();
        return {
          events: data.items || [],
        };
      } catch (error) {
        console.error('List events error:', error);
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
      // For demo mode
      if (!process.env.GOOGLE_CALENDAR_CLIENT_ID) {
        return {
          success: true,
          eventId: 'demo_event_' + Date.now(),
          message: 'Event created (Demo Mode)',
        };
      }

      const accessToken = await getAccessToken(input.organizationId);
      if (!accessToken) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Google Calendar not connected or token expired',
        });
      }

      try {
        const event = {
          summary: input.summary,
          description: input.description,
          location: input.location,
          start: {
            dateTime: input.startDateTime,
            timeZone: 'America/Los_Angeles', // Should be dynamic based on user
          },
          end: {
            dateTime: input.endDateTime,
            timeZone: 'America/Los_Angeles',
          },
          attendees: input.attendees?.map(email => ({ email })),
        };

        const response = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
          }
        );

        if (!response.ok) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create calendar event',
          });
        }

        const createdEvent = await response.json();
        return {
          success: true,
          eventId: createdEvent.id,
          message: 'Event created successfully',
        };
      } catch (error) {
        console.error('Create event error:', error);
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
      // For demo mode
      if (!process.env.GOOGLE_CALENDAR_CLIENT_ID) {
        return {
          success: true,
          message: 'Job synced to calendar (Demo Mode)',
          eventId: 'demo_job_' + input.jobId,
        };
      }

      const accessToken = await getAccessToken(input.organizationId);
      if (!accessToken) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Google Calendar not connected or token expired',
        });
      }

      try {
        const startDateTime = new Date(input.dueDate);
        const endDateTime = new Date(startDateTime.getTime() + input.duration * 60000);

        const event = {
          summary: `[PulseCRM] ${input.jobTitle}`,
          description: `Job ID: ${input.jobId}\n\n${input.jobDescription}`,
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: 'America/Los_Angeles',
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: 'America/Los_Angeles',
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 }, // 1 day before
              { method: 'popup', minutes: 60 }, // 1 hour before
            ],
          },
        };

        const response = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
          }
        );

        if (!response.ok) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to sync job to calendar',
          });
        }

        const createdEvent = await response.json();
        return {
          success: true,
          message: 'Job synced to Google Calendar',
          eventId: createdEvent.id,
        };
      } catch (error) {
        console.error('Sync job error:', error);
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
      // Remove stored tokens
      tokenStorage.delete(`${input.organizationId}_google_calendar`);
      
      return {
        success: true,
        message: 'Google Calendar disconnected',
      };
    }),
});