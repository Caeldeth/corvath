/**
 * IPC handler bodies as plain functions.
 *
 * Each data handler takes only its arguments (no IPC event), so tests can
 * import and call them directly. `registerHandlers` wires every handler to its
 * channel via the supplied `ipcMain` / `BrowserWindow`. Mutating handlers parse
 * their payload with a zod schema first — an invalid payload throws, which
 * rejects the `invoke` before anything touches disk.
 */
import type { IpcMain, BrowserWindow as BrowserWindowType } from 'electron'
import type { Deck, Layout, Reading, SavedImage, Settings } from '../shared/types'
import type { Stores } from './store'
import {
  decksSchema,
  layoutsSchema,
  readingsSchema,
  saveImageArgsSchema,
  settingsSchema
} from './schemas'

export interface HandlerContext {
  store: Stores
  /** Called once when the renderer signals `app:ready` (reveals the window). */
  onAppReady?: () => void
}

export const getReadings = (ctx: HandlerContext): Promise<Reading[]> => ctx.store.loadReadings()
// `async` so a schema-parse failure surfaces as a rejected promise (rejecting
// the invoke) rather than a synchronous throw at the call site.
export const saveReadings = async (ctx: HandlerContext, readings: unknown): Promise<void> =>
  ctx.store.saveReadings(readingsSchema.parse(readings))

export const getDecks = (ctx: HandlerContext): Promise<Deck[]> => ctx.store.loadDecks()
export const saveDecks = async (ctx: HandlerContext, decks: unknown): Promise<void> =>
  ctx.store.saveDecks(decksSchema.parse(decks))

export const getLayouts = (ctx: HandlerContext): Promise<Layout[]> => ctx.store.loadLayouts()
export const saveLayouts = async (ctx: HandlerContext, layouts: unknown): Promise<void> =>
  ctx.store.saveLayouts(layoutsSchema.parse(layouts))

export const loadSettings = (ctx: HandlerContext): Promise<Settings> => ctx.store.loadSettings()
export const saveSettings = async (ctx: HandlerContext, settings: unknown): Promise<void> =>
  ctx.store.saveSettings(settingsSchema.parse(settings))

export async function saveImage(
  ctx: HandlerContext,
  deckId: unknown,
  cardId: unknown,
  ext: unknown,
  data: unknown
): Promise<SavedImage> {
  const args = saveImageArgsSchema.parse({ deckId, cardId, ext, data })
  return { filename: await ctx.store.saveCardImage(args.deckId, args.cardId, args.ext, args.data) }
}

export const deleteImage = (ctx: HandlerContext, deckId: string, cardId: string): Promise<void> =>
  ctx.store.deleteCardImage(deckId, cardId)

export const deleteDeckImages = (ctx: HandlerContext, deckId: string): Promise<void> =>
  ctx.store.deleteDeckImages(deckId)

interface RegisterDeps {
  ipcMain: IpcMain
  BrowserWindow: typeof BrowserWindowType
}

/** Wire every IPC channel to its handler. */
export function registerHandlers(
  { ipcMain, BrowserWindow }: RegisterDeps,
  ctx: HandlerContext
): void {
  // Readings + settings persistence
  ipcMain.handle('readings:getAll', () => getReadings(ctx))
  ipcMain.handle('readings:save', (_e, readings) => saveReadings(ctx, readings))
  ipcMain.handle('settings:load', () => loadSettings(ctx))
  ipcMain.handle('settings:save', (_e, settings) => saveSettings(ctx, settings))

  // Decks persistence + image import/cleanup
  ipcMain.handle('decks:getAll', () => getDecks(ctx))
  ipcMain.handle('decks:save', (_e, decks) => saveDecks(ctx, decks))
  ipcMain.handle('decks:saveImage', (_e, deckId, cardId, ext, data) =>
    saveImage(ctx, deckId, cardId, ext, data)
  )
  ipcMain.handle('decks:deleteImage', (_e, deckId, cardId) => deleteImage(ctx, deckId, cardId))
  ipcMain.handle('decks:deleteDeckImages', (_e, deckId) => deleteDeckImages(ctx, deckId))

  // Layouts persistence
  ipcMain.handle('layouts:getAll', () => getLayouts(ctx))
  ipcMain.handle('layouts:save', (_e, layouts) => saveLayouts(ctx, layouts))

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

  // Reveal handshake: the renderer signals once it has hydrated.
  ipcMain.once('app:ready', () => ctx.onAppReady?.())
}
