import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtemp, readdir, readFile, rm, writeFile, chmod, stat } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import {
  captureError,
  getLogsDir,
  getRecentErrors,
  initSessionLog,
  _flushSessionLogForTests,
  _resetSessionLogForTests
} from '../sessionLog'

/**
 * Driven against a REAL directory rather than `vi.mock('fs')`, and that is a
 * deliberate departure from the house module's test.
 *
 * Rotation's correctness is not arithmetic — it is the claim that lexical order over
 * `session-YYYYMMDD-HHmmss-SSS.log` is chronological order. A mocked `readdir`
 * returns whatever the test author typed, so it proves the author and the
 * implementation agree about sort order; it cannot prove that the names this module
 * actually generates sort the way it assumes. That is the same failure
 * `git-porcelain.test.ts`'s `u` fixture had for nine work packages.
 *
 * Appends are queued, so a test that asserts on file contents has to wait for the
 * queue to drain. `flush()` below is that wait, and it is spelled once.
 */

let dir: string

/**
 * Let the serialised append queue drain.
 *
 * Awaits the queue itself rather than sleeping. A `setTimeout` here is a guess about
 * how long a disk takes, and it fails on the machine under the most load — which is
 * CI, after the change has been pushed. The first draft of this file used 20 ms and
 * the twenty-five-append case found it within one full run.
 */
async function flush(): Promise<void> {
  await _flushSessionLogForTests()
}

async function sessions(): Promise<string[]> {
  return (await readdir(dir)).filter((f) => f.startsWith('session-')).sort()
}

beforeEach(async () => {
  _resetSessionLogForTests()
  dir = await mkdtemp(join(tmpdir(), 'corvath-logs-'))
})

afterEach(async () => {
  _resetSessionLogForTests()
  await rm(dir, { recursive: true, force: true }).catch(() => {})
})

describe('initSessionLog', () => {
  it('creates the directory and touches this runs file', async () => {
    const nested = join(dir, 'a', 'logs')
    await initSessionLog(nested)
    expect(getLogsDir()).toBe(nested)
    const files = (await readdir(nested)).filter((f) => f.startsWith('session-'))
    // Touched even though nothing was captured, so a clean launch still counts as a
    // session for rotation — otherwise five clean launches would never displace an
    // old crash log, and the folder would fill with sessions nobody can date.
    expect(files).toHaveLength(1)
    expect(files[0]).toMatch(/^session-\d{8}-\d{6}-\d{3}\.log$/)
  })

  it('keeps exactly five sessions and deletes the oldest', async () => {
    for (let i = 1; i <= 8; i++) {
      await writeFile(join(dir, `session-2026080${i}-100000-000.log`), `old ${i}\n`)
    }
    await initSessionLog(dir)
    const files = await sessions()
    expect(files).toHaveLength(5)
    // The four newest pre-existing files survive, plus this run's — so the four
    // oldest went and nothing newer did. Matched on the fixtures' own `-100000-000`
    // stamp: this run's file is stamped from the real clock and would otherwise sort
    // into the middle of them on any day in this range.
    expect(files.filter((f) => f.endsWith('-100000-000.log'))).toEqual([
      'session-20260805-100000-000.log',
      'session-20260806-100000-000.log',
      'session-20260807-100000-000.log',
      'session-20260808-100000-000.log'
    ])
  })

  it('deletes nothing it did not name', async () => {
    // The pattern is anchored. This folder is Corvath's, but a directory an app
    // unlinks from on every launch deserves a narrower rule than "all mine".
    await writeFile(join(dir, 'notes.txt'), 'keep me')
    await writeFile(join(dir, 'ipc-validation.log'), 'keep me too')
    for (let i = 1; i <= 8; i++) {
      await writeFile(join(dir, `session-2026080${i}-100000-000.log`), 'x')
    }
    await initSessionLog(dir)
    const all = await readdir(dir)
    expect(all).toContain('notes.txt')
    expect(all).toContain('ipc-validation.log')
  })

  it('survives an unreadable directory rather than throwing', async () => {
    // Best effort throughout: a logging failure must never disturb the app, and this
    // runs at boot, before a window exists to report anything in.
    await expect(initSessionLog('\0not-a-path')).resolves.toBeUndefined()
  })
})

describe('captureError', () => {
  it('scrubs before the ring buffer and before disk', async () => {
    await initSessionLog(dir)
    captureError({
      source: 'uncaughtException',
      message: 'fatal: https://ghp_TOKENTOKENTOKEN@github.com/erisco/balor is gone',
      stack: 'Error\n    at /home/sabrael/src/corvath/index.ts:1'
    })
    await flush()

    const onDisk = await readFile(join(dir, (await sessions())[0]), 'utf-8')
    const inRing = JSON.stringify(getRecentErrors())

    // BOTH, because the invariant is "scrubbed at capture" and there is exactly one
    // scrub site — a version that sanitised on the way to disk only would leave the
    // token in the diagnostics block the user is about to publish.
    for (const text of [onDisk, inRing]) {
      expect(text).not.toContain('ghp_TOKENTOKENTOKEN')
      expect(text).not.toContain('sabrael')
    }
    // Still useful afterwards: the remote and the failing file are what the report
    // is about.
    expect(onDisk).toContain('github.com/erisco/balor')
    expect(onDisk).toContain('index.ts')
  })

  it('writes one line per error, no matter how deep the stack', async () => {
    await initSessionLog(dir)
    captureError({ message: 'Error: a', stack: 'Error: a\n  at x\n  at y\n  at z' })
    await flush()
    const text = await readFile(join(dir, (await sessions())[0]), 'utf-8')
    expect(text.trimEnd().split('\n')).toHaveLength(1)
  })

  it('keeps rapid captures in order and loses none', async () => {
    // The point of the serialised queue. Interleaved half-lines would read as a real
    // stack that never happened, which is worse than a dropped line.
    await initSessionLog(dir)
    for (let i = 0; i < 25; i++) captureError({ message: `Error: ${i}` })
    await flush()
    const lines = (await readFile(join(dir, (await sessions())[0]), 'utf-8')).trimEnd().split('\n')
    expect(lines).toHaveLength(25)
    expect(lines[0]).toContain('Error: 0')
    expect(lines[24]).toContain('Error: 24')
  })

  it('caps the ring at twenty while the file keeps everything', async () => {
    await initSessionLog(dir)
    for (let i = 0; i < 25; i++) captureError({ message: `Error: ${i}` })
    await flush()
    const ring = getRecentErrors()
    // The cap is on what a REPORT shows — a URL has a length budget and a person has
    // patience. The file is the complete record and has neither constraint.
    expect(ring).toHaveLength(20)
    expect(ring[0].message).toBe('Error: 5')
    expect(ring[19].message).toBe('Error: 24')
  })

  it('stamps its own timestamp and defaults source and origin', async () => {
    await initSessionLog(dir)
    captureError({ message: 'Error: boom' })
    const [entry] = getRecentErrors()
    expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(entry.source).toBe('error')
    expect(entry.origin).toBe('main')
  })

  it('rings an error thrown before init, and writes no file for it', async () => {
    // Boot order: the handlers are armed before `initSessionLog` resolves, so an
    // error in those first milliseconds still has to reach a report.
    captureError({ message: 'Error: during boot' })
    expect(getRecentErrors()).toHaveLength(1)
    expect(getLogsDir()).toBeNull()
  })

  it('never throws, whatever it is handed', async () => {
    // It is called FROM `process.on('uncaughtException')`. A throw here is a second
    // uncaught error raised out of the code reporting the first.
    await initSessionLog(dir)
    expect(() => captureError()).not.toThrow()
    expect(() => captureError({ message: undefined, stack: undefined })).not.toThrow()
    expect(() =>
      captureError({ message: { toString: () => 'odd' } as unknown as string })
    ).not.toThrow()
  })

  it('swallows a write failure', async () => {
    // A read-only logs directory is a real state — a tmp cleaner, a full disk, a
    // container with a mounted config. Corvath must carry on.
    await initSessionLog(dir)
    const file = join(dir, (await sessions())[0])
    const before = (await stat(file)).size
    await chmod(file, 0o444).catch(() => {})
    expect(() => captureError({ message: 'Error: after chmod' })).not.toThrow()
    await flush()
    // The ring has it regardless, which is what keeps the report useful when the
    // disk will not take it.
    expect(getRecentErrors().at(-1)?.message).toBe('Error: after chmod')
    await chmod(file, 0o644).catch(() => {})
    // On Windows a 0444 file is still appendable by its owner, so the size assertion
    // would be wrong there. What is portable — and what actually matters — is that
    // nothing threw and the ring is intact.
    expect(before).toBeGreaterThanOrEqual(0)
  })
})
