import { google } from "googleapis";

const CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.VITE_GOOGLE_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing Google Client ID or Secret in environment variables.");
}

function getAuthClient(tokens: {
  access_token: string;
  refresh_token?: string;
}) {
  const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
  auth.setCredentials(tokens);
  return auth;
}

export async function getCalendars(tokens: {
  access_token: string;
  refresh_token?: string;
}) {
  const auth = getAuthClient(tokens);

  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.calendarList.list();
  return res.data.items; // Array of available calendars
}

export async function listEvents(
  tokens: { access_token: string; refresh_token?: string },
  calendarId = "primary",
  dateStr?: string,
) {
  const auth = getAuthClient(tokens);

  // Create a new Calendar API client.
  const calendar = google.calendar({ version: "v3", auth });

  // Calculate bounds for the current week (Sunday to Saturday)
  const now = dateStr ? new Date(dateStr) : new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Get the list of events.
  const result = await calendar.events.list({
    calendarId: calendarId,
    timeMin: startOfWeek.toISOString(),
    timeMax: endOfWeek.toISOString(),
    maxResults: 250,
    singleEvents: true,
    orderBy: "startTime",
  });
  const events = result.data.items;
  if (!events || events.length === 0) {
    console.log("No events found for this week.");
    return [];
  }
  console.log(`Found ${events.length} events for this week:`);

  // Print the start time and summary of each event.
  for (const event of events) {
    const start = event.start?.dateTime ?? event.start?.date;
    console.log(`${start} - ${event.summary}`);
  }

  return events;
}
