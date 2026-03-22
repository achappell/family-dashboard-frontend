import { google } from "googleapis";
import path from "node:path";
import fs from "node:fs/promises";
import { authenticate } from "@google-cloud/local-auth";

// The scopes for reading calendar events and getting the user's basic profile.
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];
// The path to the credentials file.
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

// Generate a unique token path for each user
const getTokenPath = (email: string) =>
  path.join(process.cwd(), `token_${email}.json`);
const authClients: Record<string, any> = {};

async function loadSavedCredentialsIfExist(email: string) {
  try {
    const content = await fs.readFile(getTokenPath(email), "utf-8");
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client: any, email: string) {
  const content = await fs.readFile(CREDENTIALS_PATH, "utf-8");
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(getTokenPath(email), payload);
}

async function getAuthClient(email: string) {
  if (authClients[email]) return authClients[email];

  let client: any = await loadSavedCredentialsIfExist(email);
  if (client) {
    authClients[email] = client;
    return client;
  }

  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });

  if (client.credentials) {
    await saveCredentials(client, email);
  }

  authClients[email] = client;
  return client;
}

export async function checkAuthStatus(email: string) {
  const client = await loadSavedCredentialsIfExist(email);
  if (client) {
    authClients[email] = client;
    return true;
  }
  return false;
}

export async function loginWithGoogle() {
  const client: any = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });

  const oauth2 = google.oauth2({ version: "v2", auth: client });
  const userInfo = await oauth2.userinfo.get();
  const email = userInfo.data.email;
  const firstName = userInfo.data.given_name;
  const lastName = userInfo.data.family_name;

  if (client.credentials && email) {
    await saveCredentials(client, email);
    authClients[email] = client;
  }

  return { email, firstName, lastName };
}

export async function getCalendars(email: string) {
  const auth = await getAuthClient(email);
  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.calendarList.list();
  return res.data.items; // Array of available calendars
}

export async function listEvents(
  email: string,
  calendarId = "primary",
  dateStr?: string,
) {
  const auth = await getAuthClient(email);

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
