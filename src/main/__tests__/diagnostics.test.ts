import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFile } from 'fs/promises'
import { join } from 'path'
import os from 'os'
import { buildDiagnostics, copyReport, openIssue, MAX_URL_LEN } from '../diagnostics'
import { captureError, _resetSessionLogForTests } from '../sessionLog'
import type { DiagnosticsIo } from '../diagnostics'

/**
 * The clipboard and the browser are injected, so every claim about ORDER — the
 * clipboard gets the full body, and gets it before the browser is asked for anything
 * — is a plain assertion on two spies. That is the payoff for keeping this module
 * free of a runtime electron import, and it is the property the whole feature rests
 * on: the report survives every way the browser step can fail.
 */
function fakeIo(): DiagnosticsIo & { calls: string[] } {
  const calls: string[] = []
  return {
    calls,
    writeClipboard: vi.fn((text: string) => {
      calls.push(`clipboard:${text.length}`)
    }),
    openExternal: vi.fn(() => {
      calls.push('open')
    })
  }
}

beforeEach(() => _resetSessionLogForTests())
afterEach(() => _resetSessionLogForTests())

describe('buildDiagnostics', () => {
  it('names the product and the version it was given', () => {
    const block = buildDiagnostics('1.2.3')
    expect(block).toContain('App: Corvath 1.2.3')
  })

  it('reports a coarse OS family and nothing narrower', () => {
    const block = buildDiagnostics('1.2.3')
    expect(block).toMatch(/^OS: (windows|macOS|linux|other)$/m)
    // Never the build, the version or the architecture — each narrows an individual
    // machine down rather than describing a class of them.
    expect(block).not.toContain(os.release())
    expect(block).not.toContain(process.arch)
  })

  it('says so when nothing was captured', () => {
    expect(buildDiagnostics('1.2.3')).toContain('No errors captured this session.')
  })

  it('carries the sessions captured errors, already scrubbed', () => {
    captureError({ source: 'react', origin: 'renderer', message: 'Error: boom' })
    const block = buildDiagnostics('1.2.3')
    expect(block).toContain('[react] renderer :: Error: boom')
  })

  it('scrubs the assembled block a second time', () => {
    // Idempotent insurance. It is also where `productName` and the OS family join
    // text that came out of an error message, so the pass is over the finished
    // thing rather than over its parts.
    captureError({ message: 'at /home/somebody/Erisco/Corvath/decks/rws/maj-0.jpg' })
    const block = buildDiagnostics('1.2.3')
    expect(block).not.toContain('/home/somebody')
  })

  it('never reads the token store', async () => {
    // WP10's constraint, asserted structurally because it is a claim about what the
    // module does NOT do — and there is no input that would demonstrate it. The
    // diagnostics bundle must never read `auth.dat`, so no file in the module may
    // name it or import the store that owns it.
    const files = ['diagnostics.ts', 'sessionLog.ts', 'errorHandlers.ts']
    for (const f of files) {
      const src = await readFile(join(__dirname, '..', f), 'utf-8')
      // Comments stripped first: this file's own rule is that a file documenting an
      // invariant grep must not reproduce its pattern, and the modules discuss the
      // constraint in prose.
      const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
      expect(code).not.toContain('auth' + '.dat')
      expect(code).not.toContain('tokenStore')
    }
  })
})

describe('openIssue', () => {
  const body = 'What happened\n\n```\nApp: Corvath 1.2.3\n```'

  it('copies the FULL body before it opens anything', () => {
    const io = fakeIo()
    openIssue(io, { title: 'Broken', body })
    expect(io.writeClipboard).toHaveBeenCalledWith(body)
    // Order, not just occurrence. A version that opened first and copied after would
    // pass a `toHaveBeenCalled` pair and lose the report on any throw between them.
    expect(io.calls).toEqual([`clipboard:${body.length}`, 'open'])
  })

  it('opens the intake repository with the app label', () => {
    const io = fakeIo()
    const result = openIssue(io, { title: 'Broken', body })
    expect(result).toEqual({ ok: true, truncated: false })
    const url = vi.mocked(io.openExternal).mock.calls[0][0]
    expect(url).toContain('https://github.com/hybrasyl/cernunnos/issues/new')
    expect(url).toContain('labels=app%3Acorvath')
  })

  it('sends the title it was given', () => {
    const io = fakeIo()
    openIssue(io, { title: 'Push button does nothing', body })
    const url = new URL(vi.mocked(io.openExternal).mock.calls[0][0])
    expect(url.searchParams.get('title')).toBe('Push button does nothing')
  })

  it('truncates the URL but never the clipboard', () => {
    const io = fakeIo()
    const long = 'x'.repeat(20_000)
    const result = openIssue(io, { title: 'Long', body: long })
    expect(result).toEqual({ ok: true, truncated: true })
    // The whole design in one assertion: the link is trimmed to something the OS
    // will open, and the user still holds every byte.
    expect(io.writeClipboard).toHaveBeenCalledWith(long)
    expect(vi.mocked(io.openExternal).mock.calls[0][0].length).toBeLessThanOrEqual(MAX_URL_LEN)
  })

  it('cannot have a separator injected through the body', () => {
    const io = fakeIo()
    openIssue(io, { title: 'x', body: '&labels=app:oghma&title=hijacked' })
    const url = new URL(vi.mocked(io.openExternal).mock.calls[0][0])
    // The reason a body is not a fourth input shape: the encoder is total, so prose
    // cannot become a parameter. Corvath's own label is the only one applied.
    expect(url.searchParams.getAll('labels')).toEqual(['app:corvath'])
    expect(url.searchParams.get('title')).toBe('x')
  })
})

describe('copyReport', () => {
  it('copies the body and nothing else happens', () => {
    const io = fakeIo()
    expect(copyReport(io, { body: 'the whole report' })).toEqual({ ok: true })
    expect(io.writeClipboard).toHaveBeenCalledWith('the whole report')
    // No budget applies to a clipboard, so there is nothing to truncate — and no
    // browser is asked for anything.
    expect(io.openExternal).not.toHaveBeenCalled()
  })
})
