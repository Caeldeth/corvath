import { describe, expect, it } from 'vitest'
import { isSafeExternalUrl } from '../externalUrl'

describe('isSafeExternalUrl — allowed schemes', () => {
  it.each(['http://example.com', 'https://example.com/x?y=1#z', 'mailto:someone@example.com'])(
    'allows %s',
    (url) => {
      expect(isSafeExternalUrl(url)).toBe(true)
    }
  )
})

describe('isSafeExternalUrl — refused schemes', () => {
  // Each of these is honoured by shell.openExternal, which is the whole reason
  // the gate exists: file/smb open a local or network path, javascript/data are
  // script carriers, and a custom scheme launches whatever handler is registered.
  it.each([
    'file:///C:/Windows/System32/calc.exe',
    'smb://attacker.example.com/share',
    'ms-msdt:/id PCWDiagnostic',
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'corvath-asset://img/deck/card.webp',
    'vscode://file/etc/passwd'
  ])('refuses %s', (url) => {
    expect(isSafeExternalUrl(url)).toBe(false)
  })
})

describe('isSafeExternalUrl — malformed input is refused, not repaired', () => {
  it.each(['', 'example.com', 'not a url', '://missing-scheme', 'http:'])('refuses %s', (url) => {
    expect(isSafeExternalUrl(url)).toBe(false)
  })

  it('refuses a scheme that merely starts with an allowed one', () => {
    // `https-evil:` must not pass a naive startsWith check.
    expect(isSafeExternalUrl('https-evil://example.com')).toBe(false)
  })
})
