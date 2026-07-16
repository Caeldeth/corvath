# E2E (Playwright + Electron)

End-to-end specs that drive the **built** app via Playwright's `_electron` launcher — the
house standard for cross-boundary behavior Vitest can't reach (disk round-trips, real window
geometry, full themed renders). Full rationale + patterns:
`Comhaigne/docs/architecture/e2e-playwright-electron.md`.

## Running

```bash
npm run e2e        # builds (electron-vite) then runs all specs
npm run e2e:only   # runs specs against the existing out/ build
```

Local-only for now. CI would need a virtual display (headed/xvfb), so this isn't in the
`release.yml` validate job yet.

## What's here

- **`helpers.js`** — the reusable harness:
  - `launchApp({ seedSettings?, localAppData? })` — launches the built app, strips
    `ELECTRON_RUN_AS_NODE`, and redirects `%LOCALAPPDATA%` to a temp dir so runs are hermetic.
    Reuse `localAppData` across two launches to test persistence.
  - `getMainWindow(app, { bridge? })` — skips the splash and returns the real main window. It
    finds it by the `window.electron` toolkit bridge (present on every sibling's preload, absent
    on the splash), so it needs **no per-app change**. Override `bridge` only if you both rename
    `window.api` _and_ drop the toolkit bridge.
  - `readGeometry(app, page, selector?)` — native window bounds + a DOM element's on-screen
    left edge, for measuring layout/offsets (see the offset-spec pattern in the house doc).
- **`app-boot.spec.js`** — smoke: splash → main window revealed → hydrated UI on screen, all
  four tabs present, and the built-in decks/layouts seeded on a first run.
- **`settings-persistence.spec.js`** — change theme → wait for the write to hit disk →
  relaunch same userData → assert it hydrated. The full renderer → IPC → disk → reload loop.
- **`theme-switch.spec.js`** — cycle all six themes; each must apply (`data-theme`), repaint,
  and raise no `pageerror`. Catches a theme wired into the picker but missing from the themes
  map or main's `THEME_NAMES`, which otherwise fails silently.

## Testids the harness depends on

`getMainWindow` waits for `[data-testid="app-root"]`, so these must stay put:

- `app-root` (+ its `data-theme`) and `app-hydrating` — `src/renderer/src/App.tsx`.
- `title-bar` and `theme-select` — `src/renderer/src/components/TitleBar.tsx`.

## Gotchas

1. `ELECTRON_RUN_AS_NODE` set in env → Electron boots as plain Node and crashes at
   `app.setPath`. `launchApp` strips it.
2. Splash window → `firstWindow()` can grab it. `getMainWindow` selects by the preload bridge.
3. Main window is hidden until the renderer signals `app:ready` → wait for `isVisible()`.
4. Test the **built** app; rebuild after any `src/` change (`npm run e2e` does `build &&` first).
