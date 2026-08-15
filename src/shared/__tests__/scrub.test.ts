import { describe, expect, it } from 'vitest'
import { scrubText } from '../scrub'

// Written for corvath rather than copied from balor's, because the two apps leak
// different things. Balor's suite is mostly about git credentials; corvath spawns
// nothing and holds no token. What corvath's logs actually carry is PATHS — the
// data directory, a deck's image folder, a file the user picked from a dialog —
// so that is what these lean on.

describe('paths, which is what corvath actually leaks', () => {
  it('collapses a deep Windows path to its basename', () => {
    // The whole local directory structure goes with the username, in one pass.
    const out = scrubText(
      'ENOENT: C:\\Users\\alice\\AppData\\Local\\Erisco\\Corvath\\decks\\rws\\maj-0.jpg'
    )
    expect(out).toBe('ENOENT: …\\maj-0.jpg')
    expect(out).not.toContain('alice')
  })

  it('collapses a deep POSIX path to its basename', () => {
    const out = scrubText('failed reading /home/alice/.config/Erisco/Corvath/decks.json')
    expect(out).toBe('failed reading …/decks.json')
    expect(out).not.toContain('alice')
  })

  it('redacts a short account path the collapse cannot reach', () => {
    expect(scrubText('home is C:\\Users\\alice')).toBe('home is C:\\Users\\<user>')
    expect(scrubText('home is /home/alice')).toBe('home is /home/<user>')
  })

  it('leaves a URL path alone', () => {
    // The lookbehind exists for this: a releases URL is not a filesystem path,
    // and mangling it would hide which endpoint failed.
    const out = scrubText('GET https://api.github.com/repos/hybrasyl/corvath/releases failed')
    expect(out).toContain('https://api.github.com/repos/hybrasyl/corvath/releases')
  })

  it('redacts an explicit home directory anywhere it appears', () => {
    // The case the path SHAPES miss: an install that lives nowhere near
    // /home or C:\Users.
    const out = scrubText('opened D:\\corvath-portable\\data', { homeDir: 'D:\\corvath-portable' })
    expect(out).toContain('<HOME>')
    expect(out).not.toContain('corvath-portable')
  })
})

describe('people', () => {
  it('redacts emails and IPv4 addresses', () => {
    expect(scrubText('mail alice@example.com from 192.168.1.44')).toBe('mail <email> from <ip>')
  })

  it('redacts a bare username token', () => {
    expect(scrubText('user alice signed in', { userName: 'alice' })).toBe('user <user> signed in')
  })

  it('ignores a username too short to be unambiguous', () => {
    // "al" inside "also" would make the block unreadable, and a diagnostics
    // block nobody can read is worse than one naming an account.
    expect(scrubText('also, alpaca', { userName: 'al' })).toBe('also, alpaca')
  })
})

describe('credentials — kept as cheap insurance, not because corvath has any', () => {
  it("keeps a URL's host while dropping its userinfo", () => {
    // Redacted, and still an answer to "which endpoint".
    expect(scrubText('GET https://user:secret@api.example.com/x')).toBe(
      'GET https://<redacted>@api.example.com/x'
    )
  })

  it('keeps an auth scheme while dropping the value', () => {
    // A 401 still says which KIND of credential was refused.
    expect(scrubText('Authorization: Bearer abc.def.ghi')).toBe('Authorization: Bearer <redacted>')
  })

  it('drops the value of an assignment whose name says it is a secret', () => {
    expect(scrubText('GH_TOKEN=abc123 in env')).toBe('GH_TOKEN=<redacted> in env')
    expect(scrubText('MY_API_KEY = xyz')).toBe('MY_API_KEY = <redacted>')
  })
})

describe('the contract the rest of the module depends on', () => {
  it('is idempotent, so the insurance pass in buildDiagnostics changes nothing', () => {
    const once = scrubText('C:\\Users\\alice\\x\\y\\z.json and alice@example.com')
    expect(scrubText(once)).toBe(once)
  })

  it('returns non-strings and empty strings untouched rather than throwing', () => {
    // It runs from an error handler. A throw here is a second uncaught error
    // raised while reporting the first.
    expect(scrubText('')).toBe('')
    expect(scrubText(undefined as unknown as string)).toBe(undefined)
  })

  it('leaves an ordinary message readable', () => {
    // Scrubbing that eats the message defeats the purpose of collecting it.
    const msg = 'TypeError: Cannot read properties of undefined (reading tarotApi)'
    expect(scrubText(msg)).toBe(msg)
  })
})
