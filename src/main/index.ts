import { app, shell, BrowserWindow, dialog, ipcMain, protocol } from 'electron'
import { join, extname } from 'path'
import { readFile } from 'fs/promises'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
// 256px PNG32, not the 1254px master — this is the window/taskbar icon, and the
// master is build-time only (electron-builder reads it from build/icon.png).
import icon from '../../resources/corvath-icon-256.png?asset'
import { createStores } from './store'
import { createSplashWindow } from './splash'
import { registerHandlers } from './handlers'
import { checkForUpdate } from './updateCheck'
import { guardIpc, hardenWindow, initWindowSecurity, registerTrustedWindow } from './windowSecurity'

// Everything — readings, decks, settings, and the disposable Electron cache —
// lives under %LOCALAPPDATA%/Erisco/Corvath. On Windows Electron's appData path
// is the ROAMING dir, so we resolve %LOCALAPPDATA% ourselves; macOS/Linux have no
// roaming concept and appData is already local (mirrors hyb-electron-template).
const COMPANY = 'Erisco'
const APP_DIR = 'Corvath'
const localAppData =
  process.platform === 'win32'
    ? (process.env.LOCALAPPDATA ?? join(app.getPath('home'), 'AppData', 'Local'))
    : app.getPath('appData')

const dataPath = join(localAppData, COMPANY, APP_DIR)
app.setPath('userData', dataPath)

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
      // Checked, not assumed. The preload uses no node built-ins, but that alone
      // does NOT make it sandbox-safe: externalizeDepsPlugin was leaving
      // `require("@electron-toolkit/preload")` in the built output, and a
      // sandboxed preload can only require electron. The vite preload config now
      // bundles that package instead of externalizing it, so `require("electron")`
      // is all that remains — verified against out/preload/index.js.
      sandbox: true
    }
  })

  // Trusted before anything loads, so the first IPC from this window is accepted
  // and nothing else is.
  registerTrustedWindow(mainWindow)
  hardenWindow(mainWindow, {
    allowExternal: true,
    openExternal: (url) => void shell.openExternal(url)
  })

  // Keep the renderer's maximize/restore icon in sync with the actual state.
  mainWindow.on('maximize', () => mainWindow?.webContents.send('window:maximizeChange', true))
  mainWindow.on('unmaximize', () => mainWindow?.webContents.send('window:maximizeChange', false))

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

  // Establish what counts as "our own content" BEFORE any window loads. Until
  // this runs the trusted set is empty, which fails closed.
  initWindowSecurity(
    is.dev ? process.env['ELECTRON_RENDERER_URL'] : undefined,
    join(__dirname, '../renderer/index.html')
  )

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
  // guardIpc wraps ipcMain once, here — every channel registered inside
  // registerHandlers is covered by construction, so a new handler cannot forget
  // to validate its sender.
  registerHandlers(
    { ipcMain: guardIpc(ipcMain), BrowserWindow, dialog },
    { store, onAppReady: revealMainWindow }
  )
  setTimeout(revealMainWindow, 15000)

  createWindow()

  // Best-effort update notification. The fetch latency comfortably outlasts the
  // renderer mount, but gate on load anyway so the message isn't sent into a
  // page that hasn't registered its listener yet.
  void checkForUpdate(app.getVersion()).then((info) => {
    if (!info || !mainWindow || mainWindow.isDestroyed()) return
    const send = (): void => mainWindow?.webContents.send('update:available', info)
    if (mainWindow.webContents.isLoading()) mainWindow.webContents.once('did-finish-load', send)
    else send()
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
