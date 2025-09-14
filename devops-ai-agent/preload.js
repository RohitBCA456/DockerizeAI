// frontend/preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object.
contextBridge.exposeInMainWorld('electronAPI', {
  // --- Auth ---
  loginWithGoogle: () => ipcRenderer.send('login-google'),
  onAuthSuccess: (callback) => ipcRenderer.on('auth-success', (_event, value) => callback(value)),

  // --- File System ---
  openFolderDialog: () => ipcRenderer.invoke('dialog:openDirectory'),

  // --- Utilities ---
  openExternalLink: (url) => ipcRenderer.send('open-external-link', url)
});