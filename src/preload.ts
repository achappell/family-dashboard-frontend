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
  removeChild: (id: string) => ipcRenderer.invoke("remove-child", id),
});
