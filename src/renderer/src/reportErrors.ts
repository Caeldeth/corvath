/**
 * Forward uncaught renderer errors to main, where they are scrubbed and logged
 * beside main's own.
 *
 * Installed once from `main.tsx`, at module scope — outside React, so
 * `<React.StrictMode>`'s double-invoked effects cannot register two listeners. The
 * `installed` flag makes a second call a no-op anyway, which is what a dev HMR
 * reload does.
 *
 * **Every path here is best effort and none of it may throw.** This is the code that
 * runs when something has already gone wrong; an exception raised out of it is a
 * second uncaught error, raised from the error handler, which is how a crash becomes
 * a loop. Hence the optional chaining on `window.api` — the bridge exists in the app
 * and does not exist in a bare jsdom — and the bare `catch` around each send.
 */

let installed = false
/** Kept only so the test reset can detach them; production never uninstalls. */
let listeners: { type: string; fn: EventListener }[] = []

export function installRendererErrorForwarding(): void {
  if (installed) return
  installed = true

  const on = (type: string, fn: EventListener): void => {
    listeners.push({ type, fn })
    window.addEventListener(type, fn)
  }

  on('error', ((event: ErrorEvent) => {
    const err = event.error as Error | undefined
    try {
      window.api?.diagnostics?.reportError({
        source: 'window.onerror',
        // `event.message` is the fallback because a cross-origin script error
        // arrives with no `error` object at all — "Script error." is little, but it
        // is the honest little.
        message: err?.message
          ? `${err.name || 'Error'}: ${err.message}`
          : String(event.message || 'Error'),
        stack: err?.stack
      })
    } catch {
      /* best effort */
    }
  }) as EventListener)

  on('unhandledrejection', ((event: PromiseRejectionEvent) => {
    const reason = event.reason
    const err = reason instanceof Error ? reason : null
    try {
      window.api?.diagnostics?.reportError({
        source: 'unhandledrejection',
        // A rejection reason need not be an Error. `String(reason)` is the honest
        // rendering of a rejected string or object, rather than a message shaped
        // like an Error that sends the reader looking for a stack there is none of.
        message: err ? `${err.name || 'Error'}: ${err.message}` : String(reason),
        stack: err?.stack
      })
    } catch {
      /* best effort */
    }
  }) as EventListener)
}

/**
 * Test-only: detach and allow a fresh install.
 *
 * It really removes the listeners rather than only clearing the flag. jsdom keeps
 * one `window` for a whole test file, so a reset that left them attached would have
 * every later case firing every earlier case's listener — and the one test that
 * asserts a SINGLE install would be the one it broke.
 */
export function _resetRendererErrorForwardingForTests(): void {
  for (const { type, fn } of listeners) window.removeEventListener(type, fn)
  listeners = []
  installed = false
}
