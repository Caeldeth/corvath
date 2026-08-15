import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { launchApp, getMainWindow } from './helpers.js'

// HTOO-393 hole 2, and HTOO-408 is what made it urgent: a new nav destination
// used to ship covered by nothing. Balor got a tab that threw on first click
// through 30 green e2e specs, because every spec drove the pages it already knew
// about.
//
// The list is READ OUT OF THE APP, not restated here. A hand-maintained copy in
// the spec stops matching the app exactly when a new page needs covering — which
// is the same failure one layer up. `NAV_ITEMS` in NavBar.tsx is the single
// source, and the regex below is deliberately dumb so a malformed entry fails
// loudly rather than silently shrinking the list.

const here = dirname(fileURLToPath(import.meta.url))
const navSource = readFileSync(join(here, '..', 'src/renderer/src/components/NavBar.tsx'), 'utf8')

const NAV_ITEMS = [
  ...navSource.matchAll(/\{\s*view:\s*'([^']+)',\s*label:\s*'([^']+)',\s*testId:\s*'([^']+)'\s*\}/g)
].map(([, view, label, testId]) => ({ view, label, testId }))

test.describe('Every nav destination', () => {
  let electronApp

  test.afterEach(async () => {
    await electronApp?.close()
  })

  test('is parsed out of NavBar so this spec cannot fall behind the app', () => {
    // If this reds, the regex above stopped matching NAV_ITEMS' shape — fix the
    // parser rather than pasting a literal list, or the coverage below quietly
    // becomes a subset of the app again.
    expect(NAV_ITEMS.length).toBeGreaterThanOrEqual(5)
    expect(NAV_ITEMS.map((i) => i.view)).toContain('settings')
  })

  test('opens, renders its page and raises no page error', async () => {
    ;({ electronApp } = await launchApp())
    const page = await getMainWindow(electronApp)

    const errors = []
    page.on('pageerror', (err) => errors.push(`${err.message}`))

    for (const item of NAV_ITEMS) {
      await page.getByRole('tab', { name: item.label, exact: true }).click()
      await expect(page.getByRole('tab', { name: item.label, exact: true })).toHaveAttribute(
        'aria-selected',
        'true'
      )
      // The page-level hook: present AND visible. A tab that selects while its
      // panel throws leaves the tab looking right and the body empty.
      await expect(page.getByTestId(item.testId)).toBeVisible()
    }

    expect(errors, `page errors while walking the nav: ${errors.join(' | ')}`).toEqual([])
  })
})

test.describe('Settings page', () => {
  let electronApp

  test.afterEach(async () => {
    await electronApp?.close()
  })

  test('carries the theme picker and the About card', async () => {
    ;({ electronApp } = await launchApp())
    const page = await getMainWindow(electronApp)
    await page.getByRole('tab', { name: 'Settings', exact: true }).click()

    // The picker moved off the title bar; it must be reachable BY ROLE here,
    // which is only true because ThemePicker wires a real labelId. An MUI Select
    // with no linked label has no accessible name at all.
    await expect(page.getByRole('combobox', { name: 'Theme' })).toBeVisible()
    await expect(page.getByTestId('title-bar').getByTestId('theme-select')).toHaveCount(0)

    // The About card resolves a real version over IPC rather than rendering the
    // placeholder forever — which is what a missing app:getVersion looks like.
    await expect(page.getByTestId('about-version')).toContainText(/Version \d+\.\d+\.\d+/)
    await expect(page.getByTestId('reveal-settings')).toBeVisible()
  })

  test('builds a real scrubbed diagnostics block for a report', async () => {
    // The report dialog is only honest if the block it shows is the block that
    // gets sent, so this asserts the round trip through main rather than that a
    // dialog opened. It deliberately does not press "Open GitHub issue" — that
    // hands a URL to the OS and writes the clipboard.
    ;({ electronApp } = await launchApp())
    const page = await getMainWindow(electronApp)
    await page.getByRole('tab', { name: 'Settings', exact: true }).click()
    await page.getByTestId('report-issue').click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    const diagnostics = dialog.getByLabel('Diagnostics (editable)')
    await expect(diagnostics).not.toHaveValue('')
    await expect(diagnostics).not.toHaveValue('(diagnostics unavailable)')

    const block = await diagnostics.inputValue()
    expect(block).toMatch(/^App: Corvath \d+\.\d+\.\d+/m)
    expect(block).toMatch(/^OS: (windows|macOS|linux|other)$/m)
    // A clean boot has nothing to report, and the block says so in a sentence
    // rather than leaving an empty section that reads as a failed collection.
    expect(block).toContain('No errors captured this session.')
    // Nothing identifying survived into it.
    expect(block).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.-]+/)
    expect(block).not.toMatch(/[A-Za-z]:\\Users\\[^\\<]/)

    // Editable is the feature: the user must be able to change what is sent.
    await expect(diagnostics).toBeEditable()
  })

  test("shows the newest changelog section in What's new", async () => {
    // CHANGELOG.md is only readable in a packaged build because it is named in
    // electron-builder.yml's `files` allowlist, which fails CLOSED. This is the
    // check that the allowlist entry is actually there and the IPC reaches it.
    ;({ electronApp } = await launchApp())
    const page = await getMainWindow(electronApp)
    await page.getByRole('tab', { name: 'Settings', exact: true }).click()
    await page.getByRole('button', { name: "What's new…" }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).not.toContainText('No changelog shipped with this build.')
    // The release-process HTML comment sits above the first heading and contains
    // `##` examples of its own; leaking it here means the comment strip broke.
    await expect(dialog).not.toContainText('Release process')

    // RENDERED, not raw. A markdown marker surviving into the text means the
    // parser matched the line as prose and the user is reading source.
    const text = await dialog.innerText()
    expect(text).not.toMatch(/\*\*/)
    expect(text).not.toMatch(/^\s*[-*]\s/m)
    // And the structure really is structure: real <li> and <strong> elements.
    expect(await dialog.locator('li').count()).toBeGreaterThan(3)
    expect(await dialog.locator('strong').count()).toBeGreaterThan(0)
  })
})
