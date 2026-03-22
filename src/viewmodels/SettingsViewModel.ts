import { Child } from "../models";
import { Observable } from "../Observable";

export class SettingsViewModel {
  public children = new Observable<Child[]>([]);
  public error = new Observable<string | null>(null);

  async fetchChildren() {
    const res = await window.api.getChildren();
    if (res.success && res.children) this.children.value = res.children;
    else if (res.error) this.error.value = res.error;
  }

  async addChild(name: string, color: string) {
    const res = await window.api.addChild(name, color);
    if (res.success) await this.fetchChildren();
    else this.error.value = res.error || "Failed to add child";
  }

  async removeChild(id: string) {
    const res = await window.api.removeChild(id);
    if (res.success) await this.fetchChildren();
    else this.error.value = res.error || "Failed to remove child";
  }
}

export const settingsViewModel = new SettingsViewModel();
