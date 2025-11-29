const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  onDeepLink(callback) {
    ipcRenderer.on('deeplink', (_, url) => callback(url));
  },
});
