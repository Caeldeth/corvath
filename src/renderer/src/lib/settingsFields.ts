import type { DrawMode } from '../../../shared/types'

/**
 * Screen a settings value before it reaches the store.
 *
 * **Why this module exists, and why it exists now rather than at the fifth
 * setting.** Two traps sit under corvath's settings, and both bite on the second
 * setting rather than the first:
 *
 * 1. `settings:save` parses through a plain object schema, so a field the UI
 *    writes but `settingsSchema` does not name is stripped on every save with no
 *    error. The answer to that one is "add the schema field first", not code.
 * 2. The store debounce-saves the WHOLE document, and main rejects the WHOLE
 *    payload if one field fails to parse. So one bad value stops corvath
 *    persisting anything at all — the theme included — with no symptom but a
 *    console line nobody has open.
 *
 * A theme is a closed enum and cannot produce a bad value. A deck or spread id is
 * a free string, which is exactly the case balor's note says to copy this module
 * for. Everything here is pure and returns a result rather than throwing, so only
 * a value that will survive `settingsSchema` ever reaches the store.
 */

export type FieldResult<T> = { ok: true; value: T } | { ok: false }

/** Must match `defaultIdSchema` in `src/main/schemas/index.ts`. */
const MAX_ID_LEN = 200

/**
 * A deck or spread id, or `undefined` for "no default".
 *
 * Clearing a default is a legitimate act, so `undefined` and `''` both mean "no
 * default" and both succeed — a control the user cannot un-set is a worse bug
 * than the one this guards.
 */
export function parseDefaultId(raw: unknown): FieldResult<string | undefined> {
  if (raw === undefined || raw === null) return { ok: true, value: undefined }
  if (typeof raw !== 'string') return { ok: false }
  const value = raw.trim()
  if (!value) return { ok: true, value: undefined }
  if (value.length > MAX_ID_LEN) return { ok: false }
  return { ok: true, value }
}

const DRAW_MODES: DrawMode[] = ['deal', 'fan']

/** A draw mode, or `undefined` for "no default". A closed enum, so this is a
 *  membership test rather than a bound. */
export function parseDrawMode(raw: unknown): FieldResult<DrawMode | undefined> {
  if (raw === undefined || raw === null || raw === '') return { ok: true, value: undefined }
  return DRAW_MODES.includes(raw as DrawMode) ? { ok: true, value: raw as DrawMode } : { ok: false }
}

/**
 * Resolve a stored default against what still exists.
 *
 * A deck or spread the default points at can be deleted between launches, so a
 * dangling id reads as "no default" rather than as an error or an empty picker.
 */
export function resolveDefault<T extends { id: string }>(
  items: T[],
  id: string | undefined
): T | undefined {
  if (!id) return undefined
  return items.find((item) => item.id === id)
}
