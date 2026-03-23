import { settingsViewModel } from "./SettingsViewModel";
import { Observable } from "../Observable";
import { Chore } from "../models/models";

export class ChoresViewModel {
  public chores = new Observable<Chore[]>([]);
  public participants = new Observable<any[]>([]);
  public isLoading = new Observable<boolean>(false);
  public error = new Observable<string | null>(null);

  constructor() {
    // Listen for real-time updates from the main process
    (window as any).api.onChoresUpdated(() => {
      this.fetchChores();
    });
  }

  async fetchParticipants() {
    try {
      const res = await (window as any).api.getMembers();
      if (res.success) {
        this.participants.value = res.participants;
      }
    } catch (e) {
      console.error("Failed to fetch participants", e);
    }
  }

  async fetchChores() {
    this.isLoading.value = true;
    try {
      const res = await (window as any).api.getChores();
      if (res.success && res.chores) {
        // Map snake_case from DB to camelCase for the UI
        this.chores.value = res.chores.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          childId: c.participant_id, // Map generic participant_id to the UI field
          isCompleted: c.is_completed,
          dueDate: c.due_date ? new Date(c.due_date) : undefined,
          recurrence: c.recurrence || "none",
          recurringDays: c.recurring_days || [],
          lastCompletedAt: c.last_completed_at ? new Date(c.last_completed_at) : undefined
        }));
      } else {
        this.error.value = res.error || "Failed to fetch chores";
      }
    } finally {
      this.isLoading.value = false;
    }
  }

  async toggleChore(chore: any) {
    let updateData: any = { id: chore.id, recurrence: chore.recurrence };
    
    if (chore.recurrence === "none") {
      updateData.is_completed = !chore.isCompleted;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const last = chore.lastCompletedAt ? new Date(chore.lastCompletedAt) : null;
      if (last) last.setHours(0, 0, 0, 0);
      
      const isDoneToday = last && last.getTime() === today.getTime();
      updateData.last_completed_at = isDoneToday ? null : new Date().toISOString();
    }

    const res = await (window as any).api.updateChore(updateData);
    if (res.success) {
      await this.fetchChores();
    } else {
      this.error.value = res.error || "Failed to toggle chore";
    }
  }

  async addChore(chore: { 
    title: string, 
    participant_id?: string, 
    description?: string, 
    due_date?: string, 
    recurrence?: string,
    recurring_days?: number[]
  }) {
    const res = await (window as any).api.addChore(chore);
    if (res.success) {
      await this.fetchChores();
    } else {
      this.error.value = res.error || "Failed to add chore";
    }
  }
}
export const choresViewModel = new ChoresViewModel();
