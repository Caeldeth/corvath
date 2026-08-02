// Renderer-boundary hardening. Adapted from dagda's `windowSecurity.ts` (itself
// from mabon's WP18 pass, which answered a real static audit). Three apps found
// the same scaffold-inherited holes; corvath grew from the same skeleton, so it
// had them too.
//
// Three protections, kept in ONE place so the policy is single-sourced and
// auditable rather than scattered across window constructors:
//
//   1. hardenWindow() — deny top-level navigation away from our own content, and
//      deny every child window. The main window still hands *validated* external
//      URLs to the OS; the splash opens nothing.
//   2. guardIpc()     — wrap ipcMain so every handler rejects an IPC whose sender
//      is not the top frame of a known corvath window at our own location.
//   3. Trusted-window registration, so an unexpected webContents cannot reach the
//      handler registry just by existing.
//
// Two things dagda has that corvath does not, and why they are absent rather than
// forgotten: there is no `hardenWebviews` (corvath never sets `webviewTag`, so no
// <webview> can attach), and there are no window ROLES (corvath's only other
// window is the splash, which loads with no preload and therefore has no bridge
// to send IPC over at all).
//
// This is a SECOND gate, independent of payload validation. The zod schemas in
// `schemas/` still parse every mutating payload; nothing here replaces that.

import type { BrowserWindow, IpcMain, IpcMainEvent, IpcMainInvokeEvent } from 'electron'
import { pathToFileURL } from 'url'
import { isSafeExternalUrl } from '../shared/externalUrl'

/**
 * Reduce a URL to the key we compare on: scheme, host and path, with query and
 * hash dropped.
 *
 * **Not `origin`.** The WHATWG parser returns the opaque origin `"null"` for
 * every `file:` URL, so an `origin` comparison is `"null" === "null"` in a
 * packaged build — it contributes nothing, leaving the path as the only
 * discriminator. That is enough to trust a remote host: `file://evil.example.com/
 * C:/Program Files/Corvath/…/index.html` carries our exact pathname, and both
 * origins are `"null"`. Comparing `host` explicitly is what closes it, and the
 * empty host of a local `file:` URL still distinguishes it from a UNC one.
 */
function locationKey(url: URL): string {
  return `${url.protocol}//${url.host}${url.pathname}`
}

/** Locations we consider "our own content", as `locationKey` strings. Set once at
 *  boot by `initWindowSecurity`. Empty until then, which fails closed: before
 *  init, nothing is trusted. */
let trustedLocations: string[] = []

/** webContents ids for windows we constructed. An IPC from a webContents absent
 *  from this set is rejected outright. */
const trustedWindows = new Set<number>()

/**
 * Record the renderer locations we trust. Call once at boot, before any window
 * loads. `devUrl` is `ELECTRON_RENDERER_URL` in dev (undefined in production);
 * `prodIndexHtml` is the absolute path to the packaged `renderer/index.html`.
 */
export function initWindowSecurity(devUrl: string | undefined, prodIndexHtml: string): void {
  const locations: string[] = []
  if (devUrl) {
    try {
      locations.push(locationKey(new URL(devUrl)))
    } catch {
      /* malformed dev URL — leave it out and fail closed */
    }
  }
  // pathToFileURL, never string concatenation: a path with a space, `#` or a
  // non-ASCII character produces a different file URL than the naive form, and a
  // trusted location that never matches is a lockout, not a safety margin.
  // (Corvath installs under "Program Files" and users have spaces in profile
  // names, so this is the ordinary case here, not the exotic one.)
  locations.push(locationKey(pathToFileURL(prodIndexHtml)))
  trustedLocations = locations
}

/** True when `rawUrl` points at our own renderer content. Remote pages,
 *  `about:blank` and malformed URLs are all untrusted. */
function isTrustedLocation(rawUrl: string): boolean {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return false
  }
  const key = locationKey(url)
  return trustedLocations.some((l) => l === key)
}

/**
 * Register a window we created, so its IPC is accepted. Forgotten when its
 * webContents is destroyed, so a stale id cannot authorize a future one that
 * Electron happens to reuse.
 */
export function registerTrustedWindow(win: BrowserWindow): void {
  const id = win.webContents.id
  trustedWindows.add(id)
  win.webContents.once('destroyed', () => trustedWindows.delete(id))
}

/**
 * Deny top-level navigation and every child window.
 *
 * `allowExternal` is true only for the main window, where a link meant for the
 * user's browser should still get there. The splash passes false: it opens
 * nothing and navigates nowhere.
 */
export function hardenWindow(
  win: BrowserWindow,
  opts: { allowExternal: boolean; openExternal: (url: string) => void }
): void {
  win.webContents.setWindowOpenHandler((details) => {
    if (opts.allowExternal && isSafeExternalUrl(details.url)) opts.openExternal(details.url)
    return { action: 'deny' }
  })
  win.webContents.on('will-navigate', (event, url) => {
    if (isTrustedLocation(url)) return // our own content — e.g. a dev HMR full reload
    event.preventDefault()
    if (opts.allowExternal && isSafeExternalUrl(url)) opts.openExternal(url)
  })
}

/**
 * The authority check: accept an IPC only from the top frame of a known corvath
 * window at one of our own locations. Exported for direct unit testing.
 */
export function isSenderAllowed(event: IpcMainInvokeEvent | IpcMainEvent): boolean {
  const contents = event.sender
  if (contents.isDestroyed()) return false
  if (!trustedWindows.has(contents.id)) return false
  // Must be the window's own top frame: an iframe inheriting the preload must not
  // reach a privileged channel.
  const frame = event.senderFrame
  if (!frame || frame !== contents.mainFrame) return false
  return isTrustedLocation(frame.url)
}

/**
 * Wrap `ipcMain` so `.handle` / `.on` / `.once` reject an untrusted sender before
 * the real handler runs. An `invoke` rejection surfaces as an error in the
 * renderer; a fire-and-forget `.on` / `.once` is dropped silently.
 *
 * Installed at the single `registerHandlers` call site, so every channel is
 * covered by construction — a new handler cannot forget to opt in.
 *
 * **`once` is guarded here and is NOT in dagda's version.** Corvath registers the
 * `app:ready` reveal handshake with `ipcMain.once`, which would otherwise fall
 * through the proxy to the raw method and be reachable by any sender. Guarding it
 * also means a rejected `once` does not consume the registration — the listener
 * stays armed for the legitimate sender instead of being burned by the first
 * untrusted caller.
 */
export function guardIpc(ipcMain: IpcMain): IpcMain {
  const wrappers = new WeakMap<(...args: never[]) => void, (...args: never[]) => void>()

  return new Proxy(ipcMain, {
    get(target, prop, receiver) {
      if (prop === 'handle') {
        return (
          channel: string,
          listener: (event: IpcMainInvokeEvent, ...args: unknown[]) => unknown
        ): void => {
          target.handle(channel, (event, ...args) => {
            if (!isSenderAllowed(event)) {
              throw new Error(`IPC "${channel}" rejected: untrusted sender`)
            }
            return listener(event, ...args)
          })
        }
      }
      if (prop === 'on') {
        return (
          channel: string,
          listener: (event: IpcMainEvent, ...args: unknown[]) => void
        ): IpcMain => {
          const wrapped = (event: IpcMainEvent, ...args: unknown[]): void => {
            if (!isSenderAllowed(event)) return
            listener(event, ...args)
          }
          wrappers.set(listener as never, wrapped as never)
          target.on(channel, wrapped)
          return receiver as IpcMain
        }
      }
      if (prop === 'once') {
        return (
          channel: string,
          listener: (event: IpcMainEvent, ...args: unknown[]) => void
        ): IpcMain => {
          // Re-arm on rejection rather than using target.once, so an untrusted
          // sender cannot consume the one-shot registration.
          const wrapped = (event: IpcMainEvent, ...args: unknown[]): void => {
            if (!isSenderAllowed(event)) return
            target.removeListener(channel, wrapped as (...a: unknown[]) => void)
            listener(event, ...args)
          }
          wrappers.set(listener as never, wrapped as never)
          target.on(channel, wrapped)
          return receiver as IpcMain
        }
      }
      // `.on`/`.once` register a wrapper, so removal has to be remapped or it
      // silently removes nothing.
      if (prop === 'off' || prop === 'removeListener') {
        return (channel: string, listener: (...args: never[]) => void): IpcMain => {
          const wrapped = wrappers.get(listener as never) ?? listener
          target.removeListener(channel, wrapped as (...args: unknown[]) => void)
          return receiver as IpcMain
        }
      }
      const value = Reflect.get(target, prop, receiver)
      return typeof value === 'function' ? value.bind(target) : value
    }
  })
}

/** Test-only reset, so suites do not leak trusted windows or locations between
 *  cases. */
export function __resetWindowSecurityForTests(): void {
  trustedLocations = []
  trustedWindows.clear()
}
