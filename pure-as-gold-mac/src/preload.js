const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    fetchReminders: () => ipcRenderer.invoke('get-reminders'),
    requestRemindersAccess: () => ipcRenderer.invoke('request-reminders-access')
});
