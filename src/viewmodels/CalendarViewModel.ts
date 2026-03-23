import { CalendarInfo, CalendarEvent } from "../models/models";
import { Observable } from "../Observable";

export class CalendarViewModel {
  public calendars = new Observable<CalendarInfo[]>([]);
  public events = new Observable<CalendarEvent[]>([]);
  public selectedCalendarId = new Observable<string>(
    localStorage.getItem("selectedCalendarId") || "primary",
  );
  public isLoadingEvents = new Observable<boolean>(false);
  public error = new Observable<string | null>(null);
  public currentDate = new Observable<Date>(new Date());

  constructor() {
    this.selectedCalendarId.subscribe((id) => {
      if (id) {
        localStorage.setItem("selectedCalendarId", id);
        this.fetchEvents(id);
      }
    }, true); // Fire immediately to fetch on load
  }

  previousWeek() {
    const d = new Date(this.currentDate.value);
    d.setDate(d.getDate() - 7);
    this.currentDate.value = d;
    this.fetchEvents(this.selectedCalendarId.value);
  }

  nextWeek() {
    const d = new Date(this.currentDate.value);
    d.setDate(d.getDate() + 7);
    this.currentDate.value = d;
    this.fetchEvents(this.selectedCalendarId.value);
  }

  async fetchCalendars() {
    const res = await window.api.getCalendars();
    if (res.success && res.calendars) this.calendars.value = res.calendars;
    else if (res.error) this.error.value = res.error;
  }

  async fetchEvents(calendarId: string) {
    this.isLoadingEvents.value = true;
    const res = await window.api.getEvents(
      calendarId,
      this.currentDate.value.toISOString(),
    );
    if (res.success && res.events) {
      this.events.value = res.events.map((e: any) => ({
        id: e.id,
        summary: e.summary || "No Title",
        start: new Date(e.start?.dateTime || e.start?.date),
        end: new Date(
          e.end?.dateTime || e.end?.date || e.start?.dateTime || e.start?.date,
        ),
        isAllDay: !e.start?.dateTime,
      }));
    } else this.error.value = res.error || "Failed to load events";
    this.isLoadingEvents.value = false;
  }
}
export const calendarViewModel = new CalendarViewModel();
