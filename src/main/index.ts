import { app, shell, BrowserWindow, dialog, ipcMain, protocol } from 'electron'
import { join, extname } from 'path'
import { readFile } from 'fs/promises'
import { existsSync, mkdirSync, renameSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/corvath.png?asset'
import { createStores } from './store'
import { createSplashWindow } from './splash'
import { registerHandlers } from './handlers'

// Roaming settings + readings + decks live in %APPDATA%/Eriscorp/Corvath; the
// disposable cache (userData) goes in %LOCALAPPDATA%/Eriscorp/Corvath. Electron
// dropped getPath('cache'), so we resolve LOCALAPPDATA ourselves (mirrors taliesin).
const COMPANY = 'Eriscorp'
// Pre-1.0 builds stored data under the Themisco company dir; migrate it once.
const LEGACY_COMPANY = 'Themisco'
const APP_DIR = 'Corvath'
const localAppData = process.env.LOCALAPPDATA ?? join(app.getPath('home'), 'AppData', 'Local')

/**
 * One-time move of a pre-1.0 data directory from the old company folder to the
 * new one. Runs before the stores open. Only migrates when the new location is
 * absent and the legacy one exists, so it never clobbers current data and is a
 * no-op on every subsequent launch. Best-effort: a failure leaves the legacy
 * copy in place and the app simply starts fresh rather than crashing.
 */
function migrateLegacyDir(legacyDir: string, newDir: string): void {
  if (existsSync(newDir) || !existsSync(legacyDir)) return
  try {
    mkdirSync(join(newDir, '..'), { recursive: true })
    renameSync(legacyDir, newDir)
    console.log(`Migrated data: ${legacyDir} -> ${newDir}`)
  } catch (err) {
    console.error('Legacy data migration failed (starting fresh):', err)
  }
}

const dataPath = join(app.getPath('appData'), COMPANY, APP_DIR)
migrateLegacyDir(join(app.getPath('appData'), LEGACY_COMPANY, APP_DIR), dataPath)

const userDataPath = join(localAppData, COMPANY, APP_DIR)
migrateLegacyDir(join(localAppData, LEGACY_COMPANY, APP_DIR), userDataPath)
app.setPath('userData', userDataPath)

// Bundled (shipped) deck art lives in <appRoot>/bundled/decks/<deckId>/.
// __dirname is out/main in dev and inside the asar in production; both resolve
// to a readable bundled/ alongside the app.
const bundledDecksDir = join(__dirname, '../../bundled/decks')

const store = createStores(dataPath, bundledDecksDir)

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

// corvath-asset://img/<deckId>/<filename> — try the user's imported image
// first, then fall back to bundled (shipped) deck art.
async function handleAssetRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const [deckId, ...rest] = url.pathname.replace(/^\/+/, '').split('/')
  const id = decodeURIComponent(deckId ?? '')
  const filename = decodeURIComponent(rest.join('/'))
  const candidates = [
    store.resolveImagePath(id, filename),
    store.resolveBundledImagePath(id, filename)
  ]
  for (const filePath of candidates) {
    if (!filePath) continue
    try {
      const data = await readFile(filePath)
      const mime = IMAGE_MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream'
      // no-cache: Chromium revalidates instead of hard-caching, so a replaced
      // image (same URL, unchanged version) still refreshes.
      return new Response(new Uint8Array(data), {
        headers: { 'content-type': mime, 'cache-control': 'no-cache' }
      })
    } catch {
      /* try next candidate */
    }
  }
  return new Response('Not found', { status: 404 })
}

let mainWindow: BrowserWindow | null = null
let splashWindow: BrowserWindow | null = null

// Reveal the main window and dismiss the splash. Called once the renderer
// signals `app:ready` (first painted frame is already in the persisted theme),
// with a timeout backstop so a renderer failure can't leave the window hidden.
// Idempotent — the backstop and the IPC signal may both fire.
function revealMainWindow(): void {
  if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
    mainWindow.show()
  }
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.close()
  }
  splashWindow = null
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 940,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    icon,
    title: 'Corvath Tarot',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Keep the renderer's maximize/restore icon in sync with the actual state.
  mainWindow.on('maximize', () => mainWindow?.webContents.send('window:maximizeChange', true))
  mainWindow.on('unmaximize', () => mainWindow?.webContents.send('window:maximizeChange', false))

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
  electronApp.setAppUserModelId('co.eris.corvath')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  protocol.handle('corvath-asset', handleAssetRequest)

  // Show the splash immediately, before the (awaited) seed work and window load,
  // so the user gets instant feedback.
  splashWindow = createSplashWindow()

  const seededAt = new Date().toISOString()
  await store.ensureDecksSeeded(seededAt)
  await store.ensureLayoutsSeeded(seededAt)

  // All IPC channels (data persistence, image import/cleanup, window controls,
  // and the app:ready reveal handshake) live in handlers.ts. Reveal has a 15 s
  // backstop in case the renderer never signals.
  registerHandlers({ ipcMain, BrowserWindow, dialog }, { store, onAppReady: revealMainWindow })
  setTimeout(revealMainWindow, 15000)

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
