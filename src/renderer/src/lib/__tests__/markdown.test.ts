import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { parseInline, parseMarkdown } from '../markdown'
import { latestChangelogSection } from '../changelog'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', '..')

describe('parseInline', () => {
  it('reads bold, emphasis, code and links', () => {
    expect(parseInline('a **b** c `d` e _f_ [g](https://example.com)')).toEqual([
      { type: 'text', value: 'a ' },
      { type: 'strong', value: 'b' },
      { type: 'text', value: ' c ' },
      { type: 'code', value: 'd' },
      { type: 'text', value: ' e ' },
      { type: 'em', value: 'f' },
      { type: 'text', value: ' ' },
      { type: 'link', value: 'g', href: 'https://example.com' }
    ])
  })

  it('does not read emphasis inside a code span', () => {
    // `**` is ordinary text in code, and the changelog is full of identifiers.
    expect(parseInline('use `a ** b` here')).toEqual([
      { type: 'text', value: 'use ' },
      { type: 'code', value: 'a ** b' },
      { type: 'text', value: ' here' }
    ])
  })

  it('degrades an unsafe link to plain text rather than rendering it', () => {
    // The changelog is ours, but a renderer that trusts its input because of
    // where it came from is one file-move away from not being true.
    expect(parseInline('[x](javascript:alert(1))')).toEqual([
      { type: 'text', value: '[x](javascript:alert(1))' }
    ])
    expect(parseInline('[x](file:///etc/passwd)')).toEqual([
      { type: 'text', value: '[x](file:///etc/passwd)' }
    ])
  })

  it('leaves lone asterisks alone', () => {
    expect(parseInline('2 * 3 * 4')).toEqual([{ type: 'text', value: '2 * 3 * 4' }])
  })
})

describe('parseMarkdown', () => {
  it('joins a wrapped bullet into one item', () => {
    // The case that matters for this input: the changelog authors one bullet
    // across several physical lines.
    const blocks = parseMarkdown(['- one bullet that', '  wraps onto a second line'].join('\n'))
    expect(blocks).toEqual([
      {
        type: 'list',
        items: [
          {
            depth: 0,
            content: [{ type: 'text', value: 'one bullet that wraps onto a second line' }]
          }
        ]
      }
    ])
  })

  it('keeps sibling bullets apart', () => {
    const blocks = parseMarkdown('- one\n- two\n')
    expect(blocks[0].type).toBe('list')
    expect(blocks[0].type === 'list' && blocks[0].items).toHaveLength(2)
  })

  it('records nesting depth', () => {
    const blocks = parseMarkdown('- top\n  - nested\n    - deeper\n')
    expect(blocks[0].type === 'list' && blocks[0].items.map((i) => i.depth)).toEqual([0, 1, 2])
  })

  it('reads headings with their level', () => {
    const blocks = parseMarkdown('### Added\n\nsome prose\n')
    expect(blocks[0]).toEqual({
      type: 'heading',
      level: 3,
      content: [{ type: 'text', value: 'Added' }]
    })
    expect(blocks[1].type).toBe('paragraph')
  })

  it('joins a wrapped paragraph and splits on a blank line', () => {
    const blocks = parseMarkdown('one line\nand its wrap\n\na second paragraph\n')
    expect(blocks).toHaveLength(2)
    expect(blocks[0]).toEqual({
      type: 'paragraph',
      content: [{ type: 'text', value: 'one line and its wrap' }]
    })
  })

  it('starts a new list after a blank line', () => {
    const blocks = parseMarkdown('- a\n\n- b\n')
    expect(blocks.filter((b) => b.type === 'list')).toHaveLength(2)
  })

  it('renders literal markup as text rather than as markup', () => {
    // The AST has no HTML node at all, which is the property that lets the
    // renderer avoid dangerouslySetInnerHTML.
    const blocks = parseMarkdown('<script>alert(1)</script>\n')
    expect(blocks).toEqual([
      { type: 'paragraph', content: [{ type: 'text', value: '<script>alert(1)</script>' }] }
    ])
  })
})

describe('against the real CHANGELOG.md', () => {
  const section = latestChangelogSection(readFileSync(join(repoRoot, 'CHANGELOG.md'), 'utf8'))
  const blocks = parseMarkdown(section?.body ?? '')

  it('produces headings and list items, not one undifferentiated paragraph', () => {
    expect(blocks.some((b) => b.type === 'heading')).toBe(true)
    const items = blocks.flatMap((b) => (b.type === 'list' ? b.items : []))
    expect(items.length).toBeGreaterThan(3)
  })

  it('leaves no bullet marker or bold marker in the rendered text', () => {
    // If either leaks, the parser matched the line as prose and the dialog is
    // showing raw markdown.
    const text = blocks
      .flatMap((b) => (b.type === 'list' ? b.items.map((i) => i.content) : [b.content]))
      .flat()
      .filter((n) => n.type === 'text')
      .map((n) => n.value)
      .join(' ')
    expect(text).not.toMatch(/\*\*/)
    expect(text).not.toMatch(/^\s*-\s/m)
  })
})
