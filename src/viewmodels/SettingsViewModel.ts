import { Observable } from "../Observable";
import { Family, Child } from "../models/models";

export class SettingsViewModel {
  public family = new Observable<Family | null>(null);
  public inviteCode = new Observable<string | null>(null);
  public error = new Observable<string | null>(null);
  public children = new Observable<Child[]>([]);

  async fetchFamily() {
    const response = await window.api.getFamily();
    if (response.success && response.family) {
      this.family.value = response.family;
    } else {
      this.error.value = response.error || "Failed to fetch family";
    }
  }

  async updateFamilyName(name: string) {
    const response = await window.api.updateFamilyName(name);
    if (response.success && this.family.value) {
      this.family.value = { ...this.family.value, name }; // trigger reactivity
    } else {
      this.error.value = response.error || "Failed to update family name";
    }
  }

  async generateInvite() {
    const response = await window.api.generateInvite();
    if (response.success && response.code) {
      this.inviteCode.value = response.code;
    } else {
      this.error.value = response.error || "Failed to generate invite";
    }
  }

  async joinFamily(code: string) {
    const response = await window.api.joinFamily(code);
    if (response.success) {
      alert("Successfully joined new family!");
      this.fetchFamily();
      // Optionally fetch children/chores again here to refresh the UI
      await this.fetchChildren();
    } else {
      this.error.value = response.error || "Failed to join family";
    }
  }

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
