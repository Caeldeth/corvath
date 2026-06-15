import { useEffect, useState } from 'react'
import { TextField } from '@mui/material'

interface LinesEditorProps {
  label: string
  values: string[]
  onChange: (next: string[]) => void
  helperText?: string
}

/**
 * Edit an ordered list of short strings (suits, ranks) as one-per-line text.
 * Keeps raw text locally while editing and commits trimmed, non-empty,
 * de-duplicated lines on blur — so adding/removing/reordering is just typing.
 */
export default function LinesEditor({ label, values, onChange, helperText }: LinesEditorProps) {
  const [text, setText] = useState(values.join('\n'))

  // Re-sync when the deck changes underneath us (e.g. switching decks).
  useEffect(() => {
    setText(values.join('\n'))
  }, [values])

  const commit = (): void => {
    const next: string[] = []
    for (const line of text.split('\n')) {
      const trimmed = line.trim()
      if (trimmed && !next.includes(trimmed)) next.push(trimmed)
    }
    onChange(next)
    setText(next.join('\n'))
  }

  return (
    <TextField
      label={label}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      helperText={helperText ?? 'One per line'}
      fullWidth
      multiline
      minRows={3}
      size="small"
    />
  )
}
