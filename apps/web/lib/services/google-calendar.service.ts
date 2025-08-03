import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getOAuthTokens, storeOAuthTokens, isTokenExpired } from '../api/tokenStorage';

export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;
  private calendar: calendar_v3.Calendar;
  
  constructor() {
    // Initialize OAuth2 client
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CALENDAR_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      process.env.GOOGLE_CALENDAR_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/oauth/google-calendar/callback`
    );
    
    // Initialize Calendar API
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }
  
  /**
   * Get authorization URL for OAuth flow
   */
  getAuthorizationUrl(state: string, redirectUri: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      state: state,
      redirect_uri: redirectUri,
      prompt: 'consent', // Force consent to get refresh token
    });
  }
  
  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string, redirectUri: string) {
    const { tokens } = await this.oauth2Client.getToken({
      code,
      redirect_uri: redirectUri,
    });
    
    this.oauth2Client.setCredentials(tokens);
    
    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();
    
    return {
      tokens,
      userInfo: {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      },
    };
  }
  
  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string) {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });
    
    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials;
  }
  
  /**
   * Set credentials for API calls
   */
  private async setCredentials(organizationId: string, provider: string = 'google-calendar') {
    const tokens = getOAuthTokens(organizationId, provider);
    
    if (!tokens) {
      throw new Error('No tokens found for this organization');
    }
    
    // Check if token is expired and refresh if needed
    if (isTokenExpired(tokens) && tokens.refresh_token) {
      const newTokens = await this.refreshAccessToken(tokens.refresh_token);
      
      // Store updated tokens
      storeOAuthTokens(organizationId, provider, {
        access_token: newTokens.access_token!,
        refresh_token: tokens.refresh_token, // Keep the same refresh token
        expires_in: newTokens.expiry_date ? Math.floor((newTokens.expiry_date - Date.now()) / 1000) : 3600,
        scope: newTokens.scope || tokens.scope,
        token_type: newTokens.token_type || 'Bearer',
      });
      
      this.oauth2Client.setCredentials(newTokens);
    } else {
      this.oauth2Client.setCredentials({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });
    }
  }
  
  /**
   * List calendar events
   */
  async listEvents(
    organizationId: string,
    options: {
      timeMin?: string;
      timeMax?: string;
      maxResults?: number;
      calendarId?: string;
    } = {}
  ) {
    await this.setCredentials(organizationId);
    
    const response = await this.calendar.events.list({
      calendarId: options.calendarId || 'primary',
      timeMin: options.timeMin || new Date().toISOString(),
      timeMax: options.timeMax,
      maxResults: options.maxResults || 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    return response.data.items || [];
  }
  
  /**
   * Create a calendar event
   */
  async createEvent(
    organizationId: string,
    event: {
      summary: string;
      description?: string;
      location?: string;
      start: { dateTime: string; timeZone?: string };
      end: { dateTime: string; timeZone?: string };
      attendees?: { email: string }[];
      reminders?: {
        useDefault: boolean;
        overrides?: { method: 'email' | 'popup'; minutes: number }[];
      };
    },
    calendarId: string = 'primary'
  ) {
    await this.setCredentials(organizationId);
    
    const response = await this.calendar.events.insert({
      calendarId,
      requestBody: event,
    });
    
    return response.data;
  }
  
  /**
   * Update a calendar event
   */
  async updateEvent(
    organizationId: string,
    eventId: string,
    updates: Partial<calendar_v3.Schema$Event>,
    calendarId: string = 'primary'
  ) {
    await this.setCredentials(organizationId);
    
    const response = await this.calendar.events.patch({
      calendarId,
      eventId,
      requestBody: updates,
    });
    
    return response.data;
  }
  
  /**
   * Delete a calendar event
   */
  async deleteEvent(
    organizationId: string,
    eventId: string,
    calendarId: string = 'primary'
  ) {
    await this.setCredentials(organizationId);
    
    await this.calendar.events.delete({
      calendarId,
      eventId,
    });
    
    return { success: true };
  }
  
  /**
   * Get calendar list
   */
  async getCalendarList(organizationId: string) {
    await this.setCredentials(organizationId);
    
    const response = await this.calendar.calendarList.list({
      showHidden: false,
      showDeleted: false,
    });
    
    return response.data.items || [];
  }
  
  /**
   * Check free/busy information
   */
  async getFreeBusy(
    organizationId: string,
    timeMin: string,
    timeMax: string,
    calendars: string[] = ['primary']
  ) {
    await this.setCredentials(organizationId);
    
    const response = await this.calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        items: calendars.map(id => ({ id })),
      },
    });
    
    return response.data;
  }
  
  /**
   * Sync job to calendar (specific to PulseCRM)
   */
  async syncJobToCalendar(
    organizationId: string,
    job: {
      id: string;
      title: string;
      description?: string;
      location?: string;
      dueDate: string;
      duration?: number; // in minutes
    }
  ) {
    const startTime = new Date(job.dueDate);
    const endTime = new Date(startTime.getTime() + (job.duration || 60) * 60000);
    
    const event = {
      summary: `[PulseCRM] ${job.title}`,
      description: job.description || `Job ID: ${job.id}`,
      location: job.location,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/New_York', // TODO: Get from user settings
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/New_York',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email' as const, minutes: 24 * 60 }, // 1 day before
          { method: 'popup' as const, minutes: 60 }, // 1 hour before
        ],
      },
    };
    
    return await this.createEvent(organizationId, event);
  }
}

// Export singleton instance
export const googleCalendarService = new GoogleCalendarService();