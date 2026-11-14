const { app, BrowserWindow, ipcMain, safeStorage, shell, dialog, clipboard } = require('electron');
const path = require('path'), fs = require('fs'), os = require('os');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const pty = require('node-pty');
const { start } = require('./server');
// Pasta de dados portátil: junto ao exe (portable/instalado) ou ao código (dev).
// Em MSIX a pasta de instalação (WindowsApps) é só de leitura e cai no perfil do utilizador.
function pickDataDir() {
  const base = process.env.PORTABLE_EXECUTABLE_DIR || (app.isPackaged ? path.dirname(process.execPath) : __dirname);
  const d = path.join(base, 'data');
  try { fs.mkdirSync(d, { recursive: true }); fs.accessSync(d, fs.constants.W_OK); return d; }
  catch { // pasta só de leitura (ex.: Program Files ou WindowsApps): recorre ao perfil do utilizador
    const root = app.getPath('appData'), n = path.join(root, 'Hangar'), o = path.join(root, 'AI CLI Manager');
    let target = n;
    // migra dados antigos para o nome novo; se o rename falhar (ficheiros em uso) usa a pasta antiga
    if (!fs.existsSync(n) && fs.existsSync(o)) { try { fs.renameSync(o, n); } catch { target = o; } }
    const f = path.join(target, 'data');
    fs.mkdirSync(f, { recursive: true }); return f;
  }
}
const DATA = pickDataDir();
app.setPath('userData', path.join(DATA, 'electron'));
app.setPath('sessionData', path.join(DATA, 'electron'));
// evita que um erro não tratado (ex.: falha ao arrancar o Ollama) feche a aplicação
const crashLog = (kind, error) => { try { const dir = path.join(DATA, 'logs'); fs.mkdirSync(dir, { recursive: true }); fs.appendFileSync(path.join(dir, 'crash.log'), `${new Date().toISOString()} ${kind}: ${error && error.stack || error}\n`); } catch {} };
process.on('uncaughtException', error => { console.error('uncaughtException:', error); crashLog('uncaughtException', error); });
process.on('unhandledRejection', error => { console.error('unhandledRejection:', error); crashLog('unhandledRejection', error); });
// Correcao de arranque: nesta maquina o processo GPU do Chromium, quando arranca dentro do
// sandbox, morre com DLL em falta (exit 0xC0000135); apos varias tentativas o Chromium encerra
// a app com "GPU process isn't usable. Goodbye.". O sandbox do processo GPU e desativado (o
// sandbox do renderer mantem-se); tem de ser aplicado antes do evento ready.
app.commandLine.appendSwitch('disable-gpu-sandbox');
// Em algumas instalacoes do Windows 11 (build 26H2) a sandbox do Chromium tambem bloqueia o
// arranque do renderer com o mesmo 0xC0000135, deixando a janela sem interface. Quando isso
// acontece a app reabre-se uma unica vez com --no-sandbox (ver render-process-gone).
let sandboxFallback = process.argv.includes('--no-sandbox');
const SANDBOX_MARKER = path.join(DATA, 'sandbox-unavailable');
if (!sandboxFallback && fs.existsSync(SANDBOX_MARKER)) sandboxFallback = true;
if (sandboxFallback) app.commandLine.appendSwitch('no-sandbox');
function getDataKey() {
  const keyFile = path.join(DATA, 'catalog.key');
  if (safeStorage.isEncryptionAvailable()) {
    if (fs.existsSync(keyFile)) return Buffer.from(safeStorage.decryptString(fs.readFileSync(keyFile)), 'base64');
    const key = crypto.randomBytes(32);
    fs.writeFileSync(keyFile, safeStorage.encryptString(key.toString('base64')));
    return key;
  }
  const identity = [os.hostname(), os.userInfo().username, os.homedir(), process.platform, 'ai-cli-manager-host-v1'].join('|');
  return crypto.scryptSync(identity, 'ai-cli-manager-local-data', 32);
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();
let win = null;
const consoleProcesses = new Map();
function locateCommand(name) {
  try {
    const locator = process.platform === 'win32' ? 'where.exe' : 'which';
    return execFileSync(locator, [name], { encoding: 'utf8', timeout: 3000, windowsHide: true })
      .split(/\r?\n/).map(file => file.trim()).find(file => file && fs.existsSync(file)) || null;
  } catch { return null; }
}
function getConsoleShell() {
  if (process.platform === 'win32') {
    const powershell = locateCommand('powershell.exe') || locateCommand('pwsh.exe');
    return powershell
      ? { file: powershell, args: ['-NoLogo', '-NoExit', '-Command', "$style = Get-Variable -Name PSStyle -ErrorAction SilentlyContinue; if ($style) { $style.Value.OutputRendering = 'Ansi'; if ($style.Value.Progress) { $style.Value.Progress.View = 'Minimal' } }"], label: 'PowerShell' }
      : { file: process.env.ComSpec || 'cmd.exe', args: ['/Q'], label: 'CMD' };
  }
  const shell = process.env.SHELL || '/bin/sh';
  return { file: shell, args: ['-i'], label: path.basename(shell) };
}
function sendConsole(channel, data) {
  if (win && !win.isDestroyed()) win.webContents.send(channel, data);
}
function validConsoleSession(event, sessionId) {
  return !!win && event.sender === win.webContents && typeof sessionId === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(sessionId);
}
function startConsole(event, request) {
  const sessionId = request && request.sessionId;
  if (!validConsoleSession(event, sessionId) || consoleProcesses.has(sessionId)) return;
  const shell = getConsoleShell();
  const consoleEnv = { ...process.env, FORCE_COLOR: process.env.FORCE_COLOR || '1', CLICOLOR_FORCE: process.env.CLICOLOR_FORCE || '1', TERM: process.env.TERM || 'xterm-256color' };
  let cwd = os.homedir();
  if (typeof request.cwd === 'string' && path.isAbsolute(request.cwd)) {
    try { if (fs.statSync(request.cwd).isDirectory()) cwd = request.cwd; }
    catch (error) { sendConsole('console:error', { sessionId, message: `Não foi possível abrir o diretório selecionado: ${error.message}` }); return; }
  }
  let child;
  try { child = pty.spawn(shell.file, shell.args, { name: 'xterm-256color', cols: 120, rows: 30, cwd, env: consoleEnv }); }
  catch (error) { sendConsole('console:error', { sessionId, message: error.message }); return; }
  consoleProcesses.set(sessionId, child);
  child.onData(text => sendConsole('console:output', { sessionId, text }));
  child.onExit(({ exitCode, signal }) => {
    if (consoleProcesses.get(sessionId) === child) consoleProcesses.delete(sessionId);
    sendConsole('console:exit', { sessionId, code: exitCode, signal });
  });
  sendConsole('console:started', { sessionId, shell: shell.label });
}
function writeConsole(event, request) {
  const sessionId = request && request.sessionId, text = request && request.text, child = consoleProcesses.get(sessionId);
  if (!validConsoleSession(event, sessionId) || !child || typeof text !== 'string' || text.length > 20000) return;
  child.write(text);
}
function resizeConsole(event, request) {
  const sessionId = request && request.sessionId, size = request && request.size, child = consoleProcesses.get(sessionId);
  if (!validConsoleSession(event, sessionId) || !child || !size || !Number.isInteger(size.cols) || !Number.isInteger(size.rows)) return;
  const cols = Math.max(20, Math.min(500, size.cols)), rows = Math.max(5, Math.min(200, size.rows));
  child.resize(cols, rows);
}
function stopConsole(event, sessionId) {
  if (!validConsoleSession(event, sessionId)) return;
  const child = consoleProcesses.get(sessionId);
  if (child) { consoleProcesses.delete(sessionId); child.kill(); }
}
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.show(); win.focus(); } });
const readCfg = () => { try { return JSON.parse(fs.readFileSync(path.join(DATA, 'settings.json'), 'utf8')); } catch { return {}; } };
const saveBounds = b => { const f = path.join(DATA, 'settings.json'); try { fs.writeFileSync(f, JSON.stringify({ ...readCfg(), bounds: b }, null, 2)); } catch {} };

// Em MSIX a identidade (AUMID) e atribuida pelo pacote; substitui-la quebra
// notificacoes e a fixacao na barra de tarefas. Fora do pacote mantem-se o ID proprio.
if (!process.windowsStore) app.setAppUserModelId('com.aldaco.hangar');
if (gotLock) app.whenReady().then(async () => {
  const port = await start(DATA, getDataKey());
  const b = readCfg().bounds || {};
  const w = new BrowserWindow({
    width: b.width || 1100, height: b.height || 720, x: b.x, y: b.y, minWidth: 760, minHeight: 480,
    show: false, frame: false, resizable: true, backgroundColor: '#f5f6f8',
    icon: path.join(__dirname, 'build', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true }
  });
  if (b.max) w.maximize();
  win = w;
  w.setMenuBarVisibility(false);
  w.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  w.webContents.on('did-finish-load', () => w.webContents.send('state', w.isMaximized()));
  // Se a sandbox impede o renderer de arrancar (DLL em falta), guarda o marcador e
  // reabre a app sem sandbox; nos arranques seguintes ja nao e preciso reiniciar.
  w.webContents.on('render-process-gone', (_, details) => {
    if (sandboxFallback || details.exitCode !== -1073741515) return;
    sandboxFallback = true;
    crashLog('render-process-gone', `sandbox indisponivel (${details.exitCode}); a reabrir com --no-sandbox`);
    try { fs.writeFileSync(SANDBOX_MARKER, new Date().toISOString()); } catch {}
    app.relaunch({ args: process.argv.slice(1).concat(['--no-sandbox']) });
    app.exit(0);
  });
  w.once('ready-to-show', () => { w.show(); w.focus(); w.webContents.focus(); });
  w.on('focus', () => w.webContents.focus());
  w.loadURL('http://127.0.0.1:' + port + '/?v=' + encodeURIComponent(app.getVersion()));
  ipcMain.on('console:start', startConsole);
  ipcMain.on('console:input', writeConsole);
  ipcMain.on('console:resize', resizeConsole);
  ipcMain.on('console:stop', stopConsole);
  ipcMain.handle('console:select-directory', async event => {
    if (!win || event.sender !== win.webContents) throw new Error('Pedido de diretório não autorizado.');
    const result = await dialog.showOpenDialog(win, { properties: ['openDirectory', 'createDirectory'] });
    return result.canceled || !result.filePaths.length ? null : result.filePaths[0];
  });
  ipcMain.handle('console:clipboard-files', async event => {
    if (!win || event.sender !== win.webContents) throw new Error('Pedido de área de transferência não autorizado.');
    const raw = clipboard.readBuffer('FileNameW');
    if (!raw || !raw.length) return [];
    return raw.toString('utf16le').replace(/\0+$/, '').split('\0').filter(Boolean).slice(0, 10).map(file => ({ path: file, name: path.basename(file) }));
  });
  ipcMain.handle('console:select-media', async (event, request) => {
    if (!win || event.sender !== win.webContents || !request || !['image', 'files'].includes(request.kind) || typeof request.forModel !== 'boolean') throw new Error('Pedido de ficheiros não autorizado.');
    const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
    const textExtensions = new Set(['.txt', '.md', '.markdown', '.rst', '.csv', '.json', '.html', '.htm', '.css', '.js', '.jsx', '.ts', '.tsx', '.py', '.cs', '.java', '.go', '.rs', '.c', '.cpp', '.h', '.hpp', '.sql', '.yaml', '.yml', '.toml', '.xml', '.log']);
    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile', 'multiSelections'],
      filters: request.kind === 'image' ? [{ name: 'Imagens', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'] }] : [{ name: 'Todos os ficheiros', extensions: ['*'] }]
    });
    if (result.canceled) return [];
    if (!request.forModel) return result.filePaths.slice(0, 10).map(file => ({ path: file, name: path.basename(file) }));
    const files = [];
    let totalBytes = 0, textBytes = 0, imageCount = 0;
    for (const file of result.filePaths.slice(0, 10)) {
      const extension = path.extname(file).toLowerCase();
      const isImage = imageExtensions.has(extension);
      if (request.kind === 'image' && !isImage) throw new Error(`Formato de imagem não suportado: ${path.basename(file)}`);
      if (request.kind === 'files' && !isImage && !textExtensions.has(extension)) throw new Error(`Formato não suportado como contexto: ${path.basename(file)}`);
      const stat = fs.lstatSync(file);
      if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`O caminho não é um ficheiro normal: ${path.basename(file)}`);
      const limit = isImage ? 8 * 1024 * 1024 : 32 * 1024;
      if (stat.size > limit || totalBytes + stat.size > 8 * 1024 * 1024) throw new Error('Os anexos excedem o limite de 8 MB (máximo de 32 KB por ficheiro de texto).');
      const content = fs.readFileSync(file);
      totalBytes += content.length;
      if (isImage) {
        if (++imageCount > 5) throw new Error('É possível anexar até 5 imagens por conversa.');
        files.push({ name: path.basename(file), mimeType: ({ '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif' })[extension], image: content.toString('base64') });
      }
      else {
        const text = content.toString('utf8');
        if (text.includes('\0')) throw new Error(`O ficheiro não parece ser texto: ${path.basename(file)}`);
        textBytes += content.length;
        if (textBytes > 256 * 1024) throw new Error('Os ficheiros de texto anexados excedem 256 KB no total.');
        files.push({ name: path.basename(file), text });
      }
    }
    return files;
  });
  ipcMain.on('win', (_, a) => {
    if (a === 'min') w.minimize();
    else if (a === 'max') w.isMaximized() ? w.unmaximize() : w.maximize();
    else if (a === 'close') w.close();
  });
  w.on('maximize', () => w.webContents.send('state', true));
  w.on('unmaximize', () => w.webContents.send('state', false));
  w.on('close', () => {
    for (const child of consoleProcesses.values()) child.kill();
    consoleProcesses.clear();
    saveBounds({ ...w.getNormalBounds(), max: w.isMaximized() });
  });
});
app.on('window-all-closed', () => app.quit());
