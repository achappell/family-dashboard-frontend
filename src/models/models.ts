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

export interface Family {
  id: string;
  name: string;
}

export interface Chore {
  id: string;
  title: string;
  description?: string;
  childId?: string;
  isCompleted: boolean;
  dueDate?: Date;
  recurrence: string; // 'none', 'daily', 'weekly', etc.
  recurringDays: number[]; // 0-6
  lastCompletedAt?: Date;
}
