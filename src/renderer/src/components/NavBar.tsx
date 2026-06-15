import { Box, Tab, Tabs } from '@mui/material'

export type View = 'readings' | 'decks'

interface NavBarProps {
  view: View
  onChange: (view: View) => void
}

export default function NavBar({ view, onChange }: NavBarProps) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
      <Tabs value={view} onChange={(_e, value: View) => onChange(value)} sx={{ minHeight: 40 }}>
        <Tab value="readings" label="Readings" sx={{ minHeight: 40 }} />
        <Tab value="decks" label="Decks" sx={{ minHeight: 40 }} />
      </Tabs>
    </Box>
  )
}
