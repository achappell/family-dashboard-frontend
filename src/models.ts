export interface User {
  email: string;
  firstName: string;
  lastName: string;
}

export interface Child {
  id: string;
  name: string;
  color: string;
}

export interface CalendarInfo {
  id: string;
  summary: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
}
