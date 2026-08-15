import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Reading } from '../../../../shared/types'
import ReadingList from '../ReadingList'

/**
 * HTOO-409. Deleting a reading used to call `onDelete` straight off the icon —
 * one click, no confirmation, no undo, and a debounced write to disk moments
 * later.
 *
 * **The cancel path is the test that matters.** A passing accept path proves the
 * button still works; it says nothing about whether a guard exists. Every
 * assertion here that could pass against the old code is marked as such.
 */
const reading = (over: Partial<Reading> = {}): Reading => ({
  id: 'r1',
  title: 'Tuesday morning',
  date: '2026-08-14',
  deck: 'Rider-Waite-Smith',
  entries: [],
  createdAt: 'now',
  updatedAt: 'now',
  ...over
})

const setup = (
  over: Partial<Reading> = {}
): { onDelete: ReturnType<typeof vi.fn>; user: ReturnType<typeof userEvent.setup> } => {
  const onDelete = vi.fn()
  const user = userEvent.setup()
  render(
    <ReadingList
      readings={[reading(over)]}
      selectedId={null}
      onSelect={vi.fn()}
      onCreate={vi.fn()}
      onDraw={vi.fn()}
      onImport={vi.fn()}
      onExport={vi.fn()}
      onExportAll={vi.fn()}
      onDelete={onDelete}
    />
  )
  return { onDelete, user }
}

const clickTrash = async (user: ReturnType<typeof userEvent.setup>): Promise<void> => {
  await user.click(screen.getByRole('button', { name: /delete reading/i }))
}

describe('deleting a reading', () => {
  it('does NOT delete on the first click — it asks', async () => {
    // The regression test. Against the old code `onDelete` fired here.
    const { onDelete, user } = setup()
    await clickTrash(user)
    expect(onDelete).not.toHaveBeenCalled()
    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
  })

  it('keeps the reading when the prompt is cancelled', async () => {
    const { onDelete, user } = setup()
    await clickTrash(user)
    await user.click(screen.getByTestId('confirm-cancel'))
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('keeps the reading when the prompt is dismissed with Escape', async () => {
    // MUI maps Escape to onClose, which is the cancel handler. Worth pinning:
    // wiring onClose to the CONFIRM action is an easy and silent mistake.
    const { onDelete, user } = setup()
    await clickTrash(user)
    await user.keyboard('{Escape}')
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('defaults to Cancel, so Return does not destroy anything', async () => {
    // autoFocus is on Cancel deliberately. A confirmation whose default answer
    // is "yes" is a speed bump rather than a guard.
    const { onDelete, user } = setup()
    await clickTrash(user)
    expect(screen.getByTestId('confirm-cancel')).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('names the reading in the prompt', async () => {
    // "Delete this reading?" is answerable without reading it. Naming the one in
    // hand is not, which is the point of confirming at all.
    const { user } = setup({ title: 'Tuesday morning' })
    await clickTrash(user)
    expect(screen.getByTestId('confirm-dialog')).toHaveTextContent('Tuesday morning')
    expect(screen.getByTestId('confirm-dialog')).toHaveTextContent('2026-08-14')
  })

  it('falls back to Untitled Reading when the reading has no title', async () => {
    const { user } = setup({ title: '' })
    await clickTrash(user)
    expect(screen.getByTestId('confirm-dialog')).toHaveTextContent('Untitled Reading')
  })

  it('deletes exactly the confirmed reading when accepted', async () => {
    // Would also pass against the old code, and is here for the id rather than
    // for the guard.
    const { onDelete, user } = setup()
    await clickTrash(user)
    await user.click(screen.getByTestId('confirm-accept'))
    expect(onDelete).toHaveBeenCalledExactlyOnceWith('r1')
  })
})
