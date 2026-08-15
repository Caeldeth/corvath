/**
 * The style constants every Settings card uses.
 *
 * Extracted on the FIRST card rather than the fifth, deliberately. Balor pulled
 * this module out only after five copies had already drifted and one of them had
 * repeated a real bug (HTOO-271), and its own note says to copy it early. There
 * are two cards here today; the settings roster in `00a-backlog.md` is where the
 * rest arrive from.
 */

export const cardSx = {
  p: 3,
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
} as const

/**
 * `text.primary`, and **this is a deliberate divergence from balor's copy.**
 *
 * Balor uses `text.headline`, a token from the house EXTENDED palette. Corvath
 * never adopted that — it has no `augmentation.ts` and no theme here defines
 * `headline`. Copied verbatim, the token resolves to nothing, MUI passes the
 * literal string through as a CSS colour, the declaration is dropped, and the
 * heading silently inherits body colour in all six themes. That is a copy that
 * looks right in review and is wrong on screen.
 *
 * The rule balor's note is really protecting still applies: do **not** reach for
 * `text.button`. That is the colour of text sitting ON a filled button, so a
 * light theme with filled buttons sets it to white — invisible as a heading on a
 * light Paper. Mundanes is corvath's only light theme, so it is the only one
 * that would show the mistake (HTOO-271).
 */
export const cardHeadingSx = { color: 'text.primary', fontWeight: 'bold' } as const

export const cardDescSx = { color: 'text.secondary', mb: 2 } as const
