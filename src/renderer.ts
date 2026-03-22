/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import "./index.css";

console.log(
  '👋 This message is being logged by "renderer.ts", included via Vite',
);

declare global {
  interface Window {
    api: {
      loginToGoogle: () => Promise<{
        success: boolean;
        tokens?: any;
        error?: string;
      }>;
      getCalendars: () => Promise<{
        success: boolean;
        calendars?: any[];
        error?: string;
      }>;
      getEvents: (
        calendarId: string,
      ) => Promise<{ success: boolean; events?: any[]; error?: string }>;
      checkAuth: () => Promise<{
        success: boolean;
        isAuthenticated?: boolean;
        error?: string;
      }>;
    };
  }
}

const loginBtn = document.getElementById("googleCalendar");

async function setupCalendarUI() {
  const calendarResult = await window.api.getCalendars();

  if (calendarResult.success && calendarResult.calendars) {
    let container = document.getElementById("calendar-ui");
    if (!container) {
      container = document.createElement("div");
      container.id = "calendar-ui";
      document.body.appendChild(container);
    }
    container.innerHTML = "";

    const select = document.createElement("select");
    select.id = "calendarSelect";

    calendarResult.calendars.forEach((cal) => {
      const option = document.createElement("option");
      option.value = cal.id;
      option.text = cal.summary || "Unnamed Calendar";
      select.appendChild(option);
    });

    // Load choice from localStorage
    const savedCalendarId = localStorage.getItem("selectedCalendarId");
    if (savedCalendarId) {
      select.value = savedCalendarId;
    }

    // Automatically fetch when user chooses a new option
    select.onchange = () => {
      localStorage.setItem("selectedCalendarId", select.value);
      fetchAndDisplayEvents(select.value);
    };

    container.appendChild(select);
    fetchAndDisplayEvents(select.value); // Fetch immediately for selected choice
  }
}

async function fetchAndDisplayEvents(calendarId: string) {
  let eventsContainer = document.getElementById("events-container");
  if (!eventsContainer) {
    eventsContainer = document.createElement("div");
    eventsContainer.id = "events-container";
    document.body.appendChild(eventsContainer);
  }

  eventsContainer.innerHTML = "<p>Loading events...</p>";

  const eventsResult = await window.api.getEvents(calendarId);
  if (eventsResult.success && eventsResult.events) {
    if (eventsResult.events.length === 0) {
      eventsContainer.innerHTML = "<p>No upcoming events found.</p>";
      return;
    }

    const ul = document.createElement("ul");
    eventsResult.events.forEach((event: any) => {
      const li = document.createElement("li");
      const start = event.start?.dateTime ?? event.start?.date;
      const date = new Date(start).toLocaleString(); // Nicely formatted local time
      li.innerText = `${date} - ${event.summary}`;
      ul.appendChild(li);
    });

    eventsContainer.innerHTML = "<h3>Upcoming Events:</h3>";
    eventsContainer.appendChild(ul);
  } else {
    eventsContainer.innerHTML = `<p>Error fetching events: ${eventsResult.error}</p>`;
  }
}

const handleLogin = async () => {
  const result = await window.api.loginToGoogle();

  if (result.success) {
    if (loginBtn) loginBtn.style.display = "none";
    await setupCalendarUI();
  } else {
    console.error("Auth failed:", result.error);
  }
};

async function init() {
  const authResult = await window.api.checkAuth();
  if (authResult.success && authResult.isAuthenticated) {
    if (loginBtn) loginBtn.style.display = "none"; // Hide button if already logged in
    await setupCalendarUI();
  } else if (loginBtn) {
    loginBtn.style.display = "block";
  }
}

if (loginBtn) {
  loginBtn.addEventListener("click", handleLogin);
}

// Boot up sequence
init();
