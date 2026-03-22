import { User, Child, CalendarInfo } from "./models";

export {};

declare global {
  interface Window {
    api: {
      loginToGoogle: () => Promise<{
        success: boolean;
        user?: User;
        error?: string;
      }>;
      getCalendars: () => Promise<{
        success: boolean;
        calendars?: CalendarInfo[];
        error?: string;
      }>;
      getEvents: (
        calendarId: string,
        dateStr?: string,
      ) => Promise<{ success: boolean; events?: any[]; error?: string }>;
      checkAuth: () => Promise<{
        success: boolean;
        isAuthenticated?: boolean;
        user?: User;
        error?: string;
      }>;
      addChild: (
        name: string,
        color: string,
      ) => Promise<{ success: boolean; child?: Child; error?: string }>;
      getChildren: () => Promise<{
        success: boolean;
        children?: Child[];
        error?: string;
      }>;
      removeChild: (
        id: string,
      ) => Promise<{ success: boolean; error?: string }>;
    };
  }
}
