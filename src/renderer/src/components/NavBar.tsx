import { Box, Tab, Tabs } from '@mui/material'

export type View = 'readings' | 'draw' | 'decks' | 'layouts' | 'settings'

/**
 * Every nav destination, in tab order.
 *
 * Exported because `e2e/nav-pages.spec.js` walks this list rather than its own
 * copy: a hand-maintained list in the spec is a list that stops matching the app
 * exactly when a new page needs covering, which is the hole HTOO-393 describes.
 * The `testId` is the page-level hook each page renders.
 */
export const NAV_ITEMS: { view: View; label: string; testId: string }[] = [
  { view: 'readings', label: 'Readings', testId: 'readings-page' },
  { view: 'draw', label: 'Draw', testId: 'draw-page' },
  { view: 'decks', label: 'Decks', testId: 'decks-page' },
  { view: 'layouts', label: 'Layouts', testId: 'layouts-page' },
  { view: 'settings', label: 'Settings', testId: 'settings-page' }
]

interface NavBarProps {
  view: View
  onChange: (view: View) => void
}

export default function NavBar({ view, onChange }: NavBarProps) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
      <Tabs value={view} onChange={(_e, value: View) => onChange(value)} sx={{ minHeight: 40 }}>
        {NAV_ITEMS.map((item) => (
          <Tab key={item.view} value={item.view} label={item.label} sx={{ minHeight: 40 }} />
        ))}
      </Tabs>
    </Box>
  )
}
