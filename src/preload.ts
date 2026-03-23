// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  loginToGoogle: () => ipcRenderer.invoke("auth-google"),
  getCalendars: () => ipcRenderer.invoke("get-calendars"),
  getEvents: (calendarId: string, dateStr?: string) =>
    ipcRenderer.invoke("get-events", calendarId, dateStr),
  checkAuth: () => ipcRenderer.invoke("check-auth"),
  addChild: (name: string, color: string) =>
    ipcRenderer.invoke("add-child", name, color),
  getChildren: () => ipcRenderer.invoke("get-children"),
  getMembers: () => ipcRenderer.invoke("get-members"),
  removeChild: (id: string) => ipcRenderer.invoke("remove-child", id),
  generateInvite: () => ipcRenderer.invoke("generate-invite"),
  joinFamily: (code: string) => ipcRenderer.invoke("join-family", code),
  getFamily: () => ipcRenderer.invoke("get-family"),
  updateFamilyName: (name: string) =>
    ipcRenderer.invoke("update-family-name", name),
  getChores: () => ipcRenderer.invoke("get-chores"),
  updateChore: (chore: any) => ipcRenderer.invoke("update-chore", chore),
  addChore: (chore: any) => ipcRenderer.invoke("add-chore", chore),
  onChoresUpdated: (callback: () => void) =>
    ipcRenderer.on("chores-updated", () => callback()),
});
