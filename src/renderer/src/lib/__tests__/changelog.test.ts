import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { latestChangelogSection } from '../changelog'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', '..')

describe('latestChangelogSection', () => {
  it('takes the first section and stops at the next heading', () => {
    const section = latestChangelogSection(
      [
        '# Changelog',
        '',
        '## [1.1.0] - 2026-08-15',
        '',
        '- newer',
        '',
        '## [1.0.0]',
        '',
        '- older'
      ].join('\n')
    )
    expect(section?.heading).toBe('[1.1.0] - 2026-08-15')
    expect(section?.body).toBe('- newer')
  })

  it('takes the last section when there is only one', () => {
    const section = latestChangelogSection('# Changelog\n\n## [1.0.0]\n\n- only\n')
    expect(section?.body).toBe('- only')
  })

  it('ignores the release-process comment block', () => {
    // The real file has an HTML comment above the first heading whose own text
    // contains `## [Unreleased]` and `## [X.Y.Z]`. Without the strip, THAT is
    // what a user would be shown as the newest release.
    const md = [
      '# Changelog',
      '',
      '<!--',
      'Release process:',
      '  rename ## [Unreleased] to ## [X.Y.Z] - YYYY-MM-DD',
      '-->',
      '',
      '## [1.0.0] - 2026-08-15',
      '',
      '- the real body'
    ].join('\n')
    const section = latestChangelogSection(md)
    expect(section?.heading).toBe('[1.0.0] - 2026-08-15')
    expect(section?.body).toBe('- the real body')
    expect(section?.body).not.toContain('Release process')
  })

  it('returns null rather than an empty section when there is nothing to show', () => {
    // The dialog distinguishes "nothing to show" from "something is broken", so
    // this must not be an empty-string body.
    expect(latestChangelogSection('')).toBeNull()
    expect(latestChangelogSection('# Changelog\n\njust prose, no headings\n')).toBeNull()
  })

  it('parses the real CHANGELOG.md', () => {
    // The unit above uses a fixture; this proves the extractor against the file
    // the dialog actually reads, which is where the comment block really lives.
    const section = latestChangelogSection(readFileSync(join(repoRoot, 'CHANGELOG.md'), 'utf8'))
    expect(section).not.toBeNull()
    expect(section?.body.length).toBeGreaterThan(0)
    expect(section?.body).not.toContain('Release process')
    expect(section?.heading).toMatch(/Unreleased|\d+\.\d+\.\d+/)
  })
})
