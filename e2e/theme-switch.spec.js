import { test, expect } from '@playwright/test'
import { launchApp, getMainWindow } from './helpers.js'

// Cycle every theme and assert each one actually renders. A theme is wired
// through four places (the ThemeName union, main's THEME_NAMES, the themes map,
// and THEME_OPTIONS) and a miss in any of them fails quietly — the picker still
// shows the entry, but the theme silently falls back. This is the cheapest way
// to catch that, and it also exercises PLAIN_CHROME_THEMES on the two corporate
// themes.

const THEMES = [
  { value: 'hybrasyl', label: 'Hybrasyl' },
  { value: 'danaan', label: 'Danaan' },
  { value: 'chadul', label: 'Chadul' },
  { value: 'grinneal', label: 'Grinneal' },
  { value: 'mundanes', label: 'Mundanes' },
  { value: 'dubhaimid', label: 'Dubhaimid' }
]

test.describe('Themes', () => {
  let electronApp

  test.afterEach(async () => {
    await electronApp?.close()
  })

  test('every theme applies, repaints, and raises no page errors', async () => {
    ;({ electronApp } = await launchApp())
    const page = await getMainWindow(electronApp)

    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))

    const backgrounds = new Set()

    for (const theme of THEMES) {
      await page.getByTestId('theme-select').click()
      await page.getByRole('option', { name: theme.label, exact: true }).click()

      const root = page.getByTestId('app-root')
      await expect(root).toHaveAttribute('data-theme', theme.value)

      backgrounds.add(await root.evaluate((el) => getComputedStyle(el).backgroundColor))
    }

    // Distinct palettes, not six aliases of the same fallback.
    expect(backgrounds.size).toBeGreaterThan(1)
    expect(errors).toEqual([])
  })
})
