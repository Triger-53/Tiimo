import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { exec } from 'child_process';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// --- PERMISSION WARM-UP ---
ipcMain.handle('request-reminders-access', async () => {
  console.log("--- Requesting Reminders Access ---");
  return new Promise((resolve) => {
    // Simple script just to trigger the OS prompt
    exec('osascript -e "tell application \\"Reminders\\" to get name of every list"', (error) => {
      if (error) {
        console.log("Access denied or script failed:", error.message);
        resolve(false);
      } else {
        console.log("Access granted or already had it.");
        resolve(true);
      }
    });
  });
});

// --- THE MAGIC BRIDGE ---
ipcMain.handle('get-reminders', async () => {
  console.log("--- Reminders Sync Started ---");

  return new Promise((resolve, reject) => {
    // Clean, one-line-friendly script to avoid shell syntax errors
    const jxaScript = `
      var app = Application("Reminders");
      var output = [];
      try {
        var lists = app.lists();
        for (var i = 0; i < lists.length; i++) {
          var list = lists[i];
          var listName = list.name();
          var rems = list.reminders.whose({completed: false});
          
          var names = rems.name();
          var ids = rems.id();
          var dueDates = rems.dueDate();
          
          for (var j = 0; j < names.length; j++) {
            var d = null;
            if (dueDates[j]) {
              try { d = dueDates[j].toISOString(); } catch(e) {}
            }
            output.push({
              id: ids[j],
              title: names[j],
              list: listName,
              dueDate: d
            });
          }
        }
      } catch (e) {}
      JSON.stringify(output);
    `;

    console.log("Executing osascript (30s timeout)...");
    const start = Date.now();

    // Remove newlines and trim to prevent shell issues
    const command = `osascript -l JavaScript -e '${jxaScript.replace(/\n/g, " ").trim()}'`;
    exec(command, {
      maxBuffer: 1024 * 1024 * 20,
      timeout: 30000
    }, (error, stdout, stderr) => {
      const duration = Date.now() - start;
      console.log(`osascript finished in ${duration}ms`);

      if (error) {
        if (error.killed) {
          console.error("OSASCRIPT TIMED OUT. System is likely waiting for a permission prompt.");
          reject("Sync timed out. Please check for macOS permission popups and make sure Reminders access is allowed in System Settings -> Privacy & Security -> Reminders.");
        } else {
          console.error("OSASCRIPT ERROR:", stderr || error.message);
          reject(stderr || error.message);
        }
        return;
      }

      try {
        const data = JSON.parse(stdout);
        console.log(`Successfully parsed ${data.length} reminders.`);
        resolve(data);
      } catch (e) {
        console.error("JSON PARSE ERROR. Raw output preview:", stdout.substring(0, 100));
        reject("Failed to parse data");
      }
    });
  });
});
