import '@fontsource/cinzel'
import '@fontsource/cinzel-decorative'
import '@fontsource/crimson-pro'

import type { Theme } from '@mui/material/styles'
import type { ThemeName } from '../../../shared/types'
import hybrasylTheme from './hybrasyl'
import chadulTheme from './chadul'
import danaanTheme from './danaan'
import grinnealTheme from './grinneal'
import mundanesTheme from './mundanes'
import dubhaimidTheme from './dubhaimid'

export { hybrasylTheme, chadulTheme, danaanTheme, grinnealTheme, mundanesTheme, dubhaimidTheme }

export const themes: Record<ThemeName, Theme> = {
  hybrasyl: hybrasylTheme,
  danaan: danaanTheme,
  chadul: chadulTheme,
  grinneal: grinnealTheme,
  mundanes: mundanesTheme,
  dubhaimid: dubhaimidTheme
}

export const THEME_OPTIONS: { value: ThemeName; label: string }[] = [
  { value: 'hybrasyl', label: 'Hybrasyl' },
  { value: 'danaan', label: 'Danaan' },
  { value: 'chadul', label: 'Chadul' },
  { value: 'grinneal', label: 'Grinneal' },
  { value: 'mundanes', label: 'Mundanes' },
  { value: 'dubhaimid', label: 'Dubhaimid' }
]

// The corporate themes paint flat navy/charcoal chrome. TitleBar branches on
// this to keep the title-bar text and controls legible on that bar (the other
// four themes carry their own dark chrome, so no special handling is needed).
export const PLAIN_CHROME_THEMES: ThemeName[] = ['mundanes', 'dubhaimid']
