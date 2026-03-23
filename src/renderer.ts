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
import { setupTabs } from "./ui/tabs";
import { setupSettingsUI } from "./ui/settings";
import { setupCalendarUI } from "./ui/calendar";
import { setupChoresUI } from "./ui/chores";
import { appViewModel } from "./viewmodels/MainViewModel";
import { calendarViewModel } from "./viewmodels/CalendarViewModel";
import { settingsViewModel } from "./viewmodels/SettingsViewModel";

console.log(
  '👋 This message is being logged by "renderer.ts", included via Vite',
);

const loginBtn = document.getElementById("googleCalendar");
const loginUi = document.getElementById("login-ui");
const appUi = document.getElementById("app-ui");
const welcomeMessage = document.getElementById("welcome-message");

// Bind ViewModel Auth State to View
appViewModel.user.subscribe((user) => {
  if (user) {
    if (loginUi) loginUi.style.display = "none";
    if (appUi) appUi.style.display = "flex";
    if (welcomeMessage)
      welcomeMessage.innerText = `Welcome, ${user.firstName}!`;

    // Load dependent view models once authenticated
    settingsViewModel.fetchChildren();
    settingsViewModel.fetchFamily();
    calendarViewModel.fetchCalendars();
    calendarViewModel.fetchEvents(calendarViewModel.selectedCalendarId.value);
  } else {
    if (loginUi) loginUi.style.display = "flex";
    if (appUi) appUi.style.display = "none";
  }
}, true);

// Bind Errors from all View Models
const handleError = (error: string | null) => {
  if (error) alert("Error: " + error);
};
appViewModel.error.subscribe(handleError);
calendarViewModel.error.subscribe(handleError);
settingsViewModel.error.subscribe(handleError);

if (loginBtn) {
  loginBtn.addEventListener("click", () => appViewModel.login());
}

async function init() {
  setupTabs();
  setupSettingsUI();
  setupCalendarUI();
  setupChoresUI();

  await appViewModel.init();
}

// Boot up sequence
init();
