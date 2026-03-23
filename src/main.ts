import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import Store from "electron-store";
import { listEvents, getCalendars } from "./google";
import { createClient } from "@supabase/supabase-js";

const store = new Store();

// Initialize Supabase
const supabase = createClient(
  "https://evgzhjqlfhtvrxazdkor.supabase.co",
  "sb_publishable_1-AQA6EXKm_Civ4h6WwaDg_9nxY0j74",
  {
    auth: {
      storage: {
        getItem: (key) => (store.get(key) as string) ?? null,
        setItem: (key, value) => store.set(key, value),
        removeItem: (key) => store.delete(key),
      },
    },
  },
);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// Enable remote debugging for the Renderer process in development
if (!app.isPackaged) {
  app.commandLine.appendSwitch("remote-debugging-port", "9222");
}

ipcMain.handle("auth-google", async () => {
  try {
    // 1. Get the OAuth URL from Supabase, requesting Google Calendar scopes
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes:
          "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
        skipBrowserRedirect: true,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error || !data.url) throw error;

    // 2. Open an Electron BrowserWindow to handle the login
    return new Promise((resolve) => {
      const authWindow = new BrowserWindow({
        width: 500,
        height: 700,
        show: true,
        webPreferences: { nodeIntegration: false },
      });

      authWindow.loadURL(data.url);

      // 3. Intercept the redirect back to the app to harvest the tokens
      const handleNavigation = async (event: any, url: string) => {
        if (
          url.includes("access_token=") ||
          url.includes("error_description=")
        ) {
          if (event.preventDefault) event.preventDefault();

          if (authWindow.isDestroyed()) return;
          authWindow.close();

          // Parse the parameters safely handling both hash and query strings
          const safeUrl = url.replace("#", url.includes("?") ? "&" : "?");
          const urlObj = new URL(safeUrl);

          if (url.includes("error_description=")) {
            const errorDesc = urlObj.searchParams.get("error_description");
            return resolve({
              success: false,
              error: `OAuth failed: ${errorDesc || "Unknown error"}`,
            });
          }

          const accessToken = urlObj.searchParams.get("access_token");
          const refreshToken = urlObj.searchParams.get("refresh_token");
          const providerToken = urlObj.searchParams.get("provider_token"); // Google Access Token!
          const providerRefreshToken = urlObj.searchParams.get(
            "provider_refresh_token",
          ); // Google Refresh Token!

          if (accessToken && refreshToken) {
            // Lock in the Supabase session locally
            const { data: sessionData } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            const user = sessionData.user;
            const userInfo = {
              email: user?.email,
              firstName: user?.user_metadata?.full_name?.split(" ")[0] || "",
              lastName: user?.user_metadata?.full_name?.split(" ")[1] || "",
              googleProviderToken: providerToken,
              googleProviderRefreshToken: providerRefreshToken,
            };

            store.set("currentUser", userInfo);
            resolve({ success: true, user: userInfo });
          } else {
            resolve({ success: false, error: "No tokens found in callback" });
          }
        }
      };

      authWindow.webContents.on("will-redirect", handleNavigation);
      authWindow.webContents.on("will-navigate", handleNavigation);
      authWindow.webContents.on("did-redirect-navigation", handleNavigation);
    });
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("check-auth", async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user: any = store.get("currentUser");

    if (!session || !user || !user.email)
      return { success: true, isAuthenticated: false };
    return { success: true, isAuthenticated: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("get-calendars", async () => {
  try {
    const user: any = store.get("currentUser");
    if (!user || !user.email || !user.googleProviderToken)
      throw new Error("No user logged in or missing Google token");
    const calendars = await getCalendars({
      access_token: user.googleProviderToken,
      refresh_token: user.googleProviderRefreshToken,
    });
    return { success: true, calendars };
  } catch (error: any) {
    // Safety net: If token is completely dead, wipe session and restart app to login screen
    if (error.message.includes("Invalid Credentials")) {
      store.delete("currentUser");
      await supabase.auth.signOut();
      app.relaunch();
      app.exit(0);
    }
    return { success: false, error: error.message };
  }
});

ipcMain.handle(
  "get-events",
  async (event, calendarId: string, dateStr?: string) => {
    try {
      const user: any = store.get("currentUser");
      if (!user || !user.email || !user.googleProviderToken)
        throw new Error("No user logged in or missing Google token");
      const events = await listEvents(
        {
          access_token: user.googleProviderToken,
          refresh_token: user.googleProviderRefreshToken,
        },
        calendarId,
        dateStr,
      );
      return { success: true, events };
    } catch (error: any) {
      if (error.message.includes("Invalid Credentials")) {
        store.delete("currentUser");
        await supabase.auth.signOut();
        app.relaunch();
        app.exit(0);
      }
      return { success: false, error: error.message };
    }
  },
);

async function getOrCreateFamily() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("No user logged in");

  // Find existing family
  const { data: members, error: memberError } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", session.user.id)
    .limit(1);

  if (memberError) throw memberError;
  if (members && members.length > 0) return members[0].family_id;

  // Create new family if they don't have one
  const { data: newFamily, error: familyError } = await supabase
    .from("families")
    .insert([{ name: "My Family" }])
    .select()
    .single();
  if (familyError) throw familyError;

  const { error: insertError } = await supabase
    .from("family_members")
    .insert([{ family_id: newFamily.id, user_id: session.user.id }]);

  if (insertError) throw insertError;

  return newFamily.id;
}

ipcMain.handle(
  "add-child",
  async (event, childName: string, childColor: string) => {
    try {
      const familyId = await getOrCreateFamily();

      const { data, error } = await supabase
        .from("children")
        .insert([{ family_id: familyId, name: childName, color: childColor }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, child: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
);

ipcMain.handle("get-children", async () => {
  try {
    const familyId = await getOrCreateFamily();

    const { data, error } = await supabase
      .from("children")
      .select("*")
      .eq("family_id", familyId);

    if (error) throw error;
    return { success: true, children: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("remove-child", async (event, childId: string) => {
  try {
    const familyId = await getOrCreateFamily();

    const { error } = await supabase
      .from("children")
      .delete()
      .eq("id", childId)
      .eq("family_id", familyId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("generate-invite", async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("No user logged in");

    const familyId = await getOrCreateFamily();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase(); // Simple 6 char code

    const { error } = await supabase.from("family_invites").insert([
      {
        code,
        family_id: familyId,
        created_by: session.user.id,
      },
    ]);

    if (error) throw error;
    return { success: true, code };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("join-family", async (event, code: string) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("No user logged in");

    const { data: invite, error: inviteError } = await supabase
      .from("family_invites")
      .select("family_id")
      .eq("code", code)
      .single();
    if (inviteError || !invite)
      throw new Error("Invalid or expired invite code");

    await supabase
      .from("family_members")
      .delete()
      .eq("user_id", session.user.id);
    const { error: joinError } = await supabase
      .from("family_members")
      .insert([{ family_id: invite.family_id, user_id: session.user.id }]);

    if (joinError) throw joinError;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("get-family", async () => {
  try {
    const familyId = await getOrCreateFamily();
    const { data, error } = await supabase
      .from("families")
      .select("*")
      .eq("id", familyId)
      .single();

    if (error) throw error;
    return { success: true, family: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("update-family-name", async (event, name: string) => {
  try {
    const familyId = await getOrCreateFamily();
    const { error } = await supabase
      .from("families")
      .update({ name })
      .eq("id", familyId);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("get-chores", async () => {
  try {
    const { data, error } = await supabase
      .from("chores")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, chores: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("update-chore", async (event, chore: any) => {
  try {
    const updateData: any = {};
    if (chore.recurrence === "none") {
      updateData.is_completed = chore.is_completed;
    } else {
      updateData.last_completed_at = chore.last_completed_at;
    }

    const { error } = await supabase
      .from("chores")
      .update(updateData)
      .eq("id", chore.id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("get-members", async () => {
  try {
    const familyId = await getOrCreateFamily();

    // Fetch children
    const { data: children, error: childError } = await supabase
      .from("children")
      .select("id, name, color")
      .eq("family_id", familyId);
    if (childError) throw childError;

    // Fetch family members (users)
    const { data: members, error: memberError } = await supabase
      .from("family_members")
      .select("user_id, profiles(first_name)")
      .eq("family_id", familyId);
    if (memberError) throw memberError;

    // Mapping members to a consistent format
    const userParticipants = members.map((m: any) => ({
      id: m.user_id,
      name: m.profiles?.first_name || "User " + m.user_id.substring(0, 4),
      color: "#8e8e93",
      isUser: true
    }));

    return { success: true, participants: [...children, ...userParticipants] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("add-chore", async (event, chore: any) => {
  try {
    console.log("Adding chore:", chore);
    const { data, error } = await supabase
      .from("chores")
      .insert([
        {
          title: chore.title,
          description: chore.description,
          participant_id: chore.participant_id, // Use generic participant_id
          is_completed: false,
          due_date: chore.due_date,
          recurrence: chore.recurrence || "none",
          recurring_days: chore.recurring_days || [],
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error adding chore:", error);
      throw error;
    }
    return { success: true, chore: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// Subscribe to real-time chore changes
supabase
  .channel("public:chores")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "chores" },
    (payload) => {
      console.log("Real-time change received:", payload);
      // Notify all renderer windows that they should refresh chores
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send("chores-updated");
      });
    },
  )
  .subscribe();

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
