import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import Store from "electron-store";
import {
  listEvents,
  getCalendars,
  checkAuthStatus,
  loginWithGoogle,
} from "./google";

// electron-store v10+ is pure ESM. When externalized in a CommonJS build,
// the import gets wrapped in a Module Namespace Object. We unwrap it safely:
const StoreClass = (Store as any).default || Store;
const store = new StoreClass();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

ipcMain.handle("auth-google", async () => {
  try {
    const userInfo = await loginWithGoogle();
    store.set("currentUser", userInfo);
    return { success: true, user: userInfo };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("check-auth", async () => {
  try {
    const user: any = store.get("currentUser");
    if (!user || !user.email) return { success: true, isAuthenticated: false };
    const isAuthenticated = await checkAuthStatus(user.email);
    return { success: true, isAuthenticated, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("get-calendars", async () => {
  try {
    const user: any = store.get("currentUser");
    if (!user || !user.email) throw new Error("No user logged in");
    const calendars = await getCalendars(user.email);
    return { success: true, calendars };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(
  "get-events",
  async (event, calendarId: string, dateStr?: string) => {
    try {
      const user: any = store.get("currentUser");
      if (!user || !user.email) throw new Error("No user logged in");
      const events = await listEvents(user.email, calendarId, dateStr);
      return { success: true, events };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
);

ipcMain.handle("add-child", (event, childName: string, childColor: string) => {
  try {
    const user: any = store.get("currentUser");
    if (!user || !user.email) throw new Error("No user logged in");
    const childrenKey = `children_${user.email}`;
    const children: any[] = (store.get(childrenKey) as any[]) || [];
    const newChild = {
      id: Date.now().toString(),
      name: childName,
      color: childColor,
    };
    children.push(newChild);
    store.set(childrenKey, children);
    return { success: true, child: newChild };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("get-children", () => {
  try {
    const user: any = store.get("currentUser");
    if (!user || !user.email) throw new Error("No user logged in");
    const childrenKey = `children_${user.email}`;
    const children = store.get(childrenKey) || [];
    return { success: true, children };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("remove-child", (event, childId: string) => {
  try {
    const user: any = store.get("currentUser");
    if (!user || !user.email) throw new Error("No user logged in");
    const childrenKey = `children_${user.email}`;
    let children: any[] = (store.get(childrenKey) as any[]) || [];
    children = children.filter((c) => c.id !== childId);
    store.set(childrenKey, children);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
