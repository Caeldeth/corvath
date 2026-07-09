import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDebouncedSaver } from '../persist'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('createDebouncedSaver', () => {
  it('collapses a flurry of schedule() calls into a single trailing save', () => {
    const save = vi.fn()
    const { schedule } = createDebouncedSaver(save, 200)

    schedule()
    vi.advanceTimersByTime(150)
    schedule() // resets the window
    vi.advanceTimersByTime(150)
    expect(save).not.toHaveBeenCalled() // still within the debounce
    vi.advanceTimersByTime(50)
    expect(save).toHaveBeenCalledTimes(1)
  })

  it('does not save when nothing was scheduled', () => {
    const save = vi.fn()
    createDebouncedSaver(save, 200)
    vi.advanceTimersByTime(1000)
    expect(save).not.toHaveBeenCalled()
  })

  it('flush() saves immediately and cancels the pending timer', () => {
    const save = vi.fn()
    const { schedule, flush } = createDebouncedSaver(save, 200)

    schedule()
    flush()
    expect(save).toHaveBeenCalledTimes(1)
    // The cancelled timer must not fire a second save.
    vi.advanceTimersByTime(500)
    expect(save).toHaveBeenCalledTimes(1)
  })

  it('flush() is a no-op when no save is pending', () => {
    const save = vi.fn()
    const { flush } = createDebouncedSaver(save, 200)
    flush()
    expect(save).not.toHaveBeenCalled()
  })
})
