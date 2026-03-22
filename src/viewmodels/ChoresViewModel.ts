import { settingsViewModel } from "./SettingsViewModel";

export class ChoresViewModel {
  public get children() {
    // Chores chart will observe children directly from the app configuration
    return settingsViewModel.children;
  }
}
export const choresViewModel = new ChoresViewModel();
