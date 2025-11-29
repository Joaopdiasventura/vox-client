import { app, BrowserWindow, Menu } from 'electron';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) app.quit();
else {
  app.on('second-instance', (_, argv) => {
    if (process.platform == 'win32') {
      const url = argv.find((arg) => arg.startsWith('vox://'));
      if (url && BrowserWindow.getAllWindows().length > 0) {
        const win = BrowserWindow.getAllWindows()[0];
        if (win.isMinimized()) win.restore();
        win.focus();
        win.webContents.send('deeplink', url);
      }
    }
  });

  app.whenReady().then(() => {
    if (process.platform == 'win32') app.setAsDefaultProtocolClient('vox');
    createWindow();
    handleFirstInstanceDeepLink();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length == 0) createWindow();
    });
  });
}

function handleFirstInstanceDeepLink() {
  if (process.platform == 'win32') {
    const url = process.argv.find((arg) => arg.startsWith('vox://'));
    if (url) {
      const win = BrowserWindow.getAllWindows()[0];
      if (win)
        win.webContents.once('did-finish-load', () => {
          win.webContents.send('deeplink', url);
        });
    }
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    title: 'VOX',
    icon: join(__dirname, 'assets', 'icon-foreground.png'),
    webPreferences: {
      devTools: false,
      preload: join(__dirname, 'preload.js'),
    },
  });

  mainWindow.maximize();
  Menu.setApplicationMenu(null);
  mainWindow.setMenu(null);

  const cliPath = process.argv[2];
  const htmlPath = cliPath
    ? resolve(cliPath)
    : join(__dirname, 'www', 'index.html');

  if (fs.existsSync(htmlPath)) mainWindow.loadFile(htmlPath);
  else
    mainWindow.loadURL(
      'data:text/html;charset=utf-8,' +
        encodeURIComponent(
          '<h1>Arquivo n\u00e3o encontrado</h1><p>' + htmlPath + '</p>',
        ),
    );

  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault();
    mainWindow.setTitle('VOX');
  });
}

app.on('window-all-closed', () => {
  if (process.platform != 'darwin') app.quit();
});
