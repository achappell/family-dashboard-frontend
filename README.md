# Family Hub

A modern, Electron-based desktop application designed to keep your family organized. Manage Google Calendars, track schedules with a color-coded weekly view, and maintain chore charts for your children—all in one sleek interface.

## Features

- **Google Calendar Integration:** Securely login via OAuth2 to sync and view your calendars.
- **Cloud Sync:** Keeps chores, schedules, and children profiles synchronized across multiple devices using Supabase.
- **Weekly Calendar View:** A custom, responsive weekly calendar layout featuring a real-time current time indicator, auto-scrolling, and sticky all-day events.
- **Child Management:** Add your children to the system and assign each a custom color.
- **Smart Color-Coding:** Calendar events containing a child's name will automatically inherit their assigned color in the calendar view.
- **Chore Chart:** A dedicated tab with dynamically generated columns for each child to track daily chores.
- **Reactive MVVM Architecture:** Clean, maintainable codebase structured with Vanilla TypeScript observables.

## Prerequisites

- [Docker](https://www.docker.com/) (for local backend development)
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- A [Supabase](https://supabase.com) account for the PostgreSQL database and Auth.
- A Google Cloud Platform account to generate OAuth 2.0 credentials.

## Setup & Configuration

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure Google API Credentials:**
   To enable Google Calendar sync, you must provide a `credentials.json` file.
   - Go to the Google Cloud Console.
   - Create a new project and enable the **Google Calendar API**.
   - Navigate to **APIs & Services > Credentials**.
   - Configure the OAuth consent screen. Add your email as a test user and include the following scopes:
     - `.../auth/calendar.readonly`
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Create **OAuth client ID** credentials (choose "Desktop app").
   - Download the JSON file, rename it to `credentials.json`, and place it in the root directory of this project.

## Running the Application

To start the application in development mode with hot-reloading:

```bash
npm start
```

## Packaging for Production

To build and package the application for your operating system (macOS, Windows, Linux):

```bash
npm run make
```

The packaged binaries will be output to the `out/` directory.

## Architecture

This project follows the **Model-View-ViewModel (MVVM)** design pattern to cleanly separate data logic from UI rendering:

- **Models (`src/models.ts`):** Pure data interfaces (User, Child, CalendarEvent).
- **ViewModels (`src/viewmodels/`):** Manage state, handle business logic, and communicate with Electron's IPC bridge. Uses a custom Vanilla TypeScript `Observable` pattern.
- **Views (`src/ui/`):** UI components that subscribe to the ViewModels and automatically update the DOM when data changes.
- **Desktop Main Process (`src/main.ts`, `src/google.ts`):** Handles local OS integrations and the Electron IPC bridge.

### Cloud Architecture

To support cross-device synchronization and secure external API communication:

- **Supabase (Database & Auth):** Replaces local storage. Acts as the primary PostgreSQL database for syncing Family, Child, and Chore data across devices via Realtime subscriptions.
- **Google Cloud Run (API):** A containerized Node.js/Express service that securely manages Google Calendar Webhook subscriptions, periodic syncing tasks, and hides sensitive API secrets from the client app.
