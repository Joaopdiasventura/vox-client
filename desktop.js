import { app, BrowserWindow, Menu } from 'electron';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const gotTheLock = app.requestSingleInstanceLock();
const isPackaged = app.isPackaged;
let mainWindow;
let htmlPath;
let baseUrl;
let pendingRoute;

if (!gotTheLock) app.quit();
else {
  app.on('second-instance', (_, argv) => {
    if (process.platform == 'win32') {
      const url = argv.find((arg) => arg.startsWith('vox://'));
      if (url && mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
        navigateToRoute(url);
      }
    }
  });

  app.whenReady().then(() => {
    if (process.platform == 'win32') {
      // Garante registro do protocolo com o executável correto (packaged ou dev).
      if (!isPackaged) app.setAsDefaultProtocolClient('vox', process.execPath, [__filename]);
      else app.setAsDefaultProtocolClient('vox');
    }
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
      navigateToRoute(url);
    }
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
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
  const candidates = [
    cliPath ? resolve(cliPath) : null,
    join(__dirname, 'www', 'index.html'),
    join(process.resourcesPath, 'www', 'index.html'),
    join(process.resourcesPath, 'app', 'www', 'index.html'),
  ].filter(Boolean);

  htmlPath = candidates.find((p) => fs.existsSync(p));

  if (!htmlPath) {
    baseUrl = process.env.VOX_DEV_URL || 'http://localhost:4200';
    mainWindow.loadURL(baseUrl);
    console.log('[VOX][electron] modo dev, baseUrl', baseUrl);
  } else {
    baseUrl = pathToFileURL(htmlPath).toString();
    mainWindow.loadURL(baseUrl);
    console.log('[VOX][electron] carregando index', htmlPath);
  }

  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault();
    mainWindow.setTitle('VOX');
  });

  mainWindow.webContents.on('did-finish-load', () => {
    if (pendingRoute) {
      pushRoute(pendingRoute);
      pendingRoute = undefined;
    }
  });
}

function navigateToRoute(deepLinkUrl) {
  if (!mainWindow) return;
  let targetRoute = '';
  try {
    const parsed = new URL(deepLinkUrl);
    const pathParam = parsed.searchParams.get('path');
    if (pathParam) {
      const decoded = decodeURIComponent(pathParam);
      targetRoute = `/${decoded.replace(/^\/+/, '')}${parsed.hash ?? ''}`;
    } else {
      targetRoute = `${parsed.pathname ?? ''}${parsed.hash ?? ''}` || '/';
    }
  } catch {
    targetRoute = '/';
  }

  const hash = targetRoute.startsWith('#')
    ? targetRoute
    : `#${targetRoute.replace(/^\/+/, '')}`;

  console.log('[VOX][deeplink]', { deepLinkUrl, targetRoute, hash, baseUrl, htmlPath });

  const normalized = targetRoute.startsWith('/') ? targetRoute : `/${targetRoute}`;

  if (mainWindow.webContents.isLoading()) {
    pendingRoute = normalized;
  } else {
    mainWindow.webContents.send('deeplink', normalized);
  }
}

app.on('window-all-closed', () => {
  if (process.platform != 'darwin') app.quit();
});

function pushRoute(route) {
  mainWindow?.webContents.send('deeplink', route);
}
