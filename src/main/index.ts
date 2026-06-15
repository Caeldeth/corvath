import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { createStores } from './store'
import type { Reading, Settings } from '../shared/types'

// Roaming settings + readings live in %APPDATA%/Themisco/Corvath; disposable
// cache (userData) goes in %LOCALAPPDATA%/Themisco/Corvath. Electron dropped
// getPath('cache'), so we resolve LOCALAPPDATA ourselves (mirrors taliesin).
const COMPANY = 'Themisco'
const APP_DIR = 'Corvath'
const dataPath = join(app.getPath('appData'), COMPANY, APP_DIR)
const localAppData = process.env.LOCALAPPDATA ?? join(app.getPath('home'), 'AppData', 'Local')
app.setPath('userData', join(localAppData, COMPANY, APP_DIR))

const store = createStores(dataPath)

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 940,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    title: 'Tarot Reading Recorder',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Keep the renderer's maximize/restore icon in sync with the actual state.
  mainWindow.on('maximize', () => mainWindow.webContents.send('window:maximizeChange', true))
  mainWindow.on('unmaximize', () => mainWindow.webContents.send('window:maximizeChange', false))

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html')).catch((err) => {
      console.error('Failed to load renderer:', err)
    })
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.hybrasyl.corvath')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Readings + settings persistence
  ipcMain.handle('readings:getAll', () => store.loadReadings())
  ipcMain.handle('readings:save', (_e, readings: Reading[]) => store.saveReadings(readings))
  ipcMain.handle('settings:load', () => store.loadSettings())
  ipcMain.handle('settings:save', (_e, settings: Settings) => store.saveSettings(settings))

  // Window controls (custom frameless title bar)
  ipcMain.on('window:minimize', (e) => BrowserWindow.fromWebContents(e.sender)?.minimize())
  ipcMain.on('window:toggleMaximize', (e) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    if (!win) return
    if (win.isMaximized()) win.unmaximize()
    else win.maximize()
  })
  ipcMain.on('window:close', (e) => BrowserWindow.fromWebContents(e.sender)?.close())
  ipcMain.handle(
    'window:isMaximized',
    (e) => BrowserWindow.fromWebContents(e.sender)?.isMaximized() ?? false
  )

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
