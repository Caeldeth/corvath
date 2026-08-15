import { describe, expect, it } from 'vitest'
import { parseDefaultId, parseDrawMode, resolveDefault } from '../settingsFields'

// The trap this module exists for: the store debounce-saves the WHOLE settings
// document, and main rejects the WHOLE payload if one field fails to parse. So a
// single bad value stops corvath persisting anything at all — the theme included
// — with no symptom but a console line nobody has open.

describe('parseDefaultId', () => {
  it('accepts an ordinary id', () => {
    expect(parseDefaultId('rws')).toEqual({ ok: true, value: 'rws' })
  })

  it('treats absent, empty and whitespace as "no default"', () => {
    // Clearing a default is a legitimate act. A control the user cannot un-set is
    // a worse bug than the one this guards against.
    expect(parseDefaultId(undefined)).toEqual({ ok: true, value: undefined })
    expect(parseDefaultId(null)).toEqual({ ok: true, value: undefined })
    expect(parseDefaultId('')).toEqual({ ok: true, value: undefined })
    expect(parseDefaultId('   ')).toEqual({ ok: true, value: undefined })
  })

  it('trims, so a hand-edited settings.json cannot store a padded id', () => {
    expect(parseDefaultId('  argent  ')).toEqual({ ok: true, value: 'argent' })
  })

  it('refuses a value that would fail settingsSchema', () => {
    // Refusing here is what keeps it out of the store, which is what keeps the
    // whole document saveable.
    expect(parseDefaultId('x'.repeat(201))).toEqual({ ok: false })
    expect(parseDefaultId(42)).toEqual({ ok: false })
    expect(parseDefaultId({ id: 'rws' })).toEqual({ ok: false })
  })

  it('accepts a value exactly at the bound', () => {
    expect(parseDefaultId('x'.repeat(200))).toEqual({ ok: true, value: 'x'.repeat(200) })
  })
})

describe('parseDrawMode', () => {
  it('accepts the two real modes', () => {
    expect(parseDrawMode('deal')).toEqual({ ok: true, value: 'deal' })
    expect(parseDrawMode('fan')).toEqual({ ok: true, value: 'fan' })
  })

  it('treats absent and empty as "no default"', () => {
    expect(parseDrawMode(undefined)).toEqual({ ok: true, value: undefined })
    expect(parseDrawMode('')).toEqual({ ok: true, value: undefined })
  })

  it('refuses anything else', () => {
    expect(parseDrawMode('shuffle')).toEqual({ ok: false })
    expect(parseDrawMode(1)).toEqual({ ok: false })
  })
})

describe('resolveDefault', () => {
  const decks = [{ id: 'rws' }, { id: 'argent' }]

  it('finds the item a default names', () => {
    expect(resolveDefault(decks, 'argent')).toEqual({ id: 'argent' })
  })

  it('returns undefined for an id that no longer exists', () => {
    // The case that actually happens: the user set a default and then deleted
    // the deck. It must read as "no default", not as an empty picker.
    expect(resolveDefault(decks, 'deleted-deck')).toBeUndefined()
  })

  it('returns undefined when there is no default', () => {
    expect(resolveDefault(decks, undefined)).toBeUndefined()
    expect(resolveDefault(decks, '')).toBeUndefined()
  })

  it('copes with an empty list', () => {
    expect(resolveDefault([], 'rws')).toBeUndefined()
  })
})
