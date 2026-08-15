import type { ReactElement, ReactNode } from 'react'
import { Box, Link, Typography } from '@mui/material'
import { parseMarkdown, type Block, type Inline } from '../lib/markdown'

interface MarkdownProps {
  source: string
}

/**
 * Render the small markdown subset in `lib/markdown.ts` as React elements.
 *
 * **No `dangerouslySetInnerHTML` anywhere.** Every node becomes an element, so a
 * changelog containing literal markup renders as the text it is. That is what
 * lets this run under the app's `script-src 'self'` policy without an exception.
 */
function renderInline(nodes: Inline[]): ReactNode {
  return nodes.map((node, i) => {
    switch (node.type) {
      case 'strong':
        return (
          <Box key={i} component="strong" sx={{ fontWeight: 'bold' }}>
            {node.value}
          </Box>
        )
      case 'em':
        return (
          <Box key={i} component="em">
            {node.value}
          </Box>
        )
      case 'code':
        return (
          <Box
            key={i}
            component="code"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.85em',
              px: 0.5,
              py: 0.15,
              borderRadius: 0.5,
              bgcolor: 'action.hover'
            }}
          >
            {node.value}
          </Box>
        )
      case 'link':
        // Opening goes through setWindowOpenHandler -> isSafeExternalUrl ->
        // shell.openExternal. The href was already filtered at parse time; this
        // is the second gate, not the first.
        return (
          <Link key={i} href={node.href} target="_blank" rel="noopener noreferrer">
            {node.value}
          </Link>
        )
      default:
        return <span key={i}>{node.value}</span>
    }
  })
}

function renderBlock(block: Block, key: number): ReactElement {
  if (block.type === 'heading') {
    return (
      <Typography
        key={key}
        variant={block.level <= 2 ? 'h6' : 'subtitle2'}
        sx={{ mt: key === 0 ? 0 : 2, mb: 1, fontWeight: 'bold' }}
      >
        {renderInline(block.content)}
      </Typography>
    )
  }

  if (block.type === 'list') {
    return (
      <Box key={key} component="ul" sx={{ pl: 3, my: 1 }}>
        {block.items.map((item, i) => (
          <Box
            key={i}
            component="li"
            sx={{
              // Nesting is expressed as indentation rather than as real nested
              // lists: the parser flattens, and a changelog never goes deeper
              // than a level or two.
              ml: item.depth * 2.5,
              mb: 0.5,
              typography: 'body2',
              lineHeight: 1.55
            }}
          >
            {renderInline(item.content)}
          </Box>
        ))}
      </Box>
    )
  }

  return (
    <Typography key={key} variant="body2" sx={{ mb: 1.5, lineHeight: 1.55 }}>
      {renderInline(block.content)}
    </Typography>
  )
}

export default function Markdown({ source }: MarkdownProps): ReactElement {
  return <Box>{parseMarkdown(source).map(renderBlock)}</Box>
}
