import { promises as fs } from 'fs'
import { join } from 'path'

export interface JsonStore<T> {
  load(): Promise<T>
  save(data: T): Promise<void>
}

export interface JsonStoreOptions<T> {
  /** Directory the file (and its .bak/.tmp siblings) live in. */
  dir: string
  /** File name, e.g. `settings.json`. */
  filename: string
  /** Returned when no valid primary or backup exists. */
  defaults: T
  /**
   * Validate + normalize parsed JSON. Return `null` to reject the data so
   * recovery (backup, then defaults) kicks in. Should fill in missing fields.
   */
  normalize: (data: unknown) => T | null
}

// Windows intermittently returns EPERM/EACCES on rename when antivirus or file
// watchers (VS Code, Windows Search) briefly hold the destination open. Back
// off a few times, then fall back to unlink+rename. Lifted from taliesin /
// creidhne — without it, atomic writes silently fail on common Windows setups.
async function renameWithRetry(src: string, dest: string, retries = 3, delay = 50): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await fs.rename(src, dest)
      return
    } catch (err) {
      const e = err as NodeJS.ErrnoException
      if (e.code !== 'EPERM' && e.code !== 'EACCES') throw err
      await new Promise((r) => setTimeout(r, delay * (i + 1)))
    }
  }
  try {
    await fs.unlink(dest)
  } catch {
    /* dest may not exist */
  }
  await fs.rename(src, dest)
}

/**
 * A crash-safe JSON file store:
 *  - atomic writes (write `.tmp`, then rename over the primary)
 *  - backup rotation (copy primary → `.bak` before each rename)
 *  - recovery from `.bak` if the primary is missing/corrupt
 *  - a serialized save queue so concurrent saves can't interleave or
 *    poison each other (a failed save never blocks later ones)
 */
export function createJsonStore<T>(options: JsonStoreOptions<T>): JsonStore<T> {
  const { dir, filename, defaults, normalize } = options
  const base = filename.replace(/\.json$/i, '')
  const primary = join(dir, filename)
  const backup = join(dir, `${base}.bak.json`)
  const tmp = join(dir, `${base}.tmp.json`)

  async function tryRead(path: string): Promise<T | null> {
    try {
      const raw = await fs.readFile(path, 'utf-8')
      return normalize(JSON.parse(raw))
    } catch {
      return null
    }
  }

  async function load(): Promise<T> {
    const fromPrimary = await tryRead(primary)
    if (fromPrimary) return fromPrimary

    const fromBackup = await tryRead(backup)
    if (fromBackup) {
      console.warn(`[store] ${filename} unreadable; recovered from backup`)
      await save(fromBackup) // rewrite the primary from the backup
      return fromBackup
    }

    return structuredClone(defaults)
  }

  async function doSave(data: T): Promise<void> {
    const content = JSON.stringify(data, null, 2)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(tmp, content, 'utf-8')
    try {
      await fs.copyFile(primary, backup)
    } catch {
      /* primary may not exist yet */
    }
    await renameWithRetry(tmp, primary)
  }

  // Serialize saves. The two-arg `.then(fn, fn)` runs the next save on both
  // fulfillment and rejection of the previous one, so a single transient
  // failure can't short-circuit every subsequent save through a rejected chain.
  let queue: Promise<void> = Promise.resolve()
  function save(data: T): Promise<void> {
    const op = queue.then(
      () => doSave(data),
      () => doSave(data)
    )
    op.catch((err) => console.error(`[store] ${filename} save failed:`, err))
    queue = op.catch(() => {})
    return op
  }

  return { load, save }
}
