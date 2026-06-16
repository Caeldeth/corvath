# Corvath — Tarot Reading Recorder

A small Electron desktop app for recording tarot readings. Each **reading** is a session
(title, date, and deck) containing a list of **cards** — each with a topic, a question, and
the interpreted meaning, plus an optional drawn-card name and orientation.

A **deck builder** (Decks tab) defines the decks: structure-agnostic, so it handles standard
decks (Thoth, Rider-Waite-Smith — both seeded) and custom ones like the Hybrasyl deck with an
arbitrary number of major arcana and custom suit/court names. Each card can hold meanings,
keywords, and an imported image. The recorder's deck field offers the builder's deck names.

A **layout builder** (Layouts tab) defines spreads on a visual board: drag positions to
arrange them, name each slot, and mark crossing cards. Single Card, Three Card, Celtic Cross,
and Horseshoe ship seeded. Picking a layout in the recorder auto-fills one entry per position
and shows the spread diagram with the drawn cards.

Built with **electron-vite + React + TypeScript + MUI**, sharing the Hybrasyl theme system
(Hybrasyl / Danaan / Chadul / Grinneal) used across the other Dark Ages tools.

## Stack

- electron-vite (`src/main`, `src/preload`, `src/renderer`)
- React 18 + TypeScript
- MUI v7 with the four shared themes (`src/renderer/src/themes`)
- Cinzel / Cinzel Decorative / Crimson Pro fonts via `@fontsource`

## Data

Readings, decks, and settings are stored as JSON in the roaming app-data
directory, `%APPDATA%/Themisco/Corvath/` on Windows:

- `readings.json` — `{ version: 1, readings: Reading[] }`
- `decks.json` — `{ version: 1, decks: Deck[] }`
- `layouts.json` — `{ version: 1, layouts: Layout[] }`
- `settings.json` — `{ theme }`
- `decks/<deckId>/` — imported card images, served to the UI via the
  `corvath-asset://` protocol

Writes are crash-safe: each file is written to a `.tmp` sibling and atomically
renamed over the primary, the previous version is rotated to a `.bak.json`, and
a corrupt primary is automatically recovered from its backup on next load.

Disposable cache (Electron `userData`) lives separately in
`%LOCALAPPDATA%/Themisco/Corvath/`.

## Scripts

```sh
npm run dev        # launch in development (HMR)
npm run build      # type-check-free production build into out/
npm run typecheck  # tsc for main + renderer
npm run build:win  # package a Windows installer (electron-builder)
```

## Troubleshooting

Run the tools through npm (`npm run dev`, `npm run build`) — `electron-vite` is a local
dependency and isn't on your `PATH` as a bare command.

If `npm run dev` builds but no window appears, check for a leaked `ELECTRON_RUN_AS_NODE=1` in
your shell (some Electron-hosted terminals set it). It makes Electron run as plain Node. Clear
it and retry: `Remove-Item Env:ELECTRON_RUN_AS_NODE; npm run dev` (PowerShell) or
`unset ELECTRON_RUN_AS_NODE && npm run dev` (bash).
