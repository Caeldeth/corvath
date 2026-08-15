/**
 * Pull the newest release section out of CHANGELOG.md for the What's New dialog.
 *
 * Corvath's changelog is Keep a Changelog: `## [1.2.0] - 2026-08-15` headings,
 * newest first, with an HTML comment block of release instructions near the top
 * that must not be shown to a user.
 *
 * This is deliberately a section EXTRACTOR and not a markdown renderer. The
 * dialog shows the text as written; adding a markdown dependency to render four
 * bullet lists would be the larger change.
 */

export interface ChangelogSection {
  /** The heading text without the `##`, e.g. `[1.0.0] - 2026-08-15`. */
  heading: string
  /** The body below it, trimmed. */
  body: string
}

const HEADING = /^##\s+(.+?)\s*$/gm

/**
 * The first `##` section, which in a Keep a Changelog file is the newest.
 *
 * Returns null for an empty or heading-less file — the dialog then says so
 * rather than rendering a blank box, which is the difference between "nothing to
 * show" and "something is broken".
 */
export function latestChangelogSection(markdown: string): ChangelogSection | null {
  // Strip HTML comments first: the release-process block sits above the first
  // heading and contains `##` examples of its own, which would otherwise be
  // found as the newest section.
  const text = markdown.replace(/<!--[\s\S]*?-->/g, '')

  HEADING.lastIndex = 0
  const first = HEADING.exec(text)
  if (!first) return null

  const bodyStart = first.index + first[0].length
  const next = HEADING.exec(text)
  const body = text.slice(bodyStart, next ? next.index : undefined)

  return { heading: first[1], body: body.trim() }
}
