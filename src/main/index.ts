import { app, shell, BrowserWindow, ipcMain, protocol } from 'electron'
import { join, extname } from 'path'
import { readFile } from 'fs/promises'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { createStores } from './store'
import type { Deck, Layout, Reading, Settings } from '../shared/types'

// Roaming settings + readings + decks live in %APPDATA%/Themisco/Corvath; the
// disposable cache (userData) goes in %LOCALAPPDATA%/Themisco/Corvath. Electron
// dropped getPath('cache'), so we resolve LOCALAPPDATA ourselves (mirrors taliesin).
const COMPANY = 'Themisco'
const APP_DIR = 'Corvath'
const dataPath = join(app.getPath('appData'), COMPANY, APP_DIR)
const localAppData = process.env.LOCALAPPDATA ?? join(app.getPath('home'), 'AppData', 'Local')
app.setPath('userData', join(localAppData, COMPANY, APP_DIR))

const store = createStores(dataPath)

// Custom scheme for serving imported deck images to the renderer. Registered as
// privileged so it's treated as secure and usable from <img>/fetch under CSP.
protocol.registerSchemesAsPrivileged([
  { scheme: 'corvath-asset', privileges: { standard: true, secure: true, supportFetchAPI: true } }
])

const IMAGE_MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.svg': 'image/svg+xml'
}

// corvath-asset://img/<deckId>/<filename> → <dataPath>/decks/<deckId>/<filename>
async function handleAssetRequest(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url)
    const [deckId, ...rest] = url.pathname.replace(/^\/+/, '').split('/')
    const filePath = store.resolveImagePath(
      decodeURIComponent(deckId ?? ''),
      decodeURIComponent(rest.join('/'))
    )
    if (!filePath) return new Response('Not found', { status: 404 })
    const data = await readFile(filePath)
    const mime = IMAGE_MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream'
    return new Response(new Uint8Array(data), { headers: { 'content-type': mime } })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}

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

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.hybrasyl.corvath')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  protocol.handle('corvath-asset', handleAssetRequest)

  const seededAt = new Date().toISOString()
  await store.ensureDecksSeeded(seededAt)
  await store.ensureLayoutsSeeded(seededAt)

  // Readings + settings persistence
  ipcMain.handle('readings:getAll', () => store.loadReadings())
  ipcMain.handle('readings:save', (_e, readings: Reading[]) => store.saveReadings(readings))
  ipcMain.handle('settings:load', () => store.loadSettings())
  ipcMain.handle('settings:save', (_e, settings: Settings) => store.saveSettings(settings))

  // Decks persistence + image import
  ipcMain.handle('decks:getAll', () => store.loadDecks())
  ipcMain.handle('decks:save', (_e, decks: Deck[]) => store.saveDecks(decks))
  ipcMain.handle(
    'decks:saveImage',
    async (_e, deckId: string, cardId: string, ext: string, data: Uint8Array) => ({
      filename: await store.saveCardImage(deckId, cardId, ext, data)
    })
  )

  // Layouts persistence
  ipcMain.handle('layouts:getAll', () => store.loadLayouts())
  ipcMain.handle('layouts:save', (_e, layouts: Layout[]) => store.saveLayouts(layouts))

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
