import { google } from 'googleapis';
import { storage } from './storage';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('Google OAuth credentials not found - Google Calendar integration will be unavailable');
}

// OAuth2 client configuration
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'http://localhost:5000'}/api/google/callback`
);

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events'
];

export function getAuthUrl(state: string): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state,
    prompt: 'consent'
  });
}

export async function getTokensFromCode(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function refreshAccessToken(refreshToken: string) {
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
}

export async function getCalendarEvents(accessToken: string, refreshToken: string, userId: string) {
  try {
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: oneMonthAgo.toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    
    // Map and filter events
    const mappedEvents = events
      .filter(event => event.start && (event.start.dateTime || event.start.date))
      .map(event => {
        const startDateTime = event.start?.dateTime || event.start?.date;
        const endDateTime = event.end?.dateTime || event.end?.date;
        
        const startDate = new Date(startDateTime!);
        const endDate = new Date(endDateTime!);
        
        // Extract date and time
        const date = startDate.toISOString().split('T')[0];
        const startTime = event.start?.dateTime ? 
          startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 
          '00:00';
        const endTime = event.end?.dateTime ? 
          endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 
          '23:59';
        
        return {
          googleEventId: event.id,
          title: event.summary || 'Untitled Event',
          date,
          startTime,
          endTime,
          description: event.description || '',
          location: event.location || '',
          attendees: event.attendees?.map(a => a.email).join(', ') || ''
        };
      });

    return mappedEvents;
  } catch (error: any) {
    // Check if token expired
    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      // Try to refresh the token
      try {
        const newCredentials = await refreshAccessToken(refreshToken);
        
        // Update stored tokens
        await storage.updateGoogleToken(userId, {
          accessToken: newCredentials.access_token,
          expiresAt: new Date(newCredentials.expiry_date || Date.now() + 3600000)
        });
        
        // Retry fetching events with new token
        return getCalendarEvents(newCredentials.access_token!, refreshToken, userId);
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        throw new Error('Failed to refresh access token');
      }
    }
    
    console.error('Error fetching calendar events:', error);
    throw error;
  }
}
