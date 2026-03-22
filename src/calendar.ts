// src/main/calendar.ts
import { google } from "googleapis";
import path from "node:path";
import fs from "node:fs/promises";
import { authenticate } from "@google-cloud/local-auth";

const PORT = 4242; // Any unused port
const REDIRECT_URI = `http://localhost:${PORT}`;

// The scope for reading calendar events.
const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
// The path to the credentials file.
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
// The path to the saved user tokens.
const TOKEN_PATH = path.join(process.cwd(), "token.json");

let authClient: any = null;

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH, "utf-8");
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client: any) {
  const content = await fs.readFile(CREDENTIALS_PATH, "utf-8");
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function getAuthClient() {
  if (authClient) return authClient;

  authClient = await loadSavedCredentialsIfExist();
  if (authClient) return authClient;

  authClient = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });

  if (authClient.credentials) {
    await saveCredentials(authClient);
  }

  return authClient;
}

export async function checkAuthStatus() {
  const client = await loadSavedCredentialsIfExist();
  if (client) {
    authClient = client;
    return true;
  }
  return false;
}

export async function getCalendars() {
  const auth = await getAuthClient();
  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.calendarList.list();
  return res.data.items; // Array of available calendars
}

export async function listEvents(calendarId = "primary") {
  const auth = await getAuthClient();

  // Create a new Calendar API client.
  const calendar = google.calendar({ version: "v3", auth });
  // Get the list of events.
  const result = await calendar.events.list({
    calendarId: calendarId,
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });
  const events = result.data.items;
  if (!events || events.length === 0) {
    console.log("No upcoming events found.");
    return [];
  }
  console.log("Upcoming 10 events:");

  // Print the start time and summary of each event.
  for (const event of events) {
    const start = event.start?.dateTime ?? event.start?.date;
    console.log(`${start} - ${event.summary}`);
  }

  return events;
}

if (
  !import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  !import.meta.env.VITE_GOOGLE_CLIENT_SECRET
) {
  console.error(
    "\n🚨 CRITICAL: Google Client ID is missing. Ensure your .env file is correct and you restarted the app.\n",
  );
}

const oauth2Client = new google.auth.OAuth2(
  import.meta.env.VITE_GOOGLE_CLIENT_ID,
  import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
  REDIRECT_URI,
);

export async function getUpcomingEvents() {
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });

  return res.data.items; // Array of events for your UI
}
