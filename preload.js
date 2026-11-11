const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('winctl', {
  ctl: a => ipcRenderer.send('win', a),
  onState: cb => ipcRenderer.on('state', (_, v) => cb(v)),
  startConsole: (sessionId, cwd) => ipcRenderer.send('console:start', { sessionId, cwd }),
  writeConsole: (sessionId, text) => ipcRenderer.send('console:input', { sessionId, text }),
  resizeConsole: (sessionId, cols, rows) => ipcRenderer.send('console:resize', { sessionId, size: { cols, rows } }),
  stopConsole: sessionId => ipcRenderer.send('console:stop', sessionId),
  selectDirectory: () => ipcRenderer.invoke('console:select-directory'),
  selectMedia: (kind, forModel) => ipcRenderer.invoke('console:select-media', { kind, forModel }),
  clipboardFiles: () => ipcRenderer.invoke('console:clipboard-files'),
  onConsoleOutput: cb => ipcRenderer.on('console:output', (_, data) => cb(data)),
  onConsoleStarted: cb => ipcRenderer.on('console:started', (_, data) => cb(data)),
  onConsoleError: cb => ipcRenderer.on('console:error', (_, data) => cb(data)),
  onConsoleExit: cb => ipcRenderer.on('console:exit', (_, details) => cb(details))
});
