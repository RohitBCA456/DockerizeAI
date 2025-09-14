// frontend/main.js
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');

// The base URL of your backend server
const BASE_URL = 'http://localhost:4000';

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, 'public/assets/icon.png'),
    title: "DevOps Agent"
  });

  // Load the React development server URL
  // In a production build, you would load the built file: `mainWindow.loadFile('build/index.html')`
  mainWindow.loadURL('http://localhost:3000');

  // Open DevTools automatically for debugging
  // mainWindow.webContents.openDevTools();

  return mainWindow;
}

app.whenReady().then(() => {
  const mainWindow = createMainWindow();

  // --- IPC Handlers for Secure Node.js Access ---

  // 1. Handle Google Login Request
  ipcMain.on('login-google', () => {
    const authWindow = new BrowserWindow({
      width: 500,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    authWindow.loadURL(`${BASE_URL}/auth/google`);

    // When the auth window is closed by the backend's script,
    // we assume login was successful and notify the main window.
    authWindow.on('closed', () => {
      mainWindow.webContents.send('auth-success');
    });
  });

  // 2. Handle Folder Selection Dialog
  ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    if (!canceled) {
      return filePaths[0];
    }
  });

  // 3. Handle Opening Links in External Browser
  ipcMain.on('open-external-link', (event, url) => {
    shell.openExternal(url);
  });


  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});