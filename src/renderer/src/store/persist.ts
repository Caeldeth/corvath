// Shared persistence plumbing for the zustand domain stores.
//
// Each store keeps its authoritative state in memory and pushes changes back to
// disk through the main process. Writes are debounced (200 ms) so a flurry of
// keystrokes collapses to a single save, and a `beforeunload` flush guarantees
// the last edit lands even if the user quits mid-debounce. The main-side save
// queue (jsonStore, with its `.then(fn, fn)` resilience) further serializes
// writes in submission order.

const DEBOUNCE_MS = 200

export interface DebouncedSaver {
  /** Schedule a save; resets the debounce window on each call. */
  schedule(): void
  /** Save immediately if one is pending (used on beforeunload). */
  flush(): void
}

/**
 * Wrap `save` in a trailing-edge debounce with a flush escape hatch, and wire
 * the flush to `beforeunload` so pending writes survive an app quit.
 */
export function createDebouncedSaver(save: () => void, delayMs = DEBOUNCE_MS): DebouncedSaver {
  let timer: ReturnType<typeof setTimeout> | null = null

  const schedule = (): void => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      save()
    }, delayMs)
  }

  const flush = (): void => {
    if (timer) {
      clearTimeout(timer)
      timer = null
      save()
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', flush)
  }

  return { schedule, flush }
}
