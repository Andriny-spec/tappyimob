// Google Calendar Integration
// Para funcionar, adicione ao .env:
// GOOGLE_CLIENT_ID=seu_client_id
// GOOGLE_CLIENT_SECRET=seu_client_secret
// GOOGLE_REDIRECT_URI=http://localhost:3000/api/admin/google/callback

import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/google/callback`
  );
}

export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
}

export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export function getCalendarClient(accessToken: string, refreshToken?: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return google.calendar({ version: "v3", auth: oauth2Client });
}

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: { email: string }[];
  reminders?: {
    useDefault: boolean;
    overrides?: { method: string; minutes: number }[];
  };
  colorId?: string;
}

export async function createCalendarEvent(
  accessToken: string,
  refreshToken: string | undefined,
  event: CalendarEvent
) {
  const calendar = getCalendarClient(accessToken, refreshToken);
  
  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: event.start,
      end: event.end,
      attendees: event.attendees,
      reminders: event.reminders || {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 30 },
          { method: "email", minutes: 60 },
        ],
      },
      colorId: event.colorId,
    },
  });

  return response.data;
}

export async function listCalendarEvents(
  accessToken: string,
  refreshToken: string | undefined,
  options: {
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
    q?: string;
  } = {}
) {
  const calendar = getCalendarClient(accessToken, refreshToken);
  
  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin: options.timeMin || new Date().toISOString(),
    timeMax: options.timeMax,
    maxResults: options.maxResults || 50,
    singleEvents: true,
    orderBy: "startTime",
    q: options.q,
  });

  return response.data.items || [];
}

export async function updateCalendarEvent(
  accessToken: string,
  refreshToken: string | undefined,
  eventId: string,
  event: Partial<CalendarEvent>
) {
  const calendar = getCalendarClient(accessToken, refreshToken);
  
  const response = await calendar.events.patch({
    calendarId: "primary",
    eventId,
    requestBody: event,
  });

  return response.data;
}

export async function deleteCalendarEvent(
  accessToken: string,
  refreshToken: string | undefined,
  eventId: string
) {
  const calendar = getCalendarClient(accessToken, refreshToken);
  
  await calendar.events.delete({
    calendarId: "primary",
    eventId,
  });

  return true;
}

// Cores do Google Calendar
export const CALENDAR_COLORS = {
  lavender: "1",
  sage: "2",
  grape: "3",
  flamingo: "4",
  banana: "5",
  tangerine: "6",
  peacock: "7",
  graphite: "8",
  blueberry: "9",
  basil: "10",
  tomato: "11",
};

// Mapear tipo de evento do lead para cor
export const LEAD_EVENT_COLORS: Record<string, string> = {
  LIGACAO: CALENDAR_COLORS.blueberry,
  REUNIAO: CALENDAR_COLORS.grape,
  VISITA: CALENDAR_COLORS.tangerine,
  FOLLOWUP: CALENDAR_COLORS.sage,
};
