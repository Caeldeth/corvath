import { promises as fs } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createJsonStore } from '../jsonStore'

interface Doc {
  n: number
}

const defaults: Doc = { n: 0 }
const normalize = (data: unknown): Doc | null => {
  if (!data || typeof data !== 'object') return null
  const n = (data as Record<string, unknown>).n
  return typeof n === 'number' ? { n } : null
}

let dir: string
let counter = 0

beforeEach(async () => {
  dir = join(tmpdir(), `corvath-jsonstore-${process.pid}-${counter++}`)
  await fs.mkdir(dir, { recursive: true })
})

afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true })
})

const store = (filename = 'doc.json'): ReturnType<typeof createJsonStore<Doc>> =>
  createJsonStore<Doc>({ dir, filename, defaults, normalize })

describe('createJsonStore', () => {
  it('returns defaults when nothing exists, then persists atomically', async () => {
    const s = store()
    expect(await s.exists()).toBe(false)
    expect(await s.load()).toEqual({ n: 0 })

    await s.save({ n: 42 })
    expect(await s.exists()).toBe(true)
    // A fresh store instance reads the same bytes back.
    expect(await store().load()).toEqual({ n: 42 })
    // No stray tmp file is left behind.
    const files = await fs.readdir(dir)
    expect(files).not.toContain('doc.tmp.json')
  })

  it('writes a backup before overwriting and recovers from it when the primary is corrupt', async () => {
    const s = store()
    await s.save({ n: 1 })
    await s.save({ n: 2 }) // now doc.bak.json holds n:1

    expect(await fs.readFile(join(dir, 'doc.bak.json'), 'utf-8')).toContain('"n": 1')

    // Corrupt the primary; loading should fall back to the backup (n:1)...
    await fs.writeFile(join(dir, 'doc.json'), '{ not valid json', 'utf-8')
    expect(await store().load()).toEqual({ n: 1 })
    // ...and the recovery rewrites the primary so a second load is clean.
    expect(await store().load()).toEqual({ n: 1 })
  })

  it('falls back to defaults when both primary and backup are unreadable', async () => {
    await fs.writeFile(join(dir, 'doc.json'), 'garbage', 'utf-8')
    await fs.writeFile(join(dir, 'doc.bak.json'), 'also garbage', 'utf-8')
    expect(await store().load()).toEqual({ n: 0 })
  })

  it('rejects data that fails normalize and treats it as corrupt', async () => {
    await fs.writeFile(join(dir, 'doc.json'), JSON.stringify({ n: 'not a number' }), 'utf-8')
    expect(await store().load()).toEqual({ n: 0 })
  })

  it('serializes concurrent saves in order; the last write wins', async () => {
    const s = store()
    await Promise.all([s.save({ n: 1 }), s.save({ n: 2 }), s.save({ n: 3 })])
    expect(await store().load()).toEqual({ n: 3 })
  })

  it('keeps serving later saves after an earlier save rejects', async () => {
    const s = store()
    // A circular structure makes JSON.stringify throw inside doSave, so this
    // save rejects without ever writing the file.
    const circular: { n: number; self?: unknown } = { n: 1 }
    circular.self = circular
    await expect(s.save(circular as unknown as Doc)).rejects.toBeInstanceOf(TypeError)

    // The queue is not poisoned: the next save still lands.
    await s.save({ n: 7 })
    expect(await store().load()).toEqual({ n: 7 })
  })
})
