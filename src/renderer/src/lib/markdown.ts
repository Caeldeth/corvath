import { isSafeExternalUrl } from '../../../shared/externalUrl'

/**
 * A very small markdown parser, for exactly one input: CHANGELOG.md.
 *
 * **Not a general markdown implementation, and deliberately not a dependency.**
 * The What's New dialog renders one authored file whose shape corvath controls —
 * `###` headings, `-` bullets with wrapped continuation lines, and four inline
 * constructs. A markdown library would be a build-size and supply-chain cost for
 * a document we write ourselves.
 *
 * It produces an AST rather than HTML. Nothing here is ever handed to
 * `dangerouslySetInnerHTML`: the renderer maps nodes to React elements, so a
 * changelog containing a literal `<script>` is text, not markup.
 */

export type Inline =
  | { type: 'text'; value: string }
  | { type: 'strong'; value: string }
  | { type: 'em'; value: string }
  | { type: 'code'; value: string }
  | { type: 'link'; value: string; href: string }

export type Block =
  | { type: 'heading'; level: number; content: Inline[] }
  | { type: 'paragraph'; content: Inline[] }
  | { type: 'list'; items: { depth: number; content: Inline[] }[] }

// Code first, so `**` inside a code span is not read as emphasis. Link before
// emphasis for the same reason: a link's text may contain either.
const INLINE =
  /(`[^`]+`)|(\[[^\]]*\]\([^)\s]+\))|(\*\*[^*]+\*\*)|(__[^_]+__)|(\*[^*\s][^*]*\*)|(_[^_\s][^_]*_)/

/**
 * Split one line of text into inline nodes.
 *
 * A link whose href is not `http`/`https`/`mailto` degrades to its literal text
 * rather than becoming a link. Same rule and same helper as everything else
 * corvath hands to the OS — the changelog is ours, but a renderer that trusts
 * its input because of where it came from is one file-move away from not being
 * true.
 */
export function parseInline(text: string): Inline[] {
  const out: Inline[] = []
  let rest = text

  const pushText = (value: string): void => {
    if (!value) return
    const last = out[out.length - 1]
    if (last?.type === 'text') last.value += value
    else out.push({ type: 'text', value })
  }

  while (rest) {
    const match = INLINE.exec(rest)
    if (!match) {
      pushText(rest)
      break
    }
    pushText(rest.slice(0, match.index))
    const token = match[0]

    if (token.startsWith('`')) {
      out.push({ type: 'code', value: token.slice(1, -1) })
    } else if (token.startsWith('[')) {
      const split = token.indexOf('](')
      const label = token.slice(1, split)
      const href = token.slice(split + 2, -1)
      if (isSafeExternalUrl(href)) out.push({ type: 'link', value: label, href })
      else pushText(token)
    } else if (token.startsWith('**') || token.startsWith('__')) {
      out.push({ type: 'strong', value: token.slice(2, -2) })
    } else {
      out.push({ type: 'em', value: token.slice(1, -1) })
    }

    rest = rest.slice(match.index + token.length)
  }

  return out
}

const HEADING = /^(#{1,6})\s+(.*)$/
const BULLET = /^(\s*)[-*+]\s+(.*)$/

/**
 * Parse a markdown fragment into blocks.
 *
 * Wrapped lines are the case that matters for this input: the changelog authors
 * one bullet across several physical lines, and joining them is the difference
 * between a readable dialog and a column of orphaned fragments.
 */
export function parseMarkdown(markdown: string): Block[] {
  const blocks: Block[] = []
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')

  let paragraph: string[] = []
  let list: { depth: number; text: string }[] | null = null

  const flushParagraph = (): void => {
    if (!paragraph.length) return
    blocks.push({ type: 'paragraph', content: parseInline(paragraph.join(' ').trim()) })
    paragraph = []
  }
  const flushList = (): void => {
    if (!list) return
    blocks.push({
      type: 'list',
      items: list.map((i) => ({ depth: i.depth, content: parseInline(i.text.trim()) }))
    })
    list = null
  }
  const flushAll = (): void => {
    flushParagraph()
    flushList()
  }

  for (const line of lines) {
    if (!line.trim()) {
      flushAll()
      continue
    }

    const heading = HEADING.exec(line)
    if (heading) {
      flushAll()
      blocks.push({
        type: 'heading',
        level: heading[1].length,
        content: parseInline(heading[2].trim())
      })
      continue
    }

    const bullet = BULLET.exec(line)
    if (bullet) {
      flushParagraph()
      // Two spaces per level, which is what the changelog uses. Anything deeper
      // than it actually nests just clamps.
      const depth = Math.min(Math.floor(bullet[1].length / 2), 3)
      list = list ?? []
      list.push({ depth, text: bullet[2] })
      continue
    }

    if (list) {
      // An indented, non-bullet line continues the item above it.
      list[list.length - 1].text += ' ' + line.trim()
      continue
    }

    paragraph.push(line.trim())
  }

  flushAll()
  return blocks
}
