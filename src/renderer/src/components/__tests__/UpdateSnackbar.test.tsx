import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { UpdateInfo } from '../../../../shared/types'
import UpdateSnackbar from '../UpdateSnackbar'

/**
 * HTOO-404, predicted by epona on HTOO-65 and confirmed here.
 *
 * **The close button is the first assertion for a reason.** Epona found the same
 * defect in creidhne by writing a dismissal test and having
 * `getByRole('button', { name: /close/i })` match nothing. The banner looked
 * fine; only a test that tried to press the control noticed there wasn't one.
 */
const setup = (
  update: UpdateInfo | null
): { onDismiss: ReturnType<typeof vi.fn>; user: ReturnType<typeof userEvent.setup> } => {
  const onDismiss = vi.fn()
  const user = userEvent.setup()
  render(<UpdateSnackbar update={update} onDismiss={onDismiss} />)
  return { onDismiss, user }
}

const WITH_URL: UpdateInfo = {
  version: '1.1.0',
  url: 'https://github.com/eriscorp/corvath/releases/tag/v1.1.0'
} as UpdateInfo
const WITHOUT_URL: UpdateInfo = { version: '1.1.0' } as UpdateInfo

describe('the update banner', () => {
  it('has a close button when the update carries a URL', async () => {
    // Defect 1, in the case that was actually broken: MUI's Alert renders its
    // own X only when `action` is ABSENT, and the View button occupied `action`.
    setup(WITH_URL)
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('has a close button when the update carries no URL', async () => {
    // The old code accidentally passed HERE and failed above, so the affordance
    // came and went with the payload. Both cases are pinned.
    setup(WITHOUT_URL)
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('dismisses when the close button is pressed', async () => {
    const { onDismiss, user } = setup(WITH_URL)
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('does NOT dismiss on a stray click elsewhere', async () => {
    // Defect 2. `clickaway` used to reach onClose, so any click closed it.
    const { onDismiss, user } = setup(WITH_URL)
    await user.click(document.body)
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('offers the View button only when there is somewhere to go', async () => {
    const { user } = setup(WITHOUT_URL)
    expect(screen.queryByRole('button', { name: /view/i })).not.toBeInTheDocument()
    // And the close control is still reachable, which is the point of defect 1.
    await user.click(screen.getByRole('button', { name: /close/i }))
  })

  it('names the version', () => {
    setup(WITH_URL)
    expect(screen.getByTestId('update-alert')).toHaveTextContent('Corvath 1.1.0 is available.')
  })

  it('renders nothing when there is no update', () => {
    setup(null)
    expect(screen.queryByTestId('update-alert')).not.toBeInTheDocument()
  })
})
