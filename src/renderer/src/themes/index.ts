import '@fontsource/cinzel'
import '@fontsource/cinzel-decorative'
import '@fontsource/crimson-pro'

import type { Theme } from '@mui/material/styles'
import type { ThemeName } from '../../../shared/types'
import hybrasylTheme from './hybrasyl'
import chadulTheme from './chadul'
import danaanTheme from './danaan'
import grinnealTheme from './grinneal'

export { hybrasylTheme, chadulTheme, danaanTheme, grinnealTheme }

export const themes: Record<ThemeName, Theme> = {
  hybrasyl: hybrasylTheme,
  danaan: danaanTheme,
  chadul: chadulTheme,
  grinneal: grinnealTheme
}

export const THEME_OPTIONS: { value: ThemeName; label: string }[] = [
  { value: 'hybrasyl', label: 'Hybrasyl' },
  { value: 'danaan', label: 'Danaan' },
  { value: 'chadul', label: 'Chadul' },
  { value: 'grinneal', label: 'Grinneal' }
]
